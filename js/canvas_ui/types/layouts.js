import { newLayoutTypeFrame } from "./layouts/frame.js";
import { newLayoutTypeLinear } from "./layouts/linear.js";
import { newLayoutTypeGrid } from "./layouts/grid.js";
import { newLayoutTypeRelative } from "./layouts/relative.js";

export function newLayoutTypes() {
  newLayoutTypeFrame();
  newLayoutTypeLinear();
  newLayoutTypeGrid();
  newLayoutTypeRelative();
}
