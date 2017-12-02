const httpServer = require('http').Server;
const chai = require('chai');
const fs = require('fs-extra');
const path = require('path');
require("blanket");
const io = require('../server');
const ioc = require('../lib/client');
console.log(io)
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
    return ioc(`:${testPort}${testPath}`, { reconnectionDelayMax: 10 });
}

function getCsSet() {
    return {
        server: getServerWithPort(),
        client: getClientWithPort()
    }
}
const acceptedData = {
    a: 1,
    b: undefined,
    c: "2d",
    d: { a: 1, b: 2 },
    e: ['b', { e: 3 }, 5],
    f: null
}

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at:', p, 'reason:', reason);
    // application specific logging, throwing an error, or other logic here
});

describe('server', function () {
    let server;
    let client;
    afterEach(() => {
        server && server.close();
        client && client.close();
        server = null;
        client = null;
    });


    it('should receive a connection', function (done) {
        ({ server, client } = getCsSet());

        server.on('connection', function () {
            setImmediate(done);
        });
    });
    it('should receive a disconnection', function (done) {
        ({ server, client } = getCsSet());
        server.on('connection', function () {
            client.on('disconnect', done);
            setTimeout(() => {
                client.close();
            });
        });
    });
    it('maintains a client set', function (done) {
        ({ server, client: client1 } = getCsSet());
        const client2 = getClientWithPort();
        const client3 = getClientWithPort();
        let cnt = 0;
        server.on('connection', function (socket) {
            cnt++;
            if (cnt === 3) {
                const clients = server.clients;
                [...clients.values()].should.deep.equal(server.sockets.clients());
                setTimeout(() => {
                    client1.close();
                    client2.close();
                    client3.close();
                    done();
                });
            }
        });
    });
    it('should support once', function (done) {
        ({ server, client } = getCsSet());
        const event2data = JSON.parse(JSON.stringify(acceptedData));
        server.on('connection', function (socket) {
            socket.once(eventName, () => {
                done();
            });
        });
        client.on('connect', function () {
            for (const name in event2data) {
                client.emit(eventName, event2data[name]);
            }
        });
    });
    it('should support multiple arguments', function (done) {
        ({ server, client } = getCsSet());
        const event2data = JSON.parse(JSON.stringify(acceptedData));
        server.on('connection', function (socket) {
            socket.on(eventName, (a, b, c, cb) => {
                a.should.equal(1);
                b.should.equal(2);
                c.should.equal(3);
                cb();
            });
        });
        client.on('connect', function () {
            client.emit(eventName, 1, 2, 3, () => {
                done();
            });
        });
    });
    it('should receive verious types of data', function (done) {
        ({ server, client } = getCsSet());
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

        client.on('connect', function () {
            for (const eventName in event2data) {
                client.emit(eventName, event2data[eventName]);
            }
        });
    });
    it('should avoid sending meta properties', async function () {
        const bianry = await fs.readFile('test/binary-test1.jpg');
        ({ server, client } = getCsSet());
        await new Promise((resolve) => {
            server.on('connection', function (socket) {
                socket.on('a', (emptyObject) => {
                    emptyObject.should.deep.equal({ message: 'cant use meta properties(constructor, __proto__)' });
                    resolve();
                });
            });

            client.on('connect', function () {
                client.emit('a', {
                    'constructor': bianry
                });
            });
        });

    });
    it('can be closed', function (done) {
        ({ server, client } = getCsSet());

        server.on('connection', function (socket) {
            setImmediate(server.close);
        });
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
        it('can send event to unexisting listener', function (done) {
            ({ server, client } = getCsSet());
            server.on('connection', async function (socket) {
                socket.emit("a", "b");
                done();
            });

            client.on('connect', function () {
                client.on("c", (data, cb) => { });
            });
        });
        it('should emit data and get callback called', function (done) {
            const eventParams = { a: 1, b: 2 };
            ({ server, client } = getCsSet());

            server.on('connection', function (socket) {
                socket.emit(eventName, eventParams, (data) => {
                    for (const i in data) {
                        data[i] /= 2;
                    }
                    data.should.deep.equal(eventParams);
                    done();
                });
            });

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
            ({ server, client } = getCsSet());

            server.on('connection', async function (socket) {
                const data = await socket.emitp(eventName, eventParams);
                for (const i in data) {
                    data[i] /= 2;
                }
                data.should.deep.equal(eventParams);
                done();

            });

            client.on('connect', function () {
                client.on(eventName, (data, cb) => {
                    for (const i in data) {
                        data[i] *= 2;
                    }
                    cb(data);
                });
            });
        });
        it('callback supports promise', function (done) {
            const eventParams = { a: 1, b: 2 };
            ({ server, client } = getCsSet());

            server.on('connection', async function (socket) {
                const data = await socket.emitp(eventName, eventParams);
                for (const i in data) {
                    data[i] /= 2;
                }
                data.should.deep.equal(eventParams);
                done();

            });

            client.on('connect', function () {
                client.on(eventName, (data) => {
                    return new Promise((resolve) => {
                        for (const i in data) {
                            data[i] *= 2;
                        }
                        setTimeout(() => {
                            resolve(data);
                        }, 10);
                    });
                });
            });
        });
    });


    describe('binary', function () {
        it('can receive ArrayBuffer', function (done) {
            ({ server, client } = getCsSet());

            server.on('connection', function (socket) {
                let cnt = 0;
                socket.on(eventName, async (data) => {
                    const buf = await fs.readFile(binaryTestFile1);
                    buf.should.deep.equal(data);
                    cnt++;
                    if (cnt === 2) {
                        done();
                    }
                });
            });
            client.on('connect', async function () {
                const buf = await fs.readFile(binaryTestFile1);
                client.emit(eventName, buf.buffer);
                client.emit(eventName, buf.buffer);
            });
        });
        it('can receive ArrayBuffer in callback', function (done) {
            ({ server, client } = getCsSet());
            server.on('connection', function (socket) {
                socket.emit(eventName, {}, async (data) => {
                    const buf = await fs.readFile(binaryTestFile1);
                    buf.should.deep.equal(data.hey);
                    done()
                });
            });
            client.on('connect', function () {
                client.on(eventName, async (data, cb) => {
                    const buf = await fs.readFile(binaryTestFile1);
                    cb({ hey: buf.buffer });
                });

            });
        });
        it('can receive ArrayBuffer in object', function (done) {
            ({ server, client } = getCsSet());
            server.on('connection', function (socket) {
                socket.on(eventName, (data) => {
                    Promise.all([fs.readFile(binaryTestFile1), fs.readFile(binaryTestFile2)])
                        .then(([buffer1, buffer2]) => {
                            buffer1.should.deep.equal(data.a);
                            buffer2.should.deep.equal(data.b.c);
                            done();
                        });
                });
            });
            client.on('connect', function () {
                Promise.all([fs.readFile(binaryTestFile1), fs.readFile(binaryTestFile2)])
                    .then(([buffer1, buffer2]) => {
                        client.emit(eventName, { a: buffer1, b: { c: buffer2 } });
                    });
            });

        });
        it('can buffer parallel ArrayBuffer', function (done) {
            ({ server, client } = getCsSet());
            server.on('connection', function (socket) {
                socket.on("a", async (data, cb) => {
                    const buffer1 = await fs.readFile(binaryTestFile1);
                    buffer1.should.deep.equal(data);
                    cb(true);
                });
                socket.on("b", async (data, cb) => {
                    const buffer2 = await fs.readFile(binaryTestFile2);
                    buffer2.should.deep.equal(data);
                    cb(true);
                });
            });
            client.on('connect', function () {
                Promise.all([fs.readFile(binaryTestFile1), fs.readFile(binaryTestFile2)])
                    .then(([buffer1, buffer2]) => {
                        Promise.all([
                            new Promise(function (resolve) {
                                client.emitp("a", buffer1.buffer).then((result) => {
                                    result.should.equal(true);
                                    resolve();
                                });
                            }),
                            new Promise(function (resolve) {
                                client.emitp("b", buffer2.buffer).then((result) => {
                                    result.should.equal(true);
                                    resolve();
                                });
                                client.emitp("b", buffer2.buffer).then((result) => {
                                    result.should.equal(true);
                                    resolve();
                                });
                            }),
                        ]).then(() => done());
                    });
            });
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
        ({ server, client } = getCsSet());
        client.on('connect', () => {
            setImmediate(done);
        });
    });
    it('should receive verious types of data', function (done) {
        ({ server, client } = getCsSet());

        const event2data = JSON.parse(JSON.stringify(acceptedData));

        server.on('connection', function (socket) {
            for (const eventName in event2data) {
                socket.emit(eventName, event2data[eventName]);
            }
        });
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
        ({ server, client } = getCsSet());

        server.on('connection', function (socket) {
            socket.on(eventName, (data, cb) => {
                for (const i in data) {
                    data[i] *= 2;
                }
                cb(data);
            });
        });

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
    it('should receive first-connect event', function (done) {
        ({ server, client } = getCsSet());
        client.on('first-connect', done);
    });
    it('should receive reconnect event', function (done) {
        ({ server, client } = getCsSet());
        let server1;
        server.on('connection', function (socket) {
            socket.on('close', () => {
                setTimeout(() => {
                    socket.close();
                });
            });
        });
        client.on('connect', () => {
            client.emit('close');
        });
        client.on('reconnect', () => {
            setTimeout(() => {
                done();
            });
        });
    });
    it('can be closed', function (done) {
        ({ server, client } = getCsSet());

        server.on('connection', function (socket) {
            socket.on('disconnect', () => {
                done();
            });
        });
        client.on('connect', () => {
            setImmediate(() => client.close());
        });
    });
});
describe('coverage', function () {
    let server;
    let client;
    afterEach(() => {
        server && server.close();
        client && client.close();
        server = null;
        client = null;
    });
    it('has a safe server', function (done) {
        ({ server, client } = getCsSet());

        server.on('connection', function (socket) {
            socket.on('done', done);
        });
        client.on('connect', () => {
            client.ws.send(new ArrayBuffer([123]));
            client.ws.send('a');
            client.emit('done');
        });
    });
    it('server can refuses wrong arguments', function (done) {
        (function () {
            io("1");
        }).should.throw();
        (function () {
            io({});
        }).should.throw();
        done();
    });
});