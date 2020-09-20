class SetterClass {

  constructor(handler) {
    const block = handler.addBlock('Set', ['Basics']);
    const left = block.addParameter('left', ['settable']);
    left.setText('attribute');
    const right = block.addParameter('right', ['evaluable']);
    right.setText('value');
    block.setText('Set %p to value: %p', left, right);
  }

}

window.exports = SetterClass;
