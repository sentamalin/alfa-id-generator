// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Generate a signature using a font and a canvas. Returns a canvas.
 * @param { string } text
 * @param { HTMLCanvasElement | OffscreenCanvas } fallback
 * @param { number[] } area
 * @param { string } color
 * @param { string } font
 */
function generateSignatureFromText(text, fallback, area, color, font) {
  let canvas;
  let ctx;
  if (typeof OffscreenCanvas === "undefined") {
    canvas = fallback;
    canvas.width = area[0];
    canvas.height = area[1];
  } else {
    canvas = new OffscreenCanvas(area[0], area[1]);
  }
  ctx = canvas.getContext("2d");
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textBaseline = "top";
  const centerShift = (canvas.width - ctx.measureText(text).width) / 2;
  ctx.fillText(
    text, Math.max(centerShift, 0), 8,
    area[0] - 6
  );
  return canvas;
}

export { generateSignatureFromText };
