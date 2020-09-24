class VariableClass {

  constructor(handler) {
    const load_card = handler.addLoadCard(null, (copy) => {
      copy.setAttribute('variable-waiting', copy.internal_attributes.variable_id);
    });
    load_card.setTooltipText(`Variable _/_`);
    load_card.addAbility('evaluable');
    load_card.addAbility('settable');
    load_card.addAbility('trigger');
    load_card.setJSONAttribute('variable_id', null);
    load_card.setText('Variable(id=%a)', 'variable_id');
    load_card.setAttribute('variable-waiting', null);

    window.API.postJson('/extensions/macrozilla/api/list-variablepaths').then((res) => {
      res.list.forEach((p) => {
        window.API.postJson('/extensions/macrozilla/api/list-variables', {path_id: p.id}).then((res) => {
          res.list.forEach((v) => {
            const card = handler.addCard(null, ['Variables']);
            card.setTooltipText(`Variable ${p.name}/${v.name}`);
            card.addAbility('evaluable');
            card.addAbility('settable');
            card.addAbility('trigger');
            card.setJSONAttribute('variable_id', v.id);
            card.setText(`${p.name}/${v.name}`);
            document.querySelectorAll(`macro-card[variable-waiting='${v.id}']`).forEach((c) => {
              c.setText(`${p.name}/${v.name}`);
              c.setTooltipText(`Variable ${p.name}/${v.name}`);
            });
          });
        });
      });
    });
  }

}

window.exports = VariableClass;
