/* This file contains tests for ../lib/time.js
Current limitations: we can't test the Timer functions directly since they mutate the DOM which does not exist on the server
TODO break these DOM-dependent tests out into browser test page that includes Chai & the client script(s) we desire to test
*/
var expect = require("chai").expect;
var Timer = require("../lib/time");

describe("Timer", function() {
  describe("Default settings for new timer", function() {
  it("has a default TimeoutInSeconds of 5 seconds", function() {
    var time = new Timer;
    expect(time.timeoutInSeconds).to.equal(5);
  });
  it("has a default secondsElapsed of 0 seconds", function() {
    var time = new Timer;
    expect(time.secondsElapsed).to.equal(0);
  });
  it("is paused by default", function() {
    var time = new Timer;
    expect(time.paused).to.equal(true);
  });
  it("is not STOPPED (signifying completely done) by default", function() {
    var time = new Timer;
    expect(time.stopped).to.equal(false);
  });
  });
});
