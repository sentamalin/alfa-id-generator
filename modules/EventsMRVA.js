/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { MRVADocument } from "./icao9303/MRVADocument.js";

class EventsMRVA {
  /* This defines properties for an Events Visa (MRV-A) */

  #document = new MRVADocument();
  
  // General Text and Graphical Data (Forwards/Calls TD3Document)
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
  get fullName() { return this.#document.fullName; }
  get fullNameMRZ() { return this.#document.fullNameMRZ; }
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
  get validThru() { return this.#document.validThru; }
  get validThruMRZ() { return this.#document.validThruMRZ; }
  get validThruVIZ() { return this.#document.validThruVIZ; }
  set validThru(value) { this.#document.validThru = value; }
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
  set numberOfEntries(value) { this.#document.numberOfEntries = value; }
  get type() { return this.#document.type; }
  get typeVIZ() { return this.#document.typeVIZ; }
  set type(value) { this.#document.type = value; }
  get additionalInfo() { return this.#document.additionalInfo; }
  get additionalInfoVIZ() { return this.#document.additionalInfoVIZ; }
  set additionalInfo(value) { this.#document.additionalInfo = value; }
  get passportNumber() { return this.#document.passportNumber; }
  get passportNumberMRZ() { return this.#document.passportNumberMRZ; }
  get passportNumberVIZ() { return this.#document.passportNumberVIZ; }
  set passportNumber(value) { this.#document.passportNumber = value; }
  get usePassportInMRZ() { return this.#document.usePassportInMRZ; }
  set usePassportInMRZ(value) { this.#document.usePassportInMRZ = value; }

  // EventsMRVA-specific data
  #url;
  get url() { return this.#url; }
  set url(value) { this.#url = value; this.qrCode = value; }

  // TD3Document MRZ Getters
  get mrzLine1() { return this.#document.mrzLine1; }
  get mrzLine2() { return this.#document.mrzLine2; }
  get machineReadableZone() { return this.#document.machineReadableZone; }

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
    }
  }
}

export { EventsMRVA };