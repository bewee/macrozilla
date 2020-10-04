(() => {
  class SetterClass {

    constructor(handler) {
      {
        const block = handler.addBlock('set', ['Basics']);
        block.setTooltipText('Set');
        block.addParameter('left', {accepts: 'settable', text: 'attribute'});
        block.addParameter('right', {accepts: 'evaluable', text: 'value'});
        block.setText('Set %p to %p', 'left', 'right');
      }

      const g = handler.addGroup('Advanced Set', ['Basics']);
      {
        const block = handler.addBlock('set_w_time');
        block.setTooltipText('Set (time)');
        block.addParameter('left', {accepts: 'settable', text: 'attribute'});
        block.addParameter('right', {accepts: 'evaluable', text: 'value'});
        block.addParameter('time', {accepts: 'evaluable'});
        block.setText('Set %p to %p in %p seconds', 'left', 'right', 'time');
        g.assign(block);
      }
      {
        const block = handler.addBlock('set_w_speed');
        block.setTooltipText('Set (speed)');
        block.addParameter('left', {accepts: 'settable', text: 'attribute'});
        block.addParameter('right', {accepts: 'evaluable', text: 'value'});
        block.addParameter('speed', {accepts: 'evaluable'});
        block.setText('Set %p to %p with speed %p', 'left', 'right', 'speed');
        g.assign(block);
      }
    }

  }

  window.exports = SetterClass;
})();
