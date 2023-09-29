/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { CrewID } from "/modules/CrewID.js";
import * as b45 from "/modules/base45-ts/base45.js";
import * as qrLite from "/modules/qrcode-lite/qrcode.mjs";

class IDBadgeRenderer {
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
  showGuides;
  showPunchSlot;
  additionalElements;
  badgeType;
  badgeSubtype;
  nameHeader;
  employerHeader;
  numberHeader;
  dateOfExpirationHeader;
  additionalElementsHeader;
  fonts;
  useDigitalSeal = true;

  // Public Methods
  /** @param { CrewID } model */
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
    const images = await Promise.all([
      qrLite.toCanvas(model.url, {
        errorCorrectionLevel: this.barcodeErrorCorrection,
        margin: 0,
        width: this.constructor.#frontQRCodeArea[0],
        color: {
          dark: this.barcodeDarkColor,
          light: this.barcodeLightColor
        }
      }),
      this.constructor.#generateCanvasImg(model.picture),
      this.constructor.#generateCanvasImg(this.logo)
    ]);
    ctx.drawImage(
      images[0],
      this.constructor.#frontColumns[1],
      this.constructor.#frontRows[2],
      this.constructor.#frontQRCodeArea[0],
      this.constructor.#frontQRCodeArea[1]
    );
    this.constructor.#fillAreaWithImg(
      images[1], ctx,
      this.constructor.#frontColumns[0],
      this.constructor.#frontRows[3],
      this.constructor.#photoArea[0],
      this.constructor.#photoArea[1]
    );
    this.constructor.#fitImgInArea(
      images[2], ctx,
      this.constructor.#frontColumns[0],
      this.constructor.#frontRows[4],
      this.constructor.#logoArea[0],
      this.constructor.#logoArea[1]
    );

    ctx.fillStyle = this.headerColor;
    ctx.font = this.constructor.#badgeSubtypeFont;
    ctx.fillText(
      this.badgeSubtype,
      this.constructor.#frontColumns[1],
      this.constructor.#frontRows[0],
      this.constructor.#cardArea[0] - this.constructor.#frontColumns[1] - 48
    );

    ctx.fillStyle = this.headerColor;
    ctx.font = this.constructor.#badgeTypeFont;
    ctx.fillText(
      this.badgeType,
      this.constructor.#frontColumns[1],
      this.constructor.#frontRows[1],
      this.constructor.#cardArea[0] - this.constructor.#frontColumns[1] - 48
    );

    ctx.fillStyle = this.headerColor;
    ctx.font = this.constructor.#headerFont;
    ctx.fillText(
      this.nameHeader[0],
      this.constructor.#frontColumns[0],
      this.constructor.#frontRows[5]
    );
    ctx.fillText(
      this.employerHeader[0],
      this.constructor.#frontColumns[0],
      this.constructor.#frontRows[7]
    );
    ctx.fillText(
      this.numberHeader[0],
      this.constructor.#frontColumns[0],
      this.constructor.#frontRows[9]
    );
    ctx.fillText(
      this.dateOfExpirationHeader[0],
      this.constructor.#frontColumns[0],
      this.constructor.#frontRows[11]
    );
    const nameWidth = this.constructor.#frontColumns[0] +
      ctx.measureText(this.nameHeader[0]).width;
    const employerWidth = this.constructor.#frontColumns[0] +
      ctx.measureText(this.employerHeader[0]).width;
    const numberWidth = this.constructor.#frontColumns[0] +
      ctx.measureText(this.numberHeader[0]).width;
    const dateOfExpirationWidth = this.constructor.#frontColumns[0] +
      ctx.measureText(this.dateOfExpirationHeader[0]).width;
    
    ctx.font = this.constructor.#intlFont;
    ctx.fillText(
      `/ ${this.nameHeader[1]}/ ${this.nameHeader[2]}`,
      nameWidth,
      this.constructor.#frontRows[5]
    );
    ctx.fillText(
      `/ ${this.employerHeader[1]}/ ${this.employerHeader[2]}`,
      employerWidth,
      this.constructor.#frontRows[7]
    );
    ctx.fillText(
      `/ ${this.numberHeader[1]}/ ${this.numberHeader[2]}`,
      numberWidth,
      this.constructor.#frontRows[9]
    );
    ctx.fillText(
      `/ ${this.dateOfExpirationHeader[1]}/ ${this.dateOfExpirationHeader[2]}`,
      dateOfExpirationWidth,
      this.constructor.#frontRows[11]
    );

    ctx.fillStyle = this.textColor;
    ctx.font = this.constructor.#dataFont;
    ctx.fillText(
      model.fullNameVIZ,
      this.constructor.#frontColumns[0],
      this.constructor.#frontRows[6],
      this.constructor.#cardArea[0] - this.constructor.#frontColumns[0] - 48
    );
    ctx.fillText(
      model.employerVIZ,
      this.constructor.#frontColumns[0],
      this.constructor.#frontRows[8],
      this.constructor.#cardArea[0] - this.constructor.#frontColumns[0] - 48
    );
    ctx.fillText(
      model.numberVIZ,
      this.constructor.#frontColumns[0],
      this.constructor.#frontRows[10]
    );
    ctx.fillText(
      model.dateOfExpirationVIZ,
      this.constructor.#frontColumns[0],
      this.constructor.#frontRows[12]
    );

    if (this.showGuides) {
      this.constructor.#drawBleedAndSafeLines(ctx);
    }
    if (this.showPunchSlot) {
      this.constructor.#drawPunchSlot(ctx);
    }

    return canvas;
  }

  /** @param { CrewID } model */
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
    ctx.translate(this.constructor.#cardArea[0], 0);
    ctx.rotate(90 * Math.PI / 180);

    ctx.fillStyle = this.backBackgroundColor;
    ctx.fillRect(
      0, 0,
      this.constructor.#cardArea[1],
      this.constructor.#cardArea[0]
    );
    if (this.backBackgroundImage) {
      const cardBackground = await this.constructor.#generateCanvasImg(
        this.backBackgroundImage
      );
      ctx.drawImage(
        cardBackground,
        0, 0,
        this.constructor.#cardArea[1],
        this.constructor.#cardArea[0]
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
    let barcode;
    if (this.useDigitalSeal) {
      barcode = [{ data: `VDS:/${b45.encode(model.signedSeal)}`, mode: "alphanumeric" }];
    } else {
      barcode = model.url;
    }
    const images = await Promise.all([
      qrLite.toCanvas(barcode, {
        errorCorrectionLevel: this.barcodeErrorCorrection,
        margin: 0,
        width: this.constructor.#backQRCodeArea[0],
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
      this.constructor.#backQRCodeXY[0],
      this.constructor.#backQRCodeXY[1],
      this.constructor.#backQRCodeArea[0],
      this.constructor.#backQRCodeArea[1]
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
      this.additionalElementsHeader[0],
      this.constructor.#backColumns,
      this.constructor.#backRows[0]
    );
    const additionalElementsWidth = this.constructor.#backColumns +
      ctx.measureText(this.additionalElementsHeader[0]).width;

    ctx.font = this.constructor.#intlFont;
    ctx.fillText(
      "/",
      additionalElementsWidth,
      this.constructor.#backRows[0]
    );
    ctx.fillText(
      `${this.additionalElementsHeader[1]}/`,
      this.constructor.#backColumns,
      this.constructor.#backRows[1]
    );
    ctx.fillText(
      `${this.additionalElementsHeader[2]}`,
      this.constructor.#backColumns,
      this.constructor.#backRows[2]
    );

    ctx.fillStyle = this.textColor;
    ctx.font = this.constructor.#dataFont;
    const splitString = this.additionalElements.split(/\r?\n/);
    for (let i = 0; i < splitString.length; i += 1) {
      ctx.fillText(
        splitString[i],
        this.constructor.#backColumns,
        this.constructor.#backRows[3] + (i * 33)
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

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (this.showGuides) {
      this.constructor.#drawBleedAndSafeLines(ctx);
    }
    if (this.showPunchSlot) {
      this.constructor.#drawPunchSlot(ctx);
    }

    return canvas;
  }

  async loadCanvasFonts() {
    this.fonts.add(this.constructor.#mrzFontFace);
    this.fonts.add(this.constructor.#vizFontFace);
    this.fonts.add(this.constructor.#vizBoldFontFace);
    this.fonts.add(this.constructor.#vizItalicFontFace);
    await Promise.all([
      this.constructor.#mrzFontFace.load(),
      this.constructor.#vizFontFace.load(),
      this.constructor.#vizBoldFontFace.load(),
      this.constructor.#vizItalicFontFace.load()
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
  static get #mainHeaderFont() {
    return `bold 24px ${this.#vizFontFace.family}`;
  }
  static get #documentHeaderFont() {
    return `18px ${this.#vizFontFace.family}`;
  }
  static get #separatorHeaderFont() {
    return `bold 18px ${this.#vizFontFace.family}`;
  }
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

  // Coordinates used in card generation (static)
  static #badgeTypeHeaderY = [48, 85];
  static #photoUnderlayXY = [32, 0];
  static #logoUnderlayXY = [618, 274];
  static #numberUnderlayXY = [871, 193];
  static #mrzUnderlayXY = [0, 379];
  static #shortHeaderXY = [886, 167];
  static #backQRCodeXY = [618, 48];
  static #logoBackXY = [634, 290];
  static #smallLogoXY = [886, 48];
  static #backNumberXY = [888, 216];
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
    663, // Name Header
    690, // Name Data
    746, // Employer Header
    773, // Employer Data
    829, // Number Header
    856, // Number Data
    912, // Date of Expiration Header
    939  // Date of Expiration Data
  ];
  static #backRows = [
    48,  // Additional Elements Header
    73,  // Additional Elements Header (Alternate Language 1)
    98,  // Additional Elements Header (Alternate Language 2)
    125  // Additional Elements Data
  ];

  // Areas used in card generation (static)
  static #cardArea = [672, 1052];
  static cutCardArea = [640, 1020];
  static #photoUnderlayArea = [402, 624];
  static #photoArea = [370, 370];
  static #logoUnderlayArea = [434, 93];
  static #numberUnderlayArea = [181, 65];
  static #mrzUnderlayArea = [1052, 293];
  static #frontQRCodeArea = [158, 158];
  static #backQRCodeArea = [212, 212];
  static #logoArea = [370, 61];
  static #smallLogoArea = [103, 103];

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
      if (opt.showPunchSlot) { this.showPunchSlot = opt.showPunchSlot; }
      if (opt.showGuides !== undefined) { this.showGuides = opt.showGuides; }
      if (opt.additionalElements !== undefined) { this.additionalElements = opt.additionalElements; }
      if (opt.badgeType) { this.badgeType = opt.badgeType; }
      if (opt.badgeSubtype) { this.badgeSubtype = opt.badgeSubtype; }
      if (opt.nameHeader) { this.nameHeader = opt.nameHeader; }
      if (opt.employerHeader) { this.employerHeader = opt.employerHeader; }
      if (opt.numberHeader) { this.numberHeader = opt.numberHeader; }
      if (opt.dateOfExpirationHeader) { this.dateOfExpirationHeader = opt.dateOfExpirationHeader; }
      if (opt.additionalElementsHeader) { this.additionalElementsHeader = opt.additionalElementsHeader; }
    }
  }
}

export { IDBadgeRenderer };