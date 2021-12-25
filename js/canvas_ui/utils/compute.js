import { isNull } from "./utils.js";

export const compute = {
  getDefinedSize(sizeProperty, maxSize) {
    return {
      width: this._getDefinedLength(sizeProperty.width, maxSize.width),
      height: this._getDefinedLength(sizeProperty.height, maxSize.height),
    };
  },

  _getDefinedLength(lengthProperty, maxLength) {
    if (lengthProperty === "auto") return null;
    const desiredLength =
      lengthProperty[0] === "px"
        ? lengthProperty[1]
        : (maxLength * lengthProperty[1]) / 100;
    if (desiredLength < 0) return 0;
    return desiredLength > maxLength ? maxLength : desiredLength;
  },

  getMaxDefinedSize(definedSize, maxSize) {
    return {
      width: this._getMaxDefinedLength(definedSize.width, maxSize.width),
      height: this._getMaxDefinedLength(definedSize.height, maxSize.height),
    };
  },

  _getMaxDefinedLength(definedLength, maxLength) {
    return isNull(definedLength) ? maxLength : definedLength;
  },

  getSize(definedSize, maxSize, computeSize) {
    return {
      width: this._getLength(
        definedSize.width,
        maxSize.width,
        computeSize.width
      ),
      height: this._getLength(
        definedSize.height,
        maxSize.height,
        computeSize.height
      ),
    };
  },

  _getLength(definedLength, maxLength, computeLength) {
    if (definedLength) return definedLength;
    const defaultLength = computeLength();
    return defaultLength < maxLength ? defaultLength : maxLength;
  },

  getChildMaxSize(
    maxExtendedSize,
    margin = { top: 0, right: 0, bottom: 0, left: 0 }
  ) {
    return {
      width: this._getChildMaxLength(
        maxExtendedSize.width,
        margin.left,
        margin.right
      ),
      height: this._getChildMaxLength(
        maxExtendedSize.height,
        margin.top,
        margin.bottom
      ),
    };
  },

  _getChildMaxLength(maxExtendedLength, marginStart = 0, marginEnd = 0) {
    const maxLength = maxExtendedLength - marginStart - marginEnd;
    if (maxLength < 0) return 0;
    return maxLength;
  },

  getChildsMaxExtendedWidth(childs) {
    return childs.reduce((acc, child) => {
      const margin = child.getLayoutParam("margin");
      const length = child.size.width + margin.left + margin.right;
      return acc > length ? acc : length;
    }, 0);
  },

  getChildsMaxExtendedHeight(childs) {
    return childs.reduce((acc, child) => {
      const margin = child.getLayoutParam("margin");
      const length = child.size.height + margin.top + margin.bottom;
      return acc > length ? acc : length;
    }, 0);
  },

  getChildsSumExtendedWidths(childs) {
    return childs.reduce((acc, child) => {
      const margin = child.getLayoutParam("margin");
      const length = child.size.width + margin.left + margin.right;
      return acc + length;
    }, 0);
  },

  getChildsSumExtendedHeights(childs) {
    return childs.reduce((acc, child) => {
      const margin = child.getLayoutParam("margin");
      const length = child.size.height + margin.top + margin.bottom;
      return acc + length;
    }, 0);
  },

  getCoordFromHorizontalAlign(
    align,
    startX,
    endX,
    width,
    marginLeft = 0,
    marginRight = 0
  ) {
    const horizontalAlign =
      align === "left" ? "start" : align === "middle" ? "middle" : "right";

    return compute.getCoordFromAlign(
      horizontalAlign,
      startX,
      endX,
      width,
      marginLeft,
      marginRight
    );
  },

  getCoordFromVerticalAlign(
    align,
    startY,
    endY,
    height,
    marginTop = 0,
    marginBottom = 0
  ) {
    const verticalAlign =
      align === "top" ? "start" : align === "middle" ? "middle" : "bottom";

    return compute.getCoordFromAlign(
      verticalAlign,
      startY,
      endY,
      height,
      marginTop,
      marginBottom
    );
  },

  getCoordFromAlign(
    align,
    startCoord,
    endCoord,
    length,
    marginStart = 0,
    marginEnd = 0
  ) {
    if (align === "start")
      return this._getCoordFromStartAlign(
        startCoord,
        endCoord,
        length,
        marginStart,
        marginEnd
      );

    if (align === "middle")
      return this._getCoordFromMiddleAlign(
        startCoord,
        endCoord,
        length,
        marginStart,
        marginEnd
      );

    return this._getCoordFromEndAlign(
      startCoord,
      endCoord,
      length,
      marginStart,
      marginEnd
    );
  },

  _getCoordFromStartAlign(
    startCoord,
    endCoord,
    length,
    marginStart = 0,
    marginEnd = 0
  ) {
    return startCoord + marginStart;
  },

  _getCoordFromMiddleAlign(
    startCoord,
    endCoord,
    length,
    marginStart = 0,
    marginEnd = 0
  ) {
    return (
      startCoord +
      (endCoord - startCoord) / 2 -
      (length + marginStart + marginEnd) / 2 +
      marginStart
    );
  },

  _getCoordFromEndAlign(
    startCoord,
    endCoord,
    length,
    marginStart = 0,
    marginEnd = 0
  ) {
    return (
      startCoord +
      (endCoord - startCoord) -
      (length + marginStart + marginEnd) +
      marginStart
    );
  },

  getCoordFromBias(
    startCoord,
    endCoord,
    length,
    bias,
    marginStart = 0,
    marginEnd = 0
  ) {
    return (
      startCoord +
      (endCoord - startCoord - (length + marginStart + marginEnd)) *
        (bias / 100) +
      marginStart
    );
  },

  areCoordsInComponent: (coords, component) =>
    coords.x >= component.coords.x &&
    coords.y >= component.coords.y &&
    coords.x <= component.coords.x + component.size.width &&
    coords.y <= component.coords.y + component.size.height,

  getTextSize(text, style) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const { fontSize = 16, fontFamily = "Courier New" } = style;
    ctx.font = `${fontSize}px ${fontFamily}`;
    const measureText = ctx.measureText(text);
    const width = measureText.width;
    const height = fontSize;
    return { width, height };
  },
};
