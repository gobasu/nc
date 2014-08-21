var Extension = require('../../app/Extension.js');
var View = require('../../app/View.js');
var Controller = require('../../app/Controller.js');
var util = require('../../util');
var path = require('path');
var fs = require('fs');
var Handlebars = require('./handlebars');

var HandlebarsExtension = Extension.extend({
    run: function() {
        var self = this;
        var themesDir = self.path(self.config.themesDir);
        var theme = self.config.defaultTheme;

        var currentTheme = path.join(themesDir, theme);

        if (!fs.existsSync(currentTheme)) {
            throw new Error("Theme " + theme + " does not exists in " + themesDir);
        }

        //change theme name
        Controller.prototype.theme = function(name) {
            theme = name;
            View.prototype.theme = name;
        };

        //load view
        Controller.prototype.view = function(name) {
            var path = theme + ":" + name;
            if (!this.views.hasOwnProperty(path)) {
                this.views[path] = new View(this.__dirname__, name);
            }
            return this.views[path];
        };

        //set view's theme
        View.prototype.theme = theme;

        View.prototype.loadTemplate = function(filename) {
            return Handlebars.compile(fs.readFileSync(filename, 'utf8'));
        };

        View.prototype.getTemplateFile = function(name) {
            var filePath = path.join(currentTheme, name + '.html');
            if (fs.existsSync(filePath)) {
                return filePath;
            }
            console.log(this);

            filePath = path.join(this.__dirname__, 'views', name + '.html');
            if (!fs.existsSync(filePath)) {
                throw new Error("Template file " + name + " does not exists in " + filePath);
            }

            return filePath;
        };

        View.prototype.render = function() {
            var self = this;
            this.data.__meta__ = {
                dir: {
                    theme: path.join(themesDir, theme),
                    module: self.__dirname__
                },
                name: self.name,
                file: self.filename,
                theme: theme
            };
            return this.template(this.data);
        };

        View.prototype.toString = function() {
            return this.render();
        };


        console.log('Theme dir: '  + currentTheme);


    }
}).static({
    dependencies: ['http'],
    defaults: {
        themesDir: "%APPDIR%/public/themes/",
        defaultTheme: "default"
    }

});

module.exports = HandlebarsExtension;