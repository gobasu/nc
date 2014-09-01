var util = require('../util');
var fs = require('fs');
var path = require('path');
var View = require('./view');

var Controller = util.Class({
    create: function(app) {
        this.app = app;
        this._theme = app.config.app.theme;
    },
    /**
     * Loads view from previously selected theme
     */
    view: function(name) {
        this.views = this.views || {};
        if (!this.views.hasOwnProperty(name)) {
            this.views[name] = new View(name);
        }
        return this.views[name]
    },
    get theme() {
        return this._theme;
    },
    set theme(name) {
        var dir = this.app.path(path.join('%APPDIR%', 'themes', name));
        View.dir(dir);
        this._theme = name;
        this.app.config.app.theme = name;
    },
    model: function(name) {
        return this.app.db.hasOwnProperty(name) ? this.app.db[name] : null;
    }
});

module.exports = Controller;