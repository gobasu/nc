var Module = require('../../app/Module.js');
var util = require('../../util');
var express = require('express');
var bodyParser = require('body-parser');

var cookieParser = require('cookie-parser');
var session = require('express-session');


var HTTPModule = Module.extend(function HTTPModule(app, config) {
    var self = this;

    self.ready = function() {
        self.express = express();
        self.router = express.Router();
        self.express.use(bodyParser.urlencoded({ extended: true }));
        self.express.use(bodyParser.json());
        self.express.use(cookieParser(self.config.secret))
        self.express.use(session({
            secret: self.config.secret,
            resave: false,
            saveUninitialized: true,
            name: 'nc.s.' + Math.round(Math.random() * 100)
        }));

        self.express.use('/', self.router);

        self.express.listen(self.config.port);
    };

    if (HTTPModule.new) {

        self.init(app, config);
    }
});
module.exports = HTTPModule;