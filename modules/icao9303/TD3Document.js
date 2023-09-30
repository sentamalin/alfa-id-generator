/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { TravelDocument } from "./TravelDocument.js";

class TD3Document {
  /* This defines common fields, properties, and methods for ICAO 9303 TD3
     travel documents (full passport page) with machine-readable zone (MRZ). */
  
  #document = new TravelDocument();

  // General Text and Graphical Data (Forwards/Calls TravelDocument)
  get typeCode() { return this.#document.typeCode; }
  set typeCode(value) { this.#document.typeCode = value; }
  get authorityCode() { return this.#document.authorityCode; }
  set authorityCode(value) { this.#document.authorityCode = value; }
  get fullName() { return this.#document.fullName; } // 39 characters
  set fullName(value) {
    this.#document.fullName = value;
    this.#document.fullName.toMRZ = function() {
      const length = 39;
      const normalized = TravelDocument.normalizeMRZString(this.replace(", ","<<"));
      if (normalized.length > length) {
        console.warn(
          `Full name (fullName) is longer than ${length} and will be truncated.`
        );
      }
      return TravelDocument.padMRZString(normalized.substring(0,length), length);
    }
  }
  get number() { return this.#document.number; }
  set number(value) { this.#document.number = value; }
  get nationalityCode() { return this.#document.nationalityCode; }
  set nationalityCode(value) { this.#document.nationalityCode = value; }
  get birthDate() { return this.#document.birthDate; }
  set birthDate(value) { this.#document.birthDate = value; }
  get genderMarker() { return this.#document.genderMarker; }
  set genderMarker(value) { this.#document.genderMarker = value; }
  get expirationDate() { return this.#document.expirationDate; }
  set expirationDate(value) { this.#document.expirationDate = value; }
  get optionalData() { return this.#document.optionalData; } // 14 characters
  set optionalData(value) {
    this.#document.optionalData = value;
    this.#document.optionalData.toMRZ = function() {
      const length = 14;
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

  // TD3 MRZ Getters
  get mrzLine1() {
    return this.typeCode.toMRZ() +
      this.authorityCode.toMRZ() +
      this.fullName.toMRZ();
  }
  get mrzLine2() {
    let optionalDataCheckDigit;
    if (`${this.optionalData}` === "") { optionalDataCheckDigit = "<"; }
    else { optionalDataCheckDigit = TravelDocument.generateMRZCheckDigit(this.optionalData.toMRZ()); }
    let uncheckedLine = this.number.toMRZ() +
      TravelDocument.generateMRZCheckDigit(this.number.toMRZ()) +
      this.nationalityCode.toMRZ() +
      this.birthDate.toMRZ() +
      TravelDocument.generateMRZCheckDigit(this.birthDate.toMRZ()) +
      this.genderMarker.toMRZ() +
      this.expirationDate.toMRZ() +
      TravelDocument.generateMRZCheckDigit(this.expirationDate.toMRZ()) +
      this.optionalData.toMRZ() +
      optionalDataCheckDigit;
    return uncheckedLine +
      TravelDocument.generateMRZCheckDigit(
        uncheckedLine.slice(0,10) +
        uncheckedLine.slice(13,20) +
        uncheckedLine.slice(21)
      );
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
      if (opt.fullName) { this.fullName = opt.fullName; }
      if (opt.number) { this.number = opt.number; }
      if (opt.nationalityCode) { this.nationalityCode = opt.nationalityCode; }
      if (opt.dateOfBirth) { this.birthDate = opt.dateOfBirth; }
      if (opt.genderMarker) { this.genderMarker = opt.genderMarker; }
      if (opt.dateOfExpiration) { this.expirationDate = opt.dateOfExpiration; }
      if (opt.optionalData) { this.optionalData = opt.optionalData; }
      if (opt.picture) { this.picture = opt.picture; }
      if (opt.signature) { this.signature = opt.signature; }
    }
  }
}

export { TD3Document };