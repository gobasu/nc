var Application = require('../src/nc').app.Application;

var app = new Application();
app.dir(__dirname);
app.error(function(err, req, res) {
    //handle error here
});
app.run();