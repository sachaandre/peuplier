var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const User = require('./models/user');
const bcrypt = require('bcrypt');

const helmet = require('helmet');


//ROUTERS
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var testimonyRouter = require('./routes/testimony');


//APP
var app = express();


//USERS INIT
var user_controller = require("./controllers/userConstroller")
user_controller.createFirstUser();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());

//Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.DEV_ENV ? false : true }
}));

//Initialize & config passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  async (username, password, done) => {
      const user = await User.findOne({name: username})

      if(!user) {
          return done(null, false, { error: 'Username incorrect.'})
      } else {
          const isValidPword = await bcrypt.compare(password, user.pword);
          if (!isValidPword) {
              return done(null, false, { error: 'Mot de passe incorrect.'})
          }
          
          return done(null, user)

          
      }

  }
))

passport.serializeUser((user, done) => {
  done(null, user.id);
  });
 passport.deserializeUser(async (id, done) => {
  const user = await User.findOne({_id: id})
  done(null, user);
});

app.use('/', indexRouter);
app.use('/', usersRouter);
app.use('/', testimonyRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);

  err.status == 404 ? res.redirect('/') : res.render('error');
});

// Database
// Import Mongoose module
const mongoose = require('mongoose');
const user = require('./models/user');

// Set `strictQuery: false` to globally opt into filtering by properties that aren't in the schema
// Included because it removes preparatory warnings for Mongoose 7.
// See: https://mongoosejs.com/docs/migrating_to_6.html#strictquery-is-removed-and-replaced-by-strict
mongoose.set("strictQuery", false);
//const mongoDB = process.env.SCALINGO_MONGO_URL;
const mongoDBDev = "mongodb://localhost:27017/Peuplier_DB_Dev"
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDBDev);
}



module.exports = app;
