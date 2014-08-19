var Extension = require('../../app/Extension.js');
var Application = require('../../app/Application.js');
var util = require('../../util');
var express = require('express');
var bodyParser = require('body-parser');

var cookieParser = require('cookie-parser');
var session = require('express-session');

var HTTP = Extension.extend({
    /**
     * Setups http server based on express.js framework with
     *  - cookie handling
     *  - static files handler
     *  - session handler
     */
    ready: function() {
        var self = this;
        self.express = express();
        self.router = express.Router();
        self._extendApplication();
        self.express.use(bodyParser.urlencoded({ extended: true }));
        self.express.use(bodyParser.json());
        self.express.use(cookieParser(self.config.secret));
        self.express.use(session({
            secret: self.config.secret,
            resave: false,
            saveUninitialized: true,
            name: 'nc.s.' + Math.round(Math.random() * 100)
        }));

        if (self.config.static) {
            console.log('HTTP - Setting static file server to path ' + self.config.static);
            self.express.use(express.static(self.path(self.config.static)));
        }

        /**
         * Main route handler
         */
        self.express.use('/', self.router);
        /**
         * Default handler aka 404 error
         */
        self.express.use(function(req, res){
            self.app.mediator().dispatch(Application.ON_NOT_FOUND, req, res);
        });

        self.express.listen(self.config.port);
        console.log('HTTP - Server is running on port ' + self.config.port);


    },
    /**
     * Adds router support for application.
     *
     * @private
     */
    _extendApplication: function() {
        var self = this;

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
         * Handles route, extends controller by;
         * input, send, redirect, request, response and session parameters.
         *
         * @param {Object|Function} controller instance of controller or function handler
         * @param {String|null} method name of the controller that should be executed or null if function was passed instead controller
         * @param {Object} req express' request object
         * @param {Object} res express' response object
         */
        function handleRoute(controller, method, req, res) {
            try {
                if (typeof controller === 'object' && typeof method !== 'undefined') {
                    controller.send = createSendObject(res);
                    controller.input = createInputObject(req);
                    controller.redirect = function(url) {
                        res.redirect(url);
                    };
                    controller.request = req;
                    controller.response = res;
                    controller.session = req.session;
                    controller[method].apply(controller, req.params);
                } else if (typeof controller === 'function') {
                    controller.apply(null, [req, res]);
                }
            } catch (e) {
                self.app.error().apply(null, [e, req, res]);
            }
        }

        /**
         * Adds router support in the application
         * @type {{get: Function, post: Function, all: Function, put: Function, delete: Function}}
         */
        self.app.router = {
            /**
             * Supports GET request routing
             * @param {String} route express route pattern
             * @param {Object|Function} controller instance of controller or function handler
             * @param {String|null} method name of the controller that should be executed or null if function was passed instead controller
             */
            get: function(route, controller, method) {
                self.router.get(route, function(req, res) {
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
                self.router.post(route, function(req, res) {
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
                self.router.all(route, function(req, res) {
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
                self.router.put(route, function(req, res) {
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
                self.router.delete(route, function(req, res) {
                    handleRoute(controller, method, req, res);
                });
            }
        };
    }

}).static({
    defaults: {
        port: 8080,
        domain: "localhost",
        secret: "secret",
        static: null
    },
    dependencies: []
});

module.exports = HTTP;