let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let bodyParser = require('body-parser');

let mongoose = require('mongoose');
let passport = require('passport');

let fs = require('fs');

mongoose.connect('mongodb://projecten3studserver03.westeurope.cloudapp.azure.com/artisthuntdb', { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);

//MODELS
require('./models/user');
require('./models/post');


require('./config/passport');

//routes
let userRouter = require('./routes/user');
let postRouter = require('./routes/posts');

let app = express();

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

// use Routes
app.use('/API/users', userRouter);
app.use('/API/post', postRouter);

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
