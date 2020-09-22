class TriggersClass {

  constructor(handler) {
    const block = handler.addBlock(null, ['Basics']);
    block.setTooltipText('Triggers (determine when this macro gets executed)');
    const list = block.addParameter('list', ['trigger']);
    list.multicards = true;
    block.setText('Trigger on %p', list);
  }

}

window.exports = TriggersClass;
