/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { EventsMRVB } from "../modules/EventsMRVB.js";
import * as b45 from "../modules/base45-ts/base45.js";
import * as qrLite from "../modules/qrcode-lite/qrcode.mjs";
import { loadImageFromURL } from "../modules/utilities/load-image-from-url.js";
import { fitImageInArea } from "../modules/utilities/fit-image-in-area.js";
import { drawBleedAndSafeLines } from "../modules/utilities/draw-bleed-and-safe-lines.js";

/** `EventsSealRenderer` takes an `EventsMRVB` object and returns an
 *  `HTMLCanvasElement` or an `OffscreenCanvas` element representation
 *  of the travel document as a small sticker.
 * 
 *  The renderer generates images appropriate for web use and for print
 *  use with 300-dpi printers. A bleed area surrounds the cut and safe
 *  areas to allow borderless printing.
 * 
 *  Renderers are scenario-specific and this was created to be used
 *  for a demo on a web page. Ergo, multiple properties are able to be
 *  set. In real-world use less (or no) properties may want to be set.
 */
class EventsSealRenderer {
  /** Create an `EventsSealRenderer`.
   * @param { Object } [opt] - An options object.
   * @param { string } [opt.barcodeDarkColor] - A RGBA hex string, formatted as '#RRGGBBAA'.
   * @param { string } [opt.barcodeLightColor] - A RGBA hex string, formatted as '#RRGGBBAA'.
   * @param { string } [opt.barcodeErrorCorrection] - The character 'L', 'M', 'Q', or 'H'.
   * @param { string } [opt.headerColor] - A RGB hex string, formatted as '#RRGGBB'.
   * @param { string } [opt.textColor] - A RGB hex string, formatted as '#RRGGBB'.
   * @param { string } [opt.frontBackgroundColor] - A RGB hex string, formatted as '#RRGGBB'.
   * @param { string | null } [opt.frontBackgroundImage] - A path/URL to an image file.
   * @param { string | null } [opt.logo] - A path/URL to an image file.
   * @param { boolean } [opt.showGuides] - Toggles bleed (red) and safe (blue) lines on the rendered canvas.
   * @param { string } [opt.fullAuthority] - The main header of the rendered sticker.
   * @param { string } [opt.fullDocumentName] - The secondary header of the rendered sticker.
   * @param { FontFaceSet } [opt.fonts] - A `FontFaceSet`, like the one available from `window.document`.
   */
  constructor(opt) {
    this.barcodeDarkColor = "#000000ff";
    this.barcodeLightColor = "00000000";
    this.barcodeErrorCorrection = "M";
    this.headerColor = "#000000";
    this.frontBackgroundColor = "#eeeeee";
    this.frontBackgroundImage = null;
    this.logo = null;
    this.showGuides = false;
    this.fullAuthority = "Main Header";
    this.fullDocumentName = "Secondary Header";
    this.fonts = null;

    if (opt) {
      if (opt.barcodeDarkColor) { this.barcodeDarkColor = opt.barcodeDarkColor; }
      if (opt.barcodeLightColor) { this.barcodeLightColor = opt.barcodeLightColor; }
      if (opt.barcodeErrorCorrection) { this.barcodeErrorCorrection = opt.barcodeErrorCorrection; }
      if (opt.headerColor) { this.headerColor = opt.headerColor; }
      if (opt.textColor) { this.textColor = opt.textColor; }
      if (opt.frontBackgroundColor) { this.frontBackgroundColor = opt.frontBackgroundColor; }
      if (opt.frontBackgroundImage) { this.frontBackgroundImage = opt.frontBackgroundImage; }
      if (opt.logo) { this.logo = opt.logo; }
      if (opt.showGuides !== undefined) { this.showGuides = opt.showGuides; }
      if (opt.fullAuthority) { this.fullAuthority = opt.fullAuthority; }
      if (opt.fullDocumentName) { this.fullDocumentName = opt.fullDocumentName; }
      if (opt.fonts) { this.fonts = opt.fonts; }
    }
  }

  /** The RGBA color for the dark (black) areas for rendered barcodes: '#RRGGBBAA'.
   * @type { string }
   */
  barcodeDarkColor;

  /** The RGBA color for the light (white) areas for rendered barcodes: '#RRGGBBAA'.
   * @type { string }
   */
  barcodeLightColor;

  /** The error correction level used for generating barcodes: 'L', 'M', 'Q', or 'H'.
   * @type { string }
   */
  barcodeErrorCorrection;

  /** The RGB color for the main and secondary header text: '#RRGGBB'.
   * @type { string }
   */
  headerColor;

  /** The RGB color for non-header text: '#RRGGBB'
   * @type { string }
   */
  textColor;

  /** The RGB color for the background when no front background image is set: '#RRGGBB'.
   * @type { string }
   */
  frontBackgroundColor;

  /** A path/URL to an image to use for the front background, or `null` for no background image.
   * @type { string | null }
   */
  frontBackgroundImage;

  /** A path/URL to an image to use for the logo, or `null` for no logo.
   * @type { string | null }
   */
  logo;

  /** Toggles bleed (red) and safe (blue) lines on the rendered canvas.
   * @type { boolean }
   */
  showGuides;

  /** The main header of the rendered sticker.
   * @type { string }
   */
  fullAuthority;

  /** The secondary header of the rendered sticker.
   * @type { string }
   */
  fullDocumentName;

  /** A `FontFaceSet`, like the one available from `window.document`.
   * @type { FontFaceSet }
   */
  fonts;

  /* Font information used in card generation (static) */
  static #vizFontFace = new FontFace(
    "Open Sans",
    "url('/fonts/OpenSans-Regular.woff') format('woff')"
  );
  static #vizBoldFontFace = new FontFace(
    "Open Sans",
    "url('/fonts/OpenSans-Bold.woff') format('woff')",
    { weight: "bold" }
  );
  static get #headerFont() {
    return `bold 18px ${this.#vizFontFace.family}`;
  }
  static get #dataFont() {
    return `18px ${this.#vizFontFace.family}`;
  }

  /* Coordinates, widths, and heights used in card generation */
  static get cutCardArea() { return [276, 404]; }
  static #cardArea = [308, 436];
  static #bleed = 16;
  static #safe = 48;
  static #textX = 168;
  static #textY = [48, 73, 98, 123];
  static #logoXY = [48, 48];
  static #logoArea = 96;
  static #qrCodeXY = [48, 176];
  static #textWidth = 92

  /** Load the fonts used by this renderer. */
  async loadCanvasFonts() {
    this.fonts.add(EventsSealRenderer.#vizFontFace);
    this.fonts.add(EventsSealRenderer.#vizBoldFontFace);
    await Promise.all([
      EventsSealRenderer.#vizFontFace.load(),
      EventsSealRenderer.#vizBoldFontFace.load()
    ]);
  }

  /** Generate the front image and return the canvas.
   * @param { EventsMRVB } model
   * @param { HTMLCanvasElement } fallback
   */
  async generateCardFront(model, fallback) {
    let canvas;
    if (typeof OffscreenCanvas === "undefined") {
      canvas = fallback;
      canvas.width = EventsSealRenderer.#cardArea[0];
      canvas.height = EventsSealRenderer.#cardArea[1];
    }
    else {
      canvas = new OffscreenCanvas(
        EventsSealRenderer.#cardArea[0],
        EventsSealRenderer.#cardArea[1]
      );
    }
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";

    const images = await Promise.all([
      this.frontBackgroundImage ? loadImageFromURL(this.frontBackgroundImage) : null,
      this.logo ? loadImageFromURL(this.logo) : null,
      qrLite.toCanvas([
        { data: b45.encode(model.signedSeal), mode: "alphanumeric" }
      ],{
        errorCorrectionLevel: this.barcodeErrorCorrection,
        version: 9,
        margin: 0,
        color: {
          dark: this.barcodeDarkColor,
          light: this.barcodeLightColor
        }
      })
    ]);

    ctx.fillStyle = this.frontBackgroundColor;
    ctx.fillRect(
      0, 0,
      EventsSealRenderer.#cardArea[0],
      EventsSealRenderer.#cardArea[1]
    );
    if (images[0]) {
      ctx.drawImage(
        images[0],
        0, 0,
        EventsSealRenderer.#cardArea[0],
        EventsSealRenderer.#cardArea[1]
      );
    }
    if (images[1]) {
      fitImageInArea(
        images[1], ctx,
        EventsSealRenderer.#logoXY[0],
        EventsSealRenderer.#logoXY[1],
        EventsSealRenderer.#logoArea,
        EventsSealRenderer.#logoArea
      );
    }
    ctx.drawImage(
      images[2],
      EventsSealRenderer.#qrCodeXY[0],
      EventsSealRenderer.#qrCodeXY[1],
    );

    ctx.fillStyle = this.headerColor;
    ctx.font = EventsSealRenderer.#headerFont;
    ctx.fillText(
      this.fullAuthority,
      Math.max(
        EventsSealRenderer.#cardArea[0] -
          EventsSealRenderer.#safe -
          ctx.measureText(this.fullAuthority).width,
        EventsSealRenderer.#textX
      ),
      EventsSealRenderer.#textY[0],
      EventsSealRenderer.#textWidth
    );
    ctx.fillText(
      this.fullDocumentName,
      Math.max(
        EventsSealRenderer.#cardArea[0] -
          EventsSealRenderer.#safe -
          ctx.measureText(this.fullDocumentName).width,
        EventsSealRenderer.#textX
      ),
      EventsSealRenderer.#textY[1],
      EventsSealRenderer.#textWidth
    );
    ctx.font = EventsSealRenderer.#dataFont;
    ctx.fillStyle = this.textColor;
    let numberWidth = EventsSealRenderer.#cardArea[0] -
      EventsSealRenderer.#safe -
      ctx.measureText(model.number).width;
    ctx.fillText(
      model.number,
      numberWidth,
      EventsSealRenderer.#textY[2],
      EventsSealRenderer.#textWidth
    );

    ctx.font = EventsSealRenderer.#dataFont;
    ctx.fillStyle = this.textColor;
    let passportWidth = EventsSealRenderer.#cardArea[0] -
      EventsSealRenderer.#safe -
      ctx.measureText(model.validThru.toISOString().slice(0, 10)).width;
    ctx.fillText(
      model.validThru.toISOString().slice(0, 10),
      passportWidth,
      EventsSealRenderer.#textY[3],
      EventsSealRenderer.#textWidth
    );

    if (this.showGuides) {
      drawBleedAndSafeLines(
        ctx,
        EventsSealRenderer.#cardArea,
        EventsSealRenderer.#bleed,
        EventsSealRenderer.#safe
      );
    }

    return canvas;
  }
}

export { EventsSealRenderer };