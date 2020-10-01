class EditorView {

  constructor(extension) {
    this.extension = extension;

    // import helper files
    this.extension.loadModule('static/views/editor/parameter.js').then((mod) => {
      this.Parameter = mod;
    });
    this.extension.loadModule('static/views/editor/macrobuildingelements.js').then((mod) => {
      this.MacroBuildingElement = mod.MacroBuildingElement;
      this.MacroBlock = mod.MacroBlock;
      this.MacroCard = mod.MacroCard;
    });
    this.extension.loadModule('static/views/editor/handler.js').then((mod) => {
      this.Handler = mod;
    });
    this.extension.loadModule('static/views/editor/macrobuildinggroup.js').then((mod) => {
      this.MacroBuildingGroup = mod;
    });

    // load class modules
    this.classes = {};
    window.API.postJson('/extensions/macrozilla/api/list-classes', {}).then((response) => {
      response.list.forEach((classname) => {
        this.extension.loadModule(`classes/${classname}/client.js`).then((c) => {
          this.classes[classname] = c;
          if (!this.classes[classname])
            console.warn('Missing class module', classname);
        });
      });
    });
  }

  changes() {
    if (!this.changes_)
      document.querySelector('#macrotoolbar h1').innerHTML += '*';
    this.changes_ = true;
  }

  show(macro) {
    this.changes_ = false;
    this.nextid = 1;
    this.categories = {};
    this.buildingArea = document.querySelector('#buildingarea');
    this.macroInterface = document.querySelector('.macrointerface');
    this.programArea = document.querySelector('#programarea');
    this.macroSidebar = document.querySelector('#macrosidebar');
    this.throwTrashHere = document.querySelector('#throwtrashhere');

    this.header_hull = new this.Parameter('', this);
    this.header_hull.setAccepted('header[]');
    this.macroInterface.appendChild(this.header_hull);
    this.hull = new this.Parameter('Drop blocks here to define your macro!', this);
    this.hull.setAccepted('executable[]');
    this.macroInterface.appendChild(this.hull);

    document.querySelector('#macrotoolbar h1').innerHTML = macro.name;
    this.macro_name = macro.name;
    this.macro_id = macro.id;
    document.querySelector('#editor-back-button').addEventListener('click', async () => {
      if (this.changes_ && window.confirm('Save Changes?'))
        await this.saveMacro();
      this.extension.views.macrolist.show();
    });
    document.querySelector('#playmacro').addEventListener('click', async () => {
      this.executeMacro();
    });
    document.querySelector('#savemacro').addEventListener('click', async () => {
      this.saveMacroAndUpdateInterface();
    });
    this.initSideBar();
    this.initDnD();
    this.loadMacro();
  }

  async saveMacroAndUpdateInterface() {
    await this.saveMacro(this.macro_id);
    const titleel = document.querySelector('#macrotoolbar h1');
    titleel.innerHTML = this.macro_name;
    this.changes_ = false;
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
    const json = res.macro.description;
    const maxid = {i: 1};
    const headless_json = [];
    const processed_obligatoryheaders = new Set();
    // load headers from json
    for (const b of json) {
      let be = null;
      if ('qualifier' in b)
        be = this.classHandlers[b.type].buildingelements[b.qualifier];
      else
        be = Object.values(this.classHandlers[b.type].buildingelements)[0];
      if (be.abilities.includes('header') && (be.obligatory || b.ability === 'header')) {
        const be_copy = be.copyFromJSON(b, maxid);
        be_copy.obligatory = be.obligatory;
        this.header_hull.placeCard(be_copy);
        processed_obligatoryheaders.add(be);
      } else {
        headless_json.push(b);
      }
    }
    this.hull.copyFromJSON(headless_json, maxid);
    this.nextid = maxid.i+1;
    // add missing obligatory headers
    for (const ch of Object.values(this.classHandlers)) {
      for (const be of Object.values(ch.buildingelements)) {
        if (be.abilities.includes('header') && be.obligatory && !processed_obligatoryheaders.has(be)) {
          const be_copy = be.copy();
          be_copy.obligatory = be.obligatory;
          be_copy.setAttribute('macro-block-no', this.nextid++);
          this.header_hull.placeCard(be_copy);
        }
      }
    }
  }

  async saveMacro() {
    const json = this.header_hull.toJSON();
    for (const b of json) {
      let be = null;
      if ('qualifier' in b)
        be = this.classHandlers[b.type].buildingelements[b.qualifier];
      else
        be = Object.values(this.classHandlers[b.type].buildingelements)[0];
      if (be.abilities.includes('header') && be.abilities.length > 1) {
        b.ability = 'header';
      }
    }
    json.push(...this.hull.toJSON());
    console.log('saving', JSON.stringify(json));
    const res = await window.API.postJson('/extensions/macrozilla/api/update-macro', {id: this.macro_id, description: json});
    console.log('result', res);
  }

  initSideBar() {
    this.classHandlers = {};
    Object.keys(this.classes).forEach((classname) => {
      if (!this.classes[classname])
        return;
      this.classHandlers[classname] = new this.Handler.prototype.constructor(classname, this);
      new this.classes[classname].prototype.constructor(this.classHandlers[classname]);
    });
  }

  initDnD() {
    this.dragel = null;
    const prevel = document.createElement('DIV');
    prevel.className = 'preview';
    this.hovercontainer = null;
    this.buildingArea.addEventListener('mousedown', (ev) => {
      if (this.dragel) return;
      let node = ev.target;
      while (node.parentNode && !(node instanceof this.MacroBuildingElement)) {
        node = node.parentNode;
      }
      if (!node || node === document) return;
      if (node.abilities[0] == 'header' && node.obligatory) return;
      this.changes();
      if (node.parentNode instanceof this.Parameter) {
        this.dragel = node;
        this.dragel.parentNode.removeCard(this.dragel);
      } else {
        this.dragel = node.copy();
        this.dragel.setAttribute('macro-block-no', this.nextid++);
      }
      this.dragel.id = 'currentdrag';
      this.macroSidebar.appendChild(this.dragel);
      this.setIdling(true);
      this.throwTrashHere.className = 'active';
      const evt = document.createEvent('MouseEvents');
      evt.initMouseEvent('mousemove', true, true, window, 0, ev.screenX, ev.screenY, ev.clientX, ev.clientY, false, false, false, false, 0, ev.target);
      ev.target.dispatchEvent(evt);
    });
    this.buildingArea.addEventListener('mouseup', () => {
      if (!this.dragel) return;
      const container = this.whereToPlace(this.dragel);
      this.resetHovercontainer();
      if (container) {
        const posel = this.whereToPlaceInContainer(this.dragel, container);
        container.placeCard(this.dragel, posel);
      } else {
        this.macroSidebar.removeChild(this.dragel);
      }
      prevel.remove();
      this.dragel.id = this.dragel.style.left = this.dragel.style.top = '';
      this.setIdling(false);
      this.throwTrashHere.className = '';
      this.dragel = null;
    });
    this.buildingArea.addEventListener('mousemove', (ev) => {
      if (!this.dragel) return;
      this.move(this.dragel, ev.clientX, ev.clientY);
      const container = this.whereToPlace(this.dragel);
      this.resetHovercontainer();
      if (container) {
        const posel = this.whereToPlaceInContainer(this.dragel, container);
        container.insertBefore(prevel, posel);
        this.setupHovercontainer(container);
        this.dragel.useAbility(container.accepts);
      } else {
        this.dragel.useAbility(null);
        prevel.remove();
      }
    });
  }

  resetHovercontainer() {
    if (this.hovercontainer) {
      this.hovercontainer.className = this.hovercontainer.className.split(' ').filter((x) => x !== 'hover').join(' ');
      this.hovercontainer.style.minWidth = '';
      this.hovercontainer.style.minHeight = '';
    }
  }

  setupHovercontainer(container) {
    this.hovercontainer = container;
    this.hovercontainer.className += ' hover';
    const rect_dragel = this.dragel.getBoundingClientRect();
    if (this.hovercontainer === this.hull) return;
    this.hovercontainer.style.minWidth = `${rect_dragel.width}px`;
    this.hovercontainer.style.minHeight = `${rect_dragel.height}px`;
  }

  setIdling(s) {
    if (s) {
      document.querySelectorAll('.macroblock').forEach((el) => {
        el.className += ' idling';
        el.style.animationDelay = `${Math.random()}s`;
      });
    } else {
      document.querySelectorAll('.macroblock').forEach((el) => {
        el.className = el.className.split(' ').filter((x) => x !== 'idling').join(' ');
        el.style.animationDelay = '';
      });
    }
  }

  move(el, x, y) {
    const rect = el.getBoundingClientRect();
    const rect2 = document.getElementById('extension-macrozilla-view').getBoundingClientRect();
    const px = (x-rect2.left-rect.width/2);
    const py = (y-rect2.top-rect.height/2);
    el.style.left = `${px}px`;
    el.style.top = `${py}px`;
  }

  whereToPlace(dragel) {
    const dragel_rect = dragel.getBoundingClientRect();
    const mouse_x = (dragel_rect.left+dragel_rect.right)/2;
    const mouse_y = (dragel_rect.top+dragel_rect.bottom)/2;
    let container = null;
    for (const el of this.macroInterface.querySelectorAll('.cardplaceholder')) {
      const el_rect = el.getBoundingClientRect();
      if (mouse_x > el_rect.left && mouse_x < el_rect.right && mouse_y > el_rect.top && mouse_y < el_rect.bottom) {
        if (dragel.abilities.includes(el.accepts)) {
          container = el;
        }
      }
    }
    return container;
  }

  whereToPlaceInContainer(dragel, container) {
    const dragel_rect = dragel.getBoundingClientRect();
    const mouse_x = (dragel_rect.left+dragel_rect.right)/2;
    const mouse_y = (dragel_rect.top+dragel_rect.bottom)/2;
    for (const el of container.children) {
      if (!(el instanceof this.MacroBuildingElement)) continue;
      const el_rect = el.getBoundingClientRect();
      if (container.className.split(' ').includes('executable')) {
        // placed top-to-bottom
        const el_cy = (el_rect.bottom+el_rect.top)/2;
        if (mouse_y < el_cy) return el;
      } else {
        // placed left-to-right
        const el_cx = (el_rect.right+el_rect.left)/2;
        if (mouse_x < el_cx) return el;
      }
    }
    return null;
  }

}

window.exports = EditorView;
