'use strict';

class MacroBuildingElement extends HTMLElement {

  constructor(qualifier, classname, editor, _elgroup = null) {
    super();

    this.parameters = {};
    this.inputs = {};
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
    if ('multicards' in options)
      p.multicards = options.multicards;
    this.parameters[name] = p;
    return p;
  }

  addInput(name, type, options = {}) {
    let inpnode;
    switch (type) {
      case 'string':
        if (Array.isArray(options.enum)) {
          inpnode = document.createElement('SELECT');
          for (const i in options.enum) {
            const opt = document.createElement('OPTION');
            opt.value = options.enum[i];
            opt.innerHTML = options.venum ? options.venum[i] : options.enum[i];
            inpnode.appendChild(opt);
          }
        } else {
          inpnode = document.createElement('INPUT');
          inpnode.type = 'text';
          if ('placeholder' in options) inpnode.placeholder = options.placeholder;
          if ('value' in options) inpnode.value = options.value;
        }
        break;
      case 'number':
        inpnode = document.createElement('INPUT');
        inpnode.type = 'number';
        if ('placeholder' in options) inpnode.placeholder = options.placeholder;
        if ('min' in options) inpnode.min = options.min;
        if ('max' in options) inpnode.max = options.max;
        if ('step' in options) inpnode.step = options.step;
        if ('value' in options) inpnode.value = options.value;
        break;
      case 'boolean':
        inpnode = document.createElement('INPUT');
        inpnode.type = 'checkbox';
        if ('checked' in options) inpnode.checked = options.checked;
        break;
    }
    inpnode.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    });
    inpnode.addEventListener('input', (_e) => {
      this.editor.changes();
    });
    inpnode.setAttribute('input-name', name);
    this.inputs[name] = inpnode;
    return inpnode;
  }

  setText(ftext, ...linkedParams) {
    this.defaultText = {text: ftext, params: linkedParams};
    this.setText_(this.defaultText);
  }

  setText_(obj) {
    const ftext = obj.text;
    const linkedParams = obj.params;
    this.children[0].innerHTML = '';
    let i = 0;
    for (const strpart of ftext.split(/(%p|%i|%a)/g)) {
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
        default: {
          const txtnode = document.createElement('SPAN');
          txtnode.innerHTML = strpart;
          this.children[0].appendChild(txtnode);
          break;
        }
      }
    }
  }

  recursiveCopyElements(src, target, reference) {
    for (const c of src.childNodes) {
      let c_target = null;
      switch (c.tagName) {
        case 'MACRO-PARAM':
          c_target = c.copy();
          target.appendChild(c_target);
          reference.parameters[c.name] = c_target;
          break;
        case 'INPUT':
        case 'SELECT':
          c_target = target.appendChild(c.cloneNode(false));
          this.recursiveCopyElements(c, c_target, reference);
          reference.inputs[c.getAttribute('input-name')] = c_target;
          if (c_target.tagName == 'SELECT')
            c_target.value = c.value;
          c_target.addEventListener('mousedown', (e) => {
            e.stopPropagation();
          });
          c_target.addEventListener('input', (_e) => {
            this.editor.changes();
          });
          break;
        default:
          c_target = target.appendChild(c.cloneNode(false));
          this.recursiveCopyElements(c, c_target, reference);
      }
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
    for (let i = this.attributes.length - 1; i > -1; --i) {
      copyinstance.setAttribute(this.attributes[i].name, this.attributes[i].value);
    }
    copyinstance.innerHTML = '';
    this.recursiveCopyElements(this, copyinstance, copyinstance);
    for (const param_name in this.parameters) {
      if (!copyinstance.parameters[param_name]) {
        const cpy = this.parameters[param_name].copy();
        copyinstance.parameters[cpy.name] = cpy;
      }
    }
    for (const input_name in this.inputs) {
      if (!copyinstance.inputs[input_name]) {
        const cpy = this.inputs[input_name].cloneNode();
        this.recursiveCopyElements(this.inputs[input_name], cpy, null);
        if (cpy.tagName == 'SELECT')
          cpy.value = this.inputs[input_name].value;
        cpy.addEventListener('mousedown', (e) => {
          e.stopPropagation();
        });
        cpy.addEventListener('input', (_e) => {
          this.editor.changes();
        });
        copyinstance.inputs[input_name] = cpy;
      }
    }
    if (this.copyCallback) this.copyCallback(copyinstance);
    return copyinstance;
  }

  setGroup(group) {
    this.group = group;
  }

  toJSON() {
    const jsonobj = {id: parseInt(this.getAttribute('macro-block-no')), type: this.classname};
    if (this.qualifier !== null)
      jsonobj.qualifier = this.qualifier;
    if (this.abilityTexts[this.currentAbility])
      jsonobj.ability = this.currentAbility;
    Object.assign(jsonobj, this.internal_attributes);
    for (const param of this.children[0].children) {
      if (param.parentNode && param.tagName == 'MACRO-PARAM') {
        jsonobj[param.name] = param.toJSON();
      }
    }
    for (const input_name in this.inputs) {
      if (this.inputs[input_name].parentNode) {
        if (this.inputs[input_name].type == 'number')
          jsonobj[input_name] = parseInt(this.inputs[input_name].value);
        else if (this.inputs[input_name].type == 'checkbox')
          jsonobj[input_name] = this.inputs[input_name].checked;
        else
          jsonobj[input_name] = this.inputs[input_name].value;
      }
    }
    return jsonobj;
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
    for (const ia in copy.internal_attributes) {
      copy.internal_attributes[ia] = json[ia];
      copy.querySelector(`*[attribute-name=${ia}]`).innerHTML = this.internal_attributes[ia];
    }
    copy.addEventListener('mousedown', this.editor.dragndrophandler.handleDragStart.bind(this.editor.dragndrophandler));
    copy.addEventListener('mouseup', this.editor.dragndrophandler.handleDragEnd.bind(this.editor.dragndrophandler));
    for (const paramname in copy.parameters) {
      const pholder = copy.parameters[paramname];
      if (!json[paramname]) continue;
      if (Array.isArray(json[paramname])) {
        for (const el of json[paramname]) {
          const paramhandler = this.editor.classHandlers[el.type];
          let param = Object.values(paramhandler.buildingelements)[0];
          if (el.qualifier)
            param = paramhandler.buildingelements[el.qualifier];
          const cparam = param.copyFromJSON(el, maxid);
          pholder.placeCard(cparam);
        }
      } else {
        const paramhandler = this.editor.classHandlers[json[paramname].type];
        let param = Object.values(paramhandler.buildingelements)[0];
        if (json[paramname].qualifier)
          param = paramhandler.buildingelements[json[paramname].qualifier];
        const cparam = param.copyFromJSON(json[paramname], maxid);
        pholder.placeCard(cparam);
      }
    }
    for (const input_name in this.inputs) {
      let val;
      try {
        if (!(input_name in json)) throw 1;
        val = json[input_name];
      } catch (_ex) {
        val = null;
      }
      if (copy.inputs[input_name].type === 'checkbox')
        copy.inputs[input_name].checked = val;
      else
        copy.inputs[input_name].value = val;
    }
    if (json.ability) copy.useAbility(json.ability);
    copy.refreshText();
    if (this.copyFromJSONCallback) this.copyFromJSONCallback(copy);
    if (this.loadCallback) this.loadCallback(copy);
    return copy;
  }

  refreshText() {
    this.setText_(this.abilityTexts[this.currentAbility] ? this.abilityTexts[this.currentAbility] : this.defaultText);
  }

}

class MacroBlock extends MacroBuildingElement {

  constructor(qualifier, classname, editor, elgroup = null) {
    super(qualifier, classname, editor, elgroup);
    this.abilities = ['executable'];
    this.successor = null;
    this.predecessor = null;
  }

  copy() {
    const copyinstance = super.copy();
    copyinstance.successor = this.successor;
    if (copyinstance.successor)
      copyinstance.successor.predecessor = copyinstance;
    copyinstance.predecessor = this.predecessor;
    if (copyinstance.predecessor)
      copyinstance.predecessor.successor = copyinstance;
    this.successor = null;
    this.predecessor = null;
    return copyinstance;
  }

}

class MacroCard extends MacroBuildingElement {

  constructor(qualifier, classname, editor, elgroup = null) {
    super(qualifier, classname, editor, elgroup);
    this.className = 'macroblock macrocard';
  }

}

class MacroCardBlock extends MacroCard {

  constructor(qualifier, classname, editor, elgroup) {
    super(qualifier, classname, editor, elgroup);
    this.successor = null;
    this.predecessor = null;
  }

  copy() {
    const copyinstance = super.copy();
    copyinstance.successor = this.successor;
    if (copyinstance.successor)
      copyinstance.successor.predecessor = copyinstance;
    copyinstance.predecessor = this.predecessor;
    if (copyinstance.predecessor)
      copyinstance.predecessor.successor = copyinstance;
    this.successor = null;
    this.predecessor = null;
    return copyinstance;
  }

}

customElements.define('macro-block', MacroBlock);
customElements.define('macro-card', MacroCard);
customElements.define('macro-card-block', MacroCardBlock);
window.exports = {
  MacroBuildingElement: MacroBuildingElement,
  MacroCard: MacroCard,
  MacroBlock: MacroBlock,
  MacroCardBlock: MacroCardBlock,
};
