import { canvasUI } from "../../canvas_ui.js";
import { isNull } from "../../utils/utils.js";
import { compute } from "../../utils/compute.js";
import { draw } from "../../utils/draw.js";
import { events } from "./../../utils/events.js";

export function newLayoutTypeLinear() {
  const linear = canvasUI.layouts.newType({
    name: "linear",
    properties: {
      size: {
        width: ["%", 100],
        height: ["%", 100],
      },
      direction: "horizontal", // horizontal, vertical, reverse-horizontal, reverse-vertical
      gravityContent: "start", // start, end, middle
      alignItems: "start", // start, end, middle
      gap: 0,
      margin: 0,
      borderRadius: 5,
      borderSize: 0,
      borderColor: "rgba(0,0,0,0)",
      backgroundColor: "rgba(0,0,0,0)",
    },
    childLayoutParams: {
      position: 0,
      alignSelf: "auto", // 'auto', 'start', 'end', 'middle'
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },

    onStartUpdateUI(layout, bundle) {
      const isHorizontal = this._getIsHorizontal(layout);
      bundle.set("isHorizontal", isHorizontal);

      const isReverse = this._getIsReverse(layout);
      bundle.set("isReverse", isReverse);

      const sortedChilds = this._getSortedChilds(layout, bundle);
      bundle.set("sortedChilds", sortedChilds);
    },

    _getIsHorizontal(layout) {
      const direction = layout.getProperty("direction");
      return direction === "horizontal" || direction === "reverse-horizontal";
    },

    _getIsReverse(layout) {
      const direction = layout.getProperty("direction");
      return (
        direction === "reverse-horizontal" || direction === "reverse-vertical"
      );
    },

    _getSortedChilds(layout, bundle) {
      const childs = layout.childs;
      const isReverse = bundle.get("isReverse");

      const sortedChilds = childs.sort(
        (first, second) =>
          first.getLayoutParam("position") - second.getLayoutParam("position")
      );

      if (isReverse) sortedChilds.reverse();

      return sortedChilds;
    },

    onStartSetSize(layout, bundle, maxSize) {
      const definedSize = this._getDefinedSize(layout, maxSize);
      bundle.set("definedSize", definedSize);

      const maxDefinedSize = this._getMaxDefinedSize(bundle, maxSize);
      bundle.set("maxDefinedSize", maxDefinedSize);

      const childMaxExtendedLength = this._getChildMaxExtendedLength(
        layout,
        bundle
      );

      bundle.set("childMaxExtendedLength", childMaxExtendedLength);
    },

    _getDefinedSize(layout, maxSize) {
      const size = layout.getProperty("size");
      return compute.getDefinedSize(size, maxSize);
    },

    _getMaxDefinedSize(bundle, maxSize) {
      const definedSize = bundle.get("definedSize");
      return compute.getMaxDefinedSize(definedSize, maxSize);
    },

    _getChildMaxExtendedLength(layout, bundle) {
      const maxDefinedSize = bundle.get("maxDefinedSize");
      const isHorizontal = bundle.get("isHorizontal");
      const margin = layout.getProperty("margin");
      return isHorizontal
        ? maxDefinedSize.width - margin * 2
        : maxDefinedSize.height - margin * 2;
    },

    getSortedChildsToSetSizes(layout, bundle, maxSize) {
      return bundle.get("sortedChilds");
    },

    getChildMaxSize(layout, bundle, maxSize, child, childsWithSetSizes) {
      const maxExtendedSize = this._getChildMaxExtendedSize(
        layout,
        bundle,
        child,
        childsWithSetSizes
      );
      const margin = child.getLayoutParam("margin");
      return compute.getChildMaxSize(maxExtendedSize, margin);
    },

    _getChildMaxExtendedSize(layout, bundle, child, childsWithSetSizes) {
      return {
        width: this._getChildMaxExtendedWidth(
          layout,
          bundle,
          child,
          childsWithSetSizes
        ),
        height: this._getChildMaxExtendedHeight(
          layout,
          bundle,
          child,
          childsWithSetSizes
        ),
      };
    },

    _getChildMaxExtendedWidth(layout, bundle, child, childsWithSetSizes) {
      const isHorizontal = bundle.get("isHorizontal");
      const maxDefinedSize = bundle.get("maxDefinedSize");
      const gap = layout.getProperty("gap");
      if (!isHorizontal) return maxDefinedSize.width;

      let maxExtendedLength = bundle.get("childMaxExtendedLength");

      if (childsWithSetSizes.length === 0) return maxExtendedLength;

      const last = childsWithSetSizes[childsWithSetSizes.length - 1];
      const length = last.size.width;
      const margin = last.getLayoutParam("margin");

      maxExtendedLength -= length + margin.left + margin.right + gap;
      bundle.set("childMaxExtendedLength", maxExtendedLength);
      return maxExtendedLength;
    },

    _getChildMaxExtendedHeight(layout, bundle, child, childsWithSetSizes) {
      const isHorizontal = bundle.get("isHorizontal");
      const maxDefinedSize = bundle.get("maxDefinedSize");
      const gap = layout.getProperty("gap");
      if (isHorizontal) return maxDefinedSize.height;

      let maxExtendedLength = bundle.get("childMaxExtendedLength");

      if (childsWithSetSizes.length === 0) return maxExtendedLength;

      const last = childsWithSetSizes[childsWithSetSizes.length - 1];
      const length = last.size.height;
      const margin = last.getLayoutParam("margin");

      maxExtendedLength -= length + margin.top + margin.bottom + gap;
      bundle.set("childMaxExtendedLength", maxExtendedLength);
      return maxExtendedLength;
    },

    getSize(layout, bundle, maxSize) {
      const contentSize = this._getContentSize(layout, bundle);
      bundle.set("contentSize", contentSize);
      return this._getSize(bundle, maxSize);
    },

    _getContentSize(layout, bundle) {
      return {
        width: this._getContentWidth(layout, bundle),
        height: this._getContentHeight(layout, bundle),
      };
    },

    _getContentWidth(layout, bundle) {
      const isHorizontal = bundle.get("isHorizontal");

      if (!isHorizontal)
        return compute.getChildsMaxExtendedWidth(layout.childs);

      const gap = layout.getProperty("gap");
      const margin = layout.getProperty("margin");

      let width = compute.getChildsSumExtendedWidths(layout.childs);
      if (layout.numChilds > 0) width += gap * (layout.numChilds - 1);
      width += margin * 2;

      return width;
    },

    _getContentHeight(layout, bundle) {
      const isHorizontal = bundle.get("isHorizontal");

      if (isHorizontal)
        return compute.getChildsMaxExtendedHeight(layout.childs);

      const gap = layout.getProperty("gap");
      const margin = layout.getProperty("margin");

      let height = compute.getChildsSumExtendedHeights(layout.childs);
      if (layout.childs.length > 0) height += gap * (layout.childs.length - 1);
      height += margin * 2;

      return height;
    },

    _getSize(bundle, maxSize) {
      const definedSize = bundle.get("definedSize");
      const contentSize = bundle.get("contentSize");
      const computeSize = {
        width: () => contentSize.width,
        height: () => contentSize.height,
      };
      return compute.getSize(definedSize, maxSize, computeSize);
    },

    getSortedChildsToSetCoords(layout, bundle, coords) {
      return bundle.get("sortedChilds");
    },

    getChildCoords(layout, bundle, coords, child, childsWithSetCoords) {
      return {
        x: this._getChildX(layout, bundle, coords, child, childsWithSetCoords),
        y: this._getChildY(layout, bundle, coords, child, childsWithSetCoords),
      };
    },

    _getChildX(layout, bundle, coords, child, childsWithSetCoords) {
      if (bundle.get("isHorizontal")) {
        if (childsWithSetCoords.length === 0) {
          return (
            compute.getCoordFromAlign(
              layout.getProperty("gravityContent"),
              coords.x,
              coords.x + layout.size.width,
              bundle.get("contentSize").width
            ) +
            layout.getProperty("margin") +
            child.getLayoutParam("margin").left
          );
        }
        const last = childsWithSetCoords[childsWithSetCoords.length - 1];
        return (
          last.coords.x +
          last.size.width +
          last.getLayoutParam("margin").right +
          layout.getProperty("gap") +
          child.getLayoutParam("margin").left
        );
      }

      const alignItems = layout.getProperty("alignItems");
      const alignSelf = child.getLayoutParam("alignSelf");
      const align = alignSelf === "auto" ? alignItems : alignSelf;

      const margin = child.getLayoutParam("margin");

      return compute.getCoordFromAlign(
        align,
        coords.x,
        coords.x + layout.size.width,
        child.size.width,
        margin.left,
        margin.right
      );
    },

    _getChildY(layout, bundle, coords, child, childsWithSetCoords) {
      if (!bundle.get("isHorizontal")) {
        if (childsWithSetCoords.length === 0) {
          return (
            compute.getCoordFromAlign(
              layout.getProperty("gravityContent"),
              coords.y,
              coords.y + layout.size.height,
              bundle.get("contentSize").height
            ) +
            layout.getProperty("margin") +
            child.getLayoutParam("margin").top
          );
        }
        const last = childsWithSetCoords[childsWithSetCoords.length - 1];
        return (
          last.coords.y +
          last.size.height +
          last.getLayoutParam("margin").bottom +
          layout.getProperty("gap") +
          child.getLayoutParam("margin").top
        );
      }

      const alignItems = layout.getProperty("alignItems");
      const alignSelf = child.getLayoutParam("alignSelf");
      const align = alignSelf === "auto" ? alignItems : alignSelf;

      const margin = child.getLayoutParam("margin");

      return compute.getCoordFromAlign(
        align,
        coords.y,
        coords.y + layout.size.height,
        child.size.height,
        margin.top,
        margin.bottom
      );
    },

    drawItself(layout, bundle, ctx) {
      draw.drawArea(layout, ctx);
    },
  });

  events.setEvents(linear);
}
