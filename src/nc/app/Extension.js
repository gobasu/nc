var util = require('../util');
var Application = require('./Application');

var Extension = util.Class({
    create: function(app, config) {
        this.app = app;
        this.mediator = app.mediator();
        this.config = config;
    },
    path: function(string) {
        string = string.replace('%APPDIR%', this.app.dir());
        string = string.replace('%FWDIR%', Application.FW_DIR);
        return string;
    },
    run: function() {
        throw new Error('Extension must implement run method');
    },
    dispatch: function(event) {
        this.mediator.dispatch.apply(this.mediator, arguments);
    },
    ready: function() {
        this.mediator.dispatch.apply(this.mediator, [Extension.ON_READY, this]);
    }
}).static({
    ON_READY: 'onExtensionReady'
});

module.exports = Extension;