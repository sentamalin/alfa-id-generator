/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { EventsMRVB } from "../modules/EventsMRVB.js";
import * as b45 from "../modules/base45-ts/base45.js";
import * as qrLite from "../modules/qrcode-lite/qrcode.mjs";
import { loadImageFromURL } from "../modules/utilities/load-image-from-url.js";
import { fitImageInArea } from "../modules/utilities/fit-image-in-area.js";
import { fillAreaWithImage } from "../modules/utilities/fill-area-with-image.js";
import { drawBleedAndSafeLines } from "../modules/utilities/draw-bleed-and-safe-lines.js";

/**
 * `EventsMRVBRenderer` takes an `EventsMRVB` object and returns a `HTMLCanvasElement`
 * or an `OffscreenCanvas` element representation of the travel document as a machine-readable
 * visa sticker size B (MRV-B).
 * 
 * The renderer generates images appropriate for web use and for print use with
 * 300-dpi printers. A bleed area surrounds the cut and safe areas to allow
 * borderless printing.
 * 
 * Renerers are scenario-specific and this was created to be used for a demo
 * on a web page. Ergo, multiple properties are able to be set. In real-world
 * use less (or no) properties may want to be settable.
 */
class EventsMRVBRenderer {
  /**
   * Create an `EventsMRVBRenderer`.
   * @param { Object } [opt] - An options object.
   * @param { string } [opt.barcodeDarkColor] - A RGBA hex string, formatted as '#RRGGBBAA'.
   * @param { string } [opt.barcodeLightColor] - A RGBA hex string, formatted as '#RRGGBBAA'.
   * @param { string } [opt.barcodeErrorCorrection] - The character 'L', 'M', 'Q', or 'H'.
   * @param { string } [opt.headerColor] - A RGB hex string, formatted as '#RRGGBB'.
   * @param { string } [opt.textColor] - A RGB hex string, formatted as '#RRGGBB'.
   * @param { string } [opt.mrzColor] - A RGB hex string, formatted as '#RRGGBB'.
   * @param { string } [opt.frontBackgroundColor] - A RGB hex string, formatted as '#RRGGBB'.
   * @param { string | null } [opt.frontBackgroundImage] - A path/URL to an image file.
   * @param { string } [opt.mrzBackgroundColor] - A RGB hex string, formatted as '#RRGGBB'.
   * @param { string | null } [opt.mrzBackgroundImage] - A path/URL to an image file.
   * @param { string } [opt.logoUnderlayColor] - A RGB hex string, formatted as '#RRGGBB'.
   * @param { number } [opt.logoUnderlayAlpha] - A number in the range of 0-255.
   * @param { string | null } [opt.logo] - A path/URL to an image file.
   * @param { boolean } [opt.showGuides] - Toggles bleed (red) and safe (blue) lines on the rendered canvas.
   * @param { boolean } [opt.useDigitalSeal] - Toggles storing a visible digital seal (VDS) on the barcode in place of a URL.
   * @param { string } [opt.fullAuthority] - The full name of the authority who issued this visa.
   * @param { string } [opt.fullDocumentName] - The full name of this visa type.
   * @param { string[] } [opt.placeOfIssueHeader] - Header text for the placeOfIssue property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.validFromHeader] - Header text for the validFrom property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.validThruHeader] - Header text for the validThru property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.numberOfEntriesHeader] - Header text for the numberOfEntries property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.numberHeader] - Header text for the number property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.typeHeader] - Header text for the visaType property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.nameHeader] - Header text for the name property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.passportNumberHeader] - Header text for the passportNumber property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.nationalityHeader] - Header text for the nationalityCode property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.dateOfBirthHeader] - Header text for the birthDate property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.genderHeader] - Header text for the genderMarker property: ['primary', 'language 1', 'language 2'].
   * @param { FontFaceSet } [opt.fonts] - A `FontFaceSet`, like the one available from `window.document`.
   */
  constructor(opt) {
    this.barcodeDarkColor = opt.barcodeDarkColor ?? "#000000ff";
    this.barcodeLightColor = opt.barcodeLightColor ?? "#00000000";
    this.barcodeErrorCorrection = opt.barcodeErrorCorrection ?? "M";
    this.headerColor = opt.headerColor ?? "#4090ba";
    this.textColor = opt.textColor ?? "#000000";
    this.mrzColor = opt.mrzColor ?? "#000000";
    this.frontBackgroundColor = opt.frontBackgroundColor ?? "#eeeeee";
    this.frontBackgroundImage = opt.frontBackgroundImage ?? null;
    this.mrzBackgroundColor = opt.mrzBackgroundColor ?? "#ffffff";
    this.mrzBackgroundImage = opt.mrzBackgroundImage ?? null;
    this.logoUnderlayColor = opt.logoUnderlayColor ?? "#4090ba";
    this.logoUnderlayAlpha = opt.logoUnderlayAlpha ?? 255;
    this.logo = opt.logo ?? null;
    this.showGuides = opt.showGuides ?? false;
    this.useDigitalSeal = opt.useDigitalSeal ?? false;
    this.fullAuthority = opt.fullAuthority ?? "AIR LINE FURRIES ASSOCIATION, INTERNATIONAL";
    this.fullDocumentName = opt.fullDocumentName ?? "FURRY EVENTS VISA";
    this.placeOfIssueHeader = opt.placeOfIssueHeader ?? ["HEADER", "EN-TÊTE", "ENCABEZADO"];
    this.validFromHeader = opt.validFromHeader ?? ["HEADER", "EN-TÊTE", "ENCABEZADO"];
    this.validThruHeader = opt.validThruHeader ?? ["HEADER", "EN-TÊTE", "ENCABEZADO"];
    this.numberOfEntriesHeader = opt.numberOfEntriesHeader ?? ["HEADER", "EN-TÊTE", "ENCABEZADO"];
    this.numberHeader = opt.numberHeader ?? ["HEADER", "EN-TÊTE", "ENCABEZADO"];
    this.typeHeader = opt.typeHeader ?? ["HEADER", "EN-TÊTE", "ENCABEZADO"];
    this.nameHeader = opt.nameHeader ?? ["HEADER", "EN-TÊTE", "ENCABEZADO"];
    this.passportNumberHeader = opt.passportNumberHeader ?? ["HEADER", "EN-TÊTE", "ENCABEZADO"];
    this.nationalityHeader = opt.nationalityHeader ?? ["HEADER", "EN-TÊTE", "ENCABEZADO"];
    this.dateOfBirthHeader = opt.dateOfBirthHeader ?? ["HEADER", "EN-TÊTE", "ENCABEZADO"];
    this.genderHeader = opt.genderHeader ?? ["HEADER", "EN-TÊTE", "ENCABEZADO"];
    this.fonts = opt.fonts ?? null;
  }

  /** The RGBA color for the dark (black) areas for the rendered barcode: '#RRGGBBAA'.
   * @type { string }
   */
  barcodeDarkColor;

  /** The RGBA color for the light (white) areas for the rendered barcode: '#RRGGBBAA'.
   * @type { string }
   */
  barcodeLightColor;

  /** The error correction level used for generating the barcode: 'L', 'M', 'Q', or 'H'.
   * @type { string }
   */
  barcodeErrorCorrection;

  /** The RGB color for header text: '#RRGGBB'.
   * @type { string }
   */
  headerColor;

  /** The RGB color for non-header text: '#RRGGBB'.
   * @type { string }
   */
  textColor;

  /** The RGB color for Machine-Readable Zone (MRZ) text: '#RRGGBB'.
   * @type { string }
   */
  mrzColor;

  /** The RGB color for the background when no front background image is set: '#RRGGBB'.
   * @type { string }
   */
  frontBackgroundColor;

  /** A path/URL to an image to use for the front background, or `null` for no background image.
   * @type { string | null }
   */
  frontBackgroundImage;

  /** The RGB color for the background when no Machine-Readable Zone (MRZ) background image is set: '#RRGGBB'.
   * @type { string }
   */
  mrzBackgroundColor;

  /** A path/URL to an image to use for the Machine-Readable Zone (MRZ) background, or `null` for no background image.
   * @type { string | null }
   */
  mrzBackgroundImage;

  /** The RGB color for the underlay under photo/logo areas: '#RRGGBB'.
   * @type { string }
   */
  logoUnderlayColor;

  /** The opacity of the number underlay color: 0-255.
   * @type { number }
   */
  logoUnderlayAlpha;
  get #logoUnderlayColorWithAlpha() {
    return this.logoUnderlayColor +
      this.logoUnderlayAlpha.toString(16).padStart(2, "0");
  }

  /** A path/URL to an image to use for the logo, or `null` for no logo.
   * @type { string | null }
   */
  logo;

  /** Toggles bleed (red) and safe (blue) lines on the rendered canvas.
   * @type { boolean }
   */
  showGuides;

  /** Toggles storing a visible digital seal (VDS) on the barcode in place of a URL.
   * @type { boolean }
   */
  useDigitalSeal;

  /** The full name of the authority who issued this visa.
   * @type { string }
   */
  fullAuthority;

  /** The full name of this visa type.
   * @type { string }
   */
  fullDocumentName;

  /** Header text for the placeOfIssue property: ['primary', 'language 1', 'language 2'].
   * @type { string[] }
   */
  placeOfIssueHeader;

  /** Header text for the validFrom property: ['primary', 'language 1', 'language 2'].
   * @type { string[] }
   */
  validFromHeader;

  /** Header text for the validThru property: ['primary', 'language 1', 'language 2'].
   * @type { string[] }
   */
  validThruHeader;

  /** Header text for the numberOfEntries property: ['primary', 'language 1', 'language 2'].
   * @type { string[] }
   */
  numberOfEntriesHeader;

  /** Header text for the number property: ['primary', 'language 1', 'language 2'].
   * @type { string[] }
   */
  numberHeader;

  /** Header text for the visaType property: ['primary', 'language 1', 'language 2'].
   * @type { string[] }
   */
  typeHeader;

  /** Header text for the name property: ['primary', 'language 1', 'language 2'].
   * @type { string[] }
   */
  nameHeader;

  /** Header text for the passportNumber property: ['primary', 'language 1', 'language 2'].
   * @type { string[] }
   */
  passportNumberHeader;

  /** Header text for the nationalityCode property: ['primary', 'language 1', 'language 2'].
   * @type { string[] }
   */
  nationalityHeader;

  /** Header text for the birthDate property: ['primary', 'language 1', 'language 2'].
   * @type { string[] }
   */
  dateOfBirthHeader;

  /** Header text for the genderMarker property: ['primary', 'language 1', 'language 2'].
   * @type { string[] }
   */
  genderHeader;

  /** A `FontFaceSet`, like the one available from `window.document`.
   * @type { FontFaceSet }
   */
  fonts;

  // Font information used in card generation.
  static #mrzFontFace = new FontFace(
    "OCR-B",
    "url('/fonts/OCR-B-regular-web.woff2') format('woff2')," +
    "url('/fonts/OCR-B-regular-web.woff') format('woff')"
  );
  static #vizFontFace = new FontFace(
    "Open Sans",
    "url('/fonts/OpenSans-Regular.woff') format('woff')"
  );
  static #vizBoldFontFace = new FontFace(
    "Open Sans",
    "url('/fonts/OpenSans-Bold.woff') format('woff')",
    { weight: "bold" }
  );
  static #vizItalicFontFace = new FontFace(
    "Open Sans",
    "url('/fonts/OpenSans-Italic.woff') format('woff')",
    { style: "italic" }
  );
  static #signatureFontFace = new FontFace(
    "Yellowtail",
    "url('/fonts/Yellowtail-Regular.woff') format('woff')"
  );
  static get #mainHeaderFont() {
    return `bold 36px ${this.#vizFontFace.family}`;
  }
  static get #documentHeaderFont() {
    return `18px ${this.#vizFontFace.family}`;
  }
  static get #separatorHeaderFont() {
    return `bold 18px ${this.#vizFontFace.family}`;
  }
  static get #headerFont() {
    return `bold 18px ${this.#vizFontFace.family}`;
  }
  static get #intlFont() {
    return `italic 18px ${this.#vizFontFace.family}`;
  }
  static get #dataFont() {
    return `24px ${this.#vizFontFace.family}`;
  }
  static get #mrzFont() {
    return `44px ${this.#mrzFontFace.family}`;
  }
  static get signatureFont() {
    return `53px ${this.#signatureFontFace.family}`;
  }

  // Text constants used in image generation.
  static #headerSeparator = " · ";

  // Coordinates, widths, and heights used in card generation.
  static #mainHeaderXY = [1238, 48];
  static #documentHeaderXY = [1238, 92];
  static #photoUnderlayXY = [48, 0];
  static #photoXY = [72, 213];
  static #mrzUnderlayXY = [0, 618];
  static #logoXY = [72, 48];
  static #mrzX = 56;
  static #mrzY = [687, 762];
  static #mrzSpacing = 30.75;
  static #documentX = [
    340, // Place of issue (used to be 415)
    610, // Valid from
    840, // Valid thru
    1043 // Number of entries
  ];
  static #documentY = [
    141, // Row 1 header (primary)
    166, // Row 1 header (I18n 1)
    191, // Row 1 header (I18n 2)
    218, // Row 1 data
    267, // Row 2 header
    294, // Row 2 data
    343, // Additional information header (primary)
    368, // Additional information header (I18n 1)
    393, // Additional information header (I18n 2)
    420 // Additional information data line 1
  ];
  static #passportX = [
    340, // Nationality header (used to be 415)
    490, // Date of birth header
    700 // Gender header
  ];
  static #passportY = [
    343, // Name header
    370, // Name data
    419, // Passport header
    446, // Passport data
    495, // Row 3 header (primary)
    520, // Row 3 header (I18n 1)
    545, // Row 3 header (I18n 2)
    572 // Row 3 data
  ];
  static #cardArea = [1286, 916];
  static get cutCardArea() { return [1254, 884]; }
  static get signatureArea() { return 100; }
  static #bleed = 16;
  static #safe = 48;
  static #photoUnderlayArea = [268, 520];
  static #photoArea = [220, 283];
  static #logoArea = [220, 145];
  static #mrzUnderlayArea = [1286, 298];

  /** Load the fonts used by this renderer. */
  async loadCanvasFonts() {
    this.fonts.add(EventsMRVBRenderer.#mrzFontFace);
    this.fonts.add(EventsMRVBRenderer.#vizFontFace);
    this.fonts.add(EventsMRVBRenderer.#vizBoldFontFace);
    this.fonts.add(EventsMRVBRenderer.#vizItalicFontFace);
    this.fonts.add(EventsMRVBRenderer.#signatureFontFace);
    await Promise.all([
      EventsMRVBRenderer.#mrzFontFace.load(),
      EventsMRVBRenderer.#vizFontFace.load(),
      EventsMRVBRenderer.#vizBoldFontFace.load(),
      EventsMRVBRenderer.#vizItalicFontFace.load(),
      EventsMRVBRenderer.#signatureFontFace.load()
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
      canvas.width = EventsMRVBRenderer.#cardArea[0];
      canvas.height = EventsMRVBRenderer.#cardArea[1];
    } else {
      canvas = new OffscreenCanvas(
        EventsMRVBRenderer.#cardArea[0],
        EventsMRVBRenderer.#cardArea[1]
      );
    }
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";
    const barcode = this.useDigitalSeal ? [{ data: b45.encode(model.signedSeal), mode: "alphanumeric" }] : model.url;

    const images = await Promise.all([
      this.frontBackgroundImage ? loadImageFromURL(this.frontBackgroundImage) : null,
      this.mrzBackgroundImage ? loadImageFromURL(this.mrzBackgroundImage) : null,
      loadImageFromURL(model.picture),
      this.logo ? loadImageFromURL(this.logo) : null,
      qrLite.toCanvas(barcode, {
        errorCorrectionLevel: this.barcodeErrorCorrection,
        version: 9,
        margin: 0,
        color: {
          dark: this.barcodeDarkColor,
          light: this.barcodeLightColor
        }
      }),
      typeof model.signature !== typeof canvas ? loadImageFromURL(model.signature) : null
    ]);

    ctx.fillStyle = this.frontBackgroundColor;
    ctx.fillRect(
      0, 0,
      EventsMRVBRenderer.#cardArea[0],
      EventsMRVBRenderer.#cardArea[1]
    );
    if (images[0]) {
      ctx.drawImage(
        images[0],
        0, 0,
        EventsMRVBRenderer.#cardArea[0],
        EventsMRVBRenderer.#cardArea[1]
      );
    }
    ctx.fillStyle = this.mrzBackgroundColor;
    ctx.fillRect(
      EventsMRVBRenderer.#mrzUnderlayXY[0],
      EventsMRVBRenderer.#mrzUnderlayXY[1],
      EventsMRVBRenderer.#mrzUnderlayArea[0],
      EventsMRVBRenderer.#mrzUnderlayArea[1]
    );
    if (images[1]) {
      ctx.drawImage(
        images[1],
        EventsMRVBRenderer.#mrzUnderlayXY[0],
        EventsMRVBRenderer.#mrzUnderlayXY[1],
        EventsMRVBRenderer.#mrzUnderlayArea[0],
        EventsMRVBRenderer.#mrzUnderlayArea[1]
      );
    }
    ctx.fillStyle = this.#logoUnderlayColorWithAlpha;
    ctx.fillRect(
      EventsMRVBRenderer.#photoUnderlayXY[0],
      EventsMRVBRenderer.#photoUnderlayXY[1],
      EventsMRVBRenderer.#photoUnderlayArea[0],
      EventsMRVBRenderer.#photoUnderlayArea[1]
    );
    fillAreaWithImage(
      images[2], ctx,
      EventsMRVBRenderer.#photoXY[0],
      EventsMRVBRenderer.#photoXY[1],
      EventsMRVBRenderer.#photoArea[0],
      EventsMRVBRenderer.#photoArea[1]
    );
    if (images[3]) {
      fitImageInArea(
        images[3], ctx,
        EventsMRVBRenderer.#logoXY[0],
        EventsMRVBRenderer.#logoXY[1],
        EventsMRVBRenderer.#logoArea[0],
        EventsMRVBRenderer.#logoArea[1]
      );
    }
    ctx.drawImage(
      images[4],
      EventsMRVBRenderer.#cardArea[0] - 48 - images[4].width,
      EventsMRVBRenderer.#mrzUnderlayXY[1] - 32 - images[4].height
    );

    if (images[5]) {
      fitImageInArea(
        images[5], ctx,
        EventsMRVBRenderer.#cardArea[0] - 48 - images[4].width -
          24 - EventsMRVBRenderer.signatureArea,
        EventsMRVBRenderer.#mrzUnderlayXY[1] - 32 -
          EventsMRVBRenderer.signatureArea,
        EventsMRVBRenderer.signatureArea,
        EventsMRVBRenderer.signatureArea
      );
    } else {
      ctx.drawImage(
        model.signature,
        EventsMRVBRenderer.#cardArea[0] - 48 - images[4].width -
          24 - EventsMRVBRenderer.signatureArea,
        EventsMRVBRenderer.#mrzUnderlayXY[1] - 32 -
          EventsMRVBRenderer.signatureArea,
        EventsMRVBRenderer.signatureArea,
        EventsMRVBRenderer.signatureArea
      );
    }

    ctx.fillStyle = this.headerColor;
    ctx.font = EventsMRVBRenderer.#mainHeaderFont;
    ctx.fillText(
      this.fullAuthority,
      Math.max(
        EventsMRVBRenderer.#mainHeaderXY[0] -
          ctx.measureText(this.fullAuthority).width,
        EventsMRVBRenderer.#documentX[0]
      ),
      EventsMRVBRenderer.#mainHeaderXY[1],
      EventsMRVBRenderer.#mainHeaderXY[0] - EventsMRVBRenderer.#documentX[0]
    );
    ctx.font = EventsMRVBRenderer.#documentHeaderFont;
    let documentHeaderWidth = ctx.measureText(this.fullDocumentName).width;
    ctx.fillText(
      this.fullDocumentName,
      EventsMRVBRenderer.#documentHeaderXY[0] - documentHeaderWidth,
      EventsMRVBRenderer.#documentHeaderXY[1]
    );
    ctx.font = EventsMRVBRenderer.#separatorHeaderFont;
    documentHeaderWidth += ctx.measureText(EventsMRVBRenderer.#headerSeparator).width;
    ctx.fillText(
      EventsMRVBRenderer.#headerSeparator,
      EventsMRVBRenderer.#documentHeaderXY[0] - documentHeaderWidth,
      EventsMRVBRenderer.#documentHeaderXY[1]
    );
    ctx.font = EventsMRVBRenderer.#documentHeaderFont;
    documentHeaderWidth += ctx.measureText(`${model.typeCode.toVIZ()}-${model.authorityCode.toVIZ()}`).width;
    ctx.fillText(
      `${model.typeCode.toVIZ()}-${model.authorityCode.toVIZ()}`,
      EventsMRVBRenderer.#documentHeaderXY[0] - documentHeaderWidth,
      EventsMRVBRenderer.#documentHeaderXY[1]
    );

    ctx.fillStyle = this.headerColor;
    ctx.font = EventsMRVBRenderer.#headerFont;
    ctx.fillText(
      this.placeOfIssueHeader[0],
      EventsMRVBRenderer.#documentX[0],
      EventsMRVBRenderer.#documentY[0]
    );
    ctx.fillText(
      this.validFromHeader[0],
      EventsMRVBRenderer.#documentX[1],
      EventsMRVBRenderer.#documentY[0]
    );
    ctx.fillText(
      this.validThruHeader[0],
      EventsMRVBRenderer.#documentX[2],
      EventsMRVBRenderer.#documentY[0]
    );
    ctx.fillText(
      this.numberOfEntriesHeader[0],
      EventsMRVBRenderer.#documentX[3],
      EventsMRVBRenderer.#documentY[0]
    );
    ctx.fillText(
      this.numberHeader[0],
      EventsMRVBRenderer.#documentX[0],
      EventsMRVBRenderer.#documentY[4]
    );
    ctx.fillText(
      this.typeHeader[0],
      EventsMRVBRenderer.#documentX[2],
      EventsMRVBRenderer.#documentY[4]
    );
    ctx.fillText(
      this.nameHeader[0],
      EventsMRVBRenderer.#passportX[0],
      EventsMRVBRenderer.#passportY[0]
    );
    ctx.fillText(
      this.passportNumberHeader[0],
      EventsMRVBRenderer.#passportX[0],
      EventsMRVBRenderer.#passportY[2]
    );
    ctx.fillText(
      this.nationalityHeader[0],
      EventsMRVBRenderer.#passportX[0],
      EventsMRVBRenderer.#passportY[4]
    );
    ctx.fillText(
      this.dateOfBirthHeader[0],
      EventsMRVBRenderer.#passportX[1],
      EventsMRVBRenderer.#passportY[4]
    );
    ctx.fillText(
      this.genderHeader[0],
      EventsMRVBRenderer.#passportX[2],
      EventsMRVBRenderer.#passportY[4]
    );
    const placeOfIssueWidth = EventsMRVBRenderer.#documentX[0] +
      ctx.measureText(this.placeOfIssueHeader[0]).width;
    const validFromWidth = EventsMRVBRenderer.#documentX[1] +
      ctx.measureText(this.validFromHeader[0]).width;
    const validThruWidth = EventsMRVBRenderer.#documentX[2] +
      ctx.measureText(this.validThruHeader[0]).width;
    const numberOfEntriesWidth = EventsMRVBRenderer.#documentX[3] +
      ctx.measureText(this.numberOfEntriesHeader[0]).width;
    const numberWidth = EventsMRVBRenderer.#documentX[0] +
      ctx.measureText(this.numberHeader[0]).width;
    const typeWidth = EventsMRVBRenderer.#documentX[2] +
      ctx.measureText(this.typeHeader[0]).width;
    const nameWidth = EventsMRVBRenderer.#passportX[0] +
      ctx.measureText(this.nameHeader[0]).width;
    const passportNumberWidth = EventsMRVBRenderer.#passportX[0] +
      ctx.measureText(this.passportNumberHeader[0]).width;
    const nationalityWidth = EventsMRVBRenderer.#passportX[0] +
      ctx.measureText(this.nationalityHeader[0]).width;
    const dateOfBirthWidth = EventsMRVBRenderer.#passportX[1] +
      ctx.measureText(this.dateOfBirthHeader[0]).width;
    const genderWidth = EventsMRVBRenderer.#passportX[2] +
      ctx.measureText(this.genderHeader[0]).width;
    
    ctx.font = EventsMRVBRenderer.#intlFont;
    ctx.fillText(
      "/",
      placeOfIssueWidth,
      EventsMRVBRenderer.#documentY[0]
    );
    ctx.fillText(
      `${this.placeOfIssueHeader[1]}/`,
      EventsMRVBRenderer.#documentX[0],
      EventsMRVBRenderer.#documentY[1]
    );
    ctx.fillText(
      this.placeOfIssueHeader[2],
      EventsMRVBRenderer.#documentX[0],
      EventsMRVBRenderer.#documentY[2]
    );
    ctx.fillText(
      "/",
      validFromWidth,
      EventsMRVBRenderer.#documentY[0]
    );
    ctx.fillText(
      `${this.validFromHeader[1]}/`,
      EventsMRVBRenderer.#documentX[1],
      EventsMRVBRenderer.#documentY[1]
    );
    ctx.fillText(
      this.validFromHeader[2],
      EventsMRVBRenderer.#documentX[1],
      EventsMRVBRenderer.#documentY[2]
    );
    ctx.fillText(
      "/",
      validThruWidth,
      EventsMRVBRenderer.#documentY[0]
    );
    ctx.fillText(
      `${this.validThruHeader[1]}/`,
      EventsMRVBRenderer.#documentX[2],
      EventsMRVBRenderer.#documentY[1]
    );
    ctx.fillText(
      this.validThruHeader[2],
      EventsMRVBRenderer.#documentX[2],
      EventsMRVBRenderer.#documentY[2]
    );
    ctx.fillText(
      "/",
      numberOfEntriesWidth,
      EventsMRVBRenderer.#documentY[0],
    );
    ctx.fillText(
      `${this.numberOfEntriesHeader[1]}/`,
      EventsMRVBRenderer.#documentX[3],
      EventsMRVBRenderer.#documentY[1]
    );
    ctx.fillText(
      this.numberOfEntriesHeader[2],
      EventsMRVBRenderer.#documentX[3],
      EventsMRVBRenderer.#documentY[2]
    );
    ctx.fillText(
      `/ ${this.numberHeader[1]}/ ${this.numberHeader[2]}`,
      numberWidth,
      EventsMRVBRenderer.#documentY[4]
    );
    ctx.fillText(
      `/ ${this.typeHeader[1]}/ ${this.typeHeader[2]}`,
      typeWidth,
      EventsMRVBRenderer.#documentY[4]
    );
    ctx.fillText(
      `/ ${this.nameHeader[1]}/ ${this.nameHeader[2]}`,
      nameWidth,
      EventsMRVBRenderer.#passportY[0]
    );
    ctx.fillText(
      `/ ${this.passportNumberHeader[1]}/ ${this.passportNumberHeader[2]}`,
      passportNumberWidth,
      EventsMRVBRenderer.#passportY[2]
    );
    ctx.fillText(
      "/",
      nationalityWidth,
      EventsMRVBRenderer.#passportY[4]
    );
    ctx.fillText(
      `${this.nationalityHeader[1]}/`,
      EventsMRVBRenderer.#passportX[0],
      EventsMRVBRenderer.#passportY[5]
    );
    ctx.fillText(
      this.nationalityHeader[2],
      EventsMRVBRenderer.#passportX[0],
      EventsMRVBRenderer.#passportY[6]
    );
    ctx.fillText(
      "/",
      dateOfBirthWidth,
      EventsMRVBRenderer.#passportY[4]
    );
    ctx.fillText(
      `${this.dateOfBirthHeader[1]}/`,
      EventsMRVBRenderer.#passportX[1],
      EventsMRVBRenderer.#passportY[5]
    );
    ctx.fillText(
      this.dateOfBirthHeader[2],
      EventsMRVBRenderer.#passportX[1],
      EventsMRVBRenderer.#passportY[6]
    );
    ctx.fillText(
      "/",
      genderWidth,
      EventsMRVBRenderer.#passportY[4]
    );
    ctx.fillText(
      `${this.genderHeader[1]}/`,
      EventsMRVBRenderer.#passportX[2],
      EventsMRVBRenderer.#passportY[5]
    );
    ctx.fillText(
      this.genderHeader[2],
      EventsMRVBRenderer.#passportX[2],
      EventsMRVBRenderer.#passportY[6]
    );

    ctx.fillStyle = this.textColor;
    ctx.font = EventsMRVBRenderer.#dataFont;
    ctx.fillText(
      model.placeOfIssue.toVIZ(),
      EventsMRVBRenderer.#documentX[0],
      EventsMRVBRenderer.#documentY[3]
    );
    ctx.fillText(
      model.validFrom.toVIZ(),
      EventsMRVBRenderer.#documentX[1],
      EventsMRVBRenderer.#documentY[3]
    );
    ctx.fillText(
      model.validThru.toVIZ(),
      EventsMRVBRenderer.#documentX[2],
      EventsMRVBRenderer.#documentY[3]
    );
    ctx.fillText(
      model.numberOfEntries.toVIZ(),
      EventsMRVBRenderer.#documentX[3],
      EventsMRVBRenderer.#documentY[3]
    );
    ctx.fillText(
      model.number.toVIZ(),
      EventsMRVBRenderer.#documentX[0],
      EventsMRVBRenderer.#documentY[5]
    );
    ctx.fillText(
      model.visaType.toVIZ(),
      EventsMRVBRenderer.#documentX[2],
      EventsMRVBRenderer.#documentY[5]
    );
    ctx.fillText(
      model.fullName.toVIZ(),
      EventsMRVBRenderer.#passportX[0],
      EventsMRVBRenderer.#passportY[1]
    );
    ctx.fillText(
      model.passportNumber.toVIZ(),
      EventsMRVBRenderer.#passportX[0],
      EventsMRVBRenderer.#passportY[3]
    );
    ctx.fillText(
      model.nationalityCode.toVIZ(),
      EventsMRVBRenderer.#passportX[0],
      EventsMRVBRenderer.#passportY[7]
    );
    ctx.fillText(
      model.birthDate.toVIZ(),
      EventsMRVBRenderer.#passportX[1],
      EventsMRVBRenderer.#passportY[7]
    );
    ctx.fillText(
      model.genderMarker.toVIZ(),
      EventsMRVBRenderer.#passportX[2],
      EventsMRVBRenderer.#passportY[7]
    );

    ctx.fillStyle = this.mrzColor;
    ctx.font = EventsMRVBRenderer.#mrzFont;
    for (let i = 0; i < model.mrzLine1.length; i += 1) {
      ctx.fillText(
        model.mrzLine1[i],
        EventsMRVBRenderer.#mrzX + (i * EventsMRVBRenderer.#mrzSpacing),
        EventsMRVBRenderer.#mrzY[0]
      );
      ctx.fillText(
        model.mrzLine2[i],
        EventsMRVBRenderer.#mrzX + (i * EventsMRVBRenderer.#mrzSpacing),
        EventsMRVBRenderer.#mrzY[1]
      );
    }

    if (this.showGuides) {
      drawBleedAndSafeLines(
        ctx,
        EventsMRVBRenderer.#cardArea,
        EventsMRVBRenderer.#bleed,
        EventsMRVBRenderer.#safe
      );
    }

    return canvas;
  }
}

export { EventsMRVBRenderer };
