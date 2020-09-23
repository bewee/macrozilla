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
  }

  setTooltipText(tooltip) {
    this.setAttribute('title', tooltip);
  }

  addParameter(name, accepts = []) {
    const p = new this.editor.Parameter(name, this.editor);
    p.setAccepted(accepts);
    this.parameters[name] = p;
    return p;
  }

  addInput(name, type, options) {
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
    inpnode.setAttribute('data-name', name);
    this.inputs[name] = inpnode;
    return inpnode;
  }

  setText(ftext, ...linkedParams) {
    this.children[0].innerHTML = '';
    let i = 0;
    for (const strpart of ftext.split(/(%p)/g)) {
      switch (strpart) {
        case '%p': {
          if (linkedParams[i]) {
            this.children[0].appendChild(linkedParams[i]);
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
        default:
          c_target = target.appendChild(c.cloneNode(false));
          this.recursiveCopyElements(c, c_target, reference);
      }
    }
  }

  copy() {
    const copyinstance = new this.constructor(this.qualifier, this.classname, this.group);
    copyinstance.parameters = this.parameters;
    copyinstance.editor = this.editor;
    copyinstance.internal_attributes = this.internal_attributes;
    copyinstance.classname = this.classname;
    copyinstance.abilities = this.abilities;
    for (let i = this.attributes.length - 1; i > -1; --i) {
      copyinstance.setAttribute(this.attributes[i].name, this.attributes[i].value);
    }
    copyinstance.innerHTML = '';
    this.recursiveCopyElements(this, copyinstance, copyinstance);
    for (const input_name in this.inputs) {
      copyinstance.inputs[input_name] = copyinstance.querySelector(`*[data-name=${input_name}]`);
      if (copyinstance.inputs[input_name].tagName == 'SELECT')
        copyinstance.inputs[input_name].value = this.inputs[input_name].value;
      copyinstance.inputs[input_name].addEventListener('mousedown', (e) => {
        e.stopPropagation();
      });
      copyinstance.inputs[input_name].addEventListener('input', (_e) => {
        this.editor.changes();
      });
    }
    return copyinstance;
  }

  setGroup(group) {
    this.group = group;
  }

  toJSON() {
    const jsonobj = {id: parseInt(this.getAttribute('macro-block-no')), type: this.classname};
    if (this.qualifier !== null)
      jsonobj.qualifier = this.qualifier;
    Object.assign(jsonobj, this.internal_attributes);
    for (const param of this.children[0].children) {
      if (param.tagName == 'MACRO-PARAM') {
        jsonobj[param.name] = param.toJSON();
      }
    }
    for (const input_name in this.inputs) {
      if (this.inputs[input_name].type == 'number')
        jsonobj[input_name] = parseInt(this.inputs[input_name].value);
      else if (this.inputs[input_name].type == 'checkbox')
        jsonobj[input_name] = this.inputs[input_name].checked;
      else
        jsonobj[input_name] = this.inputs[input_name].value;
    }
    return jsonobj;
  }

  setJSONAttribute(name, value) {
    this.internal_attributes[name] = value;
  }

  addAbility(name) {
    if (!this.abilities.includes(name))
      this.abilities.push(name);
  }

  copyFromJSON(json, maxid) {
    maxid.i = Math.max(maxid.i, json.id);
    const copy = this.copy();
    copy.setAttribute('macro-block-no', json.id);
    copy.className = copy.className.split(' ').includes('macrocard') ? 'macroblock macrocard placed' : 'macroblock placed';
    copy.addEventListener('mousedown', this.editor.dragndrophandler.handleDragStart.bind(this.editor.dragndrophandler));
    copy.addEventListener('mouseup', this.editor.dragndrophandler.handleDragEnd.bind(this.editor.dragndrophandler));
    for (const paramname in copy.parameters) {
      const pholder = copy.parameters[paramname];
      if (!json[paramname]) continue;
      if (Array.isArray(json[paramname])) {
        for (const el of json[paramname]) {
          const paramhandler = this.editor.classHandlers[el.type];
          let param = paramhandler.buildingelements[0];
          if (el.qualifier)
            param = paramhandler.buildingelements.find((x) => x.qualifier == el.qualifier);
          const cparam = param.copyFromJSON(el, maxid);
          pholder.placeCard(cparam);
        }
      } else {
        const paramhandler = this.editor.classHandlers[json[paramname].type];
        let param = paramhandler.buildingelements[0];
        if (json[paramname].qualifier)
          param = paramhandler.buildingelements.find((x) => x.qualifier == json[paramname].qualifier);
        const cparam = param.copyFromJSON(json[paramname], maxid);
        pholder.placeCard(cparam);
      }
    }
    for (const input_name in this.inputs) {
      let val;
      try {
        val = json[input_name];
      } catch (_ex) {
        val = null;
      }
      if (this.inputs[input_name].type == 'checkbox')
        copy.inputs[input_name].checked = val;
      else
        copy.inputs[input_name].value = val;
    }
    return copy;
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
