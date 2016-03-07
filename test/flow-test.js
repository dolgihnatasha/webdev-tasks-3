const flow = require('../src/flow');
const assert = require('assert');
var describe = require('mocha').describe;
var it = require('mocha').it;
var sinon = require('sinon');

describe('flow.serial tests', () => {
    it('should call all functions', () => {
        var spy1 = sinon.spy(() => {return 1});
        var spy2 = sinon.spy((x) => {return x+1});
        var cbSpy = sinon.spy((x) => {console.log(x);return x * x});
        assert.equal(flow.serial([spy1, spy2], cbSpy), 4, 'should return 4');
        spy1.calledOnce.should.be.true;
        spy2.calledOnce.should.be.true;
        cbSpy.calledOnce.should.be.true;
    })
});

