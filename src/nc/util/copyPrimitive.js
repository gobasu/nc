var util = require('util');
var isLiteral = require('./isLiteralObject');

function copyPrimitive(object) {
    var copy;
    if (typeof object !== 'object') {
        return object;
    }

    if (isLiteral(object)) {
        copy = {};
        for (var property in object) {
            var result = copyPrimitive(object[property]);
            if (result !== undefined) {
                copy[property] = result;
            }
        }
        return copy;
    }

    if (util.isArray(object)) {
        copy = [];
        for (var i in object) {
            var result = copyPrimitive(object[i]);
            if (result !== undefined) {
                copy[i] = result;
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

    if (object === null) {
        return null;
    }
}

module.exports = copyPrimitive;