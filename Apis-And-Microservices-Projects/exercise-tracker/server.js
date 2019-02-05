require('dotenv').config();
var cors = require('cors');

var express = require('express');
var app = express();

var shortid = require('shortid');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: String,
    _id: String
});

var ExerciseSchema = new Schema({
    _id: String,
    description: String,
    duration: Number,
    date: Date
});

//set up DB connection
var connection = mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true});
var ExerciseUser = mongoose.model('ExerciseUser', userSchema);
var Exercise = mongoose.model('Exercise', ExerciseSchema);

var bodyParser = require('body-parser');

app.use(cors({optionsSuccessStatus: 200}));
app.use('/', express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


app.get('/', function(req, res){
    res.sendFile(__dirname+"/views/index.html");
})

app.post('/api/exercise/new-user', function (req, res) {

    var username = req.body.username;
    
    //if username field was filled
    if (username) {

        //check if username exists
        ExerciseUser.findOne({ username: username }).then(user => {

            if (!user) {

                var newUserID = shortid.generate();

                //create user record
                var newUser = new ExerciseUser({
                    username: username,
                    _id: newUserID
                });

                //insert new user into db
                newUser.save(function (err) {
                    if (err) return handleError(err);

                    res.send({ username: username, _id: newUserID });
                });

            } else {
                res.send('username already taken');
            }

        }).catch(error => {
            next(error);
        });
    } 
    else {
        res.send('Path `username` is required.');
    }

})

app.post('/api/exercise/add', function(req, res){

    uid = req.body.userId;
    desc = req.body.description;
    duration = req.body.duration;
    date = req.body.date;

    //{"username":"ktest","_id":"BJkp5cLVE"}
    ExerciseUser.findOne({_id: uid}).then(user => {

        if(user){

            //check to see duration is a number
            duration = parseInt(duration);

            if(duration){

                //check date format
                if(date.match(/^\d{4}-\d{2}-\d{2}$/)){



                }else {
                    res.send('Cast to Date failed for value '+ date +' at path "date"')
                }

            }else{
                res.send('Cast to Number failed for value ' + duration + 'at path "duration"')
            }

            
            
        }else {
            res.send('unknown _id');
        }
    })

})


// Not found middleware
app.use((req, res, next) => {
    return next({ status: 404, message: 'not found' })
})

// Error Handling middleware
app.use((err, req, res, next) => {
    let errCode, errMessage

    if (err.errors) {
        // mongoose validation error
        errCode = 400 // bad request
        const keys = Object.keys(err.errors)
        // report the first validation error
        errMessage = err.errors[keys[0]].message
    } else {
        // generic or custom error
        errCode = err.status || 500
        errMessage = err.message || 'Internal Server Error'
    }
    res.status(errCode).type('txt')
        .send(errMessage)
})

var listener = app.listen(process.env.PORT, function() {
    console.log('App is listening on port '+listener.address().port+'..');
});