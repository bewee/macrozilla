class LogClass {

  constructor(handler) {
    this.handler = handler;

    if (!this.handler.editor.LogBlock) {
      this.defineLogBlock();
    }

    this.addLogBlock();
  }


  defineLogBlock() {
    class LogBlock extends this.handler.editor.MacroBlock {

      constructor(qualifier, classname, editor, elgroup = null) {
        super(qualifier, classname, editor, elgroup);
        const inp = document.createElement('SELECT');
        inp.innerHTML = '<option value="debug">DEBUG</option><option value="info">INFO</option><option value="warn">WARN</option><option value="error">ERROR</option><option value="fatal">FATAL</option>';
        inp.addEventListener('mousedown', (e) => {
          e.stopPropagation();
        });
        inp.addEventListener('input', (_e) => {
          this.editor.changes();
        });
        this.inputElement = inp;
      }

      c() {
        const title = this.addParameter('title', ['evaluable']);
        title.setText('title');
        const message = this.addParameter('message', ['evaluable']);
        message.setText('message');
        this.setText('Log %p %p: %p', this.inputElement, title, message);
      }

      copy() {
        const copyinstance = super.copy();
        copyinstance.inputElement = copyinstance.querySelector('select');
        copyinstance.inputElement.addEventListener('mousedown', (e) => {
          e.stopPropagation();
        });
        copyinstance.inputElement.addEventListener('input', (_e) => {
          this.editor.changes();
        });
        return copyinstance;
      }

      toJSON() {
        const jsonobj = super.toJSON();
        jsonobj.text = this.inputElement.value;
        return jsonobj;
      }

      copyFromJSON(json, maxid) {
        const copy = super.copyFromJSON(json, maxid);
        copy.inputElement.value = json.text;
        return copy;
      }
    }
    customElements.define('macro-log-card', LogBlock);
    this.handler.editor.LogBlock = LogBlock;
  }

  addLogBlock() {
    const c = new this.handler.editor.LogBlock(null, 'log', this.handler.editor);
    c.c();
    c.setTooltipText('Log');
    this.handler.addElement(c, ['Basics']);
    return c;
  }


}

window.exports = LogClass;
