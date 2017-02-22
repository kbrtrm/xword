/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

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


/***/ }),
/* 1 */
/***/ (function(module, exports) {

function Timer() {
  this.interval = 100; //run 10x/second if we don't receive a keyboard event to ProcessTimestamp
  this.paused = true;
  this.startTime;
  this.secondsElapsed=0;
  this.intervalID;
  this.lastTimeStamp;
  this.currentTimeStamp;
  this.secondsInactive;
  this.keyPressIntervals=[];
  this.timeoutInSeconds=5; //stop counting if no timestamps come in for five seconds from keyboard activity
  this.stopped=false;
}

Timer.prototype.Start = function (initialTimeStamp) {
  if (this.stopped) { return false; }
  this.paused = false;
  this.intervalID = setInterval(()=>this.Tick(),this.interval);
  this.startTime = new Date(Date.now());
  this.lastTimeStamp=initialTimeStamp;
}

Timer.prototype.ProcessTimestamp = function (timestamp) {
  //gives distance between current and last timestamp
  let timeout=this.timeoutInSeconds;
  if (this.paused||this.stopped) { return false; }
  let distance;
  if (this.lastTimeStamp) {
    this.currentTimeStamp=timestamp;
    distance = this.currentTimeStamp-this.lastTimeStamp;
    this.keyPressIntervals.push(distance);
  }
  else {
    this.keyPressIntervals.push(timestamp);
  }
  this.lastTimeStamp = timestamp;
  if (this.keyPressIntervals[this.keyPressIntervals.length-1]/1000<timeout) { // return the most recent pushed
    return this.keyPressIntervals[this.keyPressIntervals.length-1];
  }
  else {
    return 0;
  }
}

Timer.prototype.Tick = function () {
  if (this.paused||this.stopped) { return false; }
  let now = new Date(Date.now());
  this.secondsElapsed=(now-this.startTime)/1000;
  this.Display();
}

Timer.prototype.isPaused = () => this.paused;
Timer.prototype.isStopped = () => this.stopped;

Timer.prototype.Display = function(message) {
  let div=document.querySelector('div#solveTime');
  (message) ? div.innerHTML=message : div.innerHTML=`${this.secondsElapsed.toFixed(2)} seconds`;
}

Timer.prototype.Stop = function () {
  this.stopped=true;
  let timeout=this.timeoutInSeconds;
  (this.paused = !this.paused) ? clearInterval(this.intervalID) : this.Start();
  let solveTime=this.keyPressIntervals.filter((i)=>i/1000<timeout);
  solveTime=solveTime.reduce((a,b)=>(a+b),0);
  this.Display(`Puzzle solved in ${(solveTime/1000).toFixed(2)} seconds!`);
  return solveTime/1000;
}

module.exports=Timer;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _board = __webpack_require__(0);

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Timer = __webpack_require__(1);
var React = window.React;
var ReactDOM = window.ReactDOM;

var Board = function (_React$Component) {
  _inherits(Board, _React$Component);

  function Board(props) {
    var _this$state;

    _classCallCheck(this, Board);

    var _this = _possibleConstructorReturn(this, (Board.__proto__ || Object.getPrototypeOf(Board)).call(this, props));

    var p = window.INITIAL_STATE;
    console.log(p);
    _this.state = (_this$state = {
      answer_board: [],
      user_board: [],
      time: new Timer(),
      id: p._id,
      BOARDSIZE: p.meta.size,
      TITLE: p.meta.title,
      avgSolveTime: p.meta.stats.averageSolveTime,
      totalSolves: p.meta.stats.totalSolves
    }, _defineProperty(_this$state, 'answer_board', (0, _board.populateBoardArray)((0, _board.createEmptyBoard)(p.meta.size), p.data[0])), _defineProperty(_this$state, 'user_board', (0, _board.createEmptyBoard)(p.meta.size)), _defineProperty(_this$state, 'indicesToWordKey', (0, _board.populateIndicesToWordKey)(p.data[0])), _defineProperty(_this$state, 'timeData', {}), _defineProperty(_this$state, 'clues', (0, _board.populateClueList)(p.data[0])), _this$state);
    _this.handleKeyDown = _this.handleKeyDown.bind(_this);
    _this.solveTimer = _this.solveTimer.bind(_this);
    return _this;
  }

  _createClass(Board, [{
    key: 'solveTimer',
    value: function solveTimer(e) {
      var timeSpent = this.state.time.ProcessTimestamp(e.timeStamp);
      //save amount of time spent to the word that it was spent on
      var row = e.target.parentNode.dataset.row;
      var col = e.target.parentNode.dataset.col;
      var a = this.state.indicesToWordKey; //don't directly mutate state
      var tD = this.state.timeData;
      var key = row + ',' + col;
      if (!tD[a[key]]) {
        tD[a[key]] = [];
      }
      tD[a[key]].push(timeSpent);
      this.setState({ timeData: tD });
    }
  }, {
    key: 'handleKeyDown',
    value: function handleKeyDown(e) {
      var _this2 = this;

      this.solveTimer(e);
      var col = e.target.parentNode.dataset.col;
      var row = e.target.parentNode.dataset.row;
      var b = e.target.parentNode.style;
      if (e.key === 'Backspace') {
        var _a = this.state.user_board.slice(); //don't directly mutate state
        _a[row][col] = '';
        this.setState({ user_board: _a });
        b.backgroundColor = '';
        return true;
      }
      if (e.shiftKey || e.metaKey || e.ctrlKey || e.altKey || e.key.length > 1 || !e.key.match(/[A-Z]/gi)) {
        //TODO can move this input validation elsewhere probably
        return false;
      }
      var correct = e.target.parentNode.dataset.text;
      var input = e.key.toUpperCase(); //md5(e.key.toUpperCase(),secretHashKey); //TODO maybe we should uppercase input by default client-side
      var a = this.state.user_board.slice(); //don't directly mutate state
      a[row][col] = input;
      this.setState({ user_board: a });
      if (input.match(/[A-Z]/gi) && input !== '') {
        correct === input ? b.backgroundColor = '#ADFF2F' : b.backgroundColor = 'tomato';
      }
      if ((0, _board.compareBoardState)(this.state.answer_board, this.state.user_board)) {
        //the board is over we're done
        var completionTime = this.state.time.Stop();
        var inputs = document.querySelectorAll('input.cell--text');
        inputs.forEach(function (input) {
          input.removeEventListener('keydown', _this2.handleKeyDown);
          input.disabled = true;
        });
        var stats = document.querySelector('div#boardStats');
        var storeTimeData = {};
        stats.innerHTML = '<h1>Board Statistics:</h1><br /><b>WORD | TIME SOLVING (seconds) | (seconds/#letters)</b><br />';
        Object.keys(this.state.timeData).forEach(function (key) {
          var timeSpent = (_this2.state.timeData[key].reduce(function (a, b) {
            return a + b;
          }, 0) / 1000).toFixed(3);
          var normalized = (timeSpent / key.length).toFixed(3);
          storeTimeData[key] = { time: timeSpent, norm: normalized };
          stats.innerHTML += '<b>' + key + ':</b> | ' + timeSpent + ' | ' + normalized + '<br />';
        });
        (0, _board.postCompletion)(completionTime, storeTimeData, this.state.avgSolveTime, this.state.totalSolves, this.state.id, this.state.TITLE);
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this3 = this;

      //Add event listeners
      var inputs = document.querySelectorAll('input.cell--text');
      inputs.forEach(function (input) {
        return input.addEventListener('keydown', _this3.handleKeyDown);
      });
      //TODO break out add clue list into separate component or something and then put here
      //right now we are setting the clue list as a side effect
      this.state.time.Start();
    }
  }, {
    key: 'render',
    value: function render() {
      var board = (0, _board.renderBoardHTML)(this.state.answer_board, this.state.indicesToWordKey);
      return React.createElement('div', { className: "board board-size-" + this.state.BOARDSIZE, id: 'board',
        dangerouslySetInnerHTML: { __html: board } });
    }
  }]);

  return Board;
}(React.Component);

console.log('client render');
ReactDOM.render(React.createElement(Board, null), document.getElementById('root'));

/***/ })
/******/ ]);