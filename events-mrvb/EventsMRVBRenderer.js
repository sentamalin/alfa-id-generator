/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { EventsMRVB } from "/modules/EventsMRVB.js";
import * as b45 from "/modules/base45-ts/base45.js";
import * as qrLite from "/modules/qrcode-lite/qrcode.mjs";

class EventsMRVBRenderer {
  // Customizable Presentation Data
  headerColor; // Defines background color around picture and header text color
  textColor; // Defines data text color
  mrzColor;
  barcodeDarkColor = "#000000ff";
  barcodeLightColor = "#00000000";
  barcodeErrorCorrection = "L";
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
    barcode = model.url;
    const imagePromises = [
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
      this.constructor.#logoXY[0],
      this.constructor.#logoXY[1],
      this.constructor.#logoArea[0],
      this.constructor.#logoArea[1]
    );
    ctx.drawImage(
      images[2],
      this.constructor.#qrCodeXY[0],
      this.constructor.#qrCodeXY[1],
      this.constructor.#qrCodeArea,
      this.constructor.#qrCodeArea
    );
    if (typeof model.signature !== typeof canvas) {
      this.constructor.#fitImgInArea(
        images[3], ctx,
        this.constructor.#signatureXY[0],
        this.constructor.#signatureXY[1],
        this.constructor.#signatureArea,
        this.constructor.#signatureArea
      );
    }
    else {
      ctx.drawImage(
        model.signature,
        this.constructor.#signatureXY[0],
        this.constructor.#signatureXY[1],
        this.constructor.#signatureArea,
        this.constructor.#signatureArea
      );
    }

    ctx.fillStyle = this.headerColor;
    ctx.font = this.constructor.#mainHeaderFont;
    ctx.fillText(
      this.fullAuthority,
      Math.max(
        this.constructor.#mainHeaderXY[0] -
          ctx.measureText(this.fullAuthority).width,
        this.constructor.#documentX[0]
      ),
      this.constructor.#mainHeaderXY[1],
      this.constructor.#mainHeaderXY[0] - this.constructor.#documentX[0]
    );
    ctx.font = this.constructor.#documentHeaderFont;
    let documentHeaderWidth = ctx.measureText(this.fullDocumentName).width;
    ctx.fillText(
      this.fullDocumentName,
      this.constructor.#documentHeaderXY[0] - documentHeaderWidth,
      this.constructor.#documentHeaderXY[1]
    );
    ctx.font = this.constructor.#separatorHeaderFont;
    documentHeaderWidth += ctx.measureText(this.constructor.#headerSeparator).width;
    ctx.fillText(
      this.constructor.#headerSeparator,
      this.constructor.#documentHeaderXY[0] - documentHeaderWidth,
      this.constructor.#documentHeaderXY[1]
    );
    ctx.font = this.constructor.#documentHeaderFont;
    documentHeaderWidth += ctx.measureText(`${model.typeCodeVIZ}-${model.authorityCodeVIZ}`).width;
    ctx.fillText(
      `${model.typeCodeVIZ}-${model.authorityCodeVIZ}`,
      this.constructor.#documentHeaderXY[0] - documentHeaderWidth,
      this.constructor.#documentHeaderXY[1]
    );

    ctx.fillStyle = this.headerColor;
    ctx.font = this.constructor.#headerFont;
    ctx.fillText(
      this.placeOfIssueHeader[0],
      this.constructor.#documentX[0],
      this.constructor.#documentY[0]
    );
    ctx.fillText(
      this.validFromHeader[0],
      this.constructor.#documentX[1],
      this.constructor.#documentY[0]
    );
    ctx.fillText(
      this.validThruHeader[0],
      this.constructor.#documentX[2],
      this.constructor.#documentY[0]
    );
    ctx.fillText(
      this.numberOfEntriesHeader[0],
      this.constructor.#documentX[3],
      this.constructor.#documentY[0]
    );
    ctx.fillText(
      this.numberHeader[0],
      this.constructor.#documentX[0],
      this.constructor.#documentY[4]
    );
    ctx.fillText(
      this.typeHeader[0],
      this.constructor.#documentX[2],
      this.constructor.#documentY[4]
    );
    ctx.fillText(
      this.additionalInfoHeader[0],
      this.constructor.#documentX[2],
      this.constructor.#documentY[6]
    );
    ctx.fillText(
      this.nameHeader[0],
      this.constructor.#passportX[0],
      this.constructor.#passportY[0]
    );
    ctx.fillText(
      this.passportNumberHeader[0],
      this.constructor.#passportX[0],
      this.constructor.#passportY[2]
    );
    ctx.fillText(
      this.nationalityHeader[0],
      this.constructor.#passportX[0],
      this.constructor.#passportY[4]
    );
    ctx.fillText(
      this.dateOfBirthHeader[0],
      this.constructor.#passportX[1],
      this.constructor.#passportY[4]
    );
    ctx.fillText(
      this.genderHeader[0],
      this.constructor.#passportX[2],
      this.constructor.#passportY[4]
    );
    const placeOfIssueWidth = this.constructor.#documentX[0] +
      ctx.measureText(this.placeOfIssueHeader[0]).width;
    const validFromWidth = this.constructor.#documentX[1] +
      ctx.measureText(this.validFromHeader[0]).width;
    const validThruWidth = this.constructor.#documentX[2] +
      ctx.measureText(this.validThruHeader[0]).width;
    const numberOfEntriesWidth = this.constructor.#documentX[3] +
      ctx.measureText(this.numberOfEntriesHeader[0]).width;
    const numberWidth = this.constructor.#documentX[0] +
      ctx.measureText(this.numberHeader[0]).width;
    const typeWidth = this.constructor.#documentX[2] +
      ctx.measureText(this.typeHeader[0]).width;
    const additionalInfoWidth = this.constructor.#documentX[2] +
      ctx.measureText(this.additionalInfoHeader[0]).width;
    const nameWidth = this.constructor.#passportX[0] +
      ctx.measureText(this.nameHeader[0]).width;
    const passportNumberWidth = this.constructor.#passportX[0] +
      ctx.measureText(this.passportNumberHeader[0]).width;
    const nationalityWidth = this.constructor.#passportX[0] +
      ctx.measureText(this.nationalityHeader[0]).width;
    const dateOfBirthWidth = this.constructor.#passportX[1] +
      ctx.measureText(this.dateOfBirthHeader[0]).width;
    const genderWidth = this.constructor.#passportX[2] +
      ctx.measureText(this.genderHeader[0]).width;
    
    ctx.font = this.constructor.#intlFont;
    ctx.fillText(
      "/",
      placeOfIssueWidth,
      this.constructor.#documentY[0]
    );
    ctx.fillText(
      `${this.placeOfIssueHeader[1]}/`,
      this.constructor.#documentX[0],
      this.constructor.#documentY[1]
    );
    ctx.fillText(
      this.placeOfIssueHeader[2],
      this.constructor.#documentX[0],
      this.constructor.#documentY[2]
    );
    ctx.fillText(
      "/",
      validFromWidth,
      this.constructor.#documentY[0]
    );
    ctx.fillText(
      `${this.validFromHeader[1]}/`,
      this.constructor.#documentX[1],
      this.constructor.#documentY[1]
    );
    ctx.fillText(
      this.validFromHeader[2],
      this.constructor.#documentX[1],
      this.constructor.#documentY[2]
    );
    ctx.fillText(
      "/",
      validThruWidth,
      this.constructor.#documentY[0]
    );
    ctx.fillText(
      `${this.validThruHeader[1]}/`,
      this.constructor.#documentX[2],
      this.constructor.#documentY[1]
    );
    ctx.fillText(
      this.validThruHeader[2],
      this.constructor.#documentX[2],
      this.constructor.#documentY[2]
    );
    ctx.fillText(
      "/",
      numberOfEntriesWidth,
      this.constructor.#documentY[0],
    );
    ctx.fillText(
      `${this.numberOfEntriesHeader[1]}/`,
      this.constructor.#documentX[3],
      this.constructor.#documentY[1]
    );
    ctx.fillText(
      this.numberOfEntriesHeader[2],
      this.constructor.#documentX[3],
      this.constructor.#documentY[2]
    );
    ctx.fillText(
      `/ ${this.numberHeader[1]}/ ${this.numberHeader[2]}`,
      numberWidth,
      this.constructor.#documentY[4]
    );
    ctx.fillText(
      `/ ${this.typeHeader[1]}/ ${this.typeHeader[2]}`,
      typeWidth,
      this.constructor.#documentY[4]
    );
    ctx.fillText(
      "/",
      additionalInfoWidth,
      this.constructor.#documentY[6]
    );
    ctx.fillText(
      `${this.additionalInfoHeader[1]}/`,
      this.constructor.#documentX[2],
      this.constructor.#documentY[7]
    );
    ctx.fillText(
      this.additionalInfoHeader[2],
      this.constructor.#documentX[2],
      this.constructor.#documentY[8]
    );
    ctx.fillText(
      `/ ${this.nameHeader[1]}/ ${this.nameHeader[2]}`,
      nameWidth,
      this.constructor.#passportY[0]
    );
    ctx.fillText(
      `/ ${this.passportNumberHeader[1]}/ ${this.passportNumberHeader[2]}`,
      passportNumberWidth,
      this.constructor.#passportY[2]
    );
    ctx.fillText(
      "/",
      nationalityWidth,
      this.constructor.#passportY[4]
    );
    ctx.fillText(
      `${this.nationalityHeader[1]}/`,
      this.constructor.#passportX[0],
      this.constructor.#passportY[5]
    );
    ctx.fillText(
      this.nationalityHeader[2],
      this.constructor.#passportX[0],
      this.constructor.#passportY[6]
    );
    ctx.fillText(
      "/",
      dateOfBirthWidth,
      this.constructor.#passportY[4]
    );
    ctx.fillText(
      `${this.dateOfBirthHeader[1]}/`,
      this.constructor.#passportX[1],
      this.constructor.#passportY[5]
    );
    ctx.fillText(
      this.dateOfBirthHeader[2],
      this.constructor.#passportX[1],
      this.constructor.#passportY[6]
    );
    ctx.fillText(
      "/",
      genderWidth,
      this.constructor.#passportY[4]
    );
    ctx.fillText(
      `${this.genderHeader[1]}/`,
      this.constructor.#passportX[2],
      this.constructor.#passportY[5]
    );
    ctx.fillText(
      this.genderHeader[2],
      this.constructor.#passportX[2],
      this.constructor.#passportY[6]
    );

    ctx.fillStyle = this.textColor;
    ctx.font = this.constructor.#dataFont;
    ctx.fillText(
      model.placeOfIssueVIZ,
      this.constructor.#documentX[0],
      this.constructor.#documentY[3]
    );
    ctx.fillText(
      model.validFromVIZ,
      this.constructor.#documentX[1],
      this.constructor.#documentY[3]
    );
    ctx.fillText(
      model.validThruVIZ,
      this.constructor.#documentX[2],
      this.constructor.#documentY[3]
    );
    ctx.fillText(
      model.numberOfEntriesVIZ,
      this.constructor.#documentX[3],
      this.constructor.#documentY[3]
    );
    ctx.fillText(
      model.numberVIZ,
      this.constructor.#documentX[0],
      this.constructor.#documentY[5]
    );
    ctx.fillText(
      model.typeVIZ,
      this.constructor.#documentX[2],
      this.constructor.#documentY[5]
    );
    const splitString = model.additionalInfoVIZ.split(/\r?\n/);
    for (let i = 0; i < splitString.length; i += 1) {
      ctx.fillText(
        splitString[i],
        this.constructor.#documentX[2],
        this.constructor.#documentY[9] + (i * 30)
      );
    }
    ctx.fillText(
      model.fullNameVIZ,
      this.constructor.#passportX[0],
      this.constructor.#passportY[1]
    );
    ctx.fillText(
      model.passportNumberVIZ,
      this.constructor.#passportX[0],
      this.constructor.#passportY[3]
    );
    ctx.fillText(
      model.nationalityCodeVIZ,
      this.constructor.#passportX[0],
      this.constructor.#passportY[7]
    );
    ctx.fillText(
      model.dateOfBirthVIZ,
      this.constructor.#passportX[1],
      this.constructor.#passportY[7]
    );
    ctx.fillText(
      model.genderMarkerVIZ,
      this.constructor.#passportX[2],
      this.constructor.#passportY[7]
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
    return `${this.#qrCodeArea / 4}px ${this.#signatureFontFace.family}`;
  }

  // Coordinates used in card generation (static)
  static #mainHeaderXY = [1238, 48];
  static #documentHeaderXY = [1238, 92];
  static #photoUnderlayXY = [48, 0];
  static #photoXY = [72, 213];
  static #mrzUnderlayXY = [0, 618];
  static #logoXY = [72, 48];
  static get #signatureXY() {
    return [
      this.#qrCodeXY[0] - 24 - this.#signatureArea,
      this.#qrCodeXY[1]
    ];
  }
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
  static get #qrCodeXY() {
    return [
      this.#cardArea[0] - this.#safe - this.#qrCodeArea,
      this.#mrzUnderlayXY[1] - this.#qrCodeArea - 24
    ];
  }

  // Areas used in card generation (static)
  static #cardArea = [1286, 916];
  static get cutCardArea() {
    return [
      this.#cardArea[0] - (this.#bleed * 2),
      this.#cardArea[1] - (this.#bleed * 2)
    ];
  }
  static #bleed = 16;
  static #safe = 48;
  static #photoUnderlayArea = [268, 520];
  static #photoArea = [220, 283];
  static #logoArea = [220, 145];
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
      canvas.width = this.constructor.#signatureArea;
      canvas.height = this.constructor.#signatureArea;
    }
    else {
      canvas = new OffscreenCanvas(this.constructor.#signatureArea, this.constructor.#signatureArea);
    }
    ctx = canvas.getContext("2d");
    ctx.fillStyle = this.textColor;
    ctx.font = this.constructor.#signatureFont;
    ctx.textBaseline = "top";
    const centerShift = (canvas.width - ctx.measureText(signature).width) / 2;
    ctx.fillText(
      signature, Math.max(centerShift, 0), 65,
      this.constructor.#signatureArea
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

export { EventsMRVBRenderer };