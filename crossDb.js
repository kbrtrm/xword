var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectID=require('mongodb').ObjectID;
let db;
let dbUrl=process.env.PROD_DB||'mongodb://localhost:27017/xword';

exports.mongooseDatabase=db;

function connect(callback) {
  if (db===undefined) {
    mongoose.connect(dbUrl);
    var database=mongoose.connection;
    database.on('error', function(error){
      console.error.bind(console, 'connection error:');
      callback(error);
    });
    database.once('open', function(){
      db=database;
      callback(null, db);
    });
  }
  else { callback(null, db); }
}

connect(function(status){console.log('connected. errors: ', status);});
