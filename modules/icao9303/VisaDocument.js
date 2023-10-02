/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { TravelDocument } from "./TravelDocument.js";

/** Stores properties specific to machine-readable visa documents.
 * 
 *  `VisaDocument` is intended to be used to compose different kinds
 *  of machine-readable visa documents and not intended to be used directly.
 * 
 * @interface
 * @mixin
 */
class VisaDocument {
  /** A code identifying the visa type.
   * @type { String }
   * @abstract
   */
  get typeCode() {
    throw new TypeError(
      "VisaDocument.typeCode must be implemented by a subclass."
    );
  }
  /**
   * @param { string } value - A 1-2 character string consisting of the letters A-Z.
   * @abstract
   */
  set typeCode(value) {
    throw new TypeError(
      "VisaDocument.typeCode must be implemented by a subclass."
    );
  }

  /** A code identifying the authority who issued this visa.
   * @type { String }
   * @abstract
   */
  get authorityCode() {
    throw new TypeError(
      "VisaDocument.authorityCode must be implemented by a subclass."
    );
  }
  /**
   * @param { string } value - A 3-character string consisting of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   * @abstract
   */
  set authorityCode(value) {
    throw new TypeError(
      "VisaDocument.authorityCode must be implemented by a subclass."
    );
  }

  /** An identity document number unique for this visa.
   * @type { String }
   * @abstract
   */
  get number() {
    throw new TypeError(
      "VisaDocument.number must be implemented by a subclass."
    );
  }
  /**
   * @param { string } value - A string no longer than 9 characters consisting of the characters 0-9 and A-Z.
   * @abstract
   */
  set number(value) {
    throw new TypeError(
      "VisaDocument.number must be implemented by a subclass."
    );
  }

  /** The visa holder's full name.
   * @type { String }
   * @abstract
   */
  get fullName() {
    throw new TypeError(
      "VisaDocument.fullName must be implemented by a subclass."
    );
  }
  /**
   * @param { string } value - A ', ' separates the visa holder's primary identifier from their secondary identifiers. A '/' separates the full name in a non-Latin national language from a transcription/transliteration into the Latin characters A-Z.
   * @abstract
   */
  set fullName(value) {
    throw new TypeError(
      "VisaDocument.fullName must be implemented by a subclass."
    );
  }

  /** A code identifying the visa holder's nationality (or lack thereof).
   * @type { String }
   * @abstract
   */
  get nationalityCode() {
    throw new TypeError(
      "VisaDocument.nationalityCode must be implemented by a subclass."
    );
  }
  /**
   * @param { string } value - A 3-character string consisting of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   * @abstract
   */
  set nationalityCode(value) {
    throw new TypeError(
      "VisaDocument.nationalityCode must be implemented by a subclass."
    );
  }

  /** The visa holder's date of birth.
   * @type { Date }
   * @abstract
   */
  get birthDate() {
    throw new TypeError(
      "VisaDocument.birthDate must be implemented by a subclass."
    );
  }
  /**
   * @param { string } value - A calendar date string in YYYY-MM-DD format.
   * @abstract
   */
  set birthDate(value) {
    throw new TypeError(
      "VisaDocument.birthDate must be implemented by a subclass."
    );
  }

  /** A marker representing the visa holder's gender.
   * @type { String }
   * @abstract
   */
  get genderMarker() {
    throw new TypeError(
      "VisaDocument.genderMarker must be implemented by a subclass."
    );
  }
  /**
   * @param { string } value - The character 'F', 'M', or 'X'.
   * @abstract
   */
  set genderMarker(value) {
    throw new TypeError(
      "VisaDocument.genderMarker must be implemented by a subclass."
    );
  }

  /** The last date on which this visa is valid.
   * @type { Date }
   * @abstract
   */
  get validThru() {
    throw new TypeError(
      "VisaDocument.validThru must be implemented by a subclass."
    );
  }
  /**
   * @param { string } value - A calendar date string in YYYY-MM-DD format.
   * @abstract
   */
  set validThru(value) {
    throw new TypeError(
      "VisaDocument.validThru must be implemented by a subclass."
    );
  }

  /** Optional data to include in the Machine-Readable Zone (MRZ).
   * @type { String }
   * @abstract
   */
  get optionalData() {
    throw new TypeError(
      "VisaDocument.optionalData must be implemented by a subclass."
    );
  }
  /**
   * @param { string } value - Valid characters are from the ranges 0-9 and A-Z.
   * @abstract
   */
  set optionalData(value) {
    throw new TypeError(
      "VisaDocument.optionalData must be implemented by a subclass."
    );
  }

  /** A path/URL to an image, or an image object, representing a photo of the visa holder or an image from the issuing authority.
   * @type { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame }
   * @abstract
   */
  get picture() {
    throw new TypeError(
      "VisaDocument.picture must be implemented by a subclass."
    );
  }
  /**
   * @param { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame } value
   * @abstract
   */
  set picture(value) {
    throw new TypeError(
      "VisaDocument.picture must be implemented by a subclass."
    );
  }

  /** A path/URL to an image, or an image object, representing the signature or usual mark of the visa issuer.
   * @type { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame }
   * @abstract
   */
  get signature() {
    throw new TypeError(
      "VisaDocument.signature must be implemented by a subclass."
    );
  }
  /**
   * @param { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame } value
   * @abstract
   */
  set signature(value) {
    throw new TypeError(
      "VisaDocument.signature must be implemented by a subclass."
    );
  }

  #placeOfIssue;
  /** Location where the visa was issued.
   * @type { String }
   */
  get placeOfIssue() { return this.#placeOfIssue; }
  /** @param { string } value */
  set placeOfIssue(value) {
    this.#placeOfIssue = new String(value);
    this.#placeOfIssue.toVIZ = VisaDocument.#setThisToUppercase;
  }
  
  #validFrom;
  /** Starting date on which the visa is valid.
   * @type { Date }
   */
  get validFrom() { return this.#validFrom; }
  /** @param { string } value - A calendar date string in YYYY-MM-DD format. */
  set validFrom(value) {
    let test = new Date(`${value}T00:00:00`);
    if (test.toString() === "Invalid Date") {
      throw new TypeError(
        "Valid From (validFrom) must be a valid date string."
      );
    } else {
      this.#validFrom = test;
      this.#validFrom.toVIZ = VisaDocument.#validFromToVIZ;
    }
  }

  #numberOfEntries;
  /** Maximum number of entries this visa allows.
   * @type { String }
   */
  get numberOfEntries() { return this.#numberOfEntries; }
  /** @param { string | number } value - 0 or any string denotes an unlimited number of entries. */
  set numberOfEntries(value) {
    this.#numberOfEntries = new String(value);
    this.#numberOfEntries.toVIZ = VisaDocument.#setThisToUppercase;
  }

  #visaType;
  /** The textual type/name/description for this visa.
   * @type { String }
  */
  get visaType() { return this.#visaType; }
  /** @param { string } value */
  set visaType(value) {
    this.#visaType = new String(value);
    this.#visaType.toVIZ = VisaDocument.#setThisToUppercase;
  }

  #additionalInfo;
  /** Additional textual information to include with this visa.
   * @type { String }
   */
  get additionalInfo() { return this.#additionalInfo; }
  /** @param { string } value */
  set additionalInfo(value) {
    this.#additionalInfo = new String(value);
    this.#additionalInfo.toVIZ = VisaDocument.#setThisToUppercase;
  }

  #passportNumber;
  /** The identity document number for which this visa is issued.
   * @type { String }
   */
  get passportNumber() { return this.#passportNumber; }
  /** @param { string } value - A string no longer than 9 characters consisting of the characters 0-9 and A-Z. */
  set passportNumber(value) {
    if (value.toString().length > 9) {
      throw new RangeError(
        "Passport number (passportNumber) must be no more than 9 characters."
      );
    } else {
      this.#passportNumber = new String(value.toString());
      this.#passportNumber.toMRZ = VisaDocument.#passportNumberToMRZ;
      this.#passportNumber.toVIZ = VisaDocument.#setThisToUppercase;
    }
  }

  /** Use `this.passportNumber` instead of `this.number` in the Machine-Readable Zone (MRZ).
   * @type { boolean }
   */
  usePassportInMRZ;

  /** The full Machine-Readable Zone (MRZ).
   * @type { string }
   * @abstract
   */
  get machineReadableZone() {
    throw new TypeError(
      "VisaDocument.machineReadableZone must be implemented by a subclass."
    );
  }
  /**
   * @param { string } value - A MRZ string of a full Machine-Readable Zone (MRZ).
   * @abstract
   */
  set machineReadableZone(value) {
    throw new TypeError(
      "VisaDocument.machineReadableZone must be implemented by a subclass."
    );
  }

  /* Functions to be assigned to properties `toMRZ` and `toVIZ` when set. */
  static #setThisToUppercase = function() {
    return this.toUpperCase();
  }
  static #passportNumberToMRZ = function() {
    return TravelDocument.padMRZString(this, 9);
  }
  static #validFromToVIZ = function() {
    return TravelDocument.dateToVIZ(this);
  }

  /** Create a new VisaDocument.
   * @param { Object } [opt] - An options object.
   * @param { string } [opt.typeCode] - A 1-2 character string consisting of the letters A-Z.
   * @param { string } [opt.authorityCode] - A 3-character string consisting of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   * @param { string } [opt.number] - A string no longer than 9 characters consisting of the characters 0-9 and A-Z.
   * @param { string } [opt.fullName] - A ', ' separates the visa holder's primary identifier from their secondary identifiers. A '/' separates the full name in a non-Latin national language from a transcription/transliteration into the Latin characters A-Z.
   * @param { string } [opt.nationalityCode] - A 3-character string consisting of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   * @param { string } [opt.birthDate] - A calendar date string in YYYY-MM-DD format.
   * @param { string } [opt.genderMarker] - The character 'F', 'M', or 'X'.
   * @param { string } [opt.validThru] - A calendar date string in YYYY-MM-DD format.
   * @param { string } [opt.optionalData] - Valid characters are from the ranges 0-9 and A-Z.
   * @param { string } [opt.machineReadableZone] - A MRZ string of a full Machine-Readable Zone (MRZ).
   * @param { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame } [opt.picture] - A path/URL to an image, or an image object, representing a photo of the visa holder or an image from the issuing authority.
   * @param { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame } [opt.signature] - A path/URL to an image, or an image object, representing the signature or usual mark of the visa issuer.
   * @param { string } [opt.placeOfIssue] - Location where the visa was issued.
   * @param { string } [opt.validFrom] - A calendar date string in YYYY-MM-DD format.
   * @param { string | number } [opt.numberOfEntries] - 0 or any string denotes an unlimited number of entries.
   * @param { string } [opt.visaType] - A type/name/description for this visa.
   * @param { string } [opt.additionalInfo] - Additional textual information.
   * @param { string } [opt.passportNumber] - A string no longer than 9 characters consisting of the characters 0-9 and A-Z.
   * @param { boolean } [opt.usePassportInMRZ] - Use `this.passportNumber` instead of `this.number` in the Machine-Readable Zone (MRZ).
   */
  constructor(opt) {
    this.placeOfIssue = "Zenith, UTO";
    this.validFrom = "2023-09-29";
    this.numberOfEntries = "Multiple";
    this.visaType = "Participant";
    this.additionalInfo = "None";
    this.passportNumber = "111222333";

    if (opt) {
      if (opt.typeCode) { this.typeCode = opt.typeCode; }
      if (opt.authorityCode) { this.authorityCode = opt.authorityCode; }
      if (opt.number) { this.number = opt.number; }
      if (opt.fullName) { this.fullName = opt.fullName; }
      if (opt.nationalityCode) { this.nationalityCode = opt.nationalityCode; }
      if (opt.birthDate) { this.birthDate = opt.birthDate; }
      if (opt.genderMarker) { this.genderMarker = opt.genderMarker; }
      if (opt.validThru) { this.validThru = opt.validThru; }
      if (opt.optionalData) { this.optionalData = opt.optionalData; }
      if (opt.machineReadableZone) { this.machineReadableZone = opt.machineReadableZone; }
      if (opt.picture) { this.picture = opt.picture; }
      if (opt.signature) { this.signature = opt.signature; }
      if (opt.placeOfIssue) { this.placeOfIssue = opt.placeOfIssue; }
      if (opt.validFrom) { this.validFrom = opt.validFrom; }
      if (opt.numberOfEntries) { this.numberOfEntries = opt.numberOfEntries; }
      if (opt.visaType) { this.visaType = opt.visaType; }
      if (opt.additionalInfo) { this.additionalInfo = opt.additionalInfo; }
      if (opt.passportNumber) { this.passportNumber = opt.passportNumber; }
      if (opt.usePassportInMRZ) { this.usePassportInMRZ = opt.usePassportInMRZ; }
    }
  }
}

export { VisaDocument };