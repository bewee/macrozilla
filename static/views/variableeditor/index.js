(() => {
  class VariableeditorView {

    show(variable) {
      this.variable = variable;
      window.API.postJson('/extensions/macrozilla/api/get-variable', {id: variable.id}).then((res) => {
        try {
          this.value = JSON.parse(res.variable.value);
        } catch (_e) {
          this.value = null;
        }

        document.querySelector('#variableeditor-back-button').addEventListener('click', () => {
          this.extension.views.variablelist.show();
        });

        if (this.value === null) {
          this.seltype = 'null';
        } else if (typeof this.value === 'boolean' || typeof this.value === 'number' || typeof this.value === 'string') {
          this.seltype = typeof this.value;
        } // TODO: add support for list and object

        this.e_null = document.querySelector('.macrozilla-variable-editor [name="null"]');
        this.e_boolean = document.querySelector('.macrozilla-variable-editor [name="boolean"]');
        this.e_number = document.querySelector('.macrozilla-variable-editor [name="number"]');
        this.e_string = document.querySelector('.macrozilla-variable-editor [name="string"]');

        document.querySelector('.macrozilla-select-datatype').children.forEach((el) => {
          el.addEventListener('click', (ev) => {
            this.seltype = ev.target.getAttribute('value');
            this.updateEditor();
          });
        });

        this.updateEditor();

        this.e_boolean.addEventListener('change', () => {
          this.value = this.e_boolean.checked;
          this.updateValue(this.value);
        });
        this.e_number.addEventListener('change', () => {
          this.value = parseInt(this.e_number.value);
          this.updateValue(this.value);
        });
        this.e_string.addEventListener('change', () => {
          this.value = this.e_string.value;
          this.updateValue(this.value);
        });
      });
    }

    updateEditor() {
      document.querySelectorAll(`.macrozilla-select-datatype li`).forEach((el) => {
        el.className = '';
      });
      document.querySelector(`.macrozilla-select-datatype li[value='${this.seltype}']`).className = 'active';
      this.e_null.style.display = 'none';
      this.e_boolean.style.display = 'none';
      this.e_number.style.display = 'none';
      this.e_string.style.display = 'none';
      let nvalue;
      switch (this.seltype) {
        case 'null':
          this.e_null.style.display = 'block';
          nvalue = null;
          break;
        case 'boolean':
          this.e_boolean.style.display = 'block';
          nvalue = this.value ? true : false;
          this.e_boolean.checked = nvalue;
          break;
        case 'number':
          this.e_number.style.display = 'block';
          nvalue = isNaN(Number(this.value)) ? 0 : Number(this.value);
          this.e_number.value = nvalue;
          break;
        case 'string':
          this.e_string.style.display = 'block';
          nvalue = this.value === null ? '' : this.value.toString();
          this.e_string.value = nvalue;
          break;
        // TODO: add support for list and object
      }
      this.updateValue(nvalue);
    }

    updateValue(val) {
      window.API.postJson('/extensions/macrozilla/api/update-variable', {id: this.variable.id, value: JSON.stringify(val)}).then((res) => {
        console.log(res);
      });
    }

  }

  window.exports = VariableeditorView;
})();
