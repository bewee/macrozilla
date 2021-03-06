(() => {
  class LogClass {

    constructor(handler) {
      const block = handler.addBlock(null, ['Basics']);
      block.setTooltipText('Log');
      block.addInput('level', {type: 'string', enum: ['debug', 'info', 'warn', 'error', 'fatal'], venum: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'], value: 'info'});
      block.addParameter('title', {accepts: 'evaluable'});
      block.addParameter('message', {accepts: 'evaluable'});
      block.setText('Log %i %p: %p', 'level', 'title', 'message');
    }

  }

  window.exports = LogClass;
})();
