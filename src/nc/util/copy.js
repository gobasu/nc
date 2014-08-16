var util = require('util');

function _copy(object, depth) {
    var copy;
    var depth = depth === undefined ? 100 : depth;//max dept is 100
    --depth;

    if (typeof object !== 'object' || object === null) {
        copy = object;
        return copy;
    }

    if (util.isArray(object)) {
        copy = [];
        for (var i = 0, l = object.length; i < l; i++) {
            if (typeof object[i] === 'object') {
                if (depth > 0) {
                    copy[i] = _copy(object[i], depth);
                }
            } else {
                copy[i] = object[i];
            }
        }
        return copy;
    }

    if (util.isDate(object)) {
        return new Date(object.getTime());
    }

    if (util.isRegExp(object)) {
        return new RegExp(object.source);
    }

    copy = new object.constructor();

    for (var property in object) {
        if (!object.hasOwnProperty(property)) {
            continue;
        }

        if (typeof object[property] === 'object' && object[property] !== null) {
            if (depth > 0) {
                copy[property] = _copy(object[property], depth);
            }
        } else {
            copy[property] = object[property];
        }
    }
    return copy;
}


module.exports = _copy;