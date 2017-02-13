window.onload = function() {

console.log(window.INITIAL_STATE);
const id = window.INITIAL_STATE.data._id;
const tsv = window.INITIAL_STATE.data.data[0];
const BOARDSIZE = window.INITIAL_STATE.data.meta.size;
const avgSolveTime = window.INITIAL_STATE.data.meta.stats.averageSolveTime;
const totalSolves = window.INITIAL_STATE.data.meta.stats.totalSolves;
let secretHashKey='whoaCrazyi12$!@RT#EWAFSZFGREASDFBDABAGDS';
let indicesToWordKey = {};
let timeData = {};
//timeObj contains keys of [row, col] => word index in wordPosDict.
// we can sum all times for a given key in wordPos dict and then that's the time spent solving that word kinda
  let board = [...Array(BOARDSIZE).keys()].map(i => Array(BOARDSIZE)); //generate empty BOARDSIZE x BOARDSIZE array
  let boardState = [...Array(BOARDSIZE).keys()].map(i => Array(BOARDSIZE)); //generate empty size x size array
  for (var i=0;i<board.length;i++) { //this is ugly and probably better way to do it
    for (var j=0;j<board[i].length;j++) {
      board[i][j]='~'; //placeholder for empty cell
    }
  }

  let wordPosDict=tsvToJSON(tsv);
  board = populateBoardArray(board,wordPosDict);
  let info=document.querySelector('div#info');

  for (var i=0;i<board.length;i++) {
    for (var j=0;j<board[i].length;j++) {
      (board[i][j]!=='~') ? boardState[i][j]='' : boardState[i][j]='~';
      }
    }

  //print the board
  info.innerHTML+=`<h1>Given this TSV:</h1><br />${tsv}<br /><h1>We generate these:</h1><br /`;
  info.innerHTML+=`<h1>Board Array:</h1> <br />${JSON.stringify(board)}<br />`;
  info.innerHTML+=`<h1>Word Position Dictionary:</h1> <br /><pre>${JSON.stringify(wordPosDict,null,'\t')}</pre>`;
  let div=document.querySelector('div#board');
  populateDivWithBoard(div, board, answers=false);

  let time = new Timer();
  time.Start();
  function solveTimer(e) {
    let timeSpent=time.ProcessTimestamp(e.timeStamp);
    //save amount of time spent to the word that it was spent on
    let row=e.target.parentNode.dataset.row;
    let col=e.target.parentNode.dataset.col;
    (timeData[indicesToWordKey[`${row},${col}`]]) ? null : timeData[indicesToWordKey[`${row},${col}`]] = [];
    timeData[indicesToWordKey[`${row},${col}`]].push(timeSpent);
  }

  function compareBoardState(board,boardState) { //stringify the array and compare strings
    //TODO I18N?!?
    return JSON.stringify(board)===JSON.stringify(boardState);
  }

  function handleKeyDown(e) {
    solveTimer(e);
    let col = e.target.parentNode.dataset.col;
    let row = e.target.parentNode.dataset.row;
    let b=e.target.parentNode.style;
    if (e.key==='Backspace') {
      boardState[row][col]='';
      b.backgroundColor='';
      return true;
    }
    if (((e.shiftKey||e.metaKey)||(e.ctrlKey||e.altKey))||((e.key.length>1)||!(e.key.match(/[A-Z]/gi)))) {
      //TODO can move this input validation elsewhere probably
      return false;
    }
    let correct=e.target.parentNode.dataset.text;
    let input=md5(e.key.toUpperCase(),secretHashKey); //TODO maybe we should uppercase input by default client-side
    boardState[row][col] = input;
    if (input.match(/[A-Z]/gi)&&input!=='') {
      (correct===input) ? b.backgroundColor='#ADFF2F' : b.backgroundColor='tomato';
    }
    if (compareBoardState(board,boardState)) { //the board is over we're done
      let completionTime=time.Stop();
      inputs.forEach((input)=>{
        input.removeEventListener('keydown',handleKeyDown);
        input.disabled=true;
      });
        let stats=document.querySelector('div#boardStats');
        let storeTimeData={};
        stats.innerHTML=`<h1>Board Statistics:</h1><br /><b>WORD | TIME SPENT SOLVING (seconds) | Normalized time (time/#letters)</b><br />`;
        Object.keys(timeData).forEach((key)=>{
          let timeSpent=(timeData[key].reduce((a,b)=>(a+b),0)/1000).toFixed(3);
          let normalized=(timeSpent/key.length).toFixed(3);
          storeTimeData[key]={time:timeSpent, norm:normalized};
          stats.innerHTML+=`<b>${key}:</b> | ${timeSpent} | ${normalized}<br />`;
        });
        postCompletion(completionTime, storeTimeData);
        //increment stats.totalSolves by one (or set to 1 if it doesn't exist)
        //re-average averageSolveTime in seconds
      }
  }

  function postCompletion(timeSpent, storeTimeData) {
    let newAvgSolveTime=(((avgSolveTime*totalSolves)+timeSpent)/(totalSolves+1)).toFixed(3);
    console.log('newavg',newAvgSolveTime);
    fetch('/s',{
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    method: "POST",
    credentials: "include",
    body: `id=${id}&totalSolves=${totalSolves+1}&averageSolveTime=${newAvgSolveTime}&timeData=${JSON.stringify(storeTimeData)}`
  });
}

  let inputs=document.querySelectorAll('input.cell--text');
  inputs.forEach((input)=>input.addEventListener('keydown',handleKeyDown));

  function populatedCell(letter, x, y, printAnswer=false) {
    return (printAnswer) ? `<div class="cell" data-text="${letter}" data-row="${x}" data-col="${y}"><input type="text" maxLength="1" class="cell--text" value="${letter}"/></div>` :
    `<div class="cell" data-text="${letter}" data-row="${x}" data-col="${y}"><input type="text" maxLength="1" class="cell--text" /></div>`;
  }

  function populateDivWithBoard(div, board, answers=false)
  {
    let rowHTML;
    div.classList.add(`board-size-${BOARDSIZE}`);
    let blankCell=`<div class="cell cell--filled"></div>`;
    board.forEach((row, x) => {
      rowHTML='';
      rowHTML+=`<div class="row">`;
      row.forEach((letter, y) => {
        (letter==='~') ? rowHTML+=blankCell : rowHTML+=populatedCell(letter,x,y,answers);
      });
      rowHTML+=`</div>`;
      div.innerHTML+=rowHTML;
    });
    return;
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

  function populateBoardArray(board, wordPosDict) { //returns a board populated with words from wordsPosDict
    let clues=document.querySelector('div#clues');
    clues.innerHTML+=`<b>key | clue | direction (H/V) | word | clue code</b><br /><hr />`;
    Object.keys(wordPosDict).forEach((key)=>
    {
      let index=letNumToIndex(key); //starting array index
      let x, y, direction;
      x=index[0];
      y=index[1];
      direction=wordPosDict[key].dir;
      clues.innerHTML+=`${key} | ${wordPosDict[key].clue} | ${wordPosDict[key].dir} | ${wordPosDict[key].word} | ${wordPosDict[key].clueCode}<br />`;
    wordPosDict[key].word.split("").forEach((letter, index)=>{
      if (direction==='H') { //write to the right hehe
      //leave row (x) fixed and increment col (y) for each letter
      board[y][x+index] = md5(letter,secretHashKey);
      indicesToWordKey[`${y},${x+index}`]=wordPosDict[key].word;
        }
      else { //write it down hehe
        //leave col (y) fixed and increment row (x) for each letter
        board[x+index][y] = md5(letter,secretHashKey);
        indicesToWordKey[`${x+index},${y}`]=wordPosDict[key].word;
        }
      });
    });
    return board;
  }

  function tsvToJSON(tsv) {
  //tsv to JSON
    let wordPosDict = {};
    let rows = tsv.split("\n");
    for (var i=0;i<rows.length;i++)
    {
      //TODO better input validation maybe with a regexp to escape HTML entities or something less hacky
      rows[i]=rows[i].replace('\r',''); //need to remove the carriage returns added by textarea
      rowItems=rows[i].split("\t"); //split out tab delimited fields
    // a rowItems looks like this 1A 	BOWS	Yields Direction (H horiz, V vertical)
    //                            [0] [1]    [2]    [3]
    //TODO calculate "pretty print" for key e.g., 3 across based on direction and the first value
    //e.g., 1F ... H translates into 5 across
      wordPosDict[rowItems[0]]={word:rowItems[1], clue:rowItems[2], dir:rowItems[3]};
    }
    return wordPosDict;
  }
}
