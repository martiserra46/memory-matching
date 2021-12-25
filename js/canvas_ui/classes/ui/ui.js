import { draw } from "./../../utils/draw.js";
import { dpr } from "./../../utils/utils.js";

export class UI {
  constructor(uiContainer) {
    this._setCanvas(uiContainer);
    this._setSize();
    this._setOnResizeListener();
  }

  _setCanvas(uiContainer) {
    this._uiContainer = document.querySelector(uiContainer);
    this._canvas = document.createElement("canvas");
    this._canvas.style.width = `100%`;
    this._canvas.style.height = `100%`;
    this._ctx = this._canvas.getContext("2d");
    this._uiContainer.appendChild(this._canvas);
  }

  _setSize() {
    const { width, height } = this._uiContainer.getBoundingClientRect();
    this._width = width;
    this._height = height;
    this._canvas.width = width * dpr;
    this._canvas.height = height * dpr;
    this._ctx.scale(dpr, dpr);
  }

  _setOnResizeListener() {
    this._resizeListener = this._setSize.bind(this);
    window.addEventListener("resize", this._resizeListener);
  }

  init(component) {
    this._clear();
    this._init = true;
    this._setComponent(component);
    this._startAnimation();
  }

  _setComponent(component) {
    this._component = component;
    this._component.setParent(this);
    this._setSignalListeners();
  }

  _setSignalListeners() {
    this._signalListeners = new Map();
    this._setMouseListeners();
    this._setKeyListeners();
  }

  _setMouseListeners() {
    this._signalListeners.set(this._canvas, []);
    for (const [event, mouse] of [
      ["mousedown", "down"],
      ["mouseup", "up"],
      ["mousemove", "move"],
      ["mouseenter", "enter"],
      ["mouseleave", "leave"],
    ]) {
      const listener = ((e) => {
        this._component.receiveSignal({
          type: "mouse",
          mouse: mouse,
          data: this._getMouseSignalData(e),
        });
      }).bind(this);
      this._signalListeners.get(this._canvas).push([event, listener]);
      this._canvas.addEventListener(event, listener);
    }
  }

  _getMouseSignalData(event) {
    const { x: canvasX, y: canvasY } = this._canvas.getBoundingClientRect();
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    return { x: mouseX - canvasX, y: mouseY - canvasY };
  }

  _setKeyListeners() {
    this._signalListeners.set(window, []);
    for (const [event, key] of [
      ["keydown", "down"],
      ["keyup", "up"],
    ]) {
      const listener = ((e) =>
        !e.repeat &&
        this._component.receiveSignal({
          type: "key",
          key: key,
          data: this._getKeySignalData(e),
        })).bind(this);
      this._signalListeners.get(window).push([event, listener]);
      window.addEventListener(event, listener);
    }
  }

  _getKeySignalData(event) {
    return event.key;
  }

  _startAnimation() {
    const animate = () => {
      this._animationId = requestAnimationFrame(animate);
      this._updateUI();
    };
    animate();
  }

  _updateUI() {
    this._drawCanvasBackground();
    this._component.onStartUpdateUI();
    this._component.setSize(this._getMaxSize());
    this._component.setCoords(this._getCoords());
    this._component.draw(this._ctx);
    this._component.onEndUpdateUI();
  }

  _drawCanvasBackground() {
    const coords = this._getCoords();
    const size = this._getMaxSize();
    const style = this._getStyle();
    draw.fillRoundedRect(this._ctx, coords, size, style);
  }

  _getMaxSize() {
    return { width: this._width, height: this._height };
  }

  _getCoords() {
    return { x: 0, y: 0 };
  }

  _getStyle() {
    return { backgroundColor: "#FFF", borderRadius: 0 };
  }

  _clear() {
    if (!this._init) return;
    this._init = false;
    this._stopAnimation();
    this._removeComponent();
  }

  _stopAnimation() {
    cancelAnimationFrame(this._animationId);
    this._animationId = null;
  }

  _removeComponent() {
    this._removeSignalListeners();
    this._component.removeParent();
    this._component = null;
  }

  _removeSignalListeners() {
    this._removeMouseListeners();
    this._removeKeyListeners();
    this._signalListeners = null;
  }

  _removeMouseListeners() {
    for (const [event, listener] of this._signalListeners.get(this._canvas))
      this._canvas.removeEventListener(event, listener);
    this._signalListeners.delete(this._canvas);
  }

  _removeKeyListeners() {
    for (const [event, listener] of this._signalListeners.get(window))
      window.removeEventListener(event, listener);
    this._signalListeners.delete(window);
  }
}
