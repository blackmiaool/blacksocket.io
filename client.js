const Socket=require('./socket');

function getSocket(addr="/") {    
    let ws;
    //auto connect
    let checkInterval;
    
    const protocol=location.protocol.replace('http','ws');
    if(addr.startsWith(':')||addr.startsWith('/')){
        const protocol=location.protocol.replace('http','ws');
        addr=`${protocol}//${location.hostname}${addr}`;
    }

    function connect(addr) {
        if (socket.ws) {
            socket.ws.close();
        }
        ws = new WebSocket(addr);
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
        if (ws.readyState == WebSocket.OPEN) {
            ws.send(Math.floor(Math.random() * 1000) + "");
        }
    }, 25000);
    return socket;
}
module.exports=getSocket;