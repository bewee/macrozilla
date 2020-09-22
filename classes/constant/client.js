class ConstantClass {
  constructor(handler) {
    this.handler = handler;

    if (!this.handler.editor.ConstantCard) {
      this.defineConstantCard();
    }

    {
      const card = this.addConstantCard('number', handler);
      card.setTooltipText('Number');
      const num = card.addInput('number', 'number', null);
      card.setText('%p', num);
    }

    {
      const card = this.addConstantCard('string', handler);
      card.setTooltipText('Text');
      const num = card.addInput('text', 'text', null);
      card.setText('%p', num);
    }

    {
      const card = this.addConstantCard('boolean', handler);
      card.setTooltipText('True/False');
      const num = card.addInput(null, 'checkbox', null);
      num.checked = true;
      card.setText('%p', num);
    }

    {
      const card = this.addConstantCard('null', handler);
      card.setTooltipText('None');
      card.setText('none');
      card.setJSONAttribute('value', '');
    }
  }

  defineConstantCard() {
    class ConstantCard extends this.handler.editor.MacroCard {

      constructor(name, classname, editor, elgroup = null) {
        super(name, classname, editor, elgroup);
        this.inputElement = null;
        this.addAbility('evaluable');
      }

      addInput(placeholder, type, def) {
        const inp = document.createElement('INPUT');
        inp.value = def;
        if (placeholder)
          inp.placeholder = placeholder;
        inp.type = type;
        inp.addEventListener('mousedown', (e) => {
          e.stopPropagation();
        });
        inp.addEventListener('input', (_e) => {
          this.editor.changes();
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
          copyinstance.inputElement.addEventListener('input', (_e) => {
            this.editor.changes();
          });
        }
        return copyinstance;
      }

      toJSON() {
        const jsonobj = super.toJSON();
        if (this.inputElement) {
          if (this.inputElement.type == 'number')
            jsonobj.value = this.inputElement.value;
          else if (this.inputElement.type == 'checkbox')
            jsonobj.value = JSON.stringify(this.inputElement.checked);
          else
            jsonobj.value = JSON.stringify(this.inputElement.value);
        }
        return jsonobj;
      }

      copyFromJSON(json, maxid) {
        const copy = super.copyFromJSON(json, maxid);
        if (copy.inputElement) {
          if (copy.inputElement.type == 'checkbox')
            copy.inputElement.checked = JSON.parse(json.value);
          else
            copy.inputElement.value = JSON.parse(json.value);
        }
        return copy;
      }
    }
    customElements.define('macro-constant-card', ConstantCard);
    this.handler.editor.ConstantCard = ConstantCard;
  }

  addConstantCard(name) {
    const c = new this.handler.editor.ConstantCard(name, 'constant', this.handler.editor);
    this.handler.addElement(c, ['Constants']);
    return c;
  }

}
window.exports = ConstantClass;
