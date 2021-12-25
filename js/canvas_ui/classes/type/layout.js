import { clone, bind } from "./../../utils/utils.js";
import { ComponentType } from "./component.js";

export class LayoutType extends ComponentType {
  constructor(data) {
    super(data);
    this._setChildLayoutParams(data);
  }

  _setChildLayoutParams(data) {
    const childLayoutParams = clone(data.childLayoutParams);
    this.childLayoutParams = childLayoutParams;
  }

  _setSizeFunctions(data) {
    super._setSizeFunctions(data);
    this.getSortedChildsToSetSizes = bind(
      data.getSortedChildsToSetSizes,
      [data],
      (layout) => layout.childs
    );
    this.getChildMaxSize = bind(data.getChildMaxSize, [data]);
  }

  _setCoordsFunctions(data) {
    super._setCoordsFunctions(data);
    this.getSortedChildsToSetCoords = bind(
      data.getSortedChildsToSetCoords,
      [data],
      (layout) => layout.childs
    );
    this.getChildCoords = bind(data.getChildCoords, [data]);
  }

  _setDrawFunctions(data) {
    super._setDrawFunctions(data);
    this.getSortedChildsToDraw = bind(
      data.getSortedChildsToDraw,
      [data],
      (layout) => layout.childs
    );
  }
}
