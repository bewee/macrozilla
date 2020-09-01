'use strict';

module.exports = {

  exec: async function() {
    const title = this.decodeString(await this.call(this.params.description.title, 'eval'));
    const message = this.decodeString(await this.call(this.params.description.message, 'eval'));
    const logobj = {title: title, message: message};
    switch (this.params.description.level) {
      case 'debug': this.log.d(logobj); break;
      case 'info': this.log.i(logobj); break;
      case 'warn': this.log.w(logobj); break;
      case 'error': this.log.e(logobj); break;
      case 'fatal': this.log.f(logobj); break;
    }
  },

};
