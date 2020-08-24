'use strict';

const schema_eval = require('./schema_eval.json');
const schema_exec = require('./schema_exec.json');

class ArithmeticClass {

  constructor(handler) {
    this.handler = handler;
  }

  async eval(description, ctx) {
    const errors = this.handler.validator.validate(description, schema_eval).errors;
    if (errors.length != 0) {
      this.handler.log(ctx, 'fatal', {title: 'Cannot parse block for eval', message: errors[0]});
    }
    switch (description.operation) {
      case 'not':
        return await this.not(description.operand, ctx);
      case 'abs':
        return await this.abs(description.operand, ctx);
      case 'negate':
        return await this.negate(description.operand, ctx);
      case '&':
        return await this.and(description.left, description.right, ctx);
      case '|':
        return await this.or(description.left, description.right, ctx);
      case '^':
        return await this.xor(description.left, description.right, ctx);
      case '+':
        return await this.add(description.left, description.right, ctx);
      case '-':
        return await this.sub(description.left, description.right, ctx);
      case '*':
        return await this.mul(description.left, description.right, ctx);
      case '/':
        return await this.div(description.left, description.right, ctx);
      case '%':
        return await this.mod(description.left, description.right, ctx);
      case 'round':
        return await this.round(description.left, description.right, ctx);
      case '=': case '>': case '<': case '>=': case '<=': case '!=':
        return await this.cmp(description.left, description.right, description.operation, ctx);
    }
    return '';
  }

  async exec(description, ctx) {
    const errors = this.handler.validator.validate(description, schema_exec).errors;
    if (errors.length != 0) {
      this.handler.log(ctx, 'fatal', {title: 'Cannot parse block for exec', message: errors[0]});
    }
    switch (description.operation) {
      case '++':
        await this.incdec(description.operand, +1, ctx);
        break;
      case '--':
        await this.incdec(description.operand, -1, ctx);
        break;
      case 'invert':
        await this.invert(description.operand, ctx);
        break;
    }
  }

  async not(operand, ctx) {
    const value = this.handler.decodeBoolean(ctx, await this.handler.call(ctx, operand, 'eval', operand));
    return this.handler.encode(ctx, !value);
  }

  async abs(operand, ctx) {
    const value = this.handler.decodeNumber(ctx, await this.handler.call(ctx, operand, 'eval', operand));
    return this.handler.encode(ctx, Math.abs(value));
  }

  async negate(operand, ctx) {
    const value = this.handler.decodeNumber(ctx, await this.handler.call(ctx, operand, 'eval', operand));
    return this.handler.encode(ctx, -value);
  }

  async boolparams(left, right, ctx) {
    const lvalue = this.handler.decodeBoolean(ctx, await this.handler.call(ctx, left, 'eval', left));
    const rvalue = this.handler.decodeBoolean(ctx, await this.handler.call(ctx, right, 'eval', right));
    return [lvalue, rvalue];
  }

  async and(left, right, ctx) {
    const val = await this.boolparams(left, right, ctx);
    return this.handler.encode(ctx, val[0] && val[1]);
  }

  async or(left, right, ctx) {
    const val = await this.boolparams(left, right, ctx);
    return this.handler.encode(ctx, val[0] || val[1]);
  }

  async xor(left, right, ctx) {
    const val = await this.boolparams(left, right, ctx);
    return this.handler.encode(ctx, val[0] ^ val[1]);
  }

  async numparams(left, right, ctx) {
    const lvalue = this.handler.decodeNumber(ctx, await this.handler.call(ctx, left, 'eval', left));
    const rvalue = this.handler.decodeNumber(ctx, await this.handler.call(ctx, right, 'eval', right));
    return [lvalue, rvalue];
  }

  async add(left, right, ctx) {
    const val = await this.numparams(left, right, ctx);
    return this.handler.encode(ctx, val[0] + val[1]);
  }

  async sub(left, right, ctx) {
    const val = await this.numparams(left, right, ctx);
    return this.handler.encode(ctx, val[0] - val[1]);
  }

  async mul(left, right, ctx) {
    const val = await this.numparams(left, right, ctx);
    return this.handler.encode(ctx, val[0] * val[1]);
  }

  async div(left, right, ctx) {
    const val = await this.numparams(left, right, ctx);
    return this.handler.encode(ctx, val[0] / val[1]);
  }

  async mod(left, right, ctx) {
    const val = await this.numparams(left, right, ctx);
    return this.handler.encode(ctx, val[0] % val[1]);
  }

  async round(left, right, ctx) {
    const val = await this.numparams(left, right, ctx);
    let v = Math.round(val[0] / val[1]) * val[1];
    if (Math.floor(Math.log10(val[1])) < 0)
      v = v.toFixed(-Math.floor(Math.log10(val[1])));
    return this.handler.encode(ctx, v);
  }

  async cmp(left, right, comparator, ctx) {
    const lraw = await this.handler.call(ctx, left, 'eval', left);
    const rraw = await this.handler.call(ctx, right, 'eval', right);
    const lval = this.handler.decode(ctx, lraw), rval = this.handler.decode(ctx, rraw);
    let cmp;
    switch (comparator) {
      case '=': cmp = (a, b) => a == b; break;
      case '>': cmp = (a, b) => a > b; break;
      case '<': cmp = (a, b) => a < b; break;
      case '>=': cmp = (a, b) => a >= b; break;
      case '<=': cmp = (a, b) => a <= b; break;
      case '!=': cmp = (a, b) => a != b; break;
    }
    if (typeof lval == typeof rval) {
      return this.handler.encodeBoolean(ctx, cmp(lval, rval));
    } else if (typeof lval == 'string' || typeof rval == 'string') {
      return this.handler.encodeBoolean(ctx, cmp(this.handler.decodeString(ctx, lraw), this.handler.decodeString(ctx, rraw)));
    } else if (typeof lval == 'number' || typeof rval == 'number') {
      return this.handler.encodeBoolean(ctx, cmp(this.handler.decodeNumber(ctx, lraw), this.handler.decodeNumber(ctx, rraw)));
    } else if (typeof lval == 'boolean' || typeof rval == 'boolean') {
      return this.handler.encodeBoolean(ctx, cmp(this.handler.decodeBoolean(ctx, lraw), this.handler.decodeBoolean(ctx, rraw)));
    }
  }

  async incdec(operand, num, ctx) {
    const value = this.handler.decodeNumber(ctx, await this.handler.call(ctx, operand, 'eval', operand));
    await this.handler.call(ctx, operand, 'set', operand, this.handler.encode(ctx, value + num));
  }

  async invert(operand, ctx) {
    const value = this.handler.decodeBoolean(ctx, await this.handler.call(ctx, operand, 'eval', operand));
    await this.handler.call(ctx, operand, 'set', operand, this.handler.encode(ctx, !value));
  }

}

module.exports = ArithmeticClass;
