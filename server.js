// load environment variables
require('dotenv').config();

// grab our dependencies
const express = require('express'),
    app = express(),
    port = process.env.PORT || 8080
    expressLayouts = require('express-ejs-layouts'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    flash = require('connect-flash'),
    expressValidator = require('express-validator');

// configure our application
// set sessions and cookie parser
app.use(cookieParser());
app.use(session({
    secret: process.env.SECRET,
    cookie: {maxAge: 60000},
    resave: false,      // forces the session to be saved back to the store
    saveUninitialized: false    // don't save unmodified sessions
}));
app.use(flash());

// tell express where to look for static assets
app.use(express.static(__dirname + '/public'));

// set ejs as templating engine
app.set('view engine', 'ejs');
app.use(expressLayouts);

// connect to the database
mongoose.connect(process.env.DB_URI);

// use bodyParser to grab info from a form
app.use(bodyParser.urlencoded({extended: true}));

// express validator -> validate form or URL parameters
app.use(expressValidator());

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

require('./config/passport')(passport); // pass passport for configuration

// set the routes
app.use(require('./app/routes')); // pass passport for routing

// start our server
app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}`);
});
