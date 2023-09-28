/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { EventsPassport } from "/modules/EventsPassport.js";
import * as b45 from "/modules/base45-ts/base45.js";
import * as qrLite from "/modules/qrcode-lite/qrcode.mjs";

class EventsPassportRenderer {
  // Customizable Presentation Data
  headerColor; // Defines background color around picture and header text color
  textColor; // Defines data text color
  mrzColor;
  passportHeaderColor;
  barcodeDarkColor = "#000000ff";
  barcodeLightColor = "#00000000";
  barcodeErrorCorrection = "L";
  frontBackgroundColor; // Defines a solid color when no front image is used
  frontBackgroundImage; // Defines a front image to use for a background
  backBackgroundColor; // Defines a solid color when no back image is used
  backBackgroundImage; // Defines a back image to use for a background
  mrzBackgroundColor; // Defines a solid color when no MRZ underlay is used
  mrzBackgroundImage; // Defines an image to use for the MRZ underlay
  logoUnderlayColor;
  logoUnderlayAlpha = 255;
  get #logoUnderlayColorWithAlpha() {
    return `${this.logoUnderlayColor}${this.logoUnderlayAlpha.toString(16).padStart(2, "0")}`;
  }
  logo; // Defines the authority logo
  mrzInQRCode;
  showGuides;
  fullAuthority;
  fullDocumentName;
  passportHeader;
  documentHeader;
  authorityHeader;
  numberHeader;
  nameHeader;
  nationalityHeader;
  dateOfBirthHeader;
  genderHeader;
  placeOfBirthHeader;
  issueHeader;
  dateOfExpirationHeader;
  endorsementsHeader;
  signatureHeader;
  fonts;

  // Public Methods
  /** @param { EventsPassport } model */
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
    ctx.fillStyle = this.mrzBackgroundColor;
    ctx.fillRect(
      this.constructor.#mrzUnderlayXY[0], this.constructor.#mrzUnderlayXY[1],
      this.constructor.#mrzUnderlayArea[0], this.constructor.#mrzUnderlayArea[1]
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
    ctx.fillStyle = this.#logoUnderlayColorWithAlpha;
    ctx.fillRect(
      this.constructor.#photoUnderlayXY[0],
      this.constructor.#photoUnderlayXY[1],
      this.constructor.#photoUnderlayArea[0],
      this.constructor.#photoUnderlayArea[1]
    );
    console.log("Current Model:");
    console.log(model);
    let barcode;
    if (this.mrzInQRCode) {
      barcode = `${model.url}?mrz=${model.typeCodeMRZ}${model.authorityCodeMRZ}${model.numberVIZ}`;
    }
    else { barcode = model.url; }
    const images = await Promise.all([
      this.constructor.#generateCanvasImg(model.picture),
      this.constructor.#generateCanvasImg(this.logo),
      qrLite.toCanvas(barcode, {
        errorCorrectionLevel: this.barcodeErrorCorrection,
        margin: 0,
        width: this.constructor.#qrCodeArea,
        color: {
          dark: this.barcodeDarkColor,
          light: this.barcodeLightColor
        }
      })
    ]);
    this.constructor.#fillAreaWithImg(
      images[0], ctx,
      this.constructor.#photoXY[0],
      this.constructor.#photoXY[1],
      this.constructor.#photoArea[0],
      this.constructor.#photoArea[1]
    );
    this.constructor.#fitImgInArea(
      images[1], ctx,
      this.constructor.#logoXY[0],
      this.constructor.#logoXY[1],
      this.constructor.#logoArea,
      this.constructor.#logoArea
    );
    ctx.drawImage(
      images[2],
      this.constructor.#qrCodeXY[0],
      this.constructor.#qrCodeXY[1],
      this.constructor.#qrCodeArea,
      this.constructor.#qrCodeArea
    );

    ctx.fillStyle = this.passportHeaderColor;
    ctx.font = this.constructor.#passportHeaderFont;
    for (let i = 0; i < this.passportHeader.length; i += 1) {
      ctx.fillText(
        this.passportHeader[i],
        this.constructor.#passportHeaderX,
        this.constructor.#passportHeaderY[i]
      );
    }

    ctx.fillStyle = this.headerColor;
    ctx.font = this.constructor.#mainHeaderFont;
    ctx.fillText(
      this.fullAuthority,
      Math.max(
        this.constructor.#documentX[2] -
          ctx.measureText(this.fullAuthority).width,
        this.constructor.#dataX[0]
      ),
      this.constructor.#documentY[0],
      this.constructor.#documentX[2] - this.constructor.#dataX[0]
    );
    ctx.font = this.constructor.#documentHeaderFont;
    let documentHeaderWidth = ctx.measureText(this.fullDocumentName).width;
    ctx.fillText(
      this.fullDocumentName,
      this.constructor.#documentX[2] - documentHeaderWidth,
      this.constructor.#documentY[1]
    );
    ctx.font = this.constructor.#separatorHeaderFont;
    documentHeaderWidth += ctx.measureText(this.constructor.#headerSeparator).width;
    ctx.fillText(
      this.constructor.#headerSeparator,
      this.constructor.#documentX[2] - documentHeaderWidth,
      this.constructor.#documentY[1]
    );
    ctx.font = this.constructor.#documentHeaderFont;
    documentHeaderWidth += ctx.measureText(`${model.typeCodeVIZ}-${model.authorityCodeVIZ}`).width;
    ctx.fillText(
      `${model.typeCodeVIZ}-${model.authorityCodeVIZ}`,
      this.constructor.#documentX[2] - documentHeaderWidth,
      this.constructor.#documentY[1]
    );

    ctx.fillStyle = this.headerColor;
    ctx.font = this.constructor.#intlFont;
    const intlSeparatorWidth = ctx.measureText("/").width;
    ctx.font = this.constructor.#headerFont;
    ctx.fillText(
      this.documentHeader[0],
      this.constructor.#documentX[0] - ctx.measureText(this.documentHeader[0]).width - intlSeparatorWidth,
      this.constructor.#documentY[2]
    );
    ctx.fillText(
      this.authorityHeader[0],
      this.constructor.#documentX[1] - ctx.measureText(this.authorityHeader[0]).width - intlSeparatorWidth,
      this.constructor.#documentY[2]
    );
    ctx.fillText(
      this.numberHeader[0],
      this.constructor.#documentX[2] - ctx.measureText(this.numberHeader[0]).width - intlSeparatorWidth,
      this.constructor.#documentY[2]
    );
    ctx.fillText(
      this.nameHeader[0],
      this.constructor.#dataX[0],
      this.constructor.#dataY[0]
    );
    ctx.fillText(
      this.nationalityHeader[0],
      this.constructor.#dataX[0],
      this.constructor.#dataY[2]
    );
    ctx.fillText(
      this.dateOfBirthHeader[0],
      this.constructor.#dataX[1],
      this.constructor.#dataY[2]
    );
    ctx.fillText(
      this.genderHeader[0],
      this.constructor.#dataX[2],
      this.constructor.#dataY[2]
    );
    ctx.fillText(
      this.placeOfBirthHeader[0],
      this.constructor.#dataX[3],
      this.constructor.#dataY[2]
    );
    ctx.fillText(
      this.issueHeader[0],
      this.constructor.#dataX[0],
      this.constructor.#dataY[6]
    );
    ctx.fillText(
      this.authorityHeader[0],
      this.constructor.#dataX[0],
      this.constructor.#dataY[8]
    );
    ctx.fillText(
      this.dateOfExpirationHeader[0],
      this.constructor.#dataX[0],
      this.constructor.#dataY[10]
    );
    ctx.fillText(
      this.endorsementsHeader[0],
      this.constructor.#dataX[0],
      this.constructor.#dataY[12]
    );
    const nameWidth = this.constructor.#dataX[0] +
      ctx.measureText(this.nameHeader[0]).width;
    const nationalityWidth = this.constructor.#dataX[0] +
      ctx.measureText(this.nationalityHeader[0]).width;
    const dateOfBirthWidth = this.constructor.#dataX[1] +
      ctx.measureText(this.dateOfBirthHeader[0]).width;
    const genderWidth = this.constructor.#dataX[2] +
      ctx.measureText(this.genderHeader[0]).width;
    const placeOfBirthWidth = this.constructor.#dataX[3] +
      ctx.measureText(this.placeOfBirthHeader[0]).width;
    const issueWidth = this.constructor.#dataX[0] +
      ctx.measureText(this.issueHeader[0]).width;
    const authorityWidth = this.constructor.#dataX[0] +
      ctx.measureText(this.authorityHeader[0]).width;
    const dateOfExpirationWidth = this.constructor.#dataX[0] +
      ctx.measureText(this.dateOfExpirationHeader[0]).width;
    const endorsementsWidth = this.constructor.#dataX[0] +
      ctx.measureText(this.endorsementsHeader[0]).width;
    
    ctx.font = this.constructor.#intlFont;
    ctx.fillText(
      "/",
      this.constructor.#documentX[0] - intlSeparatorWidth,
      this.constructor.#documentY[2]
    );
    ctx.fillText(
      `${this.documentHeader[1]}/`,
      this.constructor.#documentX[0] - ctx.measureText(`${this.documentHeader[1]}/`).width,
      this.constructor.#documentY[3]
    );
    ctx.fillText(
      this.documentHeader[2],
      this.constructor.#documentX[0] - ctx.measureText(this.documentHeader[2]).width,
      this.constructor.#documentY[4]
    );
    ctx.fillText(
      "/",
      this.constructor.#documentX[1] - intlSeparatorWidth,
      this.constructor.#documentY[2]
    );
    ctx.fillText(
      `${this.authorityHeader[1]}/`,
      this.constructor.#documentX[1] - ctx.measureText(`${this.authorityHeader[1]}/`).width,
      this.constructor.#documentY[3]
    );
    ctx.fillText(
      this.authorityHeader[2],
      this.constructor.#documentX[1] - ctx.measureText(this.authorityHeader[2]).width,
      this.constructor.#documentY[4]
    );
    ctx.fillText(
      "/",
      this.constructor.#documentX[2] - intlSeparatorWidth,
      this.constructor.#documentY[2]
    );
    ctx.fillText(
      `${this.numberHeader[1]}/`,
      this.constructor.#documentX[2] - ctx.measureText(`${this.numberHeader[1]}/`).width,
      this.constructor.#documentY[3]
    );
    ctx.fillText(
      this.numberHeader[2],
      this.constructor.#documentX[2] - ctx.measureText(this.numberHeader[2]).width,
      this.constructor.#documentY[4]
    );
    ctx.fillText(
      `/ ${this.nameHeader[1]}/ ${this.nameHeader[2]}`,
      nameWidth,
      this.constructor.#dataY[0]
    );
    ctx.fillText("/", nationalityWidth, this.constructor.#dataY[2]);
    ctx.fillText(
      `${this.nationalityHeader[1]}/`,
      this.constructor.#dataX[0],
      this.constructor.#dataY[3]
    );
    ctx.fillText(
      this.nationalityHeader[2],
      this.constructor.#dataX[0],
      this.constructor.#dataY[4]
    );
    ctx.fillText("/", dateOfBirthWidth, this.constructor.#dataY[2]);
    ctx.fillText(
      `${this.dateOfBirthHeader[1]}/`,
      this.constructor.#dataX[1],
      this.constructor.#dataY[3]
    );
    ctx.fillText(
      this.dateOfBirthHeader[2],
      this.constructor.#dataX[1],
      this.constructor.#dataY[4]
    );
    ctx.fillText("/", genderWidth, this.constructor.#dataY[2]);
    ctx.fillText(
      `${this.genderHeader[1]}/`,
      this.constructor.#dataX[2],
      this.constructor.#dataY[3]
    );
    ctx.fillText(
      this.genderHeader[2],
      this.constructor.#dataX[2],
      this.constructor.#dataY[4]
    );
    ctx.fillText("/", placeOfBirthWidth, this.constructor.#dataY[2]);
    ctx.fillText(
      `${this.placeOfBirthHeader[1]}/`,
      this.constructor.#dataX[3],
      this.constructor.#dataY[3]
    );
    ctx.fillText(
      this.placeOfBirthHeader[2],
      this.constructor.#dataX[3],
      this.constructor.#dataY[4]
    );
    ctx.fillText(
      `/ ${this.issueHeader[1]}/ ${this.issueHeader[2]}`,
      issueWidth,
      this.constructor.#dataY[6]
    );
    ctx.fillText(
      `/ ${this.authorityHeader[1]}/ ${this.authorityHeader[2]}`,
      authorityWidth,
      this.constructor.#dataY[8]
    );
    ctx.fillText(
      `/ ${this.dateOfExpirationHeader[1]}/ ${this.dateOfExpirationHeader[2]}`,
      dateOfExpirationWidth,
      this.constructor.#dataY[10]
    );
    ctx.fillText(
      `/ ${this.endorsementsHeader[1]}/ ${this.endorsementsHeader[2]}`,
      endorsementsWidth,
      this.constructor.#dataY[12]
    );

    ctx.fillStyle = this.textColor;
    ctx.font = this.constructor.#dataFont;
    ctx.fillText(
      model.typeCodeVIZ,
      this.constructor.#documentX[0] - ctx.measureText(model.typeCodeVIZ).width,
      this.constructor.#documentY[5]
    );
    ctx.fillText(
      model.authorityCodeVIZ,
      this.constructor.#documentX[1] - ctx.measureText(model.authorityCodeVIZ).width,
      this.constructor.#documentY[5]
    );
    ctx.fillText(
      model.numberVIZ,
      this.constructor.#documentX[2] - ctx.measureText(model.numberVIZ).width,
      this.constructor.#documentY[5]
    );
    ctx.fillText(
      model.fullNameVIZ,
      this.constructor.#dataX[0],
      this.constructor.#dataY[1],
      this.constructor.#documentX[2] - this.constructor.#dataX[0]
    );
    ctx.fillText(
      model.nationalityCodeVIZ,
      this.constructor.#dataX[0],
      this.constructor.#dataY[5]
    );
    ctx.fillText(
      model.dateOfBirthVIZ,
      this.constructor.#dataX[1],
      this.constructor.#dataY[5]
    );
    ctx.fillText(
      model.genderMarkerVIZ,
      this.constructor.#dataX[2],
      this.constructor.#dataY[5]
    );
    ctx.fillText(
      model.placeOfBirthVIZ,
      this.constructor.#dataX[3],
      this.constructor.#dataY[5]
    );
    ctx.fillText(
      model.dateOfIssueVIZ,
      this.constructor.#dataX[0],
      this.constructor.#dataY[7]
    );
    ctx.fillText(
      model.authorityVIZ,
      this.constructor.#dataX[0],
      this.constructor.#dataY[9],
      this.constructor.#qrCodeXY[0] - this.constructor.#dataX[0] - 32
    );
    ctx.fillText(
      model.dateOfExpirationVIZ,
      this.constructor.#dataX[0],
      this.constructor.#dataY[11]
    );
    ctx.fillText(
      model.endorsementsVIZ,
      this.constructor.#dataX[0],
      this.constructor.#dataY[13],
      this.constructor.#qrCodeXY[0] - this.constructor.#dataX[0] - 32
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
    }

    if (this.showGuides) {
      this.constructor.#drawBleedAndSafeLines(ctx);
    }

    return canvas;
  }

  /** @param { EventsPassport } model */
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

    ctx.translate(this.constructor.#cardArea[0], 0);
    ctx.rotate(90 * Math.PI / 180);

    ctx.strokeStyle = this.headerColor;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(
      this.constructor.#signatureX[0],
      this.constructor.#signatureY[1]
    );
    ctx.lineTo(
      this.constructor.#cardArea[1] - this.constructor.#signatureX[0],
      this.constructor.#signatureY[1]
    );
    ctx.stroke();

    ctx.font = this.constructor.#headerFont;
    ctx.fillStyle = this.headerColor;
    ctx.fillText(
      this.signatureHeader[0],
      this.constructor.#signatureX[0],
      this.constructor.#signatureY[2]
    );
    const signatureWidth = ctx.measureText(this.signatureHeader[0]).width
    ctx.font = this.constructor.#intlFont;
    ctx.fillText(
      "/",
      this.constructor.#signatureX[0] + signatureWidth,
      this.constructor.#signatureY[2]
    );
    ctx.fillText(
      `${this.signatureHeader[1]}/`,
      this.constructor.#signatureX[0],
      this.constructor.#signatureY[3]
    );
    ctx.fillText(
      this.signatureHeader[2],
      this.constructor.#signatureX[0],
      this.constructor.#signatureY[4]
    );

    if (typeof model.signature !== typeof canvas) {
      const image = await this.constructor.#generateCanvasImg(model.signature);
      this.constructor.#fitImgInArea(
        image, ctx,
        this.constructor.#signatureX[1],
        this.constructor.#signatureY[0],
        this.constructor.#signatureArea[0],
        this.constructor.#signatureArea[1]
      );
    }
    else {
      ctx.drawImage(
        model.signature,
        this.constructor.#signatureX[1],
        this.constructor.#signatureY[0],
        this.constructor.#signatureArea[0],
        this.constructor.#signatureArea[1]
      );
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
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
  static get #signatureFont() {
    return `148px ${this.#signatureFontFace.family}`;
  }

  // Coordinates used in card generation (static)
  static #photoUnderlayXY = [48, 0];
  static #photoXY = [72, 256];
  static #mrzUnderlayXY = [0, 789];
  static #logoXY = [109, 79];
  static #signatureXY = [48, 543];
  static #passportHeaderX = 261;
  static #passportHeaderY = [102, 135, 168];
  static #mrzX = 86;
  static #mrzY = [858, 933];
  static #mrzSpacing = 30.75;
  static get #documentX() {
    return [
      1072, // Document Header
      1222, // Authority Header
      this.#cardArea[0] - this.#safe // Number Header
    ];
  }
  static get #documentY() {
    return [
      this.#safe, // Full Authority Header
      100, // Full Document Header
      136, // Document Header (primary)
      161, // Document Header (I18n 1)
      186, // Document Header (I18n 2)
      213 // Document Data
    ];
  }
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
  static get #qrCodeXY() {
    return [
      this.#cardArea[0] - this.#safe - this.#qrCodeArea,
      this.#mrzUnderlayXY[1] - this.#qrCodeArea - 32
    ];
  }

  // Areas used in card generation (static)
  static #cardArea = [1524, 1087];
  static get cutCardArea() {
    return [
      this.#cardArea[0] - (this.#bleed * 2),
      this.#cardArea[1] - (this.#bleed * 2)
    ];
  }
  static #bleed = 16;
  static #safe = 48;
  static #photoUnderlayArea = [413, 765];
  static #photoArea = [365, 487];
  static #logoArea = 128;
  static get #signatureArea() {
    return [
      this.#cardArea[1] - (160 * 2),
      164
    ];
  }
  static get #qrCodeArea() {
    return this.#mrzUnderlayXY[1] - 32 - this.#dataY[8];
  }
  static get #mrzUnderlayArea() {
    return [
      this.#cardArea[0],
      this.#cardArea[1] - this.#mrzUnderlayXY[1]
    ];
  }

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
      signature, Math.max(centerShift, 0), 0,
      this.constructor.#signatureArea[0]
    );
    return canvas;
  }

  // Constructor
  constructor(opt) {
    if (opt) {
      if (opt.headerColor) { this.headerColor = opt.headerColor; }
      if (opt.textColor) { this.textColor = opt.textColor; }
      if (opt.mrzColor) { this.mrzColor = opt.mrzColor; }
      if (opt.passportHeaderColor) { this.passportHeaderColor = opt.passportHeaderColor}
      if (opt.frontBackgroundColor) { this.frontBackgroundColor = opt.frontBackgroundColor; }
      if (opt.frontBackgroundImage) { this.frontBackgroundImage = opt.frontBackgroundImage; }
      if (opt.backBackgroundColor) { this.backBackgroundColor = opt.backBackgroundColor; }
      if (opt.backBackgroundImage) { this.backBackgroundImage = opt.backBackgroundImage; }
      if (opt.mrzBackgroundColor) { this.mrzBackgroundColor = opt.mrzBackgroundColor; }
      if (opt.mrzBackgroundImage) { this.mrzBackgroundImage = opt.mrzBackgroundImage; }
      if (opt.logoUnderlayColor) { this.logoUnderlayColor = opt.logoUnderlayColor; }
      if (opt.logoUnderlayAlpha) { this.logoUnderlayAlpha = opt.logoUnderlayAlpha; }
      if (opt.logo) { this.logo = opt.logo; }
      if (opt.mrzInQRCode !== undefined) { this.mrzInQRCode = opt.mrzInQRCode; }
      if (opt.showGuides !== undefined) { this.showGuides = opt.showGuides; }
      if (opt.fullAuthority) { this.fullAuthority = opt.fullAuthority; }
      if (opt.fullDocumentName) { this.fullDocumentName = opt.fullDocumentName; }
      if (opt.passportHeader) { this.passportHeader = opt.passportHeader; }
      if (opt.documentHeader) { this.documentHeader = opt.documentHeader; }
      if (opt.authorityHeader) { this.authorityHeader = opt.authorityHeader; }
      if (opt.numberHeader) { this.numberHeader = opt.numberHeader; }
      if (opt.nameHeader) { this.nameHeader = opt.nameHeader; }
      if (opt.nationalityHeader) { this.nationalityHeader = opt.nationalityHeader; }
      if (opt.dateOfBirthHeader) { this.dateOfBirthHeader = opt.dateOfBirthHeader; }
      if (opt.genderHeader) { this.genderHeader = opt.genderHeader; }
      if (opt.placeOfBirthHeader) { this.placeOfBirthHeader = opt.placeOfBirthHeader; }
      if (opt.issueHeader) { this.issueHeader = opt.issueHeader; }
      if (opt.dateOfExpirationHeader) { this.dateOfExpirationHeader = opt.dateOfExpirationHeader; }
      if (opt.endorsementsHeader) { this.endorsementsHeader = opt.endorsementsHeader; }
      if (opt.signatureHeader) { this.signatureHeader = opt.signatureHeader; }
    }
  }
}

export { EventsPassportRenderer };