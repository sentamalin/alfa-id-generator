/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { EventsMRVB } from "/modules/EventsMRVB.js";
import * as b45 from "/modules/base45-ts/base45.js";
import * as qrLite from "/modules/qrcode-lite/qrcode.mjs";

class EventsSealRenderer {
  // Customizable Presentation Data
  barcodeDarkColor = "#000000ff";
  barcodeLightColor = "#00000000";
  barcodeErrorCorrection = "L";
  headerColor; // Defines background color around picture and header text color
  textColor; // Defines data text color
  frontBackgroundColor; // Defines a solid color when no front image is used
  frontBackgroundImage; // Defines a front image to use for a background
  logo; // Defines the authority logo
  showGuides;
  fullAuthority;
  fullDocumentName;
  fonts;

  // Public Methods
  /** @param { EventsMRVB } model */
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
    console.log("Current Model:");
    console.log(model);
    const sealDataB45 = `VDS:/${b45.encode(model.signedSeal)}`;
    const images = await Promise.all([
      this.constructor.#generateCanvasImg(this.logo),
      qrLite.toCanvas([
        { data: sealDataB45, mode: "alphanumeric" }
      ],{
        errorCorrectionLevel: "L",
        margin: 0,
        width: this.constructor.#qrCodeArea,
        color: {
          dark: this.barcodeDarkColor,
          light: this.barcodeLightColor
        }
      })
    ]);
    this.constructor.#fitImgInArea(
      images[0], ctx,
      this.constructor.#logoXY[0],
      this.constructor.#logoXY[1],
      this.constructor.#logoArea,
      this.constructor.#logoArea
    );
    ctx.drawImage(
      images[1],
      this.constructor.#qrCodeXY[0],
      this.constructor.#qrCodeXY[1],
      this.constructor.#qrCodeArea,
      this.constructor.#qrCodeArea
    );

    ctx.fillStyle = this.headerColor;
    ctx.font = this.constructor.#headerFont;
    ctx.fillText(
      this.fullAuthority,
      Math.max(
        this.constructor.#cardArea[0] - this.constructor.#safe - ctx.measureText(this.fullAuthority).width,
        this.constructor.#textX
      ),
      this.constructor.#textY[0],
      this.constructor.#textArea[0]
    );
    const documentType = `${model.typeCodeVIZ}-${model.authorityCodeVIZ}` +
      this.constructor.#headerSeparator + this.fullDocumentName;
    ctx.fillText(
      documentType,
      Math.max(
        this.constructor.#cardArea[0] - this.constructor.#safe - ctx.measureText(documentType).width,
        this.constructor.#textX
      ),
      this.constructor.#textY[1],
      this.constructor.#textArea[0]
    );
    ctx.font = this.constructor.#dataFont;
    ctx.fillStyle = this.textColor;
    let numberWidth = this.constructor.#cardArea[0] - this.constructor.#safe - ctx.measureText(model.issueDate).width;
    ctx.fillText(
      model.issueDate,
      numberWidth,
      this.constructor.#textY[2]
    );
    ctx.font = this.constructor.#headerFont;
    ctx.fillStyle = this.headerColor;
    numberWidth -= ctx.measureText("I: ").width;
    ctx.fillText(
      "I: ",
      numberWidth,
      this.constructor.#textY[2]
    );
    ctx.font = this.constructor.#dataFont;
    ctx.fillStyle = this.textColor;
    numberWidth -= ctx.measureText(`${model.number} `).width;
    ctx.fillText(
      `${model.number} `,
      numberWidth,
      this.constructor.#textY[2]
    );
    ctx.font = this.constructor.#headerFont;
    ctx.fillStyle = this.headerColor;
    numberWidth -= ctx.measureText("DOC NO: ").width;
    ctx.fillText(
      "DOC NO: ",
      numberWidth,
      this.constructor.#textY[2]
    );

    ctx.font = this.constructor.#dataFont;
    ctx.fillStyle = this.textColor;
    let passportWidth = this.constructor.#cardArea[0] - this.constructor.#safe - ctx.measureText(model.validThru).width;
    ctx.fillText(
      model.validThru,
      passportWidth,
      this.constructor.#textY[3]
    );
    ctx.font = this.constructor.#headerFont;
    ctx.fillStyle = this.headerColor;
    passportWidth -= ctx.measureText("T: ").width;
    ctx.fillText(
      "T: ",
      passportWidth,
      this.constructor.#textY[3]
    );
    ctx.font = this.constructor.#dataFont;
    ctx.fillStyle = this.textColor;
    passportWidth -= ctx.measureText(`${model.passportNumberVIZ} `).width;
    ctx.fillText(
      `${model.passportNumberVIZ} `,
      passportWidth,
      this.constructor.#textY[3]
    );
    ctx.font = this.constructor.#headerFont;
    ctx.fillStyle = this.headerColor;
    passportWidth -= ctx.measureText("PASS NO: ").width;
    ctx.fillText(
      "PASS NO: ",
      passportWidth,
      this.constructor.#textY[3]
    );

    if (this.showGuides) {
      this.constructor.#drawBleedAndSafeLines(ctx);
    }

    return canvas;
  }

  async loadCanvasFonts() {
    this.fonts.add(this.constructor.#vizFontFace);
    this.fonts.add(this.constructor.#vizBoldFontFace);
    await Promise.all([
      this.constructor.#vizFontFace.load(),
      this.constructor.#vizBoldFontFace.load()
    ]);
  }

  // Text constants used in image generation (static)
  static #headerSeparator = " · ";

  // Font information used in card generation (static)
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

  // Coordinates used in card generation (static)
  static get #textX() { return 48 + this.#logoArea + 24 }
  static #textY = [
    48,
    73,
    98,
    123
  ];
  static #logoXY = [48, 48];
  static get #qrCodeXY() {
    return [
      this.#safe,
      this.#cardArea[1] - this.#safe - this.#qrCodeArea
    ];
  }

  // Areas used in card generation (static)
  static #cardArea = [511, 627];
  static get cutCardArea() {
    return [
      this.#cardArea[0] - (this.#bleed * 2),
      this.#cardArea[1] - (this.#bleed * 2)
    ];
  }
  static #bleed = 16;
  static #safe = 48;
  static #logoArea = 93;
  static get #textArea() { return [
    this.#cardArea[0] - (this.#safe * 2) - this.#logoArea - 24,
    this.#cardArea[1] - this.#safe - this.#qrCodeArea - 24
  ]; }
  static #qrCodeArea = 256;

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

  // Constructor
  constructor(opt) {
    if (opt) {
      if (opt.headerColor) { this.headerColor = opt.headerColor; }
      if (opt.textColor) { this.textColor = opt.textColor; }
      if (opt.mrzColor) { this.mrzColor = opt.mrzColor; }
      if (opt.frontBackgroundColor) { this.frontBackgroundColor = opt.frontBackgroundColor; }
      if (opt.frontBackgroundImage) { this.frontBackgroundImage = opt.frontBackgroundImage; }
      if (opt.mrzBackgroundColor) { this.mrzBackgroundColor = opt.mrzBackgroundColor; }
      if (opt.mrzBackgroundImage) { this.mrzBackgroundImage = opt.mrzBackgroundImage; }
      if (opt.logoUnderlayColor) { this.logoUnderlayColor = opt.logoUnderlayColor; }
      if (opt.logoUnderlayAlpha) { this.logoUnderlayAlpha = opt.logoUnderlayAlpha; }
      if (opt.logo) { this.logo = opt.logo; }
      if (opt.mrzInQRCode !== undefined) { this.mrzInQRCode = opt.mrzInQRCode; }
      if (opt.showGuides !== undefined) { this.showGuides = opt.showGuides; }
      if (opt.fullAuthority) { this.fullAuthority = opt.fullAuthority; }
      if (opt.fullDocumentName) { this.fullDocumentName = opt.fullDocumentName; }
      if (opt.placeOfIssueHeader) { this.placeOfIssueHeader = opt.placeOfIssueHeader; }
      if (opt.validFromHeader) { this.validFromHeader = opt.validFromHeader; }
      if (opt.validThruHeader) { this.validThruHeader = opt.validThruHeader; }
      if (opt.numberOfEntriesHeader) { this.numberOfEntriesHeader = opt.numberOfEntriesHeader; }
      if (opt.numberHeader) { this.numberHeader = opt.numberHeader; }
      if (opt.typeHeader) { this.typeHeader = opt.typeHeader; }
      if (opt.additionalInfoHeader) { this.additionalInfoHeader = opt.additionalInfoHeader; }
      if (opt.nameHeader) { this.nameHeader = opt.nameHeader; }
      if (opt.passportNumberHeader) { this.passportNumberHeader = opt.passportNumberHeader; }
      if (opt.nationalityHeader) { this.nationalityHeader = opt.nationalityHeader; }
      if (opt.dateOfBirthHeader) { this.dateOfBirthHeader = opt.dateOfBirthHeader; }
      if (opt.genderHeader) { this.genderHeader = opt.genderHeader; }
    }
  }
}

export { EventsSealRenderer };