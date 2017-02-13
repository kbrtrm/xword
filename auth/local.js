const passport=require('passport');
const LocalStrategy=require('passport-local').Strategy;

const User=require('../models/user');
const config=require('../config/auth');
const init=require('./init');

passport.use(new LocalStrategy(
    function (username, password, done) {
      User.findOne({username:username}, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (!user.validPassword(password) {return done(null, false); }
        return done(null, user);
      });
    }
  ));

  //serialize user
  init();

  module.exports=passport;
