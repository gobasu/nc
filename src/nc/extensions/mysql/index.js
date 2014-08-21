var Extension = require('../../app/Extension.js');
var Model = require('../../app/Model.js');
var util = require('../../util');
var path = require('path');
var fs = require('fs');
var mysql = require('mysql');

var MySQL = Extension.extend({
    run: function() {
        var self = this;
        console.log(self.config);
        self.connection = mysql.createConnection(self.config);
        //console.log(self.connection);
        self.connection.connect(function(err) {
            if (err) {
                throw err;
            }
            console.log('Mysql is connected');

            Model.prototype.connection = self.connection;
            Model.prototype.query = function() {
                return this.connection.query.apply(this.connection, arguments);
            };
            self.ready();
        });
    }
}).static({
    async: true

});

module.exports = MySQL;