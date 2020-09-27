class ThingClass {

  constructor(handler) {
    this.things = {};
    this.triggerEnum = ['propertyChanged', 'eventRaised', 'actionTriggered', 'connectStateChanged'];
    this.triggerVEnum = ['Property', 'Event', 'Action', 'Connected/Disconnected'];

    const load_card = handler.addLoadCard(null, (copy) => {
      if (copy.internal_attributes.thing in this.things) {
        this.setupThing(copy);
        copy.revive();
      } else {
        copy.setAttribute('thing-waiting', copy.internal_attributes.thing);
      }
    });
    load_card.setTooltipText(`Thing _`);
    load_card.setJSONAttribute('thing', null);
    load_card.setText('Thing(id=%a)', 'thing');
    load_card.setAttribute('data-title', null);
    load_card.addInput('property', 'string');
    load_card.addInput('action', 'string');
    load_card.addInput('event', 'string');
    this.setupTrigger(load_card);
    const old_copyFromJSON = load_card.copyFromJSON;
    load_card.copyFromJSON = (json, maxid) => {
      const copy = old_copyFromJSON.call(load_card, json, maxid);
      if (copy.currentAbility === 'trigger')
        this.setTextForTrigger({srcElement: copy.inputs.trigger});
      return copy;
    };

    {
      const block = handler.addBlock('action', ['Things']);
      block.setTooltipText(`Execute action`);
      block.addParameter('thing', {accepts: 'thing-action', text: 'thing action'});
      block.setText('Execute %p', 'thing');
    }
    const g_prevnext = handler.addGroup('prevnext', ['Things']);
    {
      const block = handler.addBlock('next');
      block.setTooltipText(`Set property to next valid value`);
      block.addParameter('thing', {accepts: 'thing-property', text: 'thing property'});
      block.setText('Set %p to next valid value', 'thing');
      g_prevnext.assign(block);
    }
    {
      const block = handler.addBlock('prev');
      block.setTooltipText(`Set property to previous valid value`);
      block.addParameter('thing', {accepts: 'thing-property', text: 'thing property'});
      block.setText('Set %p to previous valid value', 'thing');
      g_prevnext.assign(block);
    }

    window.API.getThings().then((list) => {
      list.forEach((dev) => {
        const thing_id = dev.href.substr(8);
        const properties = [];
        const vproperties = [];
        Object.keys(dev.properties).forEach((p) => {
          properties.push(p);
          vproperties.push(dev.properties[p].title);
        });
        const actions = [];
        const vactions = [];
        Object.keys(dev.actions).forEach((a) => {
          actions.push(a);
          vactions.push(dev.actions[a].title);
        });
        const events = [];
        Object.keys(dev.events).forEach((e) => {
          events.push(e);
        });
        this.things[thing_id] = {title: dev.title, properties: properties, vproperties: vproperties, actions: actions, vactions: vactions, events: events};
        const card = handler.addCard(null, ['Things']);
        card.setJSONAttribute('thing', thing_id);
        this.setupThing(card);
        document.querySelectorAll(`macro-card[thing-waiting='${thing_id}']`).forEach((c) => {
          c.removeAttribute('thing-waiting');
          this.setupThing(c);
          c.revive();
        });
      });
    });
  }

  setupThing(card) {
    const t = this.things[card.internal_attributes.thing];
    card.setTooltipText(`Thing ${t.title}`);
    card.setText(t.title);
    card.setAttribute('data-title', t.title);
    card.addInput('property', 'string', {enum: t.properties, venum: t.vproperties});
    card.addInput('action', 'string', {enum: t.actions, venum: t.vactions});
    card.addInput('event', 'string', {enum: t.events});
    this.setupTrigger(card);
    card.addAbility('evaluable', `${t.title} %i`, 'property');
    card.addAbility('settable', `${t.title} %i`, 'property');
    card.addAbility('thing-action', `${t.title} %i`, 'action');
    card.addAbility('thing-event', `${t.title} %i`, 'event');
    card.addAbility('thing-property', `${t.title} %i`, 'property');
    card.addAbility('trigger', `${t.title} %i %i was changed`, 'trigger', 'property');
    card.refreshText();
  }

  setupTrigger(card) {
    const i_trigger = card.addInput('trigger', 'string', {enum: this.triggerEnum, venum: this.triggerVEnum});
    const old_copy = card.copy;
    card.copy = () => {
      const copy = old_copy.call(card);
      copy.inputs.trigger.addEventListener('input', this.setTextForTrigger);
      return copy;
    };
    i_trigger.addEventListener('input', this.setTextForTrigger);
    return i_trigger;
  }

  setTextForTrigger(ev) {
    if (!ev.srcElement.parentNode) return;
    const card = ev.srcElement.parentNode.parentNode;
    switch (ev.srcElement.value) {
      case 'propertyChanged':
        card.addAbility('trigger', `${card.getAttribute('data-title')} %i %i was changed`, 'trigger', 'property');
        break;
      case 'actionTriggered':
        card.addAbility('trigger', `${card.getAttribute('data-title')} %i %i was triggered`, 'trigger', 'action');
        break;
      case 'eventRaised':
        card.addAbility('trigger', `${card.getAttribute('data-title')} %i %i was raised`, 'trigger', 'event');
        break;
      case 'connectStateChanged':
        card.addAbility('trigger', `${card.getAttribute('data-title')} %i&nbsp`, 'trigger');
        break;
    }
    card.refreshText();
  }

}

window.exports = ThingClass;
