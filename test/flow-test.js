const flow = require('../src/flow');
const assert = require('assert');
const describe = require('mocha').describe;
const it = require('mocha').it;
const sinon = require('sinon');

describe('flow.serial tests', function () {
    it('should call all functions once', function ()  {
        var spy1 = sinon.spy((cb) => {cb(null, 1);});
        var spy2 = sinon.spy((x, cb) => {cb(null, 1);});
        var cb = () => {};
        flow.serial([spy1, spy2], cb);
        assert(spy1.calledOnce, 'every function called once');
        assert(spy2.calledOnce, 'every function called once');
    });
    it('should call functions with result of previous', function (done) {
        var func1 = (cb) => {setTimeout(cb, 100, null, 1)};
        var func2 = (x, cb) => {cb(null, x+1);};
        var cb = (err, x) => {
            assert.equal(x, 2, 'result should be equal 2');
            done();
        };
        flow.serial([func1, func2], cb);
    });
    it('should call a callback function if error occurs', function () {
        var func = (cb) => {cb(1);};
        var spy = sinon.spy((x, cb) => {cb(null, 1);});
        var cb = (err) => {
            assert.equal(err, 1, 'callback was not called')
        };
        flow.serial([func, spy], cb);
        assert.equal(spy.callCount, 0, 'other functions should not be called')
    });
    it('should return no error if there is no functions', function () {
        var cb = function (err) {
            assert.equal(err, null, 'callback was not called');
        };
        flow.serial([], cb);
    });
});

describe('flow.parallel tests', function ()  {
    it('should not shuffle results', function () {
        var func1 = (cb) => {cb(null, 'a');};
        var func2 = (cb) => {cb(null, 'b');};
        var cb =  (err, x) => {
            assert.deepEqual(x, ['a', 'b'], 'arrays should be equal')
        };
        flow.parallel([func1, func2], cb);
    });
    it('should call all functions once', function ()  {
        var spy1 = sinon.spy((cb) => {cb(null, 1);});
        var spy2 = sinon.spy((cb) => {cb(null, 1);});
        var cb = () => {};
        flow.parallel([spy1, spy2], cb);
        assert(spy1.calledOnce, 'every function called once');
        assert(spy2.calledOnce, 'every function called once');
    });
    it('should call a callback function if error occurs', function (done) {
        var func = (cb) => {setTimeout(cb, 100, 1)};
        var spy = sinon.spy((cb) => {cb(null, 1);});
        var cb = (err, x) => {
            assert.equal(err, 1, 'callback was not called');
            assert.notEqual(x, 1, 'callback was not called');
            done();
        };
        flow.parallel([func, spy], cb);
    });
    it('should return no error if there is no functions', function () {
        var cb = (err, res) =>{
            assert.equal(err, null, 'callback was called with error');
            assert.deepEqual(res, [], 'expected empty array');
        };
        flow.parallel([], cb);
    });
    it('should return result when all functions return results', function (done) {
        var f1 = (cb) => {setTimeout(cb, 100, null, 'f1')};
        var f2 = (cb) => {cb(null, 'f2')};
        flow.parallel([f1, f2], (err, res) => {
            assert.deepEqual(res, ['f1', 'f2'], 'arrays not equal');
            done();
        })
    });
});
describe('flow.map tests', function ()  {
    it('should not shuffle results', function () {
        var f = (e, cb) =>{cb(null, e + ' a');};
        var cb = (err, x) => {
            assert.deepEqual(x, ['x a', 'y a'], 'arrays should be equal')
        };
        flow.map(['x', 'y'], f, cb);
    });
    it('should return result when all functions return results', function (done) {
        var f = (e, cb) => {setTimeout(cb, Math.random() * 100, null, 'f' + e)};
        flow.map(['a', 'b', 'c'], f, (err, res) => {
            assert.deepEqual(res, ['fa', 'fb', 'fc'], 'arrays not equal');
            done();
        })
    });

});