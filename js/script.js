import { canvasUI } from "./canvas_ui/canvas_ui.js";
import { memoryUI } from "./ui/memory.js";

canvasUI.ui.newUI("#ui").init(memoryUI.root);

const showImageSeconds = function (image, seconds) {
  image.call("show");
  setTimeout(() => image.call("hide"), seconds * 1000);
};

const showImagesSeconds = function (images, seconds) {
  for (const image of images) showImageSeconds(image, seconds);
};

const onClickImage = function (
  image,
  remainingImages,
  selectedImages,
  secondsShow
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
    }, secondsShow * 1000);
  }
};

const setOnClickImage = function (
  image,
  remainingImages,
  selectedImages,
  secondsShow
) {
  image.addListener("mouseClick", (image) =>
    onClickImage(image, remainingImages, selectedImages, secondsShow)
  );
};

const setOnClickImages = function (
  images,
  remainingImages,
  selectedImages,
  secondsShow
) {
  images.forEach((image) =>
    setOnClickImage(image, remainingImages, selectedImages, secondsShow)
  );
};

const images = memoryUI.images;
const secondsInit = 3;
const remainingImages = [...images];
const selectedImages = [null, null];
const secondsShow = 2;

showImagesSeconds(images, secondsInit);

setOnClickImages(images, remainingImages, selectedImages, secondsShow);
