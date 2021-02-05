(() => {
  class VariableClass {

    constructor(handler) {
      this.variables = {};
      const load_card = handler.addLoadCard(null, (copy) => {
        if (copy.getInternalAttribute('variable_id') in this.variables) {
          // update text of newly loaded variable card
          this.setupVariable(copy);
          copy.revive();
        } else {
          // mark card as unfinished loaded variable card
          copy.setAttribute('variable-waiting', copy.getInternalAttribute('variable_id'));
        }
      });
      load_card.setTooltipText(`Variable _/_`);
      load_card.addInternalAttribute('variable_id', null);
      load_card.setShutdownText('Variable(id=%a)', 'variable_id');
      load_card.addAbilities('evaluable', 'settable', 'trigger');

      window.API.postJson('/extensions/macrozilla/api/list-variablepaths').then((res) => {
        res.list.forEach((p) => {
          window.API.postJson('/extensions/macrozilla/api/list-variables', {path_id: p.id}).then((res) => {
            res.list.forEach((v) => {
              this.variables[v.id] = `${p.name}/${v.name}`;
              // add variable cards to sidebar
              const card = handler.addCard(null, ['Variables'], load_card);
              card.updateInternalAttribute('variable_id', v.id);
              this.setupVariable(card);
              // update text of unfinished loaded variable cards
              document.querySelectorAll(`macro-card[variable-waiting='${v.id}']`).forEach((c) => {
                c.removeAttribute('variable-waiting');
                this.setupVariable(c);
              });
            });
          });
        });
      });
    }

    setupVariable(card) {
      card.updateAbility('trigger', `${this.variables[card.getInternalAttribute('variable_id')]} changed`);
      card.setTooltipText(`Variable ${this.variables[card.getInternalAttribute('variable_id')]}`);
      card.setText(`${this.variables[card.getInternalAttribute('variable_id')]}`);
      card.revive();
    }

  }

  window.exports = VariableClass;
})();
