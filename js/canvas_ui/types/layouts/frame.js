import { canvasUI } from "./../../canvas_ui.js";
import { isNull } from "./../../utils/utils.js";
import { compute } from "./../../utils/compute.js";
import { draw } from "./../../utils/draw.js";
import { events } from "./../../utils/events.js";

export function newLayoutTypeFrame() {
  const frame = canvasUI.layouts.newType({
    name: "frame",
    properties: {
      size: {
        width: ["%", 100],
        height: ["%", 100],
      },
      borderRadius: 5,
      borderSize: 0,
      borderColor: "rgba(0,0,0,0)",
      backgroundColor: "rgba(0,0,0,0)",
    },
    childLayoutParams: {
      gravity: {
        vertical: "top",
        horizontal: "left",
      },
      zIndex: 0,
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },

    onStartSetSize(layout, bundle, maxSize) {
      const sizeProperty = layout.getProperty("size");
      const definedSize = compute.getDefinedSize(sizeProperty, maxSize);
      bundle.set("definedSize", definedSize);
    },

    getChildMaxSize(layout, bundle, maxSize, child, childsWithSetSizes) {
      const maxExtendedSize = this._getChildMaxExtendedSize(bundle, maxSize);
      const margin = child.getLayoutParam("margin");
      return compute.getChildMaxSize(maxExtendedSize, margin);
    },

    _getChildMaxExtendedSize(bundle, maxSize) {
      const definedSize = bundle.get("definedSize");
      return compute.getMaxDefinedSize(definedSize, maxSize);
    },

    getSize(layout, bundle, maxSize) {
      const definedSize = bundle.get("definedSize");
      const computeSize = {
        width: () => compute.getChildsMaxExtendedWidth(layout.childs),
        height: () => compute.getChildsMaxExtendedHeight(layout.childs),
      };
      return compute.getSize(definedSize, maxSize, computeSize);
    },

    getChildCoords(layout, bundle, coords, child, childsWithSetCoords) {
      return {
        x: this._getChildX(layout, coords, child),
        y: this._getChildY(layout, coords, child),
      };
    },

    _getChildX(layout, coords, child) {
      const gravity = child.getLayoutParam("gravity").horizontal;
      const start = coords.x;
      const end = start + layout.size.width;
      const length = child.size.width;
      const margin = child.getLayoutParam("margin");

      return compute.getCoordFromHorizontalAlign(
        gravity,
        start,
        end,
        length,
        margin.left,
        margin.right
      );
    },

    _getChildY(layout, coords, child) {
      const gravity = child.getLayoutParam("gravity").vertical;
      const start = coords.y;
      const end = start + layout.size.height;
      const length = child.size.height;
      const margin = child.getLayoutParam("margin");

      return compute.getCoordFromHorizontalAlign(
        gravity,
        start,
        end,
        length,
        margin.top,
        margin.bottom
      );
    },

    drawItself(layout, bundle, ctx) {
      draw.drawArea(layout, ctx);
    },

    getSortedChildsToDraw(layout, bundle) {
      return layout.childs.sort(
        (first, second) =>
          first.getLayoutParam("zIndex") - second.getLayoutParam("zIndex")
      );
    },
  });

  events.setEvents(frame);
}
