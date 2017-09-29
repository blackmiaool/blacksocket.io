/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

const io=__webpack_require__(1);
const socket = io(`:23033/test`);
socket.on('connect',function(){
    console.log('connected');
    setInterval(()=>{
        socket.emit('client-event',{a:'client params'},function(cbParams){
            console.log('client-event cb',cbParams);
        });
    },1000);
});

socket.on('server-event',function(params,cb){
    console.log('server-event',params);
    cb({a:"server-event cb"});
});

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

const Socket=__webpack_require__(2);

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

/***/ }),
/* 2 */
/***/ (function(module, exports) {

class Socket {
    init(ws) {
        this.ws = ws;
        ws.addEventListener("message", (message) => {
            if (!message.data || message.data[0] !== '{') {
                return;
            }

            let {
                uid,
                needCb,
                data,
                event,
                type
            } = JSON.parse(message.data);
            if (type === "msg") {
                if (!this.eventListenerMap[event]) {
                    return;
                }
                let cb;
                if (needCb) {
                    cb = (data) => {
                        this.sendCb(uid, data);
                    }
                }
                this.eventListenerMap[event].forEach(function (listener) {
                    listener(data, cb);
                });
            } else if (type === "cb") {
                this.cbMap[uid] && this.cbMap[uid](data);
                // just invoke it once
                delete this.cbMap[uid];
            }
        });


        ws.addEventListener('open', () => {
            const connectMap = this.eventListenerMap['connect'];
            const reconnectMap = this.eventListenerMap['reconnect'];
            const firstMap = this.eventListenerMap['first-connect'];
            connectMap && connectMap.forEach((cb) => {
                cb();
            });
            if (!this.firstConnect) {
                reconnectMap && reconnectMap.forEach((cb) => {
                    cb();
                });
            } else {
                this.firstConnect = false;
                firstMap && firstMap.forEach((cb) => {
                    cb();
                });
            }
        });
        ws.addEventListener('close',  () =>{
            const disconnectMap = this.eventListenerMap['first-connect'];
            disconnectMap && disconnectMap.forEach((cb) => {
                cb();
            });
        });
    }
    constructor() {
        Object.assign(this, {
            uid: 1,
            eventListenerMap: {},
            cbMap: {},
            firstConnect: true
        });
    }
    close() {
        this.ws.close();
    }
    emit(event, data, cb) {
        const msg = {};
        msg.uid = this.uid;
        this.uid++;
        if (cb) {
            msg.needCb = true;
            this.cbMap[msg.uid] = cb;
        }
        msg.data = data;
        msg.event = event;
        msg.type = "msg";
        if (this.ws.readyState === 1) {
            this.ws.send(JSON.stringify(msg));
        }
    }
    sendCb(uid, data) {
        this.ws.send(JSON.stringify({
            type: "cb",
            uid,
            data
        }), function (err) {
            if (err) {
                console.warn('err', err);
            }
        });
    }
    on(event, cb) {

            if (!this.eventListenerMap[event]) {
                this.eventListenerMap[event] = [];
            }
            this.eventListenerMap[event].push(cb);
        

    }
}
module.exports = Socket;

/***/ })
/******/ ]);