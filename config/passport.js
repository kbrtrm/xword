const LocalStrategy=require('passport-local').Strategy;
const passport=require('passport');
const User=require('../models/user');
const init=require('../auth/init');

  passport.use('local-register', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
  },
  function (req, username, password, done) {
    process.nextTick(function() {
      User.findOne({'username':username}, function(err, user){
        if (err) { return done(err); }
        if (user) {
          return done(null, false, req.flash('registerMessage','That username is taken.'));
        }
        else {
          let newUser = new User();
          newUser.username = username;
          newUser.password = newUser.generateHash(password);
          newUser.save(function(err) {
          if (err) { throw err; }
          return done(null,newUser, req.flash('welcomeMessage',`Welcome to Bricolage, ${username}!`));
          });
        }
      });
    });
    }
  ));

  passport.use('local-login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
  },
  function (req, username, password, done) {
    User.findOne({username:username}, function(err, user) {
      if (err) { return done(err); }
      if (user) {
        if (!user.validPassword(password)) {
          return done(null, false, req.flash('loginMessage', 'Not my password.'));
        }
        return done(null, user);
      }
      return done(null, false, req.flash('loginMessage', 'No one has that name. You should <a href="/register">register</a> it.')); //no users
    });
  }));

//serialize user
init();

module.exports=passport;
