const binaryReadyEvent = '__black_binary_ready';
function isArrayBuffer(data) {
    if (!data) {
        return false;;
    }
    const name = Object.getPrototypeOf(data).constructor.name;

    if (name === 'ArrayBuffer' || name === 'Buffer') {
        return true;
    } else {
        return false;
    }
}
class Socket {
    init(ws) {
        this.ws = ws;
        ws.addEventListener("message", (message) => {
            let binaryData;
            if (isArrayBuffer(message.data)) {
                if (!this.binaryInfo) {
                    return;
                }
                binaryData = message.data;
                message.data = this.binaryInfo;
                delete this.binaryInfo;
            } else if (!message.data || message.data[0] !== '{') {
                return;
            }

            let {
                uid,
                needCb,
                data,
                event,
                type,
                dataType
            } = JSON.parse(message.data);
            if (binaryData) {
                data = binaryData;
            }
            switch (type) {
                case 'msg':
                    if (dataType === 'ArrayBuffer' && !binaryData) {
                        this.binaryInfo = message.data;
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
                    this.ws.send(this.binaryData);
                    delete this.binaryData;
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
        msg.uid = this.uid;
        this.uid++;
        if (cb) {
            msg.needCb = true;
            this.cbMap[msg.uid] = cb;
        }
        if (isArrayBuffer(data)) {
            msg.dataType = 'ArrayBuffer';
            this.binaryData = data;
        } else {
            msg.data = data;
        }
        msg.event = event;
        msg.type = "msg";
        this._send(JSON.stringify(msg));
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
    on(event, cb) {

        if (!this.eventListenerMap[event]) {
            this.eventListenerMap[event] = [];
        }
        this.eventListenerMap[event].push(cb);


    }
}

module.exports = Socket;