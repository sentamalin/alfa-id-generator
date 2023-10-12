// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Scale (preserving aspect ratio) and draw an image to fit into a specified
 *     area of a 2D canvas.
 * @param { HTMLImageElement | SVGImageElement | HTMLVideoElement |
 *     HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame } img
 * @param { CanvasRenderingContext2D } ctx
 * @param { number } x - The x-coordinate on which to draw the image.
 * @param { number } y - The y-coordinate on which to draw the image.
 * @param { number } width - The width of the area in which the image should
 *     fit.
 * @param { number } height - The height of the area in which the image should
 *     fit.
 */
function fitImageInArea(img, ctx, x, y, width, height) {
  const hRatio = width / img.width;
  const vRatio = height / img.height;
  const ratio = Math.min(hRatio, vRatio);
  const centerShiftX = (width - img.width * ratio) / 2;
  const centerShiftY = (height - img.height * ratio) / 2;
  ctx.drawImage(
    img, 0, 0, img.width, img.height,
    x + centerShiftX, y + centerShiftY,
    img.width * ratio, img.height * ratio
  );
}

export { fitImageInArea };
