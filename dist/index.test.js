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

const io = __webpack_require__(1);
const socket = io(`:23033/test`);
socket.on('first-connect', function () {
    console.log('connected');
    setInterval(() => {
        socket.emit('client-event', { a: 'client params' }, function (cbParams) {
            console.log('client-event cb', cbParams);
        });
    }, 1000);
});

socket.on('server-event', function (params, cb) {
    console.log('server-event', params);
    cb({ a: "server-event cb" });
});

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

(function webpackUniversalModuleDefinition(root, factory) {
	if(true)
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
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


Object.defineProperty(exports, "__esModule", { value: true });
var socket_1 = __webpack_require__(1);
var isBrowser = typeof location !== 'undefined';
var WS = void 0;
if (isBrowser) {
    WS = WebSocket;
} else {
    WS = eval("require('ws')");
}
function io() {
    var addr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "/";

    var ws = void 0;
    //auto connect
    var checkInterval = void 0;
    var protocol = isBrowser ? location.protocol.replace('http', 'ws') : 'ws:';
    var hostname = isBrowser ? location.hostname : 'localhost';
    if (addr.startsWith(':') || addr.startsWith('/')) {
        addr = protocol + "//" + hostname + addr;
    } else {
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
                checkInterval = null;
            }
        });
        socket.init(ws);
    }
    var socket = new socket_1.default();
    connect(addr);
    setInterval(function () {
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

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", { value: true });
var binaryReadyEvent = '__black_binary_ready';
function isBinary(data) {
    if (!data) {
        return false;
    }
    var name = Object.getPrototypeOf(data).constructor.name;
    if (name === 'ArrayBuffer' || name === 'Buffer') {
        return true;
    } else {
        return false;
    }
}
function canTraverse(data) {
    return data && (typeof data === "undefined" ? "undefined" : _typeof(data)) === 'object';
}
function getArrayBuffers(data) {
    if (!canTraverse(data)) {
        return null;
    }
    var ret = [[], []];
    if (isBinary(data)) {
        ret[0].push([]);
        ret[1].push(data);
        return ret;
    }
    function traverseObj(data, path) {
        for (var key in data) {
            if (isBinary(data[key])) {
                path.push(key);
                ret[0].push(path.slice());
                ret[1].push(data[key]);
                path.pop();
            } else if (canTraverse(data)) {
                path.push(key);
                traverseObj(data[key], path);
                path.pop();
            }
        }
    }
    traverseObj(data, []);
    if (!ret[0].length) {
        return null;
    }
    return ret;
}
function set(root, path, data) {
    if (path.includes('constructor') || path.includes('__proto__')) {
        return;
    }
    if (!path[0]) {
        return data;
    }
    path.reduce(function (p, section, i) {
        if (i === path.length - 1) {
            p[section] = data;
            return;
        }
        return p[section];
    }, root);
    return root;
}

var Socket = function () {
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
        key: "sendCb",
        value: function sendCb(uid) {
            for (var _len = arguments.length, data = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                data[_key - 1] = arguments[_key];
            }

            this.underlyingEmit({
                type: 'cb',
                uid: uid,
                data: data
            });
        }
    }, {
        key: "_send",
        value: function _send(msg) {
            if (this.ws.readyState === 1) {
                this.ws.send(msg);
            }
            //  else {
            //     console.log('bug: not ready', this.ws.readyState);
            // }
        }
    }, {
        key: "underlyingEmit",
        value: function underlyingEmit(_ref) {
            var _this = this;

            var event = _ref.event,
                _ref$promise = _ref.promise,
                promise = _ref$promise === undefined ? false : _ref$promise,
                cb = _ref.cb,
                data = _ref.data,
                _ref$type = _ref.type,
                type = _ref$type === undefined ? 'msg' : _ref$type,
                uid = _ref.uid;

            var ret = void 0;
            if (this.binaryData.length) {
                var params = Object.assign({}, arguments[0]);
                if (promise) {
                    ret = new Promise(function (resolve) {
                        params.cb = resolve;
                        params.promise = false;
                    });
                }
                this.binaryMsgQueue.push(params);
                return ret;
            }
            if (!uid) {
                uid = this.uid;
                this.uid++;
            }
            var msg = {
                type: type,
                uid: uid,
                data: data,
                event: event,
                needCb: false
            };
            if (cb || promise) {
                msg.needCb = true;
                if (promise) {
                    ret = new Promise(function (resolve) {
                        _this.cbMap[msg.uid] = function (result) {
                            resolve(result);
                        };
                    });
                } else if (typeof cb === 'function') {
                    this.cbMap[msg.uid] = cb;
                }
            }
            var arrayBuffers = getArrayBuffers(data);
            if (arrayBuffers) {
                msg.bufferPaths = arrayBuffers[0];
                this.binaryData = arrayBuffers[1];
            }
            this._send(JSON.stringify(msg));
            return ret;
        }
    }, {
        key: "init",
        value: function init(ws) {
            var _this2 = this;

            this.ws = ws;
            this.binaryData = [];
            this.binaryMsgQueue = [];
            ws.addEventListener("message", function (message) {
                var _cbMap;

                var binaryData = void 0;
                var content = void 0;
                if (isBinary(message.data)) {
                    if (!_this2.binaryInfo) {
                        return;
                    }
                    binaryData = message.data;
                    content = _this2.binaryInfo;
                } else if (!message.data || message.data[0] !== '{') {
                    return;
                }
                if (!content) {
                    content = JSON.parse(message.data);
                }
                var _content = content,
                    uid = _content.uid,
                    needCb = _content.needCb,
                    data = _content.data,
                    event = _content.event,
                    type = _content.type,
                    bufferPaths = _content.bufferPaths;

                if (binaryData) {
                    var path = bufferPaths.pop();
                    data = set(data, path, binaryData);
                }
                var checkSendBinaryBuffer = function checkSendBinaryBuffer() {
                    if (bufferPaths && bufferPaths.length) {
                        _this2.binaryInfo = content;
                        _this2.ws.send(JSON.stringify({ type: 'wait-binary' }));
                        return true;
                    }
                    return false;
                };
                switch (type) {
                    case 'msg':
                        if (checkSendBinaryBuffer()) {
                            return;
                        }
                        if (!_this2.eventListenerMap[event]) {
                            return;
                        }
                        var cb = void 0;
                        if (needCb) {
                            cb = function cb() {
                                for (var _len2 = arguments.length, data = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                                    data[_key2] = arguments[_key2];
                                }

                                _this2.sendCb.apply(_this2, [uid].concat(data));
                            };
                        }
                        _this2.eventListenerMap[event].forEach(function (listener) {
                            var ret = void 0;
                            ret = listener.apply(undefined, _toConsumableArray(data).concat([cb]));
                            if (ret && ret.then && cb) {
                                ret.then(cb);
                            }
                        });
                        break;
                    case 'wait-binary':
                        _this2.ws.send(_this2.binaryData.pop());
                        if (!_this2.binaryData.length && _this2.binaryMsgQueue.length) {
                            _this2.underlyingEmit(_this2.binaryMsgQueue.shift());
                        }
                        break;
                    case "cb":
                        if (checkSendBinaryBuffer()) {
                            return;
                        }
                        _this2.cbMap[uid] && (_cbMap = _this2.cbMap)[uid].apply(_cbMap, _toConsumableArray(data));
                        // just invoke it once
                        delete _this2.cbMap[uid];
                        break;
                }
            });
            ws.addEventListener('open', function () {
                var connectListeners = _this2.eventListenerMap['connect'];
                var reconnectListeners = _this2.eventListenerMap['reconnect'];
                var firstListeners = _this2.eventListenerMap['first-connect'];
                connectListeners && connectListeners.forEach(function (cb) {
                    cb();
                });
                if (!_this2.firstConnect) {
                    reconnectListeners && reconnectListeners.forEach(function (cb) {
                        cb();
                    });
                } else {
                    _this2.firstConnect = false;
                    firstListeners && firstListeners.forEach(function (cb) {
                        cb();
                    });
                }
            });
            ws.addEventListener('close', function () {
                var disconnectMap = _this2.eventListenerMap['disconnect'];
                disconnectMap && disconnectMap.forEach(function (cb) {
                    cb();
                });
            });
        }
    }, {
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
        key: "emitp",
        value: function emitp(event) {
            for (var _len3 = arguments.length, data = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
                data[_key3 - 1] = arguments[_key3];
            }

            return this.underlyingEmit({ event: event, promise: true, data: data });
        }
    }, {
        key: "emit",
        value: function emit(event) {
            for (var _len4 = arguments.length, data = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
                data[_key4 - 1] = arguments[_key4];
            }

            var cb = void 0;
            if (typeof data[data.length - 1] === 'function') {
                cb = data.pop();
            }
            this.underlyingEmit({
                event: event, data: data, cb: cb
            });
            return this;
        }
    }, {
        key: "once",
        value: function once(event, cb) {
            var _this3 = this;

            var wrapper = function wrapper() {
                var list = _this3.eventListenerMap[event];
                cb();
                list.splice(list.indexOf(wrapper), 1);
            };
            return this.on(event, wrapper);
        }
    }, {
        key: "on",
        value: function on(event, cb) {
            if (!this.eventListenerMap[event]) {
                this.eventListenerMap[event] = [];
            }
            this.eventListenerMap[event].push(cb);
            return this;
        }
    }]);

    return Socket;
}();

exports.default = Socket;

/***/ })
/******/ ]);
});

/***/ })
/******/ ]);