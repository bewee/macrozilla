(() => {
  class MacroBuildingElement extends HTMLElement {

    constructor(qualifier, classname, editor, _elgroup = null) {
      super();

      this.parameters = {};
      this.inputs = {};
      this.group = null;
      this.internal_attributes = {};
      this.abilities = {};
      this.qualifier = qualifier;
      this.classname = classname;
      this.editor = editor;
      this.setAttribute('title', qualifier);
      this.setAttribute('alt', qualifier);
      this.className = 'macroblock';
      this.innerHTML = `<span class='blockdescr'><span>${qualifier}</span></span>`;
      this.defaultText = {text: '', params: []};
      this.currentAbility = null;
      this.currentText = this.defaultText;
      this.shutdown_ = false;
      this.shutdownText = {text: 'Oops... :/', params: []};
      this.cached_serialization = {};
      this.refreshText();
    }

    setTooltipText(tooltip) {
      this.setAttribute('title', tooltip);
    }

    setText(ftext, ...linkedParams) {
      this.defaultText = {text: ftext, params: linkedParams};
      this.setText_(this.defaultText);
    }

    setShutdownText(ftext, ...linkedParams) {
      this.shutdownText = {text: ftext, params: linkedParams};
    }

    setGroup(group) {
      this.group = group;
    }

    refreshText() {
      this.setText_(this.abilities[this.currentAbility]);
    }

    refreshCachedSerialization() {
      this.cached_serialization = this.getSerialization();
    }

    getCachedSerialization() {
      return this.cached_serialization;
    }

    isShutdown() {
      return this.shutdown_;
    }

    shutdown() {
      this.shutdown_ = true;
      this.refreshText();
    }

    revive() {
      this.shutdown_ = false;
      this.refreshText();
    }

    changes() {
      this.editor.changes();
    }

    hasAbility(name) {
      return name in this.abilities;
    }

    addAbility(name, text, ...linkedParams) {
      if (this.hasAbility(name))
        throw Error(`Ability ${name} already exists`);
      this.abilities[name] = null;
      this.updateAbility(name, text, ...linkedParams);
    }

    addAbilities(...names) {
      for (const name of names) {
        this.addAbility(name);
      }
    }

    updateAbility(name, text, ...linkedParams) {
      if (!this.hasAbility(name))
        throw Error(`Unknown ability ${name}`);
      if (text)
        this.abilities[name] = {text: text, params: linkedParams};
      if (this.currentAbility === name)
        this.refreshText();
    }

    deleteAbility(name) {
      if (!this.hasAbility(name))
        throw Error(`Unknown ability ${name}`);
      delete this.abilities[name];
    }

    useAbility(name) {
      if (!this.hasAbility(name) && name !== null)
        throw Error(`Unknown ability ${name}`);
      if (this.currentAbility === name) return;
      this.currentAbility = name;
      this.refreshText();
    }

    getCurrentAbility() {
      return this.currentAbility;
    }

    getAbilities() {
      return Object.keys(this.abilities);
    }

    abilityCount() {
      return this.getAbilities().length;
    }

    hasInternalAttribute(name) {
      return name in this.internal_attributes;
    }

    addInternalAttribute(name, value) {
      if (this.hasInternalAttribute(name))
        throw Error(`Internal attribute ${name} already exists`);
      this.internal_attributes[name] = value;
    }

    updateInternalAttribute(name, value) {
      if (!this.hasInternalAttribute(name))
        throw Error(`Unknown internal attribute ${name}`);
      this.internal_attributes[name] = value;
      this.refreshText();
    }

    deleteInternalAttribute(name) {
      if (!this.hasInternalAttribute(name))
        throw Error(`Unknown internal attribute ${name}`);
      delete this.internal_attributes[name];
      this.refreshText();
    }

    renameInternalAttribute(name, new_name) {
      if (!this.hasInternalAttribute(name))
        throw Error(`Unknown internal attribute ${name}`);
      this.addInternalAttribute(new_name, this.internal_attributes[name]);
      this.deleteInternalAttribute(name);
      this.refreshText();
    }

    getInternalAttribute(name) {
      if (!this.hasInternalAttribute(name))
        throw Error(`Unknown internal attribute ${name}`);
      return this.internal_attributes[name];
    }

    internalAttributeCount() {
      return Object.keys(this.internal_attributes).length;
    }

    hasParameter(name) {
      return name in this.parameters;
    }

    addParameter(name, options = {}) {
      if (this.hasParameter(name))
        throw Error(`Parameter ${name} already exists`);
      options = Object.assign({}, options);
      const p = new this.editor.Parameter(name, this.editor);
      options.node = p;
      this.parameters[name] = options;
      this.updateParameter(name, options);
      return p;
    }

    updateParameter(name, options = {}, soft = true) {
      if (!this.hasParameter(name))
        throw Error(`Unknown parameter ${name}`);
      options = Object.assign({}, options);
      if (soft)
        options = Object.assign({}, this.parameters[name], options);
      const nodeWasVisible = this.getParameter(name).parentNode ? true : false;
      if ('accepts' in options)
        this.getParameter(name).setAccepted(options.accepts);
      if ('text' in options)
        this.getParameter(name).setText(options.text);
      if (nodeWasVisible)
        this.refreshText();
      return this.getParameter(name);
    }

    deleteParameter(name) {
      if (!this.hasParameter(name))
        throw Error(`Unknown parameter ${name}`);
      const nodeWasVisible = this.getParameter(name).parentNode ? true : false;
      delete this.parameters[name];
      if (nodeWasVisible)
        this.refreshText();
    }

    renameParameter(name, new_name) {
      if (!this.hasParameter(name))
        throw Error(`Unknown parameter ${name}`);
      const nodeWasVisible = this.getParameter(name).parentNode ? true : false;
      this.parameters[new_name] = this.parameters[name];
      delete this.parameters[name];
      if (nodeWasVisible)
        this.refreshText();
    }

    getParameter(name) {
      if (!this.hasParameter(name))
        throw Error(`Unknown parameter ${name}`);
      return this.parameters[name].node;
    }

    parameterCount() {
      return Object.keys(this.parameters).length;
    }

    hasInput(name) {
      return name in this.inputs;
    }

    addInput(name, options = {}) {
      options = Object.assign({}, options);
      if (this.hasInput(name))
        throw Error(`Input ${name} already exists`);
      return this.addInput_(name, options);
    }

    updateInput(name, options = {}, soft = true) {
      if (!this.hasInput(name))
        throw Error(`Unknown input ${name}`);
      options = Object.assign({}, options);
      if (soft) {
        options.value = options.value || this.getInputValue(name);
        options = Object.assign({}, this.inputs[name], options);
      }
      const nodeWasVisible = this.getInput(name).parentNode ? true : false;
      const inpnode = this.addInput_(name, options);
      if (nodeWasVisible)
        this.refreshText();
      return inpnode;
    }

    deleteInput(name) {
      if (!this.hasInput(name))
        throw Error(`Unknown input ${name}`);
      const nodeWasVisible = this.getInput(name).parentNode ? true : false;
      delete this.inputs[name];
      if (nodeWasVisible)
        this.refreshText();
    }

    renameInput(name, new_name) {
      if (!this.hasInput(name))
        throw Error(`Unknown input ${name}`);
      const nodeWasVisible = this.getInput(name).parentNode ? true : false;
      this.addInput(new_name, this.inputs[name]);
      this.deleteInput(name);
      if (nodeWasVisible)
        this.refreshText();
    }

    getInput(name) {
      if (!this.hasInput(name))
        throw Error(`Unknown input ${name}`);
      return this.inputs[name].node;
    }

    getInputValue(name) {
      if (!this.hasInput(name))
        throw Error(`Unknown input ${name}`);
      return this.inputs[name].value;
    }

    setInputValue(name, value) {
      if (!this.hasInput(name))
        throw Error(`Unknown input ${name}`);
      this.setInputValue_(this.inputs[name], value);
      this.inputs[name].value = value;
    }

    inputCount() {
      return Object.keys(this.inputs).length;
    }

    setText_(obj) {
      if (this.isShutdown())
        obj = this.shutdownText;
      if (!obj)
        obj = this.defaultText;
      this.currentText = obj;

      const ftext = obj.text.split(' ').join('&nbsp;');
      const linkedParams = obj.params;
      const selectors = ftext.match(/(%p|%i|%a|%d)/g) || [];
      if (selectors.length !== linkedParams.length)
        throw Error('Invalid number of linked parameters passed');
      this.children[0].innerHTML = '';
      let i = 0;
      for (const strpart of ftext.split(/(%p|%i|%a|%d|\n)/g)) {
        switch (strpart) {
          case '%p': {
            this.children[0].appendChild(this.getParameter(linkedParams[i]));
            i++;
            break;
          }
          case '%i': {
            this.children[0].appendChild(this.getInput(linkedParams[i]));
            i++;
            break;
          }
          case '%a': {
            const txtnode = document.createElement('SPAN');
            txtnode.setAttribute('attribute-name', linkedParams[i]);
            txtnode.innerHTML = this.getInternalAttribute(linkedParams[i]);
            this.children[0].appendChild(txtnode);
            i++;
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

    addInput_(name, options) {
      options.type = options.type || 'string';
      options.value =
        options.value ||
        options.type === 'string' && options.enum && options.enum[0] ||
        '';
      const inpnode = this.inputFromDescription(options, () => {
        this.inputs[name].value = this.getInputValue_(this.inputs[name]);
      });
      inpnode.setAttribute('input-name', name);
      options.node = inpnode;
      this.inputs[name] = options;
      this.setInputValue(name, options.value);
      return inpnode;
    }

    inputFromDescription(options, recursiveOnInput) {
      let node;

      if (options.type === 'object') {
        node = document.createElement('DIV');
        node.className = 'inp-object';
        for (const property in options.properties) {
          const label = document.createElement('SPAN');
          label.innerHTML = property;
          node.appendChild(label);
          const propelement = this.inputFromDescription(options.properties[property], (_this, ev) => {
            recursiveOnInput(this, ev);
            if (options.onInput)
              options.onInput(this, ev);
          });
          node.appendChild(propelement);
        }
      } else if (options.type === 'button') {
        node = document.createElement('BUTTON');
        node.innerHTML = options.text;
        node.addEventListener('click', (ev) => {
          if (options.onClick)
            options.onClick(this, ev);
        });
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
        node.addEventListener('input', (ev) => {
          this.changes();
          recursiveOnInput(this, ev);
          if (options.onInput)
            options.onInput(this, ev);
        });
      }

      node.addEventListener('mousedown', (ev) => {
        ev.stopPropagation();
      });

      options.node = node;
      return node;
    }

    setInputValue_(description, value) {
      if (typeof value === 'undefined' || value === null) return;
      switch (description.type) {
        case 'object':
          if (value !== null) {
            for (const property_name in description.properties)
              this.setInputValue_(description.properties[property_name], value[property_name]);
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

    copy() {
      const copyinstance = new this.constructor(this.qualifier, this.classname, this.group);
      copyinstance.editor = this.editor;
      copyinstance.classname = this.classname;
      // copy html attributes
      for (let i = this.attributes.length - 1; i > -1; --i)
        copyinstance.setAttribute(this.attributes[i].name, this.attributes[i].value);
      copyinstance.innerHTML = '';
      // copy nodes tree structure from this to copyinstance
      this.recursiveCopyElements(this, copyinstance);
      // copy parameters
      for (const param_name in this.parameters) {
        copyinstance.addParameter(param_name, this.parameters[param_name]);
      }
      // copy inputs
      for (const input_name in this.inputs) {
        copyinstance.addInput(input_name, this.inputs[input_name]);
      }
      // copy everything else
      copyinstance.internal_attributes = JSON.parse(JSON.stringify(this.internal_attributes));
      copyinstance.abilities = JSON.parse(JSON.stringify(this.abilities));
      copyinstance.defaultText = JSON.parse(JSON.stringify(this.defaultText));
      copyinstance.shutdownText = JSON.parse(JSON.stringify(this.shutdownText));
      copyinstance.currentText = JSON.parse(JSON.stringify(this.currentText));
      copyinstance.currentAbility = this.currentAbility;
      copyinstance.shutdown_ = this.shutdown_;
      copyinstance.cached_serialization = this.cached_serialization;

      copyinstance.refreshText();
      return copyinstance;
    }

    recursiveCopyElements(src, target) {
      for (const c of src.childNodes) {
        const c_target = target.appendChild(c.cloneNode(false));
        this.recursiveCopyElements(c, c_target);
      }
    }

    getSerialization() {
      if (this.isShutdown()) return this.cached_serialization;
      const serialization = {id: parseInt(this.getAttribute('macro-block-no')), type: this.classname};
      if (this.qualifier !== null)
        serialization.qualifier = this.qualifier;
      if (this.abilities[this.currentAbility])
        serialization.ability = this.currentAbility;
      // save internal_attributes
      Object.assign(serialization, this.internal_attributes);
      // save params recursively
      for (const param_name in this.parameters) {
        if (this.parameters[param_name].node.parentNode)
          serialization[param_name] = this.parameters[param_name].node.getSerialization();
      }
      // save input values
      for (const input_name in this.inputs) {
        if (this.getInput(input_name).parentNode && this.inputs[input_name].type !== 'button')
          serialization[input_name] = this.getInputValue_(this.inputs[input_name]);
      }
      return serialization;
    }

    getInputValue_(description) {
      if (description.node.parentNode) {
        switch (description.type) {
          case 'object': {
            const json = {};
            for (const property in description.properties) {
              json[property] = this.getInputValue_(description.properties[property]);
            }
            return json;
          }
          case 'number': case 'integer':
            return +description.node.value;
          case 'boolean':
            return description.node.checked;
          case 'string':
            return description.node.value;
        }
      }
    }

    loadFromSerialization(serialization, maxid) {
      maxid.i = Math.max(maxid.i, serialization.id);
      this.setAttribute('macro-block-no', serialization.id);
      this.className =
        this.className.split(' ').includes('macrocard') ?
          'macroblock macrocard placed' :
          'macroblock placed';
      // gather internal_attributes from serialization
      for (const ia in this.internal_attributes) {
        this.updateInternalAttribute(ia, serialization[ia]);
        (this.querySelector(`*[attribute-name=${ia}]`) || {}).innerHTML = this.getInternalAttribute(ia);
      }
      // fill parameters recursively
      for (const paramname in this.parameters) {
        const pholder = this.getParameter(paramname);
        if (!serialization[paramname]) continue;
        pholder.loadFromSerialization(serialization[paramname], maxid);
      }
      // fill input values
      for (const input_name in this.inputs) {
        const val = input_name in serialization ? serialization[input_name] : null;
        this.setInputValue(input_name, val);
      }
      // restore ability state
      if ('ability' in serialization) this.useAbility(serialization.ability);

      this.cached_serialization = serialization;
    }

    copyFromSerialization(serialization, maxid) {
      const copy = this.copy();
      copy.loadFromSerialization(serialization, maxid);
      return copy;
    }

  }

  class MacroBlock extends MacroBuildingElement {

    constructor(qualifier, classname, editor, elgroup = null) {
      super(qualifier, classname, editor, elgroup);
      this.addAbility('executable');
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
