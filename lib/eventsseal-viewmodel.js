// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

import { EventsMRVB } from "./eventsmrvb.js";
import { EventsSealRenderer } from "./eventsseal-renderer.js";
import { loadFileFromUpload } from "./utilities/load-file-from-upload.js";
import { signSealUsingRNG } from "./utilities/sign-seal-using-rng.js";

/**
 * While not a proper "ViewModel", this loads the initial state of the model,
 *     sets the initial data as the values and placeholders of the web page,
 *     and whenever values are updated on the HTML form the generated images
 *     of the document are updated.
 */
export class EventsSealViewModel {
  #model = new EventsMRVB({
    typeCode: "V",
    authorityCode: "XAF",
    placeOfIssue: "Utopiopolis, UTO",
    validFrom: "2023-09-12",
    validThru: "2024-09-12",
    numberOfEntries: "Multiple",
    number: "960241263",
    visaType: "Silver Sponsor—Adult",
    fullName: "Millefeuille, Alfalfa",
    passportNumber: "362142069",
    usePassportInMRZ: false,
    nationalityCode: "UTO",
    birthDate: "1998-04-17",
    genderMarker: "F",
    optionalData: "",
    identifierCode: "XFSS",
    certReference: "00000",
    issueDate: "2023-09-01",
    signatureDate: "2023-09-01",
    durationOfStay: [4, 0, 0],
    visaTypeCode: "1"
  });

  #renderer = new EventsSealRenderer({
    frontBackgroundImage: "/cardBackgrounds/passport-mrva-lofiGrey.png",
    logo: "/smallLogos/alfa-bw.svg",
  });

  #inputTimeout = null;
  #frontFallback;
  #frontBlobURL = null;

  /** @type { Document } */ #document;
  /** @param { Document } document */
  set document(document) { this.#document = document; }

  /** @type { HTMLCanvasElement } */ #cardFrontElement;
  /** @param { HTMLCanvasElement } canvas */
  set cardFrontElement(canvas) { this.#cardFrontElement = canvas; }

  /** @type { HTMLInputElement } */ #typeCodeInput;
  /** @param { HTMLInputElement } input */
  set typeCodeInput(input) {
    this.#typeCodeInput = input;
    this.#typeCodeInput.setAttribute("minlength", 1);
    this.#typeCodeInput.setAttribute("maxlength", 2);
    this.#typeCodeInput.value = this.#model.typeCode;
    this.#typeCodeInput.setAttribute("placeholder", this.#model.typeCode);
    this.#typeCodeInput.addEventListener("input", this, false);
    this.#typeCodeInput.addEventListener("change", this, false);
  }
  onTypeCodeInputChange() {
    if (this.#typeCodeInput.checkValidity() &&
    this.#model.typeCode !== this.#typeCodeInput.value) {
      this.#model.typeCode = this.#typeCodeInput.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #authorityCodeInput;
  /** @param { HTMLInputElement } input */
  set authorityCodeInput(input) {
    this.#authorityCodeInput = input;
    this.#authorityCodeInput.setAttribute("minlength", 3);
    this.#authorityCodeInput.setAttribute("maxlength", 3);
    this.#authorityCodeInput.value = this.#model.authorityCode;
    this.#authorityCodeInput.setAttribute("placeholder", this.#model.authorityCode);
    this.#authorityCodeInput.addEventListener("input", this, false);
    this.#authorityCodeInput.addEventListener("change", this, false);
  }
  onAuthorityCodeInputChange() {
    if (this.#authorityCodeInput.checkValidity() &&
    this.#model.authorityCode !== this.#authorityCodeInput.value) {
      this.#model.authorityCode = this.#authorityCodeInput.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #validThruInput;
  /** @param { HTMLInputElement } input */
  set validThruInput(input) {
    this.#validThruInput = input;
    this.#validThruInput.value = this.#model.validThru.toISOString().slice(0,10);
    this.#validThruInput.addEventListener("change", this, false);
  }
  onValidThruInputChange() {
    this.#model.validThru = this.#validThruInput.value;
    this.#generateCard();
  }

  /** @type { HTMLInputElement } */ #numberOfEntriesInput;
  /** @param { HTMLInputElement } input */
  set numberOfEntriesInput(input) {
    this.#numberOfEntriesInput = input;
    this.#numberOfEntriesInput.value = this.#model.numberOfEntries;
    this.#numberOfEntriesInput.setAttribute("placeholder", this.#model.numberOfEntries);
    this.#numberOfEntriesInput.addEventListener("input", this, false);
    this.#numberOfEntriesInput.addEventListener("change", this, false);
  }
  onNumberOfEntriesInputChange() {
    if (this.#model.numberOfEntries !== this.#numberOfEntriesInput.value) {
      this.#model.numberOfEntries = this.#numberOfEntriesInput.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #numberInput;
  /** @param { HTMLInputElement } input */
  set numberInput(input) {
    this.#numberInput = input;
    this.#numberInput.setAttribute("minlength", 1);
    this.#numberInput.setAttribute("maxlength", 9);
    this.#numberInput.value = this.#model.number;
    this.#numberInput.setAttribute("placeholder", this.#model.number);
    this.#numberInput.addEventListener("input", this, false);
    this.#numberInput.addEventListener("change", this, false);
  }
  onNumberInputChange() {
    if (this.#numberInput.checkValidity() &&
    this.#model.number !== this.#numberInput.value) {
      this.#model.number = this.#numberInput.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #fullNameInput;
  /** @param { HTMLInputElement } input */
  set fullNameInput(input) {
    this.#fullNameInput = input;
    this.#fullNameInput.setAttribute("minlength", 1);
    this.#fullNameInput.setAttribute("maxlength", 30);
    this.#fullNameInput.value = this.#model.fullName;
    this.#fullNameInput.setAttribute("placeholder", this.#model.fullName);
    this.#fullNameInput.addEventListener("input", this, false);
    this.#fullNameInput.addEventListener("change", this, false);
  }
  onFullNameInputChange() {
    if (this.#fullNameInput.checkValidity() &&
    this.#model.fullName !== this.#fullNameInput.value) {
      this.#model.fullName = this.#fullNameInput.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #passportNumberInput;
  /** @param { HTMLInputElement } input */
  set passportNumberInput(input) {
    this.#passportNumberInput = input;
    this.#passportNumberInput.setAttribute("minlength", 1);
    this.#passportNumberInput.setAttribute("maxlength", 9);
    this.#passportNumberInput.value = this.#model.passportNumber;
    this.#passportNumberInput.setAttribute("placeholder", this.#model.passportNumber);
    this.#passportNumberInput.addEventListener("input", this, false);
    this.#passportNumberInput.addEventListener("change", this, false);
  }
  onPassportNumberInputChange() {
    if (this.#passportNumberInput.checkValidity() &&
    this.#model.passportNumber !== this.#passportNumberInput.value) {
      this.#model.passportNumber = this.#passportNumberInput.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #nationalityCodeInput;
  /** @param { HTMLInputElement } input */
  set nationalityCodeInput(input) {
    this.#nationalityCodeInput = input;
    this.#nationalityCodeInput.setAttribute("minlength", 3);
    this.#nationalityCodeInput.setAttribute("maxlength", 3);
    this.#nationalityCodeInput.value = this.#model.nationalityCode;
    this.#nationalityCodeInput.setAttribute("placeholder", this.#model.nationalityCode);
    this.#nationalityCodeInput.addEventListener("input", this, false);
    this.#nationalityCodeInput.addEventListener("change", this, false);
  }
  onNationalityCodeInputChange() {
    if (this.#nationalityCodeInput.checkValidity() &&
    this.#model.nationalityCode !== this.#nationalityCodeInput.value) {
      this.#model.nationalityCode = this.#nationalityCodeInput.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #dateOfBirthInput;
  /** @param { HTMLInputElement } input */
  set dateOfBirthInput(input) {
    this.#dateOfBirthInput = input;
    this.#dateOfBirthInput.value = this.#model.birthDate.toISOString().slice(0,10);
    this.#dateOfBirthInput.addEventListener("change", this, false);
  }
  onDateOfBirthInputChange() {
    this.#model.birthDate = this.#dateOfBirthInput.value;
    this.#generateCard();
  }

  /** @type { HTMLInputElement } */ #genderMarkerInput;
  /** @param { HTMLInputElement } input */
  set genderMarkerInput(input) {
    this.#genderMarkerInput = input;
    this.#genderMarkerInput.value = this.#model.genderMarker;
    this.#genderMarkerInput.addEventListener("change", this, false);
  }
  onGenderMarkerInputChange() {
    this.#model.genderMarker = this.#genderMarkerInput.value;
    this.#generateCard();
  }

  /** @type { HTMLInputElement } */ #issueDateInput;
  /** @param { HTMLInputElement } input */
  set issueDateInput(input) {
    this.#issueDateInput = input;
    this.#issueDateInput.value = this.#model.issueDate.toISOString().slice(0,10);
    this.#issueDateInput.addEventListener("change", this, false);
  }
  onIssueDateInputChange() {
    this.#model.issueDate = this.#issueDateInput.value;
    this.#generateCard();
  }

  /** @type { HTMLInputElement } */ #identifierInput;
  /** @param { HTMLInputElement } input */
  set identifierInput(input) {
    this.#identifierInput = input;
    this.#identifierInput.setAttribute("minlength", 4);
    this.#identifierInput.setAttribute("maxlength", 4);
    this.#identifierInput.value = this.#model.identifierCode;
    this.#identifierInput.setAttribute("placeholder", this.#model.identifierCode);
    this.#identifierInput.addEventListener("input", this, false);
    this.#identifierInput.addEventListener("change", this, false);
  }
  onIdentifierInputChange() {
    if (this.#identifierInput.checkValidity() &&
    this.#model.identifierCode !== this.#identifierInput.value) {
      this.#model.identifierCode = this.#identifierInput.value;
      this.#generateCard();
    }
  }
  /** @type { HTMLInputElement } */ #certReferenceInput;
  /** @param { HTMLInputElement } input */
  set certReferenceInput(input) {
    this.#certReferenceInput = input;
    this.#certReferenceInput.setAttribute("minlength", 1);
    this.#certReferenceInput.value = this.#model.certReference;
    this.#certReferenceInput.setAttribute("placeholder", this.#model.certReference);
    this.#certReferenceInput.addEventListener("input", this, false);
    this.#certReferenceInput.addEventListener("change", this, false);
  }
  onCertReferenceInputChange() {
    if (this.#certReferenceInput.checkValidity() &&
    this.#model.certReference !== this.#certReferenceInput.value) {
      this.#model.certReference = this.#certReferenceInput.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #sealSignatureDateInput;
  /** @param { HTMLInputElement } input */
  set sealSignatureDateInput(input) {
    this.#sealSignatureDateInput = input;
    this.#sealSignatureDateInput.value = this.#model.signatureDate.toISOString().slice(0,10);
    this.#sealSignatureDateInput.addEventListener("change", this, false);
  }
  onSealSignatureDateInputChange() {
    this.#model.signatureDate = this.#sealSignatureDateInput.value;
    this.#generateCard();
  }

  /** @type { HTMLInputElement } */ #dayDurationInput;
  /** @param { HTMLInputElement } input */
  set dayDurationInput(input) {
    this.#dayDurationInput = input;
    this.#dayDurationInput.setAttribute("min", 0);
    this.#dayDurationInput.setAttribute("max", 254);
    this.#dayDurationInput.value = this.#model.durationOfStay[0];
    this.#dayDurationInput.addEventListener("input", this, false);
    this.#dayDurationInput.addEventListener("change", this, false);
  }
  onDayDurationInputChange() {
    if (this.#dayDurationInput.checkValidity() &&
    this.#model.durationOfStay[0] !== this.#dayDurationInput.value) {
      this.#updateDurationOfStay();
    }
  }

  /** @type { HTMLInputElement } */ #monthDurationInput;
  /** @param { HTMLInputElement } input */
  set monthDurationInput(input) {
    this.#monthDurationInput = input;
    this.#monthDurationInput.setAttribute("min", 0);
    this.#monthDurationInput.setAttribute("max", 254);
    this.#monthDurationInput.value = this.#model.durationOfStay[1];
    this.#monthDurationInput.addEventListener("input", this, false);
    this.#monthDurationInput.addEventListener("change", this, false);
  }
  onMonthDurationInputChange() {
    if (this.#monthDurationInput.checkValidity() &&
    this.#model.durationOfStay[1] !== this.#monthDurationInput.value) {
      this.#updateDurationOfStay();
    }
  }

  /** @type { HTMLInputElement } */ #yearDurationInput;
  /** @param { HTMLInputElement } input */
  set yearDurationInput(input) {
    this.#yearDurationInput = input;
    this.#yearDurationInput.setAttribute("min", 0);
    this.#yearDurationInput.setAttribute("max", 254);
    this.#yearDurationInput.value = this.#model.durationOfStay[2];
    this.#yearDurationInput.addEventListener("input", this, false);
    this.#yearDurationInput.addEventListener("change", this, false);
  }
  onYearDurationInputChange() {
    if (this.#yearDurationInput.checkValidity() &&
    this.#model.durationOfStay[2] !== this.#yearDurationInput.value) {
      this.#updateDurationOfStay();
    }
  }

  #updateDurationOfStay() {
    this.#model.durationOfStay = [
      this.#dayDurationInput.value,
      this.#monthDurationInput.value,
      this.#yearDurationInput.value
    ];
    this.#generateCard();
  }

  /** @type { HTMLInputElement } */ #visaTypeCodeInput;
  /** @param { HTMLInputElement } input */
  set visaTypeCodeInput(input) {
    this.#visaTypeCodeInput = input;
    this.#visaTypeCodeInput.setAttribute("minlength", 1);
    this.#visaTypeCodeInput.setAttribute("maxlength", 8);
    this.#visaTypeCodeInput.value = this.#model.visaTypeCode;
    this.#visaTypeCodeInput.setAttribute("placeholder", this.#model.visaTypeCode);
    this.#visaTypeCodeInput.addEventListener("input", this, false);
    this.#visaTypeCodeInput.addEventListener("change", this, false);
  }
  onVisaTypeCodeInputChange() {
    if (this.#visaTypeCodeInput.checkValidity() &&
    this.#model.visaTypeCode !== this.#visaTypeCodeInput.value) {
      this.#model.visaTypeCode = this.#visaTypeCodeInput.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #headerColorInput;
  /** @param { HTMLInputElement } input */
  set headerColorInput(input) {
    this.#headerColorInput = input;
    this.#headerColorInput.value = this.#renderer.headerColor;
    this.#headerColorInput.addEventListener("change", this, false);
  }
  onHeaderColorInputChange() {
    this.#renderer.headerColor = this.#headerColorInput.value;
    this.#generateCard();
  }

  /** @type { HTMLInputElement } */ #textColorInput;
  /** @param { HTMLInputElement } input */
  set textColorInput(input) {
    this.#textColorInput = input;
    this.#textColorInput.value = this.#renderer.textColor;
    this.#textColorInput.addEventListener("change", this, false);
  }
  onTextColorInputChange() {
    this.#renderer.textColor = this.#textColorInput.value;
    this.#generateCard();
  }

  /** @type { HTMLInputElement } */ #frontBackgroundColorInput;
  /** @param { HTMLInputElement } input */
  set frontBackgroundColorInput(input) {
    this.#frontBackgroundColorInput = input;
    this.#frontBackgroundColorInput.value = this.#renderer.frontBackgroundColor;
    this.#frontBackgroundColorInput.addEventListener("change", this, false);
  }
  onFrontBackgroundColorInputChange() {
    this.#renderer.frontBackgroundColor = this.#frontBackgroundColorInput.value;
    this.#generateCard();
  }

  /** @type { HTMLInputElement } */ #frontBackgroundImageInput;
  /** @param { HTMLInputElement } input */
  set frontBackgroundImageInput(input) {
    this.#frontBackgroundImageInput = input;
    if (!this.#renderer.frontBackgroundImage) { this.#frontBackgroundImageInput.value = "none"; }
    else { this.#frontBackgroundImageInput.value = this.#renderer.frontBackgroundImage; }
    this.#frontBackgroundImageInput.addEventListener("change", this, false);
  }
  onFrontBackgroundImageInputChange() {
    switch (this.#frontBackgroundImageInput.value) {
      case "none":
        this.#frontBackgroundImageFileInput.setAttribute("disabled", "disabled");
        this.#renderer.frontBackgroundImage = null;
        this.#generateCard();
        break;
      case "upload":
        this.#frontBackgroundImageFileInput.removeAttribute("disabled");
        break;
      default:
        this.#frontBackgroundImageFileInput.setAttribute("disabled", "disabled");
        this.#renderer.frontBackgroundImage = this.#frontBackgroundImageInput.value;
        this.#generateCard();
        break;
    }
  }

  /** @type { HTMLInputElement } */ #frontBackgroundImageFileInput;
  /** @param { HTMLInputElement } input */
  set frontBackgroundImageFileInput(input) {
    this.#frontBackgroundImageFileInput = input;
    this.#frontBackgroundImageFileInput.setAttribute("accept", "image/*");
    this.#frontBackgroundImageFileInput.setAttribute("disabled", "disabled");
    this.#frontBackgroundImageFileInput.addEventListener("change", this, false);
  }
  async onFrontBackgroundImageFileInputChange() {
    if (this.#frontBackgroundImageFileInput.files[0]) {
      this.#renderer.frontBackgroundImage = await loadFileFromUpload(this.#frontBackgroundImageFileInput.files[0]);
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #logoInput;
  /** @param { HTMLInputElement } input */
  set logoInput(input) {
    this.#logoInput = input;
    this.#logoInput.value = this.#renderer.logo;
    this.#logoInput.addEventListener("change", this, false);
  }
  onLogoInputChange() {
    switch (this.#logoInput.value) {
      case "upload":
        this.#logoFileInput.removeAttribute("disabled");
        break;
      default:
        this.#logoFileInput.setAttribute("disabled", "disabled");
        this.#renderer.logo = this.#logoInput.value;
        this.#generateCard();
        break;
    }
  }

  /** @type { HTMLInputElement } */ #logoFileInput;
  /** @param { HTMLInputElement } input */
  set logoFileInput(input) {
    this.#logoFileInput = input;
    this.#logoFileInput.setAttribute("accept", "image/*");
    this.#logoFileInput.setAttribute("disabled", "disabled");
    this.#logoFileInput.addEventListener("change", this, false);
  }
  async onLogoFileInputChange() {
    if (this.#logoFileInput.files[0]) {
      this.#renderer.logo = await loadFileFromUpload(this.#logoFileInput.files[0]);
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #fullAuthorityInput;
  /** @param { HTMLInputElement } input */
  set fullAuthorityInput(input) {
    this.#fullAuthorityInput = input;
    this.#fullAuthorityInput.value = this.#renderer.fullAuthority;
    this.#fullAuthorityInput.setAttribute("placeholder", this.#renderer.fullAuthority);
    this.#fullAuthorityInput.addEventListener("input", this, false);
    this.#fullAuthorityInput.addEventListener("change", this, false);
  }
  onFullAuthorityInputChange() {
    if (this.#renderer.fullAuthority !== this.#fullAuthorityInput.value) {
      this.#renderer.fullAuthority = this.#fullAuthorityInput.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #fullDocumentNameInput;
  /** @param { HTMLInputElement } input */
  set fullDocumentNameInput(input) {
    this.#fullDocumentNameInput = input;
    this.#fullDocumentNameInput.value = this.#renderer.fullDocumentName;
    this.#fullDocumentNameInput.setAttribute("placeholder", this.#renderer.fullDocumentName);
    this.#fullDocumentNameInput.addEventListener("input", this, false);
    this.#fullDocumentNameInput.addEventListener("change", this, false);
  }
  onFullDocumentNameInputChange() {
    if (this.#renderer.fullDocumentName !== this.#fullDocumentNameInput.value) {
      this.#renderer.fullDocumentName = this.#fullDocumentNameInput.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #showGuidesInput;
  /** @param { HTMLInputElement } input */
  set showGuidesInput(input) {
    this.#showGuidesInput = input;
    this.#showGuidesInput.addEventListener("change", this, false);
  }
  onShowGuidesInputChange() {
    if (this.#renderer.showGuides) { this.#renderer.showGuides = false; }
    else { this.#renderer.showGuides = true; }
    this.#generateCard();
  }

  // Public methods
  /** @param { Event } e */
  handleEvent(e) {
    const field = `${e.target.id[0].toUpperCase()}${e.target.id.slice(1)}`;
    clearTimeout(this.#inputTimeout);
    if (e.type === "input") {
      this.#inputTimeout = setTimeout(() => {
        this[`on${field}InputChange`]();
      }, 1000);
    }
    else { this[`on${field}InputChange`](); }
  }

  /** @param { Document } document */
  async initialize(document) {
    this.document = document;
    this.#renderer.fonts = this.#document.fonts;
    await this.#renderer.loadCanvasFonts();
    this.cardFrontElement = this.#document.getElementById("cardFront");
    this.#frontFallback = this.#document.getElementById("offscreen-front");
    await this.#generateCard();
    const inputFields = [
      "typeCode",
      "authorityCode",
      "validThru",
      "numberOfEntries",
      "number",
      "fullName",
      "passportNumber",
      "nationalityCode",
      "dateOfBirth",
      "genderMarker",
      "headerColor",
      "textColor",
      "frontBackgroundColor",
      "frontBackgroundImage",
      "frontBackgroundImageFile",
      "logo",
      "logoFile",
      "fullAuthority",
      "fullDocumentName",
      "showGuides",
      "identifier",
      "certReference",
      "issueDate",
      "sealSignatureDate",
      "dayDuration",
      "monthDuration",
      "yearDuration",
      "visaTypeCode"
    ];
    for (const elementID of inputFields) {
      this[`${elementID}Input`] = this.#document.getElementById(elementID);
    }
  }

  // Private methods
  async #generateCard() {
    await signSealUsingRNG(this.#model);
    const canvas = await this.#renderer.generateCardFront(this.#model, this.#frontFallback);
    this.#cardFrontElement.width = 1055;
    this.#cardFrontElement.height = 1492;
    const ctx = this.#cardFrontElement.getContext("2d");
    const pageSpecimen = await new Promise((resolve, reject) => {
      const imgNode = new Image();
      imgNode.addEventListener(
        "load",
        () => { resolve(imgNode); },
        false
      );
      imgNode.src = "/specimens/blank-page.png";
    });
    ctx.translate(0, 1492);
    ctx.rotate(270 * Math.PI / 180);
    ctx.drawImage(pageSpecimen, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#999999";
    ctx.fillRect(190, 237, 278, 406);
    ctx.drawImage(
      canvas, 16, 16, EventsSealRenderer.cutCardArea[0], EventsSealRenderer.cutCardArea[1],
      191, 238, EventsSealRenderer.cutCardArea[0], EventsSealRenderer.cutCardArea[1]
    );
    const downloadFront = this.#document.getElementById("downloadFront");
    let blob;
    if (typeof OffscreenCanvas === "undefined") {
      blob = await new Promise(resolve => canvas.toBlob(resolve));
    }
    else { blob = await canvas.convertToBlob(); }
    if (this.#frontBlobURL !== null) { URL.revokeObjectURL(this.#frontBlobURL); }
    this.#frontBlobURL = URL.createObjectURL(blob);
    downloadFront.setAttribute(
      "download",
      `${this.#model.typeCode.toVIZ()}${this.#model.authorityCode.toVIZ()}` +
      `${this.#model.number.toVIZ()}-seal.png`
    );
    downloadFront.setAttribute("href", this.#frontBlobURL);
  }
}
