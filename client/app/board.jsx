import {populateBoardArray, populateIndicesToWordKey, populateClueList, renderBoardHTML, postCompletion, compareBoardState, createEmptyBoard} from '../../lib/board';
const Timer = require('../../lib/time');
let React = window.React;
let ReactDOM = window.ReactDOM;

class Board extends React.Component {
  constructor(props) {
    super(props);
    let p=window.INITIAL_STATE;
    console.log(p);
    this.state = {
      answer_board: [],
      user_board: [],
      time:new Timer(),
      id: p._id,
      BOARDSIZE: p.meta.size,
      TITLE: p.meta.title,
      avgSolveTime: p.meta.stats.averageSolveTime,
      totalSolves: p.meta.stats.totalSolves,
      answer_board:populateBoardArray(createEmptyBoard(p.meta.size),p.data[0]),
      user_board:createEmptyBoard(p.meta.size),
      indicesToWordKey:populateIndicesToWordKey(p.data[0]),
      timeData:{},
      clues:populateClueList(p.data[0])
    };
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.solveTimer = this.solveTimer.bind(this);
  }

  solveTimer(e) {
    let timeSpent=this.state.time.ProcessTimestamp(e.timeStamp);
    //save amount of time spent to the word that it was spent on
    let row=e.target.parentNode.dataset.row;
    let col=e.target.parentNode.dataset.col;
    let a = this.state.indicesToWordKey; //don't directly mutate state
    let tD = this.state.timeData;
    let key=row+','+col;
    if (!tD[a[key]]) {
      tD[a[key]]=[];
    }
    tD[a[key]].push(timeSpent);
    this.setState({timeData: tD});
  }

  handleKeyDown(e) {
    this.solveTimer(e);
    let col = e.target.parentNode.dataset.col;
    let row = e.target.parentNode.dataset.row;
    let b=e.target.parentNode.style;
    if (e.key==='Backspace') {
      let a = this.state.user_board.slice(); //don't directly mutate state
      a[row][col]='';
      this.setState({user_board: a});
      b.backgroundColor='';
      return true;
    }
    if (((e.shiftKey||e.metaKey)||(e.ctrlKey||e.altKey))||((e.key.length>1)||!(e.key.match(/[A-Z]/gi)))) {
      //TODO can move this input validation elsewhere probably
      return false;
    }
    let correct=e.target.parentNode.dataset.text;
    let input=e.key.toUpperCase();//md5(e.key.toUpperCase(),secretHashKey); //TODO maybe we should uppercase input by default client-side
    let a = this.state.user_board.slice(); //don't directly mutate state
    a[row][col]=input;
    this.setState({user_board: a});
    if (input.match(/[A-Z]/gi)&&input!=='') {
      (correct===input) ? b.backgroundColor='#ADFF2F' : b.backgroundColor='tomato';
    }
    if (compareBoardState(this.state.answer_board,this.state.user_board)) { //the board is over we're done
      let completionTime=this.state.time.Stop();
      let inputs=document.querySelectorAll('input.cell--text');
      inputs.forEach((input)=>{
        input.removeEventListener('keydown',this.handleKeyDown);
        input.disabled=true;
      });
        let stats=document.querySelector('div#boardStats');
        let storeTimeData={};
        stats.innerHTML=`<h1>Board Statistics:</h1><br /><b>WORD | TIME SOLVING (seconds) | (seconds/#letters)</b><br />`;
        Object.keys(this.state.timeData).forEach((key)=>{
          let timeSpent=(this.state.timeData[key].reduce((a,b)=>(a+b),0)/1000).toFixed(3);
          let normalized=(timeSpent/key.length).toFixed(3);
          storeTimeData[key]={time:timeSpent, norm:normalized};
          stats.innerHTML+=`<b>${key}:</b> | ${timeSpent} | ${normalized}<br />`;
        });
        postCompletion(completionTime, storeTimeData, this.state.avgSolveTime, this.state.totalSolves, this.state.id, this.state.TITLE);
      }
  }

  componentDidMount() {
    //Add event listeners
    let inputs=document.querySelectorAll('input.cell--text');
    inputs.forEach((input)=>input.addEventListener('keydown',this.handleKeyDown));
    //TODO break out add clue list into separate component or something and then put here
    //right now we are setting the clue list as a side effect
    this.state.time.Start();
  }

  render() {
        let board=renderBoardHTML(this.state.answer_board, this.state.indicesToWordKey);
        return (<div className={"board board-size-" + this.state.BOARDSIZE} id="board"
        dangerouslySetInnerHTML={{__html: board}}></div>);
    }
}

  console.log('client render');
  ReactDOM.render(<Board />, document.getElementById('root'));
