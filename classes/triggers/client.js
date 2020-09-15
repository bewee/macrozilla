class TriggersClass {

  constructor(handler) {
    const block = handler.addBlock('Triggers', ['Basics']);
    const list = block.addParameter('list', ['trigger']);
    list.multicards = true;
    block.setText('Trigger on %p', list);
  }

}

window.exports = TriggersClass;
