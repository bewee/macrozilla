class Setter {

  constructor(handler) {
    const block = handler.addBlock('Set', ['Basics']);
    const left = block.addParameter('attribute', ['settable']);
    const right = block.addParameter('value', ['evaluable']);
    block.setText('Set %p to value: %p', left, right);
  }

}

window.exportMacroModule(Setter);
