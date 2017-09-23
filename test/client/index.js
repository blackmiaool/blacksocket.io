const io=require("../../client");
const socket = io(`:23033/test`);
setInterval(()=>{
    socket.emit('an event',123,function(cbParams){
        console.log('cb',cbParams);
    });
},1000);