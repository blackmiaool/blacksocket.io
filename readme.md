# blacksocket.io

A websocket wrapper. Basically compatiable with socket.io.

[![Travis](https://travis-ci.org/blackmiaool/blacksocket.io.svg?branch=master)](https://travis-ci.org/blackmiaool/blacksocket.io)
[![NPM version](https://img.shields.io/npm/v/blacksocket.io.svg)](https://www.npmjs.com/package/blacksocket.io)



* Lightweight
* Callback
* Auto reconnection
* Object sending
* Binary sending (even in object) (even in callback) 
* Once
* Promise

### Install 

#### Server 
```bash
npm i -S blacksocket.io
```
#### Client 

##### Install with npm 
```bash
npm i -S blacksocket.io
```
##### Use script file directly 
Just for testing
```html
<script src="https://raw.githubusercontent.com/blackmiaool/blacksocket.io/master/client/blacksocket.min.js"></script>
```

### Usage

I have no time for writing a whole documentation for it. If you want to use it, I personally recommend you to read the test/test.js file to get all the demos.

#### Server

```javascript
// initialize with port and path
const io = require('blacksocket.io/server')(23033, {
    path: '/test'
});
io.on('connection', function (socket) {
    console.log('socket connection');
    // listen client event
    socket.on('client-event', function (params, cb) {
        console.log('client-event', params);
        cb({ a: "it's an object" });
    });
    setInterval(() => {
        // send event to client
        socket.emit('server-event', { a: 'server params' }, function (params) {
            // receive a callback
            console.log('server-event cb', params);
        });
    }, 3000);
});
```

#### Client (nodejs or browser)

```javascript
const io = require("blacksocket.io/client");
// initialize with port and path
const socket = io(`:23033/test`);

// first-connect: triggered on first connection 
// connect: triggered on every successful connection(including reconnection)
// reconnection event: triggered on reconnection
socket.on('first-connect', function () {
    console.log('connected');
    setInterval(() => {
        // send event to server
        socket.emit('client-event', { a: 'client params' }, function (cbParams) {
            // receive a callback
            console.log('client-event cb', cbParams);
        });
    }, 1000);
});

socket.on('server-event', function (params, cb) {
    console.log('server-event', params);
    // invoke the callback to return some data to server
    cb({ a: "server-event cb" });
});
```
