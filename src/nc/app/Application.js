var util = require('../util');
var fs = require('fs');
var path = require('path');

/**
 * Application Instance
 * @type Application
 */
var _instance;

var Application = util.Observer.extend(function Application() {
    var self = this;
    var parent = Application.prototype;
    var _mediator = new util.Observer();
    var _appDir;


    self.config = {};
    self.modules = {};

    /**
     * Loads configs from {appdir}/config directory and merges them into
     * one config literal object
     * @private
     */
    function _loadConfig() {
        var configDir = path.join(this.getAppDir(), 'config');
        if (!fs.existsSync(configDir)) {
            throw new Error('Make sure config dir do exists in your application path');
        }
        var configList = fs.readdirSync(configDir);


        for (var i in configList) {
            var configFile = path.join(configDir, configList[i]);
            try {
                var config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
            } catch (e) {
                throw new Error('Could not read config file :' + configFile + "\n" + e.message);
            }
            this.config = util.merge(this.config, config);
        }
    }

    /**
     * Loads all core modules
     * @private
     */
    function _loadModules() {
        var loadedModules = [];
        var awaitingModules = [];

        var modulesDir = path.join(Application.FW_DIR, 'modules');
        var moduleList = fs.readdirSync(modulesDir);


        function _resolveDependencies(name) {
            if (awaitingModules.length === 0) {
                return;
            }

            for (var i in awaitingModules) {
                var module = awaitingModules[i];

                if (module._dependencies.indexOf(name) >= 0) {
                    util.collection.remove(module._dependencies, name);

                    if(module._dependencies.length === 0) {
                        console.log('Module ' + module._name + ' ready');
                        module.ready();
                        _resolveDependencies(module._name);
                    }
                }
            }
        }

        for (var m in moduleList) {
            var name = moduleList[m];
            var modulePath = path.join(modulesDir, name, 'module.js');
            if (!fs.existsSync(modulePath)) {
                console.warn('Module ' + name + ' was not loaded - missing module.js file');
                continue;
            }
            try {
                var meta = require(path.join(modulesDir, name, 'index.js'));
            } catch (e) {
                throw new Error('Module\'s meta file is not readable');
            }

            var module = require(modulePath);

            if (self.config.hasOwnProperty(name)) {
                var config = util.merge(meta.config, self.config[name])
            } else {
                var config = meta.config;
            }
            self.modules[name] = new module(self, config);
            self.modules[name]._name = name;

            console.log('Module ' + name + ' loaded');

            if (meta.hasOwnProperty('dependencies') && meta.dependencies.length > 0) {
                self.modules[name]._dependencies = meta.dependencies;
                awaitingModules.push(self.modules[name]);
                continue;
            }
            console.log('Module ' + name + ' ready');
            self.modules[name].ready();
            loadedModules.push(name);
            _resolveDependencies(name);
        }
    }

    self.init = function() {
        //call parent's constructor
        parent.init.apply(self);

    };

    self.getMediator = function() {
        return _mediator;
    };

    self.setAppDir = function(dir) {
        _appDir = dir;
    };

    self.getAppDir = function() {
        return _appDir;
    };


    self.run = function() {
        if (!fs.existsSync(self.getAppDir())) {
            throw new Error('Non existing application dir. Make sure you set up application dir correctly.');
        }

        self.dispatch(Application.ON_INIT, self);

        //load config
        _loadConfig.call(self);

        //load modules
        _loadModules.call(self);

        //init modules


        self.dispatch(Application.ON_RUN, self);
    };


    if (Application.new) {
        throw new Error('Could not create instance of Application call Application.instance instead');
    }
}).static({
    ON_RUN: 'onApplicationRun',
    ON_INIT: 'onApplicationInit',
    FW_DIR: path.resolve(path.join(__dirname, '..')),
    instance: function() {
        Application.new = false;
        if (!(_instance instanceof Application)) {
            _instance = new Application();
            _instance.init();
        }
        Application.new = true;
        return _instance;
    }
});

module.exports = Application;