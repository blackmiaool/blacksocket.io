const io = require('../server');
const ioc = require('../lib/client');
const path = require("path");
const testPort = 23045;
const testPath = '/test';
const binaryTestFile1 = path.join(__dirname, 'binary-test1.jpg');
const binaryTestFile2 = path.join(__dirname, 'binary-test2.jpg');

const eventName = 'an event';

function getServerWithPort() {
    return io(testPort, {
        path: testPath,
    });
}

function getClientWithPort() {
    return ioc(`:${testPort}${testPath}`, {
        reconnectionDelayMax: 10
    });
}
module.exports = {
    io,
    ioc,
    testPort,
    testPath,
    binaryTestFile1,
    binaryTestFile2,
    eventName,
    getServerWithPort,
    getClientWithPort
}
