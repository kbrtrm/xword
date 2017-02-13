window.onload = function () {
  // cheers http://stackoverflow.com/a/18303822
  //TODO this means we can't tab out of the textarea to submit the form tho :(
document.querySelector("textarea").addEventListener('keydown',function(e) {
    if(e.keyCode === 9) { // tab was pressed
        // get caret position/selection
        var start = this.selectionStart;
        var end = this.selectionEnd;

        var target = e.target;
        var value = target.value;

        // set textarea value to: text before caret + tab + text after caret
        target.value = value.substring(0, start)
                    + "\t"
                    + value.substring(end);

        // put caret at right position again (add one for the tab)
        this.selectionStart = this.selectionEnd = start + 1;

        // prevent the focus lose
        e.preventDefault();
    }
},false);
}
