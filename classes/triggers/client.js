class TriggersClass {

  constructor(handler) {
    const block = handler.addHeaderBlock(null, '_hidden', true);
    block.setTooltipText('Triggers (determine when this macro gets executed)');
    block.addParameter('list', {accepts: 'trigger[]'});
    block.setText('Trigger on %p', 'list');
  }

}

window.exports = TriggersClass;
