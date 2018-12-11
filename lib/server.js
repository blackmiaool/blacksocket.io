"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_1 = require("./socket");
const WS = require("ws");
class WSserver {
    constructor(wsserver) {
        this.close = () => {
            if (this.closed) {
                return;
            }
            try {
                this.wsserver._server && this.wsserver._server.close();
                this.wsserver.close();
                this.closed = true;
            }
            catch (e) {
                /* istanbul ignore next */
                console.log(e);
            }
        };
        this.wsserver = wsserver;
        this.clients = new Set();
        this.sockets = {
            clients: () => [...this.clients]
        };
    }
    on(event, cb) {
        return this.wsserver.on(event, ws => {
            if (event === "connection") {
                const socket = new socket_1.default();
                socket.init(ws);
                this.clients.add(socket);
                socket.on("disconnect", () => {
                    this.clients.delete(socket);
                });
                socket.on("error", e => {
                    console.log("socketerror", e);
                });
                cb(socket);
            }
            else {
                cb(null);
            }
        });
    }
}
function createSocketIo(wsserver) {
    return new WSserver(wsserver);
}
function creator1(server, options) {
    var WebSocketServer = WS.Server;
    const optionsAll = Object.assign({}, options);
    optionsAll.server = server;
    return createSocketIo(new WebSocketServer(optionsAll));
}
function creator2(port, options) {
    var server = require("http").createServer();
    server.listen(port);
    return creator1(server, options);
}
function creator() {
    const args = arguments;
    if (typeof args[0] === "number") {
        return creator2.apply(false, arguments);
    }
    else if (typeof args[0] !== "object" || !args[0]) {
        throw new Error(`unrecognized arguments ${JSON.stringify(args)}`);
    }
    else if (args[0].listen) {
        return creator1.apply(false, arguments);
    }
    else {
        throw new Error(`unrecognized arguments ${JSON.stringify(args)}`);
    }
}
module.exports = creator;
