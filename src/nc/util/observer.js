var util = require('util');
var Class = require('./class');
var EventEmitter = require('events').EventEmitter;

var Observer = Class({

    /**
     * @constructor
     */
    create: function() {
        this._emitter = new EventEmitter();
    },
    /**
     * Attach listener to given event or events
     *
     * @param {string|Array} event
     * @param {function} listener
     * @memberOf nc.Observer
     */
    addListener: function(event, listener) {
        if (util.isArray(event)) {
            for (var i in event) {
                var e = event[i];
                this._emitter.addListener(e, listener);
            }
            return this;
        }
        this._emitter.addListener(event, listener);
        return this;
    },
    /**
     * Removes listener(s) at given event or events
     *
     * @param {string|Array} event
     * @param {function} listener
     * @memberOf nc.Observer
     */
    removeListener: function(event, listener) {
        if (typeof listener === 'undefined') {
            this._emitter.removeAllListeners(event);
            return this;
        }
        if (util.isArray(event)) {
            for (var i in event) {
                var e = event[i];
                this._emitter.removeListener(e, listener);
            }
            return this;
        }
        this._emitter.removeListener(event, listener);
        return this;
    },
    /**
     * Dispatches an event
     *
     * @param {string} event
     * @memberOf nc.Observer
     */
    dispatch: function() {
        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift(args[0]);

        return this._emitter.emit.apply(this._emitter, args);
    },
    /**
     * Checks whatever given listener listens for an event
     *
     * @param {string} event
     * @param {function} listener
     * @return {boolean} true if event has listener otherwise false
     * @memberOf nc.Observer
     */
    hasListener: function(event, listener) {
        var listeners = this._emitter.listeners(event);

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
    }


});

module.exports = Observer;