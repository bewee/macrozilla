class Parameter extends HTMLElement {

  constructor(name, editor) {
    super();
    this.name = name;
    this.editor = editor;
    this.cards = [];
    this.multicards = false;
    this.accepts = [];
    this.text = '';
    this.className = 'cardplaceholder';
    this.innerHTML = (this.text ? this.text : this.name);
  }

  setText(txt) {
    this.text = txt;
    if (this.cards.length <= 0)
      this.innerHTML = txt;
  }

  placeCard(cardel) {
    if (this.innerHTML == this.name || this.innerHTML == this.text || !this.multicards)
      this.innerHTML = '';
    this.id = '';
    this.className = 'cardplaceholder filled';
    this.appendChild(cardel);
    cardel.style.top = '';
    cardel.style.left = '';
    this.editor.cardpholder = null;
    this.cards.push(cardel);
  }

  setAccepted(acc) {
    this.accepts = acc;
  }

  copy() {
    const copyinstance = new this.constructor(this.name, this.editor);
    copyinstance.multicards = this.multicards;
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

  toJSON(idobj) {
    if (this.cards.length <= 0)
      return {};
    if (this.multicards) {
      const l = [];
      this.cards.forEach((card) => {
        l.push(card.toJSON(idobj));
      });
      return l;
    } else {
      return this.cards[0].toJSON(idobj);
    }
  }

  reset(cardobj) {
    this.className = this.className.split(' ').filter((x) => x !== 'filled').join(' ');
    this.cards = this.cards.filter((x) => x !== cardobj);
    if (this.cards.length <= 0) {
      this.innerHTML = (this.text ? this.text : this.name);
    }
  }
}

customElements.define('macro-param', Parameter);
window.exports = Parameter;
