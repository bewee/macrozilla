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
    if ('id' in description)
      Object.assign(newinf, {block_id: description.id});
    const ctx = new ExecutionContext(newinf, this.handler, params);
    try {
      const schema = require(`../classes/${description.type}/schema_${func}.json`);
      if (!ctx.validate(description, schema, func))
        return '';
    } catch (_ex) {
      ctx.log.d({title: `Missing schema ${func} for ${description.type}. Skipping validation`});
    }

    if (!this.handler.classes[description.type]) {
      ctx.log.e({title: `Failed to call ${func}`, message: `Unknown class ${description.type}`});
      return '';
    }
    if (!this.handler.classes[description.type][func]) {
      if (dont_mind_unavailable) {
        ctx.log.d({title: `Failed to call ${func}`, message: `Not available for ${description.type}`});
        return '';
      }
      ctx.log.f({title: `Failed to call ${func}`, message: `Not available for ${description.type}`});
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
    if (typeof val != 'string') throw Error('Value for decode must be a string');
    try {
      return JSON.parse(val);
    } catch (_ex) {
      return null;
    }
  }

  decodeBoolean(val) {
    if (typeof val != 'string') throw Error('Value for decode must be a string');
    const v = this.decode(val);
    if (typeof v !== 'boolean')
      this.log.w({title: `Using non-boolean value '${val}' as boolean`});
    return v ? true : false;
  }

  decodeNumber(val) {
    if (typeof val != 'string') throw Error('Value for decode must be a string');
    const v = this.decode(val);
    if (typeof v !== 'number')
      this.log.w({title: `Using non-numeric value '${val}' as number`});
    return isNaN(Number(v)) ? 0 : Number(v);
  }

  decodeInteger(val) {
    const num = this.decodeNumber(val);
    if (!Number.isInteger(num))
      this.log.w({title: `Using non-integer value '${num}' as integer`});
    return Number.parseInt(num);
  }

  decodeString(val) {
    if (typeof val != 'string') throw Error('Value for decode must be a string');
    const v = this.decode(val);
    if (typeof v !== 'string')
      this.log.w({title: `Using non-string value '${val}' as string`});
    if (v === null) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return v.toString();
  }

  decodeObject(val) {
    if (typeof val != 'string') throw Error('Value for decode must be a string');
    const v = this.decode(val);
    if (typeof v !== 'object' || v === null) {
      this.log.w({title: `Using non-object value '${val}' as object`});
      return {};
    }
    return v;
  }

  decodeArray(val) {
    const v = this.decodeObject(val);
    if (!Array.isArray(v)) {
      this.log.w({title: `Using non-array value '${val}' as array`});
      return [this.decode(val)];
    }
    return v;
  }

  encode(val) {
    return JSON.stringify(val);
  }

  encodeBoolean(val) {
    if (typeof val !== 'boolean')
      this.log.w({title: `Using non-boolean value '${val}' as boolean`});
    return this.encode(val ? true : false);
  }

  encodeNumber(val) {
    if (typeof val !== 'number')
      this.log.w({title: `Using non-numeric value '${val}' as number`});
    return this.encode(isNaN(Number(val)) ? 0 : Number(val));
  }

  encodeInteger(val) {
    if (!Number.isInteger(val))
      this.log.w({title: `Using non-integer value '${val}' as integer`});
    return this.encode(Number.parseInt(isNaN(Number(val)) ? 0 : Number(val)));
  }

  encodeString(val) {
    if (typeof val !== 'string')
      this.log.w({title: `Using non-string value '${val}' as string`});
    if (val === null || typeof val === 'undefined') return this.encode('');
    if (typeof val === 'object') return this.encode(JSON.stringify(val));
    return this.encode(val.toString());
  }

  encodeObject(val) {
    if (typeof val !== 'object' || val === null) {
      this.log.w({title: `Using non-object value '${val}' as object`});
      return this.encode({});
    }
    return this.encode(val);
  }

  encodeArray(val) {
    if (!Array.isArray(val)) {
      this.log.w({title: `Using non-array value '${val}' as array`});
      return this.encode([val]);
    }
    return this.encode(val);
  }

}

module.exports = ExecutionContext;
