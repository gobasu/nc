var nunjucks = require('nunjucks');
var util = require('../util');
var fs = require('fs');
var Promise = require('promise');

var View = util.Class({
    create: function(file) {
        this._file = file;
    },
    data: function(object) {
        this._data = object;
    },
    render: function() {
        var self = this;
        self._data._ = this.__;
        self._data._n = this._n;


        return new Promise(function(fullfill, reject) {
            nunjucks.render(self._file + '.html', self._data, function(err, res) {
                if (err) {
                    return reject(err);
                }
                fullfill(res);
            });
        });
    }
}).static({
    dir: function(dir) {
        if (!fs.existsSync(dir)) {
            throw new Error('Theme dir `' + dir + '` does not exists');
        }
        View.__dir__ = dir;

        nunjucks.configure(dir + '/');
    }
});

module.exports = View;