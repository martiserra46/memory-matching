import { canvasUI } from "./../canvas_ui/canvas_ui.js";

const numColumns = 5;
const numRows = 4;
const imageSources = [
  "img/bear.svg",
  "img/bird.svg",
  "img/bull.svg",
  "img/cat.svg",
  "img/chicken.svg",
  "img/cow.svg",
  "img/dog.svg",
  "img/duck.svg",
  "img/elephant.svg",
  "img/gorilla.svg",
];

const randomArrayElement = function (array) {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
};

const randomBetweenNumbers = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

  container.setFunction("show", function (component) {
    const image = component.get("image");
    image.setProperty("src", component.get("src"));
  });

  container.setFunction("hide", function (component) {
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

const createRoot = function () {
  return canvasUI.layouts.newLayout({
    type: "relative",
    properties: {
      backgroundColor: "#14213d",
      borderRadius: 0,
    },
  });
};

const root = createRoot();

const createGrid = function () {
  return canvasUI.layouts.newLayout({
    type: "grid",
    properties: {
      size: {
        width: "auto",
        height: "auto",
      },
      dimensions: {
        columns: [["px", 160, numColumns]],
        rows: [["px", 160, numRows]],
      },
      gap: {
        horizontal: 20,
        vertical: 20,
      },
    },
  });
};

const grid = createGrid();

const insertGridToRoot = function () {
  root.addChild(grid, {
    attachTo: {
      top: "parent",
      bottom: "parent",
      left: "parent",
      right: "parent",
    },
  });
};

insertGridToRoot();

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

const livesText = createLivesText();

const insertLivesTextToRoot = function () {
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

insertLivesTextToRoot();

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

const restartButton = createRestartButton();

const insertRestartButtonToRoot = function () {
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

insertRestartButtonToRoot();

const createImages = function () {
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

const images = createImages();

const insertImagesToGrid = function () {
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

insertImagesToGrid();

export const memoryUI = {
  root,
  images,
  livesText,
  restartButton,
};
