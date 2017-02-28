function fontsize() {
  var fontSize = $(".cell").width() * .75;
  var clueFontSize = $(".cell").width() * .3;
  $(".cell--text").css('font-size', fontSize);
  $(".clue-number").css('font-size', clueFontSize);
};
function boardsize() {
  var boardSize = $(".board").width(); // 10% of container width
  $(".board").css('padding-bottom', boardSize);
};

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
  } else {
    return false;
  };
}

function prevCellHasClass(currCell, elClass) {
  prevCell = currCell.parent().prev();
  if (prevCell.hasClass(elClass)) {
    return true;
  } else {
    return false;
  };
}

$('div#board').keydown(function(e) {
  var currentCell = $(document.activeElement);
  switch (e.which) {

    case 37: // left
      if (prevCellHasClass(currentCell, 'cell--filled')) {
        currentCell.parent().prevUntil(':not(.cell--filled)').prev().children('input')
          .focus().putCursorAtEnd();
      } else {
        currentCell.parent().prev().children('input')
          .focus().putCursorAtEnd();
      }
    break;

    case 38: // up
      var col = currentCell.parent().data('col');
      var row = currentCell.parent().data('row');
      var prow = row-1;
      function moveUpUntilTextCell(cr) {
        if ($(".cell[data-col='" + col + "'][data-row='" + cr + "']").hasClass('cell--filled')) {
          next = cr-1;
          console.log(cr, next);
          moveUpUntilTextCell(next);
        } else {
          $(".cell[data-col='" + col + "'][data-row='" + cr + "']").children('input')
            .focus().putCursorAtEnd();
        }
      }
      moveUpUntilTextCell(prow);

      break;

    case 39: // right

      if (nextCellHasClass(currentCell, 'cell--filled')) {
        currentCell.parent().nextUntil(':not(.cell--filled)').next().children('input')
          .focus().putCursorAtEnd();
      } else {
        currentCell.parent().next().children('input')
          .focus().putCursorAtEnd();
      }

      break;

    case 40: // down
      var col = currentCell.parent().data('col');
      var row = currentCell.parent().data('row');
      var prow = row+1;
      function moveDownUntilTextCell(cr) {
        if ($(".cell[data-col='" + col + "'][data-row='" + cr + "']").hasClass('cell--filled')) {
          nextd = cr+1;
          console.log(cr, nextd);
          moveDownUntilTextCell(nextd);
        } else {
          $(".cell[data-col='" + col + "'][data-row='" + cr + "']").children('input')
            .focus().putCursorAtEnd();
        }
      }
      moveDownUntilTextCell(prow);
      break;

    case 8:
      currentCell.val('').parent().prev().children('input')
        .focus().putCursorAtEnd
      break;

    case 65:
    case 66:
    case 67:
    case 68:
    case 69:
    case 70:
    case 71:
    case 72:
    case 73:
    case 74:
    case 75:
    case 76:
    case 77:
    case 78:
    case 79:
    case 80:
    case 81:
    case 82:
    case 83:
    case 84:
    case 85:
    case 86:
    case 87:
    case 88:
    case 89:
    case 90:
      if (nextCellHasClass(currentCell, 'cell--filled')) {
        currentCell.val(e.key).parent().nextUntil(':not(.cell--filled)').next().children('input')
          .focus().putCursorAtEnd();
      } else {
        currentCell.val(e.key).parent().next().children('input')
          .focus().putCursorAtEnd();
      }

        break;

    default:
      break;

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
