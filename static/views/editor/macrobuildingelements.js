(() => {
  class MacroBuildingElement extends HTMLElement {

    constructor(qualifier, classname, editor, _elgroup = null) {
      super();

      this.parameters = {};
      this.parameters_ = {};
      this.inputs = {};
      this.inputs_ = {};
      this.group = null;
      this.internal_attributes = {};
      this.abilities = [];
      this.qualifier = qualifier;
      this.classname = classname;
      this.editor = editor;
      this.setAttribute('title', qualifier);
      this.setAttribute('alt', qualifier);
      this.className = 'macroblock';
      this.innerHTML = `<span class='blockdescr'><span>${qualifier}</span></span>`;
      this.abilityTexts = {};
      this.defaultText = {text: '', params: []};
      this.currentAbility = null;
      this.shutdown_ = false;
      this.setText_(this.defaultText);
    }

    setTooltipText(tooltip) {
      this.setAttribute('title', tooltip);
    }

    addParameter(name, options = {}) {
      const p = new this.editor.Parameter(name, this.editor);
      if ('accepts' in options)
        p.setAccepted(options.accepts);
      if ('text' in options)
        p.setText(options.text);
      this.parameters[name] = p;
      options.node = p;
      this.parameters_[name] = options;
      return p;
    }

    addInput(name, type, options = {}) {
      if (this.inputs[name]) {
        options.value = options.value || this.inputs[name].value;
      }
      options.type = type || options.type;
      const inpnode = this.inputFromDescription(options);
      inpnode.setAttribute('input-name', name);
      this.inputs[name] = inpnode;
      this.inputs_[name] = options;
      return inpnode;
    }

    inputFromDescription(options) {
      let node;

      if (options.type === 'object') {
        node = document.createElement('DIV');
        node.style.borderLeft = '4px solid gray';
        for (const property in options.properties) {
          const label = document.createElement('SPAN');
          label.innerHTML = property;
          node.appendChild(label);
          const propelement = this.inputFromDescription(options.properties[property]);
          node.appendChild(propelement);
          const brknode = document.createElement('DIV');
          brknode.className = 'break';
          node.appendChild(brknode);
        }
      } else {
        switch (options.type) {
          case 'string':
            if (Array.isArray(options.enum)) {
              node = document.createElement('SELECT');
              for (const i in options.enum) {
                const opt = document.createElement('OPTION');
                opt.value = options.enum[i];
                opt.innerHTML = options.venum ? options.venum[i] : options.enum[i];
                node.appendChild(opt);
              }
            } else {
              node = document.createElement('INPUT');
              node.type = 'text';
              if ('placeholder' in options) node.placeholder = options.placeholder;
            }
            if ('value' in options) node.value = options.value;
            break;
          case 'number': case 'integer':
            node = document.createElement('INPUT');
            node.type = 'number';
            if (options.type === 'integer') node.step = 1;
            if ('placeholder' in options) node.placeholder = options.placeholder;
            if ('min' in options) node.min = options.min;
            if ('max' in options) node.max = options.max;
            if ('step' in options) node.step = options.step;
            if ('value' in options) node.value = options.value;
            break;
          case 'boolean':
            node = document.createElement('INPUT');
            node.type = 'checkbox';
            if ('value' in options) node.checked = options.value;
            break;
        }
        node.addEventListener('mousedown', (e) => {
          e.stopPropagation();
        });
        node.addEventListener('input', (_e) => {
          this.editor.changes();
        });
      }

      options.node = node;
      return node;
    }

    setText(ftext, ...linkedParams) {
      this.defaultText = {text: ftext, params: linkedParams};
      this.setText_(this.defaultText);
    }

    // meant for internal use only
    setText_(obj) {
      const ftext = obj.text.split(' ').join('&nbsp;');
      const linkedParams = obj.params;
      this.children[0].innerHTML = '';
      let i = 0;
      for (const strpart of ftext.split(/(%p|%i|%a|%d|\n)/g)) {
        switch (strpart) {
          case '%p': {
            if (linkedParams[i]) {
              this.children[0].appendChild(this.parameters[linkedParams[i]]);
              i++;
            }
            break;
          }
          case '%i': {
            if (linkedParams[i]) {
              this.children[0].appendChild(this.inputs[linkedParams[i]]);
              i++;
            }
            break;
          }
          case '%a': {
            if (linkedParams[i]) {
              const txtnode = document.createElement('SPAN');
              txtnode.setAttribute('attribute-name', linkedParams[i]);
              txtnode.innerHTML = this.internal_attributes[linkedParams[i]];
              this.children[0].appendChild(txtnode);
              i++;
            }
            break;
          }
          case '%d': {
            if (linkedParams[i]) {
              this.children[0].appendChild(linkedParams[i]);
              i++;
            }
            break;
          }
          case '\n': {
            const brknode = document.createElement('DIV');
            brknode.className = 'break';
            this.children[0].appendChild(brknode);
            break;
          }
          default: {
            const txtnode = document.createElement('SPAN');
            txtnode.innerHTML = strpart;
            this.children[0].appendChild(txtnode);
            break;
          }
        }
      }
    }

    recursiveCopyElements(src, target) {
      for (const c of src.childNodes) {
        let c_target = target.appendChild(c.cloneNode(false));
        this.recursiveCopyElements(c, c_target);
      }
    }

    copy() {
      const copyinstance = new this.constructor(this.qualifier, this.classname, this.group);
      copyinstance.editor = this.editor;
      copyinstance.internal_attributes = JSON.parse(JSON.stringify(this.internal_attributes));
      copyinstance.classname = this.classname;
      copyinstance.abilities = JSON.parse(JSON.stringify(this.abilities));
      copyinstance.abilityTexts = JSON.parse(JSON.stringify(this.abilityTexts));
      copyinstance.defaultText = JSON.parse(JSON.stringify(this.defaultText));
      copyinstance.currentAbility = this.currentAbility;
      copyinstance.shutdown_ = this.shutdown_;
      copyinstance.shutdown_json = this.shutdown_json;
      // copy html attributes
      for (let i = this.attributes.length - 1; i > -1; --i)
        copyinstance.setAttribute(this.attributes[i].name, this.attributes[i].value);
      copyinstance.innerHTML = '';
      // copy nodes tree structure from this to copyinstance
      this.recursiveCopyElements(this, copyinstance);
      // copy parameters
      for (const param_name in this.parameters_) {
        copyinstance.addParameter(param_name, this.parameters_[param_name]);
      }
      // copy inputs
      for (const input_name in this.inputs_) {
        copyinstance.addInput(input_name, this.inputs_[input_name].type, this.inputs_[input_name]);
      }
      copyinstance.refreshText();
      return copyinstance;
    }

    setGroup(group) {
      this.group = group;
    }

    toJSON() {
      if (this.shutdown_) return this.shutdown_json;
      const jsonobj = {id: parseInt(this.getAttribute('macro-block-no')), type: this.classname};
      if (this.qualifier !== null)
        jsonobj.qualifier = this.qualifier;
      if (this.abilityTexts[this.currentAbility])
        jsonobj.ability = this.currentAbility;
      // save internal_attributes
      Object.assign(jsonobj, this.internal_attributes);
      // save params recursively
      for (const param_name in this.parameters) {
        if (this.parameters[param_name].parentNode)
          jsonobj[param_name] = this.parameters[param_name].toJSON();
      }
      // save input values
      for (const input_name in this.inputs) {
        if (this.inputs[input_name].parentNode)
          jsonobj[input_name] = this.inputToJSON(this.inputs_[input_name]);
      }
      return jsonobj;
    }

    inputToJSON(description) {
      if (description.node.parentNode) {
        switch (description.type) {
          case 'object':
            const json = {};
            for (const property in description.properties) {
              json[property] = this.inputToJSON(description.properties[property]);
            }
            return json;
          case 'number': case 'integer':
            return +description.node.value;
          case 'boolean':
            return description.node.checked;
          case 'string':
            return description.node.value;
        }
      }
    }

    setJSONAttribute(name, value) {
      this.internal_attributes[name] = value;
    }

    addAbility(name, text, ...linkedParams) {
      if (!this.abilities.includes(name))
        this.abilities.push(name);
      if (text)
        this.abilityTexts[name] = {text: text, params: linkedParams};
    }

    useAbility(name) {
      if (this.currentAbility === name) return;
      this.currentAbility = name;
      if (!(name in this.abilityTexts))
        this.setText_(this.defaultText);
      else
        this.setText_(this.abilityTexts[name]);
    }

    copyFromJSON(json, maxid) {
      maxid.i = Math.max(maxid.i, json.id);
      const copy = this.copy();
      copy.setAttribute('macro-block-no', json.id);
      copy.className = copy.className.split(' ').includes('macrocard') ? 'macroblock macrocard placed' : 'macroblock placed';
      // gather internal_attributes from json
      for (const ia in copy.internal_attributes) {
        copy.internal_attributes[ia] = json[ia];
        (copy.querySelector(`*[attribute-name=${ia}]`) || {}).innerHTML = this.internal_attributes[ia];
      }
      // fill parameters recursively
      for (const paramname in copy.parameters) {
        const pholder = copy.parameters[paramname];
        if (!json[paramname]) continue;
        pholder.copyFromJSON(json[paramname], maxid);
      }
      // fill input values
      for (const input_name in copy.inputs) {
        const val = input_name in json ? json[input_name] : null;
        copy.fillInputFromJSON(copy.inputs_[input_name], val);
      }
      // restore ability state
      if (json.ability) copy.currentAbility = json.ability;
      // internal_attributes copied from json may have to be reflected in the text and correct ability has to be shown
      copy.refreshText();

      copy.shutdown_json = json;
      if (this.copyFromJSONCallback) this.copyFromJSONCallback(copy);
      return copy;
    }

    fillInputFromJSON(description, value) {
      switch (description.type) {
        case 'object':
          console.log('desc', description, 'value', value);
          if (value !== null) {
            for (const property_name in description.properties)
              this.fillInputFromJSON(description.properties[property_name], value[property_name]);
          }
          break;
        case 'number': case 'integer':
          description.node.value = +value;
          break;
        case 'boolean':
          description.node.checked = value;
          break;
        case 'string':
          description.node.value = value;
          break;
      }
    }

    revive() {
      this.shutdown_ = false;
      delete this.shutdown_json;
    }

    shutdown(json) {
      this.shutdown_ = true;
      this.shutdown_json = json;
    }

    refreshText() {
      this.setText_(this.abilityTexts[this.currentAbility] ? this.abilityTexts[this.currentAbility] : this.defaultText);
    }

  }

  class MacroBlock extends MacroBuildingElement {

    constructor(qualifier, classname, editor, elgroup = null) {
      super(qualifier, classname, editor, elgroup);
      this.abilities = ['executable'];
    }

  }

  class MacroCard extends MacroBuildingElement {

    constructor(qualifier, classname, editor, elgroup = null) {
      super(qualifier, classname, editor, elgroup);
      this.className = 'macroblock macrocard';
    }

  }

  customElements.define('macro-block', MacroBlock);
  customElements.define('macro-card', MacroCard);
  window.exports = {
    MacroBuildingElement: MacroBuildingElement,
    MacroCard: MacroCard,
    MacroBlock: MacroBlock,
  };
})();
