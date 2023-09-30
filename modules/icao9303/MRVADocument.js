/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { TravelDocument } from "./TravelDocument.js";
import { VisaDocument } from "./VisaDocument.js";

class MRVADocument {
  /* This defines properties for an ICAO 9303 MRV-A Visa */

  #document = new TravelDocument();
  #visa = new VisaDocument();
  
  // General Text and Graphical Data (Forwards/Calls TD3Document)
  get typeCode() { return this.#document.typeCode; }
  set typeCode(value) { this.#document.typeCode = value; }
  get authorityCode() { return this.#document.authorityCode; }
  set authorityCode(value) { this.#document.authorityCode = value; }
  get number() { return this.#document.number; }
  set number(value) { this.#document.number = value; }
  get fullName() { return this.#document.fullName; }
  set fullName(value) {
    this.#document.fullName = value;
    this.#document.fullName.toMRZ = function() {
      return TravelDocument.fullNameMRZ(this, 39);
    }
  }
  get nationalityCode() { return this.#document.nationalityCode; }
  set nationalityCode(value) { this.#document.nationalityCode = value; }
  get birthDate() { return this.#document.birthDate; }
  set birthDate(value) { this.#document.birthDate = value; }
  get genderMarker() { return this.#document.genderMarker; }
  set genderMarker(value) { this.#document.genderMarker = value; }
  get validThru() { return this.#document.expirationDate; }
  set validThru(value) { this.#document.expirationDate = value; }
  get optionalData() { return this.#document.optionalData; }
  set optionalData(value) {
    this.#document.optionalData = value;
    this.#document.optionalData.toMRZ = function() {
      return TravelDocument.optionalDataMRZ(this, 16);
    }
  }
  get picture() { return this.#document.picture; }
  set picture(value) { this.#document.picture = value; }
  get signature() { return this.#document.signature; }
  set signature(value) { this.#document.signature = value; }
  get placeOfIssue() { return this.#visa.placeOfIssue; }
  set placeOfIssue(value) { this.#visa.placeOfIssue = value; }
  get validFrom() { return this.#visa.validFrom; }
  set validFrom(value) { this.#visa.validFrom = value; }
  get numberOfEntries() { return this.#visa.numberOfEntries; }
  set numberOfEntries(value) { this.#visa.numberOfEntries = value; }
  get visaType() { return this.#visa.visaType; }
  set visaType(value) { this.#visa.visaType = value; }
  get additionalInfo() { return this.#visa.additionalInfo; }
  set additionalInfo(value) { this.#visa.additionalInfo = value; }
  get passportNumber() { return this.#visa.passportNumber; }
  set passportNumber(value) { this.#visa.passportNumber = value; }
  get usePassportInMRZ() { return this.#visa.usePassportInMRZ; }
  set usePassportInMRZ(value) { this.#visa.usePassportInMRZ = value; }

  // MRVADocument MRZ Getters
  get mrzLine1() {
    return this.typeCode.toMRZ() +
      this.authorityCode.toMRZ() +
      this.fullName.toMRZ();
  }
  get mrzLine2() {
    let mrzNumber;
    if (this.usePassportInMRZ) { mrzNumber = this.passportNumber.toMRZ(); }
    else { mrzNumber = this.number.toMRZ(); }
    return mrzNumber +
      TravelDocument.generateMRZCheckDigit(mrzNumber) +
      this.nationalityCode.toMRZ() +
      this.birthDate.toMRZ() +
      TravelDocument.generateMRZCheckDigit(this.birthDate.toMRZ()) +
      this.genderMarker.toMRZ() +
      this.validThru.toMRZ() +
      TravelDocument.generateMRZCheckDigit(this.validThru.toMRZ()) +
      this.optionalData.toMRZ();
  }
  get machineReadableZone() {
    return this.mrzLine1 +
    "\n" +
    this.mrzLine2;
  }

  // Constructor
  constructor(opt) {
    this.fullName = "Mann, Mister";
    this.optionalData = "";

    if (opt) {
      if (opt.typeCode) { this.typeCode = opt.typeCode; }
      if (opt.authorityCode) { this.authorityCode = opt.authorityCode; }
      if (opt.placeOfIssue) { this.placeOfIssue = opt.placeOfIssue; }
      if (opt.validFrom) { this.validFrom = opt.validFrom; }
      if (opt.validThru) { this.validThru = opt.validThru; }
      if (opt.numberOfEntries) { this.numberOfEntries = opt.numberOfEntries; }
      if (opt.number) { this.number = opt.number; }
      if (opt.visaType) { this.visaType = opt.visaType; }
      if (opt.additionalInfo) { this.additionalInfo = opt.additionalInfo; }
      if (opt.fullName) { this.fullName = opt.fullName; }
      if (opt.passportNumber) { this.passportNumber = opt.passportNumber; }
      if (opt.usePassportInMRZ) { this.usePassportInMRZ = opt.usePassportInMRZ; }
      if (opt.nationalityCode) { this.nationalityCode = opt.nationalityCode; }
      if (opt.birthDate) { this.birthDate = opt.birthDate; }
      if (opt.genderMarker) { this.genderMarker = opt.genderMarker; }
      if (opt.optionalData) { this.optionalData = opt.optionalData; }
      if (opt.picture) { this.picture = opt.picture; }
      if (opt.signature) { this.signature = opt.signature; }
    }
  }
}

export { MRVADocument };