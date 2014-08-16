var Module = require('../../app/Module.js');

var AModule = Module.extend(function AModule() {
    var self = this;

    self.ready = function() {
        console.log('C module ready');
    };

    if (AModule.new) {
        self.init.apply(self, Array.prototype.slice.call(arguments, 1));
    }
});
module.exports = AModule;