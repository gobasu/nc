var util = require('../util');
var Application = require('./Application');

var Module = util.Class({
    create: function(app) {
        this.app = app;

    },
    path: function(string) {
        string = string.replace('%APPDIR%', this.app.dir());
        string = string.replace('%FWDIR%', Application.FW_DIR);
        return string;
    }
});

module.exports = Module;