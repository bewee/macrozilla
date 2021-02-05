(() => {
  class Handler {

    constructor(classname, editor) {
      this.editor = editor;
      this.groups = {};
      this.classname = classname;
      this.buildingelements = {};
    }

    addElement(c, categories) {
      if (!(c.qualifier in this.buildingelements))
        this.buildingelements[c.qualifier] = c;

      if (categories[0] == '_hidden') {
        return c;
      }

      document.querySelector('#macrosidebar').appendChild(c);

      this.assignCategory(categories[0], c);
    }

    addBlock(qualifier, categories = []) {
      const c = new this.editor.MacroBlock(qualifier, this.classname, this.editor);
      this.addElement(c, categories);
      return c;
    }

    addLoadBlock(qualifier, fn) {
      const c = this.addBlock(qualifier, ['_hidden']);
      this.addCopyFromJSONCallback_(c, fn);
      c.shutdown(null);
      return c;
    }

    addHeaderBlock(qualifier, categories, obligatory) {
      const c = this.addBlock(qualifier, categories);
      c.abilities = ['header'];
      c.obligatory = obligatory;
      return c;
    }

    addCard(qualifier, categories = [], template) {
      let c;
      if (template) {
        c = template.copy();
        c.qualifier = qualifier;
      } else {
        c = new this.editor.MacroCard(qualifier, this.classname, this.editor);
      }
      this.addElement(c, categories);
      return c;
    }

    addLoadCard(qualifier, fn) {
      const c = this.addCard(qualifier, ['_hidden']);
      this.addCopyFromJSONCallback_(c, fn);
      c.shutdown(null);
      return c;
    }

    addCopyFromJSONCallback_(buildingelement, fn) {
      const oldCopyFromJSON = buildingelement.copyFromJSON;
      buildingelement.copyFromJSON = (json, maxid) => {
        const copy = oldCopyFromJSON.call(buildingelement, json, maxid);
        fn(copy);
        return copy;
      };
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
      if (!Object.keys(this.editor.categories).includes(cat)) {
        const title = document.createElement('H2');
        title.innerHTML = cat;
        document.querySelector('#macrosidebar').appendChild(title);
        const container = document.createElement('DIV');
        document.querySelector('#macrosidebar').appendChild(container);
        this.editor.categories[cat] = container;
      }
      this.editor.categories[cat].appendChild(element);
    }

    getCardByName(query) {
      for (const c of this.buildingelements) {
        if (c.name == query) {
          return c;
        }
      }
      return null;
    }

  }

  window.exports = Handler;
})();
