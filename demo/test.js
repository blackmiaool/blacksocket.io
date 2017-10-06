const httpServer = require('http').Server;
const chai = require('chai');
const fs = require('fs');
const path = require('path');

const io = require('../server');
const ioc = require('../src/client');

const expect = chai.expect;
const testPort = 23044;
const testPath = '/test';
const binaryTestFile1 = path.join(__dirname, 'binary-test1.jpg');
const binaryTestFile2 = path.join(__dirname, 'binary-test2.jpg');
chai.should();

const eventName = 'an event';
function getServerWithPort() {
    return io(testPort, {
        path: testPath,
    });
}
function getClientWithPort() {
    return ioc(`:${testPort}${testPath}`);
}
const acceptedData = {
    a: 1,
    b: undefined,
    c: "2d",
    d: { a: 1, b: 2 },
    e: ['b', { e: 3 }, 5],
    f: null
}
describe('server', function () {
    let server;
    let client;
    afterEach(() => {
        server && server.close();
        client && client.close();
    });


    it('should receive a connection', function (done) {
        server = getServerWithPort();

        server.on('connection', function () {
            setImmediate(done);
        });
        client = getClientWithPort();
    });
    it('should support once', function (done) {
        server = getServerWithPort();
        const event2data = JSON.parse(JSON.stringify(acceptedData));
        server.on('connection', function (socket) {
            socket.once(eventName, () => {
                done();
            });
        });
        client = getClientWithPort();
        client.on('connect', function () {
            for (const name in event2data) {
                client.emit(eventName, event2data[name]);
            }
        });
    });
    it('should receive verious types of data', function (done) {
        server = getServerWithPort();
        const event2data = JSON.parse(JSON.stringify(acceptedData));

        server.on('connection', function (socket) {
            for (const eventName in event2data) {
                socket.on(eventName, function (data) {
                    const target = event2data[eventName];
                    const type = Array.isArray(target) ? 'array' : typeof target;
                    expect(data).deep.equal(event2data[eventName], `verify ${type} type of data failed`);
                    delete event2data[eventName];
                    if (!Object.keys(event2data).length) {
                        done();
                    }
                });
            }
        });

        client = getClientWithPort();
        client.on('connect', function () {
            for (const eventName in event2data) {
                client.emit(eventName, event2data[eventName]);
            }
        });
    });
    it('can be closed', function (done) {
        server = getServerWithPort();

        server.on('connection', function (socket) {
            setImmediate(server.close);
        });
        client = getClientWithPort();
        client.on('disconnect', done);
    });
    describe('create', function () {
        it('should be created with a port', function (done) {
            server = getServerWithPort();

            server.on('listening', function () {
                done();
            });
        });

        it('should be created with an http server', function (done) {
            const hServer = httpServer();
            server = io(hServer, {
                path: testPath,
            });
            hServer.listen(testPort);
            server.on('listening', function () {
                done();
            });
        });
    });
    describe('callback', function () {
        it('should emit data and get callback called', function (done) {
            const eventParams = { a: 1, b: 2 };
            server = getServerWithPort();

            server.on('connection', function (socket) {
                socket.emit(eventName, eventParams, (data) => {
                    for (const i in data) {
                        data[i] /= 2;
                    }
                    data.should.deep.equal(eventParams);
                    done();
                });
            });

            client = getClientWithPort();
            client.on('connect', function () {
                client.on(eventName, (data, cb) => {
                    for (const i in data) {
                        data[i] *= 2;
                    }
                    cb(data);
                });
            });
        });
        it('should support promise', function (done) {
            const eventParams = { a: 1, b: 2 };
            server = getServerWithPort();

            server.on('connection', function (socket) {
                socket.emit(eventName, eventParams, true).then((data) => {
                    for (const i in data) {
                        data[i] /= 2;
                    }
                    data.should.deep.equal(eventParams);
                    done();
                });
            });

            client = getClientWithPort();
            client.on('connect', function () {
                client.on(eventName, (data, cb) => {
                    for (const i in data) {
                        data[i] *= 2;
                    }
                    cb(data);
                });
            });
        });
    });


    describe('binary', function () {
        it('can receive ArrayBuffer', function (done) {
            server = getServerWithPort();
            client = getClientWithPort();
            server.on('connection', function (socket) {
                socket.on(eventName, (data) => {
                    fs.readFile(binaryTestFile1, function (err, buf) {
                        buf.should.deep.equal(data);
                        done()
                    });
                });
            });
            client.on('connect', function () {
                fs.readFile(binaryTestFile1, function (err, buf) {
                    if (err) {
                        return console.log(err);
                    }
                    client.emit(eventName, buf.buffer);
                });
            });
        });
        it('can receive ArrayBuffer in callback', function (done) {
            server = getServerWithPort();
            client = getClientWithPort();
            server.on('connection', function (socket) {
                socket.emit(eventName, {}, (data) => {
                    fs.readFile(binaryTestFile1, function (err, buf) {
                        buf.should.deep.equal(data.hey);
                        done()
                    });
                });
            });
            client.on('connect', function () {
                client.on(eventName, (data, cb) => {
                    fs.readFile(binaryTestFile1, function (err, buf) {
                        if (err) {
                            return console.log(err);
                        }
                        cb({ hey: buf.buffer });
                    });
                });

            });
        });
        it('can receive ArrayBuffer in object', function (done) {
            server = getServerWithPort();
            client = getClientWithPort();
            server.on('connection', function (socket) {
                socket.on(eventName, (data) => {
                    Promise.all([getFile(binaryTestFile1), getFile(binaryTestFile2)])
                        .then(([buffer1, buffer2]) => {
                            buffer1.should.deep.equal(data.a);
                            buffer2.should.deep.equal(data.b.c);
                            done();
                        });
                });
            });
            client.on('connect', function () {
                Promise.all([getFile(binaryTestFile1), getFile(binaryTestFile2)])
                    .then(([buffer1, buffer2]) => {
                        client.emit(eventName, { a: buffer1, b: { c: buffer2 } });
                    });
            });
            function getFile(file) {
                return new Promise((resolve) => {
                    fs.readFile(file, function (err, buf) {
                        if (err) {
                            return console.log(err);
                        }
                        resolve(buf);
                    })
                })
            }
        });
    });

});
describe('client', function () {
    let server;
    let client;
    afterEach(() => {
        server && server.close();
        client && client.close();
    });
    it('should be created with a port', function (done) {
        server = io(testPort, {
            // path: '',
        });
        client = ioc(`:${testPort}`);
        client.on('connect', () => {
            setImmediate(done);
        });
    });
    it('should be created with a path', function (done) {
        server = getServerWithPort();
        client = getClientWithPort();
        client.on('connect', () => {
            setImmediate(done);
        });
    });
    it('should receive verious types of data', function (done) {
        server = getServerWithPort();

        const event2data = JSON.parse(JSON.stringify(acceptedData));

        server.on('connection', function (socket) {
            for (const eventName in event2data) {
                socket.emit(eventName, event2data[eventName]);
            }
        });
        client = getClientWithPort();
        client.on('connect', function () {
            for (const eventName in event2data) {
                client.on(eventName, function (data) {
                    const target = event2data[eventName];
                    const type = Array.isArray(target) ? 'array' : typeof target;
                    expect(data).deep.equal(event2data[eventName], `verify ${type} type of data failed`);
                    delete event2data[eventName];
                    if (!Object.keys(event2data).length) {
                        done();
                    }
                });
            }
        });
    });
    it('should emit data and get callback called', function (done) {
        const eventParams = { a: 1, b: 2 };
        server = getServerWithPort();

        server.on('connection', function (socket) {
            socket.on(eventName, (data, cb) => {
                for (const i in data) {
                    data[i] *= 2;
                }
                cb(data);
            });
        });

        client = getClientWithPort();
        client.on('connect', function () {
            client.emit(eventName, eventParams, (data) => {
                for (const i in data) {
                    data[i] /= 2;
                }
                data.should.deep.equal(eventParams);
                done();
            });

        });
    });
    it('can be closed', function (done) {
        server = getServerWithPort();

        server.on('connection', function (socket) {
            socket.on('disconnect', () => {
                done();
            });
        });
        client = getClientWithPort();
        client.on('connect', () => {
            setImmediate(() => client.close());
        });
    });
});