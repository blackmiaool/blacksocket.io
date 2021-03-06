"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const binaryReadyEvent = "__black_binary_ready";
function isBinary(data) {
    if (!data) {
        return false;
    }
    const name = Object.getPrototypeOf(data).constructor.name;
    if (name === "ArrayBuffer" || name === "Buffer") {
        return true;
    }
    else {
        return false;
    }
}
function canTraverse(data) {
    return data && typeof data === "object";
}
function getArrayBuffers(data) {
    const ret = [[], []];
    function traverseObj(data, path) {
        for (const key in data) {
            if (isBinary(data[key])) {
                path.push(key);
                ret[0].push(path.slice());
                ret[1].push(data[key]);
                path.pop();
            }
            else if (canTraverse(data)) {
                path.push(key);
                traverseObj(data[key], path);
                path.pop();
            }
        }
    }
    traverseObj(data, []);
    if (!ret[0].length) {
        return null;
    }
    return ret;
}
function set(root, path, data) {
    if (path.includes("constructor") || path.includes("__proto__")) {
        return [
            { message: "cant use meta properties(constructor, __proto__)" }
        ];
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
    constructor() {
        Object.assign(this, {
            uid: 1,
            eventListenerMap: {},
            cbMap: {},
            firstConnect: true,
            closed: false
        });
    }
    sendCb(uid, ...data) {
        this.underlyingEmit({
            type: "cb",
            uid,
            data
        });
    }
    _send(msg) {
        if (this.ws.readyState === 1) {
            this.ws.send(msg);
        }
        //  else {
        //     console.log('bug: not ready', this.ws.readyState);
        // }
    }
    underlyingEmit({ event, promise = false, cb, data, type = "msg", uid }) {
        let ret;
        if (this.binaryData.length) {
            const params = Object.assign({}, arguments[0]);
            if (promise) {
                ret = new Promise(resolve => {
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
            needCb: false
        };
        if (cb || promise) {
            msg.needCb = true;
            if (promise) {
                ret = new Promise(resolve => {
                    this.cbMap[msg.uid] = function (result) {
                        resolve(result);
                    };
                });
            }
            else {
                this.cbMap[msg.uid] = cb;
            }
        }
        const arrayBuffers = getArrayBuffers(data);
        if (arrayBuffers) {
            msg.bufferPaths = arrayBuffers[0];
            this.binaryData = arrayBuffers[1];
        }
        this._send(JSON.stringify(msg));
        return ret;
    }
    init(ws) {
        this.ws = ws;
        this.binaryData = [];
        this.binaryMsgQueue = [];
        this.ws.on &&
            this.ws.on("error", e => {
                console.log("blacksocket on error:", e.message);
            });
        ws.addEventListener("message", message => {
            let binaryData;
            let content;
            if (isBinary(message.data)) {
                if (!this.binaryInfo) {
                    return;
                }
                binaryData = message.data;
                content = this.binaryInfo;
            }
            else if (!message.data || message.data[0] !== "{") {
                return;
            }
            if (!content) {
                content = JSON.parse(message.data);
            }
            let { uid, needCb, data, event, type, bufferPaths } = content;
            if (binaryData) {
                const path = bufferPaths.pop();
                data = set(data, path, binaryData);
            }
            const checkSendBinaryBuffer = () => {
                if (bufferPaths && bufferPaths.length) {
                    this.binaryInfo = content;
                    this.ws.send(JSON.stringify({ type: "wait-binary" }));
                    return true;
                }
                return false;
            };
            switch (type) {
                case "msg":
                    if (checkSendBinaryBuffer()) {
                        return;
                    }
                    if (!this.eventListenerMap[event]) {
                        return;
                    }
                    let cb;
                    if (needCb) {
                        cb = (...data) => {
                            if (!cb) {
                                return;
                            }
                            cb = null;
                            this.sendCb(uid, ...data);
                        };
                    }
                    this.eventListenerMap[event].forEach(function (listener) {
                        let ret;
                        ret = listener(...data, cb);
                        if (ret && ret.then && cb) {
                            ret.then(cb);
                        }
                    });
                    break;
                case "wait-binary":
                    this.ws.send(this.binaryData.pop());
                    if (!this.binaryData.length && this.binaryMsgQueue.length) {
                        this.underlyingEmit(this.binaryMsgQueue.shift());
                    }
                    break;
                case "cb":
                    if (checkSendBinaryBuffer()) {
                        return;
                    }
                    this.cbMap[uid] && this.cbMap[uid](...data);
                    // just invoke it once
                    delete this.cbMap[uid];
                    break;
            }
        });
        ws.addEventListener("open", () => {
            const connectListeners = this.eventListenerMap["connect"];
            const reconnectListeners = this.eventListenerMap["reconnect"];
            const firstListeners = this.eventListenerMap["first-connect"];
            connectListeners &&
                connectListeners.forEach(cb => {
                    cb();
                });
            if (!this.firstConnect) {
                reconnectListeners &&
                    reconnectListeners.forEach(cb => {
                        cb();
                    });
            }
            else {
                this.firstConnect = false;
                firstListeners &&
                    firstListeners.forEach(cb => {
                        cb();
                    });
            }
            this.connecting = true;
        });
        ws.addEventListener("close", () => {
            const disconnectMap = this.eventListenerMap["disconnect"];
            disconnectMap &&
                disconnectMap.forEach(cb => {
                    cb();
                });
            this.connecting = false;
        });
    }
    close() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.closed = true;
        if (this.ws.readyState === 1) {
            this.ws.close();
        }
        else {
            setTimeout(() => {
                this.ws.close();
            }, undefined);
        }
    }
    emitp(event, ...data) {
        return this.underlyingEmit({ event, promise: true, data });
    }
    emit(event, ...data) {
        let cb;
        if (typeof data[data.length - 1] === "function") {
            cb = data.pop();
        }
        this.underlyingEmit({
            event,
            data,
            cb
        });
        return this;
    }
    once(event, cb) {
        const wrapper = () => {
            cb();
            this.off(event, wrapper);
        };
        return this.on(event, wrapper);
    }
    off(event, cb) {
        if (!this.eventListenerMap[event]) {
            return false;
        }
        const index = this.eventListenerMap[event].indexOf(cb);
        if (index === -1) {
            return false;
        }
        else {
            this.eventListenerMap[event].splice(index, 1);
            return true;
        }
    }
    on(event, cb) {
        if (!this.eventListenerMap[event]) {
            this.eventListenerMap[event] = [];
        }
        this.eventListenerMap[event].push(cb);
        return this;
    }
}
exports.default = Socket;
