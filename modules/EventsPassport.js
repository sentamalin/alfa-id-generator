/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { TravelDocument } from "./icao9303/TravelDocument.js";
import { TD3Document } from "./icao9303/TD3Document.js";
import { DigitalSeal } from "./icao9303/DigitalSeal.js";
import { DigitalSealV4 } from "./icao9303/DigitalSealV4.js";

class EventsPassport {
  /* This defines properties for an ICAO 9303 TD3-compliant Events Passport (MRP) */

  #document = new TD3Document();
  #seal = new DigitalSealV4({
    typeCategory: 0x02,
    featureDefinition: 0x01
  });
  
  // General Text and Graphical Data (Forwards/Calls TD3Document)
  get typeCode() { return this.#document.typeCode; }
  get typeCodeMRZ() { return this.#document.typeCodeMRZ; }
  get typeCodeVIZ() { return this.#document.typeCodeVIZ; }
  set typeCode(value) {
    this.#document.typeCode = value;
    this.#setDigitalSealMRZ();
  }
  get authorityCode() { return this.#document.authorityCode; }
  get authorityCodeMRZ() { return this.#document.authorityCodeMRZ; }
  get authorityCodeVIZ() { return this.#document.authorityCodeVIZ; }
  set authorityCode(value) {
    this.#document.authorityCode = value;
    this.#setDigitalSealMRZ();
  }
  get number() { return this.#document.number; }
  get numberMRZ() { return this.#document.numberMRZ; }
  get numberVIZ() { return this.#document.numberVIZ; }
  set number(value) {
    this.#document.number = value;
    this.#setDigitalSealMRZ();
  }
  get fullName() { return this.#document.fullName; }
  get fullNameMRZ() { return this.#document.fullNameMRZ; }
  get fullNameVIZ() { return this.#document.fullNameVIZ; }
  set fullName(value) {
    this.#document.fullName = value;
    this.#setDigitalSealMRZ();
  }
  get nationalityCode() { return this.#document.nationalityCode; }
  get nationalityCodeMRZ() { return this.#document.nationalityCodeMRZ; }
  get nationalityCodeVIZ() { return this.#document.nationalityCodeVIZ; }
  set nationalityCode(value) {
    this.#document.nationalityCode = value;
    this.#setDigitalSealMRZ();
  }
  get dateOfBirth() { return this.#document.dateOfBirth; }
  get dateOfBirthMRZ() { return this.#document.dateOfBirthMRZ; }
  get dateOfBirthVIZ() { return this.#document.dateOfBirthVIZ; }
  set dateOfBirth(value) {
    this.#document.dateOfBirth = value;
    this.#setDigitalSealMRZ();
  }
  get genderMarker() { return this.#document.genderMarker; }
  get genderMarkerMRZ() { return this.#document.genderMarkerMRZ; }
  get genderMarkerVIZ() { return this.#document.genderMarkerVIZ; }
  set genderMarker(value) {
    this.#document.genderMarker = value;
    this.#setDigitalSealMRZ();
  }
  get dateOfExpiration() { return this.#document.dateOfExpiration; }
  get dateOfExpirationMRZ() { return this.#document.dateOfExpirationMRZ; }
  get dateOfExpirationVIZ() { return this.#document.dateOfExpirationVIZ; }
  set dateOfExpiration(value) {
    this.#document.dateOfExpiration = value;
    this.#setDigitalSealMRZ();
  }
  get optionalData() { return this.#document.optionalData; }
  get optionalDataMRZ() { return this.#document.optionalDataMRZ; }
  set optionalData(value) { this.#document.optionalData = value; }
  get picture() { return this.#document.picture; }
  set picture(value) { this.#document.picture = value; }
  get signature() { return this.#document.signature; }
  set signature(value) { this.#document.signature = value; }

  // EventsPassport-specific data
  #url;
  get url() { return this.#url; }
  set url(value) { this.#url = value; this.qrCode = value; }

  #placeOfBirth;
  get placeOfBirth() { return this.#placeOfBirth; }
  get placeOfBirthVIZ() { return this.#placeOfBirth.toUpperCase(); }
  set placeOfBirth(value) {
    this.#placeOfBirth = value;
    this.#seal.features.set(0x02, DigitalSeal.c40Encode(value));
  }
  
  #dateOfIssue;
  get dateOfIssue() { return this.#dateOfIssue.toISOString().slice(0,10); }
  get dateOfIssueVIZ() { return TravelDocument.dateToVIZ(this.#dateOfIssue).toUpperCase(); }
  set dateOfIssue(value) {
    let test = new Date(`${value}T00:00:00`);
    if (test.toString() === "Invalid Date") {
      throw new TypeError(
        "Date of issue (dateOfIssue) must be a valid date string."
      );
    }
    else {
      this.#dateOfIssue = test;
      this.#seal.issueDate = value;
    }
  }

  #authority;
  get authority() { return this.#authority; }
  get authorityVIZ() { return this.#authority.toUpperCase(); }
  set authority(value) { this.#authority = value; }

  #endorsements;
  get endorsements() { return this.#endorsements; }
  get endorsementsVIZ() { return this.#endorsements.toUpperCase(); }
  set endorsements(value) {
    this.#endorsements = value;
    this.#seal.features.set(0x04, DigitalSeal.c40Encode(value));
  }

  // CrewCertificate MRZ Getters
  get mrzLine1() { return this.#document.mrzLine1; }
  get mrzLine2() { return this.#document.mrzLine2; }
  get machineReadableZone() { return this.#document.machineReadableZone; }

  // Digital Seal properties
  get identifier() { return this.#seal.identifier; }
  set identifier(value) { this.#seal.identifier = value; }
  get certReference() { return this.#seal.certReference; }
  set certReference(value) { this.#seal.certReference = value; }
  get sealSignatureDate() { return this.#seal.signatureDate; }
  set sealSignatureDate(value) { this.#seal.signatureDate = value; }
  get sealSignature() { return this.#seal.signature; }
  set sealSignature(value) { this.#seal.signature = value; }
  get headerZone() { return this.#seal.headerZone; }
  set headerZone(value) {
    this.#seal.headerZone = value;
    this.#document.authorityCode = this.#seal.authority;
  }
  get messageZone() { return this.#seal.messageZone; }
  set messageZone(value) {
    this.#seal.messageZone = value;
    this.#setAllValuesFromDigitalSeal();
  }
  get sealSignatureZone() { return this.#seal.signatureZone; }
  set sealSignatureZone(value) { this.#seal.signatureZone = value; }
  get unsignedSeal() { return this.#seal.unsignedSeal; }
  set unsignedSeal(value) {
    this.#seal.unsignedSeal = value;
    this.#setAllValuesFromDigitalSeal();
  }
  get signedSeal() { return this.#seal.signedSeal; }
  set signedSeal(value) {
    this.#seal.signedSeal = value;
    this.#setAllValuesFromDigitalSeal();
  }

  // Digital Seal features
  #setDigitalSealMRZ() {
    this.#seal.features.set(0x01, DigitalSeal.c40Encode(
      this.mrzLine1 + this.mrzLine2.slice(0, 28)
    ));
  }
  #setAllValuesFromDigitalSeal() {
    const twoDigitYearStart = 32;
    const sealMRZ = DigitalSeal.c40Decode(this.#seal.features.get(0x01));
    this.#document.typeCode = sealMRZ.slice(0, 2).trimEnd();
    this.#document.authorityCode = sealMRZ.slice(2, 5).trimEnd();
    this.#document.fullName = sealMRZ.slice(5, 44).replace("  ", ", ").trimEnd();
    if (sealMRZ[53] !== TravelDocument.generateMRZCheckDigit(sealMRZ.slice(44, 53).replace(/ /gi, "<"))) {
      throw new EvalError(
        `Document number check digit '${sealMRZ[53]}' does not match for document number '${sealMRZ.slice(44, 53).replace(/ /gi, "<")}.`
      );
    } else {
      this.#document.number = sealMRZ.slice(44, 53).trimEnd();
    }
    this.#document.nationalityCode = sealMRZ.slice(54, 57).trimEnd();
    if (sealMRZ[63] !== TravelDocument.generateMRZCheckDigit(sealMRZ.slice(57, 63).replace(/ /gi, "<"))) {
      throw new EvalError(
        `Date of birth check digit '${sealMRZ[63]}' does not match for date of birth '${sealMRZ.slice(57, 63).replace(/ /gi, "<")}'.`
      );
    } else {
      const yearOfBirth = sealMRZ.slice(57, 59);
      const monthOfBirth = sealMRZ.slice(59, 61);
      const dayOfBirth = sealMRZ.slice(61, 63);
      if (parseInt(yearOfBirth, 10) >= twoDigitYearStart) {
        this.#document.dateOfBirth = `19${yearOfBirth}-${monthOfBirth}-${dayOfBirth}`;
      } else {
        this.#document.dateOfBirth = `20${yearOfBirth}-${monthOfBirth}-${dayOfBirth}`;
      }
    }
    this.#document.genderMarker = sealMRZ[64];
    if (sealMRZ[71] !== TravelDocument.generateMRZCheckDigit(sealMRZ.slice(65, 71).replace(/ /gi, "<"))) {
      throw new EvalError(
        `Date of expiration check digit '${sealMRZ[71]}' does not match for date of expiration '${sealMRZ.slice(65, 71).replace(/ /gi, "<")}'.`
      );
    } else {
      const yearExpiration = sealMRZ.slice(65, 67);
      const monthExpiration = sealMRZ.slice(67, 69);
      const dayExpiration = sealMRZ.slice(69, 71);
      this.#document.dateOfExpiration = `20${yearExpiration}-${monthExpiration}-${dayExpiration}`;
    }
    this.#dateOfIssue = new Date(`${this.#seal.issueDate}T00:00:00`);
    this.#endorsements = DigitalSeal.c40Decode(this.#seal.features.get(0x04));
  }
  get subauthorityCode() {
    let output = "";
    const subauthorityCode = this.#seal.features.get(0x03);
    for (let i = 0; i < subauthorityCode.length; i += 1) {
      output += subauthorityCode[i].toString(16).padStart(2, "0").toUpperCase();
    }
    return output;
  }
  /**
   * @param { string } code */
  set subauthorityCode(code) {
    const input = [];
    const paddedType = code.padStart(8, "0");
    let previousIsZero = true;
    for (let i = 0; i < paddedType.length; i += 2) {
      if ((parseInt(paddedType.slice(i, i + 2), 16) === 0) && previousIsZero === true) {
        continue;
      }
      input.push(parseInt(paddedType.slice(i, i + 2), 16));
      previousIsZero = false;
    }
    this.#seal.features.set(0x03, input);
  }

  // Constructor
  constructor(opt) {
    if (opt) {
      if (opt.typeCode) { this.typeCode = opt.typeCode; }
      if (opt.authorityCode) { this.authorityCode = opt.authorityCode; }
      if (opt.number) { this.number = opt.number; }
      if (opt.fullName) { this.fullName = opt.fullName; }
      if (opt.nationalityCode) { this.nationalityCode = opt.nationalityCode; }
      if (opt.dateOfBirth) { this.dateOfBirth = opt.dateOfBirth; }
      if (opt.genderMarker) { this.genderMarker = opt.genderMarker; }
      if (opt.placeOfBirth) { this.placeOfBirth = opt.placeOfBirth; }
      if (opt.dateOfIssue) { this.dateOfIssue = opt.dateOfIssue; }
      if (opt.authority) { this.authority = opt.authority; }
      if (opt.dateOfExpiration) { this.dateOfExpiration = opt.dateOfExpiration; }
      if (opt.endorsements) { this.endorsements = opt.endorsements; }
      if (opt.optionalData) { this.optionalData = opt.optionalData; }
      if (opt.picture) { this.picture = opt.picture; }
      if (opt.signature) { this.signature = opt.signature; }
      if (opt.url) { this.url = opt.url; }
      if (opt.identifier) { this.identifier = opt.identifier; }
      if (opt.certReference) { this.certReference = opt.certReference; }
      if (opt.sealSignatureDate) { this.sealSignatureDate = opt.sealSignatureDate; }
      if (opt.sealSignature) { this.sealSignature = opt.sealSignature; }
      if (opt.headerZone) { this.headerZone = opt.headerZone; }
      if (opt.messageZone) { this.messageZone = opt.messageZone; }
      if (opt.sealSignatureZone) { this.sealSignatureZone = opt.sealSignatureZone; }
      if (opt.unsignedSeal) { this.unsignedSeal = opt.unsignedSeal; }
      if (opt.signedSeal) { this.signedSeal = opt.signedSeal; }
      if (opt.subauthorityCode) { this.subauthorityCode = opt.subauthorityCode; }
    }
  }
}

export { EventsPassport };