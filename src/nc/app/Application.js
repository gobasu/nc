var util = require('../util');
var fs = require('fs');
var path = require('path');
var Extension = require('./Extension');
var Loader = require('./Loader');

var _appDir;
var _mediator;


function _onApplicationReady() {
    this.loader = new Loader(this);
    this.loader.load();
}

/**
 * Loads configs from {%APPDIR%}/config directory and merges them into
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
    var readyExtensions = [];
    var loadedExtensions = [];
    var awaitingExtensions = [];

    var extensionsDir = path.join(Application.FW_DIR, 'extensions');
    var extensionList = fs.readdirSync(extensionsDir);

    var app = this;
    var onReadyDispatched = false;
    var listing = true;

    app.mediator().addListener(Application.ON_READY, function clearOnExtensionReadyListeners() {
        awaitingExtensions = [];
        app.mediator().removeListener(Extension.ON_READY);
        _onApplicationReady.call(app);
    });

    app.mediator().addListener(Extension.ON_READY, function addLoadedExtendionToList(event, extension) {
        readyExtensions.push(extension.__name__);
    });


    function _onExtensionReadyHandler(event, ext) {
        for (var i in awaitingExtensions) {
            var extension = awaitingExtensions[i];
            var shouldRun = true;
            for (var d in extension.__dependencies__) {
                if (readyExtensions.indexOf(extension.__dependencies__[d]) < 0) {
                    shouldRun = false;
                    break;
                }
            }
            if (shouldRun) {
                console.log("Running extension " + extension.__name__);
                util.collection.remove(awaitingExtensions, extension);
                extension.run();
                extension.ready();
            }
        }

        if (awaitingExtensions.length <= 0 && !listing && readyExtensions.length >= loadedExtensions.length) {
            onReadyDispatched = true;
            app.mediator().dispatch(Application.ON_READY);
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

        this.extensions[name].__name__ = name;

        console.log('Extension ' + name + ' loaded');
        loadedExtensions.push(name);

        if (Array.isArray(ExtensionClass['dependencies']) && ExtensionClass.dependencies.length > 0) {
            this.extensions[name].__dependencies__ = util.copy(ExtensionClass.dependencies);
            awaitingExtensions.push(this.extensions[name]);
            app.mediator().addListener(Extension.ON_READY, _onExtensionReadyHandler.bind(this.extensions[name]));
            continue;
        }

        var dispatch = this.extensions[name].run();

        if (!ExtensionClass.hasOwnProperty('async') || !ExtensionClass.async) {
            console.log('Extension ' + name + ' ready');
            this.extensions[name].ready();
        }
    }
    listing = false;
    if (awaitingExtensions.length === 0 && readyExtensions.length >= loadedExtensions) {
        this.mediator().dispatch(Application.ON_READY, this);
        onReadyDispatched = true;
    }

    /**
     * Checks if application on ready was called if not stops
     * the application.
     */
    setTimeout(function checkIfApplicationIsReady(){
        if (!onReadyDispatched) {
            throw new Error("Could not run application. Loading extensions timed up");
        }
    }, 2000);

}

var Application = util.Class({
    singleton: true,
    create: function() {
        _mediator = new util.Observer();
        this.config = {};
        this.extensions = {};
        this.modules = {};
        this.load = {};
        this._errorHandler = function(e) {throw e};

    },
    /**
     * Sets/Gets application's dir
     * @param {String} dir
     * @returns {*}
     */
    dir: function (dir) {
        if (dir) {
            _appDir = dir;
        }
        return _appDir;
    },
    /**
     * Gets application's mediator
     * @returns {*}
     */
    mediator: function() {

        return _mediator;
    },
    /**
     * @todo: implement better extension support
     */
    use: function() {

    },
    /**
     * Starts the application, load extensions, load modules
     * and handles input
     */
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
     * Sets/gets error handler.
     * Handler will be called when application's module will throw an Error
     * @param {Function} handler
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