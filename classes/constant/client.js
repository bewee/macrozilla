class ConstantClass {
  constructor(handler) {
    {
      const card = handler.addCard('boolean', ['Constants']);
      card.setTooltipText('True/False');
      card.addAbility('evaluable');
      const inp = card.addInput('value', 'boolean', {checked: true});
      card.setText('%p', inp);
    }
    {
      const card = handler.addCard('number', ['Constants']);
      card.setTooltipText('Number');
      card.addAbility('evaluable');
      const inp = card.addInput('value', 'number', {placeholder: 'number'});
      card.setText('%p', inp);
    }
    {
      const card = handler.addCard('string', ['Constants']);
      card.setTooltipText('Text');
      card.addAbility('evaluable');
      const inp = card.addInput('value', 'string', {placeholder: 'text'});
      card.setText('%p', inp);
    }
    {
      const card = handler.addCard('null', ['Constants']);
      card.setTooltipText('None');
      card.addAbility('evaluable');
      card.setText('none');
      card.setJSONAttribute('value', null);
    }
  }

}
window.exports = ConstantClass;
