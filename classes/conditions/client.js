class ConditionsClass {

  constructor(handler) {
    const block = handler.addHeaderBlock(null, ['_hidden'], true);
    block.setTooltipText('Conditions (need to be fullfilled befor execution)');
    block.addParameter('list', {accepts: 'evaluable[]'});
    block.setText('Conditions %p', 'list');
  }

}

window.exports = ConditionsClass;
