(() => {
  class EditorView {

    constructor(extension) {
      this.extension = extension;
    }

    show(macro) {
      this.changes_ = false;
      document.querySelector('#macrotoolbar h1').innerHTML = macro.name;
      this.macro_name = macro.name;
      this.macro_id = macro.id;
      document.querySelector('#editor-back-button').addEventListener('click', async () => {
        if (this.changes_ && window.confirm('Save Changes?'))
          try {
            await this.saveMacro();
          } catch (ex) {
            if (!window.confirm('Failed to save macro. Most likely, this is due to a syntax error. Do you want to leave anyway?'))
              return;
          }
        this.extension.views.macrolist.show();
      });
      document.querySelector('#playmacro').addEventListener('click', async () => {
        this.executeMacro();
      });
      document.querySelector('#savemacro').addEventListener('click', async () => {
        this.saveMacroAndUpdateInterface();
      });
      this.textarea = document.querySelector('#programarea textarea');
      this.textarea.addEventListener('input', () => {
        this.changes();
      });
      this.loadMacro();
    }

    async executeMacro() {
      if (this.changes_) {
        if (window.confirm('Save Changes?')) {
          this.saveMacroAndUpdateInterface(this.macro_id);
        } else {
          return;
        }
      }
      console.log('executing');
      await window.API.postJson('/extensions/macrozilla/api/exec-macro', {id: this.macro_id});
    }

    async loadMacro() {
      const res = await window.API.postJson('/extensions/macrozilla/api/get-macro', {id: this.macro_id});
      console.log('loading', JSON.stringify(res.macro.description));
      this.textarea.value = JSON.stringify(res.macro.description, null, 2);
    }

    async saveMacro() {
      const json = JSON.parse(this.textarea.value);
      this.textarea.value = JSON.stringify(json, null, 2);
      console.log('saving', JSON.stringify(json));
      const res = await window.API.postJson('/extensions/macrozilla/api/update-macro', {id: this.macro_id, description: json});
      console.log('result', res);
    }

    async saveMacroAndUpdateInterface() {
      try {
        await this.saveMacro(this.macro_id);
      } catch (ex) {
        window.alert('Failed to save macro. Most likely, this is due to a syntax error.');
        return;
      }
      const titleel = document.querySelector('#macrotoolbar h1');
      titleel.innerHTML = this.macro_name;
      this.changes_ = false;
    }

    changes() {
      if (!this.changes_)
        document.querySelector('#macrotoolbar h1').innerHTML += '*';
      this.changes_ = true;
    }

  }

  window.exports = EditorView;
})();
