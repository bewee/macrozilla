'use strict';

class MacroBuildingElement extends HTMLElement {

  constructor(name, classname, _elgroup = null) {
    super();

    this.parameters = [];
    this.group = null;
    this.internal_attributes = {};
    this.abilities = [];
    this.name = name;
    this.classname = classname;
    this.setAttribute('title', name);
    this.setAttribute('alt', name);
    this.className = 'macroblock';
    this.innerHTML = `<span class='blockdescr'><span>${name}</span></span>`;
  }

  addParameter(name, accepts = []) {
    const p = new window.Parameter(name);
    p.setAccepted(accepts);
    //this.parameters.push(p);
    return p;
  }

  setText(ftext, ...linkedParams) {
    this.children[0].innerHTML = '';
    let i = 0;
    for (const strpart of ftext.split('%p')) {
      const txtnode = document.createElement('SPAN');
      txtnode.innerHTML = strpart;
      this.children[0].appendChild(txtnode);
      if (linkedParams[i]) {
        this.children[0].appendChild(linkedParams[i]);
        i++;
      }
    }
  }

  recursiveCopyElements(src, target) {
    for (const c of src.childNodes) {
      let c_target = null;
      switch (c.tagName) {
        case 'MACRO-PARAM':
          c_target = c.copy();
          target.appendChild(c_target);
          break;
        default:
          c_target = target.appendChild(c.cloneNode(false));
          this.recursiveCopyElements(c, c_target);
      }
    }
  }

  copy() {
    const copyinstance = new this.constructor(this.name, this.classname, this.group);
    copyinstance.parameters = this.parameters;
    copyinstance.internal_attributes = this.internal_attributes;
    copyinstance.classname = this.classname;
    copyinstance.abilities = this.abilities;
    for (let i = this.attributes.length - 1; i > -1; --i) {
      copyinstance.setAttribute(this.attributes[i].name, this.attributes[i].value);
    }
    copyinstance.innerHTML = '';
    this.recursiveCopyElements(this, copyinstance);
    return copyinstance;
  }

  setGroup(group) {
    this.group = group;
  }

  toJSON(idobj) {
    const jsonobj = {id: idobj.id, type: this.classname};
    Object.assign(jsonobj, this.internal_attributes);
    idobj.id++;
    for (const param of this.children[0].children) {
      if (param.tagName == 'MACRO-PARAM') {
        jsonobj[param.name] = param.toJSON(idobj);
      }
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

}

class MacroBlock extends MacroBuildingElement {

  constructor(name, classname, elgroup = null) {
    super(name, classname, elgroup);
    this.abilities = ['executable'];
  }

  copy() {
    this.successor = null;
    this.predecessor = null;
    const copyinstance = super.copy();
    copyinstance.successor = this.successor;
    copyinstance.predecessor = this.predecessor;
    return copyinstance;
  }

}

class MacroCard extends MacroBuildingElement {

  constructor(name, classname, elgroup = null) {
    super(name, classname, elgroup);
    this.className = 'macroblock macrocard';
  }

}

class MacroCardBlock extends MacroCard {

  constructor(name, classname, elgroup) {
    super(name, classname, elgroup);
    this.successor = null;
    this.predecessor = null;
  }

  copy() {
    const copyinstance = super.copy();
    copyinstance.successor = this.successor;
    copyinstance.predecessor = this.predecessor;
    return copyinstance;
  }

}

customElements.define('macro-block', MacroBlock);
window.MacroBlock = MacroBlock;
customElements.define('macro-card', MacroCard);
window.MacroCard = MacroCard;
customElements.define('macro-card-block', MacroCardBlock);
window.MacroCardBlock = MacroCardBlock;
