"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_1 = require("./socket");
const isBrowser = typeof location !== 'undefined';
let WS;
if (isBrowser) {
    WS = WebSocket;
}
else {
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
    }
    else {
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
        ws.addEventListener("close", function () {
            if (checkInterval) {
                clearInterval(checkInterval);
            }
            checkInterval = setInterval(function () {
                connect(addr);
            }, 5000);
        });
        ws.addEventListener("open", function () {
            if (checkInterval) {
                clearInterval(checkInterval);
                checkInterval = null;
            }
        });
        socket.init(ws);
    }
    const socket = new socket_1.default();
    connect(addr);
    setInterval(() => {
        if (ws.readyState == WS.OPEN) {
            ws.send(Math.floor(Math.random() * 1000) + "");
        }
    }, 25000);
    return socket;
}
module.exports = io;
