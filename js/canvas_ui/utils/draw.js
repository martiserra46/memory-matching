export const draw = {
  drawArea(component, ctx, change = {}) {
    this.drawBackground(component, ctx, change);
    this.drawBorder(component, ctx, change);
  },

  drawBackground(component, ctx, change = {}) {
    const coords = component.coords;
    const size = component.size;
    const style = this._getBackgroundStyle(component, change);
    this.fillRoundedRect(ctx, coords, size, style);
  },

  _getBackgroundStyle(component, change = {}) {
    return {
      backgroundColor:
        change.backgroundColor ?? component.getProperty("backgroundColor"),
      borderRadius:
        change.borderRadius ?? component.getProperty("borderRadius"),
    };
  },

  drawBorder(component, ctx, change = {}) {
    const coords = component.coords;
    const size = component.size;
    const style = this._getBorderStyle(component, change);
    this.strokeRoundedRect(ctx, coords, size, style);
  },

  _getBorderStyle(component, change = {}) {
    return {
      borderColor: change.borderColor ?? component.getProperty("borderColor"),
      borderSize: change.borderSize ?? component.getProperty("borderSize"),
      borderRadius:
        change.borderRadius ?? component.getProperty("borderRadius"),
    };
  },

  fillRoundedRect(ctx, coords, size, style = {}) {
    const { backgroundColor = "#000", borderRadius = 0 } = style;
    ctx.save();
    ctx.fillStyle = backgroundColor;
    ctx.beginPath();
    this._roundedRect(ctx, coords, size, borderRadius);
    ctx.fill();
    ctx.restore();
  },

  strokeRoundedRect(ctx, coords, size, style = {}) {
    let { x, y } = coords;
    let { width, height } = size;
    const { borderColor = "#000", borderSize = 1, borderRadius = 0 } = style;

    x += borderSize / 2;
    y += borderSize / 2;
    coords = { x, y };

    width -= borderSize;
    height -= borderSize;
    size = { width, height };

    ctx.save();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderSize;
    ctx.beginPath();
    this._roundedRect(ctx, coords, size, borderRadius);
    ctx.stroke();
    ctx.restore();
  },

  _roundedRect(ctx, coords, size, radius) {
    const { x, y } = coords;
    const { width, height } = size;
    if (radius > width / 2) radius = width / 2;
    if (radius > height / 2) radius = height / 2;
    ctx.arc(x + radius, y + radius, radius, Math.PI, (3 * Math.PI) / 2);
    ctx.lineTo(x + width - radius, y);
    ctx.arc(x + width - radius, y + radius, radius, (3 * Math.PI) / 2, 0);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2);
    ctx.lineTo(x + radius, y + height);
    ctx.arc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI);
    ctx.lineTo(x, y + radius);
  },

  drawText(ctx, coords, text, style = {}) {
    const { x, y } = coords;
    const {
      fontWeight = 500,
      fontSize = 16,
      fontFamily = "Courier New",
      fontColor = "#000",
    } = style;
    ctx.save();
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = fontColor;
    ctx.textBaseline = "top";
    ctx.fillText(text, x, y);
    ctx.restore();
  },

  drawImage(ctx, coords, size, image) {
    const { x, y } = coords;
    const { width, height } = size;
    ctx.drawImage(image, x, y, width, height);
  },
};
