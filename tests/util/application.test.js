var Application = require('../../src/nc/app/Application');

describe('nc.app.Application',function() {



    it('nc.app.Application.instance', function() {
        var app1 = Application.instance();
        var app2 = Application.instance();
        expect(app1 === app2).toBeTruthy();

        var error;
        try {
            new Application();
        } catch (e) {
            error = e;
        }
        expect(error instanceof Error).toBeTruthy();
    });
});