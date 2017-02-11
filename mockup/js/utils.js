window.onload = function() {

const tsv = `1A	BOWS	Yields	H
1F	RETIP	Fix a broken cue stick, perhaps	H
1L	ICON	Religious work of art	H
2A	ERIE	Northwestern Pennsylvania Tribe	H
2F	ACOTE	Next to, to Jacques	H
2L	SHUE	Adventures in Babysitting actress Elizabeth	H
3A	TAKE	In Bridge, win (a trick)	H
3F	SHUCK	Denude a cob	H
3L	LESS	"___ is more"	H
4A	ALINKTOTHEPAST	An ancient connection?	H
5E	LEE	Big name in jeans	H
5J	DUNTS	Dull-sounding blows	H
6A	SKYWARDSWORD	An implement for stabbing birds?	H
7A	ACROSS	Puzzle direction	H
7H	TOGA	Frat chant	H
7M	SPA	Restful retreat	H
8A	TALK	It's cheap, idiomatically	H
8G	DAO	"The Way," To Lao-Tzu	H
8L	FULL	The result of combining two optomists' glasses	H
9A	SLY	Cagy	H
9E	APES	Mimic	H
9J	ITALIA	Home, to Giuseppe	H
10D	THEWINDWAKER	He who rouses Aeolus?	H
11B	FREON	DuPont refrigerant	H
11I	EOE	Job description acronym	H
12B	LINKSAWAKENING	The advent of HTML?	H
13A	WOTD	Email subscription for logophiles? (abbr.)	H
13F	ACORN	_____ squash	H
13L	ONIR	Mononymous Indian film director	H
14A	ASHE	Tennis's Arthur	H
14F	VIDEO	Audio partner	H
14L	MENU	Restaurant reading	H
15A	TSAR	Nicholas was last official one	H
15F	EVERT	Upset	H
15L	EPEE	Small sword	H`;

  let size = 15;
  let board = [...Array(size).keys()].map(i => Array(size)); //generate empty size x size array
  for (var i=0;i<board.length;i++) { //this is ugly and probably better way to do it
    for (var j=0;j<board[i].length;j++) {
      board[i][j]='~'; //placeholder for empty cell
    }
  }
  let wordPosDict=tsvToJSON(tsv);
  board = populateBoardArray(board,wordPosDict);
  let info=document.querySelector('div#info');

  //print the board
  info.innerHTML+=`<h1>Given this TSV:</h1><br />${tsv}<br /><h1>We generate these:</h1><br /`;
  info.innerHTML+=`<h1>Board Array:</h1> <br />${JSON.stringify(board)}<br />`;
  info.innerHTML+=`<h1>Word Position Dictionary:</h1> <br /><pre>${JSON.stringify(wordPosDict,null,'\t')}</pre>`;
  let div=document.querySelector('div#board');
  populateDivWithBoard(div, board, answers=false);
  let divWithAnswers=document.querySelector('div#boardWithAnswers');
  populateDivWithBoard(divWithAnswers, board, answers=true);


  function handleKeyDown(e) {
    let b=e.target.parentNode.style;
    if (e.key==='Backspace') {
      b.backgroundColor='';
      return true;
    }
    if (((e.shiftKey||e.metaKey)||(e.ctrlKey||e.altKey))||((e.key.length>1)||!(e.key.match(/[A-Z]/gi)))) {
      //TODO can move this input validation elsewhere probably
      return false;
    }
    let correct=e.target.parentNode.dataset.text;
    let input=e.key.toUpperCase(); //TODO maybe we should uppercase input by default client-side
    if (input.match(/[A-Z]/gi)&&input!=='') {
      (correct===input) ? b.backgroundColor='#ADFF2F' : b.backgroundColor='tomato';
    }
    console.log(e.target.parentNode.dataset);
  }

  let inputs=document.querySelectorAll('input.cell--text');
  inputs.forEach((input)=>input.addEventListener('keydown',handleKeyDown));

  function populatedCell(letter, x, y, printAnswer=false) {
    return (printAnswer) ? `<div class="cell" data-text="${letter}" data-row="${x}" data-col="${y}"><input type="text" maxLength="1" class="cell--text" value="${letter}"/></div>` :
    `<div class="cell" data-text="${letter}" data-row="${x}" data-col="${y}"><input type="text" maxLength="1" class="cell--text" /></div>`;
  }

  function populateDivWithBoard(div, board, answers=false)
  {
    console.log('called');
    let rowHTML;
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
      board[y][x+index] = letter;
        }
      else { //write it down hehe
        //leave col (y) fixed and increment row (x) for each letter
        board[x+index][y] = letter;
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
