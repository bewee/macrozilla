class ConditionsClass {

  constructor(handler) {
    const block = handler.addBlock(null, ['Basics']);
    block.setTooltipText('Conditions (need to be fullfilled befor execution)');
    const list = block.addParameter('list', ['evaluable']);
    list.multicards = true;
    block.setText('Conditions %p', list);
  }

}

window.exports = ConditionsClass;
