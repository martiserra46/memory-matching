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
    type: "relative",
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
    attachTo: {
      top: "parent",
      bottom: "parent",
      left: "parent",
      right: "parent",
    },
  });
};

const createLivesText = function () {
  const livesText = canvasUI.views.newView({
    type: "text",
    properties: {
      size: {
        width: ["px", 200],
        height: ["px", 60],
      },
      text: "Lives: 0",
      fontSize: 20,
      fontColor: "#FFF",
      fontWeight: 900,
      align: {
        horizontal: "middle",
        vertical: "middle",
      },
      margin: 20,
      backgroundColor: "#0F192E",
    },
  });
  livesText.set("lives", 0);
  livesText.setFunction("setLives", function (component, lives) {
    livesText.set("lives", lives);
    livesText.setProperty("text", `Lives: ${lives}`);
  });
  return livesText;
};

const insertLivesTextToRoot = function (root, grid, livesText) {
  root.addChild(livesText, {
    attachTo: {
      top: "parent",
      bottom: "parent",
      right: "parent",
      left: grid,
    },
    bias: {
      vertical: 33,
    },
  });
};

const createRestartButton = function () {
  const restartButton = canvasUI.views.newView({
    type: "button",
    properties: {
      size: {
        width: ["px", 200],
        height: ["px", 60],
      },
      text: "Restart",
      fontSize: 20,
      fontColor: "#FFF",
      fontWeight: 900,
      backgroundColor: "#05080F",
      backgroundColorOnClick: "#0F182E",
    },
  });
  return restartButton;
};

const insertRestartButtonToRoot = function (
  root,
  grid,
  livesText,
  restartButton
) {
  root.addChild(restartButton, {
    attachTo: {
      top: livesText,
      right: "parent",
      left: grid,
    },
    margin: {
      top: 30,
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
    image.setProperty("src", "");
  });

  container.addListener("mouseDown", function (component, event) {
    component.setProperty("backgroundColor", "#05080F");
  });

  container.addListener("mouseUpAnywhere", function (component, event) {
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
const livesText = createLivesText();
insertLivesTextToRoot(root, grid, livesText);
const restartButton = createRestartButton();
insertRestartButtonToRoot(root, grid, livesText, restartButton);
const images = createImages(numColumns, numRows, imageSources);
insertImagesToGrid(grid, numColumns, numRows, images);

export const memoryUI = {
  root,
  images,
  livesText,
  restartButton,
};
