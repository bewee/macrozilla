class ArithmeticClass {

  constructor(handler) {
    this.handler = handler;

    const g_arith_b = handler.addGroup('Arithmetic Operations', ['Maths']);
    const g_logic_b = handler.addGroup('Logic Operations', ['Maths']);
    const g_crement = handler.addGroup('Increment/Decrement Operations', ['Maths']);

    g_arith_b.assign(this.binaryCard('+', 'Plus'));
    g_arith_b.assign(this.binaryCard('-', 'Minus'));
    g_arith_b.assign(this.binaryCard('*', 'Multiply'));
    g_arith_b.assign(this.binaryCard('/', 'Divide'));

    this.binaryCard('round', 'Round', 'Round %p to %ps');
    this.unaryCard('negate', 'Negate', '-%p');
    this.binaryCard('pow', 'Power');
    this.binaryCard('mod', 'Modulo');
    this.unaryCard('abs', 'Absolute', '|%p|');

    {
      const card = this.handler.addCard('cmp', ['Maths']);
      card.setTooltipText('Comparison');
      card.addParameter('left', {accepts: 'evaluable', text: 'x'});
      card.addParameter('right', {accepts: 'evaluable', text: 'y'});
      card.addInput('cmp', 'string', {enum: ['=', '>', '<', '>=', '<=', '!='], venum: ['=', '>', '<', '≥', '≤', '≠']});
      card.setText(`%p %i %p`, 'left', 'cmp', 'right');
      card.addAbility('evaluable');
    }

    g_logic_b.assign(this.binaryCard('&', 'And', '%p and %p'));
    g_logic_b.assign(this.binaryCard('|', 'Or', '%p or %p'));
    g_logic_b.assign(this.binaryCard('^', 'Exclusive or', '%p xor %p'));

    this.unaryCard('not', 'Not', 'not %p');

    g_crement.assign(this.unaryBlock('++', 'Increment', '%p++'));
    g_crement.assign(this.unaryBlock('--', 'Decrement', '%p--'));
    this.unaryBlock('invert', 'Invert', 'Invert %p');
  }

  binaryCard(qualifier, tooltip_text, card_text) {
    const card = this.handler.addCard(qualifier, ['Maths']);
    card.setTooltipText(tooltip_text);
    card.addParameter('left', {accepts: 'evaluable', text: 'x'});
    card.addParameter('right', {accepts: 'evaluable', text: 'y'});
    if (card_text)
      card.setText(card_text, 'left', 'right');
    else
      card.setText(`%p ${qualifier} %p`, 'left', 'right');
    card.addAbility('evaluable');
    return card;
  }

  unaryCard(qualifier, tooltip_text, card_text) {
    const card = this.handler.addCard(qualifier, ['Maths']);
    card.setTooltipText(tooltip_text);
    card.addParameter('operand', {accepts: 'evaluable', text: 'x'});
    card.setText(card_text, 'operand');
    card.addAbility('evaluable');
    return card;
  }

  unaryBlock(qualifier, tooltip_text, card_text) {
    const block = this.handler.addBlock(qualifier, ['Maths']);
    block.setTooltipText(tooltip_text);
    block.addParameter('operand', {accepts: 'settable', text: 'x'});
    block.setText(card_text, 'operand');
    return block;
  }

}

window.exports = ArithmeticClass;
