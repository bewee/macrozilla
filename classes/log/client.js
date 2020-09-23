class LogClass {

  constructor(handler) {
    const block = handler.addBlock(null, ['Basics']);
    block.setTooltipText('Log');
    const inp = block.addInput('level', 'string', {enum: ['debug', 'info', 'warn', 'error', 'fatal'], venum: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL']});
    const title = block.addParameter('title', ['evaluable']);
    title.setText('title');
    const message = block.addParameter('message', ['evaluable']);
    message.setText('message');
    block.setText('Log&nbsp;%p %p: %p', inp, title, message);
  }

}

window.exports = LogClass;
