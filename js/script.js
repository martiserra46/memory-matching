import { canvasUI } from "./canvas_ui/canvas_ui.js";

const ui = canvasUI.ui.newUI("#ui");

const root = canvasUI.layouts.newLayout({
  type: "frame",
  properties: {
    backgroundColor: "#14213d",
    borderRadius: 0,
  },
});

ui.init(root);
