const Socket = require('./socket');
const isBrowser = typeof location !== 'undefined';

function getSocket(addr = "/") {
    
    let ws;
    //auto connect
    let checkInterval;
    
    const protocol = isBrowser ? location.protocol.replace('http', 'ws') : 'ws:';
    const hostname = isBrowser ? location.hostname : 'localhost';
    if (addr.startsWith(':') || addr.startsWith('/')) {
        addr = `${protocol}//${hostname}${addr}`;
    }else{
        throw new Error('invalid addr'+addr);
    }
    
    let WS;
    if (isBrowser) {
        WS = WebSocket;
    } else {        
        WS = require('ws');
    }
    function connect(addr) {
        if(socket.closed){
            if(checkInterval){
                clearInterval(checkInterval);
            }            
            return ;
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
    this.lifeInterval = setInterval(() => {
        if (ws.readyState == WS.OPEN) {
            ws.send(Math.floor(Math.random() * 1000) + "");
        }
    }, 25000);
    return socket;
}
module.exports = getSocket;