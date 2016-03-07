const flow = require('../src/flow');
const assert = require('assert');
var describe = require('mocha').describe;
var it = require('mocha').it;
var sinon = require('sinon');


describe('flow.serial tests', function ()  {
    it('should not work with wrong input', function () {
        flow.serial(['foo', 'bar'], function (err) {
            assert(err instanceof Error, 'returned error');
        });
    });
    it('should call all functions once', function ()  {
        var spy1 = sinon.spy(function (cb) {cb(null, 1);});
        var spy2 = sinon.spy(function (x, cb) {cb(null, 1);});
        var cb = function (err, x) {};
        flow.serial([spy1, spy2], cb);
        assert(spy1.calledOnce, 'every function called once');
        assert(spy2.calledOnce, 'every function called once');
    });
    it('should call functions with result of previous', function () {
        var func1 = function (cb) {cb(null, 1);};
        var func2 = function (x, cb) {cb(null, x+1);};
        var cb = function (err, x) {
            assert.equal(x, 2, 'result should be equal 2')
        };
        flow.serial([func1, func2], cb);
    });
    it('should call a callback function if error occurs', function () {
        var func = function (cb) {cb(1);};
        var spy = sinon.spy(function (x, cb) {cb(null, 1);});
        var cb = function (err) {
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
    it('should ', function () {

    });
});

