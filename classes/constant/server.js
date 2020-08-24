'use strict';

class ConstantClass {

  constructor(handler) {
    this.handler = handler;
  }

  async eval(description) {
    return description.value;
  }

}

module.exports = ConstantClass;
