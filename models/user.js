let mongoose = require('mongoose');
let sha1 = require('sha1');
let Schema = mongoose.Schema;

let userSchema = new Schema({
    username: String,
    password: String,
    solves: [{type:Schema.Types.ObjectId, ref: 'Meta'}]
 });

userSchema.methods.validPassword = function(password) {
   return sha1(password)===this.password;
 }

userSchema.methods.generateHash = function(password) { return sha1(password); }

userSchema.statics.findByID = function (id,callback) {
  this.findOne({_id:id}, function(err, data) { return callback(err,data); });
}

userSchema.statics.saveSolveData = function (data,callback) {
  this.update({username:data.username}, {$push:{solves:data.solveID}}, function(err, data)
  { return callback(err,data); });
}

userSchema.statics.fetchMetadata = function (data,callback) {
  this.findOne({username:data.username}, {username:1, solves:1})
  .populate('solves')
  .exec(function (err, data) { callback(err,data); });
}

userSchema.statics.findOrCreate = function (query, callback) {
  let newUser=new this();
  this.findOne({username:query.name}, function(err,user) {
    if (err) { return callback(err); }
      if (user) { return callback(null,user); }
      else {  //if user does not exist, create user with update values
          newUser.username=query.name;
          newUser.password=query.password;
          newUser.save(callback);
          }
        });
      }

module.exports=mongoose.model('User', userSchema);
