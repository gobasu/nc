var util = require('../util');

var Controller = util.Class({
    create: function(module) {
        this.module = module;
    }
});

module.exports = Controller;