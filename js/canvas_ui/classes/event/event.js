import { clone, replace, bind } from "./../../utils/utils.js";

export class Event {
  constructor(data) {
    this.name = data.name;
    this.bundle = new Map();
    this.beforeCheck = bind(data.beforeCheck, [data]);
    this.check = bind(data.check, [data]);
    this.afterCheck = bind(data.afterCheck, [data]);
    this.event = bind(data.event, [data], (_, { data }) => data);
  }

  clone() {
    return new Event({
      name: this.name,
      beforeCheck: this.beforeCheck,
      check: this.check,
      afterCheck: this.afterCheck,
      event: this.event,
    });
  }
}
