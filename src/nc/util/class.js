function _isKeyword(string) {
    return string === 'extend' || string === 'static' || string === 'mixin' || string === 'typeOf';
}

function _rewriteStatics(fnc, statics) {
    for (var prop in statics) {
        if (_isKeyword(prop)) {
            continue;
        }
        //do not rewrite objects to statics
        if (typeof statics[prop] === 'object') {
            continue;
        }

        if (typeof statics[prop] === 'function') {
            fnc[prop] = statics[prop];
            continue;
        }

        //check if static is a constant
        if (prop === prop.toUpperCase()) {
            Object.defineProperty(fnc, prop, {
                writable: false,
                configurable: false,
                enumerable: true,
                value: statics[prop]
            });
        } else {
            fnc[prop] = statics[prop];
        }
    }
}

/**
 * Class helper
 * @param classConstructor
 * @returns Function
 * @private
 */
Class = function (classConstructor) {
    /**
     * New property is important to know whatever function was called
     * with new keyword or just by extend method, check line 48
     * @type {boolean}
     */
    classConstructor.new = true;

    return (function createClass(self, classConstructor) {

        var _mixins = [];

        if (typeof classConstructor !== 'function') {
            throw new Error('Class expect parameter to be a function');
        }

        //extend class
        if (self !== null) {
            self.new = false;
            classConstructor.new = false;

            classConstructor.prototype = new self;

            self.new = true;
            classConstructor.new = true;

            //rewrite statics
            _rewriteStatics(classConstructor, self);

        }
        //provide extending option in class
        classConstructor.extend = function (classBody) {
            var cls = createClass(this, classBody);
            cls.static = function(statics) {
                _rewriteStatics(cls, statics);
                return cls;
            };
            return cls;
        };

        //static handler
        classConstructor.static = function(statics) {
            _rewriteStatics(classConstructor, statics);
            return classConstructor;
        };

        classConstructor.mixin = function() {
            for (var i = 0, l = arguments.length; i < l; i++) {

                var mixin = arguments[i];

                if (typeof mixin === 'function') {
                    if (mixin.hasOwnProperty('new')) {
                        mixin.new = false;
                        var methods = new mixin;
                        mixin.new = true;
                    } else {
                        var methods = new mixin;
                    }
                } else if (typeof mixin === 'object') {
                    var methods = mixin;
                } else {
                    throw new Error('Class.mixin accepts only objects and functions - `' + (typeof mixin) + '` given');
                }



                for (var p in methods) {

                    if (_isKeyword(p)) {
                        continue;
                    }
                    classConstructor.prototype[p] = methods[p];
                }
                _mixins.push(mixin);
            }
            return classConstructor;
        };

        classConstructor.prototype.typeOf = function(object) {
            if (typeof object === 'object') {
                return _mixins.indexOf(object) >= 0;
            } else if (typeof object === 'function') {
                if (this instanceof object) {
                    return true;
                } else if (_mixins.indexOf(object) >= 0) {
                    return true;
                }
            }

            return false;
        };

        return classConstructor;
    })(null, classConstructor);
};

module.exports = Class;