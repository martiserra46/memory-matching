import { Component } from "./component.js";
import { clone, bind, removeElementFromArray } from "./../../utils/utils.js";

export class Layout extends Component {
  constructor(type, data) {
    super(type, data);
    this._childs = [];
    this._setChildLayoutParams(type);
  }

  get childs() {
    return [...this._childs];
  }

  get numChilds() {
    return this._childs.length;
  }

  _setChildLayoutParams(type) {
    const childLayoutParams = clone(type.childLayoutParams);
    this.childLayoutParams = childLayoutParams;
  }

  _setSizeFunctions(type) {
    super._setSizeFunctions(type);
    const data = [null, this, this._bundle];
    this.getSortedChildsToSetSizes = bind(type.getSortedChildsToSetSizes, data);
    this.getChildMaxSize = bind(type.getChildMaxSize, data);
  }

  _setCoordsFunctions(type) {
    super._setCoordsFunctions(type);
    const data = [null, this, this._bundle];
    this.getSortedChildsToSetCoords = bind(
      type.getSortedChildsToSetCoords,
      data
    );
    this.getChildCoords = bind(type.getChildCoords, data);
  }

  _setDrawFunctions(type) {
    super._setDrawFunctions(type);
    const data = [null, this, this._bundle];
    this.getSortedChildsToDraw = bind(type.getSortedChildsToDraw, data);
  }

  onStartUpdateUI() {
    this._onStartUpdateUI();
    for (const child of this._childs) child.onStartUpdateUI();
  }

  setSize(maxSize) {
    this.onStartSetSize(maxSize);
    const childs = this.getSortedChildsToSetSizes(maxSize);
    const childsWithSetSizes = [];
    for (const child of childs) {
      const childmaxSize = this.getChildMaxSize(
        maxSize,
        child,
        childsWithSetSizes
      );
      child.setSize(childmaxSize);
      childsWithSetSizes.push(child);
    }
    this._size = this.getSize(maxSize);
    this.onEndSetSize();
  }

  setCoords(coords) {
    this.onStartSetCoords(coords);
    const childs = this.getSortedChildsToSetCoords(coords);
    const childsWithSetCoords = [];
    for (const child of childs) {
      const childCoords = this.getChildCoords(
        coords,
        child,
        childsWithSetCoords
      );
      child.setCoords(childCoords);
      childsWithSetCoords.push(child);
    }
    this._coords = coords;
    this.onEndSetCoords();
  }

  draw(ctx) {
    this.onStartDraw();
    this.drawItself(ctx);
    this.drawChilds(ctx);
    this.onEndDraw();
  }

  drawChilds(ctx) {
    const childs = this.getSortedChildsToDraw();
    for (const child of childs) child.draw(ctx);
  }

  getChild(index) {
    return this._childs[index];
  }

  addChild(component, layoutParams = {}) {
    component.parent?.removeChild(component);
    component.setParent(this, layoutParams);
    this._childs.push(component);
  }

  removeChild(component) {
    const removed = removeElementFromArray(this._childs, component);
    if (removed) component.removeParent();
  }

  onEndUpdateUI() {
    this._onEndUpdateUI();
    for (const child of this._childs) child.onEndUpdateUI();
  }

  receiveSignal(signal, propagate = true) {
    if (propagate)
      for (const child of this._childs) child.receiveSignal(signal);
    super.receiveSignal(signal);
  }
}
