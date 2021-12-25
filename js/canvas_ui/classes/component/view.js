import { Component } from "./component.js";

export class View extends Component {
  constructor(type, data) {
    super(type, data);
  }

  onStartUpdateUI() {
    this._onStartUpdateUI();
  }

  setSize(maxSize) {
    this.onStartSetSize(maxSize);
    this._size = this.getSize(maxSize);
    this.onEndSetSize();
  }

  setCoords(coords) {
    this.onStartSetCoords();
    this._coords = coords;
    this.onEndSetCoords();
  }

  draw(ctx) {
    this.onStartDraw();
    this.drawItself(ctx);
    this.onEndDraw();
  }

  onEndUpdateUI() {
    this._onEndUpdateUI();
  }
}
