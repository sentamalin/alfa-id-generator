import { CrewCertificate  } from "./CrewCertificate.js";
import { QRCodeData } from "./QRCodeData.js";

class CrewLicenseRenderer {
  #qrCode = new QRCodeData({
    generatorOpt: {
      width: CrewLicenseRenderer.#qrCodeArea[0],
      height: CrewLicenseRenderer.#qrCodeArea[1],
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
  /** @param { CrewCertificate } model */
  /** @param { HTMLCanvasElement } canvas */
  async generateCardFront(model, canvas) {
    canvas.setAttribute("width", CrewLicenseRenderer.#cardArea[0]);
    canvas.setAttribute("height", CrewLicenseRenderer.#cardArea[1]);
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";

    ctx.fillStyle = this.frontBackgroundColor;
    ctx.fillRect(
      0, 0,
      CrewLicenseRenderer.#cardArea[0],
      CrewLicenseRenderer.#cardArea[1]
    );
    if (this.frontBackgroundImage) {
      const cardBackground = await CrewLicenseRenderer.#generateCanvasImg(
        this.frontBackgroundImage
      );
      ctx.drawImage(
        cardBackground,
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
    const images = await Promise.all([
      CrewLicenseRenderer.#generateCanvasImg(model.picture),
      CrewLicenseRenderer.#generateCanvasImg(this.logo),
      CrewLicenseRenderer.#generateCanvasImg(model.signature)
    ]);
    CrewLicenseRenderer.#fillAreaWithImg(
      images[0], ctx,
      CrewLicenseRenderer.#photoXY[0],
      CrewLicenseRenderer.#photoXY[1],
      CrewLicenseRenderer.#photoArea[0],
      CrewLicenseRenderer.#photoArea[1]
    );
    CrewLicenseRenderer.#fitImgInArea(
      images[1], ctx,
      CrewLicenseRenderer.#logoFrontXY[0],
      CrewLicenseRenderer.#logoFrontXY[1],
      CrewLicenseRenderer.#logoArea[0],
      CrewLicenseRenderer.#logoArea[1]
    );
    CrewLicenseRenderer.#fitImgInArea(
      images[2], ctx,
      CrewLicenseRenderer.#signatureXY[0],
      CrewLicenseRenderer.#signatureXY[1],
      CrewLicenseRenderer.#signatureArea[0],
      CrewLicenseRenderer.#signatureArea[1],
    );

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
    documentHeaderWidth += ctx.measureText(CrewLicenseRenderer.#headerSeparator).width;
    ctx.fillText(
      CrewLicenseRenderer.#headerSeparator,
      CrewLicenseRenderer.#mainHeaderX - documentHeaderWidth,
      CrewLicenseRenderer.#mainHeaderY[1]
    );
    ctx.font = CrewLicenseRenderer.#documentHeaderFont;
    documentHeaderWidth += ctx.measureText(`${model.typeCodeVIZ}-${model.authorityCodeVIZ}`).width;
    ctx.fillText(
      `${model.typeCodeVIZ}-${model.authorityCodeVIZ}`,
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
    const nameWidth = CrewLicenseRenderer.#frontColumns +
      ctx.measureText(this.nameHeader[0]).width;
    const genderWidth = CrewLicenseRenderer.#frontColumns +
      ctx.measureText(this.genderHeader[0]).width;
    const nationalityWidth = CrewLicenseRenderer.#frontRow2Columns[0] +
      ctx.measureText(this.nationalityHeader[0]).width;
    const dateOfBirthWidth = CrewLicenseRenderer.#frontRow2Columns[1] +
      ctx.measureText(this.dateOfBirthHeader[0]).width;
    const employerWidth = CrewLicenseRenderer.#frontColumns +
      ctx.measureText(this.authorityHeader[0]).width;
    const occupationWidth = CrewLicenseRenderer.#frontColumns +
      ctx.measureText(this.privilegeHeader[0]).width;
    const numberWidth = CrewLicenseRenderer.#frontColumns +
      ctx.measureText(this.numberHeader[0]).width;
    const dateOfExpirationWidth = CrewLicenseRenderer.#frontColumns +
      ctx.measureText(this.dateOfExpirationHeader[0]).width;
    
    ctx.font = CrewLicenseRenderer.#intlFont;
    ctx.fillText(
      `/ ${this.nameHeader[1]}/ ${this.nameHeader[2]}`,
      nameWidth,
      CrewLicenseRenderer.#frontRows[0]
    );
    ctx.fillText("/", genderWidth, CrewLicenseRenderer.#frontRows[2]);
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
    ctx.fillText("/", nationalityWidth, CrewLicenseRenderer.#frontRows[2]);
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
    ctx.fillText("/", dateOfBirthWidth, CrewLicenseRenderer.#frontRows[2]);
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
      employerWidth,
      CrewLicenseRenderer.#frontRows[6]
    );
    ctx.fillText(
      `/ ${this.privilegeHeader[1]}/ ${this.privilegeHeader[2]}`,
      occupationWidth,
      CrewLicenseRenderer.#frontRows[8]
    );
    ctx.fillText(
      `/ ${this.numberHeader[1]}/ ${this.numberHeader[2]}`,
      numberWidth,
      CrewLicenseRenderer.#frontRows[10]
    );
    ctx.fillText(
      `/ ${this.dateOfExpirationHeader[1]}/ ${this.dateOfExpirationHeader[2]}`,
      dateOfExpirationWidth,
      CrewLicenseRenderer.#frontRows[12]
    );

    ctx.fillStyle = this.textColor;
    ctx.font = CrewLicenseRenderer.#dataFont;
    ctx.fillText(
      model.fullNameVIZ,
      CrewLicenseRenderer.#frontColumns,
      CrewLicenseRenderer.#frontRows[1],
      CrewLicenseRenderer.#mainHeaderX - CrewLicenseRenderer.#frontColumns
    );
    ctx.fillText(
      model.genderMarkerVIZ,
      CrewLicenseRenderer.#frontColumns,
      CrewLicenseRenderer.#frontRows[5]
    );
    ctx.fillText(
      model.nationalityCodeVIZ,
      CrewLicenseRenderer.#frontRow2Columns[0],
      CrewLicenseRenderer.#frontRows[5]
    );
    ctx.fillText(
      model.dateOfBirthVIZ,
      CrewLicenseRenderer.#frontRow2Columns[1],
      CrewLicenseRenderer.#frontRows[5]
    );
    ctx.fillText(
      model.authorityVIZ,
      CrewLicenseRenderer.#frontColumns,
      CrewLicenseRenderer.#frontRows[7],
      CrewLicenseRenderer.#mainHeaderX - CrewLicenseRenderer.#frontColumns
    );
    ctx.fillText(
      model.privilegeVIZ,
      CrewLicenseRenderer.#frontColumns,
      CrewLicenseRenderer.#frontRows[9],
      CrewLicenseRenderer.#mainHeaderX - CrewLicenseRenderer.#frontColumns
    );
    ctx.fillText(
      model.numberVIZ,
      CrewLicenseRenderer.#frontColumns,
      CrewLicenseRenderer.#frontRows[11]
    );
    ctx.fillText(
      model.dateOfExpirationVIZ,
      CrewLicenseRenderer.#frontColumns,
      CrewLicenseRenderer.#frontRows[13]
    );

    if (this.showGuides) {
      CrewLicenseRenderer.#drawBleedAndSafeLines(ctx);
    }
  }

  /** @param { CrewCertificate } model */
  /** @param { HTMLCanvasElement } canvas */
  async generateCardBack(model, canvas) {
    canvas.setAttribute("width", CrewLicenseRenderer.#cardArea[0]);
    canvas.setAttribute("height", CrewLicenseRenderer.#cardArea[1]);
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";

    ctx.fillStyle = this.backBackgroundColor;
    ctx.fillRect(
      0, 0,
      CrewLicenseRenderer.#cardArea[0],
      CrewLicenseRenderer.#cardArea[1]
    );
    if (this.backBackgroundImage) {
      const cardBackground = await CrewLicenseRenderer.#generateCanvasImg(
        this.backBackgroundImage
      );
      ctx.drawImage(
        cardBackground,
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
    if (this.mrzBackgroundImage) {
      const mrzBackground = await CrewLicenseRenderer.#generateCanvasImg(
        this.mrzBackgroundImage
      );
      ctx.drawImage(
        mrzBackground,
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
    if (this.mrzInQRCode) {
      this.#qrCode.qrCode = `${model.url}?mrz=${model.typeCodeMRZ}${model.authorityCodeMRZ}${model.numberVIZ}`;
    }
    else { this.#qrCode.qrCode = model.url; }
    const images = await Promise.all([
      CrewLicenseRenderer.#generateCanvasImg(this.#qrCode.qrCode),
      CrewLicenseRenderer.#generateCanvasImg(this.logo),
      CrewLicenseRenderer.#generateCanvasImg(this.smallLogo)
    ]);
    ctx.drawImage(
      images[0],
      CrewLicenseRenderer.#qrCodeXY[0],
      CrewLicenseRenderer.#qrCodeXY[1],
      CrewLicenseRenderer.#qrCodeArea[0],
      CrewLicenseRenderer.#qrCodeArea[1]
    );
    CrewLicenseRenderer.#fitImgInArea(
      images[1], ctx,
      CrewLicenseRenderer.#logoBackXY[0],
      CrewLicenseRenderer.#logoBackXY[1],
      CrewLicenseRenderer.#logoArea[0],
      CrewLicenseRenderer.#logoArea[1]
    );
    ctx.drawImage(
      images[2],
      CrewLicenseRenderer.#smallLogoXY[0],
      CrewLicenseRenderer.#smallLogoXY[1],
      CrewLicenseRenderer.#smallLogoArea[0],
      CrewLicenseRenderer.#smallLogoArea[1]
    );
    ctx.fillStyle = this.textColor;
    ctx.font = CrewLicenseRenderer.#headerFont;
    ctx.fillText(
      `${model.typeCodeVIZ}-${model.authorityCodeVIZ}${CrewLicenseRenderer.#headerSeparator}${CrewLicenseRenderer.#documentSize}`,
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
    const declarationWidth = CrewLicenseRenderer.#backColumns +
      ctx.measureText(this.ratingsHeader[0]).width;
    const issueWidth = CrewLicenseRenderer.#backColumns +
      ctx.measureText(this.limitationsHeader[0]).width;

    ctx.font = CrewLicenseRenderer.#intlFont;
    ctx.fillText(
      `/ ${this.ratingsHeader[1]}/ ${this.ratingsHeader[2]}`,
      declarationWidth,
      CrewLicenseRenderer.#backRows[0]
    );
    ctx.fillText(
      `/ ${this.limitationsHeader[1]}/ ${this.limitationsHeader[2]}`,
      issueWidth,
      CrewLicenseRenderer.#backRows[2]);

    ctx.fillStyle = this.textColor;
    ctx.font = CrewLicenseRenderer.#dataFont;
    let splitString = model.ratingsVIZ.split(/\r?\n/);
    for (let i = 0; i < splitString.length; i += 1) {
      ctx.fillText(
        splitString[i],
        CrewLicenseRenderer.#backColumns,
        CrewLicenseRenderer.#backRows[1] + (i * 30)
      );
    }
    splitString = model.limitationsVIZ.split(/\r?\n/);
    for (let i = 0; i < splitString.length; i += 1) {
      ctx.fillText(
        splitString[i],
        CrewLicenseRenderer.#backColumns,
        CrewLicenseRenderer.#backRows[3] + (i * 30)
      );
    }
    ctx.fillText(
      model.numberVIZ,
      CrewLicenseRenderer.#backNumberXY[0],
      CrewLicenseRenderer.#backNumberXY[1],
      1004 - CrewLicenseRenderer.#backNumberXY[0]
    );

    ctx.fillStyle = this.mrzColor;
    ctx.font = CrewLicenseRenderer.#mrzFont;
    for (let i = 0; i < model.mrzLine1.length; i += 1) {
      ctx.fillText(
        model.mrzLine1[i],
        CrewLicenseRenderer.#mrzX + (i * CrewLicenseRenderer.#mrzSpacing),
        CrewLicenseRenderer.#mrzY[0]
      );
      ctx.fillText(
        model.mrzLine2[i],
        CrewLicenseRenderer.#mrzX + (i * CrewLicenseRenderer.#mrzSpacing),
        CrewLicenseRenderer.#mrzY[1]
      );
      ctx.fillText(
        model.mrzLine3[i],
        CrewLicenseRenderer.#mrzX + (i * CrewLicenseRenderer.#mrzSpacing),
        CrewLicenseRenderer.#mrzY[2]
      );
    }

    if (this.showGuides) {
      CrewLicenseRenderer.#drawBleedAndSafeLines(ctx);
    }
  }

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
    return `bold 24px ${CrewLicenseRenderer.#vizFontFace.family}`;
  }
  static get #documentHeaderFont() {
    return `18px ${CrewLicenseRenderer.#vizFontFace.family}`;
  }
  static get #separatorHeaderFont() {
    return `bold 18px ${CrewLicenseRenderer.#vizFontFace.family}`;
  }
  static get #headerFont() {
    return `bold 18px ${CrewLicenseRenderer.#vizFontFace.family}`;
  }
  static get #intlFont() {
    return `italic 18px ${CrewLicenseRenderer.#vizFontFace.family}`;
  }
  static get #dataFont() {
    return `24px ${CrewLicenseRenderer.#vizFontFace.family}`;
  }
  static get #mrzFont() {
    return `44px ${CrewLicenseRenderer.#mrzFontFace.family}`;
  }
  static get #signatureFont() {
    return `61px ${CrewLicenseRenderer.#signatureFontFace.family}`;
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
    ctx.fillStyle = "#ff0000";
    const bleed = 16;
    ctx.beginPath();
    ctx.moveTo(0, bleed);
    ctx.lineTo(CrewLicenseRenderer.#cardArea[0], bleed);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, CrewLicenseRenderer.#cardArea[1] - bleed);
    ctx.lineTo(CrewLicenseRenderer.#cardArea[0], CrewLicenseRenderer.#cardArea[1] - bleed);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bleed, 0);
    ctx.lineTo(bleed, CrewLicenseRenderer.#cardArea[1]);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(CrewLicenseRenderer.#cardArea[0] - bleed, 0);
    ctx.lineTo(CrewLicenseRenderer.#cardArea[0] - bleed, CrewLicenseRenderer.#cardArea[1]);
    ctx.closePath(); ctx.stroke();

    ctx.fillStyle = "#0000ff";
    const safe = 48;
    ctx.beginPath();
    ctx.moveTo(0, safe);
    ctx.lineTo(CrewLicenseRenderer.#cardArea[0], safe);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, CrewLicenseRenderer.#cardArea[1] - safe);
    ctx.lineTo(CrewLicenseRenderer.#cardArea[0], CrewLicenseRenderer.#cardArea[1] - safe);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(safe, 0);
    ctx.lineTo(safe, CrewLicenseRenderer.#cardArea[1]);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(CrewLicenseRenderer.#cardArea[0] - safe, 0);
    ctx.lineTo(CrewLicenseRenderer.#cardArea[0] - safe, CrewLicenseRenderer.#cardArea[1]);
    ctx.closePath(); ctx.stroke();
  }
  static async generateSignatureFromText(signature) {
    const canvas = new OffscreenCanvas(
      CrewLicenseRenderer.#signatureArea[0],
      CrewLicenseRenderer.#signatureArea[1]
    );
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = this.textColor;
    ctx.font = CrewLicenseRenderer.#signatureFont;
    ctx.textBaseline = "top";
    const centerShift = (canvas.width - ctx.measureText(signature).width) / 2;
    ctx.fillText(
      signature, Math.max(centerShift, 0), 8,
      CrewLicenseRenderer.#signatureArea[0] - 6
    );
    return await canvas.convertToBlob();
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