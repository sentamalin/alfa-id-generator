// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

import { EventsMRVB } from "./eventsmrvb.js";
import { encode as toBase45 } from "./base45-ts/base45.js";
import { toCanvas as toQRCanvas } from "./qrcode-lite/qrcode.mjs";
import { loadImageFromURL } from "./utilities/load-image-from-url.js";
import { fitImageInArea } from "./utilities/fit-image-in-area.js";
import { fillAreaWithImage } from "./utilities/fill-area-with-image.js";
import { drawBleedAndSafeLines } from "./utilities/draw-bleed-and-safe-lines.js";
import { dateToVIZ } from "./utilities/date-to-viz.js";
import { BACKGROUND_COLOR, BARCODE_DARK_COLOR, BARCODE_ERROR_CORRECTION, BARCODE_LIGHT_COLOR, FULL_AUTHORITY, HEADER_COLOR, MRZ_BACKGROUND_COLOR, TD2_MRZ_LINE_LENGTH, TEXT_COLOR, UNDERLAY_OPACITY, VISA_NAME, birthDateHeader, documentNoHeader, genderHeader, nameHeader, nationalityHeader, numberOfEntriesHeader, passportNoHeader, placeOfIssueHeader, validFromHeader, validThruHeader, visaTypeHeader } from "./utilities/renderer-variables.js";

/**
 * `EventsMRVBRenderer` takes an `EventsMRVB` object and returns a
 *     `HTMLCanvasElement` or an `OffscreenCanvas` element representation of the
 *     travel document as a machine-readable visa sticker size B (MRV-B).
 * 
 * The renderer generates images appropriate for web use and for print use with
 *     300-dpi printers. A bleed area surrounds the cut and safe areas to allow
 *     borderless printing.
 * 
 * Renderers are scenario-specific and this was created to be used for a demo on
 *     a web page. Ergo, multiple properties are able to be set. In real-world
 *     use less (or no) properties may want to be settable.
 */
export class EventsMRVBRenderer {
  /**
   * Create an `EventsMRVBRenderer`.
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
   * @param { string } [opt.frontBackgroundColor] - A RGB hex string, formatted
   *     as '#RRGGBB'.
   * @param { string | null } [opt.frontBackgroundImage] - A path/URL to an
   *     image file.
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
   *     issued this visa.
   * @param { string } [opt.fullDocumentName] - The full name of this visa type.
   * @param { string[] } [opt.placeOfIssueHeader] - Header text for the
   *     placeOfIssue property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.validFromHeader] - Header text for the validFrom
   *     property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.validThruHeader] - Header text for the validThru
   *     property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.numberOfEntriesHeader] - Header text for the
   *     numberOfEntries property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.numberHeader] - Header text for the number
   *     property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.typeHeader] - Header text for the visaType
   *     property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.nameHeader] - Header text for the name property:
   *     ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.passportNumberHeader] - Header text for the
   *     passportNumber property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.nationalityHeader] - Header text for the
   *     nationalityCode property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.dateOfBirthHeader] - Header text for the birthDate
   *     property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.genderHeader] - Header text for the genderMarker
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
    this.frontBackgroundColor = opt?.frontBackgroundColor ?? BACKGROUND_COLOR;
    this.frontBackgroundImage = opt?.frontBackgroundImage ?? null;
    this.mrzBackgroundColor = opt?.mrzBackgroundColor ?? MRZ_BACKGROUND_COLOR;
    this.mrzBackgroundImage = opt?.mrzBackgroundImage ?? null;
    this.logoUnderlayColor = opt?.logoUnderlayColor ?? HEADER_COLOR;
    this.logoUnderlayAlpha = opt?.logoUnderlayAlpha ?? UNDERLAY_OPACITY;
    this.logo = opt?.logo ?? null;
    this.showGuides = opt?.showGuides ?? false;
    this.useDigitalSeal = opt?.useDigitalSeal ?? false;
    this.fullAuthority = opt?.fullAuthority ?? FULL_AUTHORITY;
    this.fullDocumentName = opt?.fullDocumentName ?? VISA_NAME;
    this.placeOfIssueHeader = opt?.placeOfIssueHeader ??
        [...placeOfIssueHeader];
    this.validFromHeader = opt?.validFromHeader ?? [...validFromHeader];
    this.validThruHeader = opt?.validThruHeader ?? [...validThruHeader];
    this.numberOfEntriesHeader = opt?.numberOfEntriesHeader ??
        [...numberOfEntriesHeader];
    this.numberHeader = opt?.numberHeader ?? [...documentNoHeader];
    this.typeHeader = opt?.typeHeader ?? [...visaTypeHeader];
    this.nameHeader = opt?.nameHeader ?? [...nameHeader];
    this.passportNumberHeader = opt?.passportNumberHeader ??
        [...passportNoHeader];
    this.nationalityHeader = opt?.nationalityHeader ?? [...nationalityHeader];
    this.dateOfBirthHeader = opt?.dateOfBirthHeader ?? [...birthDateHeader];
    this.genderHeader = opt?.genderHeader ?? [...genderHeader];
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
   * The full name of the authority who issued this visa.
   * @type { string }
   */
  fullAuthority;

  /**
   * The full name of this visa type.
   * @type { string }
   */
  fullDocumentName;

  /**
   * Header text for the placeOfIssue property: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  placeOfIssueHeader;

  /**
   * Header text for the validFrom property: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  validFromHeader;

  /**
   * Header text for the validThru property: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  validThruHeader;

  /**
   * Header text for the numberOfEntries property: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  numberOfEntriesHeader;

  /**
   * Header text for the number property: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  numberHeader;

  /**
   * Header text for the visaType property: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  typeHeader;

  /**
   * Header text for the name property: ['primary', 'language 1', 'language 2'].
   * @type { string[] }
   */
  nameHeader;

  /**
   * Header text for the passportNumber property: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  passportNumberHeader;

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

  /**
   * Generate the front image and return the canvas.
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
      }),
      typeof model.signatureImage !== typeof canvas ?
          loadImageFromURL(model.signatureImage) : null
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
        model.signatureImage,
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
    documentHeaderWidth += ctx.measureText(
      EventsMRVBRenderer.#headerSeparator
    ).width;
    ctx.fillText(
      EventsMRVBRenderer.#headerSeparator,
      EventsMRVBRenderer.#documentHeaderXY[0] - documentHeaderWidth,
      EventsMRVBRenderer.#documentHeaderXY[1]
    );
    ctx.font = EventsMRVBRenderer.#documentHeaderFont;
    documentHeaderWidth += ctx.measureText(
      `${model.typeCode.toUpperCase()}-${model.authorityCode.toUpperCase()}`
    ).width;
    ctx.fillText(
      `${model.typeCode.toUpperCase()}-${model.authorityCode.toUpperCase()}`,
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
    const PLACE_OF_ISSUE_WIDTH = EventsMRVBRenderer.#documentX[0] +
      ctx.measureText(this.placeOfIssueHeader[0]).width;
    const VALID_FROM_WIDTH = EventsMRVBRenderer.#documentX[1] +
      ctx.measureText(this.validFromHeader[0]).width;
    const VALID_THRU_WIDTH = EventsMRVBRenderer.#documentX[2] +
      ctx.measureText(this.validThruHeader[0]).width;
    const NUMBER_OF_ENTRIES_WIDTH = EventsMRVBRenderer.#documentX[3] +
      ctx.measureText(this.numberOfEntriesHeader[0]).width;
    const NUMBER_WIDTH = EventsMRVBRenderer.#documentX[0] +
      ctx.measureText(this.numberHeader[0]).width;
    const TYPE_WIDTH = EventsMRVBRenderer.#documentX[2] +
      ctx.measureText(this.typeHeader[0]).width;
    const NAME_WIDTH = EventsMRVBRenderer.#passportX[0] +
      ctx.measureText(this.nameHeader[0]).width;
    const PASSPORT_NUMBER_WIDTH = EventsMRVBRenderer.#passportX[0] +
      ctx.measureText(this.passportNumberHeader[0]).width;
    const NATIONALITY_WIDTH = EventsMRVBRenderer.#passportX[0] +
      ctx.measureText(this.nationalityHeader[0]).width;
    const DATE_OF_BIRTH_WIDTH = EventsMRVBRenderer.#passportX[1] +
      ctx.measureText(this.dateOfBirthHeader[0]).width;
    const GENDER_WIDTH = EventsMRVBRenderer.#passportX[2] +
      ctx.measureText(this.genderHeader[0]).width;
    
    ctx.font = EventsMRVBRenderer.#intlFont;
    ctx.fillText(
      "/",
      PLACE_OF_ISSUE_WIDTH,
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
      VALID_FROM_WIDTH,
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
      VALID_THRU_WIDTH,
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
      NUMBER_OF_ENTRIES_WIDTH,
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
      NUMBER_WIDTH,
      EventsMRVBRenderer.#documentY[4]
    );
    ctx.fillText(
      `/ ${this.typeHeader[1]}/ ${this.typeHeader[2]}`,
      TYPE_WIDTH,
      EventsMRVBRenderer.#documentY[4]
    );
    ctx.fillText(
      `/ ${this.nameHeader[1]}/ ${this.nameHeader[2]}`,
      NAME_WIDTH,
      EventsMRVBRenderer.#passportY[0]
    );
    ctx.fillText(
      `/ ${this.passportNumberHeader[1]}/ ${this.passportNumberHeader[2]}`,
      PASSPORT_NUMBER_WIDTH,
      EventsMRVBRenderer.#passportY[2]
    );
    ctx.fillText(
      "/",
      NATIONALITY_WIDTH,
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
      DATE_OF_BIRTH_WIDTH,
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
      GENDER_WIDTH,
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
      model.placeOfIssue.toUpperCase(),
      EventsMRVBRenderer.#documentX[0],
      EventsMRVBRenderer.#documentY[3]
    );
    ctx.fillText(
      dateToVIZ(model.validFrom),
      EventsMRVBRenderer.#documentX[1],
      EventsMRVBRenderer.#documentY[3]
    );
    ctx.fillText(
      dateToVIZ(model.validThru),
      EventsMRVBRenderer.#documentX[2],
      EventsMRVBRenderer.#documentY[3]
    );
    ctx.fillText(
      model.numberOfEntries.toUpperCase(),
      EventsMRVBRenderer.#documentX[3],
      EventsMRVBRenderer.#documentY[3]
    );
    ctx.fillText(
      model.number.toUpperCase(),
      EventsMRVBRenderer.#documentX[0],
      EventsMRVBRenderer.#documentY[5]
    );
    ctx.fillText(
      model.visaType.toUpperCase(),
      EventsMRVBRenderer.#documentX[2],
      EventsMRVBRenderer.#documentY[5]
    );
    ctx.fillText(
      model.fullName.toUpperCase(),
      EventsMRVBRenderer.#passportX[0],
      EventsMRVBRenderer.#passportY[1]
    );
    ctx.fillText(
      model.passportNumber.toUpperCase(),
      EventsMRVBRenderer.#passportX[0],
      EventsMRVBRenderer.#passportY[3]
    );
    ctx.fillText(
      model.nationalityCode,
      EventsMRVBRenderer.#passportX[0],
      EventsMRVBRenderer.#passportY[7]
    );
    ctx.fillText(
      dateToVIZ(model.birthDate),
      EventsMRVBRenderer.#passportX[1],
      EventsMRVBRenderer.#passportY[7]
    );
    ctx.fillText(
      model.genderMarker,
      EventsMRVBRenderer.#passportX[2],
      EventsMRVBRenderer.#passportY[7]
    );

    ctx.fillStyle = this.mrzColor;
    ctx.font = EventsMRVBRenderer.#mrzFont;
    [...model.machineReadableZone].forEach((character, i) => {
      ctx.fillText(
        character,
        EventsMRVBRenderer.#mrzX +
            ((i % TD2_MRZ_LINE_LENGTH) * EventsMRVBRenderer.#mrzSpacing),
        EventsMRVBRenderer.#mrzY[Math.floor(i / TD2_MRZ_LINE_LENGTH)]
      );
    });

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
