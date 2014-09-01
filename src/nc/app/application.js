//base stuff
var util = require('../util');
var fs = require('fs');
var path = require('path');
var Loader = require('./loader');
var View = require('./view');

//express + addons
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

//server handlers
var https = require('https');
var http = require('http');
var i18n = require('i18n');

/**
 * Creates simplyfied send API for controller
 * @param {Response} res express response object
 * @returns {{json: Function, html: Function, text: Function}}
 */
function createSendObject(res) {
    var send = {
        /**
         * Sends response as json
         * @param {Object} object
         * @param {Integer} status default 200 - OK
         */
        json: function(object, status) {
            var status = status || 200;
            res.set('Content-Type', 'application/json');
            res.status(status).send(JSON.stringify(object));
        },
        /**
         * Sends response as html
         * @param {String} html
         * @param {Integer} status default 200 - OK
         */
        html: function(html, status) {
            var status = status || 200;
            res.set('Content-Type', 'text/html');
            res.status(status).send(html);
        },
        /**
         * Sends response as plain text
         * @param {String} text
         * @param {Integer} status default 200 - OK
         */
        text: function(text, status) {
            var status = status || 200;
            res.set('Content-Type', 'text/plain');
            res.status(status).send(text);
        }
    };
    return send;
}

/**
 * Creates input API for controller
 * @param req
 * @returns {{get: Function, post: Function, param: Function}}
 */
function createInputObject(req) {
    var input = {
        /**
         * Gets get param
         * @param {String} name
         * @returns {*}
         */
        get: function(name) {
            return typeof req.query[name] !== 'undefined' ? req.query[name] : undefined;
        },
        /**
         * Gets post param
         * @param {String} name
         * @returns {*}
         */
        post: function(name) {
            return req.param(name);
        },
        /**
         * Gets request param
         * @param {String} name
         * @returns {*}
         */
        param: function(name) {
            return req.param(name);
        }
    };

    return input;
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
        if (fs.lstatSync(configFile).isDirectory()) {
            continue;
        }
        
        try {
            var config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
        } catch (e) {
            throw new Error('Could not read config file :' + configFile + "\n" + e.message);
        }
        this.config = util.merge(this.config, config);
    }
}

var Application = util.Class({
    create: function() {

        this.mediator = new util.Observer();
        this.config = {};
        this.controllers = {};

        this._onError = function(e) {throw e};
        this._onSuccess = function() {};
        this._appDir = process.cwd();
        this._express = express();
        this._router = express.Router();
    },
    /**
     * Sets/Gets application's main dir
     * @param {String} dir
     * @returns {*}
     */
    dir: function () {
        if (arguments.length >= 1) {
            this._appDir = arguments[0];
        }
        return this._appDir;
    },
    /**
     * Use express' middleware
     */
    use: function() {
        this._express.use.apply(this._express, arguments);
    },
    /**
     * Starts the application, server, loads modules
     *
     */
    run: function() {
        if (!fs.existsSync(this.dir())) {
            throw new Error('Non existing application dir.' + this.dir() + ' Make sure you set up application dir correctly.');
        }

        //load config
        console.log('Loading configuration...');
        _loadConfig.call(this);
        var self = this;
        console.log('Starting up server...');
        console.log('  |');
        this._express.use(bodyParser.urlencoded({ extended: true }));
        this._express.use(bodyParser.json());
        this._express.use(cookieParser(this.config.app.secret || "no secret set"));
        this._express.use(session({
            secret: self.config.app.secret || "no secret set",
            resave: false,
            saveUninitialized: true,
            name: 'nc.s.' + Math.round(Math.random() * 100)
        }));

        if (this.config.http.public) {
            this._express.use(express.static(this.path(this.config.http.public)));
            console.log('  +- static: ' + this.config.http.public);
        }

        //views config

        if (self.config.app.hasOwnProperty('theme')) {
            var themeDir = self.path(path.join('%APPDIR%', 'themes', self.config.app.theme));
            if (!fs.existsSync(themeDir)) {
                throw new Error('Theme dir `' + themeDir + '` does not exists');
            }
            View.dir(themeDir);
            console.log('  +- themes: ' + themeDir);
        } else {
            var viewDir = self.path(path.join('%APPDIR%', 'views'));
            if (!fs.existsSync(viewDir)) {
                throw new Error('Neither theme dir or view dir was found');
            }
            View.dir(viewDir);
            console.log('  +- views: ' + viewDir);
        }


        //i18n?
        if (this.config.app.hasOwnProperty('locale')) {
            i18n.configure({
                directory: self.path(self.config.app.locale.directory),
                locales: self.config.app.locale.locales,
                defaultLocale: self.config.app.locale.default || "en",
                cookie: self.config.app.locale.cookie || "locale"
            });
            console.log('  +- loading locales: ' + self.config.app.locale.locales.join(','));
            this._express.use(i18n.init);
        }


        this._express.use('/', this._router);

        //setup http server
        this.http = http.createServer(this._express).listen(this.config.http.port, this.config.http.host);
        console.log('  +- http running on ' + this.config.http.host + ':' + this.config.http.port);

        //setup https server
        if (this.config.http.secure) {
            var key = fs.readFileSync(this.path(this.config.http.key)).toString();
            var cert = fs.readFileSync(this.path(this.config.http.cert)).toString();
            var options = {
                key: key,
                cert: cert
            };
            var port = this.config.http.secure === true ? 443 : this.config.http.secure;
            this.https = https.createServer(options, this._express).listen(port, this.config.http.host);
            console.log('  +- https running on ' + this.config.http.host + ':' + this.config.http.port);
        }
        console.log('  *');

        //load application controllers
        var loader = new Loader(this);
        loader.load();



        /**
         * Handles route, extends controller by;
         * input, send, redirect, request, response and session parameters.
         *
         * @param {Object|Function} controller instance of controller or function handler
         * @param {String|null} method name of the controller that should be executed or null if function was passed instead controller
         * @param {Object} req express' request object
         * @param {Object} res express' response object
         */
        function handleRoute(Controller, method, req, res) {

            try {
                var instance = new Controller(self);
                instance.send = createSendObject(res);
                instance.input = createInputObject(req);
                instance.redirect = function(url) {
                    res.redirect(url);
                };
                instance.request = req;
                instance.response = res;
                instance.session = req.session;

                if (res.hasOwnProperty('__')) {
                    View.prototype.__ = res.__;
                    View.prototype._n = res._n;

                    instance.getLocale = function() {
                        return req.getLocale.apply(req, arguments);
                    };
                    instance.setLocale = function() {
                        return req.setLocale.apply(req, arguments);
                    };
                }
                instance[method].apply(instance, req.params);
            } catch (e) {
                return self._onError.apply(this, [e, req, res]);
            }
            self._onSuccess.apply(this, req, res);
        }

        //create router
        var router = {
            /**
             * Supports GET request routing
             * @param {String} route express route pattern
             * @param {Object|Function} controller instance of controller or function handler
             * @param {String|null} method name of the controller that should be executed or null if function was passed instead controller
             */
            get: function(route, controller, method) {
                self._router.get(route, function(req, res) {
                    handleRoute(controller, method, req, res);
                });
            },
            /**
             * Supports POST request routing
             * @param {String} route express route pattern
             * @param {Object|Function} controller instance of controller or function handler
             * @param {String|null} method name of the controller that should be executed or null if function was passed instead controller
             */
            post: function(route, controller, method) {
                self._router.post(route, function(req, res) {
                    handleRoute(controller, method, req, res);
                });
            },
            /**
             * Supports all types of request routing
             * @param {String} route express route pattern
             * @param {Object|Function} controller instance of controller or function handler
             * @param {String|null} method name of the controller that should be executed or null if function was passed instead controller
             */
            all: function(route, controller, method) {
                self._router.all(route, function(req, res) {
                    handleRoute(controller, method, req, res);
                });
            },
            /**
             * Supports PUT request routing
             * @param {String} route express route pattern
             * @param {Object|Function} controller instance of controller or function handler
             * @param {String|null} method name of the controller that should be executed or null if function was passed instead controller
             */
            put: function(route, controller, method) {
                self._router.put(route, function(req, res) {
                    handleRoute(controller, method, req, res);
                });
            },
            /**
             * Supports DELETE request routing
             * @param {String} route express route pattern
             * @param {Object|Function} controller instance of controller or function handler
             * @param {String|null} method name of the controller that should be executed or null if function was passed instead controller
             */
            delete: function(route, controller, method) {
                self._router.delete(route, function(req, res) {
                    handleRoute(controller, method, req, res);
                });
            }
        };

        //initialize controllers
        for(var ctrl in this.controllers) {
            if (typeof this.controllers[ctrl]['setup'] === 'function') {
                this.controllers[ctrl].setup(router, this.mediator);
            }
        }

        //404 error
        this._router.get('*', function(req, res) {
            if (req.url !== '/favicon.ico') {
                self._onError.apply(this, [new Error("Not found " + req.url), req, res]);
            }
        });

    },
    /**
     * Sets/gets error handler.
     * Handler will be called when application's module will throw an Error
     * @param {Function} handler
     */
    error: function() {
        if (arguments.length >= 1) {
            this._onError = arguments[0];
        }
        return this._onError;
    },
    success: function() {
        if (arguments.length >= 1) {
            this._onSuccess = arguments[0];
        }
        return this._onSuccess;
    },
    path: function(string) {
        string = string.replace('%APPDIR%', this.dir());
        string = string.replace('%FWDIR%', Application.FW_DIR);
        return string;
    }
}).static({
    FW_DIR: path.resolve(path.join(__dirname, '..')),
    ON_NOT_FOUND: 'onNotFound',
    ON_ERROR: 'onError'
});

module.exports = Application;