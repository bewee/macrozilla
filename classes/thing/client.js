(() => {
  class ThingClass {

    constructor(handler) {
      this.things = {};
      this.triggerEnum = ['propertyChanged', 'eventRaised', 'actionTriggered', 'connectStateChanged'];
      this.triggerVEnum = ['Property', 'Event', 'Action', 'Connected/Disconnected'];

      const load_card = handler.addLoadCard(null, (copy) => {
        if (copy.internal_attributes.thing in this.things) {
          this.setupThing(copy);
          if (copy.currentAbility === 'trigger')
            this.setTextForTrigger({srcElement: copy.inputs.trigger});
          copy.revive();
        } else {
          copy.setAttribute('thing-waiting', copy.internal_attributes.thing);
        }
      });
      load_card.setTooltipText(`Thing _`);
      load_card.setJSONAttribute('thing', null);
      load_card.setText('Thing(id=%a)', 'thing');
      load_card.setAttribute('data-title', null);
      load_card.addInput('property', {type: 'string'});
      load_card.addInput('action', {type: 'string'});
      load_card.addInput('event', {type: 'string'});
      this.setupTrigger(load_card);

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
          const card = handler.addCard(null, ['Things']);
          card.setJSONAttribute('thing', thing_id);
          this.setupThing(card);
          document.querySelectorAll(`macro-card[thing-waiting='${thing_id}']`).forEach((c) => {
            c.removeAttribute('thing-waiting');
            this.setupThing(c);
            if (c.currentAbility === 'trigger')
              this.setTextForTrigger({srcElement: c.inputs.trigger});
            // we have to fill the action input after (and only if) it has been created
            if ('action-input' in c.inputs && 'action-input' in c.cached_json)
              c.fillInputFromJSON(c.inputs_['action-input'], c.cached_json['action-input']);
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
      card.addInput('property', {type: 'string', enum: t.properties, venum: t.vproperties, value: card.inputs.property && card.inputs.property.value ? card.inputs.property.value : t.properties[0]});
      card.addInput('event', {type: 'string', enum: t.events, value: card.inputs.event && card.inputs.event.value ? card.inputs.event.value : t.events[0]});
      card.addAbility('evaluable', `${t.title} %i`, 'property');
      card.addAbility('settable', `${t.title} %i`, 'property');
      card.addAbility('thing-action', `${t.title} %i`, 'action');
      card.addAbility('thing-event', `${t.title} %i`, 'event');
      card.addAbility('thing-property', `${t.title} %i`, 'property');
      card.addAbility('trigger', `${t.title} %i %i was changed`, 'trigger', 'property');
      this.setupTrigger(card);
      this.setupAction(card, t);
      card.refreshText();
    }

    setupTrigger(card) {
      const i_trigger = card.addInput('trigger', {type: 'string', enum: this.triggerEnum, venum: this.triggerVEnum});
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

    setupAction(card, t) {
      const i_action = card.addInput('action', {type: 'string', enum: t.actions, venum: t.vactions, value: card.inputs.action && card.inputs.action.value ? card.inputs.action.value : t.actions[0]});
      const old_copy = card.copy;
      card.copy = () => {
        const copy = old_copy.call(card);
        copy.inputs.action.addEventListener('input', (_ev) => this.setTextForAction(copy, t));
        return copy;
      };
      i_action.addEventListener('input', (_ev) => this.setTextForAction(card, t));
      if (card.currentAbility == 'thing-action')
        this.setTextForAction(card, t);
      return i_action;
    }

    setTextForAction(card, t) {
      const action = card.inputs.action.value;
      if (t.rawactions[action].description)
        card.inputs.action.title = `Description: ${t.rawactions[action].description}`;
      const inputDescription = t.rawactions[action].input;
      delete card.inputs['action-input'];
      if (inputDescription) {
        card.addInput('action-input', inputDescription);
        card.addAbility('thing-action', `${t.title} %i \n %i`, 'action', 'action-input');
      } else {
        card.addAbility('thing-action', `${t.title} %i`, 'action');
      }
      card.refreshText();
    }

  }

  window.exports = ThingClass;
})();
