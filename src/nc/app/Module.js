var util = require('../util');

var Module = util.Class(function Module(app, config) {
    var self = this;

    self.init = function(app, config) {
        self.app = app;
        self.config = config;
    };


    /**
     * Bind on ready callback when all dependencies are loaded
     * and module is ready to be executed
     */
    self.ready = function() {

    };

    if (Module.new) {
        self.init(app, config);
    }

});

module.exports = Module;