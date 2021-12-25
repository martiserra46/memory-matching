import { canvasUI } from "./canvas_ui/canvas_ui.js";
import { memoryUI } from "./ui/memory.js";
import { gameOverUI } from "./ui/gameOver.js";

const ui = canvasUI.ui.newUI("#ui");

ui.init(memoryUI.root);

const secondsInit = 5;
const secondsShow = 1;

let remainingImages, selectedImages, lives, canClick;

const showImagesSeconds = function () {
  for (const image of memoryUI.images) image.call("show");
  setTimeout(() => {
    for (const image of memoryUI.images) image.call("hide");
    canClick = true;
  }, secondsInit * 1000);
};

const start = function () {
  remainingImages = [...memoryUI.images];
  selectedImages = [null, null];
  lives = 10;
  canClick = false;
  memoryUI.livesText.call("setLives", lives);
  showImagesSeconds();
};

start();

const gameOver = function () {
  ui.init(gameOverUI.root);
  gameOverUI.playAgainButton.addListener("mouseClick", function (component) {
    ui.init(memoryUI.root);
    start();
  });
};

memoryUI.images.forEach((image) => {
  image.addListener("mouseClick", function (image) {
    if (!canClick) return;
    if (!remainingImages.includes(image)) return;
    image.call("show");
    if (selectedImages[0] === null) {
      selectedImages[0] = image;
      return;
    }
    selectedImages[1] = image;
    if (selectedImages[0].get("src") === selectedImages[1].get("src")) {
      remainingImages.splice(remainingImages.indexOf(selectedImages[0]), 1);
      remainingImages.splice(remainingImages.indexOf(selectedImages[1]), 1);
      selectedImages[0] = null;
      selectedImages[1] = null;
    } else {
      canClick = false;
      setTimeout(() => {
        selectedImages[0].call("hide");
        selectedImages[1].call("hide");
        selectedImages[0] = null;
        selectedImages[1] = null;
        lives--;
        memoryUI.livesText.call("setLives", lives);
        canClick = true;
        if (lives === 0) gameOver();
      }, secondsShow * 1000);
    }
  });
});

memoryUI.restartButton.addListener("mouseClick", function (component, event) {
  start();
});
