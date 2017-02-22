/* This file contains tests for ../lib/board.js

*/
var expect = require("chai").expect;
var board = require("../lib/board");

describe("createEmptyBoard", function() {
  it("creates a 2D board of the specified size", function() {
    var newBoard=board.createEmptyBoard(4);
    var boundsAndTildes=(newBoard[3][3]===newBoard[0][0])&&(newBoard[0][0]==='~');
    expect (boundsAndTildes).to.equal(true);
  });
  it("populates the empty board with SIZExSIZE tildes", function() {
    var newBoard=board.createEmptyBoard(4);
    var tildeCt=0;
    for (var i=0;i<newBoard.length;i++) {
      for (var j=0;j<newBoard[i].length;j++) {
        (newBoard[i][j]==='~') ? tildeCt++ : null;
      }
    }
    expect (tildeCt).to.equal(16);
  });
});

describe("codeToArrayIndex", function() {
  it("converts a number in format RR-CC-DIR to array indices", function() {
    var initialCode='11-12-H';
    var converted=board.codeToArrayIndex(initialCode);
    expect (converted).to.eql([10,11]); //eql instead of equal is deep-equals
  });
});

describe("compareBoardState", function() {
  describe("Board Array Comparison", function() {
    it("returns true if the boards contain the same values with no blanks", function() {
      var boardA=[['~','A','A','~'],['@','~','~','@'],['~','Z','Z','~'],['Z','~','~','Z']];
      var boardB=[['~','A','A','~'],['@','~','~','@'],['~','Z','Z','~'],['Z','~','~','Z']];
      var result=board.compareBoardState(boardA,boardB);
      expect (result).to.equal(true);
    });
    it("returns true if the boards contain the same values with some blanks", function() {
      var boardA=[['~','','','~'],['','~','~',''],['~','','','~'],['','~','~','']];
      var boardB=[['~','','','~'],['','~','~',''],['~','','','~'],['','~','~','']];
      var result=board.compareBoardState(boardA,boardB);
      expect (result).to.equal(true);
    });
    it("returns true if the boards are the same length but empty", function() {
      var boardA=Array(9);
      var boardB=Array(9);
      var result=board.compareBoardState(boardA,boardB);
      expect (result).to.equal(true);
    });
    it("returns false if the boards are the same length with different values", function() {
      var boardA=Array(9).fill('@');
      var boardB=Array(9).fill('~');
      var result=board.compareBoardState(boardA,boardB);
      expect (result).to.equal(false);
    });
    it("returns false if the boards are the same length with different case letters", function() {
      var boardA=Array(9).fill('A');
      var boardB=Array(9).fill('a');
      var result=board.compareBoardState(boardA,boardB);
      expect (result).to.equal(false);
    });
    it("returns false if the boards are different lengths", function () {
      var boardA=Array(8);
      var boardB=Array(9);
      var result=board.compareBoardState(boardA,boardB);
      expect (result).to.equal(false);
    });
  });
  describe("Bad Input Handling", function() {
    it("returns an error if a board is not an array", function() {
      var boardA='Airplane';
      var boardB=Array(2);
      expect(()=>board.compareBoardState(boardA,boardB).to.throw('Boards must be of type Array'));
    });
    it("returns an error if a either board is null", function() {
      var boardA=null;
      var boardB=Array(2);
      expect(()=>board.compareBoardState(boardA,boardB).to.throw('Boards must be of type Array'));
    });
    it("returns an error if a either board is null", function() {
      var boardA=Array(2);
      var boardB=null;
      expect(()=>board.compareBoardState(boardA,boardB).to.throw('Boards must be of type Array'));
    });
  });
});
