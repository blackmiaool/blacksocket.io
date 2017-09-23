const io = require('../../server')(23033, {
    path: '/test',
    serveClient: false,
});
io.on('connection', function (socket) {
    console.log('socket connection');
    socket.on('an event',function(params,cb){
        console.log(params);
        cb({a:"it's an object"});
    });
});
