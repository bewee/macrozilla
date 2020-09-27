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
      const setText = (block) => {
        let ps = '';
        const args = [];
        for (let i = 1; i <= Object.keys(block.parameters).length; i++) {
          ps += ' \n%p\n%d\n';
          args.push(`program${i}`);
          const delbttn = document.createElement('BUTTON');
          delbttn.innerHTML = 'x';
          delbttn.addEventListener('mousedown', (ev) => {
            ev.stopPropagation();
          });
          delbttn.addEventListener('click', () => {
            handler.editor.changes();
            for (let j = i; j < Object.keys(block.parameters).length; j++) {
              block.parameters[`program${j}`] = block.parameters[`program${j+1}`];
              block.parameters[`program${j}`].name = `program${j}`;
              block.parameters[`program${j}`].setText(`Program ${j}`);
            }
            delete block.parameters[`program${Object.keys(block.parameters).length}`];
            setText(block);
          });
          args.push(delbttn);
        }
        const addbttn = document.createElement('BUTTON');
        addbttn.innerHTML = '+';
        addbttn.addEventListener('mousedown', (ev) => {
          ev.stopPropagation();
        });
        addbttn.addEventListener('click', () => {
          handler.editor.changes();
          const i = Object.keys(block.parameters).length+1;
          block.addParameter(`program${i}`, {accepts: 'executable[]', text: `Program ${i}`});
          setText(block, addbttn);
        });
        block.setText(`Execute in parallel\n${ps} \n%d`, ...args, addbttn);
      };
      const block = handler.addBlock('async', ['Controlflow']);
      block.addParameter('program1', {accepts: 'executable[]', text: 'Program 1'});
      block.copyFromJSON = ((json, maxid) => {
        maxid.i = Math.max(maxid.i, json.id);
        const copy = block.copy();
        copy.setAttribute('macro-block-no', json.id);
        copy.className = copy.className.split(' ').includes('macrocard') ? 'macroblock macrocard placed' : 'macroblock placed';
        let i = 2;
        while (`program${i}` in json) {
          copy.addParameter(`program${i}`, {accepts: 'executable[]', text: `Program ${i}`});
          i++;
        }
        for (const parname in copy.parameters) {
          copy.parameters[parname].copyFromJSON(json[parname], maxid);
        }
        setText(copy);
        return copy;
      }).bind(block);
      const oldcopy = block.copy;
      block.copy = () => {
        const copy = oldcopy.call(block);
        setText(copy);
        return copy;
      };
      setText(block);
    }
  }

}
window.exports = ControlflowClass;
