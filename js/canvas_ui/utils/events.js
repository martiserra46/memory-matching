import { compute } from "./compute.js";

export const events = {
  setEvents(type) {
    this.setMouseEvents(type);
    this.setKeyEvents(type);
  },

  setMouseEvents(type) {
    type.setEvent(this.mouseDownAnywhere());
    type.setEvent(this.mouseUpAnywhere());
    type.setEvent(this.mouseMoveAnywhere());
    type.setEvent(this.mouseClick());
    type.setEvent(this.mouseDown());
    type.setEvent(this.mouseUp());
    type.setEvent(this.mouseMove());
    type.setEvent(this.mouseEnter());
    type.setEvent(this.mouseLeave());
  },

  setKeyEvents(type) {
    type.setEvent(this.keyDown());
    type.setEvent(this.keyUp());
  },

  mouseDownAnywhere: () => ({
    name: "mouseDownAnywhere",
    check(component, signal, bundle) {
      return signal.type === "mouse" && signal.mouse === "down";
    },
  }),

  mouseUpAnywhere: () => ({
    name: "mouseUpAnywhere",
    check(component, signal, bundle) {
      return signal.type === "mouse" && signal.mouse === "up";
    },
  }),

  mouseMoveAnywhere: () => ({
    name: "mouseMoveAnywhere",
    check(component, signal, bundle) {
      return signal.type === "mouse" && signal.mouse === "move";
    },
  }),

  mouseClick: () => ({
    name: "mouseClick",
    beforeCheck(component, signal, bundle) {
      if (signal.type === "mouse" && signal.mouse === "down") {
        const coordsIn = compute.areCoordsInComponent(signal.data, component);
        bundle.set("isDownIn", coordsIn);
      } else if (signal.type === "mouse" && signal.mouse === "up") {
        const coordsIn = compute.areCoordsInComponent(signal.data, component);
        bundle.set("isUpIn", coordsIn);
      }
    },
    check(component, signal, bundle) {
      if (signal.type === "mouse" && signal.mouse === "up")
        if (bundle.get("wasDownIn") && bundle.get("isUpIn")) return true;
      return false;
    },
    afterCheck(component, signal, bundle) {
      if (signal.type === "mouse" && signal.mouse === "down")
        bundle.set("wasDownIn", bundle.get("isDownIn"));
    },
  }),

  mouseDown: () => ({
    name: "mouseDown",
    check(component, signal, bundle) {
      if (signal.type === "mouse" && signal.mouse === "down") {
        const coordsIn = compute.areCoordsInComponent(signal.data, component);
        if (coordsIn) return true;
      }
      return false;
    },
  }),

  mouseUp: () => ({
    name: "mouseUp",
    check(component, signal, bundle) {
      if (signal.type === "mouse" && signal.mouse === "up") {
        const coordsIn = compute.areCoordsInComponent(signal.data, component);
        if (coordsIn) return true;
      }
      return false;
    },
  }),

  mouseMove: () => ({
    name: "mouseMove",
    check(component, signal, bundle) {
      if (signal.type === "mouse" && signal.mouse === "move") {
        const coordsIn = compute.areCoordsInComponent(signal.data, component);
        if (coordsIn) return true;
      }
      return false;
    },
  }),

  mouseEnter: () => ({
    name: "mouseEnter",
    beforeCheck(component, signal, bundle) {
      if (signal.type === "mouse" && signal.mouse === "move") {
        const coordsIn = compute.areCoordsInComponent(signal.data, component);
        if (coordsIn) {
          bundle.set("isIn", true);
          if (!bundle.get("wasIn")) bundle.set("entered", true);
          else bundle.set("entered", false);
        } else bundle.set("isIn", false);
      } else if (signal.type === "mouse" && signal.mouse === "leave") {
        bundle.set("isIn", false);
        bundle.set("entered", false);
      }
    },
    check(component, signal, bundle) {
      if (signal.type === "mouse" && signal.mouse === "move")
        if (bundle.get("entered")) return true;
      return false;
    },
    afterCheck(component, signal, bundle) {
      if (
        (signal.type === "mouse" && signal.mouse === "move") ||
        (signal.type === "mouse" && signal.mouse === "leave")
      ) {
        bundle.set("wasIn", bundle.get("isIn"));
      }
    },
  }),

  mouseLeave: () => ({
    name: "mouseLeave",
    beforeCheck(component, signal, bundle) {
      if (
        (signal.type === "mouse" && signal.mouse === "move") ||
        (signal.type === "mouse" && signal.mouse === "leave")
      ) {
        if (
          (signal.type === "mouse" && signal.mouse === "leave") ||
          !compute.areCoordsInComponent(signal.data, component)
        ) {
          bundle.set("isOut", true);
          if (!(bundle.get("wasOut") ?? true)) bundle.set("left", true);
          else bundle.set("left", false);
        } else {
          bundle.set("isOut", false);
          bundle.set("left", false);
        }
      }
    },
    check(component, signal, bundle) {
      if (
        (signal.type === "mouse" && signal.mouse === "move") ||
        (signal.type === "mouse" && signal.mouse === "leave")
      ) {
        if (bundle.get("left")) return true;
      }
      return false;
    },
    afterCheck(component, signal, bundle) {
      if (
        (signal.type === "mouse" && signal.mouse === "move") ||
        (signal.type === "mouse" && signal.mouse === "leave")
      ) {
        bundle.set("wasOut", bundle.get("isOut"));
      }
    },
  }),

  keyDown: () => ({
    name: "keyDown",
    check(component, signal, bundle) {
      return signal.type === "key" && signal.key === "down";
    },
  }),

  keyUp: () => ({
    name: "keyUp",
    check(component, signal, bundle) {
      return signal.type === "key" && signal.key === "up";
    },
  }),
};
