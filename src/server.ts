import Socket from './socket';
const WS = require("ws");
interface Sockets {
    clients: () => Array<Socket>,
}
class WSserver {
    wsserver: any
    sockets: Sockets
    clients: Set<Socket>
    closed: Boolean
    constructor(wsserver: any) {
        this.wsserver = wsserver;
        this.clients = new Set();
        this.sockets = {
            clients: () => [...this.clients]
        }
    }
    on(event: string, cb: (socket: Socket) => void) {
        return this.wsserver.on(event, (ws) => {
            if (event === 'connection') {
                const socket: Socket = new Socket();
                socket.init(ws);
                this.clients.add(socket);
                socket.on('disconnect', () => {
                    this.clients.delete(socket);
                });
                cb(socket);
            } else {
                cb(null);
            }
        });
    }
    close = () => {
        if (this.closed) {
            return;
        }
        try {
            this.wsserver._server && this.wsserver._server.close();
            this.wsserver.close()
            this.closed = true;
        } catch (e) {
            /* istanbul ignore next */
            console.log(e)
        }
    }
}
function createSocketIo(wsserver): WSserver {
    return new WSserver(wsserver);
}
function creator1(server, options): WSserver {
    var WebSocketServer = WS.Server;
    const optionsAll = Object.assign({}, options);
    optionsAll.server = server;
    return createSocketIo(new WebSocketServer(optionsAll));
}
function creator2(port: number, options): WSserver {
    var server = require('http').createServer();
    server.listen(port);
    return creator1(server, options);
}

function creator(server: number, options): WSserver;
function creator(port: number, options): WSserver;
function creator(): WSserver {
    const args = arguments;
    if (typeof args[0] === 'number') {
        return creator2.apply(false, arguments);
    } else if (typeof args[0] !== 'object' || !args[0]) {
        throw new Error(`unrecognized arguments ${JSON.stringify(args)}`);
    } else if (args[0].listen) {
        return creator1.apply(false, arguments);
    } else {
        throw new Error(`unrecognized arguments ${JSON.stringify(args)}`);
    }
}

module.exports = creator;