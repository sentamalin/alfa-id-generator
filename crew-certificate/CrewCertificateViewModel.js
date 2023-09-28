/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { CrewCertificate } from "/modules/CrewCertificate.js";
import { CrewCertificateRenderer } from "./CrewCertificateRenderer.js";

class CrewCertificateViewModel {
  #model = new CrewCertificate({
    typeCode: "AC",
    authorityCode: "XAF",
    number: "362142069",
    dateOfBirth: "1998-04-17",
    genderMarker: "F",
    dateOfExpiration: "2033-08-23",
    nationalityCode: "UTO",
    fullName: "Millefeuille, Alfalfa",
    optionalData: "",
    employer: "Lambda Air Ways, Inc",
    occupation: "Airline Transport Pilot",
    declaration: "The holder may at all times re-enter\nupon production of this certificate\nwithin the period of validity",
    dateOfIssue: "2023-08-23",
    placeOfIssue: "Utopiopolis, Utopia",
    picture: "/photos/fox.jpg",
    signature: "/signatures/alfalfa.png",
    url: "https://airlinefurries.com/",
    identifier: "XFSS",
    certReference: "00000",
    sealSignatureDate: "2023-09-01",
    employerCode: "1",
    occupationCode: "1"
  });

  #renderer = new CrewCertificateRenderer({
    headerColor: "#000033",
    textColor: "#000000",
    mrzColor: "#000000",
    frontBackgroundColor: "#efefef",
    frontBackgroundImage: "/cardBackgrounds/lofiGrey.png",
    backBackgroundColor: "#efefef",
    backBackgroundImage: "/cardBackgrounds/lofiGrey.png",
    mrzBackgroundColor: "#ffffff",
    mrzBackgroundImage: null,
    numberUnderlayColor: "#ffffff",
    numberUnderlayAlpha: 255,
    logoUnderlayColor: "#000033",
    logoUnderlayAlpha: 255,
    logo: "/logos/lambda.svg",
    smallLogo: "/smallLogos/alfa-bw.svg",
    mrzInQRCode: true,
    showGuides: false,
    fullAuthority: "AIR LINE FURRIES ASSOCIATION, INT'L",
    fullDocumentName: "CREWMEMBER CERTIFICATE",
    nameHeader: [
      "NAME",
      "NOM",
      "APELLIDOS"
    ],
    genderHeader: [
      "GENDER",
      "GENRE",
      "GENÉRO"
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
    employerHeader: [
      "EMPLOYER",
      "EMPLOYEUR",
      "EMPLEADOR"
    ],
    occupationHeader: [
      "OCCUPATION",
      "OCCUPATION",
      "OCUPACIÓN"
    ],
    numberHeader: [
      "CERTIFICATE NO",
      "NO DU CERTIFICAT",
      "NO DEL CERTIFICADO"
    ],
    dateOfExpirationHeader: [
      "EXPIRY",
      "EXPIRATION",
      "EXPIRACIÓN"
    ],
    declarationHeader: [
      "RE-ENTRY DECLARATION",
      "DÉCLARATION DE RENTRÉE",
      "DECLARACIÓN DE REINGRESO"
    ],
    issueHeader: [
      "DATE OF ISSUE—PLACE OF ISSUE",
      "DATE DE DÉLIVERANCE—LIEU DE DÉLIVERANCE",
      "FECHA DE EXPEDICIÓN—LUGAR DE EXPEDICIÓN"
    ]
  });

  #inputTimeout = null;
  #frontFallback;
  #backFallback;
  #signatureFallback;
  #signatureGenerator = null;
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
  }
  onSealSignatureDateInputChange() {
    this.#model.sealSignatureDate = this.#sealSignatureDateInput.value;
    this.#generateCard();
  }

  /** @type { HTMLInputElement } */ #employerCodeInput;
  /** @param { HTMLInputElement } input */
  set employerCodeInput(input) {
    this.#employerCodeInput = input;
    this.#employerCodeInput.setAttribute("minlength", 1);
    this.#employerCodeInput.setAttribute("maxlength", 8);
    this.#employerCodeInput.value = this.#model.employerCode;
    this.#employerCodeInput.setAttribute("placeholder", this.#model.employerCode);
    this.#employerCodeInput.addEventListener("input", this, false);
    this.#employerCodeInput.addEventListener("change", this, false);
  }
  onEmployerCodeInputChange() {
    if (this.#employerCodeInput.checkValidity() &&
    this.#model.employerCode !== this.#employerCodeInput.value) {
      this.#model.employerCode = this.#employerCodeInput.value;
      this.#generateCard();
    }
  }

  /** @type { HTMLInputElement } */ #occupationCodeInput;
  /** @param { HTMLInputElement } input */
  set occupationCodeInput(input) {
    this.#occupationCodeInput = input;
    this.#occupationCodeInput.setAttribute("minlength", 1);
    this.#occupationCodeInput.setAttribute("maxlength", 8);
    this.#occupationCodeInput.value = this.#model.occupationCode;
    this.#occupationCodeInput.setAttribute("placeholder", this.#model.occupationCode);
    this.#occupationCodeInput.addEventListener("input", this, false);
    this.#occupationCodeInput.addEventListener("change", this, false);
  }
  onOccupationCodeInputChange() {
    if (this.#occupationCodeInput.checkValidity() &&
    this.#model.occupationCode !== this.#occupationCodeInput.value) {
      this.#model.occupationCode = this.#occupationCodeInput.value;
      this.#generateCard();
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

  /** @type { HTMLInputElement } */ #occupationInput;
  /** @param { HTMLInputElement } input */
  set occupationInput(input) {
    this.#occupationInput = input;
    this.#occupationInput.value = this.#model.occupation;
    this.#occupationInput.setAttribute("placeholder", this.#model.occupation);
    this.#occupationInput.addEventListener("input", this, false);
    this.#occupationInput.addEventListener("change", this, false);
  }
  onOccupationInputChange() {
    if (this.#model.occupation !== this.#occupationInput.value) {
      this.#model.occupation = this.#occupationInput.value;
      this.#generateCardFront();
    }
  }

  /** @type { HTMLInputElement } */ #declarationInput;
  /** @param { HTMLInputElement } input */
  set declarationInput(input) {
    this.#declarationInput = input;
    this.#declarationInput.setAttribute("cols", 36);
    this.#declarationInput.setAttribute("rows", 3);
    this.#declarationInput.setAttribute("wrap", "off");
    this.#declarationInput.value = this.#model.declaration;
    this.#declarationInput.setAttribute("placeholder", this.#model.declaration);
    this.#declarationInput.addEventListener("input", this, false);
    this.#declarationInput.addEventListener("change", this, false);
  }
  onDeclarationInputChange() {
    if (this.#model.declaration !== this.#declarationInput.value) {
      this.#model.declaration = this.#declarationInput.value;
      this.#generateCardBack();
    }
  }
  
  /** @type { HTMLInputElement } */ #dateOfIssueInput;
  /** @param { HTMLInputElement } input */
  set dateOfIssueInput(input) {
    this.#dateOfIssueInput = input;
    this.#dateOfIssueInput.value = this.#model.dateOfIssue;
    this.#dateOfIssueInput.addEventListener("change", this, false);
  }
  onDateOfIssueInputChange() {
    this.#model.dateOfIssue = this.#dateOfIssueInput.value;
    this.#generateCardBack();
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
      this.#generateCardBack();
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
      this.#generateCardFront();
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
      this.#generateCardBack();
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
    this.#generateCardBack();
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
      this.#generateCardFront();
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
      this.#generateCardFront();
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
      this.#generateCardFront();
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
      this.#generateCardFront();
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
      this.#generateCardFront();
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
      this.#generateCardFront();
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
      this.#generateCardFront();
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
      this.#generateCardFront();
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
      this.#generateCardFront();
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

  /** @type { HTMLInputElement } */ #occupationHeaderInput;
  /** @param { HTMLInputElement } input */
  set occupationHeaderInput(input) {
    this.#occupationHeaderInput = input;
    this.#occupationHeaderInput.value = this.#renderer.occupationHeader[0];
    this.#occupationHeaderInput.setAttribute("placeholder", this.#renderer.occupationHeader[0]);
    this.#occupationHeaderInput.addEventListener("input", this, false);
    this.#occupationHeaderInput.addEventListener("change", this, false);
  }
  onOccupationHeaderInputChange() {
    if (this.#renderer.occupationHeader[0] !== this.#occupationHeaderInput.value) {
      this.#renderer.occupationHeader[0] = this.#occupationHeaderInput.value;
      this.#generateCardFront();
    }
  }

  /** @type { HTMLInputElement } */ #occupationHeaderI18n1Input;
  /** @param { HTMLInputElement } input */
  set occupationHeaderI18n1Input(input) {
    this.#occupationHeaderI18n1Input = input;
    this.#occupationHeaderI18n1Input.value = this.#renderer.occupationHeader[1];
    this.#occupationHeaderI18n1Input.setAttribute("placeholder", this.#renderer.occupationHeader[1]);
    this.#occupationHeaderI18n1Input.addEventListener("input", this, false);
    this.#occupationHeaderI18n1Input.addEventListener("change", this, false);
  }
  onOccupationHeaderI18n1InputChange() {
    if (this.#renderer.occupationHeader[1] !== this.#occupationHeaderI18n1Input.value) {
      this.#renderer.occupationHeader[1] = this.#occupationHeaderI18n1Input.value;
      this.#generateCardFront();
    }
  }

  /** @type { HTMLInputElement } */ #occupationHeaderI18n2Input;
  /** @param { HTMLInputElement } input */
  set occupationHeaderI18n2Input(input) {
    this.#occupationHeaderI18n2Input = input;
    this.#occupationHeaderI18n2Input.value = this.#renderer.occupationHeader[2];
    this.#occupationHeaderI18n2Input.setAttribute("placeholder", this.#renderer.occupationHeader[2]);
    this.#occupationHeaderI18n2Input.addEventListener("input", this, false);
    this.#occupationHeaderI18n2Input.addEventListener("change", this, false);
  }
  onOccupationHeaderI18n2InputChange() {
    if (this.#renderer.occupationHeader[2] !== this.#occupationHeaderI18n2Input.value) {
      this.#renderer.occupationHeader[2] = this.#occupationHeaderI18n2Input.value;
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

  /** @type { HTMLInputElement } */ #declarationHeaderInput;
  /** @param { HTMLInputElement } input */
  set declarationHeaderInput(input) {
    this.#declarationHeaderInput = input;
    this.#declarationHeaderInput.value = this.#renderer.declarationHeader[0];
    this.#declarationHeaderInput.setAttribute("placeholder", this.#renderer.declarationHeader[0]);
    this.#declarationHeaderInput.addEventListener("input", this, false);
    this.#declarationHeaderInput.addEventListener("change", this, false);
  }
  onDeclarationHeaderInputChange() {
    if (this.#renderer.declarationHeader[0] !== this.#declarationHeaderInput.value) {
      this.#renderer.declarationHeader[0] = this.#declarationHeaderInput.value;
      this.#generateCardBack();
    }
  }

  /** @type { HTMLInputElement } */ #declarationHeaderI18n1Input;
  /** @param { HTMLInputElement } input */
  set declarationHeaderI18n1Input(input) {
    this.#declarationHeaderI18n1Input = input;
    this.#declarationHeaderI18n1Input.value = this.#renderer.declarationHeader[1];
    this.#declarationHeaderI18n1Input.setAttribute("placeholder", this.#renderer.declarationHeader[1]);
    this.#declarationHeaderI18n1Input.addEventListener("input", this, false);
    this.#declarationHeaderI18n1Input.addEventListener("change", this, false);
  }
  onDeclarationHeaderI18n1InputChange() {
    if (this.#renderer.declarationHeader[1] !== this.#declarationHeaderI18n1Input.value) {
      this.#renderer.declarationHeader[1] = this.#declarationHeaderI18n1Input.value;
      this.#generateCardBack();
    }
  }

  /** @type { HTMLInputElement } */ #declarationHeaderI18n2Input;
  /** @param { HTMLInputElement } input */
  set declarationHeaderI18n2Input(input) {
    this.#declarationHeaderI18n2Input = input;
    this.#declarationHeaderI18n2Input.value = this.#renderer.declarationHeader[2];
    this.#declarationHeaderI18n2Input.setAttribute("placeholder", this.#renderer.declarationHeader[2]);
    this.#declarationHeaderI18n2Input.addEventListener("input", this, false);
    this.#declarationHeaderI18n2Input.addEventListener("change", this, false);
  }
  onDeclarationHeaderI18n2InputChange() {
    if (this.#renderer.declarationHeader[2] !== this.#declarationHeaderI18n2Input.value) {
      this.#renderer.declarationHeader[2] = this.#declarationHeaderI18n2Input.value;
      this.#generateCardBack();
    }
  }

  /** @type { HTMLInputElement } */ #issueHeaderInput;
  /** @param { HTMLInputElement } input */
  set issueHeaderInput(input) {
    this.#issueHeaderInput = input;
    this.#issueHeaderInput.value = this.#renderer.issueHeader[0];
    this.#issueHeaderInput.setAttribute("placeholder", this.#renderer.issueHeader[0]);
    this.#issueHeaderInput.addEventListener("input", this, false);
    this.#issueHeaderInput.addEventListener("change", this, false);
  }
  onIssueHeaderInputChange() {
    if (this.#renderer.issueHeader[0] !== this.#issueHeaderInput.value) {
      this.#renderer.issueHeader[0] = this.#issueHeaderInput.value;
      this.#generateCardBack();
    }
  }

  /** @type { HTMLInputElement } */ #issueHeaderI18n1Input;
  /** @param { HTMLInputElement } input */
  set issueHeaderI18n1Input(input) {
    this.#issueHeaderI18n1Input = input;
    this.#issueHeaderI18n1Input.value = this.#renderer.issueHeader[1];
    this.#issueHeaderI18n1Input.setAttribute("placeholder", this.#renderer.issueHeader[1]);
    this.#issueHeaderI18n1Input.addEventListener("input", this, false);
    this.#issueHeaderI18n1Input.addEventListener("change", this, false);
  }
  onIssueHeaderI18n1InputChange() {
    if (this.#renderer.issueHeader[1] !== this.#issueHeaderI18n1Input.value) {
      this.#renderer.issueHeader[1] = this.#issueHeaderI18n1Input.value;
      this.#generateCardBack();
    }
  }

  /** @type { HTMLInputElement } */ #issueHeaderI18n2Input;
  /** @param { HTMLInputElement } input */
  set issueHeaderI18n2Input(input) {
    this.#issueHeaderI18n2Input = input;
    this.#issueHeaderI18n2Input.value = this.#renderer.issueHeader[2];
    this.#issueHeaderI18n2Input.setAttribute("placeholder", this.#renderer.issueHeader[2]);
    this.#issueHeaderI18n2Input.addEventListener("input", this, false);
    this.#issueHeaderI18n2Input.addEventListener("change", this, false);
  }
  onIssueHeaderI18n2InputChange() {
    if (this.#renderer.issueHeader[2] !== this.#issueHeaderI18n2Input.value) {
      this.#renderer.issueHeader[2] = this.#issueHeaderI18n2Input.value;
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
    this.#signatureFallback = this.#document.getElementById("offscreen-signature");
    await this.#generateCard();
    const inputFields = [
      "typeCode",
      "authorityCode",
      "number",
      "dateOfBirth",
      "genderMarker",
      "dateOfExpiration",
      "nationalityCode",
      "fullName",
      "employer",
      "occupation",
      "declaration",
      "dateOfIssue",
      "placeOfIssue",
      "url",
      "mrzInQRCode",
      "optionalData",
      "picture",
      "signature",
      "signatureFile",
      "signatureText",
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
      "fullAuthority",
      "fullDocumentName",
      "nameHeader",
      "nameHeaderI18n1",
      "nameHeaderI18n2",
      "genderHeader",
      "genderHeaderI18n1",
      "genderHeaderI18n2",
      "nationalityHeader",
      "nationalityHeaderI18n1",
      "nationalityHeaderI18n2",
      "dateOfBirthHeader",
      "dateOfBirthHeaderI18n1",
      "dateOfBirthHeaderI18n2",
      "employerHeader",
      "employerHeaderI18n1",
      "employerHeaderI18n2",
      "occupationHeader",
      "occupationHeaderI18n1",
      "occupationHeaderI18n2",
      "numberHeader",
      "numberHeaderI18n1",
      "numberHeaderI18n2",
      "dateOfExpirationHeader",
      "dateOfExpirationHeaderI18n1",
      "dateOfExpirationHeaderI18n2",
      "declarationHeader",
      "declarationHeaderI18n1",
      "declarationHeaderI18n2",
      "issueHeader",
      "issueHeaderI18n1",
      "issueHeaderI18n2",
      "showGuides",
      "identifier",
      "certReference",
      "sealSignatureDate",
      "employerCode",
      "occupationCode"
    ];
    for (const elementID of inputFields) {
      this[`${elementID}Input`] = this.#document.getElementById(elementID);
    }
  }

  // Private methods
  async #generateCardFront() {
    const canvas = await this.#renderer.generateCardFront(this.#model, this.#frontFallback);
    this.#cardFrontElement.width = CrewCertificateRenderer.cutCardArea[0];
    this.#cardFrontElement.height = CrewCertificateRenderer.cutCardArea[1];
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
    this.#cardBackElement.width = CrewCertificateRenderer.cutCardArea[0];
    this.#cardBackElement.height = CrewCertificateRenderer.cutCardArea[1];
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

export { CrewCertificateViewModel }