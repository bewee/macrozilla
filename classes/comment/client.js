class CommentClass {

  constructor(handler) {
    this.handler = handler;

    if (!this.handler.editor.CommentBlock) {
      this.defineCommentBlock();
    }

    this.addCommentBlock();
  }


  defineCommentBlock() {
    class CommentBlock extends this.handler.editor.MacroBlock {

      constructor(qualifier, classname, editor, elgroup = null) {
        super(qualifier, classname, editor, elgroup);
        const inp = document.createElement('INPUT');
        inp.placeholder = 'Put your comment here';
        inp.type = 'text';
        inp.addEventListener('mousedown', (e) => {
          e.stopPropagation();
        });
        inp.addEventListener('input', (_e) => {
          this.editor.changes();
        });
        this.setText('// %p', inp);
        this.inputElement = inp;
      }

      copy() {
        const copyinstance = super.copy();
        copyinstance.inputElement = copyinstance.querySelector('input');
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
    customElements.define('macro-comment-card', CommentBlock);
    this.handler.editor.CommentBlock = CommentBlock;
  }

  addCommentBlock() {
    const c = new this.handler.editor.CommentBlock(null, 'comment', this.handler.editor);
    c.setTooltipText('Comment');
    this.handler.addElement(c, ['Basics']);
    return c;
  }


}

window.exports = CommentClass;
