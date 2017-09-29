const httpServer = require('http').Server;
const io = require('../server');
const ioc = require('../client');
const chai = require('chai');

const testPost=23033;

chai.should();
describe('establish', function () {
    it('should be established with a port', function () {
        (()=>io(testPost, {
            path: '/test',
            serveClient: false,
        })).should.not.throw();
    });
    it('should be established with a http server', function () {
        (()=>io(httpServer(), {
            path: '/test',
            serveClient: false,
        })).should.not.throw();
    });
});