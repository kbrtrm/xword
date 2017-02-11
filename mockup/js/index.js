function fontsize() {
  var fontSize = $(".cell").width() * .75;
  var clueFontSize = $(".cell").width() * .35;
  $(".cell--text").css('font-size', fontSize);
  $(".clue-number").css('font-size', clueFontSize);
};
function boardsize() {
  var boardSize = $(".board").width(); // 10% of container width
  $(".board").css('padding-bottom', boardSize);
};

$(document).ready(function() {
  
  fontsize();
  boardsize();

  var clueNo = 0;

  $('.cell:not(.cell.cell--filled)').each(function(i) {
    var icol = $(this).index() + 1;
    if ($(this).prev().children('.cell--text').length < 1 ||
      $(this).parent().prev('.row').children('.cell:nth-child(' + icol + ')').children('.cell--text').length < 1
    ) {
      clueNo++;
      $(this).append("<span class='clue-number'>" + clueNo + "</span>");
      $(this).children('.clue-number').click(function() {
        $(this).prev('.cell--text').focus();
      });
    }
  });
  

  $('.board').css('opacity', 1);
});

$(window).resize(function() {
  fontsize();
  boardsize();
});

function isNextCellBlack(currCell) {
  nextCell = currCell.parent().next();
  return (nextCell.hasClass('cell--filled'));
}

function nextCellHasClass(currCell, elClass) {
  nextCell = currCell.parent().next();
  if (nextCell.hasClass(elClass)) {
    return true;
  };
}

$(document).keydown(function(e) {
  var currentCell = $(document.activeElement);
  switch (e.which) {
    case 37: // left
      currentCell.parent().prev().children('input')
        .focus().putCursorAtEnd();
      break;

    case 38: // up
      var col = currentCell.parent().index() + 1;
      currentCell.parent().parent().prev()
        .find('.cell:nth-child(' + col + ')')
        .children('input').focus().putCursorAtEnd();
      break;

    case 39: // right
      if (nextCellHasClass(currentCell, 'cell--filled')) {
        currentCell.parent().next().next().children('input')
          .focus().putCursorAtEnd();
      } else {
        currentCell.parent().next().children('input')
          .focus().putCursorAtEnd();
      }

      break;

    case 40: // down
      var col = currentCell.parent().index() + 1;
      currentCell.parent().parent().next()
        .find('.cell:nth-child(' + col + ')')
        .children('input').focus().putCursorAtEnd();
      break;

    case 8:
      currentCell.val('').parent().prev().children('input')
        .focus().putCursorAtEnd();

      break;

    default:
      currentCell.val(e.key).parent().next().children('input')
        .focus().putCursorAtEnd();

      //return; // exit this handler for other keys
  }
  e.preventDefault(); // prevent the default action (scroll / move caret)
});

jQuery.fn.putCursorAtEnd = function() {

  return this.each(function() {

    // Cache references
    var $el = $(this),
      el = this;

    // Only focus if input isn't already
    if (!$el.is(":focus")) {
      $el.focus();
    }

    // If this function exists... (IE 9+)
    if (el.setSelectionRange) {

      // Double the length because Opera is inconsistent about whether a carriage return is one character or two.
      var len = $el.val().length * 2;

      // Timeout seems to be required for Blink
      setTimeout(function() {
        el.setSelectionRange(len, len);
      }, 1);

    } else {

      // As a fallback, replace the contents with itself
      // Doesn't work in Chrome, but Chrome supports setSelectionRange
      $el.val($el.val());

    }

    // Scroll to the bottom, in case we're in a tall textarea
    // (Necessary for Firefox and Chrome)
    this.scrollTop = 999999;

  });

};