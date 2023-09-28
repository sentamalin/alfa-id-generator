/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { CrewLicense  } from "/modules/CrewLicense.js";
import * as b45 from "/modules/base45-ts/base45.js";
import * as qrLite from "/modules/qrcode-lite/qrcode.mjs";

class CrewLicenseRenderer {
  // Customizable Presentation Data
  headerColor; // Defines background color around picture and header text color
  textColor; // Defines data text color
  mrzColor;
  barcodeDarkColor = "#000000ff";
  barcodeLightColor = "#00000000";
  barcodeErrorCorrection = "L";
  frontBackgroundColor; // Defines a solid color when no front image is used
  frontBackgroundImage; // Defines a front image to use for a background
  backBackgroundColor; // Defines a solid color when no back image is used
  backBackgroundImage; // Defines a back image to use for a background
  mrzBackgroundColor; // Defines a solid color when no MRZ underlay is used
  mrzBackgroundImage; // Defines an image to use for the MRZ underlay
  numberUnderlayColor; // Defines a solid color when no number underlay image is used
  numberUnderlayAlpha = 255;
  get #numberUnderlayColorWithAlpha() {
    return `${this.numberUnderlayColor}${this.numberUnderlayAlpha.toString(16).padStart(2, "0")}`;
  }
  logoUnderlayColor;
  logoUnderlayAlpha = 255;
  get #logoUnderlayColorWithAlpha() {
    return `${this.logoUnderlayColor}${this.logoUnderlayAlpha.toString(16).padStart(2, "0")}`;
  }
  logo; // Defines the authority logo
  smallLogo; // Defines the small authority logo
  mrzInQRCode;
  showGuides;
  fullAuthority;
  fullDocumentName;
  nameHeader;
  genderHeader;
  nationalityHeader;
  dateOfBirthHeader;
  authorityHeader;
  privilegeHeader;
  numberHeader;
  dateOfExpirationHeader;
  ratingsHeader;
  limitationsHeader;
  fonts;

  // Public Methods
  /** @param { CrewLicense } model */
  /** @param { HTMLCanvasElement } fallback */
  async generateCardFront(model, fallback) {
    let canvas;
    if (typeof OffscreenCanvas === "undefined") {
      canvas = fallback;
      canvas.setAttribute("width", this.constructor.#cardArea[0]);
      canvas.setAttribute("height", this.constructor.#cardArea[1]);
    }
    else {
      canvas = new OffscreenCanvas(this.constructor.#cardArea[0], this.constructor.#cardArea[1]);
    }
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";

    ctx.fillStyle = this.frontBackgroundColor;
    ctx.fillRect(
      0, 0,
      this.constructor.#cardArea[0],
      this.constructor.#cardArea[1]
    );
    if (this.frontBackgroundImage) {
      const cardBackground = await this.constructor.#generateCanvasImg(
        this.frontBackgroundImage
      );
      ctx.drawImage(
        cardBackground,
        0, 0,
        this.constructor.#cardArea[0],
        this.constructor.#cardArea[1]
      );
    }
    ctx.fillStyle = "#00003300";
    ctx.fillStyle = this.#logoUnderlayColorWithAlpha;
    ctx.fillRect(
      this.constructor.#photoUnderlayXY[0],
      this.constructor.#photoUnderlayXY[1],
      this.constructor.#photoUnderlayArea[0],
      this.constructor.#photoUnderlayArea[1]
    );
    const imagePromises = [
      this.constructor.#generateCanvasImg(model.picture),
      this.constructor.#generateCanvasImg(this.logo)
    ];
    if (typeof model.signature !== typeof canvas) {
      imagePromises.push(this.constructor.#generateCanvasImg(model.signature));
    }
    const images = await Promise.all(imagePromises);
    this.constructor.#fillAreaWithImg(
      images[0], ctx,
      this.constructor.#photoXY[0],
      this.constructor.#photoXY[1],
      this.constructor.#photoArea[0],
      this.constructor.#photoArea[1]
    );
    this.constructor.#fitImgInArea(
      images[1], ctx,
      this.constructor.#logoFrontXY[0],
      this.constructor.#logoFrontXY[1],
      this.constructor.#logoArea[0],
      this.constructor.#logoArea[1]
    );
    if (typeof model.signature !== typeof canvas) {
      this.constructor.#fitImgInArea(
        images[2], ctx,
        this.constructor.#signatureXY[0],
        this.constructor.#signatureXY[1],
        this.constructor.#signatureArea[0],
        this.constructor.#signatureArea[1],
      );
    }
    else {
      ctx.drawImage(
        model.signature,
        this.constructor.#signatureXY[0],
        this.constructor.#signatureXY[1],
        this.constructor.#signatureArea[0],
        this.constructor.#signatureArea[1]
      );
    }

    ctx.fillStyle = this.headerColor;
    ctx.font = this.constructor.#mainHeaderFont;
    ctx.fillText(
      this.fullAuthority,
      Math.max(
        this.constructor.#mainHeaderX -
          ctx.measureText(this.fullAuthority).width,
        this.constructor.#frontColumns
      ),
      this.constructor.#mainHeaderY[0],
      this.constructor.#mainHeaderX - this.constructor.#frontColumns
    );
    ctx.font = this.constructor.#documentHeaderFont;
    let documentHeaderWidth = ctx.measureText(this.fullDocumentName).width;
    ctx.fillText(
      this.fullDocumentName,
      this.constructor.#mainHeaderX - documentHeaderWidth,
      this.constructor.#mainHeaderY[1]
    );
    ctx.font = this.constructor.#separatorHeaderFont;
    documentHeaderWidth += ctx.measureText(this.constructor.#headerSeparator).width;
    ctx.fillText(
      this.constructor.#headerSeparator,
      this.constructor.#mainHeaderX - documentHeaderWidth,
      this.constructor.#mainHeaderY[1]
    );
    ctx.font = this.constructor.#documentHeaderFont;
    documentHeaderWidth += ctx.measureText(`${model.typeCodeVIZ}-${model.authorityCodeVIZ}`).width;
    ctx.fillText(
      `${model.typeCodeVIZ}-${model.authorityCodeVIZ}`,
      this.constructor.#mainHeaderX - documentHeaderWidth,
      this.constructor.#mainHeaderY[1]
    );

    ctx.fillStyle = this.headerColor;
    ctx.font = this.constructor.#headerFont;
    ctx.fillText(
      this.nameHeader[0],
      this.constructor.#frontColumns,
      this.constructor.#frontRows[0]
    );
    ctx.fillText(
      this.genderHeader[0],
      this.constructor.#frontColumns,
      this.constructor.#frontRows[2]
    );
    ctx.fillText(
      this.nationalityHeader[0],
      this.constructor.#frontRow2Columns[0],
      this.constructor.#frontRows[2]
    );
    ctx.fillText(
      this.dateOfBirthHeader[0],
      this.constructor.#frontRow2Columns[1],
      this.constructor.#frontRows[2]
    );
    ctx.fillText(
      this.authorityHeader[0],
      this.constructor.#frontColumns,
      this.constructor.#frontRows[6]
    );
    ctx.fillText(
      this.privilegeHeader[0],
      this.constructor.#frontColumns,
      this.constructor.#frontRows[8]
    );
    ctx.fillText(
      this.numberHeader[0],
      this.constructor.#frontColumns,
      this.constructor.#frontRows[10]
    );
    ctx.fillText(
      this.dateOfExpirationHeader[0],
      this.constructor.#frontColumns,
      this.constructor.#frontRows[12]
    );
    const nameWidth = this.constructor.#frontColumns +
      ctx.measureText(this.nameHeader[0]).width;
    const genderWidth = this.constructor.#frontColumns +
      ctx.measureText(this.genderHeader[0]).width;
    const nationalityWidth = this.constructor.#frontRow2Columns[0] +
      ctx.measureText(this.nationalityHeader[0]).width;
    const dateOfBirthWidth = this.constructor.#frontRow2Columns[1] +
      ctx.measureText(this.dateOfBirthHeader[0]).width;
    const employerWidth = this.constructor.#frontColumns +
      ctx.measureText(this.authorityHeader[0]).width;
    const occupationWidth = this.constructor.#frontColumns +
      ctx.measureText(this.privilegeHeader[0]).width;
    const numberWidth = this.constructor.#frontColumns +
      ctx.measureText(this.numberHeader[0]).width;
    const dateOfExpirationWidth = this.constructor.#frontColumns +
      ctx.measureText(this.dateOfExpirationHeader[0]).width;
    
    ctx.font = this.constructor.#intlFont;
    ctx.fillText(
      `/ ${this.nameHeader[1]}/ ${this.nameHeader[2]}`,
      nameWidth,
      this.constructor.#frontRows[0]
    );
    ctx.fillText("/", genderWidth, this.constructor.#frontRows[2]);
    ctx.fillText(
      `${this.genderHeader[1]}/`,
      this.constructor.#frontColumns,
      this.constructor.#frontRows[3]
    );
    ctx.fillText(
      this.genderHeader[2],
      this.constructor.#frontColumns,
      this.constructor.#frontRows[4]
    );
    ctx.fillText("/", nationalityWidth, this.constructor.#frontRows[2]);
    ctx.fillText(
      `${this.nationalityHeader[1]}/`,
      this.constructor.#frontRow2Columns[0],
      this.constructor.#frontRows[3]
    );
    ctx.fillText(
      this.nationalityHeader[2],
      this.constructor.#frontRow2Columns[0],
      this.constructor.#frontRows[4]
    );
    ctx.fillText("/", dateOfBirthWidth, this.constructor.#frontRows[2]);
    ctx.fillText(
      `${this.dateOfBirthHeader[1]}/`,
      this.constructor.#frontRow2Columns[1],
      this.constructor.#frontRows[3]
    );
    ctx.fillText(
      this.dateOfBirthHeader[2],
      this.constructor.#frontRow2Columns[1],
      this.constructor.#frontRows[4]
    );
    ctx.fillText(
      `/ ${this.authorityHeader[1]}/ ${this.authorityHeader[2]}`,
      employerWidth,
      this.constructor.#frontRows[6]
    );
    ctx.fillText(
      `/ ${this.privilegeHeader[1]}/ ${this.privilegeHeader[2]}`,
      occupationWidth,
      this.constructor.#frontRows[8]
    );
    ctx.fillText(
      `/ ${this.numberHeader[1]}/ ${this.numberHeader[2]}`,
      numberWidth,
      this.constructor.#frontRows[10]
    );
    ctx.fillText(
      `/ ${this.dateOfExpirationHeader[1]}/ ${this.dateOfExpirationHeader[2]}`,
      dateOfExpirationWidth,
      this.constructor.#frontRows[12]
    );

    ctx.fillStyle = this.textColor;
    ctx.font = this.constructor.#dataFont;
    ctx.fillText(
      model.fullNameVIZ,
      this.constructor.#frontColumns,
      this.constructor.#frontRows[1],
      this.constructor.#mainHeaderX - this.constructor.#frontColumns
    );
    ctx.fillText(
      model.genderMarkerVIZ,
      this.constructor.#frontColumns,
      this.constructor.#frontRows[5]
    );
    ctx.fillText(
      model.nationalityCodeVIZ,
      this.constructor.#frontRow2Columns[0],
      this.constructor.#frontRows[5]
    );
    ctx.fillText(
      model.dateOfBirthVIZ,
      this.constructor.#frontRow2Columns[1],
      this.constructor.#frontRows[5]
    );
    ctx.fillText(
      model.authorityVIZ,
      this.constructor.#frontColumns,
      this.constructor.#frontRows[7],
      this.constructor.#mainHeaderX - this.constructor.#frontColumns
    );
    ctx.fillText(
      model.privilegeVIZ,
      this.constructor.#frontColumns,
      this.constructor.#frontRows[9],
      this.constructor.#mainHeaderX - this.constructor.#frontColumns
    );
    ctx.fillText(
      model.numberVIZ,
      this.constructor.#frontColumns,
      this.constructor.#frontRows[11]
    );
    ctx.fillText(
      model.dateOfExpirationVIZ,
      this.constructor.#frontColumns,
      this.constructor.#frontRows[13]
    );

    if (this.showGuides) {
      this.constructor.#drawBleedAndSafeLines(ctx);
    }

    return canvas;
  }

  /** @param { CrewLicense } model */
  /** @param { HTMLCanvasElement } fallback */
  async generateCardBack(model, fallback) {
    let canvas;
    if (typeof OffscreenCanvas === "undefined") {
      canvas = fallback;
      canvas.setAttribute("width", this.constructor.#cardArea[0]);
      canvas.setAttribute("height", this.constructor.#cardArea[1]);
    }
    else {
      canvas = new OffscreenCanvas(this.constructor.#cardArea[0], this.constructor.#cardArea[1]);
    }
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";

    ctx.fillStyle = this.backBackgroundColor;
    ctx.fillRect(
      0, 0,
      this.constructor.#cardArea[0],
      this.constructor.#cardArea[1]
    );
    if (this.backBackgroundImage) {
      const cardBackground = await this.constructor.#generateCanvasImg(
        this.backBackgroundImage
      );
      ctx.drawImage(
        cardBackground,
        0, 0,
        this.constructor.#cardArea[0],
        this.constructor.#cardArea[1]
      );
    }
    ctx.fillStyle = this.#logoUnderlayColorWithAlpha;
    ctx.fillRect(
      this.constructor.#logoUnderlayXY[0],
      this.constructor.#logoUnderlayXY[1],
      this.constructor.#logoUnderlayArea[0],
      this.constructor.#logoUnderlayArea[1]
    );
    ctx.fillStyle = this.mrzBackgroundColor;
    ctx.fillRect(
      this.constructor.#mrzUnderlayXY[0],
      this.constructor.#mrzUnderlayXY[1],
      this.constructor.#mrzUnderlayArea[0],
      this.constructor.#mrzUnderlayArea[1]
    );
    if (this.mrzBackgroundImage) {
      const mrzBackground = await this.constructor.#generateCanvasImg(
        this.mrzBackgroundImage
      );
      ctx.drawImage(
        mrzBackground,
        this.constructor.#mrzUnderlayXY[0],
        this.constructor.#mrzUnderlayXY[1],
        this.constructor.#mrzUnderlayArea[0],
        this.constructor.#mrzUnderlayArea[1]
      );
    }
    ctx.fillStyle = this.#numberUnderlayColorWithAlpha;
    ctx.fillRect(
      this.constructor.#numberUnderlayXY[0],
      this.constructor.#numberUnderlayXY[1],
      this.constructor.#numberUnderlayArea[0],
      this.constructor.#numberUnderlayArea[1]
    );
    console.log("Current Model:");
    console.log(model);
    let barcode;
    if (this.mrzInQRCode) {
      barcode = `${model.url}?mrz=${model.typeCodeMRZ}${model.authorityCodeMRZ}${model.numberVIZ}`;
    }
    else { barcode = model.url; }
    const images = await Promise.all([
      qrLite.toCanvas(barcode, {
        errorCorrectionLevel: this.barcodeErrorCorrection,
        margin: 0,
        width: this.constructor.#qrCodeArea,
        color: {
          dark: this.barcodeDarkColor,
          light: this.barcodeLightColor
        }
      }),
      this.constructor.#generateCanvasImg(this.logo),
      this.constructor.#generateCanvasImg(this.smallLogo)
    ]);
    ctx.drawImage(
      images[0],
      this.constructor.#qrCodeXY[0],
      this.constructor.#qrCodeXY[1],
      this.constructor.#qrCodeArea[0],
      this.constructor.#qrCodeArea[1]
    );
    this.constructor.#fitImgInArea(
      images[1], ctx,
      this.constructor.#logoBackXY[0],
      this.constructor.#logoBackXY[1],
      this.constructor.#logoArea[0],
      this.constructor.#logoArea[1]
    );
    ctx.drawImage(
      images[2],
      this.constructor.#smallLogoXY[0],
      this.constructor.#smallLogoXY[1],
      this.constructor.#smallLogoArea[0],
      this.constructor.#smallLogoArea[1]
    );
    ctx.fillStyle = this.textColor;
    ctx.font = this.constructor.#headerFont;
    ctx.fillText(
      `${model.typeCodeVIZ}-${model.authorityCodeVIZ}${this.constructor.#headerSeparator}${this.constructor.#documentSize}`,
      this.constructor.#shortHeaderXY[0],
      this.constructor.#shortHeaderXY[1],
      this.constructor.#smallLogoArea[0]
    );

    ctx.fillStyle = this.headerColor;
    ctx.font = this.constructor.#headerFont;
    ctx.fillText(
      this.ratingsHeader[0],
      this.constructor.#backColumns,
      this.constructor.#backRows[0]
    );
    ctx.fillText(
      this.limitationsHeader[0],
      this.constructor.#backColumns,
      this.constructor.#backRows[2]
    );
    const declarationWidth = this.constructor.#backColumns +
      ctx.measureText(this.ratingsHeader[0]).width;
    const issueWidth = this.constructor.#backColumns +
      ctx.measureText(this.limitationsHeader[0]).width;

    ctx.font = this.constructor.#intlFont;
    ctx.fillText(
      `/ ${this.ratingsHeader[1]}/ ${this.ratingsHeader[2]}`,
      declarationWidth,
      this.constructor.#backRows[0]
    );
    ctx.fillText(
      `/ ${this.limitationsHeader[1]}/ ${this.limitationsHeader[2]}`,
      issueWidth,
      this.constructor.#backRows[2]);

    ctx.fillStyle = this.textColor;
    ctx.font = this.constructor.#dataFont;
    let splitString = model.ratingsVIZ.split(/\r?\n/);
    for (let i = 0; i < splitString.length; i += 1) {
      ctx.fillText(
        splitString[i],
        this.constructor.#backColumns,
        this.constructor.#backRows[1] + (i * 30)
      );
    }
    splitString = model.limitationsVIZ.split(/\r?\n/);
    for (let i = 0; i < splitString.length; i += 1) {
      ctx.fillText(
        splitString[i],
        this.constructor.#backColumns,
        this.constructor.#backRows[3] + (i * 30)
      );
    }
    ctx.fillText(
      model.numberVIZ,
      this.constructor.#backNumberXY[0],
      this.constructor.#backNumberXY[1],
      1004 - this.constructor.#backNumberXY[0]
    );

    ctx.fillStyle = this.mrzColor;
    ctx.font = this.constructor.#mrzFont;
    for (let i = 0; i < model.mrzLine1.length; i += 1) {
      ctx.fillText(
        model.mrzLine1[i],
        this.constructor.#mrzX + (i * this.constructor.#mrzSpacing),
        this.constructor.#mrzY[0]
      );
      ctx.fillText(
        model.mrzLine2[i],
        this.constructor.#mrzX + (i * this.constructor.#mrzSpacing),
        this.constructor.#mrzY[1]
      );
      ctx.fillText(
        model.mrzLine3[i],
        this.constructor.#mrzX + (i * this.constructor.#mrzSpacing),
        this.constructor.#mrzY[2]
      );
    }

    if (this.showGuides) {
      this.constructor.#drawBleedAndSafeLines(ctx);
    }

    return canvas;
  }

  async loadCanvasFonts() {
    this.fonts.add(this.constructor.#mrzFontFace);
    this.fonts.add(this.constructor.#vizFontFace);
    this.fonts.add(this.constructor.#vizBoldFontFace);
    this.fonts.add(this.constructor.#vizItalicFontFace);
    this.fonts.add(this.constructor.#signatureFontFace);
    await Promise.all([
      this.constructor.#mrzFontFace.load(),
      this.constructor.#vizFontFace.load(),
      this.constructor.#vizBoldFontFace.load(),
      this.constructor.#vizItalicFontFace.load(),
      this.constructor.#signatureFontFace.load()
    ]);
  }

  // Text constants used in image generation (static)
  static #headerSeparator = " · ";
  static #documentSize = "TD1";

  // Font information used in card generation (static)
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
  static get #signatureFont() {
    return `61px ${this.#signatureFontFace.family}`;
  }

  // Coordinates used in card generation (static)
  static #mainHeaderX = 1004;
  static #mainHeaderY = [48, 85];
  static #photoUnderlayXY = [32, 0];
  static #photoXY = [48, 141];
  static #logoUnderlayXY = [618, 274];
  static #numberUnderlayXY = [871, 193];
  static #mrzUnderlayXY = [0, 379];
  static #shortHeaderXY = [886, 167];
  static #qrCodeXY = [618, 48];
  static #logoFrontXY = [48, 48];
  static #logoBackXY = [634, 290];
  static #smallLogoXY = [886, 48];
  static #signatureXY = [48, 543];
  static #backNumberXY = [888, 216];
  static #mrzX = 71;
  static #mrzY = [451, 501, 551];
  static #mrzSpacing = 30.35;
  static #frontColumns = 467;
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
    607, // Nationality Column
    802  // Date of Birth Column
  ];
  static #backRows = [
    48,  // Re-Entry Declaration Header
    75,  // Re-Entry Declaration Data
    221, // Date/Place of Issue Header
    248, // Date/Place of Issue Header (Alternate Language 1)
  ];

  // Areas used in card generation (static)
  static #cardArea = [1052, 672];
  static cutCardArea = [1020, 640];
  static #photoUnderlayArea = [402, 527];
  static #photoArea = [370, 370];
  static #logoUnderlayArea = [434, 93];
  static #numberUnderlayArea = [181, 65];
  static #mrzUnderlayArea = [1052, 293];
  static #qrCodeArea = [212, 212];
  static #logoArea = [370, 61];
  static #smallLogoArea = [103, 103];
  static #signatureArea = [370, 81];

  // Methods used in card generation (static)
  static #generateCanvasImg(img) {
    return new Promise((resolve, reject) => {
      const imgNode = new Image();
      imgNode.addEventListener(
        "load",
        () => { resolve(imgNode); },
        false
      );
      imgNode.src = img;
    });
  }
  static #fitImgInArea(img, ctx, x, y, width, height) {
    const hRatio = width / img.width;
    const vRatio = height / img.height;
    const ratio = Math.min(hRatio, vRatio);
    const centerShiftX = (width - img.width * ratio) / 2;
    const centerShiftY = (height - img.height * ratio) / 2;
    ctx.drawImage(
      img, 0, 0, img.width, img.height,
      x + centerShiftX, y + centerShiftY,
      img.width * ratio, img.height * ratio
    );
  }
  static #fillAreaWithImg(img, ctx, x, y, width, height) {
    const hRatio = width / img.width;
    const vRatio = height / img.height;
    const ratio = Math.max(hRatio, vRatio);
    const centerShiftX = (width - img.width * ratio) / 2;
    const centerShiftY = (height - img.height * ratio) / 2;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(
      img, 0, 0, img.width, img.height,
      x + centerShiftX, y + centerShiftY,
      img.width * ratio, img.height * ratio
    );
    ctx.restore();
  }
  static #drawBleedAndSafeLines(ctx) {
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 1;
    ctx.lineCap = "butt";
    const bleed = 16;
    ctx.beginPath();
    ctx.moveTo(0, bleed);
    ctx.lineTo(this.#cardArea[0], bleed);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, this.#cardArea[1] - bleed);
    ctx.lineTo(this.#cardArea[0], this.#cardArea[1] - bleed);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bleed, 0);
    ctx.lineTo(bleed, this.#cardArea[1]);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(this.#cardArea[0] - bleed, 0);
    ctx.lineTo(this.#cardArea[0] - bleed, this.#cardArea[1]);
    ctx.closePath(); ctx.stroke();

    ctx.strokeStyle = "#0000ff";
    const safe = 48;
    ctx.beginPath();
    ctx.moveTo(0, safe);
    ctx.lineTo(this.#cardArea[0], safe);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, this.#cardArea[1] - safe);
    ctx.lineTo(this.#cardArea[0], this.#cardArea[1] - safe);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(safe, 0);
    ctx.lineTo(safe, this.#cardArea[1]);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(this.#cardArea[0] - safe, 0);
    ctx.lineTo(this.#cardArea[0] - safe, this.#cardArea[1]);
    ctx.closePath(); ctx.stroke();
  }
  * generateNewSignatureFromText(canvasFallback) {
    let oldSignature = "";
    let signature = "";
    let canvas;

    while (true) {
      signature = yield;
      if (oldSignature === signature) {
        yield { newSignature: false, signature: canvas };
      }
      else {
        oldSignature = signature;
        canvas = this.#generateSignatureFromText(signature, canvasFallback);
        yield { newSignature: true, signature: canvas };
      }
    }
  }
  #generateSignatureFromText(signature, canvasFallback) {
    let canvas;
    let ctx;
    if (typeof OffscreenCanvas === "undefined") {
      canvas = canvasFallback;
      canvas.width = this.constructor.#signatureArea[0];
      canvas.height = this.constructor.#signatureArea[1];
    }
    else {
      canvas = new OffscreenCanvas(this.constructor.#signatureArea[0], this.constructor.#signatureArea[1]);
    }
    ctx = canvas.getContext("2d");
    ctx.fillStyle = this.textColor;
    ctx.font = this.constructor.#signatureFont;
    ctx.textBaseline = "top";
    const centerShift = (canvas.width - ctx.measureText(signature).width) / 2;
    ctx.fillText(
      signature, Math.max(centerShift, 0), 8,
      this.constructor.#signatureArea[0] - 6
    );
    return canvas;
  }

  // Constructor
  constructor(opt) {
    if (opt) {
      if (opt.headerColor) { this.headerColor = opt.headerColor; }
      if (opt.textColor) { this.textColor = opt.textColor; }
      if (opt.mrzColor) { this.mrzColor = opt.mrzColor; }
      if (opt.frontBackgroundColor) { this.frontBackgroundColor = opt.frontBackgroundColor; }
      if (opt.frontBackgroundImage) { this.frontBackgroundImage = opt.frontBackgroundImage; }
      if (opt.backBackgroundColor) { this.backBackgroundColor = opt.backBackgroundColor; }
      if (opt.backBackgroundImage) { this.backBackgroundImage = opt.backBackgroundImage; }
      if (opt.mrzBackgroundColor) { this.mrzBackgroundColor = opt.mrzBackgroundColor; }
      if (opt.mrzBackgroundImage) { this.mrzBackgroundImage = opt.mrzBackgroundImage; }
      if (opt.numberUnderlayColor) { this.numberUnderlayColor = opt.numberUnderlayColor; }
      if (opt.numberUnderlayAlpha) { this.numberUnderlayAlpha = opt.numberUnderlayAlpha; }
      if (opt.logoUnderlayColor) { this.logoUnderlayColor = opt.logoUnderlayColor; }
      if (opt.logoUnderlayAlpha) { this.logoUnderlayAlpha = opt.logoUnderlayAlpha; }
      if (opt.logo) { this.logo = opt.logo; }
      if (opt.smallLogo) { this.smallLogo = opt.smallLogo; }
      if (opt.mrzInQRCode !== undefined) { this.mrzInQRCode = opt.mrzInQRCode; }
      if (opt.showGuides !== undefined) { this.showGuides = opt.showGuides; }
      if (opt.fullAuthority) { this.fullAuthority = opt.fullAuthority; }
      if (opt.fullDocumentName) { this.fullDocumentName = opt.fullDocumentName; }
      if (opt.nameHeader) { this.nameHeader = opt.nameHeader; }
      if (opt.genderHeader) { this.genderHeader = opt.genderHeader; }
      if (opt.nationalityHeader) { this.nationalityHeader = opt.nationalityHeader; }
      if (opt.dateOfBirthHeader) { this.dateOfBirthHeader = opt.dateOfBirthHeader; }
      if (opt.authorityHeader) { this.authorityHeader = opt.authorityHeader; }
      if (opt.privilegeHeader) { this.privilegeHeader = opt.privilegeHeader; }
      if (opt.numberHeader) { this.numberHeader = opt.numberHeader; }
      if (opt.dateOfExpirationHeader) { this.dateOfExpirationHeader = opt.dateOfExpirationHeader; }
      if (opt.ratingsHeader) { this.ratingsHeader = opt.ratingsHeader; }
      if (opt.limitationsHeader) { this.limitationsHeader = opt.limitationsHeader; }
    }
  }
}

export { CrewLicenseRenderer };