import { CrewCertificate  } from "./CrewCertificate.js";
import { QRCodeData } from "./QRCodeData.js";

class CrewCertificateRenderer {
  #qrCode = new QRCodeData({
    generatorOpt: {
      width: CrewCertificateRenderer.#qrCodeArea[0],
      height: CrewCertificateRenderer.#qrCodeArea[1],
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
  employerHeader;
  occupationHeader;
  numberHeader;
  dateOfExpirationHeader;
  declarationHeader;
  issueHeader;
  fonts;

  // Public Methods
  /** @param { CrewCertificate } model */
  /** @param { HTMLCanvasElement } canvas */
  async generateCardFront(model, canvas) {
    canvas.setAttribute("width", CrewCertificateRenderer.#cardArea[0]);
    canvas.setAttribute("height", CrewCertificateRenderer.#cardArea[1]);
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";

    ctx.fillStyle = this.frontBackgroundColor;
    ctx.fillRect(
      0, 0,
      CrewCertificateRenderer.#cardArea[0],
      CrewCertificateRenderer.#cardArea[1]
    );
    if (this.frontBackgroundImage) {
      const cardBackground = await CrewCertificateRenderer.#generateCanvasImg(
        this.frontBackgroundImage
      );
      ctx.drawImage(
        cardBackground,
        0, 0,
        CrewCertificateRenderer.#cardArea[0],
        CrewCertificateRenderer.#cardArea[1]
      );
    }
    ctx.fillStyle = "#00003300";
    ctx.fillStyle = this.#logoUnderlayColorWithAlpha;
    ctx.fillRect(
      CrewCertificateRenderer.#photoUnderlayXY[0],
      CrewCertificateRenderer.#photoUnderlayXY[1],
      CrewCertificateRenderer.#photoUnderlayArea[0],
      CrewCertificateRenderer.#photoUnderlayArea[1]
    );
    const images = await Promise.all([
      CrewCertificateRenderer.#generateCanvasImg(model.picture),
      CrewCertificateRenderer.#generateCanvasImg(this.logo),
      CrewCertificateRenderer.#generateCanvasImg(model.signature)
    ]);
    CrewCertificateRenderer.#fillAreaWithImg(
      images[0], ctx,
      CrewCertificateRenderer.#photoXY[0],
      CrewCertificateRenderer.#photoXY[1],
      CrewCertificateRenderer.#photoArea[0],
      CrewCertificateRenderer.#photoArea[1]
    );
    CrewCertificateRenderer.#fitImgInArea(
      images[1], ctx,
      CrewCertificateRenderer.#logoFrontXY[0],
      CrewCertificateRenderer.#logoFrontXY[1],
      CrewCertificateRenderer.#logoArea[0],
      CrewCertificateRenderer.#logoArea[1]
    );
    CrewCertificateRenderer.#fitImgInArea(
      images[2], ctx,
      CrewCertificateRenderer.#signatureXY[0],
      CrewCertificateRenderer.#signatureXY[1],
      CrewCertificateRenderer.#signatureArea[0],
      CrewCertificateRenderer.#signatureArea[1],
    );

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
      CrewCertificateRenderer.#mainHeaderX - CrewCertificateRenderer.#frontColumns
    );
    ctx.font = CrewCertificateRenderer.#documentHeaderFont;
    let documentHeaderWidth = ctx.measureText(this.fullDocumentName).width;
    ctx.fillText(
      this.fullDocumentName,
      CrewCertificateRenderer.#mainHeaderX - documentHeaderWidth,
      CrewCertificateRenderer.#mainHeaderY[1]
    );
    ctx.font = CrewCertificateRenderer.#separatorHeaderFont;
    documentHeaderWidth += ctx.measureText(CrewCertificateRenderer.#headerSeparator).width;
    ctx.fillText(
      CrewCertificateRenderer.#headerSeparator,
      CrewCertificateRenderer.#mainHeaderX - documentHeaderWidth,
      CrewCertificateRenderer.#mainHeaderY[1]
    );
    ctx.font = CrewCertificateRenderer.#documentHeaderFont;
    documentHeaderWidth += ctx.measureText(`${model.typeCodeVIZ}-${model.authorityCodeVIZ}`).width;
    ctx.fillText(
      `${model.typeCodeVIZ}-${model.authorityCodeVIZ}`,
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
    const nameWidth = CrewCertificateRenderer.#frontColumns +
      ctx.measureText(this.nameHeader[0]).width;
    const genderWidth = CrewCertificateRenderer.#frontColumns +
      ctx.measureText(this.genderHeader[0]).width;
    const nationalityWidth = CrewCertificateRenderer.#frontRow2Columns[0] +
      ctx.measureText(this.nationalityHeader[0]).width;
    const dateOfBirthWidth = CrewCertificateRenderer.#frontRow2Columns[1] +
      ctx.measureText(this.dateOfBirthHeader[0]).width;
    const employerWidth = CrewCertificateRenderer.#frontColumns +
      ctx.measureText(this.employerHeader[0]).width;
    const occupationWidth = CrewCertificateRenderer.#frontColumns +
      ctx.measureText(this.occupationHeader[0]).width;
    const numberWidth = CrewCertificateRenderer.#frontColumns +
      ctx.measureText(this.numberHeader[0]).width;
    const dateOfExpirationWidth = CrewCertificateRenderer.#frontColumns +
      ctx.measureText(this.dateOfExpirationHeader[0]).width;
    
    ctx.font = CrewCertificateRenderer.#intlFont;
    ctx.fillText(
      `/ ${this.nameHeader[1]}/ ${this.nameHeader[2]}`,
      nameWidth,
      CrewCertificateRenderer.#frontRows[0]
    );
    ctx.fillText("/", genderWidth, CrewCertificateRenderer.#frontRows[2]);
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
    ctx.fillText("/", nationalityWidth, CrewCertificateRenderer.#frontRows[2]);
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
    ctx.fillText("/", dateOfBirthWidth, CrewCertificateRenderer.#frontRows[2]);
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
      employerWidth,
      CrewCertificateRenderer.#frontRows[6]
    );
    ctx.fillText(
      `/ ${this.occupationHeader[1]}/ ${this.occupationHeader[2]}`,
      occupationWidth,
      CrewCertificateRenderer.#frontRows[8]
    );
    ctx.fillText(
      `/ ${this.numberHeader[1]}/ ${this.numberHeader[2]}`,
      numberWidth,
      CrewCertificateRenderer.#frontRows[10]
    );
    ctx.fillText(
      `/ ${this.dateOfExpirationHeader[1]}/ ${this.dateOfExpirationHeader[2]}`,
      dateOfExpirationWidth,
      CrewCertificateRenderer.#frontRows[12]
    );

    ctx.fillStyle = this.textColor;
    ctx.font = CrewCertificateRenderer.#dataFont;
    ctx.fillText(
      model.fullNameVIZ,
      CrewCertificateRenderer.#frontColumns,
      CrewCertificateRenderer.#frontRows[1],
      CrewCertificateRenderer.#mainHeaderX - CrewCertificateRenderer.#frontColumns
    );
    ctx.fillText(
      model.genderMarkerVIZ,
      CrewCertificateRenderer.#frontColumns,
      CrewCertificateRenderer.#frontRows[5]
    );
    ctx.fillText(
      model.nationalityCodeVIZ,
      CrewCertificateRenderer.#frontRow2Columns[0],
      CrewCertificateRenderer.#frontRows[5]
    );
    ctx.fillText(
      model.dateOfBirthVIZ,
      CrewCertificateRenderer.#frontRow2Columns[1],
      CrewCertificateRenderer.#frontRows[5]
    );
    ctx.fillText(
      model.employerVIZ,
      CrewCertificateRenderer.#frontColumns,
      CrewCertificateRenderer.#frontRows[7],
      CrewCertificateRenderer.#mainHeaderX - CrewCertificateRenderer.#frontColumns
    );
    ctx.fillText(
      model.occupationVIZ,
      CrewCertificateRenderer.#frontColumns,
      CrewCertificateRenderer.#frontRows[9],
      CrewCertificateRenderer.#mainHeaderX - CrewCertificateRenderer.#frontColumns
    );
    ctx.fillText(
      model.numberVIZ,
      CrewCertificateRenderer.#frontColumns,
      CrewCertificateRenderer.#frontRows[11]
    );
    ctx.fillText(
      model.dateOfExpirationVIZ,
      CrewCertificateRenderer.#frontColumns,
      CrewCertificateRenderer.#frontRows[13]
    );

    if (this.showGuides) {
      CrewCertificateRenderer.#drawBleedAndSafeLines(ctx);
    }
  }

  /** @param { CrewCertificate } model */
  /** @param { HTMLCanvasElement } canvas */
  async generateCardBack(model, canvas) {
    canvas.setAttribute("width", CrewCertificateRenderer.#cardArea[0]);
    canvas.setAttribute("height", CrewCertificateRenderer.#cardArea[1]);
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";

    ctx.fillStyle = this.backBackgroundColor;
    ctx.fillRect(
      0, 0,
      CrewCertificateRenderer.#cardArea[0],
      CrewCertificateRenderer.#cardArea[1]
    );
    if (this.backBackgroundImage) {
      const cardBackground = await CrewCertificateRenderer.#generateCanvasImg(
        this.backBackgroundImage
      );
      ctx.drawImage(
        cardBackground,
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
    if (this.mrzBackgroundImage) {
      const mrzBackground = await CrewCertificateRenderer.#generateCanvasImg(
        this.mrzBackgroundImage
      );
      ctx.drawImage(
        mrzBackground,
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
    if (this.mrzInQRCode) {
      this.#qrCode.qrCode = `${model.url}?mrz=${model.typeCodeMRZ}${model.authorityCodeMRZ}${model.numberVIZ}`;
    }
    else { this.#qrCode.qrCode = model.url; }
    const images = await Promise.all([
      CrewCertificateRenderer.#generateCanvasImg(this.#qrCode.qrCode),
      CrewCertificateRenderer.#generateCanvasImg(this.logo),
      CrewCertificateRenderer.#generateCanvasImg(this.smallLogo)
    ]);
    ctx.drawImage(
      images[0],
      CrewCertificateRenderer.#qrCodeXY[0],
      CrewCertificateRenderer.#qrCodeXY[1],
      CrewCertificateRenderer.#qrCodeArea[0],
      CrewCertificateRenderer.#qrCodeArea[1]
    );
    CrewCertificateRenderer.#fitImgInArea(
      images[1], ctx,
      CrewCertificateRenderer.#logoBackXY[0],
      CrewCertificateRenderer.#logoBackXY[1],
      CrewCertificateRenderer.#logoArea[0],
      CrewCertificateRenderer.#logoArea[1]
    );
    ctx.drawImage(
      images[2],
      CrewCertificateRenderer.#smallLogoXY[0],
      CrewCertificateRenderer.#smallLogoXY[1],
      CrewCertificateRenderer.#smallLogoArea[0],
      CrewCertificateRenderer.#smallLogoArea[1]
    );
    ctx.fillStyle = this.textColor;
    ctx.font = CrewCertificateRenderer.#headerFont;
    ctx.fillText(
      `${model.typeCodeVIZ}-${model.authorityCodeVIZ}${CrewCertificateRenderer.#headerSeparator}${CrewCertificateRenderer.#documentSize}`,
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
    const declarationWidth = CrewCertificateRenderer.#backColumns +
      ctx.measureText(this.declarationHeader[0]).width;
    const issueWidth = CrewCertificateRenderer.#backColumns +
      ctx.measureText(this.issueHeader[0]).width;

    ctx.font = CrewCertificateRenderer.#intlFont;
    ctx.fillText(
      `/ ${this.declarationHeader[1]}/`,
      declarationWidth,
      CrewCertificateRenderer.#backRows[0]
    );
    ctx.fillText(
      this.declarationHeader[2],
      CrewCertificateRenderer.#backColumns,
      CrewCertificateRenderer.#backRows[1]
    );
    ctx.fillText("/", issueWidth, CrewCertificateRenderer.#backRows[3]);
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
    const splitString = model.declarationVIZ.split(/\r?\n/);
    for (let i = 0; i < splitString.length; i += 1) {
      ctx.fillText(
        splitString[i],
        CrewCertificateRenderer.#backColumns,
        CrewCertificateRenderer.#backRows[2] + (i * 33)
      );
    }
    ctx.fillText(
      `${model.dateOfIssueVIZ}—${model.placeOfIssueVIZ}`,
      CrewCertificateRenderer.#backColumns,
      CrewCertificateRenderer.#backRows[6]
    );
    ctx.fillText(
      model.numberVIZ,
      CrewCertificateRenderer.#backNumberXY[0],
      CrewCertificateRenderer.#backNumberXY[1],
      1004 - CrewCertificateRenderer.#backNumberXY[0]
    );

    ctx.fillStyle = this.mrzColor;
    ctx.font = CrewCertificateRenderer.#mrzFont;
    for (let i = 0; i < model.mrzLine1.length; i += 1) {
      ctx.fillText(
        model.mrzLine1[i],
        CrewCertificateRenderer.#mrzX + (i * CrewCertificateRenderer.#mrzSpacing),
        CrewCertificateRenderer.#mrzY[0]
      );
      ctx.fillText(
        model.mrzLine2[i],
        CrewCertificateRenderer.#mrzX + (i * CrewCertificateRenderer.#mrzSpacing),
        CrewCertificateRenderer.#mrzY[1]
      );
      ctx.fillText(
        model.mrzLine3[i],
        CrewCertificateRenderer.#mrzX + (i * CrewCertificateRenderer.#mrzSpacing),
        CrewCertificateRenderer.#mrzY[2]
      );
    }

    if (this.showGuides) {
      CrewCertificateRenderer.#drawBleedAndSafeLines(ctx);
    }
  }

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
    return `bold 24px ${CrewCertificateRenderer.#vizFontFace.family}`;
  }
  static get #documentHeaderFont() {
    return `18px ${CrewCertificateRenderer.#vizFontFace.family}`;
  }
  static get #separatorHeaderFont() {
    return `bold 18px ${CrewCertificateRenderer.#vizFontFace.family}`;
  }
  static get #headerFont() {
    return `bold 18px ${CrewCertificateRenderer.#vizFontFace.family}`;
  }
  static get #intlFont() {
    return `italic 18px ${CrewCertificateRenderer.#vizFontFace.family}`;
  }
  static get #dataFont() {
    return `24px ${CrewCertificateRenderer.#vizFontFace.family}`;
  }
  static get #mrzFont() {
    return `44px ${CrewCertificateRenderer.#mrzFontFace.family}`;
  }
  static get #signatureFont() {
    return `61px ${CrewCertificateRenderer.#signatureFontFace.family}`;
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
    73,  // Re-Entry Declaration Header (Alternate Language 2)
    100, // Re-Entry Declaration Data
    229, // Date/Place of Issue Header
    254, // Date/Place of Issue Header (Alternate Language 1)
    279, // Date/Place of Issue Header (Alternate Language 2)
    306  // Date/Place of Issue Data
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
    ctx.lineTo(CrewCertificateRenderer.#cardArea[0], bleed);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, CrewCertificateRenderer.#cardArea[1] - bleed);
    ctx.lineTo(CrewCertificateRenderer.#cardArea[0], CrewCertificateRenderer.#cardArea[1] - bleed);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bleed, 0);
    ctx.lineTo(bleed, CrewCertificateRenderer.#cardArea[1]);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(CrewCertificateRenderer.#cardArea[0] - bleed, 0);
    ctx.lineTo(CrewCertificateRenderer.#cardArea[0] - bleed, CrewCertificateRenderer.#cardArea[1]);
    ctx.closePath(); ctx.stroke();

    ctx.fillStyle = "#0000ff";
    const safe = 48;
    ctx.beginPath();
    ctx.moveTo(0, safe);
    ctx.lineTo(CrewCertificateRenderer.#cardArea[0], safe);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, CrewCertificateRenderer.#cardArea[1] - safe);
    ctx.lineTo(CrewCertificateRenderer.#cardArea[0], CrewCertificateRenderer.#cardArea[1] - safe);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(safe, 0);
    ctx.lineTo(safe, CrewCertificateRenderer.#cardArea[1]);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(CrewCertificateRenderer.#cardArea[0] - safe, 0);
    ctx.lineTo(CrewCertificateRenderer.#cardArea[0] - safe, CrewCertificateRenderer.#cardArea[1]);
    ctx.closePath(); ctx.stroke();
  }
  static async generateSignatureFromText(signature) {
    const canvas = new OffscreenCanvas(
      CrewCertificateRenderer.#signatureArea[0],
      CrewCertificateRenderer.#signatureArea[1]
    );
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = this.textColor;
    ctx.font = CrewCertificateRenderer.#signatureFont;
    ctx.textBaseline = "top";
    const centerShift = (canvas.width - ctx.measureText(signature).width) / 2;
    ctx.fillText(
      signature, Math.max(centerShift, 0), 8,
      CrewCertificateRenderer.#signatureArea[0] - 6
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
      if (opt.employerHeader) { this.employerHeader = opt.employerHeader; }
      if (opt.occupationHeader) { this.occupationHeader = opt.occupationHeader; }
      if (opt.numberHeader) { this.numberHeader = opt.numberHeader; }
      if (opt.dateOfExpirationHeader) { this.dateOfExpirationHeader = opt.dateOfExpirationHeader; }
      if (opt.declarationHeader) { this.declarationHeader = opt.declarationHeader; }
      if (opt.issueHeader) { this.issueHeader = opt.issueHeader; }
    }
  }
}

export { CrewCertificateRenderer };