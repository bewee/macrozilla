class ConditionsClass {

  constructor(handler) {
    const block = handler.addBlock(null, ['Basics']);
    block.setTooltipText('Conditions (need to be fullfilled befor execution)');
    block.addParameter('list', {accepts: 'evaluable[]'});
    block.setText('Conditions %p', 'list');
  }

}

window.exports = ConditionsClass;
