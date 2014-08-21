var util = require('../util');

var Model = util.Class({

    connection: function() {
        return this.connection;
    }
}).static({
    STRING: 'string',
    NUMBER: 'number',
    DATE: 'date',
    BOOL: 'bool'
});

module.exports = Model;