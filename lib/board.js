function populateBoardArray(board, wordPosDict) { //returns a board populated with words from wordsPosDict
  Object.keys(wordPosDict).forEach((key)=>
  {
    let index=codeToArrayIndex(key); //starting array index
    let x, y, direction;
    x=index[0];
    y=index[1];
    direction=wordPosDict[key].dir;
    wordPosDict[key].word.split("").forEach((letter, ind)=>{
    if (direction==='H') { //write to the right hehe
    //leave row (x) fixed and increment col (y) for each letter
    board[y][x+ind] = letter.toUpperCase();//md5(letter,secretHashKey);
    }
    else { //write it down hehe
      //leave col (y) fixed and increment row (x) for each letter
      board[y+ind][x] = letter.toUpperCase();//md5(letter,secretHashKey);
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
    let x, y, direction;
    x=index[0];
    y=index[1];
    direction=wordPosDict[key].dir;
    wordPosDict[key].word.split("").forEach((letter, ind)=>{
    if (direction==='H') { //write to the right hehe
    //leave row (x) fixed and increment col (y) for each letter
    indicesToWordKey[`${y},${x+ind}`]=wordPosDict[key].word;
    }
    else { //write it down hehe
      //leave col (y) fixed and increment row (x) for each letter
      indicesToWordKey[`${y+ind},${x}`]=wordPosDict[key].word;
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

//A thru O maps to 0->14 horizontally
//numbers map to array rows vertically
//A.charCodeAt()-65 is 0, O.charCodeAt()-65 is 14.
function letNumToIndex(letNum) { //gives starting index in 2D array to draw word
  let split = letNum.split("");
  let letter, number, index;
  number = letNum.match(/\d/gi).join(""); //return just the numbers e.g., 11A -> returns 11
  letter = letNum.match(/[A-Z]/gi).join(""); //return just the letter e.g., 11A -> returns 'A'
  index = [(letter.charCodeAt()-65),number-1]; //convert 'A' to 0
  return index;
}

function codeToArrayIndex(code) { //gives starting index in 2D array to draw word
  let split = code.split("-");
  let row=parseInt(split[0])-1; // minus 1 as our array is zero-indexed but our code starts at 1
  let col=parseInt(split[1])-1; // parseInt since the zero padded number will be a string
  return [col, row];
}

function populatedCell(letter, x, y, printAnswer=false) {
  return (printAnswer) ? `<div class="cell" data-text="${letter}" data-row="${x}" data-col="${y}"><input type="text" maxLength="1" class="cell--text" value="${letter}"/></div>` :
  `<div class="cell" data-text="${letter}" data-row="${x}" data-col="${y}"><input type="text" maxLength="1" class="cell--text" /></div>`;
}

function renderBoardHTML(board, answers=false)
{
  let rowHTML='';
  let boardHTML='';
  board.forEach((row, x) => {
    rowHTML='';
    rowHTML+=`<div class="row">`;
    row.forEach((letter, y) => {
      let blankCell=`<div class="cell cell--filled" data-row="${x}" data-col="${y}"></div>`;
      (letter==='~') ? rowHTML+=blankCell : rowHTML+=populatedCell(letter,x,y,answers);
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

function compareBoardState(board,boardState) { //stringify the array and compare strings
  //TODO I18N?!?
  return JSON.stringify(board)===JSON.stringify(boardState);
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

module.exports = {populateBoardArray, populateClueList, renderBoardHTML, postCompletion, compareBoardState, createEmptyBoard, populateIndicesToWordKey};
