import { UI } from "./classes/ui/ui.js";

import { LayoutType } from "./classes/type/layout.js";
import { Layout } from "./classes/component/layout.js";

import { ViewType } from "./classes/type/view.js";
import { View } from "./classes/component/view.js";

import { newLayoutTypes } from "./types/layouts.js";
import { newViewTypes } from "./types/views.js";

export const canvasUI = {
  ui: {
    newUI(uiContainer) {
      return new UI(uiContainer);
    },
  },
  layouts: {
    _types: new Map(),
    newType(data) {
      const type = new LayoutType(data);
      this._types.set(data.name, type);
      return type;
    },
    newLayout(data) {
      const type = this._types.get(data.type);
      return new Layout(type, data);
    },
  },
  views: {
    _types: new Map(),
    newType(data) {
      const type = new ViewType(data);
      this._types.set(data.name, type);
      return type;
    },
    newView(data) {
      const viewType = this._types.get(data.type);
      return new View(viewType, data);
    },
  },
};

newLayoutTypes();
newViewTypes();
