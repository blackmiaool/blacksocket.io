class Socket {
    init(ws) {
        this.ws = ws;
        ws.addEventListener("message", (message) => {
            if (!message.data || message.data[0] !== '{') {
                return;
            }

            let {
                uid,
                needCb,
                data,
                event,
                type
            } = JSON.parse(message.data);
            if (type === "msg") {
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
            } else if (type === "cb") {
                this.cbMap[uid] && this.cbMap[uid](data);
                // just invoke it once
                delete this.cbMap[uid];
            }
        });
    }
    constructor() {
        Object.assign(this, {
            uid: 1,
            eventListenerMap: {},
            cbMap: {}
        });
    }
    close() {
        this.ws.close();
    }
    emit(event, data, cb) {
        const msg = {};
        msg.uid = this.uid;
        this.uid++;
        if (cb) {
            msg.needCb = true;
            this.cbMap[msg.uid] = cb;
        }
        msg.data = data;
        msg.event = event;
        msg.type = "msg";
        if(this.ws.readyState===1){
            this.ws.send(JSON.stringify(msg));
        }        
    }
    sendCb(uid, data) {
        this.ws.send(JSON.stringify({
            type: "cb",
            uid,
            data
        }),function(err){
            console.warn('err',err);
        });
    }
    on(event, cb) {
        if (event === "open" || event === "close") {
            this.ws.addEventListener(event, cb);
        } else {
            if (!this.eventListenerMap[event]) {
                this.eventListenerMap[event] = [];
            }
            this.eventListenerMap[event].push(cb);
        }

    }
}
module.exports = Socket;