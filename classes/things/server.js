'use strict';

const assert = require('assert');
const GWHandler = require('./gw-handler');

class ThingsClass {

  constructor(handler) {
    this.handler = handler;
    const config = this.handler.apihandler.config;
    this.gwhandler = new GWHandler(config.accessToken);
    this.gwhandler.init().then(() => {
      if (config.scanInterval)
        setInterval(this.gwhandler.listDevices.bind(this.gwhandler), config.scanInterval*1000);
    });

    this.triggerClass = require('./trigger');
  }

  async set(description, value) {
    assert(description && typeof description == 'object');
    assert(description.thing && description.property);
    let val;
    const property = this.gwhandler.getProperty(description.thing, description.property);
    switch (property.type) {
      case 'boolean':
        val = this.handler.decodeBoolean(value);
        break;
      case 'number': case 'integer':
        val = this.handler.decodeNumber(value);
        break;
      case 'string':
        val = this.handler.decodeString(value);
        break;
      default:
        val = null;
        break;
    }
    await this.gwhandler.setPropertyValue(description.thing, description.property, val);
  }

  async eval(description) {
    assert(description && typeof description == 'object');
    assert(description.thing && description.property);
    const val = await this.gwhandler.getPropertyValue(description.thing, description.property);
    return this.handler.encode(val);
  }

}

module.exports = ThingsClass;
