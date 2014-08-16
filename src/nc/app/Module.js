var util = require('../util');

var Module = util.Class(function Module(app) {
    var self = this;
    var _config;
    var _app = app;

    self.init = function() {

    };

    /**
     * Gets module config
     */
    self.config = function() {
        if (_config === null) {
            _config = _app.config(self.name);
        }
    };


    /**
     * Bind on ready callback when all dependencies are loaded
     * and module is ready to be executed
     */
    self.ready = function() {

    };

    if (Module.new) {
        self.init.apply(self, Array.prototype.slice.call(arguments, 1));
    }

});

module.exports = Module;