var copy = require('./copy-primitive');
var isArray = require('util').isArray;

function merge(a, b, depth) {
    var result;
    var depth = depth || 100;
    --depth;
    if (isArray(a) && isArray(b)) {

        result = [];
        result = result.concat(copy(a));
        result = result.concat(copy(b));
        return result;
    } else if (isArray(a)) {
        result = [];
        result.concat(copy(a));
        for (var i in b) {
            result[i] = copy(b);
        }

        return result;
    } else {
        result = {};
        result = copy(a);
        for (var prop in b) {
            if (result.hasOwnProperty(prop) && typeof b[prop] === 'object' && typeof a[prop] === 'object') {
                if (depth > 0) {
                    result[prop] = merge(result[prop], b[prop], depth);
                } else {
                    result[prop] = copy(b[prop]);
                }
            } else if (typeof b[prop] === 'object') {
                result[prop] = copy(b[prop]);
            } else {
                result[prop] = b[prop];
            }
        }
        return result;
    }
}

module.exports = merge;