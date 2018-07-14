import 'https://unpkg.com/lodash@4.17.10/lodash.js?module';

export class LightService {
  constructor(hass) {
    this.hass = hass;
  }

  toggle(entityId, callback) {
    const entity = this.hass.states[entityId];
    const service = this.getService(entity.state);
    this.setState(entityId, service, callback);
  }

  toggleRoom(entities, callback) {
    const state = this.getState(entities);
    const service = this.getService(state);
    _.each(entities, (entity) => {
      if (this.needsToggle(service, entity)) {
        this.toggle(entity.entity_id, callback);
      }
    });
  }

  setState(entityIds, service, callback) {
    this.hass.callService('light', service, { 'entity_id': entityIds })
      .then(() => {
        setTimeout(() => {
          if (callback && typeof callback === 'function') {
            callback();
          }
        }, 2000);
      });
  }

  getState(collection) {
    return _.some(collection, (item) => {
      return item.state === 'on';
    }) ? 'on' : 'off';
  }

  getService(state) {
    return state === 'on' ? 'turn_off' : 'turn_on';
  }

  needsToggle(service, entity) {
    if (service === 'turn_on' && entity.state !== 'on') {
      return true;
    }

    if (service === 'turn_off' && entity.state !== 'off') {
      return true;
    }

    return false;
  }
}
