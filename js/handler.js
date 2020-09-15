class Handler {

  constructor(classname) {
    this.groups = [];
    this.classname = classname;
  }

  addElement(c, categories) {
    c.addEventListener('mousedown', window.handleDragStart);
    c.addEventListener('mouseup', window.handleDragEnd);

    document.querySelector('#macrosidebar').appendChild(c);

    this.assignCategory(categories[0], c);
    window.allcards.push(c);
  }

  addCardBlock(name, categories = []) {
    const c = new window.MacroCardBlock(name, this.classname);
    this.addElement(c, categories);
    return c;
  }

  addBlock(name, categories = []) {
    const c = new window.MacroBlock(name, this.classname);
    this.addElement(c, categories);
    return c;
  }

  addCard(name, categories = []) {
    const c = new window.MacroCard(name, this.classname);
    if (categories[0] == '_hidden')
      return c;
    this.addElement(c, categories);
    return c;
  }

  addGroup(identifier, categories = []) {
    const g = new window.MacrozillaBuildingGroup(identifier);
    this.groups[identifier] = g;
    document.querySelector('#macrosidebar').appendChild(g);
    this.assignCategory(categories[0], g);
    return g;
  }

  assignCategory(cat, element) {
    if (!cat)
      return;
    if (!Object.keys(window._categories).includes(cat)) {
      const title = document.createElement('H2');
      title.innerHTML = cat;
      document.querySelector('#macrosidebar').appendChild(title);
      const container = document.createElement('DIV');
      document.querySelector('#macrosidebar').appendChild(container);
      window._categories[cat] = container;
    }
    window._categories[cat].appendChild(element);
  }

  getCardByName(query) {
    for (const c of window.allcards) {
      if (c.name == query) {
        return c;
      }
    }
    return null;
  }

}

window.Handler = Handler;
