const fs = require('fs');
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
app.use(['/login','/register','/new','/s','/c','/solve'],bodyParser.urlencoded({extended:true}));
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
  let r=JSON.parse(req.body.meta);
  let serverObj = {};
  serverObj.meta={title:r.title, author:r.author, description: r.description, size: r.size, dateCreated:new Date(),
    stats:{totalSolves:0, averageSolveTime:0}};
  serverObj.data=JSON.parse(req.body.board);
  Board.create(serverObj, function(err, data){
    if (!err) {
    res.redirect(`/b/${data._id}`);}
  });
});

app.get('/c/:size', auth, function(req,res) {
  if(req.params.size.match(/[^0-9]/)) { res.redirect('/n'); return false;}
  let payload={data:{size:req.params.size}, user:req.session.user};
  res.render('compAssist', {data:payload});
});

app.post('/c', function(req,res) {
  let e=JSON.parse(req.body.empty);
  let size=Number(req.body.size);
  let f={};
  let board=[];
  board=createBoard(board, size);
  populateBoardArray(board, e);
  if (e) { f=populateEmptyWordDict(e, board); }
  else { res.send('OH NO YOU DID IT WRONG EMPTY POST'); }
  f.then(function(data) {
    if (Object.keys(data).length>1) { res.send(JSON.stringify(data)); }
    else { res.send('An error occured whilst generating the dictionary.'); }
  });
});

const numToWord=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen',
'sixteen','seventeen','eighteen','nineteen','twenty','twentyone','twentytwo','twentythree','twentyfour','twentyfive','twentysix','twentyseven',
'twentyeight','twentynine','thirty'];

function calculateCrossings(length, index, direction, board) {
    let x, y;
    x=index[0];
    y=index[1];
    let constraints=[];
    for (var i=0;i<length;i++) {
    if (direction==='H') { //write to the right hehe
    //leave row (x) fixed and increment col (y) for each letter
      (board[y][x+i]!=='') ? constraints.push([(x+i),board[y][x+i]]) : null;
    }
    else { //write it down hehe
      //leave col (y) fixed and increment row (x) for each letter
      (board[y+i][x]!=='') ? constraints.push([(y+i),board[y+i][x]]) : null;
      }
    }
    return constraints;
}

function placeWordOnBoard(word, index, direction, board) {
  let x, y;
  x=index[0];
  y=index[1];
  let constraints=[];
  for (var i=0;i<word.length;i++) {
  if (direction==='H') { //write to the right hehe
  //leave row (x) fixed and increment col (y) for each letter
    board[y][x+i]=word[i];
  }
  else { //write it down hehe
    //leave col (y) fixed and increment row (x) for each letter
    board[y+i][x]=word[i];
    }
  }
  return board;
}

function populateEmptyWordDict(empty, board) { //this just randomly populates with words of correct length and does not check for any constraints.
    return new Promise(function(resolve, reject) {
      wordDict=loadWordList('./static/assets/enable.txt');
      wordDict.then(function(d) { resolve(populateEmptyBoard(d, empty, board)); });
    });
  }

  function populateEmptyBoard(d, empty, board) {
      let wordCt=0;
      let wordDict, wordArrLengths={}, usedRandom={}, newWord='';
      Object.keys(d).forEach((key)=>{
        wordArrLengths[key]=d[key].length;
        wordCt+=Number(d[key].length);
    });
      Object.keys(empty).forEach((key)=>{
        //TODO: set one word H first. then check the other word relative to it.
      let constraints=calculateCrossings(empty[key].wordLength, empty[key].index, empty[key].dir, board);
      if (constraints.length) {
        newWord=findWordWithConstraint(d[numToWord[empty[key].wordLength]], constraints);
        if (newWord.length) {
          board=placeWordOnBoard(newWord, empty[key].index, empty[key].dir, board);
          empty[key].word=newWord;
          empty[key].clue=newWord;
      }
      else {
        empty[key].word='';
        empty[key].clue='';
      }
    }
      else { //if no constraints, pick randomIndex
        let randomIndex=Math.floor(Math.random()*wordArrLengths[numToWord[empty[key].wordLength]]-1);
        newWord=d[numToWord[empty[key].wordLength]][randomIndex];
        if (newWord.length) {
          empty[key].word=newWord;
          empty[key].clue=newWord;
          board=placeWordOnBoard(newWord, empty[key].index, empty[key].dir, board);
        }
        else {
          empty[key].word='';
          empty[key].clue='';
        }
      }
  });
    return empty;
}

function createBoard(board,size) {
  board = [...Array(size).keys()].map(i => Array(size));
  for (var i=0;i<board.length;i++) { //this is ugly and probably better way to do it
    for (var j=0;j<board[i].length;j++) {
      board[i][j]='~'; //placeholder for empty cell
    }
  }
  return board;
}

function populateBoardArray(board, wordPosDict) { //returns a board populated with words from wordsPosDict
  Object.keys(wordPosDict).forEach((key)=>
  {
    let x, y, direction;
    let index=wordPosDict[key].index;
    x=Number(index[0]);
    y=Number(index[1]);
    direction=wordPosDict[key].dir;
    for (var i=0;i<wordPosDict[key].wordLength;i++) {
    if (direction==='H') { //write to the right hehe
    //leave row (x) fixed and increment col (y) for each letter
    board[y][x+i] = '';
  //  indicesToWordKey[`${y},${x+index}`]=wordPosDict[key].word;
      }
    else { //write it down hehe
      //leave col (y) fixed and increment row (x) for each letter
      board[y+i][x] = '';
  //    indicesToWordKey[`${y+index},${x}`]=wordPosDict[key].word;
      }
    }
  });
  return board;
}

function letNumToIndex(letNum) { //gives starting index in 2D array to draw word
  let split = letNum.split("");
  let letter, number, index;
  number = letNum.match(/\d/gi).join(""); //return just the numbers e.g., 11A -> returns 11
  letter = letNum.match(/[A-Z]/gi).join(""); //return just the letter e.g., 11A -> returns 'A'
  index = [(letter.charCodeAt()-65),number-1]; //convert 'A' to 0
  return index;
}

app.get('/solve', function(req,res) {
  let payload={data:'', user:req.session.user};
  res.render('wordSolve', {data:payload});
});

app.post('/solve', function(req,res) {
  let wordDict, wordArrLengths={}, usedRandom={}, constraints=[];
  let word=req.body.word;
  let length=word.length;
  if (((length<2)||(length>15))||((constraints.length>3)||!constraints)) { res.send('too many constraints (max 3) or invalid length must be between 2 and 15 inclusive'); }
  else {
    for (var i=0;i<length;i++) {
      if (word[i]!=='*') { constraints.push([i,word[i]]); }
    }
    wordDict=loadWordList('./static/assets/enable.txt');
    wordDict.then(function(d) {
    let word=findWordWithConstraint(d[numToWord[length]], constraints, true);
    res.send(word);
  }).catch(function (err) {
    console.log("Promise Rejected err: ",err);
  });
  }
});

  function findWordWithConstraint(dict, constraints, all=false) {
    //constraints is an array of [index, value] pairs
    let found=false;
    let ct=0;
    let word=null;
    let foundWords=[];
    while (found===false&&ct<dict.length-1) {
      ct++;
      for (var i=0;i<constraints.length;i++) {
        if (dict[ct][constraints[i][0]]!==constraints[i][1]) {
          break;
        }
        if (i==constraints.length-1) {
          word=dict[ct];
          if (all) { foundWords.push(word); }
          else {
            found=true;
            return word;
          }
        }
      }
    }
    return foundWords;
  }

function loadWordList(filePath) {
  return new Promise(function(resolve,reject) {
    let wordDict={};
    let wordArr=[];
    fs.readFile(filePath, 'utf8', function(err, contents) {
      if(err) { reject(err); }
      wordArr=contents.split(/\r?\n/); //it is a newline-delimited text file of words, one word per line
      for (var i=0;i<wordArr.length;i++) {
      let key=numToWord[wordArr[i].length]; //gives the key for wordDict in which to push into an array
      (wordDict[key]) ? wordDict[key].push(wordArr[i]) : wordDict[key]=[wordArr[i]];
      }
      resolve(wordDict);
    });
  });
}

app.get('/new', auth, function(req,res) {
  let payload={data:'', user:req.session.user};
  res.render('newBoard', {data:payload});
});

app.get('/n/', function(req,res) {
  let payload={data:'', user:req.session.user};
  res.render('newBoard', {data:payload});
});

app.get('/n/:size', auth, function(req,res) {
  if(req.params.size.match(/[^0-9]/)) { res.redirect('/n'); return false;}
  let payload={data:{size:req.params.size}, user:req.session.user};
  res.render('prettyNew', {data:payload});
});

app.get('/b/:board', function(req,res) {
  let board = fetchBoard(req.params.board);
  board.then(function(data) {
    let payload={data:data, user:req.session.user};
    res.render('index', {data:payload});
  });
});

app.get('/boardlist', function(req,res) {
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
  Meta.saveSolveData({id:b.id, title:b.title, user:req.session.user, solveData:b.timeData}, function(err, data) {
    if (!err) {
      User.saveSolveData({username:req.session.user, solveID:data._id}, function(err, data) {
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
     //might want to remove altogether. No conflicts on saving with same title because we use OBJECT ID there
     //findOne for multiple results returns the most recent match ordered by insertion time
     Board.findByTitle(title,function(err,data) {
       if (err) { reject(err); }
       resolve(data);
     });
   });
   }
 }

app.listen(process.env.PORT||3000);
