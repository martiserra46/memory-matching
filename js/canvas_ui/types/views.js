import { newViewTypeImage } from "./views/image.js";
import { newViewTypeText } from "./views/text.js";
import { newViewTypeButton } from "./views/button.js";

export function newViewTypes() {
  newViewTypeImage();
  newViewTypeText();
  newViewTypeButton();
}
