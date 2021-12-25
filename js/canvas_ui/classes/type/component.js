import { clone, bind } from "./../../utils/utils.js";
import { Event } from "./../event/event.js";

export class ComponentType {
  constructor(data) {
    this.name = data.name;
    this.data = new Map();
    this.functions = new Map();
    this.events = new Map();
    this._setProperties(data);
    this._setOnCreateFunction(data);
    this._setUpdateUIFunctions(data);
    this._setSizeFunctions(data);
    this._setCoordsFunctions(data);
    this._setDrawFunctions(data);
  }

  _setProperties(data) {
    this.properties = clone(data.properties);
  }

  _setOnCreateFunction(data) {
    this.onCreate = bind(data.onCreate, [data]);
  }

  _setUpdateUIFunctions(data) {
    this.onStartUpdateUI = bind(data.onStartUpdateUI, [data]);
    this.onEndUpdateUI = bind(data.onEndUpdateUI, [data]);
  }

  _setSizeFunctions(data) {
    this.onStartSetSize = bind(data.onStartSetSize, [data]);
    this.onEndSetSize = bind(data.onEndSetSize, [data]);
    this.getSize = bind(data.getSize, [data]);
  }

  _setCoordsFunctions(data) {
    this.onStartSetCoords = bind(data.onStartSetCoords, [data]);
    this.onEndSetCoords = bind(data.onEndSetCoords, [data]);
  }

  _setDrawFunctions(data) {
    this.onStartDraw = bind(data.onStartDraw, [data]);
    this.onEndDraw = bind(data.onEndDraw, [data]);
    this.drawItself = bind(data.drawItself, [data]);
  }

  set(name, value) {
    this.data.set(name, value);
  }

  setFunction(name, value) {
    this.functions.set(name, value);
  }

  setEvent(data) {
    const event = new Event(data);
    this.events.set(event.name, [event, []]);
    return event;
  }

  addListener(event, callback) {
    this.events.get(event)[1].push(callback);
  }
}
