(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["io"] = factory();
	else
		root["io"] = factory();
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

    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$reconnectionDela = _ref.reconnectionDelayMax,
        reconnectionDelayMax = _ref$reconnectionDela === undefined ? 5000 : _ref$reconnectionDela;

    var ws = void 0;
    //auto connect
    var checkInterval = void 0;
    var protocol = isBrowser ? location.protocol.replace('http', 'ws') : 'ws:';
    var hostname = isBrowser ? location.hostname : 'localhost';
    if (addr.startsWith('ws://')) {
        //do nothing        
    } else if (addr.startsWith(':') || addr.startsWith('/')) {
        addr = protocol + "//" + hostname + addr;
    } else {
        throw new Error('invalid addr ' + addr);
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
        ws.addEventListener("close", function () {
            if (checkInterval) {
                clearInterval(checkInterval);
            }
            if (socket.closed) {
                return;
            }
            checkInterval = setInterval(function () {
                connect(addr);
            }, reconnectionDelayMax);
        });
        ws.addEventListener("open", function () {
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
var timers_1 = __webpack_require__(2);
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
    var ret = [[], []];
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
        return [{ message: 'cant use meta properties(constructor, __proto__)' }];
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
                } else {
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
            this.ws.on('error', function (e) {
                console.log('blacksocket on error:', e.message);
            });
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
                        var _cb = void 0;
                        if (needCb) {
                            _cb = function cb() {
                                for (var _len2 = arguments.length, data = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                                    data[_key2] = arguments[_key2];
                                }

                                if (!_cb) {
                                    return;
                                }
                                _cb = null;
                                _this2.sendCb.apply(_this2, [uid].concat(data));
                            };
                        }
                        _this2.eventListenerMap[event].forEach(function (listener) {
                            var ret = void 0;
                            ret = listener.apply(undefined, _toConsumableArray(data).concat([_cb]));
                            if (ret && ret.then && _cb) {
                                ret.then(_cb);
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
                _this2.connecting = true;
            });
            ws.addEventListener('close', function () {
                var disconnectMap = _this2.eventListenerMap['disconnect'];
                disconnectMap && disconnectMap.forEach(function (cb) {
                    cb();
                });
                _this2.connecting = false;
            });
        }
    }, {
        key: "close",
        value: function close() {
            var _this3 = this;

            this.closed = true;
            if (this.ws.readyState === 1) {
                this.ws.close();
            } else {
                timers_1.setTimeout(function () {
                    _this3.ws.close();
                }, undefined);
            }
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
            var _this4 = this;

            var wrapper = function wrapper() {
                cb();
                _this4.off(event, wrapper);
            };
            return this.on(event, wrapper);
        }
    }, {
        key: "off",
        value: function off(event, cb) {
            if (!this.eventListenerMap[event]) {
                return false;
            }
            var index = this.eventListenerMap[event].indexOf(cb);
            if (index === -1) {
                return false;
            } else {
                this.eventListenerMap[event].splice(index, 1);
                return true;
            }
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

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var apply = Function.prototype.apply;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) {
  if (timeout) {
    timeout.close();
  }
};

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// setimmediate attaches itself to the global object
__webpack_require__(3);
exports.setImmediate = setImmediate;
exports.clearImmediate = clearImmediate;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var registerImmediate;

    function setImmediate(callback) {
      // Callback can either be a function or a string
      if (typeof callback !== "function") {
        callback = new Function("" + callback);
      }
      // Copy function arguments
      var args = new Array(arguments.length - 1);
      for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i + 1];
      }
      // Store and register the task
      var task = { callback: callback, args: args };
      tasksByHandle[nextHandle] = task;
      registerImmediate(nextHandle);
      return nextHandle++;
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
        case 0:
            callback();
            break;
        case 1:
            callback(args[0]);
            break;
        case 2:
            callback(args[0], args[1]);
            break;
        case 3:
            callback(args[0], args[1], args[2]);
            break;
        default:
            callback.apply(undefined, args);
            break;
        }
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(runIfPresent, 0, handle);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    run(task);
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function installNextTickImplementation() {
        registerImmediate = function(handle) {
            process.nextTick(function () { runIfPresent(handle); });
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        registerImmediate = function(handle) {
            global.postMessage(messagePrefix + handle, "*");
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        registerImmediate = function(handle) {
            channel.port2.postMessage(handle);
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function(handle) {
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
        };
    }

    function installSetTimeoutImplementation() {
        registerImmediate = function(handle) {
            setTimeout(runIfPresent, 0, handle);
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4), __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./../process/browser.js\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))))

/***/ }),
/* 4 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ })
/******/ ]);
});