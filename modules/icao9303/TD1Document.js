/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { TravelDocument } from "./TravelDocument.js";

class TD1Document {
  /* This defines common fields, properties, and methods for ICAO 9303 TD1
     travel documents (credit card) with machine-readable zone (MRZ). */

  #document = new TravelDocument();
  
  // General Text and Graphical Data (Forwards/Calls TravelDocument)
  get typeCode() { return this.#document.typeCode; }
  set typeCode(value) { this.#document.typeCode = value; }
  get authorityCode() { return this.#document.authorityCode; }
  set authorityCode(value) { this.#document.authorityCode = value; }
  get number() { return this.#document.number; }
  set number(value) { this.#document.number = value; }
  get dateOfBirth() { return this.#document.dateOfBirth; }
  set dateOfBirth(value) { this.#document.dateOfBirth = value; }
  get genderMarker() { return this.#document.genderMarker; }
  set genderMarker(value) { this.#document.genderMarker = value; }
  get dateOfExpiration() { return this.#document.dateOfExpiration; }
  set dateOfExpiration(value) { this.#document.dateOfExpiration = value; }
  get nationalityCode() { return this.#document.nationalityCode; }
  set nationalityCode(value) { this.#document.nationalityCode = value; }
  get fullName() { return this.#document.fullName; } // 30 characters
  set fullName(value) {
    this.#document.fullName = value;
    this.#document.fullName.toMRZ = function() {
      const length = 30;
      const normalized = TravelDocument.normalizeMRZString(this.replace(", ","<<"));
      if (normalized.length > length) {
        console.warn(
          `Optional data (optionalData) is longer than ${length} and will be truncated.`
        );
      }
      return TravelDocument.padMRZString(normalized.substring(0,length), length);
    }
  }
  get optionalData() { return this.#document.optionalData; } // 26 characters
  set optionalData(value) {
    this.#document.optionalData = value;
    this.#document.optionalData.toMRZ = function() {
      const length = 26;
      const normalized = TravelDocument.normalizeMRZString(this);
      if (normalized.length > length) {
        console.warn(
          `Optional data (optionalData) is longer than ${length} and will be truncated.`
        );
      }
      return TravelDocument.padMRZString(normalized.substring(0,length), length);
    }
  }
  get picture() { return this.#document.picture; }
  set picture(value) { this.#document.picture = value; }
  get signature() { return this.#document.signature; }
  set signature(value) { this.#document.signature = value; }

  // TD1 MRZ Getters
  get mrzLine1() {
    return this.typeCode.toMRZ() +
      this.authorityCode.toMRZ() +
      this.number.toMRZ() +
      TravelDocument.generateMRZCheckDigit(this.number.toMRZ()) +
      this.optionalData.toMRZ().slice(0,15);
  }
  get mrzLine2() {
    let uncheckedLine = this.dateOfBirth.toMRZ() +
      TravelDocument.generateMRZCheckDigit(this.dateOfBirth.toMRZ()) +
      this.genderMarker.toMRZ() +
      this.dateOfExpiration.toMRZ() +
      TravelDocument.generateMRZCheckDigit(this.dateOfExpiration.toMRZ()) +
      this.nationalityCode.toMRZ() +
      this.optionalData.toMRZ().slice(15);
    return uncheckedLine +
      TravelDocument.generateMRZCheckDigit(
        this.mrzLine1.slice(5) +
        uncheckedLine.slice(0,7) +
        uncheckedLine.slice(8,15) +
        uncheckedLine.slice(18)
      );
  }
  get mrzLine3() { return this.fullName.toMRZ(); }
  get machineReadableZone() {
    return this.mrzLine1 +
      "\n" +
      this.mrzLine2 +
      "\n" +
      this.mrzLine3; }

  // Constructor
  constructor(opt) {
    this.fullName = "Mann, Mister";
    this.optionalData = "";
    
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
    }
  }
}

export { TD1Document };