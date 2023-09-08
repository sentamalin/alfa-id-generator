/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { TD1Document } from "./icao9303/TD1Document.js";
import { TravelDocument } from "./icao9303/TravelDocument.js";

class CrewID {
  /* This defines properties for an ICAO 9303 TD1-compliant crew ID */

  #document = new TD1Document();

  // General Text and Graphical Data (Forwards/Calls TD1Document)
  get typeCode() { return this.#document.typeCode; }
  get typeCodeVIZ() { return this.#document.typeCodeVIZ; }
  get typeCodeMRZ() { return this.#document.typeCodeMRZ; }
  set typeCode(value) { this.#document.typeCode = value; }
  get authorityCode() { return this.#document.authorityCode; }
  get authorityCodeVIZ() { return this.#document.authorityCodeVIZ; }
  get authorityCodeMRZ() { return this.#document.authorityCodeMRZ; }
  set authorityCode(value) { this.#document.authorityCode = value; }
  get number() { return this.#document.number; }
  get numberMRZ() { return this.#document.numberMRZ; }
  get numberVIZ() { return this.#document.numberVIZ; }
  set number(value) { this.#document.number = value; }
  get dateOfExpiration() { return this.#document.dateOfExpiration; }
  get dateOfExpirationMRZ() { return this.#document.dateOfExpirationMRZ; }
  get dateOfExpirationVIZ() { return this.#document.dateOfExpirationVIZ; }
  set dateOfExpiration(value) { this.#document.dateOfExpiration = value; }
  get fullName() { return this.#document.fullName; } // 30 characters
  get fullNameMRZ() { return this.#document.fullNameMRZ; }
  get fullNameVIZ() { return this.#document.fullNameVIZ; }
  set fullName(value) { this.#document.fullName = value; }
  get optionalData() { return this.#document.optionalData; } // 26 characters
  get optionalDataMRZ() { return this.#document.optionalDataMRZ; }
  set optionalData(value) { this.#document.optionalData = value; }
  get picture() { return this.#document.picture; }
  set picture(value) { this.#document.picture = value; }

  // CrewID Data
  #url;
  get url() { return this.#url; }
  set url(value) { this.#url = value; }

  #employer;
  get employer() { return this.#employer; }
  get employerVIZ() { return this.#employer.toUpperCase(); }
  set employer(value) { this.#employer = value; }

  // CrewID MRZ Getters
  get mrzLine1() { return this.#document.mrzLine1; }
  get mrzLine2() {
    let uncheckedLine = "<<<<<<0<" +
      this.dateOfExpirationMRZ +
      TravelDocument.generateMRZCheckDigit(this.dateOfExpirationMRZ) +
      "XXX" +
      this.optionalDataMRZ.slice(15);
    return uncheckedLine +
      TravelDocument.generateMRZCheckDigit(
        this.mrzLine1.slice(5) +
        uncheckedLine.slice(0,7) +
        uncheckedLine.slice(8,15) +
        uncheckedLine.slice(18)
      );
  }
  get mrzLine3() { return this.#document.mrzLine3; }
  get machineReadableZone() {
    return this.mrzLine1 +
      "\n" +
      this.mrzLine2 +
      "\n" +
      this.mrzLine3;
  }

  // Constructor
  constructor(opt) {
    if (opt) {
      if (opt.typeCode) { this.typeCode = opt.typeCode; }
      if (opt.authorityCode) { this.authorityCode = opt.authorityCode; }
      if (opt.number) { this.number = opt.number; }
      if (opt.dateOfExpiration) { this.dateOfExpiration = opt.dateOfExpiration; }
      if (opt.fullName) { this.fullName = opt.fullName; }
      if (opt.optionalData) { this.optionalData = opt.optionalData; }
      if (opt.picture) { this.picture = opt.picture; }
      if (opt.url) { this.url = opt.url; }
      if (opt.employer) { this.employer = opt.employer; }
    }
  }
}

export { CrewID }