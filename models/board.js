/*on Solve:
increment board.stats.totalSolves
recalculate board.stats.averageSolveTime (hours.minutes.seconds)
update board.stats.userRatedQuality and board.stats.userRatedDifficulty if necessary

meta: {
    "language": "en", //ISO 639-1 https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
    "title": "Double Vision",
    "author": "Chris Word",
    "dateCreated": 20170210,
    "description": "You may bee seeing twiice byy thee ennd of thiis puzzle",
    "size": 12
    "stats": {
      "totalSolves": 123,
      "averageSolveTime": 30 //in seconds
      "userRatedQuality": [3,4,5,4,4,3,4,5],
      "userRatedDifficulty": [0,1,1,2,1,0,0,2]
      },
data: {
  ["15L": {
    "word": "EPEE",
    "clue": "Small sword",
    "dir": "H"
  }]
} */

let mongoose = require('mongoose');
let sha1 = require('sha1');
let Schema = mongoose.Schema;

let boardSchema = new Schema({
  id: String, //TODO implement this or just use ObjectID
  meta: {
    title: String,
    author: String,
    description: String,
    dateCreated: Date,
    language: { type: String, default: 'en' },
    size: Number,
    stats: {
      totalSolves: Number,
      averageSolveTime: Number,
      userRatedQuality: Array,
      userRatedDifficulty: Array
    }
  },
  data: [{}]
});

boardSchema.statics.findById = function (id,callback) {
   this.findOne({_id:id}, function(err, data) { return callback(err,data); });
 }

boardSchema.statics.listAll = function (callback) {
  this.find({}, {id:1,'meta':1}, function(err, data) { return callback(err,data); });
}

boardSchema.statics.findBoardsByUser = function (user, callback) {
  this.find({'meta.author':user}, function(err,data) {
    console.log(err, data);
    if(!data) { callback(null); }
    callback(err, data);
  });
}

boardSchema.statics.findByTitle = function (title,callback) {
    this.findOne({'meta.title':title}, function(err, data) { return callback(err,data); });
  }

//TODO right now our primary key is title which is bad. Use _id instead and tie to title somehow
boardSchema.statics.findOrCreate = function(query, callback) {
  console.log(query);
  let newBoard=new this();
  this.findOne({'meta.title':query.meta.title}, function(err,board) {
    console.log('board',board);
    if (err) { return callback(err); }
      if (board) { return callback(null,board); }
      else {  //if board does not exist, create board with values
          console.log('saving new');
          newBoard.meta=query.meta;
          newBoard.data=query.data;
          newBoard.save(callback);
          }
        });
      }

boardSchema.statics.saveSolveData = function(info, callback) {
  this.update({_id:info.id}, {$set: {
        'meta.stats.totalSolves': info.totalSolves,
        'meta.stats.averageSolveTime': info.averageSolveTime }},
    function(err,data){ callback(err,data); });
  }

module.exports=mongoose.model('Board', boardSchema);
