// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

import { CrewCertificate } from "../modules/CrewCertificate.js";
import { encode as toBase45 } from "../modules/base45-ts/base45.js";
import { toCanvas as toQRCanvas } from "../modules/qrcode-lite/qrcode.mjs";
import { loadImageFromURL } from "../modules/utilities/load-image-from-url.js";
import { fitImageInArea } from "../modules/utilities/fit-image-in-area.js";
import { fillAreaWithImage } from "../modules/utilities/fill-area-with-image.js";
import { drawBleedAndSafeLines } from "../modules/utilities/draw-bleed-and-safe-lines.js";
import { BACKGROUND_COLOR, BARCODE_DARK_COLOR, BARCODE_ERROR_CORRECTION, BARCODE_LIGHT_COLOR, sharedBirthDateHeader, sharedEmployerHeader, sharedExpirationDateHeader, FULL_AUTHORITY, sharedGenderHeader, HEADER_COLOR, MRZ_BACKGROUND_COLOR, sharedNameHeader, sharedNationalityHeader, sharedCertificateNoHeader, sharedOccupationHeader, TEXT_COLOR, UNDERLAY_OPACITY, TD1_MRZ_LINE_LENGTH } from "../modules/utilities/renderer-variables.js";

/**
 * `CrewCertificateRenderer` takes a `CrewCertificate` object and returns a
 *     `HTMLCanvasElement` or an `OffscreenCanvas` element representation of
 *     the travel document as a two-sided TD1-sized crewmember certificate.
 * 
 * The renderer generates images appropriate for web use and for print use with
 *     300-dpi printers. A bleed area surrounds the cut and safe areas to allow
 *     borderless printing.
 * 
 * Renderers are scenario-specific and this was created to be used for a demo on
 *     a web page. Ergo, multiple properties are able to be set. In real-world
 *     use less (or no) properties may want to be settable.
 */
class CrewCertificateRenderer {
  /**
   * Create a `CrewCertificateRenderer`.
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
   * @param { string } [opt.frontBackgroundColor] - A RGB hex string, formatted as
   *     '#RRGGBB'.
   * @param { string | null } [opt.frontBackgroundImage] - A path/URL to an
   *     image file.
   * @param { string } [opt.backBackgroundColor] - A RGB hex string, formatted
   *     as '#RRGGBB'.
   * @param { string | null } [opt.backBackgroundImage] - A path/URL to an
   *     image file.
   * @param { string } [opt.mrzBackgroundColor] - A RGB hex string, formatted
   *     as '#RRGGBB'.
   * @param { string | null } [opt.mrzBackgroundImage] - A path/URL to an
   *     image file.
   * @param { string } [opt.numberUnderlayColor] - A RGB hex string, formatted
   *     as '#RRGGBB'.
   * @param { number } [opt.numberUnderlayAlpha] - A number in the range of
   *     0-255.
   * @param { string } [opt.logoUnderlayColor] - A RGB hex string, formatted as
   *     '#RRGGBB'.
   * @param { number } [opt.logoUnderlayAlpha] - A number in the range of
   *     0-255.
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
   * @param { string[] } [opt.employerHeader] - Header text for the employer
   *     property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.occupationHeader] - Header text for the occupation
   *     property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.numberHeader] - Header text for the number
   *     property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.dateOfExpirationHeader] - Header text for the
   *     expirationDate property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.declarationHeader] - Header text for the
   *     declaration property: ['primary', 'language 1', 'language 2'].
   * @param { string[] } [opt.issueHeader] - Header text for the issueDate and
   *     placeOfIssue property: ['primary', 'language 1', 'language 2'].
   * @param { FontFaceSet } [opt.fonts] - A `FontFaceSet`, like the one
   *     available from `window.document`.
   */
  constructor(opt) {
    this.barcodeDarkColor = opt.barcodeDarkColor ?? BARCODE_DARK_COLOR;
    this.barcodeLightColor = opt.barcodeLightColor ?? BARCODE_LIGHT_COLOR;
    this.barcodeErrorCorrection = opt.barcodeErrorCorrection ??
        BARCODE_ERROR_CORRECTION;
    this.headerColor = opt.headerColor ?? HEADER_COLOR;
    this.textColor = opt.textColor ?? TEXT_COLOR;
    this.mrzColor = opt.mrzColor ?? TEXT_COLOR;
    this.frontBackgroundColor = opt.frontBackgroundColor ?? BACKGROUND_COLOR;
    this.frontBackgroundImage = opt.frontBackgroundImage ?? null;
    this.backBackgroundColor = opt.backBackgroundColor ?? BACKGROUND_COLOR;
    this.backBackgroundImage = opt.backBackgroundImage ?? null;
    this.mrzBackgroundColor = opt.mrzBackgroundColor ?? MRZ_BACKGROUND_COLOR;
    this.mrzBackgroundImage = opt.mrzBackgroundImage ?? null;
    this.numberUnderlayColor = opt.numberUnderlayColor ?? MRZ_BACKGROUND_COLOR;
    this.numberUnderlayAlpha = opt.numberUnderlayAlpha ?? UNDERLAY_OPACITY;
    this.logoUnderlayColor = opt.logoUnderlayColor ?? HEADER_COLOR;
    this.logoUnderlayAlpha = opt.logoUnderlayAlpha ?? UNDERLAY_OPACITY;
    this.logo = opt.logo ?? null;
    this.smallLogo = opt.smallLogo ?? null;
    this.showGuides = opt.showGuides ?? false;
    this.useDigitalSeal = opt.useDigitalSeal ?? false;
    this.fullAuthority = opt.fullAuthority ?? FULL_AUTHORITY;
    this.fullDocumentName = opt.fullDocumentName ?? "CREWMEMBER CERTIFICATE";
    this.nameHeader = opt.nameHeader ?? sharedNameHeader;
    this.genderHeader = opt.genderHeader ?? sharedGenderHeader;
    this.nationalityHeader = opt.nationalityHeader ?? sharedNationalityHeader;
    this.dateOfBirthHeader = opt.dateOfBirthHeader ?? sharedBirthDateHeader;
    this.employerHeader = opt.employerHeader ?? sharedEmployerHeader;
    this.occupationHeader = opt.occupationHeader ?? sharedOccupationHeader;
    this.numberHeader = opt.numberHeader ?? sharedCertificateNoHeader;
    this.dateOfExpirationHeader = opt.dateOfExpirationHeader ??
        sharedExpirationDateHeader;
    this.declarationHeader = opt.declarationHeader ?? [
      "RE-ENTRY DECLARATION",
      "DÉCLARATION DE RENTRÉE",
      "DECLARACIÓN DE REINGRESO"
    ];
    this.issueHeader = opt.issueHeader ?? [
      "DATE OF ISSUE—PLACE OF ISSUE",
      "DATE DE DÉLIVERANCE—LIEU DE DÉLIVERANCE",
      "FECHA DE EXPEDICIÓN—LUGAR DE EXPEDICIÓN"];
    this.fonts = opt.fonts ?? null;
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
   * The RGB color for the underlay under the document number on the back of
   *     the card: '#RRGGBB'.
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
   * Header text for the employer property: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  employerHeader;

  /**
   * Header text for the occupation property: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  occupationHeader;

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
   * Header text for the declaration property: ['primary', 'language 1',
   *     'language 2'].
   * @type { string[] }
   */
  declarationHeader;

  /**
   * Header text for the issueDate and placeOfIssue property: ['primary',
   *     'language 1', 'language 2'].
   * @type { string[] }
   */
  issueHeader;

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
    73,  // Re-Entry Declaration Header (Alternate Language 2)
    100, // Re-Entry Declaration Data
    229, // Date/Place of Issue Header
    254, // Date/Place of Issue Header (Alternate Language 1)
    279, // Date/Place of Issue Header (Alternate Language 2)
    306  // Date/Place of Issue Data
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
    this.fonts.add(CrewCertificateRenderer.#mrzFontFace);
    this.fonts.add(CrewCertificateRenderer.#vizFontFace);
    this.fonts.add(CrewCertificateRenderer.#vizBoldFontFace);
    this.fonts.add(CrewCertificateRenderer.#vizItalicFontFace);
    this.fonts.add(CrewCertificateRenderer.#signatureFontFace);
    await Promise.all([
      CrewCertificateRenderer.#mrzFontFace.load(),
      CrewCertificateRenderer.#vizFontFace.load(),
      CrewCertificateRenderer.#vizBoldFontFace.load(),
      CrewCertificateRenderer.#vizItalicFontFace.load(),
      CrewCertificateRenderer.#signatureFontFace.load()
    ]);
  }

  /**
   * Generate the front image and return the canvas.
   * @param { CrewCertificate } model
   * @param { HTMLCanvasElement } fallback
   */
  async generateCardFront(model, fallback) {
    let canvas;
    if (typeof OffscreenCanvas === "undefined") {
      canvas = fallback;
      canvas.width = CrewCertificateRenderer.#cardArea[0];
      canvas.height = CrewCertificateRenderer.#cardArea[1];
    }
    else {
      canvas = new OffscreenCanvas(
        CrewCertificateRenderer.#cardArea[0],
        CrewCertificateRenderer.#cardArea[1]
      );
    }
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";

    const images = await Promise.all([
      this.frontBackgroundImage ?
          loadImageFromURL(this.frontBackgroundImage) : null,
      loadImageFromURL(model.picture),
      this.logo ? loadImageFromURL(this.logo) : null,
      typeof model.signature !== typeof canvas ?
          loadImageFromURL(model.signature) : null
    ]);

    ctx.fillStyle = this.frontBackgroundColor;
    ctx.fillRect(
      0, 0,
      CrewCertificateRenderer.#cardArea[0],
      CrewCertificateRenderer.#cardArea[1]
    );
    if (images[0]) {
      ctx.drawImage(
        images[0],
        0, 0,
        CrewCertificateRenderer.#cardArea[0],
        CrewCertificateRenderer.#cardArea[1]
      );
    }
    ctx.fillStyle = this.#logoUnderlayColorWithAlpha;
    ctx.fillRect(
      CrewCertificateRenderer.#photoUnderlayXY[0],
      CrewCertificateRenderer.#photoUnderlayXY[1],
      CrewCertificateRenderer.#photoUnderlayArea[0],
      CrewCertificateRenderer.#photoUnderlayArea[1]
    );
    fillAreaWithImage(
      images[1], ctx,
      CrewCertificateRenderer.#photoXY[0],
      CrewCertificateRenderer.#photoXY[1],
      CrewCertificateRenderer.#photoArea[0],
      CrewCertificateRenderer.#photoArea[1]
    );
    if (images[2]) {
      fitImageInArea(
        images[2], ctx,
        CrewCertificateRenderer.#logoFrontXY[0],
        CrewCertificateRenderer.#logoFrontXY[1],
        CrewCertificateRenderer.#logoArea[0],
        CrewCertificateRenderer.#logoArea[1]
      );
    }
    if (images[3]) {
      fitImageInArea(
        images[3], ctx,
        CrewCertificateRenderer.#signatureXY[0],
        CrewCertificateRenderer.#signatureXY[1],
        CrewCertificateRenderer.signatureArea[0],
        CrewCertificateRenderer.signatureArea[1],
      );
    }
    else {
      ctx.drawImage(
        model.signature,
        CrewCertificateRenderer.#signatureXY[0],
        CrewCertificateRenderer.#signatureXY[1],
        CrewCertificateRenderer.signatureArea[0],
        CrewCertificateRenderer.signatureArea[1]
      );
    }

    ctx.fillStyle = this.headerColor;
    ctx.font = CrewCertificateRenderer.#mainHeaderFont;
    ctx.fillText(
      this.fullAuthority,
      Math.max(
        CrewCertificateRenderer.#mainHeaderX -
            ctx.measureText(this.fullAuthority).width,
        CrewCertificateRenderer.#frontColumns
      ),
      CrewCertificateRenderer.#mainHeaderY[0],
      CrewCertificateRenderer.#mainHeaderX -
          CrewCertificateRenderer.#frontColumns
    );
    ctx.font = CrewCertificateRenderer.#documentHeaderFont;
    let documentHeaderWidth = ctx.measureText(this.fullDocumentName).width;
    ctx.fillText(
      this.fullDocumentName,
      CrewCertificateRenderer.#mainHeaderX - documentHeaderWidth,
      CrewCertificateRenderer.#mainHeaderY[1]
    );
    ctx.font = CrewCertificateRenderer.#separatorHeaderFont;
    documentHeaderWidth += ctx.measureText(
      CrewCertificateRenderer.#headerSeparator
    ).width;
    ctx.fillText(
      CrewCertificateRenderer.#headerSeparator,
      CrewCertificateRenderer.#mainHeaderX - documentHeaderWidth,
      CrewCertificateRenderer.#mainHeaderY[1]
    );
    ctx.font = CrewCertificateRenderer.#documentHeaderFont;
    documentHeaderWidth += ctx.measureText(
      `${model.typeCode.toVIZ()}-${model.authorityCode.toVIZ()}`
    ).width;
    ctx.fillText(
      `${model.typeCode.toVIZ()}-${model.authorityCode.toVIZ()}`,
      CrewCertificateRenderer.#mainHeaderX - documentHeaderWidth,
      CrewCertificateRenderer.#mainHeaderY[1]
    );

    ctx.fillStyle = this.headerColor;
    ctx.font = CrewCertificateRenderer.#headerFont;
    ctx.fillText(
      this.nameHeader[0],
      CrewCertificateRenderer.#frontColumns,
      CrewCertificateRenderer.#frontRows[0]
    );
    ctx.fillText(
      this.genderHeader[0],
      CrewCertificateRenderer.#frontColumns,
      CrewCertificateRenderer.#frontRows[2]
    );
    ctx.fillText(
      this.nationalityHeader[0],
      CrewCertificateRenderer.#frontRow2Columns[0],
      CrewCertificateRenderer.#frontRows[2]
    );
    ctx.fillText(
      this.dateOfBirthHeader[0],
      CrewCertificateRenderer.#frontRow2Columns[1],
      CrewCertificateRenderer.#frontRows[2]
    );
    ctx.fillText(
      this.employerHeader[0],
      CrewCertificateRenderer.#frontColumns,
      CrewCertificateRenderer.#frontRows[6]
    );
    ctx.fillText(
      this.occupationHeader[0],
      CrewCertificateRenderer.#frontColumns,
      CrewCertificateRenderer.#frontRows[8]
    );
    ctx.fillText(
      this.numberHeader[0],
      CrewCertificateRenderer.#frontColumns,
      CrewCertificateRenderer.#frontRows[10]
    );
    ctx.fillText(
      this.dateOfExpirationHeader[0],
      CrewCertificateRenderer.#frontColumns,
      CrewCertificateRenderer.#frontRows[12]
    );
    const NAME_WIDTH = CrewCertificateRenderer.#frontColumns +
      ctx.measureText(this.nameHeader[0]).width;
    const GENDER_WIDTH = CrewCertificateRenderer.#frontColumns +
      ctx.measureText(this.genderHeader[0]).width;
    const NATIONALITY_WIDTH = CrewCertificateRenderer.#frontRow2Columns[0] +
      ctx.measureText(this.nationalityHeader[0]).width;
    const DATE_OF_BIRTH_WIDTH = CrewCertificateRenderer.#frontRow2Columns[1] +
      ctx.measureText(this.dateOfBirthHeader[0]).width;
    const EMPLOYER_WIDTH = CrewCertificateRenderer.#frontColumns +
      ctx.measureText(this.employerHeader[0]).width;
    const OCCUPATION_WIDTH = CrewCertificateRenderer.#frontColumns +
      ctx.measureText(this.occupationHeader[0]).width;
    const NUMBER_WIDTH = CrewCertificateRenderer.#frontColumns +
      ctx.measureText(this.numberHeader[0]).width;
    const DATE_OF_EXPIRATION_WIDTH = CrewCertificateRenderer.#frontColumns +
      ctx.measureText(this.dateOfExpirationHeader[0]).width;
    
    ctx.font = CrewCertificateRenderer.#intlFont;
    ctx.fillText(
      `/ ${this.nameHeader[1]}/ ${this.nameHeader[2]}`,
      NAME_WIDTH,
      CrewCertificateRenderer.#frontRows[0]
    );
    ctx.fillText("/", GENDER_WIDTH, CrewCertificateRenderer.#frontRows[2]);
    ctx.fillText(
      `${this.genderHeader[1]}/`,
      CrewCertificateRenderer.#frontColumns,
      CrewCertificateRenderer.#frontRows[3]
    );
    ctx.fillText(
      this.genderHeader[2],
      CrewCertificateRenderer.#frontColumns,
      CrewCertificateRenderer.#frontRows[4]
    );
    ctx.fillText("/", NATIONALITY_WIDTH, CrewCertificateRenderer.#frontRows[2]);
    ctx.fillText(
      `${this.nationalityHeader[1]}/`,
      CrewCertificateRenderer.#frontRow2Columns[0],
      CrewCertificateRenderer.#frontRows[3]
    );
    ctx.fillText(
      this.nationalityHeader[2],
      CrewCertificateRenderer.#frontRow2Columns[0],
      CrewCertificateRenderer.#frontRows[4]
    );
    ctx.fillText("/", DATE_OF_BIRTH_WIDTH, CrewCertificateRenderer.#frontRows[2]);
    ctx.fillText(
      `${this.dateOfBirthHeader[1]}/`,
      CrewCertificateRenderer.#frontRow2Columns[1],
      CrewCertificateRenderer.#frontRows[3]
    );
    ctx.fillText(
      this.dateOfBirthHeader[2],
      CrewCertificateRenderer.#frontRow2Columns[1],
      CrewCertificateRenderer.#frontRows[4]
    );
    ctx.fillText(
      `/ ${this.employerHeader[1]}/ ${this.employerHeader[2]}`,
      EMPLOYER_WIDTH,
      CrewCertificateRenderer.#frontRows[6]
    );
    ctx.fillText(
      `/ ${this.occupationHeader[1]}/ ${this.occupationHeader[2]}`,
      OCCUPATION_WIDTH,
      CrewCertificateRenderer.#frontRows[8]
    );
    ctx.fillText(
      `/ ${this.numberHeader[1]}/ ${this.numberHeader[2]}`,
      NUMBER_WIDTH,
      CrewCertificateRenderer.#frontRows[10]
    );
    ctx.fillText(
      `/ ${this.dateOfExpirationHeader[1]}/ ${this.dateOfExpirationHeader[2]}`,
      DATE_OF_EXPIRATION_WIDTH,
      CrewCertificateRenderer.#frontRows[12]
    );

    ctx.fillStyle = this.textColor;
    ctx.font = CrewCertificateRenderer.#dataFont;
    ctx.fillText(
      model.fullName.toVIZ(),
      CrewCertificateRenderer.#frontColumns,
      CrewCertificateRenderer.#frontRows[1],
      CrewCertificateRenderer.#mainHeaderX -
          CrewCertificateRenderer.#frontColumns
    );
    ctx.fillText(
      model.genderMarker.toVIZ(),
      CrewCertificateRenderer.#frontColumns,
      CrewCertificateRenderer.#frontRows[5]
    );
    ctx.fillText(
      model.nationalityCode.toVIZ(),
      CrewCertificateRenderer.#frontRow2Columns[0],
      CrewCertificateRenderer.#frontRows[5]
    );
    ctx.fillText(
      model.birthDate.toVIZ(),
      CrewCertificateRenderer.#frontRow2Columns[1],
      CrewCertificateRenderer.#frontRows[5]
    );
    ctx.fillText(
      model.employer.toVIZ(),
      CrewCertificateRenderer.#frontColumns,
      CrewCertificateRenderer.#frontRows[7],
      CrewCertificateRenderer.#mainHeaderX -
          CrewCertificateRenderer.#frontColumns
    );
    ctx.fillText(
      model.occupation.toVIZ(),
      CrewCertificateRenderer.#frontColumns,
      CrewCertificateRenderer.#frontRows[9],
      CrewCertificateRenderer.#mainHeaderX -
          CrewCertificateRenderer.#frontColumns
    );
    ctx.fillText(
      model.number.toVIZ(),
      CrewCertificateRenderer.#frontColumns,
      CrewCertificateRenderer.#frontRows[11]
    );
    ctx.fillText(
      model.expirationDate.toVIZ(),
      CrewCertificateRenderer.#frontColumns,
      CrewCertificateRenderer.#frontRows[13]
    );

    if (this.showGuides) {
      drawBleedAndSafeLines(
        ctx,
        CrewCertificateRenderer.#cardArea,
        CrewCertificateRenderer.#bleed,
        CrewCertificateRenderer.#safe
      );
    }

    return canvas;
  }

  /**
   * Generate the back image and return the canvas.
   * @param { CrewCertificate } model
   * @param { HTMLCanvasElement } fallback
   */
  async generateCardBack(model, fallback) {
    let canvas;
    if (typeof OffscreenCanvas === "undefined") {
      canvas = fallback;
      canvas.width = CrewCertificateRenderer.#cardArea[0];
      canvas.height = CrewCertificateRenderer.#cardArea[1];
    }
    else {
      canvas = new OffscreenCanvas(
        CrewCertificateRenderer.#cardArea[0],
        CrewCertificateRenderer.#cardArea[1]
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
      this.smallLogo ? loadImageFromURL(this.smallLogo): null
    ]);

    ctx.fillStyle = this.backBackgroundColor;
    ctx.fillRect(
      0, 0,
      CrewCertificateRenderer.#cardArea[0],
      CrewCertificateRenderer.#cardArea[1]
    );
    if (images[0]) {
      ctx.drawImage(
        images[0],
        0, 0,
        CrewCertificateRenderer.#cardArea[0],
        CrewCertificateRenderer.#cardArea[1]
      );
    }
    ctx.fillStyle = this.#logoUnderlayColorWithAlpha;
    ctx.fillRect(
      CrewCertificateRenderer.#logoUnderlayXY[0],
      CrewCertificateRenderer.#logoUnderlayXY[1],
      CrewCertificateRenderer.#logoUnderlayArea[0],
      CrewCertificateRenderer.#logoUnderlayArea[1]
    );
    ctx.fillStyle = this.mrzBackgroundColor;
    ctx.fillRect(
      CrewCertificateRenderer.#mrzUnderlayXY[0],
      CrewCertificateRenderer.#mrzUnderlayXY[1],
      CrewCertificateRenderer.#mrzUnderlayArea[0],
      CrewCertificateRenderer.#mrzUnderlayArea[1]
    );
    if (images[1]) {
      ctx.drawImage(
        images[1],
        CrewCertificateRenderer.#mrzUnderlayXY[0],
        CrewCertificateRenderer.#mrzUnderlayXY[1],
        CrewCertificateRenderer.#mrzUnderlayArea[0],
        CrewCertificateRenderer.#mrzUnderlayArea[1]
      );
    }
    ctx.fillStyle = this.#numberUnderlayColorWithAlpha;
    ctx.fillRect(
      CrewCertificateRenderer.#numberUnderlayXY[0],
      CrewCertificateRenderer.#numberUnderlayXY[1],
      CrewCertificateRenderer.#numberUnderlayArea[0],
      CrewCertificateRenderer.#numberUnderlayArea[1]
    );
    ctx.drawImage(
      images[2],
      CrewCertificateRenderer.#numberUnderlayXY[0] - 24 - images[2].width,
      48
    );
    if (images[3]) {
      fitImageInArea(
        images[3], ctx,
        CrewCertificateRenderer.#logoBackXY[0],
        CrewCertificateRenderer.#logoBackXY[1],
        CrewCertificateRenderer.#backLogoArea[0],
        CrewCertificateRenderer.#backLogoArea[1]
      );
    }
    if (images[4]) {
      ctx.drawImage(
        images[4],
        CrewCertificateRenderer.#smallLogoXY[0],
        CrewCertificateRenderer.#smallLogoXY[1],
        CrewCertificateRenderer.#smallLogoArea[0],
        CrewCertificateRenderer.#smallLogoArea[1]
      );
    }
    ctx.fillStyle = this.textColor;
    ctx.font = CrewCertificateRenderer.#headerFont;
    ctx.fillText(
      `${model.typeCode.toVIZ()}-${model.authorityCode.toVIZ()}` +
          `${CrewCertificateRenderer.#headerSeparator}` +
          `${CrewCertificateRenderer.#documentSize}`,
      CrewCertificateRenderer.#shortHeaderXY[0],
      CrewCertificateRenderer.#shortHeaderXY[1],
      CrewCertificateRenderer.#smallLogoArea[0]
    );

    ctx.fillStyle = this.headerColor;
    ctx.font = CrewCertificateRenderer.#headerFont;
    ctx.fillText(
      this.declarationHeader[0],
      CrewCertificateRenderer.#backColumns,
      CrewCertificateRenderer.#backRows[0]
    );
    ctx.fillText(
      this.issueHeader[0],
      CrewCertificateRenderer.#backColumns,
      CrewCertificateRenderer.#backRows[3]
    );
    const DECLARATION_WIDTH = CrewCertificateRenderer.#backColumns +
      ctx.measureText(this.declarationHeader[0]).width;
    const ISSUE_WIDTH = CrewCertificateRenderer.#backColumns +
      ctx.measureText(this.issueHeader[0]).width;

    ctx.font = CrewCertificateRenderer.#intlFont;
    ctx.fillText(
      `/ ${this.declarationHeader[1]}/`,
      DECLARATION_WIDTH,
      CrewCertificateRenderer.#backRows[0]
    );
    ctx.fillText(
      this.declarationHeader[2],
      CrewCertificateRenderer.#backColumns,
      CrewCertificateRenderer.#backRows[1]
    );
    ctx.fillText("/", ISSUE_WIDTH, CrewCertificateRenderer.#backRows[3]);
    ctx.fillText(
      `${this.issueHeader[1]}/`,
      CrewCertificateRenderer.#backColumns,
      CrewCertificateRenderer.#backRows[4]
    );
    ctx.fillText(
      this.issueHeader[2],
      CrewCertificateRenderer.#backColumns,
      CrewCertificateRenderer.#backRows[5]
    );

    ctx.fillStyle = this.textColor;
    ctx.font = CrewCertificateRenderer.#dataFont;
    model.declaration.toVIZ().split(/\r?\n/).forEach((line, i) => {
      ctx.fillText(
        line,
        CrewCertificateRenderer.#backColumns,
        CrewCertificateRenderer.#backRows[2] + (i * 33)
      );
    });
    ctx.fillText(
      `${model.issueDate.toVIZ()}—${model.placeOfIssue.toVIZ()}`,
      CrewCertificateRenderer.#backColumns,
      CrewCertificateRenderer.#backRows[6]
    );
    ctx.fillText(
      model.number.toVIZ(),
      CrewCertificateRenderer.#backNumberXY[0],
      CrewCertificateRenderer.#backNumberXY[1],
      1004 - CrewCertificateRenderer.#backNumberXY[0]
    );

    ctx.fillStyle = this.mrzColor;
    ctx.font = CrewCertificateRenderer.#mrzFont;
    [...model.machineReadableZone].forEach((character, i) => {
      ctx.fillText(
        character,
        CrewCertificateRenderer.#mrzX +
            ((i % TD1_MRZ_LINE_LENGTH) * CrewCertificateRenderer.#mrzSpacing),
        CrewCertificateRenderer.#mrzY[Math.floor(i / TD1_MRZ_LINE_LENGTH)]
      );
    });

    if (this.showGuides) {
      drawBleedAndSafeLines(
        ctx,
        CrewCertificateRenderer.#cardArea,
        CrewCertificateRenderer.#bleed,
        CrewCertificateRenderer.#safe
      );
    }

    return canvas;
  }
}

export { CrewCertificateRenderer };
