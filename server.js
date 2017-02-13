const querystring=require('querystring');
const express=require('express');
const bodyParser=require('body-parser');
const path=require('path');
const fetch = require('node-fetch');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose=require('mongoose');
const helmet=require('helmet');
const flash = require('connect-flash');
const ObjectId = require('mongoose').Types.ObjectId;
const Db=require('./crossDb.js');
const db=Db.mongooseDatabase;

//Passport login strategies
const passport=require('passport');
const passportLocal=require('./config/passport');

//Mongoose data models
const User=require('./models/user');
const Board=require('./models/board');
const Meta=require('./models/meta');

const app=express();
app.use(helmet());
app.use(cookieParser(process.env.SESSION_SECRET || 'DREAMSBEDREAMS'));
app.use(session({
  store: new MongoStore({
    mongoose_connection: db,
    url: process.env.PROD_DB || 'mongodb://localhost:27017/xword',
    ttl: 14 * 24 * 60 * 60 // = 14 days. Default
  }), //https://github.com/jdesboeufs/connect-mongo
  secret: process.env.SESSION_SECRET || 'DREAMSBEDREAMS',
  resave: true,
  saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(express.static(path.join(__dirname+'/static')));
app.use(['/login','/register','/new','/s'],bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname+'/views'));

/* --- AUTHENTICATION: Login & Registration --- */
function auth(req,res,next) { //req.sessionStore req.sessionID req.session
   req.isAuthenticated() ? next() : res.redirect('/login');
 }
 //LOCAL
 app.post('/login',
   passport.authenticate('local-login', {failureRedirect: '/login', failureFlash: true}), function(req,res){
   req.session.user=req.user.username;
   res.redirect('/boardList');
 });
 app.post('/register',
   passport.authenticate('local-register', {failureRedirect: '/register', failureFlash: true}), function(req,res){
     req.session.user=req.user.username;
     res.redirect('/boardList');
 });

 app.get('/login', (req,res) => {
   res.render('login',{data:'',user:req.session.user,message:req.flash('loginMessage')});
 });

 app.get('/register', (req,res) => {
   res.render('register',{data:'',user:req.session.user,message:req.flash('registerMessage')});
 });

 app.get('/logout', function (req,res) {
   req.logout();
   req.session.destroy();
   res.redirect('/login');
 });
 /* --- END OF AUTHENTICATION: Login & Registration --- */

app.post('/new', function(req,res) {
  let r=req.body;
  let serverObj = {};
  serverObj.meta={title:r.title, author:r.author, description: r.description, size: r.size, dateCreated:new Date(),
    stats:{totalSolves:0, averageSolveTime:0}};
  serverObj.data=r.tsv;
  Board.findOrCreate(serverObj, function(err, data){
    if (!err) {
    res.redirect(`/b/${data._id}`);}
  });
});

app.get('/new', auth, function(req,res) {
  let payload={data:'', user:req.session.user};
  res.render('newBoard', {data:payload});
});

app.get('/b/:board', function(req,res) {
  let board = fetchBoard(req.params.board);
  board.then(function(data) {
    let payload={data:data, user:req.session.user};
    res.render('index', {data:payload});
  });
});

app.get('/boardlist', function(req,res) { //lists boards with links to them
  Board.listAll(function(err, data) {
    if (!err) {
      let payload={data:data, user:req.session.user};
      res.render('boardList',{data:payload});
    }
  });
});

app.get('/mine', auth, function(req,res) {
  Board.findBoardsByUser(req.session.user, function(err,data) {
    if(!err) {
      if (data) {
        let payload={data:data, user:req.session.user};
        res.render('boardList',{data:payload});
      }
      else {
        res.redirect('/new');
      }
    }
  });
});

app.post('/s', function(req,res) {
  let b=req.body;
  Board.saveSolveData({id:b.id,totalSolves:b.totalSolves,averageSolveTime:b.averageSolveTime}, function(err,data) {
  });
  Meta.saveSolveData({id:b.id, user:req.session.user, solveData:b.timeData}, function(err, data) {
    if (!err) {
      User.saveSolveData({username:req.session.user, solveID:data._id}, function(err, data) {
        console.log(err,data);
      });
    }
  });
});

app.get('/meta', auth, function(req,res) {
  User.fetchMetadata({username:req.session.user}, function(err, data) {
    let payload={data:data, user:req.session.user};
    res.render('mySolves',{data:payload});
  });
})

 app.get('*', function(req,res) { //catch-all route
   res.redirect('/login');
 });

 function fetchBoard(title) { //Returns a promise to board data when given EITHER of an Object ID primary key or a board Title
   //http://stackoverflow.com/a/29231016
   //test: if title casted to ObjectID matches title from object ID, we've been given an object ID.
   let testObj;
   try  { testObj = new ObjectId(title); }
   catch(err) { } //it's not a valid object ID
   if (testObj&&testObj.toString()===title) { //then this is a 24-character ObjectID corresponding to the primary key
     return new Promise(function(resolve, reject) {
       Board.findById(title,function(err,data) {
         if (err) { reject(err); }
         resolve(data);
       });
     });
   }
   else {
   return new Promise(function(resolve, reject) {
     //TODO handle conflicts of boards with the same title
     //findOne for multiple results returns the most recent match ordered by insertion time
     Board.findByTitle(title,function(err,data) {
       if (err) { reject(err); }
       resolve(data);
     });
   });
   }
 }

app.listen(process.env.PORT||3000);
