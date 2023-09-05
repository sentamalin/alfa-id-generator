class QRCodeData {
  #generator;

  // QR Code representation of the MRZ as a query component to a URL
  #qrCode;
  get qrCode() { return this.#qrCode; }
  set qrCode(value) {
    this.#generator.makeCode(value);
    this.#qrCode = this.#generator._oDrawing._elCanvas.toDataURL("image.png");
  }

  // Constructor
  constructor(opt) {
    if (opt) {
      if (opt.qrCode) { this.qrCode = opt.qrCode; }
      if (opt.generatorOpt) {
        this.#generator = new QRCode(document.createElement("div"), {
          width: opt.generatorOpt.width,
          height: opt.generatorOpt.height,
          colorDark: opt.generatorOpt.colorDark,
          colorLight: opt.generatorOpt.colorLight,
          correctLevel: opt.generatorOpt.correctLevel
        });
      }
      else {
        this.#generator = new QRCode(document.createElement("div"), {
          width: 256,
          height: 256,
          colorDark: "#000000ff",
          colorLight: "#00000000",
          correctLevel: QRCode.CorrectLevel.H
        });
      }
    }
  }
}

export { QRCodeData };