const flow = require('../src/flow');
const assert = require('assert');
const describe = require('mocha').describe;
const it = require('mocha').it;
const sinon = require('sinon');

describe('flow.serial tests', function () {
    it('should call all functions once', function (done)  {
        var spy1 = sinon.spy((cb) => {setTimeout(cb, 100, null, 1)});
        var spy2 = sinon.spy((x, cb) => {setTimeout(cb, 90, null, 1)});
        var cb = () => {
                assert(spy1.calledOnce, 'every function called once');
                assert(spy2.calledOnce, 'every function called once');
                done();
            };
        flow.serial([spy1, spy2], cb);
    });
    it('should call functions in given order', function (done) {
        var spy1 = sinon.spy((cb) => {setTimeout(cb, 100, null, 1)});
        var spy2 = sinon.spy((x, cb) => {setTimeout(cb, 90, null, 1)});
        var cb = () => {
            assert(spy2.calledAfter(spy1), 'wrong order of calls');
            done();
        };
        flow.serial([spy1, spy2], cb);
    });
    it('should call functions with result of previous', function (done) {
        var func1 = (cb) => {setTimeout(cb, 75, null, 1)};
        var func2 = (x, cb) => {setTimeout(cb, 50, null, x+1);};
        var cb = (err, x) => {
            assert.equal(x, 2, 'result should be equal 2');
            done();
        };
        flow.serial([func1, func2], cb);
    });
    it('should call a callback function if error occurs', function () {
        var func = (cb) => {setTimeout(cb, 100, 1)};
        var spy = sinon.spy((x, cb) => {setTimeout(cb, 85, null, 1)});
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
    it('should not shuffle results', function (done) {
        var func1 = (cb) => {setTimeout(cb, 100, null, 'a')};
        var func2 = (cb) => {setTimeout(cb, 100, null, 'b')};
        var cb =  (err, x) => {
            assert.deepEqual(x, ['a', 'b'], 'arrays should be equal');
            done();
        };
        flow.parallel([func1, func2], cb);
    });
    it('should call all functions once', function (done)  {
        var spy1 = sinon.spy((cb) => {setTimeout(cb, 50, null, 1);});
        var spy2 = sinon.spy((cb) => {setTimeout(cb, 100, null, 1);});
        var cb = () => {
            assert(spy1.calledOnce, 'every function called once');
            assert(spy2.calledOnce, 'every function called once');
            done();
        };
        flow.parallel([spy1, spy2], cb);
    });
    it('should call a callback function if error occurs', function (done) {
        var func = (cb) => {setTimeout(cb, 100, 1)};
        var spy = sinon.spy((cb) => {setTimeout(cb, 50, null, 1);});
        var cb = (err) => {
            if (err) {
                assert.equal(err, 1, 'callback was not called');
                done();
            }
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
        var f2 = (cb) => {setTimeout(cb, 40, null, 'f2')};
        flow.parallel([f1, f2], (err, res) => {
            assert.deepEqual(res, ['f1', 'f2'], 'arrays not equal');
            done();
        })
    });
});
describe('flow.map tests', function ()  {
    it('should not shuffle results', function () {
        var f = (e, cb) =>{setTimeout(cb, 50, null, e + ' a');};
        var cb = (err, x) => {
            assert.deepEqual(x, ['x a', 'y a'], 'arrays should be equal')
        };
        flow.map(['x', 'y'], f, cb);
    });
    it('should return result when all functions return results', function (done) {
        var f = (e, cb) => {setTimeout(cb, 90 + e, null, 'f' + e)};
        flow.map([10, 20, -10], f, (err, res) => {
            assert.deepEqual(res, ['f10', 'f20', 'f-10'], 'arrays not equal');
            done();
        })
    });
});
