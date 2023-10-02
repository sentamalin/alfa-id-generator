/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/** Draw bleed and safe lines on a 2D canvas
 * @param { CanvasRenderingContext2D } ctx
 * @param { number[] } area - The width and height of the canvas in an array: [width, height].
 * @param { number } bleed - The number of pixels that define the bleed area.
 * @param { number } safe - The number of pixels that define the safe area.
 */
function drawBleedAndSafeLines(ctx, area, bleed, safe) {
  ctx.strokeStyle = "#ff0000";
  ctx.lineWidth = 1;
  ctx.lineCap = "butt";
  ctx.beginPath();
  ctx.moveTo(0, bleed);
  ctx.lineTo(area[0], bleed);
  ctx.closePath(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, area[1] - bleed);
  ctx.lineTo(area[0], area[1] - bleed);
  ctx.closePath(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bleed, 0);
  ctx.lineTo(bleed, area[1]);
  ctx.closePath(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(area[0] - bleed, 0);
  ctx.lineTo(area[0] - bleed, area[1]);
  ctx.closePath(); ctx.stroke();

  ctx.strokeStyle = "#0000ff";
  ctx.beginPath();
  ctx.moveTo(0, safe);
  ctx.lineTo(area[0], safe);
  ctx.closePath(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, area[1] - safe);
  ctx.lineTo(area[0], area[1] - safe);
  ctx.closePath(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(safe, 0);
  ctx.lineTo(safe, area[1]);
  ctx.closePath(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(area[0] - safe, 0);
  ctx.lineTo(area[0] - safe, area[1]);
  ctx.closePath(); ctx.stroke();
}

export { drawBleedAndSafeLines };