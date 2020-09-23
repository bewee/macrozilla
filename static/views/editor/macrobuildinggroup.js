class MacroBuildingGroup extends HTMLElement {

  constructor(identifier) {
    super();
    this.els = [];
    this.name = identifier;
    this.className = 'blockgroup';
    this.setAttribute('macrozilla-groupname', identifier);
  }

  assign = function(elmnt) {
    elmnt.setGroup(this);
    if (this.els.length == 0) {
      const rect = elmnt.getBoundingClientRect();
      this.style.width = `${rect.width}px`;
      this.style.height = `${rect.height}px`;
      this.appendChild(elmnt);
      this.els.push(elmnt);
      return;
    } else if (this.els.length == 1) {
      const otheropts = document.createElement('DIV');
      otheropts.className = 'otheroptions';
      this.appendChild(otheropts);
    }
    this.querySelector('.otheroptions').appendChild(elmnt);

    this.els.push(elmnt);
  }
}

customElements.define('macro-building-group', MacroBuildingGroup);
window.exports = MacroBuildingGroup;
