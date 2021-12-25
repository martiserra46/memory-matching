import { canvasUI } from "../../canvas_ui.js";
import { compute } from "../../utils/compute.js";
import { draw } from "../../utils/draw.js";
import { events } from "../../utils/events.js";

export function newViewTypeText() {
  const text = canvasUI.views.newType({
    name: "text",
    properties: {
      size: {
        width: "auto",
        height: "auto",
      },
      text: "",
      align: {
        vertical: "middle",
        horizontal: "middle",
      },
      margin: 0,
      fontWeight: 500,
      fontSize: 16,
      fontFamily: "Courier New",
      fontColor: "#000",
      borderRadius: 5,
      borderSize: 0,
      borderColor: "rgba(0,0,0,0)",
      backgroundColor: "rgba(0,0,0,0)",
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
      const margin = view.getProperty("margin");
      return { width: textSize.width + margin * 2, height: textSize.height };
    },

    onStartSetSize(view, bundle, maxSize) {
      const size = view.getProperty("size");
      const definedSize = compute.getDefinedSize(size, maxSize);
      bundle.set("definedSize", definedSize);
    },

    getSize(view, bundle, maxSize) {
      const definedSize = bundle.get("definedSize");
      const textSize = bundle.get("textSize");
      const computeSize = {
        width: () => textSize.width,
        height: () => textSize.height,
      };
      return compute.getSize(definedSize, maxSize, computeSize);
    },

    drawItself(view, bundle, ctx) {
      draw.drawArea(view, ctx);
      this._drawText(view, bundle, ctx);
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
      const align = view.getProperty("align").horizontal;
      const start = view.coords.x;
      const end = start + view.size.width;
      const length = bundle.get("textSize").width;
      const margin = view.getProperty("margin");
      return compute.getCoordFromHorizontalAlign(
        align,
        start,
        end,
        length,
        margin,
        margin
      );
    },

    _getTextY(view, bundle) {
      const align = view.getProperty("align").vertical;
      const start = view.coords.y;
      const end = start + view.size.height;
      const length = bundle.get("textSize").height;
      return compute.getCoordFromVerticalAlign(align, start, end, length);
    },

    _getTextStyle(view) {
      const fontWeight = view.getProperty("fontWeight");
      const fontSize = view.getProperty("fontSize");
      const fontFamily = view.getProperty("fontFamily");
      const fontColor = view.getProperty("fontColor");
      return { fontWeight, fontSize, fontFamily, fontColor };
    },
  });

  events.setEvents(text);
}
