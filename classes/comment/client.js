class CommentClass {

  constructor(handler) {
    const block = handler.addBlock(null, ['Basics']);
    block.setTooltipText('Comments');
    const inp = block.addInput('text', 'string', {placeholder: 'Put your comment here'});
    block.setText('// %p', inp);
  }

}

window.exports = CommentClass;
