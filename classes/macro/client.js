(() => {
  class MacroClass {

    constructor(handler) {
      this.macros = {};
      const load_card = handler.addLoadCard(null, (copy) => {
        if (copy.getInternalAttribute('macro_id') in this.macros) {
          this.setupExecuteMacro(copy);
        } else {
          copy.setAttribute('macro-waiting', copy.getInternalAttribute('macro_id'));
        }
      });
      load_card.setTooltipText(`Execute Macro _/_`);
      load_card.addInternalAttribute('macro_id', null);
      load_card.setShutdownText('Execute Macro (id=%a)', 'macro_id');
      load_card.addInput('moment', {type: 'string', enum: ['started', 'finished']});
      load_card.addAbilities('trigger', 'macro');

      {
        const block = handler.addBlock('execute', ['Macros']);
        block.addParameter('macro', {accepts: 'macro', text: 'Macro'});
        block.setTooltipText('Execute Macro');
        block.setText('Execute %p', 'macro');
      }

      window.API.postJson('/extensions/macrozilla/api/list-macropaths').then((res) => {
        res.list.forEach((p) => {
          window.API.postJson('/extensions/macrozilla/api/list-macros', {path_id: p.id}).then((res) => {
            res.list.forEach((m) => {
              this.macros[m.id] = `${p.name}/${m.name}`;
              const card = handler.addCard(null, ['Macros'], load_card);
              card.updateInternalAttribute('macro_id', m.id);
              this.setupMacro(card);
              document.querySelectorAll(`macro-card[macro-waiting='${m.id}']`).forEach((c) => {
                c.removeAttribute('macro-waiting');
                this.setupMacro(c);
              });
            });
          });
        });
      });
    }

    setupMacro(card) {
      card.updateAbility('trigger', `${this.macros[card.getInternalAttribute('macro_id')]} %i executing`, 'moment');
      card.setTooltipText(`Macro ${this.macros[card.getInternalAttribute('macro_id')]}`);
      card.setText(`${this.macros[card.getInternalAttribute('macro_id')]}`);
      card.revive();
    }

  }

  window.exports = MacroClass;
})();
