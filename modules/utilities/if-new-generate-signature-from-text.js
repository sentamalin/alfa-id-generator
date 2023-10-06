/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { generateSignatureFromText } from "./generate-signature-from-text.js";

/** If the new text is different from the old text, generate a new signature canvas.
 * @param { HTMLCanvasElement | OffscreenCanvas } fallback
 * @param { number[] } area
 * @param { string } color
 * @param { string } font
 */
function* ifNewGenerateSignatureFromText(fallback, area, color, font) {
  let oldText = "";
  let text = "";
  /** @type { HTMLCanvasElement | OffscreenCanvas } */
  let canvas;

  while (true) {
    text = yield;
    if (oldText === text) {
      yield { newSignature: false, signature: canvas };
    }
    else {
      oldText = text;
      canvas = generateSignatureFromText(
        text,
        fallback,
        area,
        color,
        font
      );
      yield { newSignature: true, signature: canvas };
    }
  }
}

export { ifNewGenerateSignatureFromText };
