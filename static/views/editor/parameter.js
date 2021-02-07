(() => {
  class Parameter extends HTMLElement {

    constructor(name, editor) {
      super();
      this.name = name;
      this.editor = editor;
      this.cards = [];
      this.multi = false;
      this.accepts = null;
      this.text = '';
      this.className = 'cardplaceholder';
      this.innerHTML = (this.text ? this.text : this.name);
    }

    setText(txt) {
      this.text = txt;
      if (this.cards.length <= 0)
        this.innerHTML = txt;
    }

    placeCard(cardel, before) {
      if (!this.multi) {
        this.cards.forEach((x) => {
          x.remove();
        });
        this.cards = [cardel];
      }
      if (!this.className.split(' ').includes('filled')) {
        this.innerHTML = '';
        this.className += ' filled';
      }
      this.id = '';
      cardel.style.top = '';
      cardel.style.left = '';
      if (!before) {
        this.appendChild(cardel);
        this.cards.push(cardel);
      } else {
        this.insertBefore(cardel, before);
        const index = this.cards.indexOf(before);
        this.cards.splice(index, 0, cardel);
      }
    }

    removeCard(cardel) {
      this.removeChild(cardel);
      this.cards = this.cards.filter((x) => x !== cardel);
      if (this.cards.length <= 0) {
        this.innerHTML = (this.text ? this.text : this.name);
        this.className = this.className.split(' ').filter((x) => x !== 'filled').join(' ');
      }
    }

    setAccepted(acc) {
      if (acc.slice(-2) === '[]') {
        this.accepts = acc.slice(0, -2);
        this.multi = true;
        this.className += ' multi';
      } else {
        this.accepts = acc;
        this.multi = false;
        this.className = this.className.split(' ').filter((x) => x !== 'multi').join(' ');
      }
      if (this.accepts == 'executable' || this.accepts == 'header')
        this.className += ' executable';
      else
        this.className = this.className.split(' ').filter((x) => x !== 'executable').join(' ');
    }

    copy() {
      const copyinstance = new this.constructor(this.name, this.editor);
      copyinstance.multi = this.multi;
      // copy html attributes
      for (let i = this.attributes.length - 1; i > -1; --i) {
        copyinstance.setAttribute(this.attributes[i].name, this.attributes[i].value);
      }
      copyinstance.accepts = this.accepts;
      if (this.text)
        copyinstance.setText(this.text);
      // Copy cards if existent
      if (this.cards.length > 0) {
        for (const card of this.cards) {
          copyinstance.placeCard(card);
        }
      }
      return copyinstance;
    }

    getSerialization() {
      if (this.cards.length <= 0) {
        if (this.multi)
          return [];
        else
          return null;
      }
      if (this.multi) {
        const l = [];
        this.cards.forEach((card) => {
          l.push(card.getSerialization());
        });
        return l;
      } else {
        return this.cards[0].getSerialization();
      }
    }

    copyFromSerialization(serialization, maxid) {
      const copy = this.copy();
      copy.loadFromSerialization(serialization, maxid);
      return copy;
    }

    loadFromSerialization(serialization, maxid) {
      if (Array.isArray(serialization)) {
        for (const el of serialization) {
          this.loadFromSerialization_(el, maxid);
        }
      } else {
        this.loadFromSerialization_(serialization, maxid);
      }
    }

    loadFromSerialization_(serialization, maxid) {
      const paramhandler = this.editor.classHandlers[serialization.type];
      let param = Object.values(paramhandler.buildingelements)[0];
      if (serialization.qualifier)
        param = paramhandler.buildingelements[serialization.qualifier];
      const cparam = param.copyFromSerialization(serialization, maxid);
      this.placeCard(cparam);
    }

    reset(cardobj) {
      if (cardobj === true && !this.multi)
        this.cards = [];
      else
        this.cards = this.cards.filter((x) => x !== cardobj);
      if (this.cards.length <= 0) {
        this.innerHTML = (this.text ? this.text : this.name);
        this.className = this.className.split(' ').filter((x) => x !== 'filled').join(' ');
      }
    }
  }

  customElements.define('macro-param', Parameter);
  window.exports = Parameter;
})();
