class Handler {

  constructor(classname, editor) {
    this.editor = editor;
    this.groups = [];
    this.classname = classname;
    this.allcards = [];
    this.categories_ = {};
  }

  addElement(c, categories) {
    c.addEventListener('mousedown', this.editor.dragndrophandler.handleDragStart.bind(this.editor.dragndrophandler));
    c.addEventListener('mouseup', this.editor.dragndrophandler.handleDragEnd.bind(this.editor.dragndrophandler));

    document.querySelector('#macrosidebar').appendChild(c);

    this.assignCategory(categories[0], c);
    this.allcards.push(c);
  }

  addCardBlock(name, categories = []) {
    const c = new this.editor.MacroCardBlock(name, this.classname, this.editor);
    this.addElement(c, categories);
    return c;
  }

  addBlock(name, categories = []) {
    const c = new this.editor.MacroBlock(name, this.classname, this.editor);
    this.addElement(c, categories);
    return c;
  }

  addCard(name, categories = []) {
    const c = new this.editor.MacroCard(name, this.classname, this.editor);
    if (categories[0] == '_hidden')
      return c;
    this.addElement(c, categories);
    return c;
  }

  addGroup(identifier, categories = []) {
    const g = new this.editor.MacroBuildingGroup(identifier);
    this.groups[identifier] = g;
    document.querySelector('#macrosidebar').appendChild(g);
    this.assignCategory(categories[0], g);
    return g;
  }

  assignCategory(cat, element) {
    if (!cat)
      return;
    if (!Object.keys(this.categories_).includes(cat)) {
      const title = document.createElement('H2');
      title.innerHTML = cat;
      document.querySelector('#macrosidebar').appendChild(title);
      const container = document.createElement('DIV');
      document.querySelector('#macrosidebar').appendChild(container);
      this.categories_[cat] = container;
    }
    this.categories_[cat].appendChild(element);
  }

  getCardByName(query) {
    for (const c of this.allcards) {
      if (c.name == query) {
        return c;
      }
    }
    return null;
  }

}

window.exports = Handler;
