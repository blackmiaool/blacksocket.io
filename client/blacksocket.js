(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("ws"));
	else if(typeof define === 'function' && define.amd)
		define(["ws"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("ws")) : factory(root["ws"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__) {
return /******/ (function(modules) { // webpackBootstrap
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

"use strict";


var Socket = __webpack_require__(1);
var isBrowser = typeof location !== 'undefined';

function io() {
    var addr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "/";


    var ws = void 0;
    //auto connect
    var checkInterval = void 0;

    var protocol = isBrowser ? location.protocol.replace('http', 'ws') : 'ws:';
    var hostname = isBrowser ? location.hostname : 'localhost';
    if (addr.startsWith(':') || addr.startsWith('/')) {
        addr = protocol + '//' + hostname + addr;
    } else {
        throw new Error('invalid addr' + addr);
    }

    var WS = void 0;
    if (isBrowser) {
        WS = WebSocket;
    } else {
        WS = __webpack_require__(2);
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
        ws.addEventListener("close", function (event) {
            if (checkInterval) {
                clearInterval(checkInterval);
            }
            checkInterval = setInterval(function () {
                connect(addr);
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

    var socket = new Socket();
    connect(addr);
    this.lifeInterval = setInterval(function () {
        if (ws.readyState == WS.OPEN) {
            ws.send(Math.floor(Math.random() * 1000) + "");
        }
    }, 25000);
    return socket;
}

module.exports = io;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Socket = function () {
    _createClass(Socket, [{
        key: "init",
        value: function init(ws) {
            var _this = this;

            this.ws = ws;
            ws.addEventListener("message", function (message) {
                if (!message.data || message.data[0] !== '{') {
                    return;
                }

                var _JSON$parse = JSON.parse(message.data),
                    uid = _JSON$parse.uid,
                    needCb = _JSON$parse.needCb,
                    data = _JSON$parse.data,
                    event = _JSON$parse.event,
                    type = _JSON$parse.type;

                if (type === "msg") {
                    if (!_this.eventListenerMap[event]) {
                        return;
                    }
                    var cb = void 0;
                    if (needCb) {
                        cb = function cb(data) {
                            _this.sendCb(uid, data);
                        };
                    }
                    _this.eventListenerMap[event].forEach(function (listener) {
                        listener(data, cb);
                    });
                } else if (type === "cb") {
                    _this.cbMap[uid] && _this.cbMap[uid](data);
                    // just invoke it once
                    delete _this.cbMap[uid];
                }
            });

            ws.addEventListener('open', function () {
                var connectMap = _this.eventListenerMap['connect'];
                var reconnectMap = _this.eventListenerMap['reconnect'];
                var firstMap = _this.eventListenerMap['first-connect'];
                connectMap && connectMap.forEach(function (cb) {
                    cb();
                });
                if (!_this.firstConnect) {
                    reconnectMap && reconnectMap.forEach(function (cb) {
                        cb();
                    });
                } else {
                    _this.firstConnect = false;
                    firstMap && firstMap.forEach(function (cb) {
                        cb();
                    });
                }
            });
            ws.addEventListener('close', function () {
                var disconnectMap = _this.eventListenerMap['disconnect'];
                disconnectMap && disconnectMap.forEach(function (cb) {
                    cb();
                });
            });
        }
    }]);

    function Socket() {
        _classCallCheck(this, Socket);

        Object.assign(this, {
            uid: 1,
            eventListenerMap: {},
            cbMap: {},
            firstConnect: true,
            closed: false
        });
    }

    _createClass(Socket, [{
        key: "open",
        value: function open() {
            this.closed = false;
            this.ws.open();
        }
    }, {
        key: "close",
        value: function close() {
            this.closed = true;
            this.ws.close();
        }
    }, {
        key: "emit",
        value: function emit(event, data, cb) {
            var msg = {};
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
    }, {
        key: "sendCb",
        value: function sendCb(uid, data) {
            this.ws.send(JSON.stringify({
                type: "cb",
                uid: uid,
                data: data
            }), function (err) {
                if (err) {
                    console.warn('err', err);
                }
            });
        }
    }, {
        key: "on",
        value: function on(event, cb) {

            if (!this.eventListenerMap[event]) {
                this.eventListenerMap[event] = [];
            }
            this.eventListenerMap[event].push(cb);
        }
    }]);

    return Socket;
}();

module.exports = Socket;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ })
/******/ ]);
});