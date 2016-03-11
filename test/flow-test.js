const flow = require('../src/flow');
const assert = require('assert');
const describe = require('mocha').describe;
const it = require('mocha').it;
const sinon = require('sinon');

const FUNC = timeouted();

function timeouted (arg, err, res) {
    if (err == undefined) {
        err = null;
    }
    if (arg) {
        if (!(res instanceof Function)){
            res = (x) => 'f ' + x;
        }
        return (x, cb) => setTimeout(cb, randInt(50, 100), err, res(x));
    } else {
        if (res == undefined) {
            res = 1;
        }
        return (cb) => setTimeout(cb, randInt(50, 100), err, res);
    }
}

function randInt(from, to) {
    return Math.floor(Math.random() * (to - from) + from)
}

describe('flow.serial tests', function () {
    it('should call all functions once', function (done)  {
        var spy1 = sinon.spy(FUNC);
        var spy2 = sinon.spy(timeouted(true));
        var cb = () => {
                assert(spy1.calledOnce, 'every function called once');
                assert(spy2.calledOnce, 'every function called once');
                done();
            };
        flow.serial([spy1, spy2], cb);
    });
    it('should call functions in given order', function (done) {
        var spy1 = sinon.spy(FUNC);
        var spy2 = sinon.spy(timeouted(true));
        var cb = () => {
            assert(spy2.calledAfter(spy1), 'wrong order of calls');
            done();
        };
        flow.serial([spy1, spy2], cb);
    });
    it('should call functions with result of previous', function (done) {
        var func2 = timeouted(true);
        var cb = (err, x) => {
            assert.equal(x, 'f 1', 'result should be equal 2');
            done();
        };
        flow.serial([FUNC, func2], cb);
    });
    it('should call a callback function if error occurs', function (done) {
        var func = timeouted(false, 1);
        var spy = sinon.spy(timeouted(true));
        var cb = (err) => {
            assert.equal(err, 1, 'callback was not called');
            assert.equal(spy.callCount, 0, 'other functions should not be called');
            done();
        };
        flow.serial([func, spy], cb);
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
        var func1 = timeouted(false, null, 0);
        var cb =  (err, x) => {
            assert.deepEqual(x, [0, 1], 'arrays should be equal');
            done();
        };
        flow.parallel([func1, FUNC], cb);
    });
    it('should call all functions once', function (done)  {
        var spy1 = sinon.spy(FUNC);
        var spy2 = sinon.spy(FUNC);
        var cb = () => {
            assert(spy1.calledOnce, 'every function called once');
            assert(spy2.calledOnce, 'every function called once');
            done();
        };
        flow.parallel([spy1, spy2], cb);
    });
    it('should call a callback function if error occurs', function (done) {
        var f = timeouted(false, true);
        var spy = sinon.spy(FUNC);

        var cb = (err) => {
            if (err) {
                assert.equal(err, 1, 'callback was not called');
                done();
            }
        };
        flow.parallel([f, spy], cb);
    });
    it('should return no error if there is no functions', function () {
        var cb = (err, res) =>{
            assert.equal(err, null, 'callback was called with error');
            assert.deepEqual(res, [], 'expected empty array');
        };
        flow.parallel([], cb);
    });
    it('should return result when all functions return results', function (done) {
        var f1 = timeouted(false, null, 0);
        flow.parallel([f1, FUNC], (err, res) => {
            assert.deepEqual(res, [0, 1], 'arrays not equal');
            done();
        })
    });
});
describe('flow.map tests', function ()  {
    it('should not shuffle results', function (done) {
        var f = timeouted(true, null, (x) => (x + ' a'));
        var cb = (err, x) => {
            assert.deepEqual(x, ['x a', 'y a'], 'arrays should be equal');
            done()
        };
        flow.map(['x', 'y'], f, cb);
    });
    it('should return result when all functions return results', function (done) {
        var f = timeouted(true, null, (x) => ('f' + x));
        flow.map([10, 20, -10], f, (err, res) => {
            assert.deepEqual(res, ['f10', 'f20', 'f-10'], 'arrays not equal');
            done();
        })
    });
});
