class EditorView {

  constructor(extension) {
    this.extension = extension;
    this.gridsize = 25;

    // import helper files
    this.extension.loadModule('js/editor/dragndrophandler.js').then((mod) => {
      this.dragndrophandler = new mod.prototype.constructor(this);
    });
    this.extension.loadModule('js/editor/parameter.js').then((mod) => {
      this.Parameter = mod;
    });
    this.extension.loadModule('js/editor/macrobuildingelements.js').then((mod) => {
      this.MacroBuildingElement = mod.MacroBuildingElement;
      this.MacroBlock = mod.MacroBlock;
      this.MacroCard = mod.MacroCard;
      this.MacroCardBlock = mod.MacroCardBlock;
    });
    this.extension.loadModule('js/editor/handler.js').then((mod) => {
      this.Handler = mod;
    });
    this.extension.loadModule('js/editor/macrobuildinggroup.js').then((mod) => {
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
    this.connectionnode = null;
    this.nextid = 1;
    this.categories = {};
    this.executePath = document.querySelector('#macro-execute-path');
    this.programArea = document.querySelector('#programarea');
    this.macroInterface = document.querySelector('#programarea .macrointerface');
    this.macroSidebar = document.querySelector('#macrosidebar');
    this.throwTrashHere = document.querySelector('#throwtrashhere');
    document.querySelector('#macrotoolbar h1').innerHTML = macro.name;
    document.querySelector('#macro-back-button').addEventListener('click', async () => {
      if (this.changes_ && window.confirm('Save Changes?'))
        await this.saveMacro(macro.id);
      this.extension.views.macrolist.show(macro.id);
    });
    document.querySelector('#playmacro').addEventListener('click', async () => {
      this.executeMacro(macro.id);
    });
    this.initSideBar();
    this.loadMacro(macro.id);
  }

  async executeMacro(macro_id) {
    if (this.changes_) {
      if (window.confirm('Save Changes?')) {
        await this.saveMacro(macro_id);
        const titleel = document.querySelector('#macrotoolbar h1');
        titleel.innerHTML = titleel.innerHTML.slice(0, -1);
        this.changes_ = false;
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
    const nodes = [];
    const maxid = {i: 1};
    for (const block of res.macro.description) {
      if (!(block.type in this.classHandlers)) {
        console.warn('Unknown class', block.type);
        continue;
      }
      const handler = this.classHandlers[block.type];
      if (!block.ui) {
        console.warn('Missing UI information', block.type);
        continue;
      }
      let blockel = handler.buildingelements[0];
      if ('qualifier' in block && block.qualifier !== null)
        blockel = handler.buildingelements.find((x) => x.qualifier === block.qualifier);
      if (!blockel) {
        console.warn('Cannot find matching building element');
        continue;
      }
      // add nodes
      const pnode = blockel.copyFromJSON(block, maxid);
      pnode.style.left = `${block.ui.px}px`;
      pnode.style.top = `${block.ui.py}px`;
      this.programArea.children[0].appendChild(pnode);
      nodes.push(pnode);
    }
    // add arrows
    for (let i = 1; i < nodes.length; i++) {
      nodes[i].predecessor = nodes[i-1];
      nodes[i-1].successor = nodes[i];
      this.connect(nodes[i-1], nodes[i]);
    }
    // set nextid
    this.nextid = maxid.i+1;
  }

  async saveMacro(macro_id) {
    const json = this.macroToJSON();
    console.log('saving', JSON.stringify(json));
    const res = await window.API.postJson('/extensions/macrozilla/api/update-macro', {id: macro_id, description: json});
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

  updateConnection(arrel, node1, node2) {
    const rect1 = node1.getBoundingClientRect();
    const rect2 = node2.getBoundingClientRect();
    const rect3 = this.executePath.getBoundingClientRect();
    const x1 = (rect1.left + rect1.width/2 - rect3.left);
    const y1 = (rect1.top + rect1.height/2 - rect3.top);
    const x2 = (rect2.left+rect2.width/2-rect3.left);
    const y2 = (rect2.top + rect2.height/2 - rect3.top);
    arrel.setAttribute('d', `M${x1},${y1} L${((x1+x2)/2)},${((y1+y2)/2)} L${x2},${y2}`);
    node1.successor = node2;
    node2.predecessor = node1;
  }

  connect(node1, node2) {
    if (node1 == null || node2 == null)
      return;
    if (document.querySelector(`.macro_arr_${node1.getAttribute('macro-block-no')}.macro_arr_${node2.getAttribute('macro-block-no')}`) != null) {
      return;
    }
    const connection = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    connection.setAttribute('marker-mid', 'url(#arrowhead)');
    connection.setAttribute('fill', 'none');
    connection.setAttribute('stroke', 'gray');
    connection.setAttribute('stroke-width', '3');
    connection.setAttribute('class', `macro_arr_${node1.getAttribute('macro-block-no')} macro_arr_${node2.getAttribute('macro-block-no')}`);
    this.updateConnection(connection, node1, node2);
    this.executePath.appendChild(connection);
  }

  macroToJSON() {
    let startblock = document.querySelector('.macroblock.placed');
    if (!startblock) return [];
    while (startblock.predecessor)
      startblock = startblock.predecessor;
    const buffer = [];
    while (startblock) {
      const cblock = startblock.toJSON();
      cblock.ui = {};
      cblock.ui.px = parseInt(startblock.style.left);
      cblock.ui.py = parseInt(startblock.style.top);
      buffer.push(cblock);
      startblock = startblock.successor;
    }
    return buffer;
  }

}

window.exports = EditorView;
