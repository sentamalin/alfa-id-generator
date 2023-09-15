/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { TravelDocument } from "./TravelDocument.js";
import { VisaDocument } from "./VisaDocument.js";

class MRVBDocument {
  /* This defines properties for an ICAO 9303 MRV-B Visa */

  #document = new TravelDocument();
  #visa = new VisaDocument();
  
  // General Text and Graphical Data (Forwards/Calls TravelDocument)
  get typeCode() { return this.#document.typeCode; }
  get typeCodeMRZ() { return this.#document.typeCodeMRZ; }
  get typeCodeVIZ() { return this.#document.typeCodeVIZ; }
  set typeCode(value) { this.#document.typeCode = value; }
  get authorityCode() { return this.#document.authorityCode; }
  get authorityCodeMRZ() { return this.#document.authorityCodeMRZ; }
  get authorityCodeVIZ() { return this.#document.authorityCodeVIZ; }
  set authorityCode(value) { this.#document.authorityCode = value; }
  get number() { return this.#document.number; }
  get numberMRZ() { return this.#document.numberMRZ; }
  get numberVIZ() { return this.#document.numberVIZ; }
  set number(value) { this.#document.number = value; }
  get fullName() { return this.#document.fullName; } // 31 characters
  get fullNameMRZ() { return this.#document.fullNameMRZ(31); }
  get fullNameVIZ() { return this.#document.fullNameVIZ; }
  set fullName(value) { this.#document.fullName = value; }
  get nationalityCode() { return this.#document.nationalityCode; }
  get nationalityCodeMRZ() { return this.#document.nationalityCodeMRZ; }
  get nationalityCodeVIZ() { return this.#document.nationalityCodeVIZ; }
  set nationalityCode(value) { this.#document.nationalityCode = value; }
  get dateOfBirth() { return this.#document.dateOfBirth; }
  get dateOfBirthMRZ() { return this.#document.dateOfBirthMRZ; }
  get dateOfBirthVIZ() { return this.#document.dateOfBirthVIZ; }
  set dateOfBirth(value) { this.#document.dateOfBirth = value; }
  get genderMarker() { return this.#document.genderMarker; }
  get genderMarkerMRZ() { return this.#document.genderMarkerMRZ; }
  get genderMarkerVIZ() { return this.#document.genderMarkerVIZ; }
  set genderMarker(value) { this.#document.genderMarker = value; }
  get validThru() { return this.#document.dateOfExpiration; }
  get validThruMRZ() { return this.#document.dateOfExpirationMRZ; }
  get validThruVIZ() { return this.#document.dateOfExpirationVIZ; }
  set validThru(value) { this.#document.dateOfExpiration = value; }
  get optionalData() { return this.#document.optionalData; } // 8 characters
  get optionalDataMRZ() { return this.#document.optionalDataMRZ(8); }
  set optionalData(value) { this.#document.optionalData = value; }
  get picture() { return this.#document.picture; }
  set picture(value) { this.#document.picture = value; }
  get signature() { return this.#document.signature; }
  set signature(value) { this.#document.signature = value; }
  get placeOfIssue() { return this.#visa.placeOfIssue; }
  get placeOfIssueVIZ() { return this.#visa.placeOfIssueVIZ; }
  set placeOfIssue(value) { this.#visa.placeOfIssue = value; }
  get validFrom() { return this.#visa.validFrom; }
  get validFromVIZ() { return this.#visa.validFromVIZ; }
  set validFrom(value) { this.#visa.validFrom = value; }
  get numberOfEntries() { return this.#visa.numberOfEntries; }
  get numberOfEntriesVIZ() { return this.#visa.numberOfEntriesVIZ; }
  set numberOfEntries(value) { this.#visa.numberOfEntries = value; }
  get type() { return this.#visa.type; }
  get typeVIZ() { return this.#visa.typeVIZ; }
  set type(value) { this.#visa.type = value; }
  get additionalInfo() { return this.#visa.additionalInfo; }
  get additionalInfoVIZ() { return this.#visa.additionalInfoVIZ; }
  set additionalInfo(value) { this.#visa.additionalInfo = value; }
  get passportNumber() { return this.#visa.passportNumber; }
  get passportNumberMRZ() { return this.#visa.passportNumberMRZ; }
  get passportNumberVIZ() { return this.#visa.passportNumberVIZ; }
  set passportNumber(value) { this.#visa.passportNumber = value; }
  get usePassportInMRZ() { return this.#visa.usePassportInMRZ; }
  set usePassportInMRZ(value) { this.#visa.usePassportInMRZ = value; }

  // MRVBDocument MRZ Getters
  get mrzLine1() {
    return this.typeCodeMRZ +
      this.authorityCodeMRZ +
      this.fullNameMRZ;    
  }
  get mrzLine2() {
    let mrzNumber;
    if (this.usePassportInMRZ) { mrzNumber = this.passportNumberMRZ; }
    else { mrzNumber = this.numberMRZ; }
    return mrzNumber +
      TravelDocument.generateMRZCheckDigit(mrzNumber) +
      this.nationalityCodeMRZ +
      this.dateOfBirthMRZ +
      TravelDocument.generateMRZCheckDigit(this.dateOfBirthMRZ) +
      this.genderMarkerMRZ +
      this.validThruMRZ +
      TravelDocument.generateMRZCheckDigit(this.validThruMRZ) +
      this.optionalDataMRZ;
  }
  get machineReadableZone() {
    return this.mrzLine1 +
    "\n" +
    this.mrzLine2;
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
    }
  }
}

export { MRVBDocument };