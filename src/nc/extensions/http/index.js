var Extension = require('../../app/Extension.js');
var Application = require('../../app/Application.js');
var util = require('../../util');
var express = require('express');
var bodyParser = require('body-parser');

var cookieParser = require('cookie-parser');
var session = require('express-session');

var HTTP = Extension.extend({
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

        self.express.use('/', self.router);
        self.express.use(function(req, res){
            //handle 404 here
            self.app.mediator().dispatch(Application.ON_NOT_FOUND, req, res);
        });

        self.express.listen(self.config.port);
        console.log('HTTP - Server is running on port ' + self.config.port);


    },
    _extendApplication: function() {
        var self = this;

        function createSendObject(res) {
            var send = {
                json: function(object, status) {
                    var status = status || 200;
                    res.set('Content-Type', 'application/json');
                    res.status(status).send(JSON.stringify(object));
                },
                html: function(html, status) {
                    var status = status || 200;
                    res.set('Content-Type', 'text/html');
                    res.status(status).send(html);
                },
                text: function(text, status) {
                    var status = status || 200;
                    res.set('Content-Type', 'text/plain');
                    res.status(status).send(text);
                }
            };
            return send;
        }

        function createInputObject(req) {
            var input = {
                get: function(name) {
                    return typeof req.query[name] !== 'undefined' ? req.query[name] : undefined;
                },
                post: function(name) {
                    return req.param(name);
                },
                param: function(name) {
                    return req.param(name);
                }
            };

            return input;
        }

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



        self.app.router = {
            get: function(route, controller, method) {
                self.router.get(route, function(req, res) {
                    handleRoute(controller, method, req, res);
                });
            },
            post: function(route, controller, method) {
                self.router.post(route, function(req, res) {
                    handleRoute(controller, method, req, res);
                });
            },
            all: function(route, controller, method) {
                self.router.all(route, function(req, res) {
                    handleRoute(controller, method, req, res);
                });
            },
            put: function(route, controller, method) {
                self.router.put(route, function(req, res) {
                    handleRoute(controller, method, req, res);
                });
            },
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