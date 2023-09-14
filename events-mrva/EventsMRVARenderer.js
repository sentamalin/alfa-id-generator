/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { EventsMRVA } from "/modules/EventsMRVA.js";
import { QRCodeData } from "/modules/QRCodeData.js";

class EventsMRVARenderer {
  #qrCode = new QRCodeData({
    generatorOpt: {
      width: this.constructor.#qrCodeArea,
      height: this.constructor.#qrCodeArea,
      colorDark: "#000000ff",
      colorLight: "#00000000",
      correctLevel: QRCode.CorrectLevel.H
    }
  });

  // Customizable Presentation Data
  headerColor; // Defines background color around picture and header text color
  textColor; // Defines data text color
  mrzColor;
  frontBackgroundColor; // Defines a solid color when no front image is used
  frontBackgroundImage; // Defines a front image to use for a background
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
  placeOfIssueHeader;
  validFromHeader;
  validThruHeader;
  numberOfEntriesHeader;
  numberHeader;
  typeHeader;
  additionalInfoHeader;
  nameHeader;
  passportNumberHeader;
  nationalityHeader;
  dateOfBirthHeader;
  genderHeader;
  fonts;

  // Public Methods
  /** @param { EventsMRVA } model */
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
    if (this.mrzInQRCode) {
      if (model.usePassportInMRZ) {
        this.#qrCode.qrCode = `${model.url}?mrz=${model.typeCodeMRZ}${model.authorityCodeMRZ}${model.passportNumberVIZ}`;
      }
      else {
        this.#qrCode.qrCode = `${model.url}?mrz=${model.typeCodeMRZ}${model.authorityCodeMRZ}${model.numberVIZ}`;
      }
    }
    else { this.#qrCode.qrCode = model.url; }
    const images = await Promise.all([
      this.constructor.#generateCanvasImg(model.picture),
      this.constructor.#generateCanvasImg(this.logo),
      this.constructor.#generateCanvasImg(this.#qrCode.qrCode)
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

    ctx.fillStyle = this.headerColor;
    ctx.font = this.constructor.#mainHeaderFont;
    ctx.fillText(
      this.fullAuthority,
      Math.max(
        this.constructor.#documentX[3] -
          ctx.measureText(this.fullAuthority).width,
        this.constructor.#documentX[0]
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
  static #mainHeaderXY = [1417, 48];
  static #documentHeaderXY = [1417, 92];
  static #photoUnderlayXY = [48, 0];
  static #photoXY = [72, 267];
  static #mrzUnderlayXY = [0, 695];
  static #logoXY = [72, 48];
  static #signatureXY = [48, 543];
  static get #signatureXY() {
    return [
      this.#qrCodeXY[0] - 24 - this.#signatureArea,
      this.#qrCodeXY[1]
    ];
  }
  static #mrzX = 60;
  static #mrzY = [768, 840];
  static #mrzSpacing = 30.75;
  static #documentX = [
    415, // Place of issue
    688, // Valid from
    959, // Valid thru
    1223 // Number of entries
  ];
  static #documentY = [
    166, // Row 1 header (primary)
    191, // Row 1 header (I18n 1)
    216, // Row 1 header (I18n 2)
    243, // Row 1 data
    292, // Row 2 header
    319, // Row 2 data
    368, // Additional information header
    395, // Additional information data line 1
    425 // Additional information data line 2
  ];
  static #passportX = [
    415, // Nationality header
    563, // Date of birth header
    774 // Gender header
  ];
  static #passportY = [
    474, // Name header
    501, // Name data
    550, // Passport header
    577, // Passport data
    626, // Row 3 header (primary)
    651, // Row 3 header (I18n 1)
    676, // Row 3 header (I18n 2)
    703 // Row 3 data
  ];
  static get #qrCodeXY() {
    return [
      this.#cardArea[0] - this.#safe - this.#qrCodeArea,
      this.#mrzUnderlayXY[1] - this.#qrCodeArea - 24
    ];
  }

  // Areas used in card generation (static)
  static #cardArea = [1465, 993];
  static get cutCardArea() {
    return [
      this.#cardArea[0] - (this.#bleed * 2),
      this.#cardArea[1] - (this.#bleed * 2)
    ];
  }
  static #bleed = 24;
  static #safe = 48;
  static #photoUnderlayArea = [343, 671];
  static #photoArea = [295, 380];
  static #logoArea = [295, 195];
  static get #signatureArea() { return this.#qrCodeArea; }
  static get #qrCodeArea() {
    return this.#mrzUnderlayXY[1] - 24 - this.#passportY[4];
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

export { EventsMRVARenderer };