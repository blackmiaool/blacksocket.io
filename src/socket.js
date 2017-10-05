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

    const ret = { paths: [], buffer: [] };
    if (isArrayBuffer(data)) {
        ret.paths.push([]);
        ret.buffer.push(data);
        return ret;
    }
    function traverseObj(data, path) {
        for (const key in data) {
            if (isArrayBuffer(data[key])) {
                path.push(key);
                ret.paths.push(path.slice());
                ret.buffer.push(data[key]);
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
            switch (type) {
                case 'msg':
                    if (bufferPaths && bufferPaths.length) {
                        this.binaryInfo = content;
                        this.ws.send(JSON.stringify({ type: 'wait-binary' }));
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
                    break;
                case "cb":
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
        }
    }
    emit(event, data, cb) {
        const msg = {};
        let ret;
        msg.uid = this.uid;
        this.binaryData = [];
        this.uid++;
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
            this.binaryData = arrayBuffers.buffer;
        }
        msg.data = data;

        msg.event = event;
        msg.type = "msg";
        this._send(JSON.stringify(msg));
        return ret;
    }
    sendCb(uid, data) {
        this.ws.send(JSON.stringify({
            type: "cb",
            uid,
            data
        }), function (err) {
            if (err) {
                console.warn('err', err);
            }
        });
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