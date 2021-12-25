import { canvasUI } from "./../canvas_ui/canvas_ui.js";

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

export const gameOverUI = {
  root,
  playAgainButton,
};
