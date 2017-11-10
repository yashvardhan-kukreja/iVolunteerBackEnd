/**
 * Created by Yash 1300 on 14-09-2017.
 */
var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var config = require('./database/config');
var db = config.database;
var morgan = require('morgan');

var User = require('./models/volunteer');


var port = process.env.PORT || 8180;
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


var volunteerRouter = require('./routes/volroutes');
var ngoRouter = require('./routes/ngoroutes');
var eventRouter = require('./routes/eventroutes');

app.use('/ngo', ngoRouter);
app.use('/volunteer', volunteerRouter);
app.use('/events', eventRouter);

/*app.post('/posttest', function(req, res){
    var volunteer = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        age: req.body.age,
        address: req.body.address,
        locality: req.body.locality,
        phonenum: req.body.phonenum,
        email: req.body.email,
        password: req.body.password
    });

    res.json({Success:0, message:"Post request is working successfully for user named"+volunteer.firstName});
});*/

mongoose.connect(db);

mongoose.connection.on('connected', function(){
    console.log('Database connected successfully...');
});

mongoose.connection.on('error', function(){
    console.log('Error while connecting to the database');
});

app.get('/', function(req, res){
    res.sendFile(__dirname+"/views/main.html", function(err){
        if (err){
            console.log("Error occured while sending the response");
        } else {
            console.log("Successfully sent the response on the homepage");
        }
    });
});


app.listen(port, function(){
    console.log('App running successfully on port number: ',+port+"...");
});
