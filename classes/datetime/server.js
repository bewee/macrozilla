'use strict';

const cron = require('node-cron');

function evalGet() {
  const property = this.params.description.property;
  switch (property) {
    case 'seconds':
      return this.encodeNumber(new Date().getSeconds());
    case 'minutes':
      return this.encodeNumber(new Date().getMinutes());
    case 'hours':
      return this.encodeNumber(new Date().getHours());
    case 'dayw': {
      let d = new Date().getDay();
      if (!this.handler.apihandler.config.sundayfirst && d == 0)
        d = 7;
      return this.encodeNumber(d);
    }
    case 'daym':
      return this.encodeNumber(new Date().getDate());
    case 'month':
      return this.encodeNumber(new Date().getMonth());
    case 'year':
      return this.encodeNumber(new Date().getFullYear());
    case 'time':
      return this.encodeString(new Date().toLocaleTimeString());
    case 'date':
      return this.encodeString(new Date().toLocaleDateString());
    case 'datetime':
      return this.encodeString(new Date().toLocaleString());
  }
}

function evalRel() {
  const value = this.params.description.value;
  let dateobj = new Date();
  switch (this.params.description.tvalue) {
    case 'time':
      dateobj.setHours(parseInt(value.substr(0, 2)));
      dateobj.setMinutes(parseInt(value.substr(2, 2)));
      dateobj.setSeconds(parseInt(value.substr(4, 2)));
      break;
    case 'date':
      dateobj.setTime(0);
      dateobj.setFullYear(parseInt(value.substr(0, 4)));
      dateobj.setMonth(parseInt(value.substr(4, 2)));
      dateobj.setDate(parseInt(value.substr(6, 2)));
      break;
    case 'dayw': {
      const dayw = parseInt(value);
      if (new Date().getDay() < dayw)
        dateobj = new Date(+new Date()+1000);
      else
        dateobj = new Date(+new Date()-1000);
      break;
    }
  }
  switch (this.params.description.function) {
    case 'before':
      return this.encodeBoolean(new Date() < dateobj);
    case 'after':
      return this.encodeBoolean(new Date() > dateobj);
  }
}

module.exports = {

  trigger: function() {
    const cronstr = this.params.description.cron;

    if (!cron.validate(cronstr)) {
      this.log.e({title: 'Invalid cron string'});
      return;
    }

    const task = cron.schedule(cronstr, () => {
      this.params.callback();
    });
    this.params.destruct = () => {
      task.destroy();
    };
  },

  eval: async function() {
    switch (this.params.description.function) {
      case 'get':
        return evalGet.call(this);
      case 'before': case 'after':
        return evalRel.call(this);
    }
  },

};
