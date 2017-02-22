var mongodb = require('mongodb');

function newKeyFromOld(key, dir) { //turns 1A into 01-01-V or H for dir
  let split = key.split("");
  let row = key.match(/\d/gi).join(""); //return just the numbers e.g., 11A -> returns 11
  let col = key.match(/[A-Z]/gi).join(""); //return just the letter e.g., 11A -> returns 'A'
  col=(col.charCodeAt()-65)+1;
  let zPadRow, zPadCol;
  (row<10) ? zPadRow="0"+row : zPadRow=row;
  (col<10) ? zPadCol="0"+col : zPadCol=col;
  return `${zPadRow}-${zPadCol}-${dir}`;
}

exports.up = function(db, next){
  db.collection('boards').find({}, function(err,boards) {
    boards.forEach((board)=>{
      let d=board.data;
      let id=board._id;
      let newObj={};
      Object.keys(d).forEach((key)=>{
        let oldValue=d[key];
        let dir=d[key].dir;
        let newKey=newKeyFromOld(key, dir);
        newObj[newKey]=oldValue;
      });
    db.collection('boards').update({_id:id}, {$set:{data:newObj} });
  });
  next();
});
};

function oldKeyFromNew(key) { // turns 01-01-V into 1A
  let split = key.split("-");
  let row = parseInt(split[0]);
  let col = parseInt(split[1]);
  col=String.fromCharCode(col+64);
  return `${row}${col}`;
}

exports.down = function(db, next){
  db.collection('boards').find({}, function(err,boards) {
    boards.forEach((board)=>{
      let d=board.data;
      let id=board._id;
      let newObj={};
      Object.keys(d).forEach((key)=>{
        let oldValue=d[key];
        let newKey=oldKeyFromNew(key);
        newObj[newKey]=oldValue;
      });
    db.collection('boards').update({_id:id}, {$set:{data:newObj} });
    });
  });
  next();
};
