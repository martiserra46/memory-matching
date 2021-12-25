import { canvasUI } from "../../canvas_ui.js";
import { compute } from "../../utils/compute.js";
import { draw } from "../../utils/draw.js";
import { events } from "../../utils/events.js";

export function newViewTypeButton() {
  const button = canvasUI.views.newType({
    name: "button",
    properties: {
      size: {
        width: "auto",
        height: "auto",
      },
      text: "",
      fontWeight: 500,
      fontSize: 16,
      fontFamily: "Courier New",
      fontColor: "#FFF",
      borderRadius: 5,
      borderSize: 0,
      borderColor: "rgba(0,0,0,0)",
      backgroundColor: "#000",
      backgroundColorOnClick: "#222",
    },

    onCreate(view, bundle) {
      view.set("mouseDown", false);
    },

    onStartUpdateUI(view, bundle) {
      const textSize = this._getTextSize(view, bundle);
      bundle.set("textSize", textSize);

      const contentSize = this._getContentSize(view, bundle);
      bundle.set("contentSize", contentSize);
    },

    _getTextSize(view, bundle) {
      const text = view.getProperty("text");
      const fontSize = view.getProperty("fontSize");
      const fontFamily = view.getProperty("fontFamily");
      const style = { fontSize, fontFamily };
      return compute.getTextSize(text, style);
    },

    _getContentSize(view, bundle) {
      const textSize = bundle.get("textSize");
      return {
        width: textSize.width + 32,
        height: textSize.height + 16,
      };
    },

    onStartSetSize(view, bundle, maxSize) {
      const sizeProperty = view.getProperty("size");
      const definedSize = compute.getDefinedSize(sizeProperty, maxSize);
      bundle.set("definedSize", definedSize);
    },

    getSize(view, bundle, maxSize) {
      const definedSize = bundle.get("definedSize");
      const contentSize = bundle.get("contentSize");
      const computeSize = {
        width: () => contentSize.width,
        height: () => contentSize.height,
      };
      return compute.getSize(definedSize, maxSize, computeSize);
    },

    drawItself(view, bundle, ctx) {
      this._drawArea(view, ctx);
      this._drawText(view, bundle, ctx);
    },

    _drawArea(view, ctx) {
      if (!view.get("mouseDown")) {
        draw.drawArea(view, ctx);
        return;
      }
      draw.drawArea(view, ctx, {
        backgroundColor: view.getProperty("backgroundColorOnClick"),
      });
    },

    _drawText(view, bundle, ctx) {
      if (!this._canDrawText(view, bundle)) return;
      const coords = this._getTextCoords(view, bundle);
      const text = view.getProperty("text");
      const style = this._getTextStyle(view);
      draw.drawText(ctx, coords, text, style);
    },

    _canDrawText(view, bundle) {
      const contentSize = bundle.get("contentSize");
      return (
        contentSize.width <= view.size.width &&
        contentSize.height <= view.size.height
      );
    },

    _getTextCoords(view, bundle) {
      return {
        x: this._getTextX(view, bundle),
        y: this._getTextY(view, bundle),
      };
    },

    _getTextX(view, bundle) {
      const start = view.coords.x;
      const end = start + view.size.width;
      const length = bundle.get("textSize").width;
      return compute.getCoordFromAlign("middle", start, end, length);
    },

    _getTextY(view, bundle) {
      const start = view.coords.y;
      const end = start + view.size.height;
      const length = bundle.get("textSize").height;
      return compute.getCoordFromAlign("middle", start, end, length);
    },

    _getTextStyle(view) {
      const fontWeight = view.getProperty("fontWeight");
      const fontSize = view.getProperty("fontSize");
      const fontFamily = view.getProperty("fontFamily");
      const fontColor = view.getProperty("fontColor");
      return { fontWeight, fontSize, fontFamily, fontColor };
    },
  });

  events.setEvents(button);

  button.addListener("mouseDown", function (view, event) {
    view.set("mouseDown", true);
  });

  button.addListener("mouseUpAnywhere", function (view, event) {
    view.set("mouseDown", false);
  });
}
