/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { CrewID } from "/modules/CrewID.js";
import { IDBadgeRenderer } from "./IDBadgeRenderer.js";

class IDBadgeViewModel {
  #model = new CrewID({
    typeCode: "IC",
    authorityCode: "XAF",
    number: "362142069",
    dateOfExpiration: "2033-08-23",
    fullName: "Millefeuille, Alfalfa",
    optionalData: "",
    employer: "Peets Aviation Limited",
    picture: "/photos/fox.jpg",
    url: "https://airlinefurries.com/"
  });

  #renderer = new IDBadgeRenderer({
    headerColor: "#000033",
    textColor: "#000000",
    mrzColor: "#000000",
    frontBackgroundColor: "#efefef",
    frontBackgroundImage: "/cardBackgrounds/idbadge-lofiGrey-front.png",
    backBackgroundColor: "#efefef",
    backBackgroundImage: "/cardBackgrounds/lofiGrey.png",
    mrzBackgroundColor: "#ffffff",
    mrzBackgroundImage: null,
    numberUnderlayColor: "#ffffff",
    numberUnderlayAlpha: 255,
    logoUnderlayColor: "#dddddd",
    logoUnderlayAlpha: 255,
    logo: "/logos/peets.svg",
    smallLogo: "/smallLogos/alfa-bw.svg",
    showPunchSlot: true,
    mrzInQRCode: true,
    showGuides: false,
    additionalElements: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n",
    badgeType: "CREW",
    badgeSubtype: "FURRY",
    nameHeader: [
      "NAME",
      "NOM",
      "APELLIDOS"
    ],
    employerHeader: [
      "EMPLOYER",
      "EMPLOYEUR",
      "EMPLEADOR"
    ],
    numberHeader: [
      "ID NO",
      "NO DU ID",
      "NO DEL ID"
    ],
    dateOfExpirationHeader: [
      "EXPIRY",
      "EXPIRATION",
      "EXPIRACIÓN"
    ],
    additionalElementsHeader: [
      "OPTIONAL ADDITIONAL ELEMENTS",
      "ÉLÉMENTS SUPPLÉMENTAIRES FACULTATIFS",
      "ELEMENTOS ADICIONALES OPCIONALES"
    ],
  });

  #inputTimeout = null;
  #frontFallback;
  #backFallback;
  #frontBlobURL = null;
  #backBlobURL = null;

  /** @type { Document } */ #document;
  /** @param { Document } document */
  set document(document) { this.#document = document; }

  /** @type { HTMLCanvasElement } */ #cardFrontElement;
  /** @param { HTMLCanvasElement } canvas */
  set cardFrontElement(canvas) { this.#cardFrontElement = canvas; }

  /** @type { HTMLCanvasElement } */ #cardBackElement;
  /** @param { HTMLCanvasElement } canvas */
  set cardBackElement(canvas) { this.#cardBackElement = canvas; }

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

  /** @type { HTMLInputElement } */ #dateOfExpirationInput;
  /** @param { HTMLInputElement } input */
  set dateOfExpirationInput(input) {
    this.#dateOfExpirationInput = input;
    this.#dateOfExpirationInput.value = this.#model.dateOfExpiration;
    this.#dateOfExpirationInput.addEventListener("change", this, false);
  }
  onDateOfExpirationInputChange() {
    this.#model.dateOfExpiration = this.#dateOfExpirationInput.value;
    this.#generateCard();
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

  /** @type { HTMLInputElement } */ #optionalDataInput;
  /** @param { HTMLInputElement } input */
  set optionalDataInput(input) {
    this.#optionalDataInput = input;
    this.#optionalDataInput.setAttribute("minlength", 0);
    this.#optionalDataInput.setAttribute("maxlength", 26);
    this.#optionalDataInput.addEventListener("input", this, false);
    this.#optionalDataInput.addEventListener("change", this, false);
  }
  onOptionalDataInputChange() {
    if (this.#optionalDataInput.checkValidity() &&
    this.#model.optionalData !== this.#optionalDataInput.value) {
      this.#model.optionalData = this.#optionalDataInput.value;
      this.#generateCardBack();
    }
  }

  /** @type { HTMLInputElement } */ #employerInput;
  /** @param { HTMLInputElement } input */
  set employerInput(input) {
    this.#employerInput = input;
    this.#employerInput.value = this.#model.employer;
    this.#employerInput.setAttribute("placeholder", this.#model.employer);
    this.#employerInput.addEventListener("input", this, false);
    this.#employerInput.addEventListener("change", this, false);
  }
  onEmployerInputChange() {
    if (this.#model.employer !== this.#employerInput.value) {
      this.#model.employer = this.#employerInput.value;
      this.#generateCardFront();
    }
  }

  /** @type { HTMLInputElement } */ #pictureInput;
  /** @param { HTMLInputElement } input */
  set pictureInput(input) {
    this.#pictureInput = input;
    this.#pictureInput.setAttribute("accept", "image/*");
    this.#pictureInput.addEventListener("change", this, false);
  }
  async onPictureInputChange() {
    if (this.#pictureInput.files[0]) {
      this.#model.picture = await this.constructor.#getFileData(this.#pictureInput.files[0]);
      this.#generateCardFront();
    }
  }

  /** @type { HTMLInputElement } */ #urlInput;
  /** @param { HTMLInputElement } input */
  set urlInput(input) {
    this.#urlInput = input;
    this.#urlInput.value = this.#model.url;
    this.#urlInput.setAttribute("placeholder", this.#model.url);
    this.#urlInput.addEventListener("input", this, false);
    this.#urlInput.addEventListener("change", this, false);
  }
  onUrlInputChange() {
    if (this.#urlInput.checkValidity() &&
    this.#model.url !== this.#urlInput.value) {
      this.#model.url = this.#urlInput.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #mrzInQRCodeInput;
  /** @param { HTMLInputElement } input */
  set mrzInQRCodeInput(input) {
    this.#mrzInQRCodeInput = input;
    this.#mrzInQRCodeInput.addEventListener("change", this, false);
  }
  onMrzInQRCodeInputChange() {
    if (this.#renderer.mrzInQRCode) { this.#renderer.mrzInQRCode = false; }
    else { this.#renderer.mrzInQRCode = true; }
    this.#generateCard();
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

  /** @type { HTMLInputElement } */ #mrzColorInput;
  /** @param { HTMLInputElement } input */
  set mrzColorInput(input) {
    this.#mrzColorInput = input;
    this.#mrzColorInput.value = this.#renderer.mrzColor;
    this.#mrzColorInput.addEventListener("change", this, false);
  }
  onMrzColorInputChange() {
    this.#renderer.mrzColor = this.#mrzColorInput.value;
    this.#generateCardBack();
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
    this.#generateCardFront();
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
        this.#generateCardFront();
        break;
      case "upload":
        this.#frontBackgroundImageFileInput.removeAttribute("disabled");
        break;
      default:
        this.#frontBackgroundImageFileInput.setAttribute("disabled", "disabled");
        this.#renderer.frontBackgroundImage = this.#frontBackgroundImageInput.value;
        this.#generateCardFront();
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
      this.#renderer.frontBackgroundImage = await this.constructor.#getFileData(this.#frontBackgroundImageFileInput.files[0]);
      this.#generateCardFront();
    }
  }

  /** @type { HTMLInputElement } */ #backBackgroundColorInput;
  /** @param { HTMLInputElement } input */
  set backBackgroundColorInput(input) {
    this.#backBackgroundColorInput = input;
    this.#backBackgroundColorInput.value = this.#renderer.backBackgroundColor;
    this.#backBackgroundColorInput.addEventListener("change", this, false);
  }
  onBackBackgroundColorInputChange() {
    this.#renderer.backBackgroundColor = this.#backBackgroundColorInput.value;
    this.#generateCardBack();
  }

  /** @type { HTMLInputElement } */ #backBackgroundImageInput;
  /** @param { HTMLInputElement } input */
  set backBackgroundImageInput(input) {
    this.#backBackgroundImageInput = input;
    if (!this.#renderer.backBackgroundImage) { this.#backBackgroundImageInput.value = "none"; }
    else { this.#backBackgroundImageInput.value = this.#renderer.backBackgroundImage; }
    this.#backBackgroundImageInput.addEventListener("change", this, false);
  }
  onBackBackgroundImageInputChange() {
    switch (this.#backBackgroundImageInput.value) {
      case "none":
        this.#backBackgroundImageFileInput.setAttribute("disabled", "disabled");
        this.#renderer.backBackgroundImage = null;
        this.#generateCardBack();
        break;
      case "upload":
        this.#backBackgroundImageFileInput.removeAttribute("disabled");
        break;
      default:
        this.#backBackgroundImageFileInput.setAttribute("disabled", "disabled");
        this.#renderer.backBackgroundImage = this.#backBackgroundImageInput.value;
        this.#generateCardBack();
        break;
    }
  }

  /** @type { HTMLInputElement } */ #backBackgroundImageFileInput;
  /** @param { HTMLInputElement } input */
  set backBackgroundImageFileInput(input) {
    this.#backBackgroundImageFileInput = input;
    this.#backBackgroundImageFileInput.setAttribute("accept", "image/*");
    this.#backBackgroundImageFileInput.setAttribute("disabled", "disabled");
    this.#backBackgroundImageFileInput.addEventListener("change", this, false);
  }
  async onBackBackgroundImageFileInputChange() {
    if (this.#backBackgroundImageFileInput.files[0]) {
      this.#renderer.backBackgroundImage = await this.constructor.#getFileData(this.#backBackgroundImageFileInput.files[0]);
      this.#generateCardBack();
    }
  }

  /** @type { HTMLInputElement } */ #mrzBackgroundColorInput;
  /** @param { HTMLInputElement } input */
  set mrzBackgroundColorInput(input) {
    this.#mrzBackgroundColorInput = input;
    this.#mrzBackgroundColorInput.value = this.#renderer.mrzBackgroundColor;
    this.#mrzBackgroundColorInput.addEventListener("change", this, false);
  }
  onMrzBackgroundColorInputChange() {
    this.#renderer.mrzBackgroundColor = this.#mrzBackgroundColorInput.value;
    this.#generateCardBack();
  }

  /** @type { HTMLInputElement } */ #mrzBackgroundImageInput;
  /** @param { HTMLInputElement } input */
  set mrzBackgroundImageInput(input) {
    this.#mrzBackgroundImageInput = input;
    if (!this.#renderer.mrzBackgroundImage) { this.#mrzBackgroundImageInput.value = "none"; }
    else { this.#mrzBackgroundImageInput.value = this.#renderer.mrzBackgroundImage; }
    this.#mrzBackgroundImageInput.addEventListener("change", this, false);
  }
  onMrzBackgroundImageInputChange() {
    switch (this.#mrzBackgroundImageInput.value) {
      case "none":
        this.#mrzBackgroundImageFileInput.setAttribute("disabled", "disabled");
        this.#renderer.mrzBackgroundImage = null;
        this.#generateCardBack();
        break;
      case "upload":
        this.#mrzBackgroundImageFileInput.removeAttribute("disabled");
        break;
      default:
        this.#mrzBackgroundImageFileInput.setAttribute("disabled", "disabled");
        this.#renderer.mrzBackgroundImage = this.#mrzBackgroundImageInput.value;
        this.#generateCardBack();
        break;
    }
  }

  /** @type { HTMLInputElement } */ #mrzBackgroundImageFileInput;
  /** @param { HTMLInputElement } input */
  set mrzBackgroundImageFileInput(input) {
    this.#mrzBackgroundImageFileInput = input;
    this.#mrzBackgroundImageFileInput.setAttribute("accept", "image/*");
    this.#mrzBackgroundImageFileInput.setAttribute("disabled", "disabled");
    this.#mrzBackgroundImageFileInput.addEventListener("change", this, false);
  }
  async onMrzBackgroundImageFileInputChange() {
    if (this.#mrzBackgroundImageFileInput.files[0]) {
      this.#renderer.mrzBackgroundImage = await this.constructor.#getFileData(this.#mrzBackgroundImageFileInput.files[0]);
      this.#generateCardBack();
    }
  }

  /** @type { HTMLInputElement } */ #numberUnderlayColorInput;
  /** @param { HTMLInputElement } input */
  set numberUnderlayColorInput(input) {
    this.#numberUnderlayColorInput = input;
    this.#numberUnderlayColorInput.value = this.#renderer.numberUnderlayColor;
    this.#numberUnderlayColorInput.addEventListener("change", this, false);
  }
  onNumberUnderlayColorInputChange() {
    this.#renderer.numberUnderlayColor = this.#numberUnderlayColorInput.value;
    this.#generateCardBack();
  }

  /** @type { HTMLInputElement } */ #numberUnderlayAlphaInput;
  /** @param { HTMLInputElement } input */
  set numberUnderlayAlphaInput(input) {
    this.#numberUnderlayAlphaInput = input;
    this.#numberUnderlayAlphaInput.setAttribute("min", 0);
    this.#numberUnderlayAlphaInput.setAttribute("max", 255);
    this.#numberUnderlayAlphaInput.value = this.#renderer.numberUnderlayAlpha;
    this.#numberUnderlayAlphaInput.addEventListener("change", this, false);
  }
  onNumberUnderlayAlphaInputChange() {
    this.#renderer.numberUnderlayAlpha = Number(this.#numberUnderlayAlphaInput.value);
    this.#generateCardBack();
  }

  /** @type { HTMLInputElement } */ #logoUnderlayColorInput;
  /** @param { HTMLInputElement } input */
  set logoUnderlayColorInput(input) {
    this.#logoUnderlayColorInput = input;
    this.#logoUnderlayColorInput.value = this.#renderer.logoUnderlayColor;
    this.#logoUnderlayColorInput.addEventListener("change", this, false);
  }
  onLogoUnderlayColorInputChange() {
    this.#renderer.logoUnderlayColor = this.#logoUnderlayColorInput.value;
    this.#generateCard();
  }

  /** @type { HTMLInputElement } */ #logoUnderlayAlphaInput;
  /** @param { HTMLInputElement } input */
  set logoUnderlayAlphaInput(input) {
    this.#logoUnderlayAlphaInput = input;
    this.#logoUnderlayAlphaInput.setAttribute("min", 0);
    this.#logoUnderlayAlphaInput.setAttribute("max", 255);
    this.#logoUnderlayAlphaInput.value = this.#renderer.logoUnderlayAlpha;
    this.#logoUnderlayAlphaInput.addEventListener("change", this, false);
  }
  onLogoUnderlayAlphaInputChange() {
    this.#renderer.logoUnderlayAlpha = Number(this.#logoUnderlayAlphaInput.value);
    this.#generateCard();
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
      this.#renderer.logo = await this.constructor.#getFileData(this.#logoFileInput.files[0]);
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #smallLogoInput;
  /** @param { HTMLInputElement } input */
  set smallLogoInput(input) {
    this.#smallLogoInput = input;
    this.#smallLogoInput.value = this.#renderer.smallLogo;
    this.#smallLogoInput.addEventListener("change", this, false);
  }
  onSmallLogoInputChange() {
    switch (this.#smallLogoInput.value) {
      case "upload":
        this.#smallLogoFileInput.removeAttribute("disabled");
        break;
      default:
        this.#smallLogoFileInput.setAttribute("disabled", "disabled");
        this.#renderer.smallLogo = this.#smallLogoInput.value;
        this.#generateCardBack();
        break;
    }
  }

  /** @type { HTMLInputElement } */ #smallLogoFileInput;
  /** @param { HTMLInputElement } input */
  set smallLogoFileInput(input) {
    this.#smallLogoFileInput = input;
    this.#smallLogoFileInput.setAttribute("accept", "image/*");
    this.#smallLogoFileInput.setAttribute("disabled", "disabled");
    this.#smallLogoFileInput.addEventListener("change", this, false);
  }
  async onSmallLogoFileInputChange() {
    if (this.#smallLogoFileInput.files[0]) {
      this.#renderer.smallLogo = await this.constructor.#getFileData(this.#smallLogoFileInput.files[0]);
      this.#generateCardBack();
    }
  }

  /** @type { HTMLInputElement } */ #showPunchSlotInput;
  /** @param { HTMLInputElement } input */
  set showPunchSlotInput(input) {
    this.#showPunchSlotInput = input;
    this.#showPunchSlotInput.addEventListener("change", this, false);
  }
  onShowPunchSlotInputChange() {
    if (this.#renderer.showPunchSlot) { this.#renderer.showPunchSlot = false; }
    else { this.#renderer.showPunchSlot = true; }
    this.#generateCard();
  }

  /** @type { HTMLInputElement } */ #additionalElementsInput;
  /** @param {HTMLInputElement } input */
  set additionalElementsInput(input) {
    this.#additionalElementsInput = input;
    this.#additionalElementsInput.setAttribute("cols", 37);
    this.#additionalElementsInput.setAttribute("rows", 4);
    this.#additionalElementsInput.setAttribute("wrap", "off");
    this.#additionalElementsInput.value = this.#renderer.additionalElements;
    this.#additionalElementsInput.setAttribute("placeholder", this.#renderer.additionalElements);
    this.#additionalElementsInput.addEventListener("input", this, false);
    this.#additionalElementsInput.addEventListener("change", this, false);
  }
  onAdditionalElementsInputChange() {
    if (this.#renderer.additionalElements !== this.#additionalElementsInput.value) {
      this.#renderer.additionalElements = this.#additionalElementsInput.value;
      this.#generateCardBack();
    }
  }

  /** @type { HTMLInputElement } */ #badgeTypeInput;
  /** @param { HTMLInputElement } input */
  set badgeTypeInput(input) {
    this.#badgeTypeInput = input;
    this.#badgeTypeInput.value = this.#renderer.badgeType;
    this.#badgeTypeInput.setAttribute("placeholder", this.#renderer.badgeType);
    this.#badgeTypeInput.addEventListener("input", this, false);
    this.#badgeTypeInput.addEventListener("change", this, false);
  }
  onBadgeTypeInputChange() {
    if (this.#renderer.badgeType !== this.#badgeTypeInput.value) {
      this.#renderer.badgeType = this.#badgeTypeInput.value;
      this.#generateCardFront();
    }
  }

  /** @type { HTMLInputElement } */ #badgeSubtypeInput;
  /** @param { HTMLInputElement } input */
  set badgeSubtypeInput(input) {
    this.#badgeSubtypeInput = input;
    this.#badgeSubtypeInput.value = this.#renderer.badgeSubtype;
    this.#badgeSubtypeInput.setAttribute("placeholder", this.#renderer.badgeSubtype);
    this.#badgeSubtypeInput.addEventListener("input", this, false);
    this.#badgeSubtypeInput.addEventListener("change", this, false);
  }
  onBadgeSubtypeInputChange() {
    if (this.#renderer.badgeSubtype !== this.#badgeSubtypeInput.value) {
      this.#renderer.badgeSubtype = this.#badgeSubtypeInput.value;
      this.#generateCardFront();
    }
  }

  /** @type { HTMLInputElement } */ #nameHeaderInput;
  /** @param { HTMLInputElement } input */
  set nameHeaderInput(input) {
    this.#nameHeaderInput = input;
    this.#nameHeaderInput.value = this.#renderer.nameHeader[0];
    this.#nameHeaderInput.setAttribute("placeholder", this.#renderer.nameHeader[0]);
    this.#nameHeaderInput.addEventListener("input", this, false);
    this.#nameHeaderInput.addEventListener("change", this, false);
  }
  onNameHeaderInputChange() {
    if (this.#renderer.nameHeader[0] !== this.#nameHeaderInput.value) {
      this.#renderer.nameHeader[0] = this.#nameHeaderInput.value;
      this.#generateCardFront();
    }
  }

  /** @type { HTMLInputElement } */ #nameHeaderI18n1Input;
  /** @param { HTMLInputElement } input */
  set nameHeaderI18n1Input(input) {
    this.#nameHeaderI18n1Input = input;
    this.#nameHeaderI18n1Input.value = this.#renderer.nameHeader[1];
    this.#nameHeaderI18n1Input.setAttribute("placeholder", this.#renderer.nameHeader[1]);
    this.#nameHeaderI18n1Input.addEventListener("input", this, false);
    this.#nameHeaderI18n1Input.addEventListener("change", this, false);
  }
  onNameHeaderI18n1InputChange() {
    if (this.#renderer.nameHeader[1] !== this.#nameHeaderI18n1Input.value) {
      this.#renderer.nameHeader[1] = this.#nameHeaderI18n1Input.value;
      this.#generateCardFront();
    }
  }

  /** @type { HTMLInputElement } */ #nameHeaderI18n2Input;
  /** @param { HTMLInputElement } input */
  set nameHeaderI18n2Input(input) {
    this.#nameHeaderI18n2Input = input;
    this.#nameHeaderI18n2Input.value = this.#renderer.nameHeader[2];
    this.#nameHeaderI18n2Input.setAttribute("placeholder", this.#renderer.nameHeader[2]);
    this.#nameHeaderI18n2Input.addEventListener("input", this, false);
    this.#nameHeaderI18n2Input.addEventListener("change", this, false);
  }
  onNameHeaderI18n2InputChange() {
    if (this.#renderer.nameHeader[2] !== this.#nameHeaderI18n2Input.value) {
      this.#renderer.nameHeader[2] = this.#nameHeaderI18n2Input.value;
      this.#generateCardFront();
    }
  }

  /** @type { HTMLInputElement } */ #employerHeaderInput;
  /** @param { HTMLInputElement } input */
  set employerHeaderInput(input) {
    this.#employerHeaderInput = input;
    this.#employerHeaderInput.value = this.#renderer.employerHeader[0];
    this.#employerHeaderInput.setAttribute("placeholder", this.#renderer.employerHeader[0]);
    this.#employerHeaderInput.addEventListener("input", this, false);
    this.#employerHeaderInput.addEventListener("change", this, false);
  }
  onEmployerHeaderInputChange() {
    if (this.#renderer.employerHeader[0] !== this.#employerHeaderInput.value) {
      this.#renderer.employerHeader[0] = this.#employerHeaderInput.value;
      this.#generateCardFront();
    }
  }

  /** @type { HTMLInputElement } */ #employerHeaderI18n1Input;
  /** @param { HTMLInputElement } input */
  set employerHeaderI18n1Input(input) {
    this.#employerHeaderI18n1Input = input;
    this.#employerHeaderI18n1Input.value = this.#renderer.employerHeader[1];
    this.#employerHeaderI18n1Input.setAttribute("placeholder", this.#renderer.employerHeader[1]);
    this.#employerHeaderI18n1Input.addEventListener("input", this, false);
    this.#employerHeaderI18n1Input.addEventListener("change", this, false);
  }
  onEmployerHeaderI18n1InputChange() {
    if (this.#renderer.employerHeader[1] !== this.#employerHeaderI18n1Input.value) {
      this.#renderer.employerHeader[1] = this.#employerHeaderI18n1Input.value;
      this.#generateCardFront();
    }
  }

  /** @type { HTMLInputElement } */ #employerHeaderI18n2Input;
  /** @param { HTMLInputElement } input */
  set employerHeaderI18n2Input(input) {
    this.#employerHeaderI18n2Input = input;
    this.#employerHeaderI18n2Input.value = this.#renderer.employerHeader[2];
    this.#employerHeaderI18n2Input.setAttribute("placeholder", this.#renderer.employerHeader[2]);
    this.#employerHeaderI18n2Input.addEventListener("input", this, false);
    this.#employerHeaderI18n2Input.addEventListener("change", this, false);
  }
  onEmployerHeaderI18n2InputChange() {
    if (this.#renderer.employerHeader[2] !== this.#employerHeaderI18n2Input.value) {
      this.#renderer.employerHeader[2] = this.#employerHeaderI18n2Input.value;
      this.#generateCardFront();
    }
  }

  /** @type { HTMLInputElement } */ #numberHeaderInput;
  /** @param { HTMLInputElement } input */
  set numberHeaderInput(input) {
    this.#numberHeaderInput = input;
    this.#numberHeaderInput.value = this.#renderer.numberHeader[0];
    this.#numberHeaderInput.setAttribute("placeholder", this.#renderer.numberHeader[0]);
    this.#numberHeaderInput.addEventListener("input", this, false);
    this.#numberHeaderInput.addEventListener("change", this, false);
  }
  onNumberHeaderInputChange() {
    if (this.#renderer.numberHeader[0] !== this.#numberHeaderInput.value) {
      this.#renderer.numberHeader[0] = this.#numberHeaderInput.value;
      this.#generateCardFront();
    }
  }

  /** @type { HTMLInputElement } */ #numberHeaderI18n1Input;
  /** @param { HTMLInputElement } input */
  set numberHeaderI18n1Input(input) {
    this.#numberHeaderI18n1Input = input;
    this.#numberHeaderI18n1Input.value = this.#renderer.numberHeader[1];
    this.#numberHeaderI18n1Input.setAttribute("placeholder", this.#renderer.numberHeader[1]);
    this.#numberHeaderI18n1Input.addEventListener("input", this, false);
    this.#numberHeaderI18n1Input.addEventListener("change", this, false);
  }
  onNumberHeaderI18n1InputChange() {
    if (this.#renderer.numberHeader[1] !== this.#numberHeaderI18n1Input.value) {
      this.#renderer.numberHeader[1] = this.#numberHeaderI18n1Input.value;
      this.#generateCardFront();
    }
  }

  /** @type { HTMLInputElement } */ #numberHeaderI18n2Input;
  /** @param { HTMLInputElement } input */
  set numberHeaderI18n2Input(input) {
    this.#numberHeaderI18n2Input = input;
    this.#numberHeaderI18n2Input.value = this.#renderer.numberHeader[2];
    this.#numberHeaderI18n2Input.setAttribute("placeholder", this.#renderer.numberHeader[2]);
    this.#numberHeaderI18n2Input.addEventListener("input", this, false);
    this.#numberHeaderI18n2Input.addEventListener("change", this, false);
  }
  onNumberHeaderI18n2InputChange() {
    if (this.#renderer.numberHeader[2] !== this.#numberHeaderI18n2Input.value) {
      this.#renderer.numberHeader[2] = this.#numberHeaderI18n2Input.value;
      this.#generateCardFront();
    }
  }

  /** @type { HTMLInputElement } */ #dateOfExpirationHeaderInput;
  /** @param { HTMLInputElement } input */
  set dateOfExpirationHeaderInput(input) {
    this.#dateOfExpirationHeaderInput = input;
    this.#dateOfExpirationHeaderInput.value = this.#renderer.dateOfExpirationHeader[0];
    this.#dateOfExpirationHeaderInput.setAttribute("placeholder", this.#renderer.dateOfExpirationHeader[0]);
    this.#dateOfExpirationHeaderInput.addEventListener("input", this, false);
    this.#dateOfExpirationHeaderInput.addEventListener("change", this, false);
  }
  onDateOfExpirationHeaderInputChange() {
    if (this.#renderer.dateOfExpirationHeader[0] !== this.#dateOfExpirationHeaderInput.value) {
      this.#renderer.dateOfExpirationHeader[0] = this.#dateOfExpirationHeaderInput.value;
      this.#generateCardFront();
    }
  }

  /** @type { HTMLInputElement } */ #dateOfExpirationHeaderI18n1Input;
  /** @param { HTMLInputElement } input */
  set dateOfExpirationHeaderI18n1Input(input) {
    this.#dateOfExpirationHeaderI18n1Input = input;
    this.#dateOfExpirationHeaderI18n1Input.value = this.#renderer.dateOfExpirationHeader[1];
    this.#dateOfExpirationHeaderI18n1Input.setAttribute("placeholder", this.#renderer.dateOfExpirationHeader[1]);
    this.#dateOfExpirationHeaderI18n1Input.addEventListener("input", this, false);
    this.#dateOfExpirationHeaderI18n1Input.addEventListener("change", this, false);
  }
  onDateOfExpirationHeaderI18n1InputChange() {
    if (this.#renderer.dateOfExpirationHeader[1] !== this.#dateOfExpirationHeaderI18n1Input.value) {
      this.#renderer.dateOfExpirationHeader[1] = this.#dateOfExpirationHeaderI18n1Input.value;
      this.#generateCardFront();
    }
  }

  /** @type { HTMLInputElement } */ #dateOfExpirationHeaderI18n2Input;
  /** @param { HTMLInputElement } input */
  set dateOfExpirationHeaderI18n2Input(input) {
    this.#dateOfExpirationHeaderI18n2Input = input;
    this.#dateOfExpirationHeaderI18n2Input.value = this.#renderer.dateOfExpirationHeader[2];
    this.#dateOfExpirationHeaderI18n2Input.setAttribute("placeholder", this.#renderer.dateOfExpirationHeader[2]);
    this.#dateOfExpirationHeaderI18n2Input.addEventListener("input", this, false);
    this.#dateOfExpirationHeaderI18n2Input.addEventListener("change", this, false);
  }
  onDateOfExpirationHeaderI18n2InputChange() {
    if (this.#renderer.dateOfExpirationHeader[2] !== this.#dateOfExpirationHeaderI18n2Input.value) {
      this.#renderer.dateOfExpirationHeader[2] = this.#dateOfExpirationHeaderI18n2Input.value;
      this.#generateCardFront();
    }
  }

  /** @type { HTMLInputElement } */ #additionalElementsHeaderInput;
  /** @param { HTMLInputElement } input */
  set additionalElementsHeaderInput(input) {
    this.#additionalElementsHeaderInput = input;
    this.#additionalElementsHeaderInput.value = this.#renderer.additionalElementsHeader[0];
    this.#additionalElementsHeaderInput.setAttribute("placeholder", this.#renderer.additionalElementsHeader[0]);
    this.#additionalElementsHeaderInput.addEventListener("input", this, false);
    this.#additionalElementsHeaderInput.addEventListener("change", this, false);
  }
  onAdditionalElementsHeaderInputChange() {
    if (this.#renderer.additionalElementsHeader[0] !== this.#additionalElementsHeaderInput.value) {
      this.#renderer.additionalElementsHeader[0] = this.#additionalElementsHeaderInput.value;
      this.#generateCardBack();
    }
  }

  /** @type { HTMLInputElement } */ #additionalElementsHeaderI18n1Input;
  /** @param { HTMLInputElement } input */
  set additionalElementsHeaderI18n1Input(input) {
    this.#additionalElementsHeaderI18n1Input = input;
    this.#additionalElementsHeaderI18n1Input.value = this.#renderer.additionalElementsHeader[1];
    this.#additionalElementsHeaderI18n1Input.setAttribute("placeholder", this.#renderer.additionalElementsHeader[1]);
    this.#additionalElementsHeaderI18n1Input.addEventListener("input", this, false);
    this.#additionalElementsHeaderI18n1Input.addEventListener("change", this, false);
  }
  onAdditionalElementsHeaderI18n1InputChange() {
    if (this.#renderer.additionalElementsHeader[1] !== this.#additionalElementsHeaderI18n1Input.value) {
      this.#renderer.additionalElementsHeader[1] = this.#additionalElementsHeaderI18n1Input.value;
      this.#generateCardBack();
    }
  }

  /** @type { HTMLInputElement } */ #additionalElementsHeaderI18n2Input;
  /** @param { HTMLInputElement } input */
  set additionalElementsHeaderI18n2Input(input) {
    this.#additionalElementsHeaderI18n2Input = input;
    this.#additionalElementsHeaderI18n2Input.value = this.#renderer.additionalElementsHeader[2];
    this.#additionalElementsHeaderI18n2Input.setAttribute("placeholder", this.#renderer.additionalElementsHeader[2]);
    this.#additionalElementsHeaderI18n2Input.addEventListener("input", this, false);
    this.#additionalElementsHeaderI18n2Input.addEventListener("change", this, false);
  }
  onAdditionalElementsHeaderI18n2InputChange() {
    if (this.#renderer.additionalElementsHeader[2] !== this.#additionalElementsHeaderI18n2Input.value) {
      this.#renderer.additionalElementsHeader[2] = this.#additionalElementsHeaderI18n2Input.value;
      this.#generateCardBack();
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
    this.cardBackElement = this.#document.getElementById("cardBack");
    this.#frontFallback = this.#document.getElementById("offscreen-front");
    this.#backFallback = this.#document.getElementById("offscreen-back");
    await this.#generateCard();
    const inputFields = [
      "typeCode",
      "authorityCode",
      "number",
      "dateOfExpiration",
      "fullName",
      "employer",
      "url",
      "mrzInQRCode",
      "optionalData",
      "picture",
      "headerColor",
      "textColor",
      "mrzColor",
      "frontBackgroundColor",
      "backBackgroundColor",
      "mrzBackgroundColor",
      "numberUnderlayColor",
      "numberUnderlayAlpha",
      "logoUnderlayColor",
      "logoUnderlayAlpha",
      "frontBackgroundImage",
      "frontBackgroundImageFile",
      "backBackgroundImage",
      "backBackgroundImageFile",
      "mrzBackgroundImage",
      "mrzBackgroundImageFile",
      "logo",
      "logoFile",
      "smallLogo",
      "smallLogoFile",
      "showPunchSlot",
      "additionalElements",
      "badgeType",
      "badgeSubtype",
      "nameHeader",
      "nameHeaderI18n1",
      "nameHeaderI18n2",
      "employerHeader",
      "employerHeaderI18n1",
      "employerHeaderI18n2",
      "numberHeader",
      "numberHeaderI18n1",
      "numberHeaderI18n2",
      "dateOfExpirationHeader",
      "dateOfExpirationHeaderI18n1",
      "dateOfExpirationHeaderI18n2",
      "additionalElementsHeader",
      "additionalElementsHeaderI18n1",
      "additionalElementsHeaderI18n2",
      "showGuides"
    ];
    for (const elementID of inputFields) {
      this[`${elementID}Input`] = this.#document.getElementById(elementID);
    }
  }

  // Private methods
  async #generateCardFront() {
    const canvas = await this.#renderer.generateCardFront(this.#model, this.#frontFallback);
    this.#cardFrontElement.width = IDBadgeRenderer.cutCardArea[0];
    this.#cardFrontElement.height = IDBadgeRenderer.cutCardArea[1];
    const ctx = this.#cardFrontElement.getContext("2d");
    ctx.drawImage(
      canvas, 16, 16, this.#cardFrontElement.width, this.#cardFrontElement.height,
      0, 0, this.#cardFrontElement.width, this.#cardFrontElement.height
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
      `${this.#model.typeCodeVIZ}${this.#model.authorityCodeVIZ}` +
      `${this.#model.numberVIZ}-front.png`
    );
    downloadFront.setAttribute("href", this.#frontBlobURL);
  }

  async #generateCardBack() {
    const canvas = await this.#renderer.generateCardBack(this.#model, this.#backFallback);
    this.#cardBackElement.width = IDBadgeRenderer.cutCardArea[0];
    this.#cardBackElement.height = IDBadgeRenderer.cutCardArea[1];
    const ctx = this.#cardBackElement.getContext("2d");
    ctx.drawImage(
      canvas, 16, 16, this.#cardBackElement.width, this.#cardBackElement.height,
      0, 0, this.#cardBackElement.width, this.#cardBackElement.height
    );
    const downloadBack = this.#document.getElementById("downloadBack");
    let blob;
    if (typeof OffscreenCanvas === "undefined") {
      blob = await new Promise(resolve => canvas.toBlob(resolve));
    }
    else { blob = await canvas.convertToBlob(); }
    if (this.#backBlobURL !== null) { URL.revokeObjectURL(this.#backBlobURL); }
    this.#backBlobURL = URL.createObjectURL(blob);
    downloadBack.setAttribute(
      "download",
      `${this.#model.typeCodeVIZ}${this.#model.authorityCodeVIZ}` +
      `${this.#model.numberVIZ}-back.png`
    );
    downloadBack.setAttribute("href", this.#backBlobURL);
  }

  async #generateCard() {
    await Promise.all([
      this.#generateCardFront(),
      this.#generateCardBack()
    ]);
  }

  // Static private methods
  static #getFileData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener(
        "load",
        (e) => { resolve(e.target.result); },
        false
      );
      reader.readAsDataURL(file);
    });
  }
}

export { IDBadgeViewModel }