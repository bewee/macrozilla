(() => {
  class VariableClass {

    constructor(handler) {
      this.variables = {};
      const load_card = handler.addLoadCard(null, (copy) => {
        if (copy.internal_attributes.variable_id in this.variables) {
          // update text of newly loaded variable card
          this.setupVariable(copy);
          copy.revive();
        } else {
          // mark card as unfinished loaded variable card
          copy.setAttribute('variable-waiting', copy.internal_attributes.variable_id);
        }
      });
      load_card.setTooltipText(`Variable _/_`);
      load_card.setJSONAttribute('variable_id', null);
      load_card.setText('Variable(id=%a)', 'variable_id');

      window.API.postJson('/extensions/macrozilla/api/list-variablepaths').then((res) => {
        res.list.forEach((p) => {
          window.API.postJson('/extensions/macrozilla/api/list-variables', {path_id: p.id}).then((res) => {
            res.list.forEach((v) => {
              this.variables[v.id] = `${p.name}/${v.name}`;
              // add variable cards to sidebar
              const card = handler.addCard(null, ['Variables']);
              card.setJSONAttribute('variable_id', v.id);
              this.setupVariable(card);
              // update text of unfinished loaded variable cards
              document.querySelectorAll(`macro-card[variable-waiting='${v.id}']`).forEach((c) => {
                c.removeAttribute('variable-waiting');
                this.setupVariable(c);
                c.revive();
              });
            });
          });
        });
      });
    }

    setupVariable(card) {
      card.addAbility('evaluable');
      card.addAbility('settable');
      card.addAbility('trigger', `${this.variables[card.internal_attributes.variable_id]} changed`);
      card.setTooltipText(`Variable ${this.variables[card.internal_attributes.variable_id]}`);
      card.setText(`${this.variables[card.internal_attributes.variable_id]}`);
      card.refreshText();
    }

  }

  window.exports = VariableClass;
})();
