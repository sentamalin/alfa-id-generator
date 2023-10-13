// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

import { CrewLicense } from "./crewlicense.js";
import { encode as toBase45 } from "./base45-ts/base45.js";
import { toCanvas as toQRCanvas } from "./qrcode-lite/qrcode.mjs";
import { loadImageFromURL } from "./utilities/load-image-from-url.js";
import { fitImageInArea } from "./utilities/fit-image-in-area.js";
import { fillAreaWithImage } from "./utilities/fill-area-with-image.js";
import { drawBleedAndSafeLines } from "./utilities/draw-bleed-and-safe-lines.js";
import { dateToVIZ } from "./icao9303/utilities/date-to-viz.js";
import { BACKGROUND_COLOR, BARCODE_DARK_COLOR, BARCODE_ERROR_CORRECTION, BARCODE_LIGHT_COLOR, FULL_AUTHORITY, HEADER_COLOR, MRZ_BACKGROUND_COLOR, TD1_MRZ_LINE_LENGTH, TEXT_COLOR, UNDERLAY_OPACITY, authorityHeader, birthDateHeader, certificateNoHeader, expirationDateHeader, genderHeader, nameHeader, nationalityHeader } from "./utilities/renderer-variables.js";

/**
 * `CrewLicenseRenderer` takes a `CrewLicense` object and returns a
 *     `HTMLCanvasElement` or an `OffscreenCanvas` element representation of the
 *     travel document as a two-sided TD1-sized crewmember license.
 * 
 * The renderer generates images appropriate for web use and for print use with
 *     300-dpi printers. A bleed area surrounds the cut and safe areas to allow
 *     borderless printing.
 * 
 * Renderers are scenario-specific and this was created to be used for a demo
 *     on a web page. Ergo, multiple properties are able to be set. In
 *     real-world use less (or no) properties may want to be settable.
 */
export class CrewLicenseRenderer {
  /**
   * Create a `CrewLicenseRenderer`.
   * @param { Object } [opt] - An options object.
   * @param { string } [opt.barcodeDarkColor] - A RGBA hex string, formatted as
   *     '#RRGGBBAA'.
   * @param { string } [opt.barcodeLightColor] - A RGBA hex string, formatted
   *     as '#RRGGBBAA'.
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
   * @param { boolean } [opt.useDigitalSeal] - Toggles storing a visible digital
   *     seal (VDS) on the barcode in place of a URL.
   * @param { string } [opt.fullAuthority] - The full name of the authority who
   *     issued this document.
   * @param { string } [opt.fullDocumentName] - The full name of this document's
   *     type.
   * @param { string[] } [opt.nameHeader] - Header text for the name property:
   *     ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.genderHeader] - Header text for the genderMarker
   *     property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.nationalityHeader] - Header text for the
   *     nationalityCode property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.dateOfBirthHeader] - Header text for the birthDate
   *     property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.authorityHeader] - Header text for the
   *     subauthority property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.privilegeHeader] - Header text for the privilege
   *     property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.numberHeader] - Header text for the number
   *     property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.dateOfExpirationHeader] - Header text for the
   *     expirationDate property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.ratingsHeader] - Header text for the ratings
   *     property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.limitationsHeader] - Header text for the
   *     limitations property: ['primary', 'language 1', 'language 2'].
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
    this.backBackgroundColor = opt?.backBackgroundColor ?? BACKGROUND_COLOR;
    this.backBackgroundImage = opt?.backBackgroundImage ?? null;
    this.mrzBackgroundColor = opt?.mrzBackgroundColor ?? MRZ_BACKGROUND_COLOR;
    this.mrzBackgroundImage = opt?.mrzBackgroundImage ?? null;
    this.numberUnderlayColor = opt?.numberUnderlayColor ?? MRZ_BACKGROUND_COLOR;
    this.numberUnderlayAlpha = opt?.numberUnderlayAlpha ?? UNDERLAY_OPACITY;
    this.logoUnderlayColor = opt?.logoUnderlayColor ?? HEADER_COLOR;
    this.logoUnderlayAlpha = opt?.logoUnderlayAlpha ?? UNDERLAY_OPACITY;
    this.logo = opt?.logo ?? null;
    this.smallLogo = opt?.smallLogo ?? null;
    this.showGuides = opt?.showGuides ?? false;
    this.useDigitalSeal = opt?.useDigitalSeal ?? false;
    this.fullAuthority = opt?.fullAuthority ?? FULL_AUTHORITY;
    this.fullDocumentName = opt?.fullDocumentName ?? "CREWMEMBER LICENSE";
    this.nameHeader = opt?.nameHeader ?? nameHeader;
    this.genderHeader = opt?.genderHeader ?? genderHeader;
    this.nationalityHeader = opt?.nationalityHeader ?? nationalityHeader;
    this.dateOfBirthHeader = opt?.dateOfBirthHeader ?? birthDateHeader;
    this.authorityHeader = opt?.authorityHeader ?? authorityHeader;
    this.privilegeHeader = opt?.privilegeHeader ?? [
      "PRIVILEGE",
      "PRIVILÈGE",
      "PRIVILEGIO"
    ];
    this.numberHeader = opt?.numberHeader ?? certificateNoHeader;
    this.dateOfExpirationHeader = opt?.dateOfExpirationHeader ??
        expirationDateHeader;
    this.ratingsHeader = opt?.ratingsHeader ?? [
      "RATINGS",
      "QUALIFICATIONS",
      "CLASIFICACIONES"
    ];
    this.limitationsHeader = opt?.limitationsHeader ?? [
      "LIMITATIONS",
      "LIMITATIONS",
      "LIMITACIONES"
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
   * Header text for the name property: ['primary', 'language 1', 'language 2'].
   * @type { string[] }
   */
  nameHeader;

  /**
   * Header text for the genderMarker property: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  genderHeader;

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
   * Header text for the subauthority property: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  authorityHeader;

  /**
   * Header text for the privilege property: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  privilegeHeader;

  /**
   * Header text for the number property: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  numberHeader;

  /**
   * Header text for the expirationDate property: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  dateOfExpirationHeader;

  /**
   * Header text for the ratings property: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  ratingsHeader;

  /**
   * Header text for the limitations property: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  limitationsHeader;

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
    return `bold 24px ${this.#vizFontFace.family}`;
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
    return `61px ${this.#signatureFontFace.family}`;
  }

  // Text constants used in image generation.
  static #headerSeparator = " · ";
  static #documentSize = "TD1";

  // Coordinates, widths, and heights used in card generation.
  static #mainHeaderX = 1004;
  static #mainHeaderY = [48, 85];
  static #photoUnderlayXY = [48, 0];
  static #photoXY = [72, 141];
  static #logoUnderlayXY = [635, 284];
  static #numberUnderlayXY = [871, 193];
  static #mrzUnderlayXY = [0, 379];
  static #shortHeaderXY = [886, 167];
  static #logoFrontXY = [72, 48];
  static #logoBackXY = [667, 300];
  static #smallLogoXY = [886, 48];
  static #signatureXY = [72, 543];
  static #backNumberXY = [888, 217];
  static #mrzX = 71;
  static #mrzY = [451, 501, 551];
  static #mrzSpacing = 30.35;
  static #frontColumns = 391;
  static #backColumns = 48;
  static #frontRows = [
    141, // name Header
    168, // name Data
    217, // Row 2 Header (Primary Language)
    242, // Row 2 Header (Alternate Language 1)
    267, // Row 2 Header (Alternate Language 2)
    294, // Row 2 Data
    343, // Employer Header
    370, // Employer Data
    419, // Occupation Header
    446, // Occupation Data
    495, // Number Header
    522, // Number Data
    571, // Date of Expiration Header
    598  // Date of Expiration Data
  ];
  static #frontRow2Columns = [
    540, // Nationality Column
    740  // Date of Birth Column
  ];
  static #backRows = [
    48,  // Re-Entry Declaration Header
    75,  // Re-Entry Declaration Data
    221, // Date/Place of Issue Header
    248, // Date/Place of Issue Header (Alternate Language 1)
  ];
  static #cardArea = [1052, 672];
  static get cutCardArea() { return [1020, 640]; }
  static get signatureArea() { return [271, 81]; }
  static #bleed = 16;
  static #safe = 48;
  static #photoUnderlayArea = [319, 527];
  static #photoArea = [271, 362];
  static #logoUnderlayArea = [417, 71];
  static #numberUnderlayArea = [181, 67];
  static #mrzUnderlayArea = [1052, 293];
  static #logoArea = [271, 61];
  static #backLogoArea = [337, 39];
  static #smallLogoArea = [103, 103];

  /** Load the fonts used by this renderer. */
  async loadCanvasFonts() {
    this.fonts.add(CrewLicenseRenderer.#mrzFontFace);
    this.fonts.add(CrewLicenseRenderer.#vizFontFace);
    this.fonts.add(CrewLicenseRenderer.#vizBoldFontFace);
    this.fonts.add(CrewLicenseRenderer.#vizItalicFontFace);
    this.fonts.add(CrewLicenseRenderer.#signatureFontFace);
    await Promise.all([
      CrewLicenseRenderer.#mrzFontFace.load(),
      CrewLicenseRenderer.#vizFontFace.load(),
      CrewLicenseRenderer.#vizBoldFontFace.load(),
      CrewLicenseRenderer.#vizItalicFontFace.load(),
      CrewLicenseRenderer.#signatureFontFace.load()
    ]);
  }

  /**
   * Generate the front image and return the canvas.
   * @param { CrewLicense } model
   * @param { HTMLCanvasElement } fallback
   */
  async generateCardFront(model, fallback) {
    let canvas;
    if (typeof OffscreenCanvas === "undefined") {
      canvas = fallback;
      canvas.width = CrewLicenseRenderer.#cardArea[0];
      canvas.height = CrewLicenseRenderer.#cardArea[1];
    }
    else {
      canvas = new OffscreenCanvas(
        CrewLicenseRenderer.#cardArea[0],
        CrewLicenseRenderer.#cardArea[1]
      );
    }
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";

    const images = await Promise.all([
      this.frontBackgroundImage ?
          loadImageFromURL(this.frontBackgroundImage) : null,
      loadImageFromURL(model.photo),
      this.logo ? loadImageFromURL(this.logo) : null,
      typeof model.signatureImage !== typeof canvas ?
          loadImageFromURL(model.signatureImage) : null
    ]);

    ctx.fillStyle = this.frontBackgroundColor;
    ctx.fillRect(
      0, 0,
      CrewLicenseRenderer.#cardArea[0],
      CrewLicenseRenderer.#cardArea[1]
    );
    if (images[0]) {
      ctx.drawImage(
        images[0],
        0, 0,
        CrewLicenseRenderer.#cardArea[0],
        CrewLicenseRenderer.#cardArea[1]
      );
    }
    ctx.fillStyle = "#00003300";
    ctx.fillStyle = this.#logoUnderlayColorWithAlpha;
    ctx.fillRect(
      CrewLicenseRenderer.#photoUnderlayXY[0],
      CrewLicenseRenderer.#photoUnderlayXY[1],
      CrewLicenseRenderer.#photoUnderlayArea[0],
      CrewLicenseRenderer.#photoUnderlayArea[1]
    );
    fillAreaWithImage(
      images[1], ctx,
      CrewLicenseRenderer.#photoXY[0],
      CrewLicenseRenderer.#photoXY[1],
      CrewLicenseRenderer.#photoArea[0],
      CrewLicenseRenderer.#photoArea[1]
    );
    if (images[2]) {
      fitImageInArea(
        images[2], ctx,
        CrewLicenseRenderer.#logoFrontXY[0],
        CrewLicenseRenderer.#logoFrontXY[1],
        CrewLicenseRenderer.#logoArea[0],
        CrewLicenseRenderer.#logoArea[1]
      );
    }
    if (images[3]) {
      fitImageInArea(
        images[3], ctx,
        CrewLicenseRenderer.#signatureXY[0],
        CrewLicenseRenderer.#signatureXY[1],
        CrewLicenseRenderer.signatureArea[0],
        CrewLicenseRenderer.signatureArea[1],
      );
    }
    else {
      ctx.drawImage(
        model.signatureImage,
        CrewLicenseRenderer.#signatureXY[0],
        CrewLicenseRenderer.#signatureXY[1],
        CrewLicenseRenderer.signatureArea[0],
        CrewLicenseRenderer.signatureArea[1]
      );
    }

    ctx.fillStyle = this.headerColor;
    ctx.font = CrewLicenseRenderer.#mainHeaderFont;
    ctx.fillText(
      this.fullAuthority,
      Math.max(
        CrewLicenseRenderer.#mainHeaderX -
          ctx.measureText(this.fullAuthority).width,
        CrewLicenseRenderer.#frontColumns
      ),
      CrewLicenseRenderer.#mainHeaderY[0],
      CrewLicenseRenderer.#mainHeaderX - CrewLicenseRenderer.#frontColumns
    );
    ctx.font = CrewLicenseRenderer.#documentHeaderFont;
    let documentHeaderWidth = ctx.measureText(this.fullDocumentName).width;
    ctx.fillText(
      this.fullDocumentName,
      CrewLicenseRenderer.#mainHeaderX - documentHeaderWidth,
      CrewLicenseRenderer.#mainHeaderY[1]
    );
    ctx.font = CrewLicenseRenderer.#separatorHeaderFont;
    documentHeaderWidth += ctx.measureText(
      CrewLicenseRenderer.#headerSeparator
    ).width;
    ctx.fillText(
      CrewLicenseRenderer.#headerSeparator,
      CrewLicenseRenderer.#mainHeaderX - documentHeaderWidth,
      CrewLicenseRenderer.#mainHeaderY[1]
    );
    ctx.font = CrewLicenseRenderer.#documentHeaderFont;
    documentHeaderWidth += ctx.measureText(
      `${model.typeCode.toUpperCase()}-${model.authorityCode.toUpperCase()}`
    ).width;
    ctx.fillText(
      `${model.typeCode.toUpperCase()}-${model.authorityCode.toUpperCase()}`,
      CrewLicenseRenderer.#mainHeaderX - documentHeaderWidth,
      CrewLicenseRenderer.#mainHeaderY[1]
    );

    ctx.fillStyle = this.headerColor;
    ctx.font = CrewLicenseRenderer.#headerFont;
    ctx.fillText(
      this.nameHeader[0],
      CrewLicenseRenderer.#frontColumns,
      CrewLicenseRenderer.#frontRows[0]
    );
    ctx.fillText(
      this.genderHeader[0],
      CrewLicenseRenderer.#frontColumns,
      CrewLicenseRenderer.#frontRows[2]
    );
    ctx.fillText(
      this.nationalityHeader[0],
      CrewLicenseRenderer.#frontRow2Columns[0],
      CrewLicenseRenderer.#frontRows[2]
    );
    ctx.fillText(
      this.dateOfBirthHeader[0],
      CrewLicenseRenderer.#frontRow2Columns[1],
      CrewLicenseRenderer.#frontRows[2]
    );
    ctx.fillText(
      this.authorityHeader[0],
      CrewLicenseRenderer.#frontColumns,
      CrewLicenseRenderer.#frontRows[6]
    );
    ctx.fillText(
      this.privilegeHeader[0],
      CrewLicenseRenderer.#frontColumns,
      CrewLicenseRenderer.#frontRows[8]
    );
    ctx.fillText(
      this.numberHeader[0],
      CrewLicenseRenderer.#frontColumns,
      CrewLicenseRenderer.#frontRows[10]
    );
    ctx.fillText(
      this.dateOfExpirationHeader[0],
      CrewLicenseRenderer.#frontColumns,
      CrewLicenseRenderer.#frontRows[12]
    );
    const NAME_WIDTH = CrewLicenseRenderer.#frontColumns +
      ctx.measureText(this.nameHeader[0]).width;
    const GENDER_WIDTH = CrewLicenseRenderer.#frontColumns +
      ctx.measureText(this.genderHeader[0]).width;
    const NATIONALITY_WIDTH = CrewLicenseRenderer.#frontRow2Columns[0] +
      ctx.measureText(this.nationalityHeader[0]).width;
    const DATE_OF_BIRTH_WIDTH = CrewLicenseRenderer.#frontRow2Columns[1] +
      ctx.measureText(this.dateOfBirthHeader[0]).width;
    const EMPLOYER_WIDTH = CrewLicenseRenderer.#frontColumns +
      ctx.measureText(this.authorityHeader[0]).width;
    const OCCUPATION_WIDTH = CrewLicenseRenderer.#frontColumns +
      ctx.measureText(this.privilegeHeader[0]).width;
    const NUMBER_WIDTH = CrewLicenseRenderer.#frontColumns +
      ctx.measureText(this.numberHeader[0]).width;
    const DATE_OF_EXPIRATION_WIDTH = CrewLicenseRenderer.#frontColumns +
      ctx.measureText(this.dateOfExpirationHeader[0]).width;
    
    ctx.font = CrewLicenseRenderer.#intlFont;
    ctx.fillText(
      `/ ${this.nameHeader[1]}/ ${this.nameHeader[2]}`,
      NAME_WIDTH,
      CrewLicenseRenderer.#frontRows[0]
    );
    ctx.fillText("/", GENDER_WIDTH, CrewLicenseRenderer.#frontRows[2]);
    ctx.fillText(
      `${this.genderHeader[1]}/`,
      CrewLicenseRenderer.#frontColumns,
      CrewLicenseRenderer.#frontRows[3]
    );
    ctx.fillText(
      this.genderHeader[2],
      CrewLicenseRenderer.#frontColumns,
      CrewLicenseRenderer.#frontRows[4]
    );
    ctx.fillText("/", NATIONALITY_WIDTH, CrewLicenseRenderer.#frontRows[2]);
    ctx.fillText(
      `${this.nationalityHeader[1]}/`,
      CrewLicenseRenderer.#frontRow2Columns[0],
      CrewLicenseRenderer.#frontRows[3]
    );
    ctx.fillText(
      this.nationalityHeader[2],
      CrewLicenseRenderer.#frontRow2Columns[0],
      CrewLicenseRenderer.#frontRows[4]
    );
    ctx.fillText("/", DATE_OF_BIRTH_WIDTH, CrewLicenseRenderer.#frontRows[2]);
    ctx.fillText(
      `${this.dateOfBirthHeader[1]}/`,
      CrewLicenseRenderer.#frontRow2Columns[1],
      CrewLicenseRenderer.#frontRows[3]
    );
    ctx.fillText(
      this.dateOfBirthHeader[2],
      CrewLicenseRenderer.#frontRow2Columns[1],
      CrewLicenseRenderer.#frontRows[4]
    );
    ctx.fillText(
      `/ ${this.authorityHeader[1]}/ ${this.authorityHeader[2]}`,
      EMPLOYER_WIDTH,
      CrewLicenseRenderer.#frontRows[6]
    );
    ctx.fillText(
      `/ ${this.privilegeHeader[1]}/ ${this.privilegeHeader[2]}`,
      OCCUPATION_WIDTH,
      CrewLicenseRenderer.#frontRows[8]
    );
    ctx.fillText(
      `/ ${this.numberHeader[1]}/ ${this.numberHeader[2]}`,
      NUMBER_WIDTH,
      CrewLicenseRenderer.#frontRows[10]
    );
    ctx.fillText(
      `/ ${this.dateOfExpirationHeader[1]}/ ${this.dateOfExpirationHeader[2]}`,
      DATE_OF_EXPIRATION_WIDTH,
      CrewLicenseRenderer.#frontRows[12]
    );

    ctx.fillStyle = this.textColor;
    ctx.font = CrewLicenseRenderer.#dataFont;
    ctx.fillText(
      model.fullName.toUpperCase(),
      CrewLicenseRenderer.#frontColumns,
      CrewLicenseRenderer.#frontRows[1],
      CrewLicenseRenderer.#mainHeaderX - CrewLicenseRenderer.#frontColumns
    );
    ctx.fillText(
      model.genderMarker,
      CrewLicenseRenderer.#frontColumns,
      CrewLicenseRenderer.#frontRows[5]
    );
    ctx.fillText(
      model.nationalityCode,
      CrewLicenseRenderer.#frontRow2Columns[0],
      CrewLicenseRenderer.#frontRows[5]
    );
    ctx.fillText(
      dateToVIZ(model.birthDate),
      CrewLicenseRenderer.#frontRow2Columns[1],
      CrewLicenseRenderer.#frontRows[5]
    );
    ctx.fillText(
      model.subauthority.toUpperCase(),
      CrewLicenseRenderer.#frontColumns,
      CrewLicenseRenderer.#frontRows[7],
      CrewLicenseRenderer.#mainHeaderX - CrewLicenseRenderer.#frontColumns
    );
    ctx.fillText(
      model.privilege.toUpperCase(),
      CrewLicenseRenderer.#frontColumns,
      CrewLicenseRenderer.#frontRows[9],
      CrewLicenseRenderer.#mainHeaderX - CrewLicenseRenderer.#frontColumns
    );
    ctx.fillText(
      model.number.toUpperCase(),
      CrewLicenseRenderer.#frontColumns,
      CrewLicenseRenderer.#frontRows[11]
    );
    ctx.fillText(
      dateToVIZ(model.expirationDate),
      CrewLicenseRenderer.#frontColumns,
      CrewLicenseRenderer.#frontRows[13]
    );

    if (this.showGuides) {
      drawBleedAndSafeLines(
        ctx,
        CrewLicenseRenderer.#cardArea,
        CrewLicenseRenderer.#bleed,
        CrewLicenseRenderer.#safe
      );
    }

    return canvas;
  }

  /**
   * Generate the back image and return the canvas.
   * @param { CrewLicense } model
   * @param { HTMLCanvasElement } fallback
   */
  async generateCardBack(model, fallback) {
    let canvas;
    if (typeof OffscreenCanvas === "undefined") {
      canvas = fallback;
      canvas.setAttribute("width", CrewLicenseRenderer.#cardArea[0]);
      canvas.setAttribute("height", CrewLicenseRenderer.#cardArea[1]);
    }
    else {
      canvas = new OffscreenCanvas(
        CrewLicenseRenderer.#cardArea[0],
        CrewLicenseRenderer.#cardArea[1]
      );
    }
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";
    const barcode = this.useDigitalSeal ?
        [{ data: toBase45(model.signedSeal), mode: "alphanumeric" }]
        : model.url;

    const images = await Promise.all([
      this.backBackgroundImage ?
          loadImageFromURL(this.backBackgroundImage) : null,
      this.mrzBackgroundImage ?
          loadImageFromURL(this.mrzBackgroundImage) : null,
      toQRCanvas(barcode, {
        errorCorrectionLevel: this.barcodeErrorCorrection,
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
      CrewLicenseRenderer.#cardArea[0],
      CrewLicenseRenderer.#cardArea[1]
    );
    if (images[0]) {
      ctx.drawImage(
        images[0],
        0, 0,
        CrewLicenseRenderer.#cardArea[0],
        CrewLicenseRenderer.#cardArea[1]
      );
    }
    ctx.fillStyle = this.#logoUnderlayColorWithAlpha;
    ctx.fillRect(
      CrewLicenseRenderer.#logoUnderlayXY[0],
      CrewLicenseRenderer.#logoUnderlayXY[1],
      CrewLicenseRenderer.#logoUnderlayArea[0],
      CrewLicenseRenderer.#logoUnderlayArea[1]
    );
    ctx.fillStyle = this.mrzBackgroundColor;
    ctx.fillRect(
      CrewLicenseRenderer.#mrzUnderlayXY[0],
      CrewLicenseRenderer.#mrzUnderlayXY[1],
      CrewLicenseRenderer.#mrzUnderlayArea[0],
      CrewLicenseRenderer.#mrzUnderlayArea[1]
    );
    if (images[1]) {
      ctx.drawImage(
        images[1],
        CrewLicenseRenderer.#mrzUnderlayXY[0],
        CrewLicenseRenderer.#mrzUnderlayXY[1],
        CrewLicenseRenderer.#mrzUnderlayArea[0],
        CrewLicenseRenderer.#mrzUnderlayArea[1]
      );
    }
    ctx.fillStyle = this.#numberUnderlayColorWithAlpha;
    ctx.fillRect(
      CrewLicenseRenderer.#numberUnderlayXY[0],
      CrewLicenseRenderer.#numberUnderlayXY[1],
      CrewLicenseRenderer.#numberUnderlayArea[0],
      CrewLicenseRenderer.#numberUnderlayArea[1]
    );
    ctx.drawImage(
      images[2],
      CrewLicenseRenderer.#numberUnderlayXY[0] - 24 - images[2].width,
      48
    );
    if (images[3]) {
      fitImageInArea(
        images[3], ctx,
        CrewLicenseRenderer.#logoBackXY[0],
        CrewLicenseRenderer.#logoBackXY[1],
        CrewLicenseRenderer.#backLogoArea[0],
        CrewLicenseRenderer.#backLogoArea[1]
      );
    }
    if (images[4]) {
      ctx.drawImage(
        images[4],
        CrewLicenseRenderer.#smallLogoXY[0],
        CrewLicenseRenderer.#smallLogoXY[1],
        CrewLicenseRenderer.#smallLogoArea[0],
        CrewLicenseRenderer.#smallLogoArea[1]
      );
    }

    ctx.fillStyle = this.textColor;
    ctx.font = CrewLicenseRenderer.#headerFont;
    ctx.fillText(
      `${model.typeCode.toUpperCase()}-${model.authorityCode.toUpperCase()}` +
          `${CrewLicenseRenderer.#headerSeparator}` +
          `${CrewLicenseRenderer.#documentSize}`,
      CrewLicenseRenderer.#shortHeaderXY[0],
      CrewLicenseRenderer.#shortHeaderXY[1],
      CrewLicenseRenderer.#smallLogoArea[0]
    );

    ctx.fillStyle = this.headerColor;
    ctx.font = CrewLicenseRenderer.#headerFont;
    ctx.fillText(
      this.ratingsHeader[0],
      CrewLicenseRenderer.#backColumns,
      CrewLicenseRenderer.#backRows[0]
    );
    ctx.fillText(
      this.limitationsHeader[0],
      CrewLicenseRenderer.#backColumns,
      CrewLicenseRenderer.#backRows[2]
    );
    const DECLARATION_WIDTH = CrewLicenseRenderer.#backColumns +
      ctx.measureText(this.ratingsHeader[0]).width;
    const ISSUE_WIDTH = CrewLicenseRenderer.#backColumns +
      ctx.measureText(this.limitationsHeader[0]).width;

    ctx.font = CrewLicenseRenderer.#intlFont;
    ctx.fillText(
      `/ ${this.ratingsHeader[1]}/ ${this.ratingsHeader[2]}`,
      DECLARATION_WIDTH,
      CrewLicenseRenderer.#backRows[0]
    );
    ctx.fillText(
      `/ ${this.limitationsHeader[1]}/ ${this.limitationsHeader[2]}`,
      ISSUE_WIDTH,
      CrewLicenseRenderer.#backRows[2]);

    ctx.fillStyle = this.textColor;
    ctx.font = CrewLicenseRenderer.#dataFont;
    model.ratings.toUpperCase().split(/\r?\n/).forEach((line, i) => {
      ctx.fillText(
        line,
        CrewLicenseRenderer.#backColumns,
        CrewLicenseRenderer.#backRows[1] + (i * 30)
      );
    });
    model.limitations.toUpperCase().split(/\r?\n/).forEach((line, i) => {
      ctx.fillText(
        line,
        CrewLicenseRenderer.#backColumns,
        CrewLicenseRenderer.#backRows[3] + (i * 30)
      );
    });
    ctx.fillText(
      model.number.toUpperCase(),
      CrewLicenseRenderer.#backNumberXY[0],
      CrewLicenseRenderer.#backNumberXY[1],
      1004 - CrewLicenseRenderer.#backNumberXY[0]
    );

    ctx.fillStyle = this.mrzColor;
    ctx.font = CrewLicenseRenderer.#mrzFont;
    [...model.machineReadableZone].forEach((character, i) => {
      ctx.fillText(
        character,
        CrewLicenseRenderer.#mrzX +
            ((i % TD1_MRZ_LINE_LENGTH) * CrewLicenseRenderer.#mrzSpacing),
        CrewLicenseRenderer.#mrzY[Math.floor(i / TD1_MRZ_LINE_LENGTH)]
      );
    });

    if (this.showGuides) {
      drawBleedAndSafeLines(
        ctx,
        CrewLicenseRenderer.#cardArea,
        CrewLicenseRenderer.#bleed,
        CrewLicenseRenderer.#safe
      );
    }

    return canvas;
  }
}
