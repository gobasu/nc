var util = require('../util');
var fs = require('fs');
var path = require('path');
var View = require('./View');

var Controller = util.Class({
    create: function(module) {
        this.module = module;
        this.views = {};
    },
    view: function(name) {
        if (!this.views.hasOwnProperty(name)) {
            this.views[name] = new View(this.dirname, name);
        }
        return this.views[name];
    }

});

module.exports = Controller;