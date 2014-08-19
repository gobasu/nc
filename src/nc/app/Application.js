var util = require('../util');
var fs = require('fs');
var path = require('path');
var Extension = require('./Extension');

var _appDir;
var _mediator;

/**
 * Loads configs from {appdir}/config directory and merges them into
 * one config literal object
 * @private
 */
function _loadConfig() {
    var configDir = path.join(this.dir(), 'config');
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
 * Loads all core extensions
 * @private
 */
function _loadExtensions() {
    var loadedExtensions = [];
    var awaitingExtensions = [];

    var extensionsDir = path.join(Application.FW_DIR, 'extensions');
    var extensionList = fs.readdirSync(extensionsDir);

    var loading = true;
    var app = this;


    function _resolveDependencies(name) {
        if (awaitingExtensions.length === 0) {
            return;
        }

        for (var i in awaitingExtensions) {
            var extension = awaitingExtensions[i];

            if (extension._dependencies.indexOf(name) >= 0) {
                util.collection.remove(extension._dependencies, name);

                if(extension._dependencies.length === 0) {
                    console.log('Extension ' + extension._name + ' ready');
                    extension.ready();
                    util.collection.remove(awaitingExtensions, extension);
                    if (awaitingExtensions.length > 0) {
                        _resolveDependencies(extension._name);
                    }
                }
            }
        }

        if (!loading) {
            app.mediator().dispatch(Application.ON_READY, this);
        }
    }

    for (var m in extensionList) {
        var name = extensionList[m];
        var extensionPath = path.join(extensionsDir, name, 'index.js');
        if (!fs.existsSync(extensionPath)) {
            console.warn('Extension ' + name + ' was not loaded - missing index.js file');
            continue;
        }

        var ExtensionClass = require(extensionPath);

        if (this.config.hasOwnProperty(name)) {

            var config = util.merge(ExtensionClass.defaults, this.config[name])
        } else {
            var config = util.copy(ExtensionClass.defaults) || {};
        }

        if (typeof ExtensionClass !== 'function') {
            console.warn('Extension ' + name + ' not loaded - Extension declaration must extend Extension class');
            continue;
        }

        this.extensions[name] = new ExtensionClass(this, config);
        if (!this.extensions[name] instanceof Extension) {
            delete this.extensions[name];
            console.warn('Extension ' + name + ' not loaded - Extension declaration must extend Extension class');
            continue;
        }

        this.extensions[name].__name = name;

        console.log('Extension ' + name + ' loaded');

        if (Array.isArray(ExtensionClass['dependencies']) && ExtensionClass.dependencies.length > 0) {
            this.extensions[name].__dependencies = util.copy(ExtensionClass.dependencies);
            awaitingExtensions.push(this.extensions[name]);
            continue;
        }
        console.log('Extension ' + name + ' ready');
        this.extensions[name].ready();
        loadedExtensions.push(name);
        _resolveDependencies(name);
    }
    if (awaitingExtensions.length === 0) {
        this.mediator().dispatch(Application.ON_READY, this);
    }
    loading = false;
}

var Application = util.Class({
    singleton: true,
    create: function() {
        console.log('create application');
        _mediator = new util.Observer();
        this.config = {};
        this.extensions = {};
        this.modules = {};
        this.load = {};
        this._errorHandler = function(e) {throw e};

    },
    dir: function (dir) {
        if (dir) {
            _appDir = dir;
        }
        return _appDir;
    },
    mediator: function() {

        return _mediator;
    },
    use: function() {

    },
    run: function() {
        if (!fs.existsSync(this.dir())) {
            throw new Error('Non existing application dir.' + this.dir() + ' Make sure you set up application dir correctly.');
        }

        this.mediator().dispatch(Application.ON_INIT, this);

        //load config
        _loadConfig.call(this);

        //load extensions
        _loadExtensions.call(this);

        this.mediator().dispatch(Application.ON_RUN, this);
    },
    /**
     * Sets/gets error handler
     */
    error: function(handler) {
        if (handler) {
            this._errorHandler = handler;
        }
        return this._errorHandler;
    }
}).static({
    ON_RUN: 'onApplicationRun',
    ON_INIT: 'onApplicationInit',
    ON_READY: 'onApplicationReady',
    FW_DIR: path.resolve(path.join(__dirname, '..')),
    ON_NOT_FOUND: 'onNotFound',
    ON_ERROR: 'onError'
});

module.exports = Application;