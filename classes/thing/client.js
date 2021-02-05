(() => {
  class ThingClass {

    constructor(handler) {
      this.things = {};
      this.triggerEnum = ['propertyChanged', 'eventRaised', 'actionTriggered', 'connectStateChanged'];
      this.triggerVEnum = ['Property', 'Event', 'Action', 'Connected/Disconnected'];

      const load_card = handler.addLoadCard(null, (copy) => {
        if (copy.getInternalAttribute('thing') in this.things)
          this.setupThing(copy);
        else
          copy.setAttribute('thing-waiting', copy.getInternalAttribute('thing'));
      });
      load_card.setTooltipText(`Thing _`);
      load_card.addInternalAttribute('thing', null);
      load_card.setShutdownText('Thing(id=%a)', 'thing');
      load_card.setAttribute('data-title', null);
      load_card.addInput('trigger', {type: 'string', enum: this.triggerEnum, venum: this.triggerVEnum, onInput: this.setTextForTrigger.bind(this)});
      load_card.addInput('property', {type: 'string'});
      load_card.addInput('action', {type: 'string', onInput: this.setTextForAction.bind(this)});
      load_card.addInput('action-input', {});
      load_card.addInput('event', {type: 'string'});
      load_card.addAbilities('evaluable', 'settable', 'thing-action', 'thing-event', 'thing-property', 'trigger');

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
            vproperties.push(dev.properties[p].title ? dev.properties[p].title : p);
          });
          const actions = [];
          const vactions = [];
          Object.keys(dev.actions).forEach((a) => {
            actions.push(a);
            vactions.push(dev.actions[a].title ? dev.actions[a].title : a);
          });
          const events = [];
          Object.keys(dev.events).forEach((e) => {
            events.push(e);
          });
          this.things[thing_id] = {title: dev.title, properties: properties, vproperties: vproperties, actions: actions, vactions: vactions, rawactions: dev.actions, events: events};
          const card = handler.addCard(null, ['Things'], load_card);
          card.updateInternalAttribute('thing', thing_id);
          this.setupThing(card);
          document.querySelectorAll(`macro-card[thing-waiting='${thing_id}']`).forEach((c) => {
            c.removeAttribute('thing-waiting');
            this.setupThing(c);
          });
        });
      });
    }

    onTriggerUpdate(card) {
      this.setTextForTrigger(card);
    }

    setupThing(card) {
      const t = this.things[card.getInternalAttribute('thing')];
      card.setTooltipText(`Thing ${t.title}`);
      card.setText(t.title);
      card.setAttribute('data-title', t.title);
      card.updateInput('property', {type: 'string', enum: t.properties, venum: t.vproperties, default_value: t.properties[0]});
      card.updateInput('event', {type: 'string', enum: t.events, default_value: t.events[0]});
      card.updateAbility('evaluable', `${t.title} %i`, 'property');
      card.updateAbility('settable', `${t.title} %i`, 'property');
      card.updateAbility('thing-action', `${t.title} %i`, 'action');
      card.updateAbility('thing-event', `${t.title} %i`, 'event');
      card.updateAbility('thing-property', `${t.title} %i`, 'property');
      card.updateAbility('trigger', `${t.title} %i %i was changed`, 'trigger', 'property');
      this.setupTrigger(card);
      this.setupAction(card);
      card.revive();
    }

    setupTrigger(card) {
      if (card.currentAbility === 'trigger')
        this.setTextForTrigger(card);
    }

    setTextForTrigger(card) {
      switch (card.getInputValue('trigger')) {
        case 'propertyChanged':
          card.updateAbility('trigger', `${card.getAttribute('data-title')} %i %i was changed`, 'trigger', 'property');
          break;
        case 'actionTriggered':
          card.updateAbility('trigger', `${card.getAttribute('data-title')} %i %i was triggered`, 'trigger', 'action');
          break;
        case 'eventRaised':
          card.updateAbility('trigger', `${card.getAttribute('data-title')} %i %i was raised`, 'trigger', 'event');
          break;
        case 'connectStateChanged':
          card.updateAbility('trigger', `${card.getAttribute('data-title')} %i&nbsp`, 'trigger');
          break;
      }
    }

    setupAction(card) {
      const t = this.things[card.getInternalAttribute('thing')];
      card.updateInput('action', {enum: t.actions, venum: t.vactions, default_value: t.actions[0]});
      if (card.currentAbility == 'thing-action')
        this.setTextForAction(card);
    }

    setTextForAction(card) {
      const action = card.getInputValue('action');
      const t = this.things[card.getInternalAttribute('thing')];
      if (t.rawactions[action].description)
        card.getInput('action').title = `Description: ${t.rawactions[action].description}`;
      const inputDescription = t.rawactions[action].input;
      if (inputDescription) {
        card.updateInput('action-input', inputDescription);
        card.updateAbility('thing-action', `${t.title} %i \n %i`, 'action', 'action-input');
      } else {
        card.updateAbility('thing-action', `${t.title} %i`, 'action');
      }
    }

  }

  window.exports = ThingClass;
})();
