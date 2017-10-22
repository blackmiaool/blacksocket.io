
import Socket from './socket';

const isBrowser: boolean = typeof location !== 'undefined';

let WS;
if (isBrowser) {
    WS = WebSocket;
} else {
    WS = eval(`require('ws')`);
}
function io(addr: string = "/"): Socket {

    let ws;
    //auto connect
    let checkInterval: NodeJS.Timer;

    const protocol: string = isBrowser ? location.protocol.replace('http', 'ws') : 'ws:';
    const hostname: string = isBrowser ? location.hostname : 'localhost';
    if (addr.startsWith(':') || addr.startsWith('/')) {
        addr = `${protocol}//${hostname}${addr}`;
    } else {
        throw new Error('invalid addr' + addr);
    }


    function connect(addr: string) {
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
                checkInterval = null;
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

module.exports = io;
