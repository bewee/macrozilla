(() => {
  class ControlflowClass {

    constructor(handler) {
      {
        const block = handler.addBlock('if', ['Controlflow']);
        block.addParameter('condition', {accepts: 'evaluable'});
        block.addParameter('true', {accepts: 'executable[]', text: 'program'});
        block.addParameter('false', {accepts: 'executable[]', text: 'program'});
        block.setText('If %p\nDo\n%p\nElse do\n%p', 'condition', 'true', 'false');
      }
      {
        const block = handler.addBlock('loop', ['Controlflow']);
        block.addParameter('iterations', {accepts: 'evaluable', text: 'x'});
        block.addParameter('body', {accepts: 'executable[]', text: 'program'});
        block.setText('Repeat %p times %p', 'iterations', 'body');
      }
      {
        const block = handler.addBlock('while', ['Controlflow']);
        block.addParameter('condition', {accepts: 'evaluable', text: 'x'});
        block.addParameter('body', {accepts: 'executable[]', text: 'program'});
        block.setText('While %p do %p', 'condition', 'body');
      }
      {
        const block = handler.addBlock('wait', ['Controlflow']);
        block.addParameter('time', {accepts: 'evaluable', text: 'x'});
        block.setText('Wait %p seconds', 'time');
      }
      {
        const load_block = handler.addLoadBlock('async', (copy) => {
          copy.updateInternalAttribute('programCount', 2);
          let i = 3;
          for (; `program${i}` in copy.getCachedSerialization(); i++) {
            this.addProgram(copy);
            const maxid = {i: handler.editor.nextId};
            copy.getParameter(`program${i}`).loadFromSerialization(copy.getCachedSerialization()[`program${i}`], maxid);
            handler.editor.nextId = Math.max(handler.editor.nextId, maxid.i);
          }
          this.setupAsyncBlock(copy);
        });
        load_block.addInternalAttribute('programCount', 0);
        this.addProgram(load_block);
        this.addProgram(load_block);
        load_block.addInput('add', {
          type: 'button',
          text: '+',
          onClick: (block, _ev) => {
            this.addProgram(block);
            block.changes();
          },
        });
        const block = handler.addBlock('async', ['Controlflow'], load_block);
        this.setupAsyncBlock(block);
      }
    }

    addProgram(block) {
      const id = block.getInternalAttribute('programCount')+1;
      block.addParameter(`program${id}`, {accepts: 'executable[]', text: `Program ${id}`});
      block.addInput(`delprogram${id}`, {
        type: 'button',
        text: 'x',
        onClick: (block, _ev) => {
          this.delProrgam(block, id);
          block.changes();
        },
      });
      block.updateInternalAttribute('programCount', id);
      this.setTextForAsyncBlock(block);
    }

    delProrgam(block, i) {
      block.setText('');
      block.deleteParameter(`program${i}`);
      block.deleteInput(`delprogram${i}`);
      for (let j = i+1; j <= block.getInternalAttribute('programCount'); j++) {
        block.updateParameter(`program${j}`, {text: `Program ${j-1}`});
        block.renameParameter(`program${j}`, `program${j-1}`);
        block.renameInput(`delprogram${j}`, `delprogram${j-1}`);
      }
      block.updateInternalAttribute('programCount', block.getInternalAttribute('programCount')-1);
      this.setTextForAsyncBlock(block);
    }

    setupAsyncBlock(block) {
      this.setTextForAsyncBlock(block);
      block.revive();
    }

    setTextForAsyncBlock(block) {
      const args = [];
      let ps = '';
      for (let i = 1; i <= block.getInternalAttribute('programCount'); i++) {
        if (block.getInternalAttribute('programCount') <= 2) {
          ps += ' \n%p\n';
          args.push(`program${i}`);
        } else {
          ps += ' \n%p\n%i\n';
          args.push(`program${i}`);
          args.push(`delprogram${i}`);
        }
      }
      block.setText(`Execute in parallel\n${ps} \n%i`, ...args, 'add');
    }

  }
  window.exports = ControlflowClass;
})();
