import Socket from './socket';
const WS = require("ws");
function createSocketIo(wsserver) {
    function on(event, cb) {
        return wsserver.on(event, function (ws) {
            if (event === 'connection') {
                const socket: Socket = new Socket();
                socket.init(ws);
                cb(socket);
            } else {
                cb();
            }

        });
    }
    function close() {
        try {
            wsserver._server && wsserver._server.close();
            wsserver.close()
        } catch (e) {
            console.log(e)
        }

    }
    return {
        on,
        close
    }
}
function creator1(server, options) {
    var WebSocketServer = WS.Server;
    const optionsAll = Object.assign({}, options);
    optionsAll.server = server;
    return createSocketIo(new WebSocketServer(optionsAll));
}
function creator2(port, options) {
    var server = require('http').createServer();
    server.listen(port);
    return creator1(server, options);
}
function creator() {
    const args = arguments;
    if (typeof args[0] === 'number') {
        return creator2.apply(false, arguments);
    } else if (typeof args[0] !== 'object' || !args[0]) {
        console.log('unrecognized arguments', args);
    } else if (args[0].listen) {
        return creator1.apply(false, arguments);
    } else {
        console.log('unrecognized arguments', args);
    }
}

module.exports = creator;