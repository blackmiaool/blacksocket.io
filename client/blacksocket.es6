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
                        cb = (...data) => {
                            this.sendCb(uid, ...data);
                        }
                    }
                    this.eventListenerMap[event].forEach(function (listener) {
                        let ret;
                        ret = listener(...data, cb);
                        if (ret && ret.then && cb) {
                            ret.then(cb);
                        }
                    });
                    break;
                case 'wait-binary':
                    this.ws.send(this.binaryData.pop());
                    if (!this.binaryData.length && this.binaryMsgQueue.length) {
                        this.underlyingEmit.call(this, this.binaryMsgQueue.shift());
                    }
                    break;
                case "cb":
                    if (checkBinaryBuffer()) {
                        return;
                    }
                    this.cbMap[uid] && this.cbMap[uid](...data);
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
        //  else {
        //     console.log('bug: not ready', this.ws.readyState);
        // }
    }
    underlyingEmit({
        event, promise = false, cb, data, type = 'msg', uid
    }) {
        let ret;

        if (this.binaryData.length) {
            const params = Object.assign({}, arguments[0]);
            if (promise) {
                ret = new Promise((resolve) => {
                    params.cb = resolve;
                    params.promise = false;
                });
            }
            this.binaryMsgQueue.push(params);
            return ret;
        }

        if (!uid) {
            uid = this.uid;
            this.uid++;
        }

        const msg = {
            type,
            uid,
            data,
            event,
        };

        if (cb || promise) {
            msg.needCb = true;
            if (promise) {
                ret = new Promise((resolve) => {
                    this.cbMap[msg.uid] = function (result) {
                        resolve(result);
                    }
                });
            } else if (typeof cb === 'function') {
                this.cbMap[msg.uid] = cb;
            }
        }
        const arrayBuffers = getArrayBuffers(data);
        if (arrayBuffers) {
            msg.bufferPaths = arrayBuffers.paths;
            this.binaryData = arrayBuffers.buffers;
        }

        this._send(JSON.stringify(msg));
        return ret;
    }
    emitp(event, ...data) {
        return this.underlyingEmit({ event, promise: true, data });
    }
    emit(event, ...data) {
        let cb;
        if (typeof data[data.length - 1] === 'function') {
            cb = data.pop();
        }
        return this.underlyingEmit({
            event, data, cb
        });
    }
    sendCb(uid, ...data) {
        return this.underlyingEmit({
            type: 'cb',
            uid,
            data
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


const isBrowser = typeof location !== 'undefined';

let WS;
if (isBrowser) {
    WS = WebSocket;
} else {
    WS = eval(`require('ws')`);
}
function io(addr = "/") {

    let ws;
    //auto connect
    let checkInterval;

    const protocol = isBrowser ? location.protocol.replace('http', 'ws') : 'ws:';
    const hostname = isBrowser ? location.hostname : 'localhost';
    if (addr.startsWith(':') || addr.startsWith('/')) {
        addr = `${protocol}//${hostname}${addr}`;
    } else {
        throw new Error('invalid addr' + addr);
    }


    function connect(addr) {
        if (socket.closed) {
            if (checkInterval) {
                clearInterval(checkInterval);
            }
            return;
        }
        if (socket.ws) {
            socket.ws.close();
        }
        ws = new WS(addr);
        ws.addEventListener("close", function (event) {
            if (checkInterval) {
                clearInterval(checkInterval);
            }
            checkInterval = setInterval(function () {
                connect(addr)
            }, 5000);
        });

        ws.addEventListener("open", function (event) {
            if (checkInterval) {
                clearInterval(checkInterval);
                checkInterval = 0;
            }
        });
        socket.init(ws);
    }

    const socket = new Socket();
    connect(addr);
    setInterval(() => {
        if (ws.readyState == WS.OPEN) {
            ws.send(Math.floor(Math.random() * 1000) + "");
        }
    }, 25000);
    return socket;
}

