// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

import { EventsMRVA } from "../modules/EventsMRVA.js";
import { encode as toBase45 } from "../modules/base45-ts/base45.js";
import { toCanvas as toQRCanvas } from "../modules/qrcode-lite/qrcode.mjs";
import { loadImageFromURL } from "../modules/utilities/load-image-from-url.js";
import { fitImageInArea } from "../modules/utilities/fit-image-in-area.js";
import { fillAreaWithImage } from "../modules/utilities/fill-area-with-image.js";
import { drawBleedAndSafeLines } from "../modules/utilities/draw-bleed-and-safe-lines.js";
import { BACKGROUND_COLOR, BARCODE_DARK_COLOR, BARCODE_ERROR_CORRECTION, BARCODE_LIGHT_COLOR, FULL_AUTHORITY, HEADER_COLOR, MRZ_BACKGROUND_COLOR, TD3_MRZ_LINE_LENGTH, TEXT_COLOR, UNDERLAY_OPACITY, VISA_NAME, additionalInfoHeader, birthDateHeader, documentNoHeader, genderHeader, nameHeader, nationalityHeader, numberOfEntriesHeader, passportNoHeader, placeOfIssueHeader, validFromHeader, validThruHeader, visaTypeHeader } from "../modules/utilities/renderer-variables.js";

/**
 * `EventsMRVARenderer` takes an `EventsMRVA` object and returns a
 *     `HTMLCanvasElement` or an `OffscreenCanvas` element representation of the
 *     travel document as a machine-readable visa sticker size A (MRV-A).
 * 
 * The renderer generates images appropriate for web use and for print use with
 *     300-dpi printers. A bleed area surrounds the cut and safe areas to allow
 *     borderless printing.
 * 
 * Renderers are scenario-specific and this was created to be used for a demo on
 *     a web page. Ergo, multiple properties are able to be set. In real-world
 *     use less (or no) properties may want to be settable.
 */
class EventsMRVARenderer {
  /**
   * Create an `EventsMRVARenderer`.
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
   * @param { string[] } [opt.additionalInfoHeader] - Header text for the
   *     additionalInfo property: ['primary', 'language 1', 'language 2'].
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
    this.placeOfIssueHeader = opt?.placeOfIssueHeader ?? placeOfIssueHeader;
    this.validFromHeader = opt?.validFromHeader ?? validFromHeader;
    this.validThruHeader = opt?.validThruHeader ?? validThruHeader;
    this.numberOfEntriesHeader = opt?.numberOfEntriesHeader ??
        numberOfEntriesHeader;
    this.numberHeader = opt?.numberHeader ?? documentNoHeader;
    this.typeHeader = opt?.typeHeader ?? visaTypeHeader;
    this.additionalInfoHeader = opt?.additionalInfoHeader ??
        additionalInfoHeader;
    this.nameHeader = opt?.nameHeader ?? nameHeader;
    this.passportNumberHeader = opt?.passportNumberHeader ??
        passportNoHeader;
    this.nationalityHeader = opt?.nationalityHeader ?? nationalityHeader;
    this.dateOfBirthHeader = opt?.dateOfBirthHeader ?? birthDateHeader;
    this.genderHeader = opt?.genderHeader ?? genderHeader;
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
   * Header text for the additionalInfo property: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  additionalInfoHeader;

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
  static #mainHeaderXY = [1417, 48];
  static #documentHeaderXY = [1417, 92];
  static #photoUnderlayXY = [48, 0];
  static #photoXY = [72, 267];
  static #mrzUnderlayXY = [0, 695];
  static #logoXY = [72, 48];
  static #mrzX = 56;
  static #mrzY = [764, 839];
  static #mrzSpacing = 30.75;
  static #documentX = [
    415, // Place of issue
    688, // Valid from
    959, // Valid thru
    1223 // Number of entries
  ];
  static #documentY = [
    141, // Row 1 header (primary)
    166, // Row 1 header (I18n 1)
    191, // Row 1 header (I18n 2)
    218, // Row 1 data
    267, // Row 2 header
    294, // Row 2 data
    343, // Additional information header
    370, // Additional information data line 1
  ];
  static #passportX = [
    415, // Nationality header
    588, // Date of birth header
    824 // Gender header
  ];
  static #passportY = [
    419, // Name header
    446, // Name data
    495, // Passport header
    522, // Passport data
    571, // Row 3 header (primary)
    596, // Row 3 header (I18n 1)
    621, // Row 3 header (I18n 2)
    648 // Row 3 data
  ];
  static #cardArea = [1465, 993];
  static get cutCardArea() { return [1433, 961]; }
  static get signatureArea() { return 100; }
  static #bleed = 16;
  static #safe = 48;
  static #photoUnderlayArea = [343, 671];
  static #photoArea = [295, 380];
  static #logoArea = [295, 195];
  static #mrzUnderlayArea = [1465, 298];

  /** Load the fonts used by this renderer. */
  async loadCanvasFonts() {
    this.fonts.add(EventsMRVARenderer.#mrzFontFace);
    this.fonts.add(EventsMRVARenderer.#vizFontFace);
    this.fonts.add(EventsMRVARenderer.#vizBoldFontFace);
    this.fonts.add(EventsMRVARenderer.#vizItalicFontFace);
    this.fonts.add(EventsMRVARenderer.#signatureFontFace);
    await Promise.all([
      EventsMRVARenderer.#mrzFontFace.load(),
      EventsMRVARenderer.#vizFontFace.load(),
      EventsMRVARenderer.#vizBoldFontFace.load(),
      EventsMRVARenderer.#vizItalicFontFace.load(),
      EventsMRVARenderer.#signatureFontFace.load()
    ]);
  }

  /**
   * Generate the front image and return the canvas.
   * @param { EventsMRVA } model
   * @param { HTMLCanvasElement } fallback
   */
  async generateCardFront(model, fallback) {
    let canvas;
    if (typeof OffscreenCanvas === "undefined") {
      canvas = fallback;
      canvas.width = EventsMRVARenderer.#cardArea[0];
      canvas.height = EventsMRVARenderer.#cardArea[1];
    } else {
      canvas = new OffscreenCanvas(
        EventsMRVARenderer.#cardArea[0],
        EventsMRVARenderer.#cardArea[1]
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
      EventsMRVARenderer.#cardArea[0],
      EventsMRVARenderer.#cardArea[1]
    );
    if (images[0]) {
      ctx.drawImage(
        images[0],
        0, 0,
        EventsMRVARenderer.#cardArea[0],
        EventsMRVARenderer.#cardArea[1]
      );
    }
    ctx.fillStyle = this.mrzBackgroundColor;
    ctx.fillRect(
      EventsMRVARenderer.#mrzUnderlayXY[0],
      EventsMRVARenderer.#mrzUnderlayXY[1],
      EventsMRVARenderer.#mrzUnderlayArea[0],
      EventsMRVARenderer.#mrzUnderlayArea[1]
    );
    if (images[1]) {
      ctx.drawImage(
        images[1],
        EventsMRVARenderer.#mrzUnderlayXY[0],
        EventsMRVARenderer.#mrzUnderlayXY[1],
        EventsMRVARenderer.#mrzUnderlayArea[0],
        EventsMRVARenderer.#mrzUnderlayArea[1]
      );
    }
    ctx.fillStyle = this.#logoUnderlayColorWithAlpha;
    ctx.fillRect(
      EventsMRVARenderer.#photoUnderlayXY[0],
      EventsMRVARenderer.#photoUnderlayXY[1],
      EventsMRVARenderer.#photoUnderlayArea[0],
      EventsMRVARenderer.#photoUnderlayArea[1]
    );
    fillAreaWithImage(
      images[2], ctx,
      EventsMRVARenderer.#photoXY[0],
      EventsMRVARenderer.#photoXY[1],
      EventsMRVARenderer.#photoArea[0],
      EventsMRVARenderer.#photoArea[1]
    );
    if (images[3]) {
      fitImageInArea(
        images[3], ctx,
        EventsMRVARenderer.#logoXY[0],
        EventsMRVARenderer.#logoXY[1],
        EventsMRVARenderer.#logoArea[0],
        EventsMRVARenderer.#logoArea[1]
      );
    }
    ctx.drawImage(
      images[4],
      EventsMRVARenderer.#cardArea[0] - 48 - images[4].width,
      EventsMRVARenderer.#mrzUnderlayXY[1] - 32 - images[4].height
    );
    
    if (images[5]) {
      fitImageInArea(
        images[5], ctx,
        EventsMRVARenderer.#cardArea[0] - 48 - images[4].width -
          24 - EventsMRVARenderer.signatureArea,
        EventsMRVARenderer.#mrzUnderlayXY[1] - 32 -
          EventsMRVARenderer.signatureArea,
        EventsMRVARenderer.signatureArea,
        EventsMRVARenderer.signatureArea
      );
    } else {
      ctx.drawImage(
        model.signatureImage,
        EventsMRVARenderer.#cardArea[0] - 48 - images[4].width -
          24 - EventsMRVARenderer.signatureArea,
        EventsMRVARenderer.#mrzUnderlayXY[1] - 32 -
          EventsMRVARenderer.signatureArea,
        EventsMRVARenderer.signatureArea,
        EventsMRVARenderer.signatureArea
      );
    }

    ctx.fillStyle = this.headerColor;
    ctx.font = EventsMRVARenderer.#mainHeaderFont;
    ctx.fillText(
      this.fullAuthority,
      Math.max(
        EventsMRVARenderer.#mainHeaderXY[0] -
          ctx.measureText(this.fullAuthority).width,
        EventsMRVARenderer.#documentX[0]
      ),
      EventsMRVARenderer.#mainHeaderXY[1],
      EventsMRVARenderer.#mainHeaderXY[0] - EventsMRVARenderer.#documentX[0]
    );
    ctx.font = EventsMRVARenderer.#documentHeaderFont;
    let documentHeaderWidth = ctx.measureText(this.fullDocumentName).width;
    ctx.fillText(
      this.fullDocumentName,
      EventsMRVARenderer.#documentHeaderXY[0] - documentHeaderWidth,
      EventsMRVARenderer.#documentHeaderXY[1]
    );
    ctx.font = EventsMRVARenderer.#separatorHeaderFont;
    documentHeaderWidth += ctx.measureText(
      EventsMRVARenderer.#headerSeparator
    ).width;
    ctx.fillText(
      EventsMRVARenderer.#headerSeparator,
      EventsMRVARenderer.#documentHeaderXY[0] - documentHeaderWidth,
      EventsMRVARenderer.#documentHeaderXY[1]
    );
    ctx.font = EventsMRVARenderer.#documentHeaderFont;
    documentHeaderWidth += ctx.measureText(
      `${model.typeCode.toVIZ()}-${model.authorityCode.toVIZ()}`
    ).width;
    ctx.fillText(
      `${model.typeCode.toVIZ()}-${model.authorityCode.toVIZ()}`,
      EventsMRVARenderer.#documentHeaderXY[0] - documentHeaderWidth,
      EventsMRVARenderer.#documentHeaderXY[1]
    );

    ctx.fillStyle = this.headerColor;
    ctx.font = EventsMRVARenderer.#headerFont;
    ctx.fillText(
      this.placeOfIssueHeader[0],
      EventsMRVARenderer.#documentX[0],
      EventsMRVARenderer.#documentY[0]
    );
    ctx.fillText(
      this.validFromHeader[0],
      EventsMRVARenderer.#documentX[1],
      EventsMRVARenderer.#documentY[0]
    );
    ctx.fillText(
      this.validThruHeader[0],
      EventsMRVARenderer.#documentX[2],
      EventsMRVARenderer.#documentY[0]
    );
    ctx.fillText(
      this.numberOfEntriesHeader[0],
      EventsMRVARenderer.#documentX[3],
      EventsMRVARenderer.#documentY[0]
    );
    ctx.fillText(
      this.numberHeader[0],
      EventsMRVARenderer.#documentX[0],
      EventsMRVARenderer.#documentY[4]
    );
    ctx.fillText(
      this.typeHeader[0],
      EventsMRVARenderer.#documentX[2],
      EventsMRVARenderer.#documentY[4]
    );
    ctx.fillText(
      this.additionalInfoHeader[0],
      EventsMRVARenderer.#documentX[0],
      EventsMRVARenderer.#documentY[6]
    );
    ctx.fillText(
      this.nameHeader[0],
      EventsMRVARenderer.#passportX[0],
      EventsMRVARenderer.#passportY[0]
    );
    ctx.fillText(
      this.passportNumberHeader[0],
      EventsMRVARenderer.#passportX[0],
      EventsMRVARenderer.#passportY[2]
    );
    ctx.fillText(
      this.nationalityHeader[0],
      EventsMRVARenderer.#passportX[0],
      EventsMRVARenderer.#passportY[4]
    );
    ctx.fillText(
      this.dateOfBirthHeader[0],
      EventsMRVARenderer.#passportX[1],
      EventsMRVARenderer.#passportY[4]
    );
    ctx.fillText(
      this.genderHeader[0],
      EventsMRVARenderer.#passportX[2],
      EventsMRVARenderer.#passportY[4]
    );
    const PLACE_OF_ISSUE_WIDTH = EventsMRVARenderer.#documentX[0] +
      ctx.measureText(this.placeOfIssueHeader[0]).width;
    const VALID_FROM_WIDTH = EventsMRVARenderer.#documentX[1] +
      ctx.measureText(this.validFromHeader[0]).width;
    const VALID_THRU_WIDTH = EventsMRVARenderer.#documentX[2] +
      ctx.measureText(this.validThruHeader[0]).width;
    const NUMBER_OF_ENTRIES_WIDTH = EventsMRVARenderer.#documentX[3] +
      ctx.measureText(this.numberOfEntriesHeader[0]).width;
    const NUMBER_WIDTH = EventsMRVARenderer.#documentX[0] +
      ctx.measureText(this.numberHeader[0]).width;
    const TYPE_WIDTH = EventsMRVARenderer.#documentX[2] +
      ctx.measureText(this.typeHeader[0]).width;
    const ADDITIONAL_INFO_WIDTH = EventsMRVARenderer.#documentX[0] +
      ctx.measureText(this.additionalInfoHeader[0]).width;
    const NAME_WIDTH = EventsMRVARenderer.#passportX[0] +
      ctx.measureText(this.nameHeader[0]).width;
    const PASSPORT_NUMBER_WIDTH = EventsMRVARenderer.#passportX[0] +
      ctx.measureText(this.passportNumberHeader[0]).width;
    const NATIONALITY_WIDTH = EventsMRVARenderer.#passportX[0] +
      ctx.measureText(this.nationalityHeader[0]).width;
    const DATE_OF_BIRTH_WIDTH = EventsMRVARenderer.#passportX[1] +
      ctx.measureText(this.dateOfBirthHeader[0]).width;
    const GENDER_WIDTH = EventsMRVARenderer.#passportX[2] +
      ctx.measureText(this.genderHeader[0]).width;
    
    ctx.font = EventsMRVARenderer.#intlFont;
    ctx.fillText(
      "/",
      PLACE_OF_ISSUE_WIDTH,
      EventsMRVARenderer.#documentY[0]
    );
    ctx.fillText(
      `${this.placeOfIssueHeader[1]}/`,
      EventsMRVARenderer.#documentX[0],
      EventsMRVARenderer.#documentY[1]
    );
    ctx.fillText(
      this.placeOfIssueHeader[2],
      EventsMRVARenderer.#documentX[0],
      EventsMRVARenderer.#documentY[2]
    );
    ctx.fillText(
      "/",
      VALID_FROM_WIDTH,
      EventsMRVARenderer.#documentY[0]
    );
    ctx.fillText(
      `${this.validFromHeader[1]}/`,
      EventsMRVARenderer.#documentX[1],
      EventsMRVARenderer.#documentY[1]
    );
    ctx.fillText(
      this.validFromHeader[2],
      EventsMRVARenderer.#documentX[1],
      EventsMRVARenderer.#documentY[2]
    );
    ctx.fillText(
      "/",
      VALID_THRU_WIDTH,
      EventsMRVARenderer.#documentY[0]
    );
    ctx.fillText(
      `${this.validThruHeader[1]}/`,
      EventsMRVARenderer.#documentX[2],
      EventsMRVARenderer.#documentY[1]
    );
    ctx.fillText(
      this.validThruHeader[2],
      EventsMRVARenderer.#documentX[2],
      EventsMRVARenderer.#documentY[2]
    );
    ctx.fillText(
      "/",
      NUMBER_OF_ENTRIES_WIDTH,
      EventsMRVARenderer.#documentY[0],
    );
    ctx.fillText(
      `${this.numberOfEntriesHeader[1]}/`,
      EventsMRVARenderer.#documentX[3],
      EventsMRVARenderer.#documentY[1]
    );
    ctx.fillText(
      this.numberOfEntriesHeader[2],
      EventsMRVARenderer.#documentX[3],
      EventsMRVARenderer.#documentY[2]
    );
    ctx.fillText(
      `/ ${this.numberHeader[1]}/ ${this.numberHeader[2]}`,
      NUMBER_WIDTH,
      EventsMRVARenderer.#documentY[4]
    );
    ctx.fillText(
      `/ ${this.typeHeader[1]}/ ${this.typeHeader[2]}`,
      TYPE_WIDTH,
      EventsMRVARenderer.#documentY[4]
    );
    ctx.fillText(
      `/ ${this.additionalInfoHeader[1]}/ ${this.additionalInfoHeader[2]}`,
      ADDITIONAL_INFO_WIDTH,
      EventsMRVARenderer.#documentY[6]
    );
    ctx.fillText(
      `/ ${this.nameHeader[1]}/ ${this.nameHeader[2]}`,
      NAME_WIDTH,
      EventsMRVARenderer.#passportY[0]
    );
    ctx.fillText(
      `/ ${this.passportNumberHeader[1]}/ ${this.passportNumberHeader[2]}`,
      PASSPORT_NUMBER_WIDTH,
      EventsMRVARenderer.#passportY[2]
    );
    ctx.fillText(
      "/",
      NATIONALITY_WIDTH,
      EventsMRVARenderer.#passportY[4]
    );
    ctx.fillText(
      `${this.nationalityHeader[1]}/`,
      EventsMRVARenderer.#passportX[0],
      EventsMRVARenderer.#passportY[5]
    );
    ctx.fillText(
      this.nationalityHeader[2],
      EventsMRVARenderer.#passportX[0],
      EventsMRVARenderer.#passportY[6]
    );
    ctx.fillText(
      "/",
      DATE_OF_BIRTH_WIDTH,
      EventsMRVARenderer.#passportY[4]
    );
    ctx.fillText(
      `${this.dateOfBirthHeader[1]}/`,
      EventsMRVARenderer.#passportX[1],
      EventsMRVARenderer.#passportY[5]
    );
    ctx.fillText(
      this.dateOfBirthHeader[2],
      EventsMRVARenderer.#passportX[1],
      EventsMRVARenderer.#passportY[6]
    );
    ctx.fillText(
      "/",
      GENDER_WIDTH,
      EventsMRVARenderer.#passportY[4]
    );
    ctx.fillText(
      `${this.genderHeader[1]}/`,
      EventsMRVARenderer.#passportX[2],
      EventsMRVARenderer.#passportY[5]
    );
    ctx.fillText(
      this.genderHeader[2],
      EventsMRVARenderer.#passportX[2],
      EventsMRVARenderer.#passportY[6]
    );

    ctx.fillStyle = this.textColor;
    ctx.font = EventsMRVARenderer.#dataFont;
    ctx.fillText(
      model.placeOfIssue.toVIZ(),
      EventsMRVARenderer.#documentX[0],
      EventsMRVARenderer.#documentY[3]
    );
    ctx.fillText(
      model.validFrom.toVIZ(),
      EventsMRVARenderer.#documentX[1],
      EventsMRVARenderer.#documentY[3]
    );
    ctx.fillText(
      model.validThru.toVIZ(),
      EventsMRVARenderer.#documentX[2],
      EventsMRVARenderer.#documentY[3]
    );
    ctx.fillText(
      model.numberOfEntries.toVIZ(),
      EventsMRVARenderer.#documentX[3],
      EventsMRVARenderer.#documentY[3]
    );
    ctx.fillText(
      model.number.toVIZ(),
      EventsMRVARenderer.#documentX[0],
      EventsMRVARenderer.#documentY[5]
    );
    ctx.fillText(
      model.visaType.toVIZ(),
      EventsMRVARenderer.#documentX[2],
      EventsMRVARenderer.#documentY[5]
    );
    ctx.fillText(
      model.additionalInfo.toVIZ(),
      EventsMRVARenderer.#documentX[0],
      EventsMRVARenderer.#documentY[7]
    );
    ctx.fillText(
      model.fullName.toVIZ(),
      EventsMRVARenderer.#passportX[0],
      EventsMRVARenderer.#passportY[1]
    );
    ctx.fillText(
      model.passportNumber.toVIZ(),
      EventsMRVARenderer.#passportX[0],
      EventsMRVARenderer.#passportY[3]
    );
    ctx.fillText(
      model.nationalityCode.toVIZ(),
      EventsMRVARenderer.#passportX[0],
      EventsMRVARenderer.#passportY[7]
    );
    ctx.fillText(
      model.birthDate.toVIZ(),
      EventsMRVARenderer.#passportX[1],
      EventsMRVARenderer.#passportY[7]
    );
    ctx.fillText(
      model.genderMarker.toVIZ(),
      EventsMRVARenderer.#passportX[2],
      EventsMRVARenderer.#passportY[7]
    );

    ctx.fillStyle = this.mrzColor;
    ctx.font = EventsMRVARenderer.#mrzFont;
    [...model.machineReadableZone].forEach((character, i) => {
      ctx.fillText(
        character,
        EventsMRVARenderer.#mrzX +
            ((i % TD3_MRZ_LINE_LENGTH) * EventsMRVARenderer.#mrzSpacing),
        EventsMRVARenderer.#mrzY[Math.floor(i / TD3_MRZ_LINE_LENGTH)]
      );
    });

    if (this.showGuides) {
      drawBleedAndSafeLines(
        ctx,
        EventsMRVARenderer.#cardArea,
        EventsMRVARenderer.#bleed,
        EventsMRVARenderer.#safe
      );
    }

    return canvas;
  }
}

export { EventsMRVARenderer };
