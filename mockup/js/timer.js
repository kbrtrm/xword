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
}
