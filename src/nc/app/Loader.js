var util = require('../util');
var path = require('path');
var fs = require('fs');

var Loader = util.Class({
    create: function(app) {
        this.app = app;
        this.modules = {};
    },
    /**
     * Loads user's application modules located in %APPDIR%/modules directory
     */
    load: function() {
        console.log("===============================");
        console.log("= Loading application modules =");
        console.log("===============================");
        var modulesDir = path.join(this.app.dir(), 'modules');

        if (!fs.existsSync(modulesDir)) {
            throw new Error('App\'s modules dir does not exists');
        }

        var moduleList = fs.readdirSync(modulesDir);

        for (var i in moduleList) {
            var name = moduleList[i];
            var modulePath = path.join(modulesDir, name, 'index.js');
            if (!fs.existsSync(modulePath)) {
                console.warn("Module " + name + " could not be loaded - missing index.js file");
                continue;
            }
            console.warn("Module " + name + " loaded");
            var ModuleClass = require(modulePath);
            this.app.modules[name] = new ModuleClass(this.app);
            this.app.modules[name].controllers = {};
            this.app.modules[name].__dirname__ = path.join(modulesDir, name);

            //load controllers
            console.log("Loading " + name + " controllers...");
            var controllersDir = path.join(modulesDir, name, 'controllers');
            if (!fs.existsSync(controllersDir)) {
                console.log("Loaded controllers [] - missing controllers dir");
                continue;
            }
            var controllerList = fs.readdirSync(controllersDir);
            for (var c in controllerList) {
                var controllerFilename = controllerList[c];
                var controllerName = controllerFilename.substring(0, controllerFilename.indexOf('.')).toLowerCase();
                console.log("    - " + controllerFilename + ' as - ' + controllerName);
                var ControllerClass = require(path.join(controllersDir, controllerFilename));
                this.app.modules[name].controllers[controllerName] = new ControllerClass(this);
                this.app.modules[name].controllers[controllerName].__dirname__ = path.join(modulesDir, name);
            }
            this.app.modules[name].run();
        }
    }
});

module.exports = Loader;