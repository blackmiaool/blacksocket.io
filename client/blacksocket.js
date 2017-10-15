(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
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


var Socket = __webpack_require__(1);
var isBrowser = typeof location !== 'undefined';

var WS = void 0;
if (isBrowser) {
    WS = WebSocket;
} else {
    WS = eval('require(\'ws\')');
}
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

var binaryReadyEvent = '__black_binary_ready';
function isArrayBuffer(data) {
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
    return data && (typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object';
}
function getArrayBuffers(data) {
    if (!canTraverse(data)) {
        return null;
    }

    var ret = { paths: [], buffers: [] };
    if (isArrayBuffer(data)) {
        ret.paths.push([]);
        ret.buffers.push(data);
        return ret;
    }
    function traverseObj(data, path) {
        for (var key in data) {
            if (isArrayBuffer(data[key])) {
                path.push(key);
                ret.paths.push(path.slice());
                ret.buffers.push(data[key]);
                path.pop();
            } else if (canTraverse(data)) {
                path.push(key);
                traverseObj(data[key], path);
                path.pop();
            }
        }
    }

    traverseObj(data, []);
    if (!ret.paths.length) {
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
    _createClass(Socket, [{
        key: 'init',
        value: function init(ws) {
            var _this = this;

            this.ws = ws;
            this.binaryData = [];
            this.binaryMsgQueue = [];
            ws.addEventListener("message", function (message) {
                var _cbMap;

                var binaryData = void 0;
                var content = void 0;
                if (isArrayBuffer(message.data)) {
                    if (!_this.binaryInfo) {
                        return;
                    }
                    binaryData = message.data;
                    content = _this.binaryInfo;
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
                    dataType = _content.dataType,
                    bufferPaths = _content.bufferPaths;

                if (binaryData) {
                    var path = bufferPaths.pop();

                    data = set(data, path, binaryData);
                }
                var checkBinaryBuffer = function checkBinaryBuffer() {
                    if (bufferPaths && bufferPaths.length) {
                        _this.binaryInfo = content;
                        _this.ws.send(JSON.stringify({ type: 'wait-binary' }));
                        return true;
                    }
                    return false;
                };
                switch (type) {
                    case 'msg':
                        if (checkBinaryBuffer()) {
                            return;
                        }
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
                            var ret = void 0;
                            ret = listener.apply(undefined, _toConsumableArray(data).concat([cb]));
                            if (ret && ret.then && cb) {
                                ret.then(cb);
                            }
                        });
                        break;
                    case 'wait-binary':
                        _this.ws.send(_this.binaryData.pop());
                        if (!_this.binaryData.length && _this.binaryMsgQueue.length) {
                            _this.emit.apply(_this, _this.binaryMsgQueue.shift());
                        }
                        break;
                    case "cb":
                        if (checkBinaryBuffer()) {
                            return;
                        }
                        _this.cbMap[uid] && (_cbMap = _this.cbMap)[uid].apply(_cbMap, _toConsumableArray(data));
                        // just invoke it once
                        delete _this.cbMap[uid];
                        break;
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
        key: 'open',
        value: function open() {
            this.closed = false;
            this.ws.open();
        }
    }, {
        key: 'close',
        value: function close() {
            this.closed = true;
            this.ws.close();
        }
    }, {
        key: '_send',
        value: function _send(msg) {
            if (this.ws.readyState === 1) {
                this.ws.send(msg);
            }
            //  else {
            //     console.log('bug: not ready', this.ws.readyState);
            // }
        }
    }, {
        key: 'emit',
        value: function emit(event) {
            var _this2 = this;

            //extra is not for user
            var originalEvent = event;
            var cb = void 0;

            for (var _len = arguments.length, data = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                data[_key - 1] = arguments[_key];
            }

            if (typeof data[data.length - 1] === 'function') {
                cb = data.pop();
            }
            var extra = {};
            var promise = false;
            if ((typeof event === 'undefined' ? 'undefined' : _typeof(event)) === 'object') {
                extra = event;
                promise = event.promise;
                event = event.event;
            }

            if (this.binaryData.length) {
                var _ret = void 0;
                if (promise) {
                    _ret = new Promise(function (resolve) {
                        cb = resolve;
                    });
                }
                var args = [originalEvent].concat(data);
                if (cb) {
                    args.push(cb);
                }
                delete originalEvent.promise;
                this.binaryMsgQueue.push(args);
                return _ret;
            }
            var msg = {};
            var ret = void 0;
            this.binaryData = [];
            if (extra.cb) {
                msg.uid = extra.uid;
            } else {
                msg.uid = this.uid;
                this.uid++;
            }

            if (cb || promise) {
                msg.needCb = true;
                if (promise) {
                    ret = new Promise(function (resolve) {
                        _this2.cbMap[msg.uid] = function (result) {
                            resolve(result);
                        };
                    });
                } else if (typeof cb === 'function') {
                    this.cbMap[msg.uid] = cb;
                } else {
                    console.warn('expect a function or a true as the third parameter');
                    return;
                }
            }
            var arrayBuffers = getArrayBuffers(data);
            if (arrayBuffers) {
                msg.bufferPaths = arrayBuffers.paths;
                this.binaryData = arrayBuffers.buffers;
            }
            msg.data = data;

            msg.event = event;
            if (extra.cb) {
                msg.type = "cb";
            } else {
                msg.type = "msg";
            }
            this._send(JSON.stringify(msg));

            return ret;
        }
    }, {
        key: 'sendCb',
        value: function sendCb(uid, data) {
            this.emit({
                cb: true,
                uid: uid
            }, data);
        }
    }, {
        key: 'once',
        value: function once(event, cb) {
            var _this3 = this;

            var wrapper = function wrapper() {
                var list = _this3.eventListenerMap[event];
                cb();
                list.splice(list.indexOf(wrapper), 1);
            };
            this.on(event, wrapper);
        }
    }, {
        key: 'on',
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

/***/ })
/******/ ]);
});