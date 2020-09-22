'use strict';

class MacroBuildingElement extends HTMLElement {

  constructor(qualifier, classname, editor, _elgroup = null) {
    super();

    this.parameters = {};
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
