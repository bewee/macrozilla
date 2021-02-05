(() => {
  class ConstantClass {
    constructor(handler) {
      {
        const card = handler.addCard('boolean', ['Constants']);
        card.setTooltipText('True/False');
        card.addAbility('evaluable');
        card.addInput('value', {type: 'boolean', value: true});
        card.setText('%i', 'value');
      }
      {
        const card = handler.addCard('number', ['Constants']);
        card.setTooltipText('Number');
        card.addAbility('evaluable');
        card.addInput('value', {type: 'number', placeholder: 'number'});
        card.setText('%i', 'value');
      }
      {
        const card = handler.addCard('string', ['Constants']);
        card.setTooltipText('Text');
        card.addAbility('evaluable');
        card.addInput('value', {type: 'string', placeholder: 'text'});
        card.setText('%i', 'value');
      }
      {
        const card = handler.addCard('null', ['Constants']);
        card.setTooltipText('None');
        card.addAbility('evaluable');
        card.setText('none');
        card.addInternalAttribute('value', null);
      }
    }

  }
  window.exports = ConstantClass;
})();
