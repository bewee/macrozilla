class SetterClass {

  constructor(handler) {
    {
      const block = handler.addBlock('set', ['Basics']);
      block.setTooltipText('Set');
      const left = block.addParameter('left', ['settable']);
      left.setText('attribute');
      const right = block.addParameter('right', ['evaluable']);
      right.setText('value');
      block.setText('Set %p to %p', left, right);
    }

    const g = handler.addGroup('Advanced Set', ['Basics']);
    {
      const block = handler.addBlock('set_w_time');
      block.setTooltipText('Set (time)');
      const left = block.addParameter('left', ['settable']);
      left.setText('attribute');
      const right = block.addParameter('right', ['evaluable']);
      right.setText('value');
      const time = block.addParameter('time', ['evaluable']);
      time.setText('time');
      block.setText('Set %p to %p in %p seconds', left, right, time);
      g.assign(block);
    }
    {
      const block = handler.addBlock('set_w_speed');
      block.setTooltipText('Set (speed)');
      const left = block.addParameter('left', ['settable']);
      left.setText('attribute');
      const right = block.addParameter('right', ['evaluable']);
      right.setText('value');
      const speed = block.addParameter('speed', ['evaluable']);
      speed.setText('speed');
      block.setText('Set %p to %p with speed %p', left, right, speed);
      g.assign(block);
    }
  }

}

window.exports = SetterClass;
