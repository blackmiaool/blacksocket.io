const binaryReadyEvent = '__black_binary_ready';
function isArrayBuffer(data) {
    if (!data) {
        return false;
    }
    const name = Object.getPrototypeOf(data).constructor.name;

    if (name === 'ArrayBuffer' || name === 'Buffer') {
        return true;
    } else {
        return false;
    }
}
function canTraverse(data) {
    return data && typeof data === 'object';
}
function getArrayBuffers(data) {
    if (!canTraverse(data)) {
        return null;
    }

    const ret = { paths: [], buffers: [] };
    if (isArrayBuffer(data)) {
        ret.paths.push([]);
        ret.buffers.push(data);
        return ret;
    }
    function traverseObj(data, path) {
        for (const key in data) {
            if (isArrayBuffer(data[key])) {
                path.push(key);
                ret.paths.push(path.slice());
                ret.buffers.push(data[key]);
                path.pop();
            } else if (canTraverse(data)) {
                path.push(key);
                traverseObj(data[key], path);
                path.pop();
            }
        }
    }

    traverseObj(data, []);
    if (!ret.paths.length) {
        return null;
    }
    return ret;
}
function set(root, path, data) {

    if (path.includes('constructor') || path.includes('__proto__')) {
        return;
    }
    if (!path[0]) {
        return data;
    }
    path.reduce((p, section, i) => {
        if (i === path.length - 1) {
            p[section] = data;
            return;
        }
        return p[section];
    }, root);
    return root;
}
class Socket {
    init(ws) {
        this.ws = ws;
        this.binaryData = [];
        this.binaryMsgQueue = [];
        ws.addEventListener("message", (message) => {
            let binaryData;
            let content;
            if (isArrayBuffer(message.data)) {
                if (!this.binaryInfo) {
                    return;
                }
                binaryData = message.data;
                content = this.binaryInfo;
            } else if (!message.data || message.data[0] !== '{') {
                return;
            }
            if (!content) {
                content = JSON.parse(message.data);
            }
            let {
                uid,
                needCb,
                data,
                event,
                type,
                dataType,
                bufferPaths
            } = content;
            if (binaryData) {
                const path = bufferPaths.pop();

                data = set(data, path, binaryData);

            }
            const checkBinaryBuffer = () => {
                if (bufferPaths && bufferPaths.length) {
                    this.binaryInfo = content;
                    this.ws.send(JSON.stringify({ type: 'wait-binary' }));
                    return true;
                }
                return false;
            }
            switch (type) {
                case 'msg':
                    if (checkBinaryBuffer()) {
                        return;
                    }
                    if (!this.eventListenerMap[event]) {
                        return;
                    }
                    let cb;
                    if (needCb) {
                        cb = (data) => {
                            this.sendCb(uid, data);
                        }
                    }
                    this.eventListenerMap[event].forEach(function (listener) {
                        listener(data, cb);
                    });
                    break;
                case 'wait-binary':
                    this.ws.send(this.binaryData.pop());
                    if (!this.binaryData.length && this.binaryMsgQueue.length) {
                        this.emit.apply(this, this.binaryMsgQueue.shift());
                    }
                    break;
                case "cb":
                    if (checkBinaryBuffer()) {
                        return;
                    }
                    this.cbMap[uid] && this.cbMap[uid](data);
                    // just invoke it once
                    delete this.cbMap[uid];
                    break;
            }
        });


        ws.addEventListener('open', () => {
            const connectMap = this.eventListenerMap['connect'];
            const reconnectMap = this.eventListenerMap['reconnect'];
            const firstMap = this.eventListenerMap['first-connect'];
            connectMap && connectMap.forEach((cb) => {
                cb();
            });
            if (!this.firstConnect) {
                reconnectMap && reconnectMap.forEach((cb) => {
                    cb();
                });
            } else {
                this.firstConnect = false;
                firstMap && firstMap.forEach((cb) => {
                    cb();
                });
            }
        });
        ws.addEventListener('close', () => {
            const disconnectMap = this.eventListenerMap['disconnect'];
            disconnectMap && disconnectMap.forEach((cb) => {
                cb();
            });
        });
    }
    constructor() {
        Object.assign(this, {
            uid: 1,
            eventListenerMap: {},
            cbMap: {},
            firstConnect: true,
            closed: false
        });
    }
    open() {
        this.closed = false;
        this.ws.open();
    }
    close() {
        this.closed = true;
        this.ws.close();
    }
    _send(msg) {
        if (this.ws.readyState === 1) {
            this.ws.send(msg);
        } else {
            console.log('bug: not ready');
        }
    }
    emit(event, data, cb, extra = {}) {//extra is not for user
        if (this.binaryData.length || this.binaryMsgQueue.length) {
            let ret;
            if (cb === true) {
                ret = new Promise((resolve) => {
                    cb = resolve;
                });
            }
            this.binaryMsgQueue.push([event, data, cb, extra]);
            return ret;
        }
        const msg = {};
        let ret;
        this.binaryData = [];
        if (extra.cb) {
            msg.uid = extra.uid;
        } else {
            msg.uid = this.uid;
            this.uid++;
        }

        if (cb) {

            msg.needCb = true;
            if (cb === true) {
                ret = new Promise((resolve) => {
                    this.cbMap[msg.uid] = function (result) {
                        resolve(result);
                    }
                });
            } else if (typeof cb === 'function') {
                this.cbMap[msg.uid] = cb;
            } else {
                console.warn('expect a function or a true as the third parameter');
                return;
            }
        }
        const arrayBuffers = getArrayBuffers(data);
        if (arrayBuffers) {
            msg.bufferPaths = arrayBuffers.paths;
            this.binaryData = arrayBuffers.buffers;
        }
        msg.data = data;

        msg.event = event;
        if (extra.cb) {
            msg.type = "cb";
        } else {
            msg.type = "msg";
        }

        this._send(JSON.stringify(msg));
        return ret;
    }

    sendCb(uid, data) {
        this.emit(false, data, false, {
            cb: true,
            uid
        });
        // this._send(JSON.stringify({
        //     type: "cb",
        //     uid,
        //     data
        // }));
    }
    once(event, cb) {
        const wrapper = () => {
            const list = this.eventListenerMap[event];
            cb();
            list.splice(list.indexOf(wrapper), 1);
        }
        this.on(event, wrapper);
    }
    on(event, cb) {
        if (!this.eventListenerMap[event]) {
            this.eventListenerMap[event] = [];
        }
        this.eventListenerMap[event].push(cb);
    }
}

module.exports = Socket;