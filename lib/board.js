function populateBoardArray(board, wordPosDict) { //returns a board populated with words from wordsPosDict
  Object.keys(wordPosDict).forEach((key)=>
  {
    let index=codeToArrayIndex(key); //starting array index
    let row, col, direction;
    row=index[0];
    col=index[1];
    direction=wordPosDict[key].dir;
    wordPosDict[key].word.split("").forEach((letter, ind)=>{
    if (direction==='H') { //write to the right
    //fix ROW and increment COL for each letter
    board[row][col+ind] = letter.toUpperCase();//md5(letter,secretHashKey);
    }
    else { //write downwards
      //fix COL and increment ROW for each letter
      board[row+ind][col] = letter.toUpperCase();//md5(letter,secretHashKey);
    }
  });
});
  return board;
}

function populateIndicesToWordKey(wordPosDict) {
  let indicesToWordKey={};
  Object.keys(wordPosDict).forEach((key)=>
  {
    let index=codeToArrayIndex(key); //starting array index
    let row, col, direction;
    row=index[0];
    col=index[1];
    direction=wordPosDict[key].dir;
    wordPosDict[key].word.split("").forEach((letter, ind)=>{
    if (direction==='H') { //write to the right
      //fix ROW and increment COL for each letter
    indicesToWordKey[`${row},${col+ind}`]=wordPosDict[key].word;
    indicesToWordKey[`${row},${col+ind},H`]=key;
    }
    else { //write downwards
      //fix COL and increment ROW for each letter
      indicesToWordKey[`${row+ind},${col}`]=wordPosDict[key].word;
      indicesToWordKey[`${row+ind},${col},V`]=key;
    }
  });
});
  return indicesToWordKey;
}

function populateClueList(wordPosDict) {
  let clues=document.querySelector('div#clueList');
  let acrossList=document.querySelector('ul#acrossList');
  let downList=document.querySelector('ul#downList');
  let listClueNum = 0;
  let prevClueCell = '';
  let thisClue;
  //clues+=`${key} | ${wordPosDict[key].clue} | ${wordPosDict[key].dir} | ${wordPosDict[key].word}<br />`;
  //ordering wordPosDict so that the items can be iterated over to create across and down lists
  const orderedWordPosDict = {};
  Object.keys(wordPosDict).sort().forEach(function(key) {
    orderedWordPosDict[key] = wordPosDict[key];
  });

  Object.keys(orderedWordPosDict).forEach((key, i)=>
  {
    if (Object.keys(orderedWordPosDict)[i].split('-')[0] == prevClueCell) {
      prevClueCell = Object.keys(orderedWordPosDict)[i].split('-')[0];
    } else {
      listClueNum++;
      prevClueCell = Object.keys(orderedWordPosDict)[i].split('-')[0];
    }

    thisClue = '<li><span class="cluelist--number">' + listClueNum + '</span>' + orderedWordPosDict[key].clue + '</li>';
    if (orderedWordPosDict[key].clue!=='') {
      if (orderedWordPosDict[key].dir === 'H') {
      acrossList.innerHTML += thisClue;
      } else {
      downList.innerHTML += thisClue;
    }
    }
  });
  //clues+=`<b>key | clue | direction (H/V) | word</b><br /><hr />`
  //  clues+=acrossList;
  //  clues+=downList;
  //  return clues;
  return true;
}

function codeToArrayIndex(code) { //gives starting index in 2D array to draw word
  let split = code.split("-");
  let row=parseInt(split[0])-1; // minus 1 as our array is zero-indexed but our code starts at 1
  let col=parseInt(split[1])-1; // parseInt since the zero padded number will be a string
  return [row, col];
}

function populatedCell(letter, x, y, VPK, HPK, printAnswer=false) {
  return (printAnswer) ? `<div class="cell" data-text="${letter}" data-VPK="${VPK}" data-HPK="${HPK}" data-row="${x}" data-col="${y}"><input type="text" maxLength="1" class="cell--text" value="${letter}"/></div>` :
  `<div class="cell" data-text="${letter}" data-VPK="${VPK}" data-HPK="${HPK}" data-row="${x}" data-col="${y}"><input type="text" maxLength="1" class="cell--text" /></div>`;
}

function renderBoardHTML(board, indicesToWordKey, answers=false)
{ //x is row, y is column
  let rowHTML='';
  let boardHTML='';
  board.forEach((row, x) => {
    rowHTML='';
    rowHTML+=`<div class="row">`;
    row.forEach((letter, y) => {
      let VPK=indicesToWordKey[`${x},${y},V`]||''; //we want it to be empty string, not undefined, for unmatched key
      let HPK=indicesToWordKey[`${x},${y},H`]||'';
      let blankCell=`<div class="cell cell--filled" data-row="${x}" data-VPK="${VPK}" data-HPK="${HPK}" data-col="${y}"></div>`;
      (letter==='~') ? rowHTML+=blankCell : rowHTML+=populatedCell(letter,x,y,VPK,HPK,answers);
    });
    rowHTML+=`</div>`;
    boardHTML+=rowHTML;
  });
  return boardHTML;
}

function postCompletion(timeSpent, storeTimeData, avgSolveTime, totalSolves, id, title) {
  //increments stats.totalSolves by one (or set to 1 if it doesn't exist)
  //re-averages averageSolveTime in seconds
  let newAvgSolveTime=(((avgSolveTime*totalSolves)+timeSpent)/(totalSolves+1)).toFixed(3);
  fetch('/s',{
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
  },
  method: "POST",
  credentials: "include",
  body: `id=${id}&title=${title}&totalSolves=${totalSolves+1}&averageSolveTime=${newAvgSolveTime}&timeData=${JSON.stringify(storeTimeData)}`
}); //TODO add catch for error and return values
}

function compareBoardState(A,B) { //stringify the array and compare strings
  //TODO I18N?!?
  if (!(Array.isArray(A)||Array.isArray(B))) { throw new Error('Boards must be of type Array'); }
  return JSON.stringify(A)===JSON.stringify(B);
}

function createEmptyBoard(size) {
  let b = [...Array(size).keys()].map(i => Array(size));
  for (var i=0;i<b.length;i++) {
    for (var j=0;j<b[i].length;j++) {
      b[i][j]='~'; //placeholder for empty cell
    }
  }
  return b;
}

module.exports = {populateBoardArray, populateClueList, renderBoardHTML, postCompletion, compareBoardState, createEmptyBoard, populateIndicesToWordKey, codeToArrayIndex};
