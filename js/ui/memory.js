import { canvasUI } from "./../canvas_ui/canvas_ui.js";

const root = canvasUI.layouts.newLayout({
  type: "frame",
  properties: {
    backgroundColor: "#14213d",
    borderRadius: 0,
  },
});

export const memoryUI = {
  root,
};
