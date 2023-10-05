// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

import { CrewID } from "../modules/CrewID.js";
import { encode as toBase45 } from "../modules/base45-ts/base45.js";
import { toCanvas as toQRCanvas } from "../modules/qrcode-lite/qrcode.mjs";
import { loadImageFromURL } from "../modules/utilities/load-image-from-url.js";
import { fitImageInArea } from "../modules/utilities/fit-image-in-area.js";
import { fillAreaWithImage } from "../modules/utilities/fill-area-with-image.js";
import { drawBleedAndSafeLines } from "../modules/utilities/draw-bleed-and-safe-lines.js";
import { BACKGROUND_COLOR, BARCODE_DARK_COLOR, BARCODE_ERROR_CORRECTION, BARCODE_LIGHT_COLOR, HEADER_COLOR, MRZ_BACKGROUND_COLOR, TD1_MRZ_LINE_LENGTH, TEXT_COLOR, UNDERLAY_OPACITY, employerHeader, expirationDateHeader, nameHeader } from "../modules/utilities/renderer-variables.js";

/**
 * `IDBadgeRenderer` takes a `CrewID` object and returns a `HTMLCanvasElement`
 *     or an `OffscreenCanvas` element representation of the travel document as
 *     a two-sided TD1-sized identification badge.
 * 
 * The renderer generates images appropriate for web use and for print use with
 *     300-dpi printers. A bleed area surrounds the cut and safe areas to allow
 *     borderless printing.
 * 
 * Renderers are scenario-specific and this was created to be used for a demo on
 *     a web page. Ergo, multiple properties are able to be set. In real-world
 *     use less (or no) properties may want to be settable.
 */
class IDBadgeRenderer {
  /**
   * Create an `IDBadgeRenderer`.
   * @param { Object } [opt] - An options object.
   * @param { string } [opt.barcodeDarkColor] - A RGBA hex string, formatted as
   *     '#RRGGBBAA'.
   * @param { string } [opt.barcodeLightColor] - A RGBA hex string, formatted as
   *     '#RRGGBBAA'.
   * @param { string } [opt.frontBarcodeErrorCorrection] - The character 'L',
   *     'M', 'Q', or 'H'.
   * @param { string } [opt.backBarcodeErrorCorrection] - The character 'L',
   *     'M', 'Q', or 'H'.
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
   * @param { string } [opt.backBackgroundColor] - A RGB hex string, formatted
   *     as '#RRGGBB'.
   * @param { string | null } [opt.backBackgroundImage] - A path/URL to an image
   *     file.
   * @param { string } [opt.mrzBackgroundColor] - A RGB hex string, formatted as
   *     '#RRGGBB'.
   * @param { string | null } [opt.mrzBackgroundImage] - A path/URL to an image
   *     file.
   * @param { string } [opt.numberUnderlayColor] - A RGB hex string, formatted
   *     as '#RRGGBB'.
   * @param { number } [opt.numberUnderlayAlpha] - A number in the range of
   *     0-255.
   * @param { string } [opt.logoUnderlayColor] - A RGB hex string, formatted as
   *     '#RRGGBB'.
   * @param { number } [opt.logoUnderlayAlpha] - A number in the range of 0-255.
   * @param { string | null } [opt.logo] - A path/URL to an image file.
   * @param { string | null } [opt.smallLogo] - A path/URL to an image file.
   * @param { boolean } [opt.showGuides] - Toggles bleed (red) and safe (blue)
   *     lines on the rendered canvas.
   * @param { boolean } [opt.showPunchSlot] - Toggles showing a punch slot on
   *     the rendered canvas.
   * @param { boolean } [opt.useDigitalSeal] - Toggles storing a visible digital
   *     seal (VDS) on the back barcode in place of a URL.
   * @param { string } [opt.additionalElements] - Additional text to display on
   *     the back of the ID badge.
   * @param { string } [opt.badgeType] - The main badge type, displayed
   *     immediately above the front barcode.
   * @param { string } [opt.badgeSubtype] - The badge's subtype, displayed
   *     immediately above the main badge type.
   * @param { string[] } [opt.nameHeader] - Header text for the name property:
   *     ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.employerHeader] - Header text for the employer
   *     property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.numberHeader] - Header text for the document
   *     number property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.dateOfExpirationHeader] - Header text for the date
   *     of expiration property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.additionalElementsHeader] - Header text for the
   *     additional elements property: ['primary', 'language 1', 'language 2'].
   * @param { FontFaceSet } [opt.fonts] - A `FontFaceSet`, like the one
   *     available from `window.document`.
   */
  constructor(opt) {
    this.barcodeDarkColor = opt?.barcodeDarkColor ?? BARCODE_DARK_COLOR;
    this.barcodeLightColor = opt?.barcodeLightColor ?? BARCODE_LIGHT_COLOR;
    this.frontBarcodeErrorCorrection = opt?.frontBarcodeErrorCorrection ?? "L";
    this.backBarcodeErrorCorrection = opt?.backBarcodeErrorCorrection ??
        BARCODE_ERROR_CORRECTION;
    this.headerColor = opt?.headerColor ?? HEADER_COLOR;
    this.textColor = opt?.textColor ?? TEXT_COLOR;
    this.mrzColor = opt?.mrzColor ?? TEXT_COLOR;
    this.frontBackgroundColor = opt?.frontBackgroundColor ?? BACKGROUND_COLOR;
    this.frontBackgroundImage = opt?.frontBackgroundImage ?? null;
    this.backBackgroundColor = opt?.backBackgroundColor ?? BACKGROUND_COLOR;
    this.backBackgroundImage = opt?.backBackgroundImage ?? null;
    this.mrzBackgroundColor = opt?.mrzBackgroundColor ?? MRZ_BACKGROUND_COLOR;
    this.mrzBackgroundImage = opt?.mrzBackgroundImage ?? null;
    this.numberUnderlayColor = opt?.numberUnderlayColor ?? MRZ_BACKGROUND_COLOR;
    this.numberUnderlayAlpha = opt?.numberUnderlayAlpha ?? UNDERLAY_OPACITY;
    this.logoUnderlayColor = opt?.logoUnderlayColor ?? MRZ_BACKGROUND_COLOR;
    this.logoUnderlayAlpha = opt?.logoUnderlayAlpha ?? UNDERLAY_OPACITY;
    this.logo = opt?.logo ?? null;
    this.smallLogo = opt?.smallLogo ?? null;
    this.showGuides = opt?.showGuides ?? false;
    this.showPunchSlot = opt?.showPunchSlot ?? false;
    this.useDigitalSeal = opt?.useDigitalSeal ?? false;
    this.additionalElements = opt?.additionalElements ?? "XXXXXXXXXXXXXXXXXXXX" +
        "XXXXXXXXXXXXXXX\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\nXXXXXXXXXXXXXX" +
        "XXXXXXXXXXXXXXXXXXXXX\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\nXXXXXXXX" +
        "XXXXXXXXXXXXXXXXXXXXXXXXXXX\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\nXX" +
        "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" +
        "XX";
    this.badgeType = opt?.badgeType ?? "CREW";
    this.badgeSubtype = opt?.badgeSubtype ?? "FURRY";
    this.nameHeader = opt?.nameHeader ?? nameHeader;
    this.employerHeader = opt?.employerHeader ?? employerHeader;
    this.numberHeader = opt?.numberHeader ?? [
      "ID NO",
      "NO DU ID",
      "NO DEL ID"
    ];
    this.dateOfExpirationHeader = opt?.dateOfExpirationHeader ??
        expirationDateHeader;
    this.additionalElementsHeader = opt?.additionalElementsHeader ?? [
      "OPTIONAL ADDITIONAL ELEMENTS",
      "ÉLÉMENTS SUPPLÉMENTAIRES FACULTATIFS",
      "ELEMENTOS ADICIONALES OPCIONALES"
    ];
    this.fonts = opt?.fonts ?? null;
  }

  /**
   * The RGBA color for the dark (black) areas for rendered barcodes:
   *     '#RRGGBBAA'.
   * @type { string }
   */
  barcodeDarkColor;

  /**
   * The RGBA color for the light (white) areas for rendered barcodes:
   *     '#RRGGBBAA'.
   * @type { string }
   */
  barcodeLightColor;
  
  /**
   * The error correction level used for generating the front barcode: 'L', 'M',
   *     'Q', or 'H'.
   * @type { string }
   */
  frontBarcodeErrorCorrection;
  
  /**
   * The error correction level used for generating the back barcode: 'L', 'M',
   *     'Q', or 'H'.
   * @type { string }
   */
  backBarcodeErrorCorrection;

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
   * The RGB color for the underlay under the document number on the back of the
   *     card: '#RRGGBB'.
   * @type { string }
   */
  numberUnderlayColor;
  
  /**
   * The opacity of the number underlay color: 0-255.
   * @type { number }
   */
  numberUnderlayAlpha;
  get #numberUnderlayColorWithAlpha() {
    return this.numberUnderlayColor +
      this.numberUnderlayAlpha.toString(16).padStart(2, "0");
  }
  
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
   * A path/URL to an image to use for the small logo, or `null` for no small
   *     logo.
   * @type { string | null }
   */
  smallLogo;
  
  /**
   * Toggles bleed (red) and safe (blue) lines on the rendered canvas.
   * @type { boolean }
   */
  showGuides;
  
  /**
   * Toggles showing a punch slot on the rendered canvas.
   * @type { boolean }
   */
  showPunchSlot;

  /**
   * Toggles storing a visible digital seal (VDS) on the back barcode in place
   *     of a URL.
   * @type { boolean }
   */
  useDigitalSeal;
  
  /**
   * Additional text to display on the back of the ID badge.
   * @type { string }
   */
  additionalElements;
  
  /**
   * The main badge type, displayed immediately above the front barcode.
   * @type { string }
   */
  badgeType;
  
  /**
   * The badge's subtype, displayed immediately above the main badge type.
   * @type { string }
   */
  badgeSubtype;
  
  /**
   * Header text for the name property: ['primary', 'language 1', 'language 2'].
   * @type { string[] }
   */
  nameHeader;
  
  /**
   * Header text for the employer property: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  employerHeader;
  
  /**
   * Header text for the document number property: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  numberHeader;
  
  /**
   * Header text for the date of expiration property: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  dateOfExpirationHeader;
  
  /**
   * Header text for the additional elements property: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  additionalElementsHeader;
  
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
  static get #badgeTypeFont() {
    return `bold 52px ${this.#vizFontFace.family}`;
  }
  static get #badgeSubtypeFont() {
    return `bold 28px ${this.#vizFontFace.family}`;
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

  // Text constants used in image generation.
  static #headerSeparator = " · ";
  static #documentSize = "TD1";

  // Coordinates, widths, and heights used in card generation.
  static #photoUnderlayXY = [48, 0];
  static #photoXY = [72, 113];
  static #logoUnderlayXY = [635, 284];
  static #numberUnderlayXY = [871, 193];
  static #mrzUnderlayXY = [0, 379];
  static #shortHeaderXY = [886, 167];
  static #logoFrontXY = [72, 588]
  static #logoBackXY = [667, 300];
  static #smallLogoXY = [886, 48];
  static #backNumberXY = [888, 217];
  static #mrzX = 71;
  static #mrzY = [451, 501, 551];
  static #mrzSpacing = 30.35;
  static #frontColumns = [48, 466];
  static #backColumns = 113;
  static #frontRows = [
    175, // Badge Subtype
    208, // Badge Type
    263, // Front QR Code
    113, // Photo
    523, // Logo
    704, // Name Header
    731, // Name Data
    780, // Employer Header
    807, // Employer Data
    856, // Number Header
    883, // Number Data
    932, // Date of Expiration Header
    959  // Date of Expiration Data
  ];
  static #backRows = [
    48,  // Additional Elements Header
    73,  // Additional Elements Header (Alternate Language 1)
    98,  // Additional Elements Header (Alternate Language 2)
    125  // Additional Elements Data
  ];
  static #cardArea = [672, 1052];
  static get cutCardArea() { return [640, 1020]; }
  static #bleed = 16;
  static #safe = 48;
  static #photoUnderlayArea = [386, 673];
  static #photoArea = [338, 451];
  static #logoUnderlayArea = [417, 71];
  static #numberUnderlayArea = [181, 67];
  static #mrzUnderlayArea = [1052, 293];
  static #frontQRCodeArea = [158, 158];
  static #logoArea = [338, 61];
  static #backLogoArea = [337, 39];
  static #smallLogoArea = [103, 103];

  /** Load the fonts used by this renderer. */
  async loadCanvasFonts() {
    this.fonts.add(IDBadgeRenderer.#mrzFontFace);
    this.fonts.add(IDBadgeRenderer.#vizFontFace);
    this.fonts.add(IDBadgeRenderer.#vizBoldFontFace);
    this.fonts.add(IDBadgeRenderer.#vizItalicFontFace);
    await Promise.all([
      IDBadgeRenderer.#mrzFontFace.load(),
      IDBadgeRenderer.#vizFontFace.load(),
      IDBadgeRenderer.#vizBoldFontFace.load(),
      IDBadgeRenderer.#vizItalicFontFace.load()
    ]);
  }

  /**
   * Generate the front image and return the canvas.
   * @param { CrewID } model
   * @param { HTMLCanvasElement } fallback
   */
  async generateCardFront(model, fallback) {
    let canvas;
    if (typeof OffscreenCanvas === "undefined") {
      canvas = fallback;
      canvas.width = IDBadgeRenderer.#cardArea[0];
      canvas.height = IDBadgeRenderer.#cardArea[1];
    }
    else {
      canvas = new OffscreenCanvas(
        IDBadgeRenderer.#cardArea[0],
        IDBadgeRenderer.#cardArea[1]
      );
    }
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";

    const images = await Promise.all([
      this.frontBackgroundImage ?
          loadImageFromURL(this.frontBackgroundImage) : null,
      toQRCanvas(model.url, {
        errorCorrectionLevel: this.frontBarcodeErrorCorrection,
        margin: 0,
        width: IDBadgeRenderer.#frontQRCodeArea[0],
        color: {
          dark: this.barcodeDarkColor,
          light: this.barcodeLightColor
        }
      }),
      loadImageFromURL(model.photo),
      this.logo ? loadImageFromURL(this.logo) : null
    ]);

    ctx.fillStyle = this.frontBackgroundColor;
    ctx.fillRect(
      0, 0,
      IDBadgeRenderer.#cardArea[0],
      IDBadgeRenderer.#cardArea[1]
    );
    if (images[0]) {
      ctx.drawImage(
        images[0],
        0, 0,
        IDBadgeRenderer.#cardArea[0],
        IDBadgeRenderer.#cardArea[1]
      );
    }
    ctx.fillStyle = this.#logoUnderlayColorWithAlpha;
    ctx.fillRect(
      IDBadgeRenderer.#photoUnderlayXY[0],
      IDBadgeRenderer.#photoUnderlayXY[1],
      IDBadgeRenderer.#photoUnderlayArea[0],
      IDBadgeRenderer.#photoUnderlayArea[1]
    );
    ctx.drawImage(
      images[1],
      IDBadgeRenderer.#frontColumns[1],
      IDBadgeRenderer.#frontRows[2],
      IDBadgeRenderer.#frontQRCodeArea[0],
      IDBadgeRenderer.#frontQRCodeArea[1]
    );
    fillAreaWithImage(
      images[2], ctx,
      IDBadgeRenderer.#photoXY[0],
      IDBadgeRenderer.#photoXY[1],
      IDBadgeRenderer.#photoArea[0],
      IDBadgeRenderer.#photoArea[1]
    );
    if (images[3]) {
      fitImageInArea(
        images[3], ctx,
        IDBadgeRenderer.#logoFrontXY[0],
        IDBadgeRenderer.#logoFrontXY[1],
        IDBadgeRenderer.#logoArea[0],
        IDBadgeRenderer.#logoArea[1]
      );
    }

    ctx.fillStyle = this.headerColor;
    ctx.font = IDBadgeRenderer.#badgeSubtypeFont;
    ctx.fillText(
      this.badgeSubtype,
      IDBadgeRenderer.#frontColumns[1],
      IDBadgeRenderer.#frontRows[0],
      IDBadgeRenderer.#cardArea[0] - IDBadgeRenderer.#frontColumns[1] - 48
    );

    ctx.fillStyle = this.headerColor;
    ctx.font = IDBadgeRenderer.#badgeTypeFont;
    ctx.fillText(
      this.badgeType,
      IDBadgeRenderer.#frontColumns[1],
      IDBadgeRenderer.#frontRows[1],
      IDBadgeRenderer.#cardArea[0] - IDBadgeRenderer.#frontColumns[1] - 48
    );

    ctx.fillStyle = this.headerColor;
    ctx.font = IDBadgeRenderer.#headerFont;
    ctx.fillText(
      this.nameHeader[0],
      IDBadgeRenderer.#frontColumns[0],
      IDBadgeRenderer.#frontRows[5]
    );
    ctx.fillText(
      this.employerHeader[0],
      IDBadgeRenderer.#frontColumns[0],
      IDBadgeRenderer.#frontRows[7]
    );
    ctx.fillText(
      this.numberHeader[0],
      IDBadgeRenderer.#frontColumns[0],
      IDBadgeRenderer.#frontRows[9]
    );
    ctx.fillText(
      this.dateOfExpirationHeader[0],
      IDBadgeRenderer.#frontColumns[0],
      IDBadgeRenderer.#frontRows[11]
    );
    const NAME_WIDTH = IDBadgeRenderer.#frontColumns[0] +
      ctx.measureText(this.nameHeader[0]).width;
    const EMPLOYER_WIDTH = IDBadgeRenderer.#frontColumns[0] +
      ctx.measureText(this.employerHeader[0]).width;
    const NUMBER_WIDTH = IDBadgeRenderer.#frontColumns[0] +
      ctx.measureText(this.numberHeader[0]).width;
    const DATE_OF_EXPIRATION_WIDTH = IDBadgeRenderer.#frontColumns[0] +
      ctx.measureText(this.dateOfExpirationHeader[0]).width;
    
    ctx.font = IDBadgeRenderer.#intlFont;
    ctx.fillText(
      `/ ${this.nameHeader[1]}/ ${this.nameHeader[2]}`,
      NAME_WIDTH,
      IDBadgeRenderer.#frontRows[5]
    );
    ctx.fillText(
      `/ ${this.employerHeader[1]}/ ${this.employerHeader[2]}`,
      EMPLOYER_WIDTH,
      IDBadgeRenderer.#frontRows[7]
    );
    ctx.fillText(
      `/ ${this.numberHeader[1]}/ ${this.numberHeader[2]}`,
      NUMBER_WIDTH,
      IDBadgeRenderer.#frontRows[9]
    );
    ctx.fillText(
      `/ ${this.dateOfExpirationHeader[1]}/ ${this.dateOfExpirationHeader[2]}`,
      DATE_OF_EXPIRATION_WIDTH,
      IDBadgeRenderer.#frontRows[11]
    );

    ctx.fillStyle = this.textColor;
    ctx.font = IDBadgeRenderer.#dataFont;
    ctx.fillText(
      model.fullName.toVIZ(),
      IDBadgeRenderer.#frontColumns[0],
      IDBadgeRenderer.#frontRows[6],
      IDBadgeRenderer.#cardArea[0] - IDBadgeRenderer.#frontColumns[0] - 48
    );
    ctx.fillText(
      model.employer.toVIZ(),
      IDBadgeRenderer.#frontColumns[0],
      IDBadgeRenderer.#frontRows[8],
      IDBadgeRenderer.#cardArea[0] - IDBadgeRenderer.#frontColumns[0] - 48
    );
    ctx.fillText(
      model.number.toVIZ(),
      IDBadgeRenderer.#frontColumns[0],
      IDBadgeRenderer.#frontRows[10]
    );
    ctx.fillText(
      model.expirationDate.toVIZ(),
      IDBadgeRenderer.#frontColumns[0],
      IDBadgeRenderer.#frontRows[12]
    );

    if (this.showGuides) {
      drawBleedAndSafeLines(
        ctx,
        IDBadgeRenderer.#cardArea,
        IDBadgeRenderer.#bleed,
        IDBadgeRenderer.#safe
      );
    }
    if (this.showPunchSlot) {
      IDBadgeRenderer.#drawPunchSlot(ctx);
    }

    return canvas;
  }

  /**
   * Generate the back image and return the canvas.
   * @param { CrewID } model
   * @param { HTMLCanvasElement } fallback
   */
  async generateCardBack(model, fallback) {
    let canvas;
    if (typeof OffscreenCanvas === "undefined") {
      canvas = fallback;
      canvas.width = IDBadgeRenderer.#cardArea[0];
      canvas.height = IDBadgeRenderer.#cardArea[1];
    }
    else {
      canvas = new OffscreenCanvas(
        IDBadgeRenderer.#cardArea[0],
        IDBadgeRenderer.#cardArea[1]
      );
    }
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";
    ctx.translate(IDBadgeRenderer.#cardArea[0], 0);
    ctx.rotate(90 * Math.PI / 180);
    const barcode = this.useDigitalSeal ?
        [{ data: toBase45(model.signedSeal), mode: "alphanumeric" }]
        : model.url;

    const images = await Promise.all([
      this.backBackgroundImage ?
          loadImageFromURL(this.backBackgroundImage) : null,
      this.mrzBackgroundImage ?
          loadImageFromURL(this.mrzBackgroundImage) : null,
      toQRCanvas(barcode, {
        errorCorrectionLevel: this.backBarcodeErrorCorrection,
        version: 9,
        margin: 0,
        color: {
          dark: this.barcodeDarkColor,
          light: this.barcodeLightColor
        }
      }),
      this.logo ? loadImageFromURL(this.logo) : null,
      this.smallLogo ? loadImageFromURL(this.smallLogo) : null
    ]);

    ctx.fillStyle = this.backBackgroundColor;
    ctx.fillRect(
      0, 0,
      IDBadgeRenderer.#cardArea[1],
      IDBadgeRenderer.#cardArea[0]
    );
    if (images[0]) {
      ctx.drawImage(
        images[0],
        0, 0,
        IDBadgeRenderer.#cardArea[1],
        IDBadgeRenderer.#cardArea[0]
      );
    }
    ctx.fillStyle = this.#logoUnderlayColorWithAlpha;
    ctx.fillRect(
      IDBadgeRenderer.#logoUnderlayXY[0],
      IDBadgeRenderer.#logoUnderlayXY[1],
      IDBadgeRenderer.#logoUnderlayArea[0],
      IDBadgeRenderer.#logoUnderlayArea[1]
    );
    ctx.fillStyle = this.mrzBackgroundColor;
    ctx.fillRect(
      IDBadgeRenderer.#mrzUnderlayXY[0],
      IDBadgeRenderer.#mrzUnderlayXY[1],
      IDBadgeRenderer.#mrzUnderlayArea[0],
      IDBadgeRenderer.#mrzUnderlayArea[1]
    );
    if (this.mrzBackgroundImage) {
      ctx.drawImage(
        images[1],
        IDBadgeRenderer.#mrzUnderlayXY[0],
        IDBadgeRenderer.#mrzUnderlayXY[1],
        IDBadgeRenderer.#mrzUnderlayArea[0],
        IDBadgeRenderer.#mrzUnderlayArea[1]
      );
    }
    ctx.fillStyle = this.#numberUnderlayColorWithAlpha;
    ctx.fillRect(
      IDBadgeRenderer.#numberUnderlayXY[0],
      IDBadgeRenderer.#numberUnderlayXY[1],
      IDBadgeRenderer.#numberUnderlayArea[0],
      IDBadgeRenderer.#numberUnderlayArea[1]
    );
    ctx.drawImage(
      images[2], IDBadgeRenderer.#numberUnderlayXY[0] - 24 - images[2].width, 48
    );
    if (images[3]) {
      fitImageInArea(
        images[3], ctx,
        IDBadgeRenderer.#logoBackXY[0],
        IDBadgeRenderer.#logoBackXY[1],
        IDBadgeRenderer.#backLogoArea[0],
        IDBadgeRenderer.#backLogoArea[1]
      );
    }
    if (images[4]) {
      ctx.drawImage(
        images[4],
        IDBadgeRenderer.#smallLogoXY[0],
        IDBadgeRenderer.#smallLogoXY[1],
        IDBadgeRenderer.#smallLogoArea[0],
        IDBadgeRenderer.#smallLogoArea[1]
      );
    }

    ctx.fillStyle = this.textColor;
    ctx.font = IDBadgeRenderer.#headerFont;
    ctx.fillText(
      model.typeCode.toVIZ() + "-" + model.authorityCode.toVIZ() +
        IDBadgeRenderer.#headerSeparator + IDBadgeRenderer.#documentSize,
      IDBadgeRenderer.#shortHeaderXY[0],
      IDBadgeRenderer.#shortHeaderXY[1],
      IDBadgeRenderer.#smallLogoArea[0]
    );

    ctx.fillStyle = this.headerColor;
    ctx.font = IDBadgeRenderer.#headerFont;
    ctx.fillText(
      this.additionalElementsHeader[0],
      IDBadgeRenderer.#backColumns,
      IDBadgeRenderer.#backRows[0]
    );
    const ADDITIONAL_ELEMENTS_WIDTH = IDBadgeRenderer.#backColumns +
      ctx.measureText(this.additionalElementsHeader[0]).width;

    ctx.font = IDBadgeRenderer.#intlFont;
    ctx.fillText(
      "/",
      ADDITIONAL_ELEMENTS_WIDTH,
      IDBadgeRenderer.#backRows[0]
    );
    ctx.fillText(
      `${this.additionalElementsHeader[1]}/`,
      IDBadgeRenderer.#backColumns,
      IDBadgeRenderer.#backRows[1]
    );
    ctx.fillText(
      `${this.additionalElementsHeader[2]}`,
      IDBadgeRenderer.#backColumns,
      IDBadgeRenderer.#backRows[2]
    );

    ctx.fillStyle = this.textColor;
    ctx.font = IDBadgeRenderer.#dataFont;
    this.additionalElements.toUpperCase().split(/\r?\n/).forEach((line, i) => {
      ctx.fillText(
        line,
        IDBadgeRenderer.#backColumns,
        IDBadgeRenderer.#backRows[3] + (i * 30)
      );
    });
    ctx.fillText(
      model.number.toVIZ(),
      IDBadgeRenderer.#backNumberXY[0],
      IDBadgeRenderer.#backNumberXY[1],
      1004 - IDBadgeRenderer.#backNumberXY[0]
    );

    ctx.fillStyle = this.mrzColor;
    ctx.font = IDBadgeRenderer.#mrzFont;
    [...model.machineReadableZone].forEach((character, i) => {
      ctx.fillText(
        character,
        IDBadgeRenderer.#mrzX +
            ((i % TD1_MRZ_LINE_LENGTH) * IDBadgeRenderer.#mrzSpacing),
        IDBadgeRenderer.#mrzY[Math.floor(i / TD1_MRZ_LINE_LENGTH)]
      );
    });

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (this.showGuides) {
      drawBleedAndSafeLines(
        ctx,
        IDBadgeRenderer.#cardArea,
        IDBadgeRenderer.#bleed,
        IDBadgeRenderer.#safe
      );
    }
    if (this.showPunchSlot) {
      IDBadgeRenderer.#drawPunchSlot(ctx);
    }

    return canvas;
  }

  static #drawPunchSlot(ctx) {
    ctx.fillStyle = "#999999";
    ctx.fillRect(
      (this.#cardArea[0] - 160) / 2,
      65,
      160,
      27
    )
    ctx.clearRect(
      (this.#cardArea[0] - 158) / 2,
      66,
      158,
      25
    )
  }
}

export { IDBadgeRenderer };
