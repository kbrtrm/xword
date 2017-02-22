window.onload = function() {
  let COMPFILL=true;
  let div=document.querySelector('div#board');
  let wordPosDict = {};
  let board;
  let boardState;
  const size = Math.max(Math.min(window.INITIAL_STATE.data.size,15),1);

  function createBoard(board,size) {
    board = [...Array(size).keys()].map(i => Array(size));
    for (var i=0;i<board.length;i++) { //this is ugly and probably better way to do it
      for (var j=0;j<board[i].length;j++) {
        board[i][j]='~'; //placeholder for empty cell
      }
    }
    return board;
  }

  function createBoardState(board, boardState, size) {
    boardState = [...Array(size).keys()].map(i => Array(size));
    for (var i=0;i<board.length;i++) {
      for (var j=0;j<board[i].length;j++) {
        boardState[i][j]='';
        }
      }
      return boardState;
    }

    function createSize(size) { //TODO prequel to dynamic size changing in editor, event listener on a slider and change this
      //TODO We need to get this to play nice with the jQuery script to update numbers and such
      board=createBoard(board,size);
      boardState=createBoardState(board,boardState,size);
      populateDivWithBlankBoard(div, size);
      let inputs=document.querySelectorAll('input.cell--text');
      inputs.forEach((input)=>input.addEventListener('keydown',handleKeyDown));
      inputs.forEach((input)=>input.addEventListener('click',function(e){e.stopPropagation();}));
      document.querySelectorAll('div.cell').forEach((c)=>c.addEventListener('click',handleClick,true));
      document.addEventListener('keydown', handleDocKey);
    }

    createSize(size);

      function fillEmptyWithBlack(board) {
        for (var i=0;i<board.length;i++) {
          for (var j=0;j<board[i].length;j++) {
            (board[i][j]==='') ? board[i][j]='~' : null;
      }
    }
    return board;
  }

      function handleDocKey(e) {
        if (e.code==='Space') {
          let div=document.querySelector('div#board');
          div.innerHTML='';
          boardState=fillEmptyWithBlack(boardState);
          generateTheDictionary(boardState);
          fetchTheClues(wordPosDict);
          populateDivWithBoard(div, boardState, true);
          document.removeEventListener('keydown', handleDocKey);
        }
      }

  function fetchTheClues(wordPosDict) {
    let clues=document.querySelector('div#clues');
    clues.style.display='block';
    clues.innerHTML+=`<input type="text" class="meta" name="title" placeholder="Title" autofocus required/><br />
    <input type="text" class="meta" name="author" placeholder="Author" required /><br />
    <input type="text" class="meta" name="description" placeholder="Description" /><br />`;
    Object.keys(wordPosDict).forEach((word)=>{
      let clueInput=document.createElement('div');
      clueInput.innerHTML=`<h2>${wordPosDict[word].word} clue:</h2> <input type="text" class="clue" id="${word}" length="100" placeholder="${wordPosDict[word].clue}" />`;
      clues.append(clueInput);
    });
    let clueSubmit=document.querySelector('div#submitClues');
    clueSubmit.style.display='inline';
    document.querySelector('form#new').addEventListener('submit', handleSubmit);
  }

  function handleSubmit(e) {
    let meta={};
    e.preventDefault();
    let clues=document.querySelectorAll('input.clue');
    clues.forEach((clue)=>{
      wordPosDict[clue.id].clue=clue.value||wordPosDict[clue.id].word;
    });
    let m=document.querySelectorAll('input.meta');
    m.forEach((piece)=>{
      meta[piece.name]=piece.value;
    });
    meta.size=size;
    postNewBoard(wordPosDict,meta);
  }

  function postNewBoard(exportDict,meta) {
    fetch('/new',{
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    method: "POST",
    credentials: "include",
    body: `board=${JSON.stringify(exportDict)}&meta=${JSON.stringify(meta)}`
  }).then(function(response) {
  if(response.ok) {
    window.location=response.url;
  }
});
}

  function handleKeyDown(e) {
    let col = e.target.parentNode.dataset.col;
    let row = e.target.parentNode.dataset.row;
    let b=e.target.parentNode.style;
    if (e.key==='Backspace') {
      boardState[row][col]='';
      b.backgroundColor='';
      return true;
    }
    if (((e.shiftKey||e.metaKey)||(e.ctrlKey||e.altKey))||((e.key.length>1)||!(e.key.match(/[A-Z]/gi)))) {
      return false;
    }
    let correct=e.target.parentNode.dataset.text;
    //let input=md5(e.key.toUpperCase(),secretHashKey);
    let input=e.key.toUpperCase();
    boardState[row][col] = input;
  }

  function handleClick(e) {
    e.stopPropagation();
    if (e.target.id!=='iLetter') { return false; }
    if (e.shiftKey) {
      let row=e.target.dataset.row;
      let col=e.target.dataset.col;
      if (e.target.parentNode.classList.contains('cell--filled')) {
        e.target.parentNode.classList.remove('cell--filled');
        e.target.disabled=false;
        boardState[row][col]='';
      }
      else {
        e.target.parentNode.classList.add('cell--filled');
        e.target.value='';
        let b=e.target.parentNode.style;
        b.backgroundColor='';
        e.target.disabled=true;
        boardState[row][col]='~';
      }
    }
  }

  function populatedCell(letter, x, y, printAnswer=false) {
    return (printAnswer) ? `<div class="cell" data-text="${letter}" data-row="${x}" data-col="${y}"><input type="text" maxLength="1" class="cell--text" value="${letter}"/></div>` :
    `<div class="cell" data-text="${letter}" data-row="${x}" data-col="${y}"><input type="text" maxLength="1" class="cell--text" /></div>`;
  }

  function populateDivWithBoard(div, board, answers=false)
  {
    div.innerHTML='';
    let rowHTML;
    // let blankCell=`<div class="cell cell--filled"></div>`;
    board.forEach((row, x) =>  {
      rowHTML='';
      rowHTML+=`<div class="row">`;
      row.forEach((letter, y) => {
        let blankCell=`<div class="cell cell--filled" data-row="${x}" data-col="${y}"></div>`;
        (letter==='~') ? rowHTML+=blankCell : rowHTML+=populatedCell(letter,x,y,answers);
      });
      rowHTML+=`</div>`;
      div.innerHTML+=rowHTML;
    });
    return;
  }

  function populateDivWithBlankBoard(div, size)
  {
    div.innerHTML='';
    div.classList='';
    div.classList.add(`board`,`board-size-${size}`);
    for (var i=0;i<size;i++) {
      let rowHTML=`<div class="row">`;
      for (var j=0;j<size;j++) {
        rowHTML+=`<div class="cell" data-row="${i}" data-col="${j}"><input type="text" maxLength="1" data-row="${i}" data-col="${j}" class="cell--text" id="iLetter"/></div>`;
      }
      div.innerHTML+=rowHTML;
    }
    return;
  }

  function codeToArrayIndex(code) { //gives starting index in 2D array to draw word
    let split = code.split("-");
    let row=parseInt(split[0])-1; // minus 1 as our array is zero-indexed but our code starts at 1
    let col=parseInt(split[1])-1; // parseInt since the zero padded number will be a string
    return [row, col];
  }

  function indexToCode(row, col) { //gives starting index in 2D array to draw word
      let zPadRow, zPadCol;
      (row<9) ? zPadRow="0"+(row+1) : zPadRow=row+1;
      (col<9) ? zPadCol="0"+(col+1) : zPadCol=col+1;
      return `${zPadRow}-${zPadCol}`;
  }
  
  function populateBoardArray(board, wordPosDict) { //returns a board populated with words from wordsPosDict
    let clues=document.querySelector('div#clues');
    clues.innerHTML+=`<b>key | clue | direction (H/V) | word | clue code</b><br /><hr />`;
    Object.keys(wordPosDict).forEach((key)=>
    {
      let index=codeToArrayIndex(key); //starting array index
      let row, col, direction;
      row=index[0];
      col=index[1];
      direction=wordPosDict[key].dir;
      clues.innerHTML+=`${key} | ${wordPosDict[key].clue} | ${wordPosDict[key].dir} | ${wordPosDict[key].word} | ${wordPosDict[key].clueCode}<br />`;
    wordPosDict[key].word.split("").forEach((letter, index)=>{
      if (direction==='H') { //write to the right
      //fix ROW and increment COL for each letter
      board[row][col+index] = letter.toUpperCase(); //md5(letter,secretHashKey);
      indicesToWordKey[`${row},${col+index}`]=wordPosDict[key].word;
        }
      else { //write downwards
        //fix COL and increment ROW for each letter
        board[row+index][col] = letter.toUpperCase(); //md5(letter,secretHashKey);
        indicesToWordKey[`${row+index},${col}`]=wordPosDict[key].word;
        }
      });
    });
    return board;
  }

  function generateTheDictionary(testArr) {
    let currentWordCode;
    let currentWord=[];
    let wordDirection;

    //call with i to determine whether we can access this index
    let up=canLookUp(testArr.length);
    let down=canLookDown(testArr.length);
    //call with j to determine whether we can access this index
    let left=canLookLeft(testArr.length);
    let right=canLookRight(testArr.length);

  let alreadyUsed={}; //alreadyUsed maps an [row, col] to a V or an H.
  //if V, index has already been used in a Vertical word
  //if H, index has already been used in a Horizontal word

  //find horizontal words and log them
  for (var i=0;i<testArr.length;i++) {
    for (var j=0;j<testArr[i].length;j++) {
      if (!isCellEmpty(testArr[i][j])&&!alreadyUsed[`${i},${j}`]) {
        currentWord=[];
        if ((right(j)&&!isCellEmpty(testArr[i][j+1]))) {
          //the cell to the right is empty and we're not at the right side of the board
          currentWordCode=indexToCode(i,j);
          let ct=j;
          currentWord.push(testArr[i][ct]);
          alreadyUsed[`${i},${ct}`]=wordDirection;
          wordDirection='H';
          let go=true;
          while (go&&right(ct)) { //go to the right storing letters
            ct++;
            if(!isCellEmpty(testArr[i][ct])) {
              currentWord.push(testArr[i][ct]);
              alreadyUsed[`${i},${ct}`]=wordDirection;
              }
              else {
                go=false;
              }
            }
            currentWord=currentWord.join("");
            dictionize(currentWordCode, currentWord, wordDirection);
          }
        }
        else { //the cell is empty.
          continue;
          }
        }
      }

  alreadyUsed={}; //alreadyUsed maps an [row, col] to a V or an H.
  //find vertical words and log them
  for (var i=0;i<testArr.length;i++) {
    for (var j=0;j<testArr[i].length;j++) {
      if (!isCellEmpty(testArr[i][j])&&!alreadyUsed[`${i},${j}`]) {
        currentWord=[];
        if ((up(i)&&isCellEmpty(testArr[i-1][j]))||(!up(i))) { //the cell above us is empty or we're at the top of the board
          //we are at the top of a word, so test if it's vertical or horizontal
          currentWordCode=indexToCode(i,j);
          if (down(i)&&!isCellEmpty(testArr[i+1][j])) { //the cell below us is NOT empty, the word is vertical
            let ct=i;
            currentWord.push(testArr[ct][j]);
            wordDirection='V';
            alreadyUsed[`${ct},${j}`]=wordDirection;
            let go=true;
            while (down(ct)&&go) { //go down to the bottom storing letters
              ct++;
              if (!isCellEmpty(testArr[ct][j])) {
                currentWord.push(testArr[ct][j]);
                alreadyUsed[`${ct},${j}`]=wordDirection;
              }
              else {go=false;}
            }
            currentWord=currentWord.join("");
            dictionize(currentWordCode, currentWord, wordDirection);
          }
        }
      }
    }
  }
  return alreadyUsed;
  }

  function isCellEmpty(cell) {
    return (cell==='~'||cell==='');
  }

  function canLookUp(length) {
    return function(i) {
      return (i>0);
    }
  }
  function canLookDown(length) {
    return function(i) {
      return (i<length-1);
    }
  }
  function canLookLeft(length) {
    return function(j) {
      return (j>0);
    }
  }
  function canLookRight(length) {
    return function(j) {
      return (j<length-1);
    }
  }

  function dictionize(code, word, direction, clue) {
    clue=clue||`${word}`;
    wordPosDict[`${code}-${direction}`] = {word:word,clue:clue,dir:direction};
  }
}
