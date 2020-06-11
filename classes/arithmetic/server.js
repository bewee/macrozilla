'use strict';

const assert = require('assert');

class ArithmeticClass {

  constructor(handler) {
    this.handler = handler;
  }

  async eval(description) {
    assert(description && typeof description == 'object');
    assert(description.operation);
    switch (description.operation) {
      case 'not':
        return await this.not(description.operand);
      case 'abs':
        return await this.abs(description.operand);
      case 'negate':
        return await this.negate(description.operand);
      case '&':
        return await this.and(description.left, description.right);
      case '|':
        return await this.or(description.left, description.right);
      case '^':
        return await this.xor(description.left, description.right);
      case '+':
        return await this.add(description.left, description.right);
      case '-':
        return await this.sub(description.left, description.right);
      case '*':
        return await this.mul(description.left, description.right);
      case '/':
        return await this.div(description.left, description.right);
      case '%':
        return await this.mod(description.left, description.right);
      case 'round':
        return await this.round(description.left, description.right);
      case '=': case '>': case '<': case '>=': case '<=': case '!=':
        return await this.cmp(description.left, description.right, description.operator);
    }
    return '';
  }

  async exec(description) {
    assert(description && typeof description == 'object');
    assert(description.operation);
    switch (description.operation) {
      case '++':
        await this.incdec(description.operand, +1);
        break;
      case '--':
        await this.incdec(description.operand, -1);
        break;
      case 'invert':
        await this.invert(description.operand);
        break;
    }
  }

  async not(operand) {
    assert(operand && typeof operand == 'object');
    assert(operand.type);
    const value = this.handler.decodeBoolean(await this.handler.callClass(operand.type, 'eval', operand));
    return this.handler.encode(!value);
  }

  async abs(operand) {
    assert(operand && typeof operand == 'object');
    assert(operand.type);
    const value = this.handler.decodeNumber(await this.handler.callClass(operand.type, 'eval', operand));
    return this.handler.encode(Math.abs(value));
  }

  async negate(operand) {
    assert(operand && typeof operand == 'object');
    assert(operand.type);
    const value = this.handler.decodeNumber(await this.handler.callClass(operand.type, 'eval', operand));
    return this.handler.encode(-value);
  }

  async boolparams(left, right) {
    assert(left && typeof left == 'object');
    assert(left.type);
    assert(right && typeof right == 'object');
    assert(right.type);
    const lvalue = this.handler.decodeBoolean(await this.handler.callClass(left.type, 'eval', left));
    const rvalue = this.handler.decodeBoolean(await this.handler.callClass(right.type, 'eval', right));
    return [lvalue, rvalue];
  }

  async and(left, right) {
    const val = await this.boolparams(left, right);
    return this.handler.encode(val[0] && val[1]);
  }

  async or(left, right) {
    const val = await this.boolparams(left, right);
    return this.handler.encode(val[0] || val[1]);
  }

  async xor(left, right) {
    const val = await this.boolparams(left, right);
    return this.handler.encode(val[0] ^ val[1]);
  }

  async numparams(left, right) {
    assert(left && typeof left == 'object');
    assert(left.type);
    assert(right && typeof right == 'object');
    assert(right.type);
    const lvalue = this.handler.decodeNumber(await this.handler.callClass(left.type, 'eval', left));
    const rvalue = this.handler.decodeNumber(await this.handler.callClass(right.type, 'eval', right));
    return [lvalue, rvalue];
  }

  async add(left, right) {
    const val = await this.numparams(left, right);
    return this.handler.encode(val[0] + val[1]);
  }

  async sub(left, right) {
    const val = await this.numparams(left, right);
    return this.handler.encode(val[0] - val[1]);
  }

  async mul(left, right) {
    const val = await this.numparams(left, right);
    return this.handler.encode(val[0] * val[1]);
  }

  async div(left, right) {
    const val = await this.numparams(left, right);
    return this.handler.encode(val[0] / val[1]);
  }

  async mod(left, right) {
    const val = await this.numparams(left, right);
    return this.handler.encode(val[0] % val[1]);
  }

  async round(left, right) {
    const val = await this.numparams(left, right);
    let v = Math.round(val[0] / val[1]) * val[1];
    if (Math.floor(Math.log10(val[1])) < 0)
      v = v.toFixed(-Math.floor(Math.log10(val[1])));
    return this.handler.encode(v);
  }

  async cmp(left, right, comparator) {
    assert(left && typeof left == 'object');
    assert(left.type);
    assert(right && typeof right == 'object');
    assert(right.type);
    const lraw = await this.handler.callClass(left.type, 'eval', left);
    const rraw = await this.handler.callClass(right.type, 'eval', right);
    const lval = this.handler.decode(lraw), rval = this.handler.decode(rraw);
    const cmp = (a, b) => {
      switch (comparator) {
        case '=': return a == b;
        case '>': return a > b;
        case '<': return a < b;
        case '>=': return a >= b;
        case '<=': return a <= b;
        case '!=': return a != b;
      }
    };
    if (typeof lval == typeof rval) {
      return this.handler.encodeBoolean(cmp(lval, rval));
    } else if (typeof lval == 'string' || typeof rval == 'string') {
      return this.handler.encodeBoolean(cmp(this.handler.decodeString(lraw), this.handler.decodeString(rraw)));
    } else if (typeof lval == 'number' || typeof rval == 'number') {
      return this.handler.encodeBoolean(cmp(this.handler.decodeNumber(lraw), this.handler.decodeNumber(rraw)));
    } else if (typeof lval == 'boolean' || typeof rval == 'boolean') {
      return this.handler.encodeBoolean(cmp(this.handler.decodeBoolean(lraw), this.handler.decodeBoolean(rraw)));
    }
  }

  async incdec(operand, num) {
    assert(operand && typeof operand == 'object');
    assert(operand.type);
    const value = this.handler.decodeNumber(await this.handler.callClass(operand.type, 'eval', operand));
    await this.handler.callClass(operand.type, 'set', operand, this.handler.encode(value + num));
  }

  async invert(operand) {
    assert(operand && typeof operand == 'object');
    assert(operand.type);
    const value = this.handler.decodeBoolean(await this.handler.callClass(operand.type, 'eval', operand));
    await this.handler.callClass(operand.type, 'set', operand, this.handler.encode(!value));
  }

}

module.exports = ArithmeticClass;
