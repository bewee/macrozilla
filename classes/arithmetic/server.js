'use strict';

async function not() {
  const operand = this.params.description.operand;
  const value = this.decodeBoolean(await this.call(operand, 'eval'));
  return this.encode(!value);
}

async function abs() {
  const operand = this.params.description.operand;
  const value = this.decodeNumber(await this.call(operand, 'eval'));
  return this.encode(Math.abs(value));
}

async function negate() {
  const operand = this.params.description.operand;
  const value = this.decodeNumber(await this.call(operand, 'eval'));
  return this.encode(-value);
}

async function boolparams() {
  const left = this.params.description.left;
  const right = this.params.description.right;
  const lvalue = this.decodeBoolean(await this.call(left, 'eval'));
  const rvalue = this.decodeBoolean(await this.call(right, 'eval'));
  return [lvalue, rvalue];
}

async function and() {
  const val = await boolparams.call(this);
  return this.encode(val[0] && val[1]);
}

async function or() {
  const val = await boolparams.call(this);
  return this.encode(val[0] || val[1]);
}

async function xor() {
  const val = await boolparams.call(this);
  return this.encode(val[0] ^ val[1]);
}

async function numparams() {
  const left = this.params.description.left;
  const right = this.params.description.right;
  const lvalue = this.decodeNumber(await this.call(left, 'eval'));
  const rvalue = this.decodeNumber(await this.call(right, 'eval'));
  return [lvalue, rvalue];
}

async function add() {
  const val = await numparams.call(this);
  return this.encode(val[0] + val[1]);
}

async function sub() {
  const val = await numparams.call(this);
  return this.encode(val[0] - val[1]);
}

async function mul() {
  const val = await numparams.call(this);
  return this.encode(val[0] * val[1]);
}

async function div() {
  const val = await numparams.call(this);
  return this.encode(val[0] / val[1]);
}

async function pow() {
  const val = await numparams.call(this);
  return this.encode(Math.pow(val[0], val[1]));
}

async function mod() {
  const val = await numparams.call(this);
  return this.encode(val[0] % val[1]);
}

async function round() {
  const val = await numparams.call(this);
  let v = Math.round(val[0] / val[1]) * val[1];
  if (Math.floor(Math.log10(val[1])) < 0)
    v = v.toFixed(-Math.floor(Math.log10(val[1])));
  return this.encode(v);
}

async function cmp() {
  const left = this.params.description.left, right = this.params.description.right;
  const comparator = this.params.description.cmp;
  const lraw = await this.call(left, 'eval');
  const rraw = await this.call(right, 'eval');
  const lval = this.decode(lraw), rval = this.decode(rraw);
  let cmp;
  switch (comparator) {
    case '=': cmp = (a, b) => a == b; break;
    case '>': cmp = (a, b) => a > b; break;
    case '<': cmp = (a, b) => a < b; break;
    case '>=': cmp = (a, b) => a >= b; break;
    case '<=': cmp = (a, b) => a <= b; break;
    case '!=': cmp = (a, b) => a != b; break;
  }
  if (typeof lval != typeof rval) {
    this.log.w({title: 'Attempting to compare incompatible types', description: `Attempting to compare '${lraw}' and '${rraw}', but their types do not match! Did you consider using 'as ...' or 'type of ...'?`});
  }
  return this.encodeBoolean(typeof lval == typeof rval && cmp(lval, rval));
}

async function as(fn) {
  const op = await this.call(this.params.description.operand, 'eval');
  const log = this.log;
  this.log = {w: () => {}};
  const res = this.encode(fn.call(this, op));
  this.log = log;
  return res;
}

async function as_string() {
  return await as.call(this, this.decodeString.bind(this));
}

async function as_number() {
  return await as.call(this, this.decodeNumber.bind(this));
}

async function as_boolean() {
  return await as.call(this, this.decodeBoolean.bind(this));
}

async function as_integer() {
  return await as.call(this, this.decodeInteger.bind(this));
}

async function type_of() {
  const op = await this.call(this.params.description.operand, 'eval');
  const d = this.decode(op);
  if (d === null) {
    return this.encodeString('none');
  } else if (typeof d === 'string') {
    return this.encodeString('text');
  } else if (typeof d === 'boolean') {
    return this.encodeString('true/false');
  }
  return this.encodeString(typeof d);
}

async function incdec(num) {
  const operand = this.params.description.operand;
  const value = this.decodeNumber(await this.call(operand, 'eval'));
  await this.call(operand, 'set', {description: operand, value: this.encode(value + num)});
}

async function invert() {
  const operand = this.params.description.operand;
  const value = this.decodeBoolean(await this.call(operand, 'eval'));
  await this.call(operand, 'set', {description: operand, value: this.encode(!value)});
}

module.exports = {

  eval: async function() {
    switch (this.params.description.qualifier) {
      case 'not':
        return await not.call(this);
      case 'abs':
        return await abs.call(this);
      case 'negate':
        return await negate.call(this);
      case '&':
        return await and.call(this);
      case '|':
        return await or.call(this);
      case '^':
        return await xor.call(this);
      case '+':
        return await add.call(this);
      case '-':
        return await sub.call(this);
      case '*':
        return await mul.call(this);
      case '/':
        return await div.call(this);
      case 'pow':
        return await pow.call(this);
      case '%':
        return await mod.call(this);
      case 'round':
        return await round.call(this);
      case 'cmp':
        return await cmp.call(this);
      case 'as_string':
        return await as_string.call(this);
      case 'as_number':
        return await as_number.call(this);
      case 'as_boolean':
        return await as_boolean.call(this);
      case 'as_integer':
        return await as_integer.call(this);
      case 'typeof':
        return await type_of.call(this);
    }
    return '';
  },

  exec: async function() {
    switch (this.params.description.qualifier) {
      case '++':
        await incdec.call(this, +1);
        break;
      case '--':
        await incdec.call(this, -1);
        break;
      case 'invert':
        await invert.call(this);
        break;
    }
  },

};
