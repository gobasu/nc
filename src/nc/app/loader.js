var util = require('../util');
var path = require('path');
var fs = require('fs');

var Loader = util.Class({
    create: function(app) {
        this.app = app;
    },
    /**
     * Loads user's application controllers located in %APPDIR%/controllers directory
     */
    load: function() {

        console.log("Loading controllers");
        console.log("  |");

        var controllersDir = path.join(this.app.dir(), 'controllers');

        if (!fs.existsSync(controllersDir)) {
            throw new Error('Controllers dir does not exists in ' + this.app.dir());
        }

        var controllersList = fs.readdirSync(controllersDir);

        for (var i in controllersList) {
            var name = controllersList[i];
            var controllerFilename = path.join(controllersDir, name);
            var controllerName = name.substring(0, name.lastIndexOf('.')).toLowerCase();
            this.app.controllers[controllerName] = require(controllerFilename);
            console.log('  +- ' + name );
        }
        console.log('  *');
    }
});

module.exports = Loader;