const io=require("client");
const socket = io(`:23033/test`);
setInterval(()=>{
    socket.emit('client-event',{a:'client params'},function(cbParams){
        console.log('client-event cb',cbParams);
    });
},1000);
socket.on('server-event',function(params,cb){
    console.log('server-event',params);
    cb({a:"server-event cb"});
});