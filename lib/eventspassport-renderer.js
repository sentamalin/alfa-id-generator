// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

import { EventsPassport } from "./eventspassport.js";
import { encode as toBase45 } from "./base45-ts/base45.js";
import { toCanvas as toQRCanvas } from "./qrcode-lite/qrcode.mjs";
import { loadImageFromURL } from "./utilities/load-image-from-url.js";
import { fitImageInArea } from "./utilities/fit-image-in-area.js";
import { fillAreaWithImage } from "./utilities/fill-area-with-image.js";
import { drawBleedAndSafeLines } from "./utilities/draw-bleed-and-safe-lines.js";
import { dateToVIZ } from "./utilities/date-to-viz.js";
import { BACKGROUND_COLOR, BARCODE_DARK_COLOR, BARCODE_ERROR_CORRECTION, BARCODE_LIGHT_COLOR, FULL_AUTHORITY, HEADER_COLOR, MRZ_BACKGROUND_COLOR, TD3_MRZ_LINE_LENGTH, TEXT_COLOR, UNDERLAY_OPACITY, authorityHeader, birthDateHeader, genderHeader, nameHeader, nationalityHeader } from "./utilities/renderer-variables.js";

/**
 * `EventsPassportRenderer` takes an `EventsPassport` object and returns a
 *     `HTMLCanvasElement` or an `OffscreenCanvas` element representation of the
 *     travel document as the machine-readable passport (MRP) page and signature
 *     page of a TD3-sized passport booklet.
 * 
 * The renderer generates images appropriate for web use and for print use with
 *     300-dpi printers. A bleed area surrounds the cut and safe areas to allow
 *     borderless printing.
 * 
 * Renderers are scenario-specific and this was created to be used for a demo on
 *     a web page. Ergo, multiple properties are able to be set. In real-world
 *     use less (or no) properties may want to be settable.
 */
export class EventsPassportRenderer {
  /**
   * Create an `EventsPassportRenderer`.
   * @param { Object } [opt] - An options object.
   * @param { string } [opt.barcodeDarkColor] - A RGBA hex string, formatted as
   *     '#RRGGBBAA'.
   * @param { string } [opt.barcodeLightColor] - A RGBA hex string, formatted as
   *     '#RRGGBBAA'.
   * @param { string } [opt.barcodeErrorCorrection] - The character 'L', 'M',
   *     'Q', or 'H'.
   * @param { string } [opt.headerColor] - A RGB hex string, formatted as
   *     '#RRGGBB'.
   * @param { string } [opt.textColor] - A RGB hex string, formatted as
   *     '#RRGGBB'.
   * @param { string } [opt.mrzColor] - A RGB hex string, formatted as
   *     '#RRGGBB'.
   * @param { string } [opt.passportHeaderColor] - A RGB hex string, formatted
   *     as '#RRGGBB'.
   * @param { string } [opt.frontBackgroundColor] - A RGB hex string, formatted
   *     as '#RRGGBB'.
   * @param { string | null } [opt.frontBackgroundImage] - A path/URL to an
   *     image file.
   * @param { string } [opt.backBackgroundColor] - A RGB hex string, formatted
   *     as '#RRGGBB'.
   * @param { string | null } [opt.backBackgroundImage] - A path/URL to an image
   *     file.
   * @param { string } [opt.mrzBackgroundColor] - A RGB hex string, formatted as
   *     '#RRGGBB'.
   * @param { string | null } [opt.mrzBackgroundImage] - A path/URL to an image
   *     file.
   * @param { string } [opt.logoUnderlayColor] - A RGB hex string, formatted as
   *     '#RRGGBB'.
   * @param { number } [opt.logoUnderlayAlpha] - A number in the range of 0-255.
   * @param { string | null } [opt.logo] - A path/URL to an image file.
   * @param { boolean } [opt.showGuides] - Toggles bleed (red) and safe (blue)
   *     lines on the rendered canvas.
   * @param { boolean } [opt.useDigitalSeal] - Toggles storing a visible digital
   *     seal (VDS) on the barcode in place of a URL.
   * @param { string } [opt.fullAuthority] - The full name of the authority who
   *     issued this document.
   * @param { string } [opt.fullDocumentName] - The full name of this document's
   *     type.
   * @param { string[] } [opt.passportHeader] - The word 'PASSPORT' aside the
   *     logo: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.documentHeader] - Header text for the typeCode
   *     property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.authorityHeader] - Header text for the
   *     authorityCode and subauthority property: ['primary', 'language 1',
   *     'language 2'].
   * @param { string[] } [opt.numberHeader] - Header text for the number
   *     property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.nameHeader] - Header text for the name property:
   *     ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.nationalityHeader] - Header text for the
   *     nationalityCode property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.dateOfBirthHeader] - Header text for the birthDate
   *     property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.genderHeader] - Header text for the genderMarker
   *     property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.placeOfBirthHeader] - Header text for the
   *     placeOfBirth property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.issueHeader] - Header text for the issueDate
   *     property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.dateOfExpirationHeader] - Header text for the
   *     expirationDate property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.endorsementsHeader] - Header text for the
   *     endorsements property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.signatureHeader] - Header text for the signature
   *     property: ['primary', 'language 1', 'language 2'].
   * @param { FontFaceSet } [opt.fonts] - A `FontFaceSet`, like the one
   *     available from `window.document`.
   */
  constructor(opt) {
    this.barcodeDarkColor = opt?.barcodeDarkColor ?? BARCODE_DARK_COLOR;
    this.barcodeLightColor = opt?.barcodeLightColor ?? BARCODE_LIGHT_COLOR;
    this.barcodeErrorCorrection = opt?.barcodeErrorCorrection ??
        BARCODE_ERROR_CORRECTION;
    this.headerColor = opt?.headerColor ?? HEADER_COLOR;
    this.textColor = opt?.textColor ?? TEXT_COLOR;
    this.mrzColor = opt?.mrzColor ?? TEXT_COLOR;
    this.passportHeaderColor = opt?.passportHeaderColor ?? "#ffffff";
    this.frontBackgroundColor = opt?.frontBackgroundColor ?? BACKGROUND_COLOR;
    this.frontBackgroundImage = opt?.frontBackgroundImage ?? null;
    this.backBackgroundColor = opt?.backBackgroundColor ?? BACKGROUND_COLOR;
    this.backBackgroundImage = opt?.backBackgroundImage ?? null;
    this.mrzBackgroundColor = opt?.mrzBackgroundColor ?? MRZ_BACKGROUND_COLOR;
    this.mrzBackgroundImage = opt?.mrzBackgroundImage ?? null;
    this.logoUnderlayColor = opt?.logoUnderlayColor ?? HEADER_COLOR;
    this.logoUnderlayAlpha = opt?.logoUnderlayAlpha ?? UNDERLAY_OPACITY;
    this.logo = opt?.logo ?? null;
    this.showGuides = opt?.showGuides ?? false;
    this.useDigitalSeal = opt?.useDigitalSeal ?? false;
    this.fullAuthority = opt?.fullAuthority ?? FULL_AUTHORITY;
    this.fullDocumentName = opt?.fullDocumentName ?? "FURRY EVENTS PASSPORT";
    this.passportHeader = opt?.passportHeader ?? [
      "PASSPORT",
      "PASSEPORT",
      "PASAPORTE"
    ];
    this.documentHeader = opt?.documentHeader ?? [
      "DOCUMENT CODE",
      "CODE DU DOCUMENT",
      "CÓDIGO DEL DOCUMENTO"
    ];
    this.authorityHeader = opt?.authorityHeader ?? [...authorityHeader];
    this.numberHeader = opt?.numberHeader ?? [
      "PASSPORT NUMBER",
      "NUMÉRO DE PASSEPORT",
      "NÚMERO DE PASAPORTE"
    ];
    this.nameHeader = opt?.nameHeader ?? [...nameHeader];
    this.nationalityHeader = opt?.nationalityHeader ?? [...nationalityHeader];
    this.dateOfBirthHeader = opt?.dateOfBirthHeader ?? [...birthDateHeader];
    this.genderHeader = opt?.genderHeader ?? [...genderHeader];
    this.placeOfBirthHeader = opt?.placeOfBirthHeader ?? [
      "PLACE OF BIRTH",
      "LIEU DE NAISSANCE",
      "LUGAR DE NACIMIENTO"
    ];
    this.issueHeader = opt?.issueHeader ?? [
      "DATE OF ISSUE",
      "DATE DE DÉLIVERANCE",
      "FECHA DE EXPEDICIÓN"
    ];
    this.dateOfExpirationHeader = opt?.dateOfExpirationHeader ?? [
      "DATE OF EXPIRATION",
      "DATE D'EXPIRATION",
      "FECHA DE CADUCIDAD"
    ];
    this.endorsementsHeader = opt?.endorsementsHeader ?? [
      "ENDORSEMENTS",
      "MENTIONS SPÉCIALES",
      "ANOTACIONES"
    ];
    this.signatureHeader = opt?.signatureHeader ?? [
      "HOLDER'S SIGNATURE OR USUAL MARK",
      "SIGNATURE DU TITULAIRE OU MARQUE HABITUELLE",
      "FIRMA DEL TITULAR O MARCA HABITUAL"
    ];
    this.fonts = opt?.fonts ?? null;
  }

  /**
   * The RGBA color for the dark (black) areas for the rendered barcode:
   *     '#RRGGBBAA'.
   * @type { string }
   */
  barcodeDarkColor;

  /**
   * The RGBA color for the light (white) areas for the rendered barcode:
   *     '#RRGGBBAA'.
   * @type { string }
   */
  barcodeLightColor;

  /**
   * The error correction level used for generating the barcode: 'L', 'M', 'Q',
   *     or 'H'.
   * @type { string }
   */
  barcodeErrorCorrection;

  /**
   * The RGB color for header text: '#RRGGBB'.
   * @type { string }
   */
  headerColor;

  /**
   * The RGB color for non-header text: '#RRGGBB'.
   * @type { string }
   */
  textColor;

  /**
   * The RGB color for Machine-Readable Zone (MRZ) text: '#RRGGBB'.
   * @type { string }
   */
  mrzColor;

  /**
   * The RGB color for 'PASSPORT' aside the logo: '#RRGGBB'
   * @type { string }
   */
  passportHeaderColor;

  /**
   * The RGB color for the background when no front background image is set:
   *     '#RRGGBB'.
   * @type { string }
   */
  frontBackgroundColor;

  /**
   * A path/URL to an image to use for the front background, or `null` for no
   *     background image.
   * @type { string | null }
   */
  frontBackgroundImage;

  /**
   * The RGB color for the background when no back background image is set:
   *     '#RRGGBB'.
   * @type { string }
   */
  backBackgroundColor;

  /**
   * A path/URL to an image to use for the back background, or `null` for no
   *     background image.
   * @type { string | null }
   */
  backBackgroundImage;

  /**
   * The RGB color for the background when no Machine-Readable Zone (MRZ)
   *     background image is set: '#RRGGBB'.
   * @type { string }
   */
  mrzBackgroundColor;

  /**
   * A path/URL to an image to use for the Machine-Readable Zone (MRZ)
   *     background, or `null` for no background image.
   * @type { string | null }
   */
  mrzBackgroundImage;

  /**
   * The RGB color for the underlay under photo/logo areas: '#RRGGBB'.
   * @type { string }
   */
  logoUnderlayColor;

  /**
   * The opacity of the number underlay color: 0-255.
   * @type { number }
   */
  logoUnderlayAlpha;
  get #logoUnderlayColorWithAlpha() {
    return this.logoUnderlayColor +
        this.logoUnderlayAlpha.toString(16).padStart(2, "0");
  }

  /**
   * A path/URL to an image to use for the logo, or `null` for no logo.
   * @type { string | null }
   */
  logo;

  /**
   * Toggles bleed (red) and safe (blue) lines on the rendered canvas.
   * @type { boolean }
   */
  showGuides;

  /**
   * Toggles storing a visible digital seal (VDS) on the barcode in place of a
   *     URL.
   * @type { boolean }
   */
  useDigitalSeal;

  /**
   * The full name of the authority who issued this document.
   * @type { string }
   */
  fullAuthority;

  /**
   * The full name of this document's type.
   * @type { string }
   */
  fullDocumentName;

  /**
   * The word 'PASSPORT' aside the logo: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  passportHeader;

  /**
   * Header text for the typeCode property: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  documentHeader;

  /**
   * Header text for the authorityCode and subauthority property: ['primary',
   *     'language 1', 'language 2'].
   * @type { string[] }
   */
  authorityHeader;

  /**
   * Header text for the number property: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  numberHeader;

  /**
   * Header text for the name property: ['primary', 'language 1', 'language 2'].
   * @type { string[] }
   */
  nameHeader;

  /**
   * Header text for the nationalityCode property: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  nationalityHeader;

  /**
   * Header text for the birthDate property: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  dateOfBirthHeader;

  /**
   * Header text for the genderMarker property: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  genderHeader;

  /**
   * Header text for the placeOfBirth property: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  placeOfBirthHeader;

  /**
   * Header text for the issueDate property: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  issueHeader;

  /**
   * Header text for the expirationDate property: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  dateOfExpirationHeader;

  /**
   * Header text for the endorsements property: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  endorsementsHeader;

  /**
   * Header text for the signature property: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  signatureHeader;

  /**
   * A `FontFaceSet`, like the one available from `window.document`.
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
    "url('/fonts/OpenSans-Variable.ttf')"
  );
  static #vizBoldFontFace = new FontFace(
    "Open Sans",
    "url('/fonts/OpenSans-Variable.ttf')",
    { weight: "bold" }
  );
  static #vizItalicFontFace = new FontFace(
    "Open Sans",
    "url('/fonts/OpenSans-Italic-Variable.ttf')",
    { style: "italic" }
  );
  static #signatureFontFace = new FontFace(
    "Yellowtail",
    "url('/fonts/Yellowtail-Regular.woff') format('woff')"
  );
  static get #passportHeaderFont() {
    return `bold 24px ${this.#vizFontFace.family}`;
  }
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
    return `148px ${this.#signatureFontFace.family}`;
  }

  // Text constants used in image generation.
  static #headerSeparator = " · ";

  // Coordinates, widths, and heights used in card generation.
  static #photoUnderlayXY = [48, 0];
  static #photoXY = [72, 256];
  static #mrzUnderlayXY = [0, 789];
  static #logoXY = [109, 79];
  static #passportHeaderX = 261;
  static #passportHeaderY = [102, 135, 168];
  static #mrzX = 86;
  static #mrzY = [858, 933];
  static #mrzSpacing = 30.75;
  static #documentX = [
    1072, // Document Header
    1222, // Authority Header
    1476 // Number Header
  ];
  static #documentY = [
    48, // Full Authority Header
    100, // Full Document Header
    136, // Document Header (primary)
    161, // Document Header (I18n 1)
    186, // Document Header (I18n 2)
    213 // Document Data
  ];
  static #dataX = [
    485, // Column 1
    680, // Date of Birth
    937, // Gender Marker
    1083 // Place of Birth
  ];
  static #dataY = [
    256, // Name Header
    283, // Name Data
    332, // Row 2 Header (primary)
    357, // Row 2 Header (I18n 1)
    382, // Row 2 Header (I18n 2)
    409, // Row 2 Data
    458, // Issue Header
    485, // Issue Data
    534, // Authority Header
    561, // Authority Data
    610, // Date of Expiration Header
    637, // Date of Expiration Data
    686, // Endorsement Header
    713 // Endorsement Data
  ];
  static #signatureX = [112, 160];
  static #signatureY = [
    1210, // Signature
    1334, // Signature Line
    1358, // Signature Header (primary)
    1383, // Signature Header (I18n 1)
    1408 // Signature Header (I18n 2)
  ];
  static #cardArea = [1524, 1087];
  static get cutCardArea() { return [1492, 1055]; }
  static get signatureArea() { return [767, 164]; }
  static #bleed = 16;
  static #safe = 48;
  static #photoUnderlayArea = [413, 765];
  static #photoArea = [365, 487];
  static #logoArea = 128;
  static #mrzUnderlayArea = [1524, 298];

  /** Load the fonts used by this renderer. */
  async loadCanvasFonts() {
    this.fonts.add(EventsPassportRenderer.#mrzFontFace);
    this.fonts.add(EventsPassportRenderer.#vizFontFace);
    this.fonts.add(EventsPassportRenderer.#vizBoldFontFace);
    this.fonts.add(EventsPassportRenderer.#vizItalicFontFace);
    this.fonts.add(EventsPassportRenderer.#signatureFontFace);
    await Promise.all([
      EventsPassportRenderer.#mrzFontFace.load(),
      EventsPassportRenderer.#vizFontFace.load(),
      EventsPassportRenderer.#vizBoldFontFace.load(),
      EventsPassportRenderer.#vizItalicFontFace.load(),
      EventsPassportRenderer.#signatureFontFace.load()
    ]);
  }

  /**
   * Generate the front image and return the canvas.
   * @param { EventsPassport } model
   * @param { HTMLCanvasElement } fallback
   */
  async generateCardFront(model, fallback) {
    let canvas;
    if (typeof OffscreenCanvas === "undefined") {
      canvas = fallback;
      canvas.width = EventsPassportRenderer.#cardArea[0];
      canvas.height = EventsPassportRenderer.#cardArea[1];
    } else {
      canvas = new OffscreenCanvas(
        EventsPassportRenderer.#cardArea[0],
        EventsPassportRenderer.#cardArea[1]
      );
    }
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";
    const barcode = this.useDigitalSeal ?
        [{ data: toBase45(model.signedSeal), mode: "alphanumeric" }]
        : model.url;

    const images = await Promise.all([
      this.frontBackgroundImage ?
          loadImageFromURL(this.frontBackgroundImage) : null,
      this.mrzBackgroundImage ?
          loadImageFromURL(this.mrzBackgroundImage) : null,
      loadImageFromURL(model.photo),
      this.logo ? loadImageFromURL(this.logo) : null,
      toQRCanvas(barcode, {
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
      EventsPassportRenderer.#cardArea[0],
      EventsPassportRenderer.#cardArea[1]
    );
    if (images[0]) {
      ctx.drawImage(
        images[0],
        0, 0,
        EventsPassportRenderer.#cardArea[0],
        EventsPassportRenderer.#cardArea[1]
      );
    }
    ctx.fillStyle = this.mrzBackgroundColor;
    ctx.fillRect(
      EventsPassportRenderer.#mrzUnderlayXY[0],
      EventsPassportRenderer.#mrzUnderlayXY[1],
      EventsPassportRenderer.#mrzUnderlayArea[0],
      EventsPassportRenderer.#mrzUnderlayArea[1]
    );
    if (images[1]) {
      ctx.drawImage(
        images[1],
        EventsPassportRenderer.#mrzUnderlayXY[0],
        EventsPassportRenderer.#mrzUnderlayXY[1],
        EventsPassportRenderer.#mrzUnderlayArea[0],
        EventsPassportRenderer.#mrzUnderlayArea[1]
      );
    }
    ctx.fillStyle = this.#logoUnderlayColorWithAlpha;
    ctx.fillRect(
      EventsPassportRenderer.#photoUnderlayXY[0],
      EventsPassportRenderer.#photoUnderlayXY[1],
      EventsPassportRenderer.#photoUnderlayArea[0],
      EventsPassportRenderer.#photoUnderlayArea[1]
    );
    fillAreaWithImage(
      images[2], ctx,
      EventsPassportRenderer.#photoXY[0],
      EventsPassportRenderer.#photoXY[1],
      EventsPassportRenderer.#photoArea[0],
      EventsPassportRenderer.#photoArea[1]
    );
    if (images[3]) {
      fitImageInArea(
        images[3], ctx,
        EventsPassportRenderer.#logoXY[0],
        EventsPassportRenderer.#logoXY[1],
        EventsPassportRenderer.#logoArea,
        EventsPassportRenderer.#logoArea
      );
    }
    ctx.drawImage(
      images[4],
      EventsPassportRenderer.#cardArea[0] - 48 - images[4].width,
      EventsPassportRenderer.#mrzUnderlayXY[1] - 32 - images[4].height
    );

    ctx.fillStyle = this.passportHeaderColor;
    ctx.font = EventsPassportRenderer.#passportHeaderFont;
    this.passportHeader.forEach((line, i) => {
      ctx.fillText(
        line,
        EventsPassportRenderer.#passportHeaderX,
        EventsPassportRenderer.#passportHeaderY[i]
      );
    });

    ctx.fillStyle = this.headerColor;
    ctx.font = EventsPassportRenderer.#mainHeaderFont;
    ctx.fillText(
      this.fullAuthority,
      Math.max(
        EventsPassportRenderer.#documentX[2] -
          ctx.measureText(this.fullAuthority).width,
        EventsPassportRenderer.#dataX[0]
      ),
      EventsPassportRenderer.#documentY[0],
      EventsPassportRenderer.#documentX[2] - EventsPassportRenderer.#dataX[0]
    );
    ctx.font = EventsPassportRenderer.#documentHeaderFont;
    let documentHeaderWidth = ctx.measureText(this.fullDocumentName).width;
    ctx.fillText(
      this.fullDocumentName,
      EventsPassportRenderer.#documentX[2] - documentHeaderWidth,
      EventsPassportRenderer.#documentY[1]
    );
    ctx.font = EventsPassportRenderer.#separatorHeaderFont;
    documentHeaderWidth += ctx.measureText(
      EventsPassportRenderer.#headerSeparator
    ).width;
    ctx.fillText(
      EventsPassportRenderer.#headerSeparator,
      EventsPassportRenderer.#documentX[2] - documentHeaderWidth,
      EventsPassportRenderer.#documentY[1]
    );
    ctx.font = EventsPassportRenderer.#documentHeaderFont;
    documentHeaderWidth += ctx.measureText(
      `${model.typeCode.toUpperCase()}-${model.authorityCode}`
    ).width;
    ctx.fillText(
      `${model.typeCode.toUpperCase()}-${model.authorityCode}`,
      EventsPassportRenderer.#documentX[2] - documentHeaderWidth,
      EventsPassportRenderer.#documentY[1]
    );

    ctx.fillStyle = this.headerColor;
    ctx.font = EventsPassportRenderer.#intlFont;
    const INTL_SEPARATOR_WIDTH = ctx.measureText("/").width;
    ctx.font = EventsPassportRenderer.#headerFont;
    ctx.fillText(
      this.documentHeader[0],
      EventsPassportRenderer.#documentX[0] -
        ctx.measureText(this.documentHeader[0]).width -
        INTL_SEPARATOR_WIDTH,
      EventsPassportRenderer.#documentY[2]
    );
    ctx.fillText(
      this.authorityHeader[0],
      EventsPassportRenderer.#documentX[1] -
        ctx.measureText(this.authorityHeader[0]).width -
        INTL_SEPARATOR_WIDTH,
      EventsPassportRenderer.#documentY[2]
    );
    ctx.fillText(
      this.numberHeader[0],
      EventsPassportRenderer.#documentX[2] -
        ctx.measureText(this.numberHeader[0]).width -
        INTL_SEPARATOR_WIDTH,
      EventsPassportRenderer.#documentY[2]
    );
    ctx.fillText(
      this.nameHeader[0],
      EventsPassportRenderer.#dataX[0],
      EventsPassportRenderer.#dataY[0]
    );
    ctx.fillText(
      this.nationalityHeader[0],
      EventsPassportRenderer.#dataX[0],
      EventsPassportRenderer.#dataY[2]
    );
    ctx.fillText(
      this.dateOfBirthHeader[0],
      EventsPassportRenderer.#dataX[1],
      EventsPassportRenderer.#dataY[2]
    );
    ctx.fillText(
      this.genderHeader[0],
      EventsPassportRenderer.#dataX[2],
      EventsPassportRenderer.#dataY[2]
    );
    ctx.fillText(
      this.placeOfBirthHeader[0],
      EventsPassportRenderer.#dataX[3],
      EventsPassportRenderer.#dataY[2]
    );
    ctx.fillText(
      this.issueHeader[0],
      EventsPassportRenderer.#dataX[0],
      EventsPassportRenderer.#dataY[6]
    );
    ctx.fillText(
      this.authorityHeader[0],
      EventsPassportRenderer.#dataX[0],
      EventsPassportRenderer.#dataY[8]
    );
    ctx.fillText(
      this.dateOfExpirationHeader[0],
      EventsPassportRenderer.#dataX[0],
      EventsPassportRenderer.#dataY[10]
    );
    ctx.fillText(
      this.endorsementsHeader[0],
      EventsPassportRenderer.#dataX[0],
      EventsPassportRenderer.#dataY[12]
    );
    const NAME_WIDTH = EventsPassportRenderer.#dataX[0] +
      ctx.measureText(this.nameHeader[0]).width;
    const NATIONALITY_WIDTH = EventsPassportRenderer.#dataX[0] +
      ctx.measureText(this.nationalityHeader[0]).width;
    const DATE_OF_BIRTH_WIDTH = EventsPassportRenderer.#dataX[1] +
      ctx.measureText(this.dateOfBirthHeader[0]).width;
    const GENDER_WIDTH = EventsPassportRenderer.#dataX[2] +
      ctx.measureText(this.genderHeader[0]).width;
    const PLACE_OF_BIRTH_WIDTH = EventsPassportRenderer.#dataX[3] +
      ctx.measureText(this.placeOfBirthHeader[0]).width;
    const ISSUE_WIDTH = EventsPassportRenderer.#dataX[0] +
      ctx.measureText(this.issueHeader[0]).width;
    const AUTHORITY_WIDTH = EventsPassportRenderer.#dataX[0] +
      ctx.measureText(this.authorityHeader[0]).width;
    const DATE_OF_EXPIRATION_WIDTH = EventsPassportRenderer.#dataX[0] +
      ctx.measureText(this.dateOfExpirationHeader[0]).width;
    const ENDORSEMENTS_WIDTH = EventsPassportRenderer.#dataX[0] +
      ctx.measureText(this.endorsementsHeader[0]).width;
    
    ctx.font = EventsPassportRenderer.#intlFont;
    ctx.fillText(
      "/",
      EventsPassportRenderer.#documentX[0] - INTL_SEPARATOR_WIDTH,
      EventsPassportRenderer.#documentY[2]
    );
    ctx.fillText(
      `${this.documentHeader[1]}/`,
      EventsPassportRenderer.#documentX[0] -
        ctx.measureText(`${this.documentHeader[1]}/`).width,
      EventsPassportRenderer.#documentY[3]
    );
    ctx.fillText(
      this.documentHeader[2],
      EventsPassportRenderer.#documentX[0] -
        ctx.measureText(this.documentHeader[2]).width,
      EventsPassportRenderer.#documentY[4]
    );
    ctx.fillText(
      "/",
      EventsPassportRenderer.#documentX[1] - INTL_SEPARATOR_WIDTH,
      EventsPassportRenderer.#documentY[2]
    );
    ctx.fillText(
      `${this.authorityHeader[1]}/`,
      EventsPassportRenderer.#documentX[1] -
        ctx.measureText(`${this.authorityHeader[1]}/`).width,
      EventsPassportRenderer.#documentY[3]
    );
    ctx.fillText(
      this.authorityHeader[2],
      EventsPassportRenderer.#documentX[1] -
        ctx.measureText(this.authorityHeader[2]).width,
      EventsPassportRenderer.#documentY[4]
    );
    ctx.fillText(
      "/",
      EventsPassportRenderer.#documentX[2] - INTL_SEPARATOR_WIDTH,
      EventsPassportRenderer.#documentY[2]
    );
    ctx.fillText(
      `${this.numberHeader[1]}/`,
      EventsPassportRenderer.#documentX[2] -
        ctx.measureText(`${this.numberHeader[1]}/`).width,
      EventsPassportRenderer.#documentY[3]
    );
    ctx.fillText(
      this.numberHeader[2],
      EventsPassportRenderer.#documentX[2] -
        ctx.measureText(this.numberHeader[2]).width,
      EventsPassportRenderer.#documentY[4]
    );
    ctx.fillText(
      `/ ${this.nameHeader[1]}/ ${this.nameHeader[2]}`,
      NAME_WIDTH,
      EventsPassportRenderer.#dataY[0]
    );
    ctx.fillText("/", NATIONALITY_WIDTH, EventsPassportRenderer.#dataY[2]);
    ctx.fillText(
      `${this.nationalityHeader[1]}/`,
      EventsPassportRenderer.#dataX[0],
      EventsPassportRenderer.#dataY[3]
    );
    ctx.fillText(
      this.nationalityHeader[2],
      EventsPassportRenderer.#dataX[0],
      EventsPassportRenderer.#dataY[4]
    );
    ctx.fillText("/", DATE_OF_BIRTH_WIDTH, EventsPassportRenderer.#dataY[2]);
    ctx.fillText(
      `${this.dateOfBirthHeader[1]}/`,
      EventsPassportRenderer.#dataX[1],
      EventsPassportRenderer.#dataY[3]
    );
    ctx.fillText(
      this.dateOfBirthHeader[2],
      EventsPassportRenderer.#dataX[1],
      EventsPassportRenderer.#dataY[4]
    );
    ctx.fillText("/", GENDER_WIDTH, EventsPassportRenderer.#dataY[2]);
    ctx.fillText(
      `${this.genderHeader[1]}/`,
      EventsPassportRenderer.#dataX[2],
      EventsPassportRenderer.#dataY[3]
    );
    ctx.fillText(
      this.genderHeader[2],
      EventsPassportRenderer.#dataX[2],
      EventsPassportRenderer.#dataY[4]
    );
    ctx.fillText("/", PLACE_OF_BIRTH_WIDTH, EventsPassportRenderer.#dataY[2]);
    ctx.fillText(
      `${this.placeOfBirthHeader[1]}/`,
      EventsPassportRenderer.#dataX[3],
      EventsPassportRenderer.#dataY[3]
    );
    ctx.fillText(
      this.placeOfBirthHeader[2],
      EventsPassportRenderer.#dataX[3],
      EventsPassportRenderer.#dataY[4]
    );
    ctx.fillText(
      `/ ${this.issueHeader[1]}/ ${this.issueHeader[2]}`,
      ISSUE_WIDTH,
      EventsPassportRenderer.#dataY[6]
    );
    ctx.fillText(
      `/ ${this.authorityHeader[1]}/ ${this.authorityHeader[2]}`,
      AUTHORITY_WIDTH,
      EventsPassportRenderer.#dataY[8]
    );
    ctx.fillText(
      `/ ${this.dateOfExpirationHeader[1]}/ ${this.dateOfExpirationHeader[2]}`,
      DATE_OF_EXPIRATION_WIDTH,
      EventsPassportRenderer.#dataY[10]
    );
    ctx.fillText(
      `/ ${this.endorsementsHeader[1]}/ ${this.endorsementsHeader[2]}`,
      ENDORSEMENTS_WIDTH,
      EventsPassportRenderer.#dataY[12]
    );

    ctx.fillStyle = this.textColor;
    ctx.font = EventsPassportRenderer.#dataFont;
    ctx.fillText(
      model.typeCode.toUpperCase(),
      EventsPassportRenderer.#documentX[0] -
        ctx.measureText(model.typeCode.toUpperCase()).width,
      EventsPassportRenderer.#documentY[5]
    );
    ctx.fillText(
      model.authorityCode,
      EventsPassportRenderer.#documentX[1] -
        ctx.measureText(model.authorityCode).width,
      EventsPassportRenderer.#documentY[5]
    );
    ctx.fillText(
      model.number.toUpperCase(),
      EventsPassportRenderer.#documentX[2] -
        ctx.measureText(model.number.toUpperCase()).width,
      EventsPassportRenderer.#documentY[5]
    );
    ctx.fillText(
      model.fullName.toUpperCase(),
      EventsPassportRenderer.#dataX[0],
      EventsPassportRenderer.#dataY[1],
      EventsPassportRenderer.#documentX[2] - EventsPassportRenderer.#dataX[0]
    );
    ctx.fillText(
      model.nationalityCode,
      EventsPassportRenderer.#dataX[0],
      EventsPassportRenderer.#dataY[5]
    );
    ctx.fillText(
      dateToVIZ(model.birthDate),
      EventsPassportRenderer.#dataX[1],
      EventsPassportRenderer.#dataY[5]
    );
    ctx.fillText(
      model.genderMarker,
      EventsPassportRenderer.#dataX[2],
      EventsPassportRenderer.#dataY[5]
    );
    ctx.fillText(
      model.placeOfBirth.toUpperCase(),
      EventsPassportRenderer.#dataX[3],
      EventsPassportRenderer.#dataY[5]
    );
    ctx.fillText(
      dateToVIZ(model.issueDate),
      EventsPassportRenderer.#dataX[0],
      EventsPassportRenderer.#dataY[7]
    );
    ctx.fillText(
      model.subauthority.toUpperCase(),
      EventsPassportRenderer.#dataX[0],
      EventsPassportRenderer.#dataY[9],
      EventsPassportRenderer.#cardArea[0] - 48 - images[4].width -
        EventsPassportRenderer.#dataX[0] - 32
    );
    ctx.fillText(
      dateToVIZ(model.expirationDate),
      EventsPassportRenderer.#dataX[0],
      EventsPassportRenderer.#dataY[11]
    );
    ctx.fillText(
      model.endorsements.toUpperCase(),
      EventsPassportRenderer.#dataX[0],
      EventsPassportRenderer.#dataY[13],
      EventsPassportRenderer.#cardArea[0] - 48 - images[4].width -
        EventsPassportRenderer.#dataX[0] - 32
    );

    ctx.fillStyle = this.mrzColor;
    ctx.font = EventsPassportRenderer.#mrzFont;
    [...model.machineReadableZone].forEach((character, i) => {
      ctx.fillText(
        character,
        EventsPassportRenderer.#mrzX +
            ((i % TD3_MRZ_LINE_LENGTH) * EventsPassportRenderer.#mrzSpacing),
        EventsPassportRenderer.#mrzY[Math.floor(i / TD3_MRZ_LINE_LENGTH)]
      );
    });

    if (this.showGuides) {
      drawBleedAndSafeLines(
        ctx,
        EventsPassportRenderer.#cardArea,
        EventsPassportRenderer.#bleed,
        EventsPassportRenderer.#safe
      );
    }

    return canvas;
  }

  /**
   * Generate the back image and return the canvas.
   * @param { EventsPassport } model
   * @param { HTMLCanvasElement } fallback
   */
  async generateCardBack(model, fallback) {
    let canvas;
    if (typeof OffscreenCanvas === "undefined") {
      canvas = fallback;
      canvas.width = EventsPassportRenderer.#cardArea[0];
      canvas.height = EventsPassportRenderer.#cardArea[1];
    }
    else {
      canvas = new OffscreenCanvas(
        EventsPassportRenderer.#cardArea[0],
        EventsPassportRenderer.#cardArea[1]
      );
    }
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";

    const images = await Promise.all([
      this.backBackgroundImage ?
          loadImageFromURL(this.backBackgroundImage) : null,
      typeof model.signatureImage !== typeof canvas ?
          loadImageFromURL(model.signatureImage) : null
    ]);

    ctx.fillStyle = this.backBackgroundColor;
    ctx.fillRect(
      0, 0,
      EventsPassportRenderer.#cardArea[0],
      EventsPassportRenderer.#cardArea[1]
    );
    if (images[0]) {
      ctx.drawImage(
        images[0],
        0, 0,
        EventsPassportRenderer.#cardArea[0],
        EventsPassportRenderer.#cardArea[1]
      );
    }

    ctx.translate(EventsPassportRenderer.#cardArea[0], 0);
    ctx.rotate(90 * Math.PI / 180);

    ctx.strokeStyle = this.headerColor;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(
      EventsPassportRenderer.#signatureX[0],
      EventsPassportRenderer.#signatureY[1]
    );
    ctx.lineTo(
      EventsPassportRenderer.#cardArea[1] -
          EventsPassportRenderer.#signatureX[0],
      EventsPassportRenderer.#signatureY[1]
    );
    ctx.stroke();

    ctx.font = EventsPassportRenderer.#headerFont;
    ctx.fillStyle = this.headerColor;
    ctx.fillText(
      this.signatureHeader[0],
      EventsPassportRenderer.#signatureX[0],
      EventsPassportRenderer.#signatureY[2]
    );
    const SIGNATURE_WIDTH = ctx.measureText(this.signatureHeader[0]).width
    ctx.font = EventsPassportRenderer.#intlFont;
    ctx.fillText(
      "/",
      EventsPassportRenderer.#signatureX[0] + SIGNATURE_WIDTH,
      EventsPassportRenderer.#signatureY[2]
    );
    ctx.fillText(
      `${this.signatureHeader[1]}/`,
      EventsPassportRenderer.#signatureX[0],
      EventsPassportRenderer.#signatureY[3]
    );
    ctx.fillText(
      this.signatureHeader[2],
      EventsPassportRenderer.#signatureX[0],
      EventsPassportRenderer.#signatureY[4]
    );

    if (images[1]) {
      fitImageInArea(
        images[1], ctx,
        EventsPassportRenderer.#signatureX[1],
        EventsPassportRenderer.#signatureY[0],
        EventsPassportRenderer.signatureArea[0],
        EventsPassportRenderer.signatureArea[1]
      );
    } else {
      ctx.drawImage(
        model.signatureImage,
        EventsPassportRenderer.#signatureX[1],
        EventsPassportRenderer.#signatureY[0],
        EventsPassportRenderer.signatureArea[0],
        EventsPassportRenderer.signatureArea[1]
      );
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (this.showGuides) {
      drawBleedAndSafeLines(
        ctx,
        EventsPassportRenderer.#cardArea,
        EventsPassportRenderer.#bleed,
        EventsPassportRenderer.#safe
      );
    }

    return canvas;
  }
}
