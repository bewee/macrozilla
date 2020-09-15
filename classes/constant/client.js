class ConstantClass {
  constructor(handler) {
    this.handler = handler;

    if (!this.handler.editor.ConstantCard) {
      this.defineConstantCard();
    }

    const block = this.addConstantCard('NumberConstant', handler);
    const num = block.addInput('value', 'number', null);
    block.setText('%p', num);

    const tf = handler.addGroup('True / False', ['Constants']);

    {
      const card = this.addConstantCard('TrueConstant', handler);
      card.setText('true');
      card.setAttribute('value', 'true');
      tf.assign(card);
    }

    {
      const card = this.addConstantCard('FalseConstant', handler);
      card.setText('false');
      card.setAttribute('value', 'false');
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

      toJSON(idobj) {
        const jsonobj = {id: idobj.id, type: this.classname};
        Object.assign(jsonobj, this.internal_attributes);
        idobj.id++;
        if (this.inputElement)
          jsonobj.value = this.inputElement.value;
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
