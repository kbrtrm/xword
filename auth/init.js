const passport = require('passport');
const User = require('../models/user');

module.exports = function() {
  passport.serializeUser(function(user,done){
    done(null, user._id);
  });

  passport.deserializeUser(function(id,done){
    User.findByID(id, function(err, user){
      done(err, user);
    });
});
}
