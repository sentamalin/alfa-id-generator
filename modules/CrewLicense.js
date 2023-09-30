/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { TravelDocument } from "./icao9303/TravelDocument.js";
import { TD1Document } from "./icao9303/TD1Document.js"
import { DigitalSeal } from "./icao9303/DigitalSeal.js";
import { DigitalSealV4 } from "./icao9303/DigitalSealV4.js";

class CrewLicense {
  /* This defines properties for an ICAO 9303 TD1-compliant Crewmember License */

  #document = new TD1Document();
  #seal = new DigitalSealV4({
    typeCategory: 0x06,
    featureDefinition: 0x01
  });
  
  // General Text and Graphical Data (Forwards/Calls TD1Document)
  get typeCode() { return this.#document.typeCode; }
  set typeCode(value) {
    this.#document.typeCode = value;
    this.#setDigitalSealMRZ();
  }
  get authorityCode() { return this.#document.authorityCode; }
  set authorityCode(value) {
    this.#document.authorityCode = value;
    this.#seal.authorityCode = value;
    this.#setDigitalSealMRZ();
  }
  get number() { return this.#document.number; }
  set number(value) {
    this.#document.number = value;
    this.#setDigitalSealMRZ();
  }
  get birthDate() { return this.#document.birthDate; }
  set birthDate(value) {
    this.#document.birthDate = value;
    this.#setDigitalSealMRZ();
  }
  get genderMarker() { return this.#document.genderMarker; }
  set genderMarker(value) {
    this.#document.genderMarker = value;
    this.#setDigitalSealMRZ();
  }
  get expirationDate() { return this.#document.expirationDate; }
  set expirationDate(value) {
    this.#document.expirationDate = value;
    this.#setDigitalSealMRZ();
  }
  get nationalityCode() { return this.#document.nationalityCode; }
  set nationalityCode(value) {
    this.#document.nationalityCode = value;
    this.#setDigitalSealMRZ();
  }
  get fullName() { return this.#document.fullName; }
  set fullName(value) {
    this.#document.fullName = value;
    this.#setDigitalSealMRZ();
  }
  get optionalData() { return this.#document.optionalData; }
  set optionalData(value) { this.#document.optionalData = value; }
  get picture() { return this.#document.picture; }
  set picture(value) { this.#document.picture = value; }
  get signature() { return this.#document.signature; }
  set signature(value) { this.#document.signature = value; }

  // CrewLicense Data
  #url;
  get url() { return this.#url; }
  set url(value) { this.#url = value; }

  #subauthority;
  get subauthority() { return this.#subauthority; }
  set subauthority(value) {
    this.#subauthority = new String(value);
    this.#subauthority.toVIZ = function() {
      return this.toUpperCase();
    }
  }

  #privilege;
  get privilege() { return this.#privilege; }
  set privilege(value) {
    this.#privilege = new String(value);
    this.#privilege.toVIZ = function() {
      return this.toUpperCase();
    }
  }

  #ratings;
  get ratings() { return this.#ratings; }
  set ratings(value) {
    this.#ratings = new String(value);
    this.#ratings.toVIZ = function() {
      return this.toUpperCase();
    }
  }

  #limitations;
  get limitations() { return this.#limitations; }
  set limitations(value) {
    this.#limitations = new String(value);
    this.#limitations.toVIZ = function() {
      return this.toUpperCase();
    }
  }

  // CrewLicense MRZ Getters
  get mrzLine1() { return this.#document.mrzLine1; }
  get mrzLine2() { return this.#document.mrzLine2; }
  get mrzLine3() { return this.#document.mrzLine3; }
  get machineReadableZone() { return this.#document.machineReadableZone; }

  // Digital Seal properties
  get identifierCode() { return this.#seal.identifierCode; }
  set identifierCode(value) { this.#seal.identifierCode = value; }
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
    this.#document.authorityCode = this.#seal.authorityCode;
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
      this.mrzLine1.slice(0, 15) +
      this.mrzLine2.slice(0, 18) +
      this.mrzLine3
    ));
  }
  #setAllValuesFromDigitalSeal() {
    const twoDigitYearStart = 32;
    const sealMRZ = DigitalSeal.c40Decode(this.#seal.features.get(0x01));
    this.#document.typeCode = sealMRZ.slice(0, 2).trimEnd();
    this.#document.authorityCode = sealMRZ.slice(2, 5).trimEnd();
    if (sealMRZ[14] !== TravelDocument.generateMRZCheckDigit(sealMRZ.slice(5, 14).replace(/ /gi, "<"))) {
      throw new EvalError(
        `Document number check digit '${sealMRZ[45]}' does not match for document number '${sealMRZ.slice(5, 14).replace(/ /gi, "<")}'.`
      );
    } else {
      this.#document.number = sealMRZ.slice(5, 14).trimEnd();
    }
    if (sealMRZ[21] !== TravelDocument.generateMRZCheckDigit(sealMRZ.slice(15, 21).replace(/ /gi, "<"))) {
      throw new EvalError(
        `Date of birth check digit '${sealMRZ[21]}' does not match for date of birth '${sealMRZ.slice(15, 21).replace(/ /gi, "<")}'.`
      );
    } else {
      const yearOfBirth = sealMRZ.slice(15, 17);
      const monthOfBirth = sealMRZ.slice(17, 19);
      const dayOfBirth = sealMRZ.slice(19, 21);
      if (parseInt(yearOfBirth, 10) >= twoDigitYearStart) {
        this.#document.birthDate = `19${yearOfBirth}-${monthOfBirth}-${dayOfBirth}`;
      } else {
        this.#document.birthDate = `20${yearOfBirth}-${monthOfBirth}-${dayOfBirth}`;
      }
    }
    this.#document.genderMarker = sealMRZ[22];
    if (sealMRZ[29] !== TravelDocument.generateMRZCheckDigit(sealMRZ.slice(23, 29).replace(/ /gi, "<"))) {
      throw new EvalError(
        `Date of expiration check digit '${sealMRZ[29]}' does not match for date of expiration '${sealMRZ.slice(23, 29).replace(/ /gi, "<")}'.`
      );
    } else {
      const yearExpiration = sealMRZ.slice(23, 25);
      const monthExpiration = sealMRZ.slice(25, 27);
      const dayExpiration = sealMRZ.slice(27, 29);
      this.#document.expirationDate = `20${yearExpiration}-${monthExpiration}-${dayExpiration}`;
    }
    this.#document.nationalityCode = sealMRZ.slice(30, 33).trimEnd();
    this.#document.fullName = sealMRZ.slice(33).replace("  ", ", ").trimEnd();
  }
  get subauthorityCode() {
    let output = "";
    const subauthorityCode = this.#seal.features.get(0x02);
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
    this.#seal.features.set(0x02, input);
  }
  get privilegeCode() {
    let output = "";
    const privilegeCode = this.#seal.features.get(0x03);
    for (let i = 0; i < privilegeCode.length; i += 1) {
      output += privilegeCode[i].toString(16).padStart(2, "0").toUpperCase();
    }
    return output;
  }
  /**
   * @param { string } code */
  set privilegeCode(code) {
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
    this.subauthority = "Unknown";
    this.privilege = "None";
    this.ratings = "None";
    this.limitations = "None";
    
    if (opt) {
      if (opt.typeCode) { this.typeCode = opt.typeCode; }
      if (opt.authorityCode) { this.authorityCode = opt.authorityCode; }
      if (opt.number) { this.number = opt.number; }
      if (opt.dateOfBirth) { this.birthDate = opt.dateOfBirth; }
      if (opt.genderMarker) { this.genderMarker = opt.genderMarker; }
      if (opt.dateOfExpiration) { this.expirationDate = opt.dateOfExpiration; }
      if (opt.nationalityCode) { this.nationalityCode = opt.nationalityCode; }
      if (opt.fullName) { this.fullName = opt.fullName; }
      if (opt.optionalData) { this.optionalData = opt.optionalData; }
      if (opt.picture) { this.picture = opt.picture; }
      if (opt.signature) { this.signature = opt.signature; }
      if (opt.url) { this.url = opt.url; }
      if (opt.authority) { this.subauthority = opt.authority; }
      if (opt.privilege) { this.privilege = opt.privilege; }
      if (opt.ratings) { this.ratings = opt.ratings; }
      if (opt.limitations) { this.limitations = opt.limitations; }
      if (opt.identifier) { this.identifierCode = opt.identifier; }
      if (opt.certReference) { this.certReference = opt.certReference; }
      if (opt.issueDate) { this.issueDate = opt.issueDate; }
      if (opt.sealSignatureDate) { this.sealSignatureDate = opt.sealSignatureDate; }
      if (opt.sealSignature) { this.sealSignature = opt.sealSignature; }
      if (opt.headerZone) { this.headerZone = opt.headerZone; }
      if (opt.messageZone) { this.messageZone = opt.messageZone; }
      if (opt.sealSignatureZone) { this.sealSignatureZone = opt.sealSignatureZone; }
      if (opt.unsignedSeal) { this.unsignedSeal = opt.unsignedSeal; }
      if (opt.signedSeal) { this.signedSeal = opt.signedSeal; }
      if (opt.subauthorityCode) { this.subauthorityCode = opt.subauthorityCode; }
      if (opt.privilegeCode) { this.privilegeCode = opt.privilegeCode; }
    }
  }
}

export { CrewLicense };