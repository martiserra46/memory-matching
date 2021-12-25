import { canvasUI } from "./canvas_ui/canvas_ui.js";
import { memoryUI } from "./ui/memory.js";

const ui = canvasUI.ui.newUI("#ui");
ui.init(memoryUI.root);

const showImageSeconds = function (image, seconds) {
  image.call("show");
  setTimeout(() => image.call("hide"), seconds * 1000);
};

const showImagesSeconds = function (images, seconds) {
  for (const image of images) showImageSeconds(image, seconds);
};

const setLives = function (livesText, lives) {
  livesText.call("setLives", lives.lives);
};

const restart = function () {
  remainingImages.splice(0, remainingImages.length);
  remainingImages.push(...images);
  lives.lives = 10;
  setLives(livesText, lives);
  selectedImages[0] = null;
  selectedImages[1] = null;
  showImagesSeconds(images, secondsInit);
};

const gameOver = function () {
  const root = canvasUI.layouts.newLayout({
    type: "frame",
    properties: {
      backgroundColor: "#14213d",
      borderRadius: 0,
    },
  });

  const playAgainButton = canvasUI.views.newView({
    type: "button",
    properties: {
      size: {
        width: ["px", 200],
        height: ["px", 60],
      },
      text: "Play Again",
      fontSize: 20,
      fontColor: "#FFF",
      fontWeight: 900,
      backgroundColor: "#05080F",
      backgroundColorOnClick: "#0F182E",
    },
  });

  root.addChild(playAgainButton, {
    gravity: {
      horizontal: "middle",
      vertical: "middle",
    },
  });

  playAgainButton.addListener("mouseClick", function (component) {
    ui.init(memoryUI.root);
    restart();
  });

  ui.init(root);
};

const onClickImage = function (
  image,
  livesText,
  remainingImages,
  selectedImages,
  secondsShow,
  lives
) {
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
    setTimeout(() => {
      selectedImages[0].call("hide");
      selectedImages[1].call("hide");
      selectedImages[0] = null;
      selectedImages[1] = null;
      lives.lives--;
      livesText.call("setLives", lives.lives);
      if (lives.lives === 0) gameOver();
    }, secondsShow * 1000);
  }
};

const setOnClickImage = function (
  image,
  livesText,
  remainingImages,
  selectedImages,
  secondsShow,
  lives
) {
  image.addListener("mouseClick", (image) =>
    onClickImage(
      image,
      livesText,
      remainingImages,
      selectedImages,
      secondsShow,
      lives
    )
  );
};

const setOnClickImages = function (
  images,
  livesText,
  remainingImages,
  selectedImages,
  secondsShow,
  lives
) {
  images.forEach((image) =>
    setOnClickImage(
      image,
      livesText,
      remainingImages,
      selectedImages,
      secondsShow,
      lives
    )
  );
};

const images = memoryUI.images;
const livesText = memoryUI.livesText;
const restartButton = memoryUI.restartButton;
const secondsInit = 3;
const remainingImages = [...images];
const selectedImages = [null, null];
const secondsShow = 2;
const lives = { lives: 2 };

showImagesSeconds(images, secondsInit);
setLives(livesText, lives);

setOnClickImages(
  images,
  livesText,
  remainingImages,
  selectedImages,
  secondsShow,
  lives
);

restartButton.addListener("mouseClick", function (component, event) {
  restart();
});
