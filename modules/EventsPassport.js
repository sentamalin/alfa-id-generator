/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { TD1Document } from "./icao9303/TD1Document.js";
import { TravelDocument } from "./icao9303/TravelDocument.js";

class CrewCertificate {
  /* This defines properties for an ICAO 9303 TD1-compliant Crewmember Certificate */

  #document = new TD1Document();
  
  // General Text and Graphical Data (Forwards/Calls TD1Document)
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
  get dateOfBirth() { return this.#document.dateOfBirth; }
  get dateOfBirthMRZ() { return this.#document.dateOfBirthMRZ; }
  get dateOfBirthVIZ() { return this.#document.dateOfBirthVIZ; }
  set dateOfBirth(value) { this.#document.dateOfBirth = value; }
  get genderMarker() { return this.#document.genderMarker; }
  get genderMarkerMRZ() { return this.#document.genderMarkerMRZ; }
  get genderMarkerVIZ() { return this.#document.genderMarkerVIZ; }
  set genderMarker(value) { this.#document.genderMarker = value; }
  get dateOfExpiration() { return this.#document.dateOfExpiration; }
  get dateOfExpirationMRZ() { return this.#document.dateOfExpirationMRZ; }
  get dateOfExpirationVIZ() { return this.#document.dateOfExpirationVIZ; }
  set dateOfExpiration(value) { this.#document.dateOfExpiration = value; }
  get nationalityCode() { return this.#document.nationalityCode; }
  get nationalityCodeMRZ() { return this.#document.nationalityCodeMRZ; }
  get nationalityCodeVIZ() { return this.#document.nationalityCodeVIZ; }
  set nationalityCode(value) { this.#document.nationalityCode = value; }
  get fullName() { return this.#document.fullName; }
  get fullNameMRZ() { return this.#document.fullNameMRZ; }
  get fullNameVIZ() { return this.#document.fullNameVIZ; }
  set fullName(value) { this.#document.fullName = value; }
  get optionalData() { return this.#document.optionalData; }
  get optionalDataMRZ() { return this.#document.optionalDataMRZ; }
  set optionalData(value) { this.#document.optionalData = value; }
  get picture() { return this.#document.picture; }
  set picture(value) { this.#document.picture = value; }
  get signature() { return this.#document.signature; }
  set signature(value) { this.#document.signature = value; }

  // CrewCertificate Data
  #url;
  get url() { return this.#url; }
  set url(value) { this.#url = value; this.qrCode = value; }
  
  #employer;
  get employer() { return this.#employer; }
  get employerVIZ() { return this.#employer.toUpperCase(); }
  set employer(value) { this.#employer = value; }

  #occupation;
  get occupation() { return this.#occupation; }
  get occupationVIZ() { return this.#occupation.toUpperCase(); }
  set occupation(value) { this.#occupation = value; }

  #declaration;
  get declaration() { return this.#declaration; }
  get declarationVIZ() { return this.#declaration.toUpperCase(); }
  set declaration(value) { this.#declaration = value; }

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
    else { this.#dateOfIssue = test; }
  }

  #placeOfIssue;
  get placeOfIssue() { return this.#placeOfIssue; }
  get placeOfIssueVIZ() { return this.#placeOfIssue.toUpperCase(); }
  set placeOfIssue(value) { this.#placeOfIssue = value; }

  // CrewCertificate MRZ Getters
  get mrzLine1() { return this.#document.mrzLine1; }
  get mrzLine2() { return this.#document.mrzLine2; }
  get mrzLine3() { return this.#document.fullNameMRZ; }
  get machineReadableZone() { return this.#document.machineReadableZone; }

  // Constructor
  constructor(opt) {
    if (opt) {
      if (opt.typeCode) { this.typeCode = opt.typeCode; }
      if (opt.authorityCode) { this.authorityCode = opt.authorityCode; }
      if (opt.number) { this.number = opt.number; }
      if (opt.dateOfBirth) { this.dateOfBirth = opt.dateOfBirth; }
      if (opt.genderMarker) { this.genderMarker = opt.genderMarker; }
      if (opt.dateOfExpiration) { this.dateOfExpiration = opt.dateOfExpiration; }
      if (opt.nationalityCode) { this.nationalityCode = opt.nationalityCode; }
      if (opt.fullName) { this.fullName = opt.fullName; }
      if (opt.optionalData) { this.optionalData = opt.optionalData; }
      if (opt.picture) { this.picture = opt.picture; }
      if (opt.signature) { this.signature = opt.signature; }
      if (opt.qrCode) { this.qrCode = opt.qrCode; }
      if (opt.url) { this.url = opt.url; }
      if (opt.employer) { this.employer = opt.employer; }
      if (opt.occupation) { this.occupation = opt.occupation; }
      if (opt.declaration) { this.declaration = opt.declaration; }
      if (opt.dateOfIssue) { this.dateOfIssue = opt.dateOfIssue; }
      if (opt.placeOfIssue) { this.placeOfIssue = opt.placeOfIssue; }
    }
  }
}

export { CrewCertificate };