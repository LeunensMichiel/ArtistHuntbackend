let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let bodyParser = require('body-parser');

let mongoose = require('mongoose');
let passport = require('passport');

mongoose.connect('mongodb://projecten3studserver03.westeurope.cloudapp.azure.com/mindfulnessdb', { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);

//MODELS
require('./models/user');


require('./config/passport');

//routes
let userRouter = require('./routes/user');

let app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

// use Routes
app.use('/API/users', userRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;
