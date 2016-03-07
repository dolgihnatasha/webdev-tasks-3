'use strict';

function serial(func, cb) {
    if (checkFunctionArray(func)) {
        var index = 0;
        if (func.length > 0) {
            func[index](callback);
        } else {
            cb(null, null);
        }
    } else {
        cb(new Error('it\'s not an array of functions'))
    }
    function callback(err, data) {
        if (err) {
            cb(err);
        } else {
            index++;
            if (index === func.length) {
                cb(null, data);
            } else {
                func[index](data, callback);
            }
        }
    }
}

function checkFunctionArray(arr) {
    return arr instanceof Array && arr.every(function (f) {
        return f instanceof Function;
    });
}

function parallelCallback(index, cb) {
    var _this = this;
    return function (err, data) {
        if (err) {
            cb(err);
        }
        _this[index] = {value: data};
        if (full(_this)) {
            cb(null, unpackObjects(_this));
        }
    };
}

function parallel(func, cb) {
    if (checkFunctionArray(func)) {
        var result = new Array(func.length);
        func.forEach(function (f, i) {
            f(parallelCallback.call(result, i, cb));
        });
    } else {
        cb(null, null);
    }
}

function map(array, func, cb) {
    var result = new Array(array.length);
    array.forEach(function (item, i) {
        func(item, parallelCallback.call(result, i, cb));
    });
}

function full(array) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] === undefined) {
            return false;
        }
    }
    return true;
}

function unpackObjects(array) {
    return array.map(function (item) {
        return item.value;
    });
}


exports.serial = serial;
exports.parallel = parallel;
exports.map = map;
