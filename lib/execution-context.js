'use strict';

class ExecutionContext {

  constructor(inf, handler, params) {
    this.inf = inf;
    this.handler = handler;
    this.params = params;

    this.log = {
      d: (x) => {
        this.handler.log.d(this.inf, x);
      },
      i: (x) => {
        this.handler.log.i(this.inf, x);
      },
      w: (x) => {
        this.handler.log.w(this.inf, x);
      },
      e: (x) => {
        this.handler.log.e(this.inf, x);
      },
      f: (x) => {
        this.handler.log.f(this.inf, x);
      },
    };
  }

  async call(description, func, params = null, dont_mind_unavailable = false) {
    if (params == null) {
      params = {description: description};
    }
    const newinf = {}; Object.assign(newinf, this.inf);
    if ('block_id' in description)
      Object.assign(newinf, {block_id: description.block_id});
    const ctx = new ExecutionContext(newinf, this.handler, params);
    try {
      const schema = require(`../classes/${description.type}/schema_${func}.json`);
      if (!this.validate(description, schema, func))
        return '';
    } catch (_ex) {
      this.log.d({title: `Missing schema ${func} for ${description.type}. Skipping validation`});
    }

    if (!this.handler.classes[description.type]) {
      this.log.e({title: `Failed to call ${func}`, message: `Unknown class ${description.type}`});
      return '';
    }
    if (!this.handler.classes[description.type][func]) {
      if (dont_mind_unavailable) {
        this.log.d({title: `Failed to call ${func}`, message: `Not available for ${description.type}`});
        return '';
      }
      this.log.f({title: `Failed to call ${func}`, message: `Not available for ${description.type}`});
      return '';
    }
    return await this.handler.classes[description.type][func].call(ctx);
  }

  validate(description, schema) {
    const errors = this.handler.validator.validate(description, schema).errors;
    if (errors.length != 0) {
      this.log.f({title: `Cannot parse block for ${schema.title}`, message: errors[0]});
      return false;
    }
    return true;
  }

  decode(val) {
    if (typeof val != 'string') throw `Value for decode must be a string`;
    if (val == '')
      return null;
    if (val == 'true' || val == 'false')
      return val == 'true' ? true : false;
    if (!isNaN(val))
      return Number(val);
    return val;
  }

  decodeBoolean(val) {
    if (typeof val != 'string') throw `Value for decode must be a string`;
    if (val != 'true' && val != 'false')
      this.log.w({title: `Using non-boolean value '${val}' as boolean`});
    return this.decode(val) ? true : false;
  }

  decodeNumber(val) {
    if (typeof val != 'string') throw `Value for decode must be a string`;
    if (isNaN(val))
      this.log.w({title: `Using non-numeric value '${val}' as number`});
    const num = this.decode(val);
    return isNaN(num) ? 0 : num+0;
  }

  decodeInteger(val) {
    const num = this.decodeNumber(val);
    if (!Number.isInteger(num))
      this.log.w({title: `Using non-integer value '${num}' as integer`});
    return Number.parseInt(num);
  }

  decodeString(val) {
    if (typeof val != 'string') throw `Value for decode must be a string`;
    return val;
  }

  encode(val) {
    if (val == null)
      return '';
    switch (typeof val) {
      case 'boolean':
        return this.encodeBoolean(val);
      default:
        return val.toString();
    }
  }

  encodeBoolean(val) {
    if (val !== true && val !== false)
      this.log.w({title: `Using non-boolean value '${val}' as boolean`});
    return val ? 'true' : 'false';
  }

  encodeNumber(val) {
    if (isNaN(val))
      this.log.w({title: `Using non-numeric value '${val}' as number`});
    return this.encode(this.decodeNumber(this.encode(val)));
  }

  encodeInteger(val) {
    if (!Number.isInteger(val))
      this.log.w({title: `Using non-integer value '${val}' as integer`});
    return this.encode(Number.parseInt(this.decodeNumber(this.encode(val))));
  }

  encodeString(val) {
    return val;
  }

}

module.exports = ExecutionContext;
