var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth2').Strategy;

var RedisStore = require('connect-redis')(session);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var sessionOptions={
  secret: 'my_precious',
  resave: false,
  cookie:{
    maxAge: 24*60*60*1000 //1day cookie max age
  }
};

if (process.env.RedisUrl &&  process.env.RedisPort && process.env.RedisPwd)
{
  console.log('redis setup...' + process.env.RedisUrl + ':' + process.env.RedisPort);
  sessionOptions.store=new RedisStore({
    host: process.env.RedisUrl,
    port: process.env.RedisPort,
    pass: process.env.RedisPwd
  });
}
else{
  console.log('redis keys/password not found');
}

app.use(session(sessionOptions));
//app.use(express.methodOverride());

app.use(passport.initialize());
app.use(passport.session());
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// serialize and deserialize
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});
module.exports = app;
