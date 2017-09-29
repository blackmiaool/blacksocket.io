const httpServer = require('http').Server;
const io = require('../server');
const ioc = require('../client');
const chai = require('chai');

const testPost = 23043;
const testPath = '/test';
chai.should();
describe('server', function () {
    it('should be established with a port', function () {
        (() => io(testPost, {
            path: '/test',
            serveClient: false,
        })).should.not.throw();
    });
    it('should be established with a http server', function () {
        (() => io(httpServer(), {
            path: testPath,
            serveClient: false,
        })).should.not.throw();
    });
});
describe('client', function () {
    it('should be established with a port', function () {
        io.bind(undefined, testPost).should.not.throw();
    });
    it('should be established with a path', function () {
        io.bind(undefined, `:${testPost}/${testPath}`).should.not.throw();
    });
});