class CommentClass {

  constructor(handler) {
    const block = handler.addBlock(null, ['Basics']);
    block.setTooltipText('Comments');
    block.addInput('text', 'string', {placeholder: 'Put your comment here'});
    block.setText('// %i', 'text');
  }

}

window.exports = CommentClass;
