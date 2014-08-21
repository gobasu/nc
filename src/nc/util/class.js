var Class = (function() {

    function _rewriteStatics(fnc, statics) {

        for (var prop in statics) {
            if (prop === 'extend' || prop === 'static' || prop === 'typeOf' || prop === 'mixin' ) {
                continue;
            }

            if (typeof statics[prop] === 'object' || typeof statics[prop] === 'function') {
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
                Object.defineProperty(fnc.prototype, prop, {
                    writable: false,
                    configurable: false,
                    enumerable: true,
                    value: statics[prop]
                });
            } else {
                Object.defineProperty(fnc, prop, {
                    get: function() {
                        return statics[prop]
                    },
                    set: function(val) {
                        statics[prop] = val;
                    }
                });
                Object.defineProperty(fnc.prototype, prop, {
                    get: function() {
                        return statics[prop]
                    },
                    set: function(val) {
                        statics[prop] = val;
                    }
                });
            }
        }
    }

    function _extend(base, source, overrideConstructor) {
        overrideConstructor = overrideConstructor || false;

        for (var p in source) {
            if ((p === 'create' && !overrideConstructor) || p === 'typeOf' || p === 'mixin' || p === 'static' || p === 'extend') {
                continue;
            }
            base[p] = source[p];
        }
    }

    return function (classBody) {

        var _preventCreateCall = false;

        return (function createClass(self, classBody) {

            var _mixins = [];
            var instance;

            var isSingleton = classBody.hasOwnProperty('singleton') && classBody.singleton;

            var classConstructor = function () {
                //apply constructor pattern
                if (typeof this['create'] === 'function' && _preventCreateCall === false) {
                    this.create.apply(this, arguments);
                }

                if (isSingleton && typeof this !== 'undefined') {
                    throw new Error('Singleton object cannot have more than one instance, call instance method instead');
                }
            };

            //make new class instance of extended object
            if (self !== null) {
                _preventCreateCall = true;
                classConstructor.prototype = new self();
                _preventCreateCall = false;
            }

            var classPrototype = classConstructor.prototype;

            classPrototype.typeOf = function(cls) {
                if (typeof cls === 'object') {
                    return _mixins.indexOf(cls) >= 0;
                } else if (typeof cls === 'function') {
                    if (this instanceof cls) {
                        return true;
                    } else if (_mixins.indexOf(cls) >= 0) {
                        return true;
                    }
                }

                return false;
            };
            if (typeof classBody === 'function') {
                classBody = classBody();
            }

            _extend(classPrototype, classBody, true);

            /**
             * Defines statics and constans in class' body.
             *
             * @param {Object} statics
             * @returns {Function}
             */
            classConstructor.static = function(statics) {
                _rewriteStatics(classConstructor, statics);
                return classConstructor;
            };

            /**
             * Extends class body by passed other class declaration
             * @param {Function} *mixins
             * @returns {Function}
             */
            classConstructor.mixin = function() {
                for (var i = 0, l = arguments.length; i < l; i++) {
                    //check if class implements interfaces
                    var mixin = arguments[i];

                    if (typeof mixin === 'function') {
                        var methods = mixin.prototype;
                    } else if (typeof mixin === 'object') {
                        var methods = mixin;
                    } else {
                        throw new Error('js.class mixin method accepts only types: object, function - `' + (typeof mixin) + '` type given');
                    }
                    _extend(classPrototype, methods, false);
                    _mixins.push(mixin);
                }
                return classConstructor;
            };

            /**
             * Creates and returns new constructor function which extends
             * its parent
             *
             * @param {Object} classBody
             * @returns {Function}
             */
            if (isSingleton) {
                classConstructor.extend = function() {
                    throw new Error('Singleton class cannot be extended');
                };

                classConstructor.instance = function() {
                    if (!instance) {
                        isSingleton = false;
                        instance = new classConstructor();
                        isSingleton = true;
                    }
                    return instance;
                }

            } else {
                classConstructor.extend = function (classBody) {
                    return createClass(this, classBody);
                };
            }

            return classConstructor;
        })(null, classBody);
    }
})();
module.exports = Class;