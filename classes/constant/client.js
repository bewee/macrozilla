class ConstantClass {
  constructor(handler) {
    this.handler = handler;

    if (!this.handler.editor.ConstantCard) {
      this.defineConstantCard();
    }

    {
      const block = this.addConstantCard('NumberConstant', handler);
      const num = block.addInput('number', 'number', null);
      block.setText('%p', num);
    }

    {
      const block = this.addConstantCard('TextConstant', handler);
      const num = block.addInput('text', 'text', null);
      block.setText('%p', num);
    }

    const tf = handler.addGroup('True / False', ['Constants']);

    {
      const card = this.addConstantCard('TrueConstant', handler);
      card.setText('true');
      card.setJSONAttribute('value', 'true');
      tf.assign(card);
    }

    {
      const card = this.addConstantCard('FalseConstant', handler);
      card.setText('false');
      card.setJSONAttribute('value', 'false');
      tf.assign(card);
    }
  }

  defineConstantCard() {
    class ConstantCard extends this.handler.editor.MacroCard {

      constructor(name, classname, elgroup = null) {
        super(name, classname, elgroup);
        this.inputElement = null;
        this.addAbility('evaluable');
      }

      addInput(name, type, def) {
        const inp = document.createElement('INPUT');
        inp.value = def;
        inp.placeholder = name;
        inp.type = type;
        inp.addEventListener('mousedown', (e) => {
          e.stopPropagation();
        });
        this.inputElement = inp;
        return inp;
      }

      copy() {
        const copyinstance = super.copy();
        if (this.inputElement) {
          copyinstance.inputElement = copyinstance.querySelector('input');
          copyinstance.inputElement.addEventListener('mousedown', (e) => {
            e.stopPropagation();
          });
        }
        return copyinstance;
      }

      toJSON() {
        const jsonobj = {id: parseInt(this.getAttribute('macro-block-no')), type: this.classname};
        Object.assign(jsonobj, this.internal_attributes);
        if (this.inputElement) {
          if (this.inputElement.type == 'number')
            jsonobj.value = this.inputElement.value;
          else
            jsonobj.value = JSON.stringify(this.inputElement.value);
        }
        return jsonobj;
      }
    }
    customElements.define('macro-constant-card', ConstantCard);
    this.handler.editor.ConstantCard = ConstantCard;
  }

  addConstantCard = function(name, handler) {
    const c = new this.handler.editor.ConstantCard(name, 'constant');
    handler.addElement(c, ['Constants']);
    return c;
  }

}
window.exports = ConstantClass;
