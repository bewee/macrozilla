class EditorView {

  constructor(extension) {
    this.extension = extension;
    this.gridsize = 25;
    this.connectionnode = null;
    this.nextid = 1;

    // import helper files
    this.extension.loadModule('js/editor/dragndrophandler.js').then((mod) => {
      this.dragndrophandler = new mod.prototype.constructor(this);
    });
    this.extension.loadModule('js/editor/parameter.js').then((mod) => {
      this.Parameter = mod;
    });
    this.extension.loadModule('js/editor/macrobuildingblocks.js').then((mod) => {
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

  show() {
    this.executePath = document.querySelector('#macro-execute-path');
    this.programArea = document.querySelector('#programarea');
    this.macroInterface = document.querySelector('#programarea .macrointerface');
    this.macroSidebar = document.querySelector('#macrosidebar');
    this.throwTrashHere = document.querySelector('#throwtrashhere');
    this.initSideBar();
  }

  initSideBar() {
    Object.keys(this.classes).forEach((classname) => {
      if (!this.classes[classname])
        return;
      new this.classes[classname].prototype.constructor(new this.Handler.prototype.constructor(classname, this));
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
    node1.successor = node2;
    node2.predecessor = node1;
    const connection = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    connection.setAttribute('marker-mid', 'url(#arrowhead)');
    connection.setAttribute('fill', 'none');
    connection.setAttribute('stroke', 'gray');
    connection.setAttribute('stroke-width', '3');
    connection.setAttribute('class', `macro_arr_${node1.getAttribute('macro-block-no')} macro_arr_${node2.getAttribute('macro-block-no')}`);
    this.updateConnection(connection, node1, node2);
    this.executePath.appendChild(connection);
    this.connectionnode.style.opacity = '';
    this.connectionnode = null;
  }

  macroToJSON() {
    let startblock = document.querySelector('.macroblock.placed');
    while (startblock.predecessor)
      startblock = startblock.predecessor;
    const buffer = [];
    const i = {id: 1};
    while (startblock) {
      const cblock = startblock.toJSON(i);
      buffer.push(cblock);
      startblock = startblock.successor;
    }
    return buffer;
  }

}

window.exports = EditorView;
