// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Fill a specified area of a 2D canvas with a scaled (preserving aspect ratio)
 *     image.
 * @param { HTMLImageElement | SVGImageElement | HTMLVideoElement |
 *     HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame } img
 * @param { CanvasRenderingContext2D } ctx
 * @param { number } x - The x-coordinate on which to draw the image.
 * @param { number } y - The y-coordinate on which to draw the image.
 * @param { number } width - The width of the area in which the image should
 *     fill.
 * @param { number } height - The height of the area in which the image should
 *     fill.
 */
export function fillAreaWithImage(img, ctx, x, y, width, height) {
  const hRatio = width / img.width;
  const vRatio = height / img.height;
  const ratio = Math.max(hRatio, vRatio);
  const centerShiftX = (width - img.width * ratio) / 2;
  const centerShiftY = (height - img.height * ratio) / 2;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(
    img, 0, 0, img.width, img.height,
    x + centerShiftX, y + centerShiftY,
    img.width * ratio, img.height * ratio
  );
  ctx.restore();
}
