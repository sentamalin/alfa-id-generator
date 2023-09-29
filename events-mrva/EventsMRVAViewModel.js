/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { EventsMRVA } from "/modules/EventsMRVA.js";
import { EventsMRVARenderer } from "./EventsMRVARenderer.js";

class EventsMRVAViewModel {
  #model = new EventsMRVA({
    typeCode: "V",
    authorityCode: "XAF",
    placeOfIssue: "Utopiopolis, UTO",
    validFrom: "2023-09-12",
    validThru: "2024-09-12",
    numberOfEntries: "Multiple",
    number: "960241263",
    type: "Silver Sponsor—Adult",
    additionalInfo: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    fullName: "Millefeuille, Alfalfa",
    passportNumber: "362142069",
    usePassportInMRZ: true,
    nationalityCode: "UTO",
    dateOfBirth: "1998-04-17",
    genderMarker: "F",
    optionalData: "",
    picture: "/photos/fox.jpg",
    signature: "/signatures/alfa-census.svg",
    url: "https://airlinefurries.com/",
    identifier: "XFSS",
    certReference: "00000",
    issueDate: "2023-09-01",
    sealSignatureDate: "2023-09-01",
    durationOfStay: [4, 0, 0],
    visaTypeCode: "1"
  });

  #renderer = new EventsMRVARenderer({
    headerColor: "#4090ba",
    textColor: "#000000",
    mrzColor: "#000000",
    frontBackgroundColor: "#efefef",
    frontBackgroundImage: "/cardBackgrounds/passport-mrva-lofiGrey.png",
    mrzBackgroundColor: "#ffffff",
    mrzBackgroundImage: null,
    logoUnderlayColor: "#4090ba",
    logoUnderlayAlpha: 255,
    logo: "/smallLogos/alfa.svg",
    showGuides: false,
    useDigitalSeal: false,
    fullAuthority: "AIR LINE FURRIES ASSOCIATION, INTERNATIONAL",
    fullDocumentName: "FURRY EVENTS ENTRY VISA",
    placeOfIssueHeader: [
      "PLACE OF ISSUE",
      "LIEU DE DÉLIVRANCE",
      "LUGAR DE EMISIÓN"
    ],
    validFromHeader: [
      "VALID FROM",
      "VALABLE À PARTIR DU",
      "VÁLIDO DESDE EL"
    ],
    validThruHeader: [
      "VALID THRU",
      "VALABLE JUSQU'AU",
      "VÁLIDO HASTA"
    ],
    numberOfEntriesHeader: [
      "NUMBER OF ENTRIES",
      "NOMBRE D'ENTRÉES",
      "NÚMERO DE ENTRADAS"
    ],
    numberHeader: [
      "DOCUMENT NO",
      "NO DU DOCUMENT",
      "NO DEL DOCUMENTO"
    ],
    typeHeader: [
      "TYPE",
      "TYPE",
      "TIPO"
    ],
    additionalInfoHeader: [
      "ADDITIONAL INFORMATION",
      "INFORMATIONS COMPLÉMENTAIRES",
      "INFORMACIÓN ADICIONAL"
    ],
    nameHeader: [
      "NAME",
      "NOM",
      "APELLIDOS"
    ],
    passportNumberHeader: [
      "PASSPORT NO",
      "NO DE PASSEPORT",
      "NO DE PASAPORTE"
    ],
    nationalityHeader: [
      "NATIONALITY",
      "NATIONALITÉ",
      "NACIONALIDAD"
    ],
    dateOfBirthHeader: [
      "DATE OF BIRTH",
      "DATE DE NAISSANCE",
      "FECHA DE NACIMIENTO"
    ],
    genderHeader: [
      "GENDER",
      "GENRE",
      "GENÉRO"
    ],
  });

  #inputTimeout = null;
  #frontFallback;
  #signatureFallback;
  #signatureGenerator = null;
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

  /** @type { HTMLInputElement } */ #placeOfIssueInput;
  /** @param { HTMLInputElement } input */
  set placeOfIssueInput(input) {
    this.#placeOfIssueInput = input;
    this.#placeOfIssueInput.value = this.#model.placeOfIssue;
    this.#placeOfIssueInput.setAttribute("placeholder", this.#model.placeOfIssue);
    this.#placeOfIssueInput.addEventListener("input", this, false);
    this.#placeOfIssueInput.addEventListener("change", this, false);
  }
  onPlaceOfIssueInputChange() {
    if (this.#model.placeOfIssue !== this.#placeOfIssueInput.value) {
      this.#model.placeOfIssue = this.#placeOfIssueInput.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #validFromInput;
  /** @param { HTMLInputElement } input */
  set validFromInput(input) {
    this.#validFromInput = input;
    this.#validFromInput.value = this.#model.validFrom;
    this.#validFromInput.addEventListener("change", this, false);
  }
  onValidFromInputChange() {
    this.#model.validFrom = this.#validFromInput.value;
    this.#generateCard();
  }

  /** @type { HTMLInputElement } */ #validThruInput;
  /** @param { HTMLInputElement } input */
  set validThruInput(input) {
    this.#validThruInput = input;
    this.#validThruInput.value = this.#model.validThru;
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

  /** @type { HTMLInputElement } */ #typeInput;
  /** @param { HTMLInputElement } input */
  set typeInput(input) {
    this.#typeInput = input;
    this.#typeInput.value = this.#model.type;
    this.#typeInput.setAttribute("placeholder", this.#model.type);
    this.#typeInput.addEventListener("input", this, false);
    this.#typeInput.addEventListener("change", this, false);
  }
  onTypeInputChange() {
    if (this.#model.type !== this.#typeInput.value) {
      this.#model.type = this.#typeInput.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #additionalInfoInput;
  /** @param { HTMLInputElement } input */
  set additionalInfoInput(input) {
    this.#additionalInfoInput = input;
    this.#additionalInfoInput.value = this.#model.additionalInfo;
    this.#additionalInfoInput.setAttribute("placeholder", this.#model.additionalInfo);
    this.#additionalInfoInput.addEventListener("input", this, false);
    this.#additionalInfoInput.addEventListener("change", this, false);
  }
  onAdditionalInfoInputChange() {
    if (this.#model.additionalInfo !== this.#additionalInfoInput.value) {
      this.#model.additionalInfo = this.#additionalInfoInput.value;
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

  /** @type { HTMLInputElement } */ #usePassportInMRZInput;
  /** @param { HTMLInputElement } input */
  set usePassportInMRZInput(input) {
    this.#usePassportInMRZInput = input;
    this.#usePassportInMRZInput.addEventListener("change", this, false);
  }
  onUsePassportInMRZInputChange() {
    if (this.#model.usePassportInMRZ) { this.#model.usePassportInMRZ = false; }
    else { this.#model.usePassportInMRZ = true; }
    this.#generateCard();
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
    this.#dateOfBirthInput.value = this.#model.dateOfBirth;
    this.#dateOfBirthInput.addEventListener("change", this, false);
  }
  onDateOfBirthInputChange() {
    this.#model.dateOfBirth = this.#dateOfBirthInput.value;
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
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #issueDateInput;
  /** @param { HTMLInputElement } input */
  set issueDateInput(input) {
    this.#issueDateInput = input;
    this.#issueDateInput.value = this.#model.issueDate;
    this.#issueDateInput.addEventListener("change", this, false);
    this.#issueDateInput.setAttribute("disabled", "disabled");
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
    this.#identifierInput.value = this.#model.identifier;
    this.#identifierInput.setAttribute("placeholder", this.#model.identifier);
    this.#identifierInput.addEventListener("input", this, false);
    this.#identifierInput.addEventListener("change", this, false);
    this.#identifierInput.setAttribute("disabled", "disabled");
  }
  onIdentifierInputChange() {
    if (this.#identifierInput.checkValidity() &&
    this.#model.identifier !== this.#identifierInput.value) {
      this.#model.identifier = this.#identifierInput.value;
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
    this.#certReferenceInput.setAttribute("disabled", "disabled");
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
    this.#sealSignatureDateInput.value = this.#model.sealSignatureDate;
    this.#sealSignatureDateInput.addEventListener("change", this, false);
    this.#sealSignatureDateInput.setAttribute("disabled", "disabled");
  }
  onSealSignatureDateInputChange() {
    this.#model.sealSignatureDate = this.#sealSignatureDateInput.value;
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
    this.#dayDurationInput.setAttribute("disabled", "disabled");
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
    this.#monthDurationInput.setAttribute("disabled", "disabled");
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
    this.#yearDurationInput.setAttribute("disabled", "disabled");
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
    this.#visaTypeCodeInput.setAttribute("disabled", "disabled");
  }
  onVisaTypeCodeInputChange() {
    if (this.#visaTypeCodeInput.checkValidity() &&
    this.#model.visaTypeCode !== this.#visaTypeCodeInput.value) {
      this.#model.visaTypeCode = this.#visaTypeCodeInput.value;
      this.#generateCard();
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
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #signatureInput;
  /** @param { HTMLInputElement } input */
  set signatureInput(input) {
    this.#signatureInput = input;
    this.#signatureInput.addEventListener("change", this, false);
  }
  onSignatureInputChange() {
    switch (this.#signatureInput.value) {
      case "upload":
        this.#signatureFileInput.removeAttribute("disabled");
        this.#signatureTextInput.setAttribute("disabled", "disabled");
        break;
      case "text":
        this.#signatureFileInput.setAttribute("disabled", "disabled");
        this.#signatureTextInput.removeAttribute("disabled");
        break;
      default:
        this.#signatureFileInput.setAttribute("disabled", "disabled");
        this.#signatureTextInput.setAttribute("disabled", "disabled");
        break;
    }
  }

  /** @type { HTMLInputElement } */ #signatureFileInput;
  /** @param { HTMLInputElement } input */
  set signatureFileInput(input) {
    this.#signatureFileInput = input;
    this.#signatureFileInput.setAttribute("accept", "image/*");
    this.#signatureFileInput.addEventListener("change", this, false);
  }
  async onSignatureFileInputChange() {
    if (this.#signatureFileInput.files[0]) {
      this.#model.signature = await this.constructor.#getFileData(this.#signatureFileInput.files[0]);
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #signatureTextInput;
  /** @param { HTMLInputElement } input */
  set signatureTextInput(input) {
    this.#signatureTextInput = input;
    this.#signatureTextInput.setAttribute("disabled", "disabled");
    this.#signatureTextInput.addEventListener("input", this, false);
    this.#signatureTextInput.addEventListener("change", this, false);
  }
  onSignatureTextInputChange() {
    if (this.#signatureGenerator === null) {
      this.#signatureGenerator = this.#renderer.generateNewSignatureFromText(
        this.#signatureFallback
      );
    }
    this.#signatureGenerator.next();
    const signature = this.#signatureGenerator.next(
      this.#signatureTextInput.value
    );
    if (signature.value.newSignature) {
      this.#model.signature = signature.value.signature;
      this.#generateCard();
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
      this.#renderer.frontBackgroundImage = await this.constructor.#getFileData(this.#frontBackgroundImageFileInput.files[0]);
      this.#generateCard();
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
    this.#generateCard();
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
        this.#generateCard();
        break;
      case "upload":
        this.#mrzBackgroundImageFileInput.removeAttribute("disabled");
        break;
      default:
        this.#mrzBackgroundImageFileInput.setAttribute("disabled", "disabled");
        this.#renderer.mrzBackgroundImage = this.#mrzBackgroundImageInput.value;
        this.#generateCard();
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
      this.#generateCard();
    }
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

  /** @type { HTMLInputElement } */ #placeOfIssueHeaderInput;
  /** @param { HTMLInputElement } input */
  set placeOfIssueHeaderInput(input) {
    this.#placeOfIssueHeaderInput = input;
    this.#placeOfIssueHeaderInput.value = this.#renderer.placeOfIssueHeader[0];
    this.#placeOfIssueHeaderInput.setAttribute("placeholder", this.#renderer.placeOfIssueHeader[0]);
    this.#placeOfIssueHeaderInput.addEventListener("input", this, false);
    this.#placeOfIssueHeaderInput.addEventListener("change", this, false);
  }
  onPlaceOfIssueHeaderInputChange() {
    if (this.#renderer.placeOfIssueHeader[0] !== this.#placeOfIssueHeaderInput.value) {
      this.#renderer.placeOfIssueHeader[0] = this.#placeOfIssueHeaderInput.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #placeOfIssueHeaderI18n1Input;
  /** @param { HTMLInputElement } input */
  set placeOfIssueHeaderI18n1Input(input) {
    this.#placeOfIssueHeaderI18n1Input = input;
    this.#placeOfIssueHeaderI18n1Input.value = this.#renderer.placeOfIssueHeader[1];
    this.#placeOfIssueHeaderI18n1Input.setAttribute("placeholder", this.#renderer.placeOfIssueHeader[1]);
    this.#placeOfIssueHeaderI18n1Input.addEventListener("input", this, false);
    this.#placeOfIssueHeaderI18n1Input.addEventListener("change", this, false);
  }
  onPlaceOfIssueHeaderI18n1InputChange() {
    if (this.#renderer.placeOfIssueHeader[1] !== this.#placeOfIssueHeaderI18n1Input.value) {
      this.#renderer.placeOfIssueHeader[1] = this.#placeOfIssueHeaderI18n1Input.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #placeOfIssueHeaderI18n2Input;
  /** @param { HTMLInputElement } input */
  set placeOfIssueHeaderI18n2Input(input) {
    this.#placeOfIssueHeaderI18n2Input = input;
    this.#placeOfIssueHeaderI18n2Input.value = this.#renderer.placeOfIssueHeader[2];
    this.#placeOfIssueHeaderI18n2Input.setAttribute("placeholder", this.#renderer.placeOfIssueHeader[2]);
    this.#placeOfIssueHeaderI18n2Input.addEventListener("input", this, false);
    this.#placeOfIssueHeaderI18n2Input.addEventListener("change", this, false);
  }
  onPlaceOfIssueHeaderI18n2InputChange() {
    if (this.#renderer.placeOfIssueHeader[2] !== this.#placeOfIssueHeaderI18n2Input.value) {
      this.#renderer.placeOfIssueHeader[2] = this.#placeOfIssueHeaderI18n2Input.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #validFromHeaderInput;
  /** @param { HTMLInputElement } input */
  set validFromHeaderInput(input) {
    this.#validFromHeaderInput = input;
    this.#validFromHeaderInput.value = this.#renderer.validFromHeader[0];
    this.#validFromHeaderInput.setAttribute("placeholder", this.#renderer.validFromHeader[0]);
    this.#validFromHeaderInput.addEventListener("input", this, false);
    this.#validFromHeaderInput.addEventListener("change", this, false);
  }
  onValidFromHeaderInputChange() {
    if (this.#renderer.validFromHeader[0] !== this.#validFromHeaderInput.value) {
      this.#renderer.validFromHeader[0] = this.#validFromHeaderInput.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #validFromHeaderI18n1Input;
  /** @param { HTMLInputElement } input */
  set validFromHeaderI18n1Input(input) {
    this.#validFromHeaderI18n1Input = input;
    this.#validFromHeaderI18n1Input.value = this.#renderer.validFromHeader[1];
    this.#validFromHeaderI18n1Input.setAttribute("placeholder", this.#renderer.validFromHeader[1]);
    this.#validFromHeaderI18n1Input.addEventListener("input", this, false);
    this.#validFromHeaderI18n1Input.addEventListener("change", this, false);
  }
  onValidFromHeaderI18n1InputChange() {
    if (this.#renderer.validFromHeader[1] !== this.#validFromHeaderI18n1Input.value) {
      this.#renderer.validFromHeader[1] = this.#validFromHeaderI18n1Input.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #validFromHeaderI18n2Input;
  /** @param { HTMLInputElement } input */
  set validFromHeaderI18n2Input(input) {
    this.#validFromHeaderI18n2Input = input;
    this.#validFromHeaderI18n2Input.value = this.#renderer.validFromHeader[2];
    this.#validFromHeaderI18n2Input.setAttribute("placeholder", this.#renderer.validFromHeader[2]);
    this.#validFromHeaderI18n2Input.addEventListener("input", this, false);
    this.#validFromHeaderI18n2Input.addEventListener("change", this, false);
  }
  onValidFromHeaderI18n2InputChange() {
    if (this.#renderer.validFromHeader[2] !== this.#validFromHeaderI18n2Input.value) {
      this.#renderer.validFromHeader[2] = this.#validFromHeaderI18n2Input.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #validThruHeaderInput;
  /** @param { HTMLInputElement } input */
  set validThruHeaderInput(input) {
    this.#validThruHeaderInput = input;
    this.#validThruHeaderInput.value = this.#renderer.validThruHeader[0];
    this.#validThruHeaderInput.setAttribute("placeholder", this.#renderer.validThruHeader[0]);
    this.#validThruHeaderInput.addEventListener("input", this, false);
    this.#validThruHeaderInput.addEventListener("change", this, false);
  }
  onValidThruHeaderInputChange() {
    if (this.#renderer.validThruHeader[0] !== this.#validThruHeaderInput.value) {
      this.#renderer.validThruHeader[0] = this.#validThruHeaderInput.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #validThruHeaderI18n1Input;
  /** @param { HTMLInputElement } input */
  set validThruHeaderI18n1Input(input) {
    this.#validThruHeaderI18n1Input = input;
    this.#validThruHeaderI18n1Input.value = this.#renderer.validThruHeader[1];
    this.#validThruHeaderI18n1Input.setAttribute("placeholder", this.#renderer.validThruHeader[1]);
    this.#validThruHeaderI18n1Input.addEventListener("input", this, false);
    this.#validThruHeaderI18n1Input.addEventListener("change", this, false);
  }
  onValidThruHeaderI18n1InputChange() {
    if (this.#renderer.validThruHeader[1] !== this.#validThruHeaderI18n1Input.value) {
      this.#renderer.validThruHeader[1] = this.#validThruHeaderI18n1Input.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #validThruHeaderI18n2Input;
  /** @param { HTMLInputElement } input */
  set validThruHeaderI18n2Input(input) {
    this.#validThruHeaderI18n2Input = input;
    this.#validThruHeaderI18n2Input.value = this.#renderer.validThruHeader[2];
    this.#validThruHeaderI18n2Input.setAttribute("placeholder", this.#renderer.validThruHeader[2]);
    this.#validThruHeaderI18n2Input.addEventListener("input", this, false);
    this.#validThruHeaderI18n2Input.addEventListener("change", this, false);
  }
  onValidThruHeaderI18n2InputChange() {
    if (this.#renderer.validThruHeader[2] !== this.#validThruHeaderI18n2Input.value) {
      this.#renderer.validThruHeader[2] = this.#validThruHeaderI18n2Input.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #numberOfEntriesHeaderInput;
  /** @param { HTMLInputElement } input */
  set numberOfEntriesHeaderInput(input) {
    this.#numberOfEntriesHeaderInput = input;
    this.#numberOfEntriesHeaderInput.value = this.#renderer.numberOfEntriesHeader[0];
    this.#numberOfEntriesHeaderInput.setAttribute("placeholder", this.#renderer.numberOfEntriesHeader[0]);
    this.#numberOfEntriesHeaderInput.addEventListener("input", this, false);
    this.#numberOfEntriesHeaderInput.addEventListener("change", this, false);
  }
  onNumberOfEntriesHeaderInputChange() {
    if (this.#renderer.numberOfEntriesHeader[0] !== this.#numberOfEntriesHeaderInput.value) {
      this.#renderer.numberOfEntriesHeader[0] = this.#numberOfEntriesHeaderInput.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #numberOfEntriesHeaderI18n1Input;
  /** @param { HTMLInputElement } input */
  set numberOfEntriesHeaderI18n1Input(input) {
    this.#numberOfEntriesHeaderI18n1Input = input;
    this.#numberOfEntriesHeaderI18n1Input.value = this.#renderer.numberOfEntriesHeader[1];
    this.#numberOfEntriesHeaderI18n1Input.setAttribute("placeholder", this.#renderer.numberOfEntriesHeader[1]);
    this.#numberOfEntriesHeaderI18n1Input.addEventListener("input", this, false);
    this.#numberOfEntriesHeaderI18n1Input.addEventListener("change", this, false);
  }
  onNumberOfEntriesHeaderI18n1InputChange() {
    if (this.#renderer.numberOfEntriesHeader[1] !== this.#numberOfEntriesHeaderI18n1Input.value) {
      this.#renderer.numberOfEntriesHeader[1] = this.#numberOfEntriesHeaderI18n1Input.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #numberOfEntriesHeaderI18n2Input;
  /** @param { HTMLInputElement } input */
  set numberOfEntriesHeaderI18n2Input(input) {
    this.#numberOfEntriesHeaderI18n2Input = input;
    this.#numberOfEntriesHeaderI18n2Input.value = this.#renderer.numberOfEntriesHeader[2];
    this.#numberOfEntriesHeaderI18n2Input.setAttribute("placeholder", this.#renderer.numberOfEntriesHeader[2]);
    this.#numberOfEntriesHeaderI18n2Input.addEventListener("input", this, false);
    this.#numberOfEntriesHeaderI18n2Input.addEventListener("change", this, false);
  }
  onNumberOfEntriesHeaderI18n2InputChange() {
    if (this.#renderer.numberOfEntriesHeader[2] !== this.#numberOfEntriesHeaderI18n2Input.value) {
      this.#renderer.numberOfEntriesHeader[2] = this.#numberOfEntriesHeaderI18n2Input.value;
      this.#generateCard();
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
      this.#generateCard();
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
      this.#generateCard();
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
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #typeHeaderInput;
  /** @param { HTMLInputElement } input */
  set typeHeaderInput(input) {
    this.#typeHeaderInput = input;
    this.#typeHeaderInput.value = this.#renderer.typeHeader[0];
    this.#typeHeaderInput.setAttribute("placeholder", this.#renderer.typeHeader[0]);
    this.#typeHeaderInput.addEventListener("input", this, false);
    this.#typeHeaderInput.addEventListener("change", this, false);
  }
  onTypeHeaderInputChange() {
    if (this.#renderer.typeHeader[0] !== this.#typeHeaderInput.value) {
      this.#renderer.typeHeader[0] = this.#typeHeaderInput.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #typeHeaderI18n1Input;
  /** @param { HTMLInputElement } input */
  set typeHeaderI18n1Input(input) {
    this.#typeHeaderI18n1Input = input;
    this.#typeHeaderI18n1Input.value = this.#renderer.typeHeader[1];
    this.#typeHeaderI18n1Input.setAttribute("placeholder", this.#renderer.typeHeader[1]);
    this.#typeHeaderI18n1Input.addEventListener("input", this, false);
    this.#typeHeaderI18n1Input.addEventListener("change", this, false);
  }
  onTypeHeaderI18n1InputChange() {
    if (this.#renderer.typeHeader[1] !== this.#typeHeaderI18n1Input.value) {
      this.#renderer.typeHeader[1] = this.#typeHeaderI18n1Input.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #typeHeaderI18n2Input;
  /** @param { HTMLInputElement } input */
  set typeHeaderI18n2Input(input) {
    this.#typeHeaderI18n2Input = input;
    this.#typeHeaderI18n2Input.value = this.#renderer.typeHeader[2];
    this.#typeHeaderI18n2Input.setAttribute("placeholder", this.#renderer.typeHeader[2]);
    this.#typeHeaderI18n2Input.addEventListener("input", this, false);
    this.#typeHeaderI18n2Input.addEventListener("change", this, false);
  }
  onTypeHeaderI18n2InputChange() {
    if (this.#renderer.typeHeader[2] !== this.#typeHeaderI18n2Input.value) {
      this.#renderer.typeHeader[2] = this.#typeHeaderI18n2Input.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #additionalInfoHeaderInput;
  /** @param { HTMLInputElement } input */
  set additionalInfoHeaderInput(input) {
    this.#additionalInfoHeaderInput = input;
    this.#additionalInfoHeaderInput.value = this.#renderer.additionalInfoHeader[0];
    this.#additionalInfoHeaderInput.setAttribute("placeholder", this.#renderer.additionalInfoHeader[0]);
    this.#additionalInfoHeaderInput.addEventListener("input", this, false);
    this.#additionalInfoHeaderInput.addEventListener("change", this, false);
  }
  onAdditionalInfoHeaderInputChange() {
    if (this.#renderer.additionalInfoHeader[0] !== this.#additionalInfoHeaderInput.value) {
      this.#renderer.additionalInfoHeader[0] = this.#additionalInfoHeaderInput.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #additionalInfoHeaderI18n1Input;
  /** @param { HTMLInputElement } input */
  set additionalInfoHeaderI18n1Input(input) {
    this.#additionalInfoHeaderI18n1Input = input;
    this.#additionalInfoHeaderI18n1Input.value = this.#renderer.additionalInfoHeader[1];
    this.#additionalInfoHeaderI18n1Input.setAttribute("placeholder", this.#renderer.additionalInfoHeader[1]);
    this.#additionalInfoHeaderI18n1Input.addEventListener("input", this, false);
    this.#additionalInfoHeaderI18n1Input.addEventListener("change", this, false);
  }
  onAdditionalInfoHeaderI18n1InputChange() {
    if (this.#renderer.additionalInfoHeader[1] !== this.#additionalInfoHeaderI18n1Input.value) {
      this.#renderer.additionalInfoHeader[1] = this.#additionalInfoHeaderI18n1Input.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #additionalInfoHeaderI18n2Input;
  /** @param { HTMLInputElement } input */
  set additionalInfoHeaderI18n2Input(input) {
    this.#additionalInfoHeaderI18n2Input = input;
    this.#additionalInfoHeaderI18n2Input.value = this.#renderer.additionalInfoHeader[2];
    this.#additionalInfoHeaderI18n2Input.setAttribute("placeholder", this.#renderer.additionalInfoHeader[2]);
    this.#additionalInfoHeaderI18n2Input.addEventListener("input", this, false);
    this.#additionalInfoHeaderI18n2Input.addEventListener("change", this, false);
  }
  onAdditionalInfoHeaderI18n2InputChange() {
    if (this.#renderer.additionalInfoHeader[2] !== this.#additionalInfoHeaderI18n2Input.value) {
      this.#renderer.additionalInfoHeader[2] = this.#additionalInfoHeaderI18n2Input.value;
      this.#generateCard();
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
      this.#generateCard();
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
      this.#generateCard();
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
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #passportNumberHeaderInput;
  /** @param { HTMLInputElement } input */
  set passportNumberHeaderInput(input) {
    this.#passportNumberHeaderInput = input;
    this.#passportNumberHeaderInput.value = this.#renderer.passportNumberHeader[0];
    this.#passportNumberHeaderInput.setAttribute("placeholder", this.#renderer.passportNumberHeader[0]);
    this.#passportNumberHeaderInput.addEventListener("input", this, false);
    this.#passportNumberHeaderInput.addEventListener("change", this, false);
  }
  onPassportNumberHeaderInputChange() {
    if (this.#renderer.passportNumberHeader[0] !== this.#passportNumberHeaderInput.value) {
      this.#renderer.passportNumberHeader[0] = this.#passportNumberHeaderInput.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #passportNumberHeaderI18n1Input;
  /** @param { HTMLInputElement } input */
  set passportNumberHeaderI18n1Input(input) {
    this.#passportNumberHeaderI18n1Input = input;
    this.#passportNumberHeaderI18n1Input.value = this.#renderer.passportNumberHeader[1];
    this.#passportNumberHeaderI18n1Input.setAttribute("placeholder", this.#renderer.passportNumberHeader[1]);
    this.#passportNumberHeaderI18n1Input.addEventListener("input", this, false);
    this.#passportNumberHeaderI18n1Input.addEventListener("change", this, false);
  }
  onPassportNumberHeaderI18n1InputChange() {
    if (this.#renderer.passportNumberHeader[1] !== this.#passportNumberHeaderI18n1Input.value) {
      this.#renderer.passportNumberHeader[1] = this.#passportNumberHeaderI18n1Input.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #passportNumberHeaderI18n2Input;
  /** @param { HTMLInputElement } input */
  set passportNumberHeaderI18n2Input(input) {
    this.#passportNumberHeaderI18n2Input = input;
    this.#passportNumberHeaderI18n2Input.value = this.#renderer.passportNumberHeader[2];
    this.#passportNumberHeaderI18n2Input.setAttribute("placeholder", this.#renderer.passportNumberHeader[2]);
    this.#passportNumberHeaderI18n2Input.addEventListener("input", this, false);
    this.#passportNumberHeaderI18n2Input.addEventListener("change", this, false);
  }
  onPassportNumberHeaderI18n2InputChange() {
    if (this.#renderer.passportNumberHeader[2] !== this.#passportNumberHeaderI18n2Input.value) {
      this.#renderer.passportNumberHeader[2] = this.#passportNumberHeaderI18n2Input.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #nationalityHeaderInput;
  /** @param { HTMLInputElement } input */
  set nationalityHeaderInput(input) {
    this.#nationalityHeaderInput = input;
    this.#nationalityHeaderInput.value = this.#renderer.nationalityHeader[0];
    this.#nationalityHeaderInput.setAttribute("placeholder", this.#renderer.nationalityHeader[0]);
    this.#nationalityHeaderInput.addEventListener("input", this, false);
    this.#nationalityHeaderInput.addEventListener("change", this, false);
  }
  onNationalityHeaderInputChange() {
    if (this.#renderer.nationalityHeader[0] !== this.#nationalityHeaderInput.value) {
      this.#renderer.nationalityHeader[0] = this.#nationalityHeaderInput.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #nationalityHeaderI18n1Input;
  /** @param { HTMLInputElement } input */
  set nationalityHeaderI18n1Input(input) {
    this.#nationalityHeaderI18n1Input = input;
    this.#nationalityHeaderI18n1Input.value = this.#renderer.nationalityHeader[1];
    this.#nationalityHeaderI18n1Input.setAttribute("placeholder", this.#renderer.nationalityHeader[1]);
    this.#nationalityHeaderI18n1Input.addEventListener("input", this, false);
    this.#nationalityHeaderI18n1Input.addEventListener("change", this, false);
  }
  onNationalityHeaderI18n1InputChange() {
    if (this.#renderer.nationalityHeader[1] !== this.#nationalityHeaderI18n1Input.value) {
      this.#renderer.nationalityHeader[1] = this.#nationalityHeaderI18n1Input.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #nationalityHeaderI18n2Input;
  /** @param { HTMLInputElement } input */
  set nationalityHeaderI18n2Input(input) {
    this.#nationalityHeaderI18n2Input = input;
    this.#nationalityHeaderI18n2Input.value = this.#renderer.nationalityHeader[2];
    this.#nationalityHeaderI18n2Input.setAttribute("placeholder", this.#renderer.nationalityHeader[2]);
    this.#nationalityHeaderI18n2Input.addEventListener("input", this, false);
    this.#nationalityHeaderI18n2Input.addEventListener("change", this, false);
  }
  onNationalityHeaderI18n2InputChange() {
    if (this.#renderer.nationalityHeader[2] !== this.#nationalityHeaderI18n2Input.value) {
      this.#renderer.nationalityHeader[2] = this.#nationalityHeaderI18n2Input.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #dateOfBirthHeaderInput;
  /** @param { HTMLInputElement } input */
  set dateOfBirthHeaderInput(input) {
    this.#dateOfBirthHeaderInput = input;
    this.#dateOfBirthHeaderInput.value = this.#renderer.dateOfBirthHeader[0];
    this.#dateOfBirthHeaderInput.setAttribute("placeholder", this.#renderer.dateOfBirthHeader[0]);
    this.#dateOfBirthHeaderInput.addEventListener("input", this, false);
    this.#dateOfBirthHeaderInput.addEventListener("change", this, false);
  }
  onDateOfBirthHeaderInputChange() {
    if (this.#renderer.dateOfBirthHeader[0] !== this.#dateOfBirthHeaderInput.value) {
      this.#renderer.dateOfBirthHeader[0] = this.#dateOfBirthHeaderInput.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #dateOfBirthHeaderI18n1Input;
  /** @param { HTMLInputElement } input */
  set dateOfBirthHeaderI18n1Input(input) {
    this.#dateOfBirthHeaderI18n1Input = input;
    this.#dateOfBirthHeaderI18n1Input.value = this.#renderer.dateOfBirthHeader[1];
    this.#dateOfBirthHeaderI18n1Input.setAttribute("placeholder", this.#renderer.dateOfBirthHeader[1]);
    this.#dateOfBirthHeaderI18n1Input.addEventListener("input", this, false);
    this.#dateOfBirthHeaderI18n1Input.addEventListener("change", this, false);
  }
  onDateOfBirthHeaderI18n1InputChange() {
    if (this.#renderer.dateOfBirthHeader[1] !== this.#dateOfBirthHeaderI18n1Input.value) {
      this.#renderer.dateOfBirthHeader[1] = this.#dateOfBirthHeaderI18n1Input.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #dateOfBirthHeaderI18n2Input;
  /** @param { HTMLInputElement } input */
  set dateOfBirthHeaderI18n2Input(input) {
    this.#dateOfBirthHeaderI18n2Input = input;
    this.#dateOfBirthHeaderI18n2Input.value = this.#renderer.dateOfBirthHeader[2];
    this.#dateOfBirthHeaderI18n2Input.setAttribute("placeholder", this.#renderer.dateOfBirthHeader[2]);
    this.#dateOfBirthHeaderI18n2Input.addEventListener("input", this, false);
    this.#dateOfBirthHeaderI18n2Input.addEventListener("change", this, false);
  }
  onDateOfBirthHeaderI18n2InputChange() {
    if (this.#renderer.dateOfBirthHeader[2] !== this.#dateOfBirthHeaderI18n2Input.value) {
      this.#renderer.dateOfBirthHeader[2] = this.#dateOfBirthHeaderI18n2Input.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #genderHeaderInput;
  /** @param { HTMLInputElement } input */
  set genderHeaderInput(input) {
    this.#genderHeaderInput = input;
    this.#genderHeaderInput.value = this.#renderer.genderHeader[0];
    this.#genderHeaderInput.setAttribute("placeholder", this.#renderer.genderHeader[0]);
    this.#genderHeaderInput.addEventListener("input", this, false);
    this.#genderHeaderInput.addEventListener("change", this, false);
  }
  onGenderHeaderInputChange() {
    if (this.#renderer.genderHeader[0] !== this.#genderHeaderInput.value) {
      this.#renderer.genderHeader[0] = this.#genderHeaderInput.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #genderHeaderI18n1Input;
  /** @param { HTMLInputElement } input */
  set genderHeaderI18n1Input(input) {
    this.#genderHeaderI18n1Input = input;
    this.#genderHeaderI18n1Input.value = this.#renderer.genderHeader[1];
    this.#genderHeaderI18n1Input.setAttribute("placeholder", this.#renderer.genderHeader[1]);
    this.#genderHeaderI18n1Input.addEventListener("input", this, false);
    this.#genderHeaderI18n1Input.addEventListener("change", this, false);
  }
  onGenderHeaderI18n1InputChange() {
    if (this.#renderer.genderHeader[1] !== this.#genderHeaderI18n1Input.value) {
      this.#renderer.genderHeader[1] = this.#genderHeaderI18n1Input.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #genderHeaderI18n2Input;
  /** @param { HTMLInputElement } input */
  set genderHeaderI18n2Input(input) {
    this.#genderHeaderI18n2Input = input;
    this.#genderHeaderI18n2Input.value = this.#renderer.genderHeader[2];
    this.#genderHeaderI18n2Input.setAttribute("placeholder", this.#renderer.genderHeader[2]);
    this.#genderHeaderI18n2Input.addEventListener("input", this, false);
    this.#genderHeaderI18n2Input.addEventListener("change", this, false);
  }
  onGenderHeaderI18n2InputChange() {
    if (this.#renderer.genderHeader[2] !== this.#genderHeaderI18n2Input.value) {
      this.#renderer.genderHeader[2] = this.#genderHeaderI18n2Input.value;
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

  /** @type { HTMLInputElement } */ #useDigitalSealInput;
  /** @param { HTMLInputElement } input */
  set useDigitalSealInput(input) {
    this.#useDigitalSealInput = input;
    this.#useDigitalSealInput.addEventListener("change", this, false);
  }
  onUseDigitalSealInputChange() {
    if (this.#renderer.useDigitalSeal) {
      this.#renderer.useDigitalSeal = false;
      this.#issueDateInput.setAttribute("disabled", "disabled");
      this.#identifierInput.setAttribute("disabled", "disabled");
      this.#certReferenceInput.setAttribute("disabled", "disabled");
      this.#sealSignatureDateInput.setAttribute("disabled", "disabled");
      this.#dayDurationInput.setAttribute("disabled", "disabled");
      this.#monthDurationInput.setAttribute("disabled", "disabled");
      this.#yearDurationInput.setAttribute("disabled", "disabled");
      this.#visaTypeCodeInput.setAttribute("disabled", "disabled");
      this.#urlInput.removeAttribute("disabled");
    }
    else {
      this.#renderer.useDigitalSeal = true;
      this.#issueDateInput.removeAttribute("disabled");
      this.#identifierInput.removeAttribute("disabled");
      this.#certReferenceInput.removeAttribute("disabled");
      this.#sealSignatureDateInput.removeAttribute("disabled");
      this.#dayDurationInput.removeAttribute("disabled");
      this.#monthDurationInput.removeAttribute("disabled");
      this.#yearDurationInput.removeAttribute("disabled");
      this.#visaTypeCodeInput.removeAttribute("disabled");
      this.#urlInput.setAttribute("disabled", "disabled");
    }
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
    this.#signatureFallback = this.#document.getElementById("offscreen-signature");
    await this.#generateCard();
    const inputFields = [
      "typeCode",
      "authorityCode",
      "placeOfIssue",
      "validFrom",
      "validThru",
      "numberOfEntries",
      "number",
      "type",
      "additionalInfo",
      "fullName",
      "passportNumber",
      "usePassportInMRZ",
      "nationalityCode",
      "dateOfBirth",
      "genderMarker",
      "url",
      "optionalData",
      "picture",
      "signature",
      "signatureFile",
      "signatureText",
      "headerColor",
      "textColor",
      "mrzColor",
      "frontBackgroundColor",
      "mrzBackgroundColor",
      "logoUnderlayColor",
      "logoUnderlayAlpha",
      "frontBackgroundImage",
      "frontBackgroundImageFile",
      "mrzBackgroundImage",
      "mrzBackgroundImageFile",
      "logo",
      "logoFile",
      "fullAuthority",
      "fullDocumentName",
      "placeOfIssueHeader",
      "placeOfIssueHeaderI18n1",
      "placeOfIssueHeaderI18n2",
      "validFromHeader",
      "validFromHeaderI18n1",
      "validFromHeaderI18n2",
      "validThruHeader",
      "validThruHeaderI18n1",
      "validThruHeaderI18n2",
      "numberOfEntriesHeader",
      "numberOfEntriesHeaderI18n1",
      "numberOfEntriesHeaderI18n2",
      "numberHeader",
      "numberHeaderI18n1",
      "numberHeaderI18n2",
      "typeHeader",
      "typeHeaderI18n1",
      "typeHeaderI18n2",
      "additionalInfoHeader",
      "additionalInfoHeaderI18n1",
      "additionalInfoHeaderI18n2",
      "nameHeader",
      "nameHeaderI18n1",
      "nameHeaderI18n2",
      "passportNumberHeader",
      "passportNumberHeaderI18n1",
      "passportNumberHeaderI18n2",
      "nationalityHeader",
      "nationalityHeaderI18n1",
      "nationalityHeaderI18n2",
      "dateOfBirthHeader",
      "dateOfBirthHeaderI18n1",
      "dateOfBirthHeaderI18n2",
      "genderHeader",
      "genderHeaderI18n1",
      "genderHeaderI18n2",
      "showGuides",
      "useDigitalSeal",
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
  async #signSeal() {
    this.#model.sealSignature = [];
    for (let i = 0; i < 64; i += 1) {
      this.#model.sealSignature.push(Math.floor(Math.random() * 256));
    }
  }

  async #generateCard() {
    await this.#signSeal();
    const canvas = await this.#renderer.generateCardFront(this.#model, this.#frontFallback);
    this.#cardFrontElement.width = 1492;
    this.#cardFrontElement.height = 1055;
    const ctx = this.#cardFrontElement.getContext("2d");
    const pageSpecimen = await new Promise((resolve, reject) => {
      const imgNode = new Image();
      imgNode.addEventListener(
        "load",
        () => { resolve(imgNode); },
        false
      );
      imgNode.src = "/specimens/blank-page.png"
    });
    ctx.drawImage(pageSpecimen, 0, 0);
    ctx.fillStyle = "#999999";
    ctx.fillRect(0, 1055 - EventsMRVARenderer.cutCardArea[1] - 1,
      EventsMRVARenderer.cutCardArea[0] + 1, EventsMRVARenderer.cutCardArea[1] + 1);
    ctx.drawImage(
      canvas, 16, 16, EventsMRVARenderer.cutCardArea[0], EventsMRVARenderer.cutCardArea[1],
      0, 1055 - EventsMRVARenderer.cutCardArea[1],
      EventsMRVARenderer.cutCardArea[0], EventsMRVARenderer.cutCardArea[1]
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

export { EventsMRVAViewModel }