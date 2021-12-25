import { canvasUI } from "../../canvas_ui.js";
import { isNull } from "../../utils/utils.js";
import { compute } from "../../utils/compute.js";
import { draw } from "../../utils/draw.js";
import { events } from "./../../utils/events.js";

export function newLayoutTypeRelative() {
  const relative = canvasUI.layouts.newType({
    name: "relative",
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
      attachTo: {
        top: null, // null, 'parent', sibling
        left: null,
        bottom: null,
        right: null,
      },
      bias: {
        horizontal: 50,
        vertical: 50,
      },
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },

    onStartUpdateUI(layout, bundle) {
      const sortedChilds = this._getSortedChilds(layout);
      bundle.set("sortedChilds", sortedChilds);
    },

    _getSortedChilds(layout) {
      const sortedChilds = [];
      const childs = layout.childs;
      while (childs.length > 0) {
        for (let i = 0; i < childs.length; i++) {
          const child = childs[i];
          const canAddChild = this._canAddChild(sortedChilds, child);
          if (canAddChild) {
            sortedChilds.push(child);
            childs.splice(i, 1);
            i--;
          }
        }
      }
      return sortedChilds;
    },

    _canAddChild(childs, child) {
      const { top, bottom, right, left } = child.getLayoutParam("attachTo");
      for (const direction of [top, bottom, right, left]) {
        if (
          !isNull(direction) &&
          direction !== "parent" &&
          !childs.includes(direction)
        ) {
          return false;
        }
      }
      return true;
    },

    onStartSetSize(layout, bundle, maxSize) {
      const definedSize = this._getDefinedSize(layout, maxSize);
      bundle.set("definedSize", definedSize);

      const size = this._getSize(bundle, maxSize);
      bundle.set("size", size);
    },

    _getDefinedSize(layout, maxSize) {
      const size = layout.getProperty("size");
      return compute.getDefinedSize(size, maxSize);
    },

    _getSize(bundle, maxSize) {
      const definedSize = bundle.get("definedSize");
      return compute.getMaxDefinedSize(definedSize, maxSize);
    },

    getSortedChildsToSetSizes(layout, bundle, maxSize) {
      return bundle.get("sortedChilds");
    },

    getChildMaxSize(layout, bundle, maxSize, child, childsWithSetSizes) {
      const maxExtendedSize = this._getChildMaxExtendedSize(
        layout,
        bundle,
        child
      );
      const margin = child.getLayoutParam("margin");
      return compute.getMaxDefinedSize(maxExtendedSize, margin);
    },

    _getChildMaxExtendedSize(layout, bundle, child) {
      return {
        width: this._getChildMaxExtendedWidth(layout, bundle, child),
        height: this._getChildMaxExtendedHeight(layout, bundle, child),
      };
    },

    _getChildMaxExtendedWidth(layout, bundle, child) {
      return (
        this._getChildMaxRight(layout, bundle, child) -
        this._getChildMaxLeft(layout, bundle, child)
      );
    },

    _getChildMaxExtendedHeight(layout, bundle, child) {
      return (
        this._getChildMaxBottom(layout, bundle, child) -
        this._getChildMaxTop(layout, bundle, child)
      );
    },

    _getChildMaxLeft(layout, bundle, child) {
      const attachToLeft = child.getLayoutParam("attachTo").left;
      if (isNull(attachToLeft) || attachToLeft === "parent") return 0;
      const size = attachToLeft.size;
      const margin = attachToLeft.getLayoutParam("margin");
      return (
        this._getChildLeft(layout, bundle, attachToLeft) +
        size.width +
        margin.right
      );
    },

    _getChildMaxRight(layout, bundle, child) {
      const attachToRight = child.getLayoutParam("attachTo").right;
      if (isNull(attachToRight) || attachToRight === "parent")
        return bundle.get("size").width;
      const margin = attachToRight.getLayoutParam("margin");
      return this._getChildLeft(layout, bundle, attachToRight) - margin.left;
    },

    _getChildMaxTop(layout, bundle, child) {
      const attachToTop = child.getLayoutParam("attachTo").top;
      if (isNull(attachToTop) || attachToTop === "parent") return 0;
      const size = attachToTop.size;
      const margin = attachToTop.getLayoutParam("margin");
      return (
        this._getChildTop(layout, bundle, attachToTop) +
        size.height +
        margin.bottom
      );
    },

    _getChildMaxBottom(layout, bundle, child) {
      const attachToBottom = child.getLayoutParam("attachTo").bottom;
      if (isNull(attachToBottom) || attachToBottom === "parent")
        return bundle.get("size").height;
      const margin = attachToBottom.getLayoutParam("margin");
      return this._getChildTop(layout, bundle, attachToBottom) - margin.top;
    },

    _getChildLeft(layout, bundle, child) {
      const attachTo = child.getLayoutParam("attachTo");
      const margin = child.getLayoutParam("margin");

      const leftDefined = !isNull(attachTo.left);
      const rightDefiend = !isNull(attachTo.right);

      const maxLeft = this._getChildMaxLeft(layout, bundle, child);
      const maxRight = this._getChildMaxRight(layout, bundle, child);

      const width = child.size.width;

      if (!rightDefiend) return maxLeft + margin.left;
      if (!leftDefined) return maxRight - margin.right - width;

      const bias = child.getLayoutParam("bias").horizontal;

      return compute.getCoordFromBias(
        maxLeft,
        maxRight,
        width,
        bias,
        margin.left,
        margin.right
      );
    },

    _getChildTop(layout, bundle, child) {
      const attachTo = child.getLayoutParam("attachTo");
      const margin = child.getLayoutParam("margin");

      const topDefined = !isNull(attachTo.top);
      const bottomDefiend = !isNull(attachTo.bottom);

      const maxTop = this._getChildMaxTop(layout, bundle, child);
      const maxBottom = this._getChildMaxBottom(layout, bundle, child);

      const height = child.size.height;

      if (!bottomDefiend) return maxTop + margin.top;
      if (!topDefined) return maxBottom - margin.bottom - height;

      const bias = child.getLayoutParam("bias").vertical;

      return compute.getCoordFromBias(
        maxTop,
        maxBottom,
        height,
        bias,
        margin.top,
        margin.bottom
      );
    },

    getSize(layout, bundle, maxSize) {
      return bundle.get("size");
    },

    getSortedChildsToSetCoords(layout, bundle, coords) {
      return bundle.get("sortedChilds");
    },

    getChildCoords(layout, bundle, coords, child, childsWithSetCoords) {
      return {
        x: this._getChildX(layout, bundle, coords, child),
        y: this._getChildY(layout, bundle, coords, child),
      };
    },

    _getChildX(layout, bundle, coords, child) {
      return this._getChildLeft(layout, bundle, child) + coords.x;
    },

    _getChildY(layout, bundle, coords, child) {
      return this._getChildTop(layout, bundle, child) + coords.y;
    },

    drawItself(layout, bundle, ctx) {
      draw.drawArea(layout, ctx);
    },
  });

  events.setEvents(relative);
}
