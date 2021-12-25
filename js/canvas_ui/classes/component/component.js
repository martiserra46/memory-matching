import {
  clone,
  replace,
  bind,
  removeElementFromArray,
  mapToArray,
} from "./../../utils/utils.js";

export class Component {
  constructor(type, data) {
    this._type = type.name;
    this._parent = null;
    this._layoutParams = null;
    this._bundle = new Map();
    this._setProperties(type, data);
    this._setData(type);
    this._setFunctions(type);
    this._setEvents(type);
    this._setOnCreateFunction(type);
    this._setUpdateUIFunctions(type);
    this._setSizeFunctions(type);
    this._setCoordsFunctions(type);
    this._setDrawFunctions(type);
    this._onCreate();
  }

  get type() {
    return this._type;
  }

  get parent() {
    return this._parent;
  }

  get size() {
    return this._size;
  }

  get coords() {
    return this._coords;
  }

  _setProperties(type, data) {
    this._properties = replace(clone(type.properties), data.properties);
  }

  _setData(type) {
    this._data = new Map(type.data);
  }

  _setFunctions(type) {
    this._functions = new Map(type.functions);
  }

  _setEvents(type) {
    this._events = new Map();
    for (const key of type.events.keys()) {
      const [event, listeners] = type.events.get(key);
      this._events.set(key, [event.clone(), [...listeners]]);
    }
  }

  _setOnCreateFunction(type) {
    const data = [null, this, this._bundle];
    this._onCreate = bind(type.onCreate, data);
  }

  _setUpdateUIFunctions(type) {
    const data = [null, this, this._bundle];
    this._onStartUpdateUI = bind(type.onStartUpdateUI, data);
    this._onEndUpdateUI = bind(type.onEndUpdateUI, data);
  }

  _setSizeFunctions(type) {
    const data = [null, this, this._bundle];
    this.onStartSetSize = bind(type.onStartSetSize, data);
    this.onEndSetSize = bind(type.onEndSetSize, data);
    this.getSize = bind(type.getSize, data);
  }

  _setCoordsFunctions(type) {
    const data = [null, this, this._bundle];
    this.onStartSetCoords = bind(type.onStartSetCoords, data);
    this.onEndSetCoords = bind(type.onEndSetCoords, data);
  }

  _setDrawFunctions(type) {
    const data = [null, this, this._bundle];
    this.onStartDraw = bind(type.onStartDraw, data);
    this.onEndDraw = bind(type.onEndDraw, data);
    this.drawItself = bind(type.drawItself, data);
  }

  onStartUpdateUI() {
    throw new Error("You have to implement the method onStartUpdateUI!");
  }

  setSize(maxSize) {
    throw new Error("You have to implement the method setSize!");
  }

  setCoords(coords) {
    throw new Error("You have to implement the method setCoords!");
  }

  draw(ctx) {
    throw new Error("You have to implement the method draw!");
  }

  onEndUpdateUI() {
    throw new Error("You have to implement the method onEndUpdateUI!");
  }

  setProperty(property, value) {
    const oldValue = this._properties[property];
    this._properties[property] = value;
    const signal = {
      type: "property",
      property: property,
      data: {
        old: oldValue,
        new: value,
      },
    };
    this.receiveSignal(signal, false);
  }

  getProperty(name) {
    return clone(this._properties[name]);
  }

  setLayoutParam(name, value) {
    if (!this._layoutParams) return;
    this._layoutParams[name] = value;
  }

  getLayoutParam(name) {
    if (!this._layoutParams) return undefined;
    return this._layoutParams[name];
  }

  setParent(parent, layoutParams) {
    this._parent = parent;
    this._setLayoutParams(parent, layoutParams);
  }

  _setLayoutParams(parent, layoutParams) {
    this._layoutParams = replace(
      clone(parent.childLayoutParams ?? {}),
      layoutParams
    );
  }

  removeParent() {
    this._parent = null;
    this._layoutParams = null;
  }

  set(name, value) {
    this._data.set(name, value);
  }

  get(name) {
    return this._data.get(name);
  }

  setFunction(name, value) {
    this._functions.set(name, value);
  }

  call(name, ...args) {
    this._functions.get(name)(this, ...args);
  }

  receiveSignal(signal) {
    const events = mapToArray(this._events);
    for (const [event, listeners] of events) {
      event.beforeCheck(this, signal, event.bundle);
      const check = event.check(this, signal, event.bundle);
      event.afterCheck(this, signal, event.bundle);
      if (check) {
        const eventObject = event.event(this, signal, event.bundle);
        for (const listener of listeners) listener(this, eventObject);
      }
    }
  }

  addListener(event, listener) {
    this._events.get(event)[1].push(listener);
  }

  removeListener(event, listener) {
    removeElementFromArray(this._events.get(event)[1], listener);
  }
}
