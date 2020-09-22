class ArithmeticClass {

  constructor(handler) {
    this.handler = handler;

    const g_arith_b = handler.addGroup('Arithmetic Operations', ['Maths']);
    const g_logic_b = handler.addGroup('Logic Operations', ['Maths']);
    const g_cmp = handler.addGroup('Comparison Operations', ['Maths']);
    const g_crement = handler.addGroup('Increment/Decrement Operations', ['Maths']);

    g_arith_b.assign(this.binaryCard('+', 'Plus'));
    g_arith_b.assign(this.binaryCard('-', 'Minus'));
    g_arith_b.assign(this.binaryCard('*', 'Multiply'));
    g_arith_b.assign(this.binaryCard('/', 'Divide'));
    g_arith_b.assign(this.binaryCard('pow', 'Power'));
    g_arith_b.assign(this.binaryCard('%', 'Modulo'));

    this.binaryCard('round', 'Round', 'Round %p to %ps');
    this.unaryCard('negate', 'Negate', '-%p');
    this.unaryCard('abs', 'Absolute', '|%p|');

    g_cmp.assign(this.binaryCard('=', 'Equal'));
    g_cmp.assign(this.binaryCard('>', 'Greater'));
    g_cmp.assign(this.binaryCard('<', 'Less'));
    g_cmp.assign(this.binaryCard('>=', 'Greater or equal'));
    g_cmp.assign(this.binaryCard('<=', 'Less or equal'));
    g_cmp.assign(this.binaryCard('!=', 'Unequal'));

    g_logic_b.assign(this.binaryCard('&', 'And', '%p and %p'));
    g_logic_b.assign(this.binaryCard('|', 'Or', '%p or %p'));
    g_logic_b.assign(this.binaryCard('^', 'Exclusive or', '%p xor %p'));

    this.unaryCard('not', 'Not', 'not %p');

    g_crement.assign(this.unaryBlock('++', 'Increment', '%p++'));
    g_crement.assign(this.unaryBlock('--', 'Decrement', '%p--'));
    this.unaryBlock('invert', 'Invert', 'Invert %p');
  }

  binaryCard(qualifier, tooltip_text, card_text) {
    const card = this.handler.addCard(qualifier);
    card.setTooltipText(tooltip_text);
    const left = card.addParameter('left', ['evaluable']);
    const right = card.addParameter('right', ['evaluable']);
    left.setText('x');
    right.setText('y');
    if (card_text)
      card.setText(card_text, left, right);
    else
      card.setText(`%p ${qualifier} %p`, left, right);
    card.addAbility('evaluable');
    return card;
  }

  unaryCard(qualifier, tooltip_text, card_text) {
    const card = this.handler.addCard(qualifier);
    card.setTooltipText(tooltip_text);
    const operand = card.addParameter('operand', ['evaluable']);
    operand.setText('x');
    card.setText(card_text, operand);
    card.addAbility('evaluable');
    return card;
  }

  unaryBlock(qualifier, tooltip_text, card_text) {
    const block = this.handler.addBlock(qualifier);
    block.setTooltipText(tooltip_text);
    const operand = block.addParameter('operand', ['settable']);
    operand.setText('x');
    block.setText(card_text, operand);
    block.addAbility('evaluable');
    return block;
  }

}

window.exports = ArithmeticClass;
