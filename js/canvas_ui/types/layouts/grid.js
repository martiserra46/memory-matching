import { canvasUI } from "../../canvas_ui.js";
import { isNull, mapToArray } from "../../utils/utils.js";
import { compute } from "../../utils/compute.js";
import { draw } from "../../utils/draw.js";
import { events } from "../../utils/events.js";

export function newLayoutTypeGrid() {
  const grid = canvasUI.layouts.newType({
    name: "grid",
    properties: {
      size: {
        width: ["%", 100],
        height: ["%", 100],
      },
      dimensions: {
        columns: [["fr", 1, 1]], // fr, px
        rows: [["fr", 1, 1]],
      },
      gap: {
        vertical: 0,
        horizontal: 0,
      },
      margin: {
        vertical: 0,
        horizontal: 0,
      },
      gravityContent: {
        vertical: "middle", // 'top', m'iddle', 'bottom'
        horizontal: "middle", // 'left', 'middle', 'right'
      },
      alignItems: {
        vertical: "middle",
        horizontal: "middle",
      },
      borderRadius: 5,
      borderSize: 0,
      borderColor: "rgba(0,0,0,0)",
      backgroundColor: "rgba(0,0,0,0)",
    },
    childLayoutParams: {
      position: "auto",
      span: [1, 1], // Número de files i columnes a les que s'expandeix
      alignSelf: {
        vertical: "auto",
        horizontal: "auto",
      },
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },

    onStartUpdateUI(layout, bundle) {
      const numColumns = this._getNumColumns(layout);
      bundle.set("numColumns", numColumns);

      const numRows = this._getNumRows(layout);
      bundle.set("numRows", numRows);

      const childsPositions = this._getChildsPositions(layout, bundle);
      bundle.set("childsPositions", childsPositions);
    },

    _getNumColumns(layout) {
      const columns = layout.getProperty("dimensions").columns;
      return this._getNumPositions(columns);
    },

    _getNumRows(layout) {
      const rows = layout.getProperty("dimensions").rows;
      return this._getNumPositions(rows);
    },

    _getNumPositions(positions) {
      return positions.reduce((acc, col) => acc + col[2], 0);
    },

    _getChildsPositions(layout, bundle) {
      const childPositions = new Map();

      const numColumns = bundle.get("numColumns");
      const numRows = bundle.get("numRows");

      const [childsPositionDefined, childsPositionAuto] =
        this._getChildsByPositionType(layout.childs);

      this._addChildsPositionDefined(
        numColumns,
        numRows,
        childPositions,
        childsPositionDefined
      );

      this._addChildsPositionAuto(
        numColumns,
        numRows,
        childPositions,
        childsPositionAuto
      );

      return childPositions;
    },

    _getChildsByPositionType(childs) {
      const childsPositionDefined = [];
      const childsPositionAuto = [];

      for (const child of childs) {
        const position = child.getLayoutParam("position");
        if (position !== "auto") childsPositionDefined.push(child);
        else childsPositionAuto.push(child);
      }

      return [childsPositionDefined, childsPositionAuto];
    },

    _addChildsPositionDefined(numColumns, numRows, childPositions, childs) {
      for (const child of childs) {
        const childPosition = {
          position: child.getLayoutParam("position"),
          span: child.getLayoutParam("span"),
        };

        const canAddChild = this._canAddChild(
          numColumns,
          numRows,
          childPositions,
          childPosition
        );

        if (canAddChild) childPositions.set(child, childPosition);
        else childPositions.set(child, null);
      }
    },

    _addChildsPositionAuto(numColumns, numRows, childPositions, childs) {
      for (const child of childs) {
        let added = false;
        const span = child.getLayoutParam("span");

        let row = 0;
        while (row < numRows && !added) {
          let column = 0;
          while (column < numColumns && !added) {
            const position = [column, row];
            const childPosition = { position, span };

            const canAddChild = this._canAddChild(
              numColumns,
              numRows,
              childPositions,
              childPosition
            );

            if (canAddChild) {
              childPositions.set(child, childPosition);
              added = true;
            }
            column++;
          }
          row++;
        }
        if (!added) childPositions.set(child, null);
      }
    },

    _canAddChild(numColumns, numRows, childPositions, newChildPosition) {
      const newChildEdges = this._getChildEdges(newChildPosition);

      if (!this._areChildEdgesValid(numColumns, numRows, newChildEdges))
        return false;

      return mapToArray(childPositions).every((childPosition) => {
        if (isNull(childPosition)) return true;
        const childEdges = this._getChildEdges(childPosition);
        return !this._areChildsEdgesColliding(childEdges, newChildEdges);
      });
    },

    _getChildEdges(childPosition) {
      const { position, span } = childPosition;
      const left = position[0];
      const right = position[0] + span[0] - 1;
      const top = position[1];
      const bottom = position[1] + span[1] - 1;
      return { left, right, top, bottom };
    },

    _areChildEdgesValid(numColumns, numRows, childEdges) {
      if (childEdges.left < 0) return false;
      if (childEdges.top < 0) return false;
      if (childEdges.right >= numColumns) return false;
      if (childEdges.bottom >= numRows) return false;
      return true;
    },

    _areChildsEdgesColliding(firstChildEdges, secondChildEdges) {
      return (
        firstChildEdges.right >= secondChildEdges.left &&
        firstChildEdges.left <= secondChildEdges.right &&
        firstChildEdges.bottom >= secondChildEdges.top &&
        firstChildEdges.top <= secondChildEdges.bottom
      );
    },

    onStartSetSize(layout, bundle, maxSize) {
      const definedSize = this._getDefinedSize(layout, maxSize);
      bundle.set("definedSize", definedSize);

      const maxDefinedSize = this._getMaxDefinedSize(bundle, maxSize);
      bundle.set("maxDefinedSize", maxDefinedSize);

      const columnWidths = this._getColumnWidths(layout, bundle);
      bundle.set("columnWidths", columnWidths);

      const rowHeights = this._getRowHeights(layout, bundle);
      bundle.set("rowHeights", rowHeights);

      const contentSize = this._getContentSize(layout, bundle);
      bundle.set("contentSize", contentSize);

      const childsCellSizes = this._getChildsCellSizes(layout, bundle);
      bundle.set("childsCellSizes", childsCellSizes);
    },

    _getDefinedSize(layout, maxSize) {
      const sizeProperty = layout.getProperty("size");
      return compute.getDefinedSize(sizeProperty, maxSize);
    },

    _getMaxDefinedSize(bundle, maxSize) {
      const definedSize = bundle.get("definedSize");
      return compute.getMaxDefinedSize(definedSize, maxSize);
    },

    _getColumnWidths(layout, bundle) {
      const columns = layout.getProperty("dimensions").columns;
      const maxDefinedWidth = bundle.get("maxDefinedSize").width;
      const gap = layout.getProperty("gap").horizontal;
      const margin = layout.getProperty("margin").horizontal;
      return this._getPositionLengths(columns, maxDefinedWidth, gap, margin);
    },

    _getRowHeights(layout, bundle) {
      const rows = layout.getProperty("dimensions").rows;
      const maxDefinedHeight = bundle.get("maxDefinedSize").height;
      const gap = layout.getProperty("gap").vertical;
      const margin = layout.getProperty("margin").vertical;
      return this._getPositionLengths(rows, maxDefinedHeight, gap, margin);
    },

    _getPositionLengths(positions, maxDefinedLength, gap, margin) {
      const positionLengths = [];

      const [positionLengthsPx, positionLengthsFr] =
        this._getPositionLengthsByType(positions);

      const availableLength = maxDefinedLength - margin * 2;

      const sumLengthsPx = this._addPositionLengthsPx(
        positionLengths,
        positionLengthsPx,
        availableLength,
        gap
      );

      let remainingLength = availableLength - sumLengthsPx;
      if (positionLengths.length > 0)
        remainingLength -= gap * positionLengthsPx.length;
      if (remainingLength < 0) remainingLength = 0;

      this._addPositionLengthsFr(
        positionLengths,
        positionLengthsFr,
        remainingLength,
        gap
      );

      return positionLengths;
    },

    _getPositionLengthsByType(positions) {
      const positionLengthsPx = [];
      const positionLengthsFr = [];
      let index = 0;
      for (const [units, value, repeat] of positions) {
        const length = value > 0 ? value : 0;
        if (units === "px")
          for (let i = 0; i < repeat; i++)
            positionLengthsPx.push([index + i, length]);
        else
          for (let i = 0; i < repeat; i++)
            positionLengthsFr.push([index + i, length]);
        index += repeat;
      }
      return [positionLengthsPx, positionLengthsFr];
    },

    _addPositionLengthsPx(
      positionLengths,
      positionLengthsPx,
      availableLength,
      gap
    ) {
      if (positionLengthsPx.length === 0) return 0;

      let sumPx = 0;
      for (const [index, value] of positionLengthsPx) {
        let remaining = availableLength - sumPx;
        remaining -= gap * index;
        if (remaining < 0) remaining = 0;
        const length = value < remaining ? value : remaining;
        positionLengths.push(length);
        sumPx += length;
      }

      return sumPx;
    },

    _addPositionLengthsFr(
      positionLengths,
      positionLengthsFr,
      availableLength,
      gap
    ) {
      if (positionLengthsFr.length === 0) return;

      const sumFr = positionLengthsFr.reduce((acc, [_, val]) => acc + val, 0);
      const sumLengths = availableLength - gap * (positionLengthsFr.length - 1);
      const fr = sumFr > 0 ? sumLengths / sumFr : 0;

      for (const [index, value] of positionLengthsFr)
        positionLengths.splice(index, 0, value * fr);
    },

    _getContentSize(layout, bundle) {
      return {
        width: this._getContentWidth(layout, bundle),
        height: this._getContentHeight(layout, bundle),
      };
    },

    _getContentWidth(layout, bundle) {
      const widths = bundle.get("columnWidths");
      const gap = layout.getProperty("gap").horizontal;
      const margin = layout.getProperty("margin").horizontal;
      return this._getContentLength(widths, gap, margin);
    },

    _getContentHeight(layout, bundle) {
      const heights = bundle.get("rowHeights");
      const gap = layout.getProperty("gap").vertical;
      const margin = layout.getProperty("margin").vertical;
      return this._getContentLength(heights, gap, margin);
    },

    _getContentLength(lengths, gap, margin) {
      const numLengths = lengths.length;
      let contentLength = margin * 2;
      contentLength += lengths.reduce((acc, length) => acc + length, 0);
      if (numLengths > 1) contentLength += gap * (numLengths - 1);
      return contentLength;
    },

    _getChildsCellSizes(layout, bundle) {
      const childsCellSizes = new Map();

      const childsPositions = bundle.get("childsPositions");
      const columnWidths = bundle.get("columnWidths");
      const rowHeights = bundle.get("rowHeights");
      const gap = layout.getProperty("gap");

      for (const child of layout.childs) {
        const childPosition = childsPositions.get(child);
        const childCellSize = this._getChildCellSize(
          childPosition,
          columnWidths,
          rowHeights,
          gap
        );
        childsCellSizes.set(child, childCellSize);
      }

      return childsCellSizes;
    },

    _getChildCellSize(childPosition, widths, heights, gap) {
      return {
        width: this._getChildCellWidth(childPosition, widths, gap),
        height: this._getChildCellHeight(childPosition, heights, gap),
      };
    },

    _getChildCellWidth(childPosition, widths, gap) {
      if (isNull(childPosition)) return 0;
      const position = childPosition.position[0];
      const span = childPosition.span[0];
      const gapHorizontal = gap.horizontal;
      return this._getChildCellLength(position, span, widths, gapHorizontal);
    },

    _getChildCellHeight(childPosition, heights, gap) {
      if (isNull(childPosition)) return 0;
      const position = childPosition.position[1];
      const span = childPosition.span[1];
      const gapVertical = gap.vertical;
      return this._getChildCellLength(position, span, heights, gapVertical);
    },

    _getChildCellLength(position, span, lengths, gap) {
      let result = 0;
      for (let i = 0; i < span; i++) {
        result += lengths[position + i] + gap;
      }
      result -= gap;
      return result;
    },

    getChildMaxSize(layout, bundle, maxSize, child, childsWithSetSizes) {
      const childCellSize = bundle.get("childsCellSizes").get(child);
      const margin = child.getLayoutParam("margin");
      return compute.getChildMaxSize(childCellSize, margin);
    },

    getSize(layout, bundle, maxSize) {
      const definedSize = bundle.get("definedSize");
      const contentSize = bundle.get("contentSize");
      const computeSize = {
        width: () => contentSize.width,
        height: () => contentSize.height,
      };
      return compute.getSize(definedSize, maxSize, computeSize);
    },

    onStartSetCoords(layout, bundle, coords) {
      const contentCoords = this._getContentCoords(layout, bundle, coords);
      bundle.set("contentCoords", contentCoords);

      const columnCoords = this._getColumnCoords(layout, bundle);
      bundle.set("columnCoords", columnCoords);

      const rowCoords = this._getRowCoords(layout, bundle);
      bundle.set("rowCoords", rowCoords);

      const childsCellCoords = this._getChildsCellCoords(layout, bundle);
      bundle.set("childsCellCoords", childsCellCoords);
    },

    _getContentCoords(layout, bundle, coords) {
      return {
        x: this._getContentX(layout, bundle, coords),
        y: this._getContentY(layout, bundle, coords),
      };
    },

    _getContentX(layout, bundle, coords) {
      const gravity = layout.getProperty("gravityContent").horizontal;
      const start = coords.x;
      const end = start + layout.size.width;
      const length = bundle.get("contentSize").width;
      return compute.getCoordFromHorizontalAlign(gravity, start, end, length);
    },

    _getContentY(layout, bundle, coords) {
      const gravity = layout.getProperty("gravityContent").vertical;
      const start = coords.y;
      const end = start + layout.size.height;
      const length = bundle.get("contentSize").height;
      return compute.getCoordFromHorizontalAlign(gravity, start, end, length);
    },

    _getColumnCoords(layout, bundle) {
      const contentCoordX = bundle.get("contentCoords").x;
      const colWidths = bundle.get("columnWidths");
      const gap = layout.getProperty("gap").horizontal;
      const margin = layout.getProperty("margin").horizontal;
      return this._getPositionCoords(contentCoordX, colWidths, gap, margin);
    },

    _getRowCoords(layout, bundle) {
      const contentCoordY = bundle.get("contentCoords").y;
      const rowHeights = bundle.get("rowHeights");
      const gap = layout.getProperty("gap").vertical;
      const margin = layout.getProperty("margin").vertical;
      return this._getPositionCoords(contentCoordY, rowHeights, gap, margin);
    },

    _getPositionCoords(contentCoord, positionLenghts, gap, margin) {
      const coords = [];
      let coord = contentCoord + margin;
      for (const positionLength of positionLenghts) {
        coords.push(coord);
        coord += positionLength + gap;
      }
      return coords;
    },

    _getChildsCellCoords(layout, bundle) {
      const childsPositions = bundle.get("childsPositions");
      const columnCoords = bundle.get("columnCoords");
      const rowCoords = bundle.get("rowCoords");

      const childsCellCoords = new Map();
      for (const child of layout.childs) {
        const childPosition = childsPositions.get(child);
        const childCellCoords = this._getChildCellCoords(
          childPosition,
          columnCoords,
          rowCoords
        );
        childsCellCoords.set(child, childCellCoords);
      }

      return childsCellCoords;
    },

    _getChildCellCoords(childPosition, columnCoords, rowCoords) {
      if (isNull(childPosition)) return { x: 0, y: 0 };
      const [column, row] = childPosition.position;
      const childCellCoords = {
        x: columnCoords[column],
        y: rowCoords[row],
      };
      return childCellCoords;
    },

    getChildCoords(layout, bundle, coords, child, childsWithSetCoords) {
      return {
        x: this._getChildX(layout, bundle, child),
        y: this._getChildY(layout, bundle, child),
      };
    },

    _getChildX(layout, bundle, child) {
      const alignItems = layout.getProperty("alignItems").horizontal;
      const alignSelf = child.getLayoutParam("alignSelf").horizontal;

      const align = alignSelf === "auto" ? alignItems : alignSelf;
      const start = bundle.get("childsCellCoords").get(child).x;
      const end = start + bundle.get("childsCellSizes").get(child).width;
      const length = child.size.width;
      const margin = child.getLayoutParam("margin");

      return compute.getCoordFromHorizontalAlign(
        align,
        start,
        end,
        length,
        margin.left,
        margin.right
      );
    },

    _getChildY(layout, bundle, child) {
      const alignItems = layout.getProperty("alignItems").vertical;
      const alignSelf = child.getLayoutParam("alignSelf").vertical;

      const align = alignSelf === "auto" ? alignItems : alignSelf;
      const start = bundle.get("childsCellCoords").get(child).y;
      const end = start + bundle.get("childsCellSizes").get(child).height;
      const length = child.size.height;
      const margin = child.getLayoutParam("margin");

      return compute.getCoordFromHorizontalAlign(
        align,
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
  });

  events.setEvents(grid);
}
