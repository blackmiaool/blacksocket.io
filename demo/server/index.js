const io = require('blacksocket.io/server')(23033, {
    path: '/test',
    serveClient: false,
});
io.on('connection', function (socket) {
    console.log('socket connection');
    socket.on('client-event',function(params,cb){
        console.log('client-event',params);
        cb({a:"it's an object"});
    });
    setInterval(()=>{
        socket.emit('server-event',{a:'server params'},function(params){     
            console.log('server-event cb',params);
        });
    },3000);
});
