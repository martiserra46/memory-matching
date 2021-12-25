import { canvasUI } from "../../canvas_ui.js";
import { compute } from "../../utils/compute.js";
import { draw } from "../../utils/draw.js";
import { events } from "../../utils/events.js";

export function newViewTypeImage() {
  const image = canvasUI.views.newType({
    name: "image",
    properties: {
      size: {
        width: ["px", 100],
        height: ["px", 100],
      },
      src: null,
      borderRadius: 5,
      borderSize: 0,
      borderColor: "rgba(0,0,0,0)",
      backgroundColor: "rgba(0,0,0,0)",
    },

    onCreate(view, bundle) {
      const src = view.getProperty("src");
      const image = new Image();
      image.src = src;
      view.set("image", image);
    },

    onStartSetSize(view, bundle, maxSize) {
      const sizeProperty = view.getProperty("size");
      const definedSize = compute.getDefinedSize(sizeProperty, maxSize);
      bundle.set("definedSize", definedSize);
    },

    getSize(view, bundle, maxSize) {
      const definedSize = bundle.get("definedSize");
      const computeSize = { width: () => 100, height: () => 100 };
      return compute.getSize(definedSize, maxSize, computeSize);
    },

    drawItself(view, bundle, ctx) {
      this._drawArea(view, ctx);
      this._drawImage(view, bundle, ctx);
    },

    _drawImage(view, bundle, ctx) {
      const coords = view.coords;
      const size = view.size;
      const image = view.get("image");
      draw.drawImage(ctx, coords, size, image);
    },
  });

  events.setEvents(image);

  image.setEvent({
    name: "srcChange",
    check(component, signal, bundle) {
      if (signal.type === "property" && signal.property === "src") {
        const data = signal.data;
        if (data.old !== data.new) return true;
      }
      return false;
    },
  });

  image.addListener("srcChange", function (view, event) {
    const image = view.get("image");
    image.src = event.new;
  });
}
