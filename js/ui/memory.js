import { canvasUI } from "./../canvas_ui/canvas_ui.js";

const randomArrayElement = function (array) {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
};

const randomBetweenNumbers = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const createRoot = function () {
  return canvasUI.layouts.newLayout({
    type: "frame",
    properties: {
      backgroundColor: "#14213d",
      borderRadius: 0,
    },
  });
};

const createGrid = function (numColumns, numRows) {
  return canvasUI.layouts.newLayout({
    type: "grid",
    properties: {
      size: {
        width: "auto",
        height: "auto",
      },
      dimensions: {
        columns: [["px", 200, numColumns]],
        rows: [["px", 200, numRows]],
      },
      gap: {
        horizontal: 50,
        vertical: 50,
      },
    },
  });
};

const insertGridToRoot = function (root, grid) {
  root.addChild(grid, {
    gravity: {
      horizontal: "middle",
      vertical: "middle",
    },
  });
};

const newImage = function (src) {
  const container = canvasUI.layouts.newLayout({
    type: "frame",
    properties: {
      backgroundColor: "#0F192E",
      borderRadius: 10,
    },
  });

  const image = canvasUI.views.newView({
    type: "image",
    properties: {
      size: { width: ["%", 100], height: ["%", 100] },
      src: "",
    },
  });

  container.addChild(image, {
    margin: { top: 30, right: 30, bottom: 30, left: 30 },
  });

  container.set("image", image);

  container.set("src", src);

  container.set("showing", false);

  container.setFunction("show", function (component) {
    component.set("showing", true);
    const image = component.get("image");
    image.setProperty("src", component.get("src"));
  });

  container.setFunction("hide", function (component) {
    component.set("showing", false);
    const image = component.get("image");
    image.setProperty("src", null);
  });

  container.addListener("mouseEnter", function (component, event) {
    component.setProperty("backgroundColor", "#05080F");
  });

  container.addListener("mouseLeave", function (component, event) {
    component.setProperty("backgroundColor", "#0F192E");
  });

  return container;
};

const createImages = function (numColumns, numRows, imageSources) {
  const images = [];
  const availableSrcs = [...imageSources];
  const numDifferentSrcs = (numColumns * numRows) / 2;
  for (let i = 0; i < numDifferentSrcs; i++) {
    const src = randomArrayElement(availableSrcs);
    for (let j = 0; j < 2; j++) images.push(newImage(src));
    availableSrcs.splice(availableSrcs.indexOf(src), 1);
  }
  return images;
};

const randomAvailablePosition = function (numColumns, numRows, usedPositions) {
  let valid = false;
  let column, row;
  while (!valid) {
    column = randomBetweenNumbers(0, numColumns - 1);
    row = randomBetweenNumbers(0, numRows - 1);
    valid = usedPositions.every(
      (position) => position[0] !== column || position[1] !== row
    );
  }
  return [column, row];
};

const insertImagesToGrid = function (grid, numColumns, numRows, images) {
  const usedPositions = [];
  for (const image of images) {
    const position = randomAvailablePosition(
      numColumns,
      numRows,
      usedPositions
    );
    grid.addChild(image, { position });
    usedPositions.push(position);
  }
};

const numColumns = 4;
const numRows = 3;
const imageSources = [
  "img/bear.svg",
  "img/bird.svg",
  "img/bull.svg",
  "img/cat.svg",
  "img/chicken.svg",
  "img/cow.svg",
];

const root = createRoot();
const grid = createGrid(numColumns, numRows);
insertGridToRoot(root, grid);
const images = createImages(numColumns, numRows, imageSources);
insertImagesToGrid(grid, numColumns, numRows, images);

export const memoryUI = {
  root,
  images,
};
