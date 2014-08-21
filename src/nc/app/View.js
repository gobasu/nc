var util = require('../util');
var Application = require('./Application');
var fs = require('fs');
var path = require('path');

var View = util.Class({
    create: function(dirname, tplName) {
        this.__dirname__ = dirname;
        this.name = tplName;
        this.filename = this.getTemplateFile(tplName);
        if (!fs.existsSync(this.filename)) {
            throw new Error('View file ' + this.filename + ' is not readable');
        }
        this.template = this.loadTemplate(this.filename);
    },
    getTemplateFile: function(name) {
        return path.join(this.__dirname__, 'views', name + '.html');
    },
    loadTemplate: function(filename) {
        return fs.readFileSync(filename);
    },
    data: function(data) {
        this.data = data;
    },
    render: function() {
        return this.template;
    }
});

module.exports = View;