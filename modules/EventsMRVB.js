/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { TravelDocument } from "./icao9303/TravelDocument.js";
import { MRVBDocument } from "./icao9303/MRVBDocument.js";
import { DigitalSeal } from "./icao9303/DigitalSeal.js";
import { DigitalSealV4 } from "./icao9303/DigitalSealV4.js";

class EventsMRVB {
  /* This defines properties for an Events Visa (MRV-B) */

  #document = new MRVBDocument();
  #seal = new DigitalSealV4({
    typeCategory: 0x0A,
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
    this.#seal.authority = value;
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
  get validThru() { return this.#document.validThru; }
  get validThruMRZ() { return this.#document.validThruMRZ; }
  get validThruVIZ() { return this.#document.validThruVIZ; }
  set validThru(value) {
    this.#document.validThru = value;
    this.#setDigitalSealMRZ();
  }
  get optionalData() { return this.#document.optionalData; }
  get optionalDataMRZ() { return this.#document.optionalDataMRZ; }
  set optionalData(value) { this.#document.optionalData = value; }
  get picture() { return this.#document.picture; }
  set picture(value) { this.#document.picture = value; }
  get signature() { return this.#document.signature; }
  set signature(value) { this.#document.signature = value; }
  get placeOfIssue() { return this.#document.placeOfIssue; }
  get placeOfIssueVIZ() { return this.#document.placeOfIssueVIZ; }
  set placeOfIssue(value) { this.#document.placeOfIssue = value; }
  get validFrom() { return this.#document.validFrom; }
  get validFromVIZ() { return this.#document.validFromVIZ; }
  set validFrom(value) { this.#document.validFrom = value; }
  get numberOfEntries() { return this.#document.numberOfEntries; }
  get numberOfEntriesVIZ() { return this.#document.numberOfEntriesVIZ; }
  set numberOfEntries(value) {
    this.#document.numberOfEntries = value;
    if (isNaN(parseInt(value))) {
      this.#seal.features.set(0x03, [0]);
    } else {
      this.#seal.features.set(0x03, [parseInt(value)]);
    }
  }
  get type() { return this.#document.type; }
  get typeVIZ() { return this.#document.typeVIZ; }
  set type(value) { this.#document.type = value; }
  get additionalInfo() { return this.#document.additionalInfo; }
  get additionalInfoVIZ() { return this.#document.additionalInfoVIZ; }
  set additionalInfo(value) { this.#document.additionalInfo = value; }
  get passportNumber() { return this.#document.passportNumber; }
  get passportNumberMRZ() { return this.#document.passportNumberMRZ; }
  get passportNumberVIZ() { return this.#document.passportNumberVIZ; }
  set passportNumber(value) { 
    this.#document.passportNumber = value;
    this.#seal.features.set(0x05, DigitalSeal.c40Encode(value));
    this.#setDigitalSealMRZ();
  }
  get usePassportInMRZ() { return this.#document.usePassportInMRZ; }
  set usePassportInMRZ(value) {
    this.#document.usePassportInMRZ = value;
    this.#setDigitalSealMRZ();
  }

  // EventsMRVB-specific data
  #url;
  get url() { return this.#url; }
  set url(value) { this.#url = value; this.qrCode = value; }

  // TD2Document MRZ Getters
  get mrzLine1() { return this.#document.mrzLine1; }
  get mrzLine2() { return this.#document.mrzLine2; }
  get machineReadableZone() { return this.#document.machineReadableZone; }

  // Digital Seal properties
  get identifier() { return this.#seal.identifier; }
  set identifier(value) { this.#seal.identifier = value; }
  get certReference() { return this.#seal.certReference; }
  set certReference(value) { this.#seal.certReference = value; }
  get issueDate() { return this.#seal.issueDate; }
  set issueDate(value) { this.#seal.issueDate = value; }
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
    this.#seal.features.set(0x02, DigitalSeal.c40Encode(
      this.mrzLine1 + this.mrzLine2.slice(0, 28)
    ));
  }
  #setAllValuesFromDigitalSeal() {
    const twoDigitYearStart = 32;
    const sealMRZ = DigitalSeal.c40Decode(this.#seal.features.get(0x02));
    this.#document.typeCode = sealMRZ.slice(0, 2).trimEnd();
    this.#document.authorityCode = sealMRZ.slice(2, 5).trimEnd();
    this.#document.fullName = sealMRZ.slice(5, 36).replace("  ", ", ").trimEnd();
    if (sealMRZ[45] !== TravelDocument.generateMRZCheckDigit(sealMRZ.slice(36, 45).replace(/ /gi, "<"))) {
      throw new EvalError(
        `Document number check digit '${sealMRZ[45]}' does not match for document number '${sealMRZ.slice(36, 45).replace(/ /gi, "<")}.`
      );
    } else {
      this.#document.number = sealMRZ.slice(36, 45).trimEnd();
    }
    this.#document.nationalityCode = sealMRZ.slice(46, 49).trimEnd();
    if (sealMRZ[55] !== TravelDocument.generateMRZCheckDigit(sealMRZ.slice(49, 55).replace(/ /gi, "<"))) {
      throw new EvalError(
        `Date of birth check digit '${sealMRZ[55]}' does not match for date of birth '${sealMRZ.slice(49, 55).replace(/ /gi, "<")}'.`
      );
    } else {
      let yearOfBirth = sealMRZ.slice(49, 51);
      const monthOfBirth = sealMRZ.slice(51, 53);
      const dayOfBirth = sealMRZ.slice(53, 55);
      if (parseInt(yearOfBirth, 10) >= twoDigitYearStart) {
        this.#document.dateOfBirth = `19${yearOfBirth}-${monthOfBirth}-${dayOfBirth}`;
      } else {
        this.#document.dateOfBirth = `20${yearOfBirth}-${monthOfBirth}-${dayOfBirth}`;
      }
    }
    this.#document.genderMarker = sealMRZ[56];
    if (sealMRZ[63] !== TravelDocument.generateMRZCheckDigit(sealMRZ.slice(57, 63).replace(/ /gi, "<"))) {
      throw new EvalError(
        `Valid thru check digit '${sealMRZ[63]}' does not match for valid thru '${sealMRZ.slice(57, 63).replace(/ /gi, "<")}'.`
      );
    } else {
      const yearValidThru = sealMRZ.slice(57, 59);
      const monthValidThru = sealMRZ.slice(59, 61);
      const dayValidThru = sealMRZ.slice(61, 63);
      this.#document.validThru = `20${yearValidThru}-${monthValidThru}-${dayValidThru}`;
    }
    if (this.#seal.features.get(0x03)[0] === 0) {
      this.#document.numberOfEntries = "MULTIPLE";
    } else {
      this.#document.numberOfEntries = this.#seal.features.get(0x03)[0];
    }
    this.#document.passportNumber = DigitalSeal.c40Decode(this.#seal.features.get(0x05));
  }
  get durationOfStay() {
    return this.#seal.features.get(0x04);
  }
  /**
   * @param { number[] } duration */
  set durationOfStay(duration) {
    this.#seal.features.set(0x04,duration);
  }
  get visaTypeCode() {
    let output = "";
    const visaType = this.#seal.features.get(0x06);
    for (let i = 0; i < visaType.length; i += 1) {
      output += visaType[i].toString(16).padStart(2, "0").toUpperCase();
    }
    return output;
  }
  /**
   * @param { string } type */
  set visaTypeCode(type) {
    const input = [];
    const paddedType = type.padStart(8, "0");
    let previousIsZero = true;
    for (let i = 0; i < paddedType.length; i += 2) {
      if ((parseInt(paddedType.slice(i, i + 2), 16) === 0) && previousIsZero === true ) {
        continue;
      }
      input.push(parseInt(paddedType.slice(i, i + 2), 16));
      previousIsZero = false;
    }
    this.#seal.features.set(0x06, input);
  }
  get additionalFeature() {
    return this.#seal.features.get(0x07);
  }
  /**
   * @param { number[] } value */
  set additionalFeature(value) {
    this.#seal.features.set(0x07, value);
  }

  // Constructor
  constructor(opt) {
    if (opt) {
      if (opt.typeCode) { this.typeCode = opt.typeCode; }
      if (opt.authorityCode) { this.authorityCode = opt.authorityCode; }
      if (opt.placeOfIssue) { this.placeOfIssue = opt.placeOfIssue; }
      if (opt.validFrom) { this.validFrom = opt.validFrom; }
      if (opt.validThru) { this.validThru = opt.validThru; }
      if (opt.numberOfEntries) { this.numberOfEntries = opt.numberOfEntries; }
      if (opt.number) { this.number = opt.number; }
      if (opt.type) { this.type = opt.type; }
      if (opt.additionalInfo) { this.additionalInfo = opt.additionalInfo; }
      if (opt.fullName) { this.fullName = opt.fullName; }
      if (opt.passportNumber) { this.passportNumber = opt.passportNumber; }
      if (opt.usePassportInMRZ) { this.usePassportInMRZ = opt.usePassportInMRZ; }
      if (opt.nationalityCode) { this.nationalityCode = opt.nationalityCode; }
      if (opt.dateOfBirth) { this.dateOfBirth = opt.dateOfBirth; }
      if (opt.genderMarker) { this.genderMarker = opt.genderMarker; }
      if (opt.optionalData) { this.optionalData = opt.optionalData; }
      if (opt.picture) { this.picture = opt.picture; }
      if (opt.signature) { this.signature = opt.signature; }
      if (opt.url) { this.url = opt.url; }
      if (opt.identifier) { this.identifier = opt.identifier; }
      if (opt.certReference) { this.certReference = opt.certReference; }
      if (opt.issueDate) { this.issueDate = opt.issueDate; }
      if (opt.sealSignatureDate) { this.sealSignatureDate = opt.sealSignatureDate; }
      if (opt.sealSignature) { this.sealSignature = opt.sealSignature; }
      if (opt.headerZone) { this.headerZone = opt.headerZone; }
      if (opt.messageZone) { this.messageZone = opt.messageZone; }
      if (opt.sealSignatureZone) { this.sealSignatureZone = opt.sealSignatureZone; }
      if (opt.unsignedSeal) { this.unsignedSeal = opt.unsignedSeal; }
      if (opt.signedSeal) { this.signedSeal = opt.signedSeal; }
      if (opt.durationOfStay) { this.durationOfStay = opt.durationOfStay; }
      if (opt.visaTypeCode) { this.visaTypeCode = opt.visaTypeCode; }
      if (opt.additionalFeature) { this.additionalFeature = opt.additionalFeature; }
    }
  }
}

export { EventsMRVB };