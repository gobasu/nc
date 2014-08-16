var Module = require('../app/Module.js');
var util = require('../util');
var http = require('http');

var HTTPModule = Module.extend(function HTTPModule() {
    var self = this;

    self.ready = function() {
        console.log('http module ready');
    };

    if (HTTPModule.new) {
        self.init.apply(self, Array.prototype.slice.call(arguments, 1));
    }
});
module.exports = HTTPModule;