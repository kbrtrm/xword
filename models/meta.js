let mongoose = require('mongoose');
let sha1 = require('sha1');
let Schema = mongoose.Schema;

let metaSchema = new Schema({
  boardID: {type: mongoose.Schema.Types.ObjectId, ref: 'Board'},
  boardTitle: String,
  dateSolved: { type: Date, default: Date.now },
  user: String,
  solveData: String
});

metaSchema.statics.findById = function (id,callback) {
   this.findOne({_id:id}, function(err, data) { return callback(err,data); });
 }

metaSchema.statics.saveSolveData = function(info, callback) {
    let newMeta=new this();
    newMeta.boardID=info.id;
    newMeta.boardTitle=info.title;
    newMeta.user=info.user;
    newMeta.solveData=info.solveData;
    newMeta.save(callback);
   }

module.exports=mongoose.model('Meta', metaSchema);
