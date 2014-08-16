var util = require('util');
var Class = require('./class');
var EventEmitter = require('events').EventEmitter;

/**
 * Observer Class utilizes the pattern
 *
 * @constructor
 */
var Observer = Class(function Observer() {
    var self = this;
    var _emitter;

    /**
     * @constructor
     */
    self.init = function() {
        _emitter = new EventEmitter();
    };

    /**
     * Attach listener to given event or events
     *
     * @param {string|Array} event
     * @param {function} listener
     * @memberOf nc.Observer
     */
    self.addListener = function(event, listener) {
        if (util.isArray(event)) {
            for (var i in event) {
                var e = event[i];
                _emitter.addListener(e, listener);
            }
            return this;
        }
        _emitter.addListener(event, listener);
        return this;
    };

    /**
     * Removes listener(s) at given event or events
     *
     * @param {string|Array} event
     * @param {function} listener
     * @memberOf nc.Observer
     */
    self.removeListener = function(event, listener) {

        if (util.isArray(event)) {
            for (var i in event) {
                var e = event[i];
                _emitter.removeListener(e, listener);
            }
            return this;
        }
        _emitter.removeListener(event, listener);
        return this;

    };

    /**
     * Dispatches an event
     *
     * @param {string} event
     * @memberOf nc.Observer
     */
    self.dispatch = function() {
        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift(args[0]);

        return _emitter.emit.apply(_emitter, args);
    };

    /**
     * Checks whatever given listener listens for an event
     *
     * @param {string} event
     * @param {function} listener
     * @return {boolean} true if event has listener otherwise false
     * @memberOf nc.Observer
     */
    self.hasListener = function(event, listener) {
        var listeners = _emitter.listeners(event);

        if (listeners.length === 0) {
            return false;
        }

        if (typeof listener === 'undefined') {
            return true;
        }

        for (var i in listeners) {
            if (listeners[i] === listener) {
                return true;
            }
        }
        return false;
    };

    //constructor
    if (Observer.new) {
        self.init();
    }

});

module.exports = Observer;