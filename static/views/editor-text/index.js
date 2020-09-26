class EditorView {

  constructor(extension) {
    this.extension = extension;
  }

  show(macro) {
    this.changes_ = false;
    document.querySelector('#macrotoolbar h1').innerHTML = macro.name;
    document.querySelector('#editor-back-button').addEventListener('click', async () => {
      if (this.changes_ && window.confirm('Save Changes?'))
        try {
          await this.saveMacro(macro.id);
        } catch (ex) {
          if (!window.confirm('Failed to save macro. Most likely, this is due to a syntax error. Do you want to leave anyway?'))
            return;
        }
      this.extension.views.macrolist.show(macro.id);
    });
    document.querySelector('#playmacro').addEventListener('click', async () => {
      this.executeMacro(macro.id);
    });
    document.querySelector('#savemacro').addEventListener('click', async () => {
      this.saveMacroAndUpdateInterface(macro.id);
    });
    this.textarea = document.querySelector('#programarea textarea');
    this.textarea.addEventListener('input', () => {
      this.changes();
    });
    this.loadMacro(macro.id);
  }

  async executeMacro(macro_id) {
    if (this.changes_) {
      if (window.confirm('Save Changes?')) {
        this.saveMacroAndUpdateInterface(macro_id);
      } else {
        return;
      }
    }
    console.log('executing');
    await window.API.postJson('/extensions/macrozilla/api/exec-macro', {id: macro_id});
  }

  async loadMacro(macro_id) {
    const res = await window.API.postJson('/extensions/macrozilla/api/get-macro', {id: macro_id});
    console.log('loading', JSON.stringify(res.macro.description));
    this.textarea.value = JSON.stringify(res.macro.description, null, 2);
  }

  async saveMacro(macro_id) {
    const json = JSON.parse(this.textarea.value);
    this.textarea.value = JSON.stringify(json, null, 2);
    console.log('saving', JSON.stringify(json));
    const res = await window.API.postJson('/extensions/macrozilla/api/update-macro', {id: macro_id, description: json});
    console.log('result', res);
  }

  async saveMacroAndUpdateInterface(macro_id) {
    try {
      await this.saveMacro(macro_id);
    } catch (ex) {
      window.alert('Failed to save macro. Most likely, this is due to a syntax error.');
      return;
    }
    const titleel = document.querySelector('#macrotoolbar h1');
    titleel.innerHTML = titleel.innerHTML.slice(0, -1);
    this.changes_ = false;
  }

  changes() {
    if (!this.changes_)
      document.querySelector('#macrotoolbar h1').innerHTML += '*';
    this.changes_ = true;
  }

}

window.exports = EditorView;
