module.exports = function(Model, type) {
    var Customers = Model.define    ('Customers', {
        customerNumber: type.INTEGER,
        customerName: type.STRING,
        contactLastName: type.STRING,
        contactFirstName: type.STRING,
        phone: type.STRING
    });

    return Customers;
};