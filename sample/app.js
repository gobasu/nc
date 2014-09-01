var Application = require('../src/nc').app.Application;


var app = new Application();
app.dir(__dirname);

app.error(function(e, req, res) {
    console.log('error call');
    if (res) {
        console.log(e);
        res.send('404');
    }
});

app.run();