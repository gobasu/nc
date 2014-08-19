var util = require('../util');
var Application = require('./Application');

var Extension = util.Class({
    create: function(app, config) {
        this.app = app;
        this.config = config;
    },
    path: function(string) {
        string = string.replace('%APPDIR%', this.app.dir());
        string = string.replace('%FWDIR%', Application.FW_DIR);
        return string;
    },
    ready: function() {
        throw new Error('Extension must implement ready method');
    }
});

module.exports = Extension;