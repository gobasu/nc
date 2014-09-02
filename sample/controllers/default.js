var Controller = require('../../src/nc').app.Controller;


var self = Controller.extend({
    defaultPage: function() {

        var self = this;

        //self.setLocale('pl');
/*
        console.log('default page');
        this.session.a++;

        //var l = this.getLocale();

        //console.log('locale ', l);

        /*var Customers = this.model('Customers');

        Customers.find({
            where: {
                customerNumber: {
                    gt: 200
                }
            }
        }).then(function(data) {
            //console.log(data);
        });*

        var view = this.view('index');

        view.data({title: "Sample Title"});
        view.render().then(function(view) {
            self.send.text(view);
        }).catch(function (e){
            console.log(e);
        });
*/
        self.send.text("dupa");

        //this.setLocale('pl');

    }
}).static({
    setup: function(router, mediator) {
        router.all('/', self, 'defaultPage');
    }
});

module.exports = self;