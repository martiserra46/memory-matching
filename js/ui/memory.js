import { canvasUI } from "./../canvas_ui/canvas_ui.js";

const imageSources = ["img/bear.svg", "img/whale.svg", "img/gorilla.svg"];

const newImage = function (src) {
  const image = canvasUI.views.newView({
    type: "image",
    properties: {
      size: {
        width: ["%", 100],
        height: ["%", 100],
      },
      src: src,
    },
  });

  return image;
};

const root = canvasUI.layouts.newLayout({
  type: "frame",
  properties: {
    backgroundColor: "#14213d",
    borderRadius: 0,
  },
});

const grid = canvasUI.layouts.newLayout({
  type: "grid",
  properties: {
    size: {
      width: "auto",
      height: "auto",
    },
    dimensions: {
      columns: [["px", 200, 3]],
      rows: [["px", 200, 2]],
    },
    gap: {
      horizontal: 100,
      vertical: 100,
    },
    backgroundColor: "#142150",
  },
});

root.addChild(grid, {
  gravity: {
    horizontal: "middle",
    vertical: "middle",
  },
});

const images = [];

for (let i = 0; i < 3; i++) {
  const image = newImage(imageSources[i]);
  images.push(image);
  grid.addChild(image);
}

export const memoryUI = {
  root,
};
