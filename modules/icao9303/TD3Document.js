/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { TravelDocument } from "./TravelDocument.js";

/** Stores properties and methods for TD3-sized machine-readable travel documents
 *  (MRTDs) with machine-readable zones. A machine-readable passport (MRP) is
 *  an example of this type of document.
 * 
 *  `TD3Document` may be used on its own or may be used to compose different
 *  kinds of MRTDs.
 * 
 * @mixes TravelDocument
 * @mixin
 */
class TD3Document {
  #document = new TravelDocument();

  /** A code identifying the document type.
   * @type { String }
   */
  get typeCode() { return this.#document.typeCode; }
  /** @param { string } value - A 1-2 character string consisting of the letters A-Z. */
  set typeCode(value) { this.#document.typeCode = value; }

  /** A code identifying the authority who issued this document.
   * @type { String }
   */
  get authorityCode() { return this.#document.authorityCode; }
  /** @param { string } value - A 3-character string consisting of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ. */
  set authorityCode(value) { this.#document.authorityCode = value; }

  /** The document holder's full name.
   * @type { String }
   */
  get fullName() { return this.#document.fullName; }
  /** @param { string } value - A ', ' separates the document holder's primary identifier from their secondary identifiers. A '/' separates the full name in a non-Latin national language from a transcription/transliteration into the Latin characters A-Z. */
  set fullName(value) {
    this.#document.fullName = value;
    this.#document.fullName.toMRZ = TD3Document.#fullNameToMRZ;
  }

  /** An identity document number unique for this document.
   * @type { String }
   */
  get number() { return this.#document.number; }
  /** @param { string } value - A string no longer than 9 characters consisting of the characters 0-9 and A-Z. */
  set number(value) { this.#document.number = value; }

  /** A code identifying the document holder's nationality (or lack thereof).
   * @type { String }
   */
  get nationalityCode() { return this.#document.nationalityCode; }
  /** @param { string } value - A 3-character string consisting of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ. */
  set nationalityCode(value) { this.#document.nationalityCode = value; }

  /** The document holder's date of birth.
   * @type { Date }
   */
  get birthDate() { return this.#document.birthDate; }
  /** @param { string } value - A calendar date string in YYYY-MM-DD format. */
  set birthDate(value) { this.#document.birthDate = value; }

  /** A marker representing the document holder's gender.
   * @type { String }
   */
  get genderMarker() { return this.#document.genderMarker; }
  /** @param { string } value - The character 'F', 'M', or 'X'. */
  set genderMarker(value) { this.#document.genderMarker = value; }

  /** The last date on which this document is valid.
   * @type { Date }
   */
  get expirationDate() { return this.#document.expirationDate; }
  /** @param { string } value - A calendar date string in YYYY-MM-DD format. */
  set expirationDate(value) { this.#document.expirationDate = value; }

  /** Optional data to include in the Machine-Readable Zone (MRZ).
   * @type { String }
   */
  get optionalData() { return this.#document.optionalData; }
  /** @param { string } value - Up to 14 characters. Valid characters are from the ranges 0-9 and A-Z. */
  set optionalData(value) {
    this.#document.optionalData = value;
    this.#document.optionalData.toMRZ = TD3Document.#optionalDataToMRZ;
  }

  /** A path/URL to an image, or an image object, representing a photo of the document holder.
   * @type { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame }
   */
  get picture() { return this.#document.picture; }
  /** @param { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame } value */
  set picture(value) { this.#document.picture = value; }

  /** A path/URL to an image, or an image object, representing the signature or usual mark of the document holder.
   * @type { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame }
   */
  get signature() { return this.#document.signature; }
  /** @param { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame } value */
  set signature(value) { this.#document.signature = value; }

  /** The first line of the Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get mrzLine1() {
    return this.typeCode.toMRZ() +
      this.authorityCode.toMRZ() +
      this.fullName.toMRZ();
  }
  /** @param { string } value - A MRZ line string of a 44-character length. */
  set mrzLine1(value) {
    if (value.length !== 44) {
      throw new RangeError(
        `Length '${value.length}' does not match the length of a TD3-sized Machine-Readable Zone (MRZ) line.`
      );
    }
    this.typeCode = value.slice(0, 2).replace(/</gi, "");
    this.authorityCode = value.slice(2, 5).replace(/</gi, "");
    this.fullName = value.slice(5).replace("<<", ", ").replace(/</gi, " ").trimEnd();
  }

  /** The second line of the Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get mrzLine2() {
    let optionalDataCheckDigit;
    optionalDataCheckDigit = TravelDocument.generateMRZCheckDigit(this.optionalData.toMRZ());
    let uncheckedLine = this.number.toMRZ() +
      TravelDocument.generateMRZCheckDigit(this.number.toMRZ()) +
      this.nationalityCode.toMRZ() +
      this.birthDate.toMRZ() +
      TravelDocument.generateMRZCheckDigit(this.birthDate.toMRZ()) +
      this.genderMarker.toMRZ() +
      this.expirationDate.toMRZ() +
      TravelDocument.generateMRZCheckDigit(this.expirationDate.toMRZ()) +
      this.optionalData.toMRZ() +
      ((optionalDataCheckDigit === "0") && (`${this.optionalData.trimStart().trimEnd()}` === "") ? "<" : optionalDataCheckDigit);
    return uncheckedLine +
      TravelDocument.generateMRZCheckDigit(
        uncheckedLine.slice(0,10) +
        uncheckedLine.slice(13,20) +
        uncheckedLine.slice(21)
      );
  }
  /** @param { string } value - A MRZ line string of a 44-character length. */
  set mrzLine2(value) {
    if (value.length !== 44) {
      throw new RangeError(
        `Length '${value.length}' does not match the length of a TD3-sized Machine-Readable Zone (MRZ) line.`
      );
    }
    const lineCheckDigit = TravelDocument.generateMRZCheckDigit(
      value.slice(0, 10) +
      value.slice(13, 20) +
      value.slice(21, 43)
    );
    if (value[43] !== lineCheckDigit) {
      throw new EvalError(
        `Check digit '${value[43]}' does not match for the check digit on the entire Machine-Readable Zone (MRZ) line 2.`
      );
    }
    if (value[9] !== TravelDocument.generateMRZCheckDigit(value.slice(0, 9))) {
      throw new EvalError(
        `Check digit '${value[9]}' does not match for the check digit on the document number.`
      );
    }
    if (value[19] !== TravelDocument.generateMRZCheckDigit(value.slice(13, 19))) {
      throw new EvalError(
        `Check digit '${value[19]}' does not match for the check digit on the date of birth.`
      );
    }
    if (value[27] !== TravelDocument.generateMRZCheckDigit(value.slice(21, 27))) {
      throw new EvalError(
        `Check digit '${value[27]}' does not match for the check digit on the date of expiration.`
      );
    }
    if ((value[42] === "<" ? "0" : value[42]) !== TravelDocument.generateMRZCheckDigit(value.slice(28, 42))) {
      throw new EvalError(
        `Check digit '${value[42]}' does not match for the check digit on the optional data.`
      );
    }
    this.number = value.slice(0, 9).replace(/</gi, "");
    this.nationalityCode = value.slice(10, 13).replace(/</gi, "");
    this.birthDate = `${TravelDocument.getFullYear(value.slice(13, 15))}-${value.slice(15, 17)}-${value.slice(17, 19)}`;
    this.genderMarker = value[20] === "<" ? "X" : value[20];
    this.expirationDate = `${TravelDocument.getFullYear(value.slice(21, 23))}-${value.slice(23, 25)}-${value.slice(25, 27)}`;
    this.optionalData = value.slice(28, 42).replace(/</gi, " ").trimEnd();
  }

  /** The full Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get machineReadableZone() {
    return this.mrzLine1 + this.mrzLine2;
  }
  /** @param { string } value - A MRZ string of a 88-character length. */
  set machineReadableZone(value) {
    if (value.length !== 88) {
      throw new RangeError(
        `Length '${value.length} does not match the length of a TD3-sized Machine-Readable Zone (MRZ).`
      );
    }
    this.mrzLine1 = value.slice(0, 44);
    this.mrzLine2 = value.slice(44);
  }

  /* Functions to be assigned to properties `toMRZ` and `toVIZ` when set. */
  static #fullNameToMRZ = function() {
    return TravelDocument.fullNameMRZ(this, 39);
  }
  static #optionalDataToMRZ = function() {
    return TravelDocument.optionalDataMRZ(this, 14);
  }

  /** Create a new `TD3Document`.
   * @param { Object } [opt] - An options object.
   * @param { string } [opt.typeCode] - A 1-2 character string consisting of the letters A-Z.
   * @param { string } [opt.authorityCode] - A 3-character string consisting of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   * @param { string } [opt.fullName] - A ', ' separates the document holder's primary identifier from their secondary identifiers. A '/' separates the full name in a non-Latin national language from a transcription/transliteration into the Latin characters A-Z.
   * @param { string } [opt.number] - A string no longer than 9 characters consisting of the characters 0-9 and A-Z.
   * @param { string } [opt.nationalityCode] - A 3-character string consisting of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   * @param { string } [opt.birthDate] - A calendar date string in YYYY-MM-DD format.
   * @param { string } [opt.genderMarker] - The character 'F', 'M', or 'X'.
   * @param { string } [opt.expirationDate] - A calendar date string in YYYY-MM-DD format.
   * @param { string } [opt.optionalData] - Up to 14 characters. Valid characters are from the ranges 0-9 and A-Z.
   * @param { string } [opt.mrzLine1] - A MRZ line string of a 44-character length.
   * @param { string } [opt.mrzLine2] - A MRZ line string of a 44-character length.
   * @param { string } [opt.machineReadableZone] - A MRZ string of a 88-character length.
   * @param { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame } [opt.picture] - A path/URL to an image, or an image object, representing a photo of the document holder.
   * @param { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame } [opt.signature] - A path/URL to an image, or an image object, representing the signature or usual mark of the document holder.
   */
  constructor(opt) {
    this.fullName = "Mann, Mister";
    this.optionalData = "";
    
    if (opt) {
      if (opt.typeCode) { this.typeCode = opt.typeCode; }
      if (opt.authorityCode) { this.authorityCode = opt.authorityCode; }
      if (opt.fullName) { this.fullName = opt.fullName; }
      if (opt.number) { this.number = opt.number; }
      if (opt.nationalityCode) { this.nationalityCode = opt.nationalityCode; }
      if (opt.birthDate) { this.birthDate = opt.birthDate; }
      if (opt.genderMarker) { this.genderMarker = opt.genderMarker; }
      if (opt.expirationDate) { this.expirationDate = opt.expirationDate; }
      if (opt.optionalData) { this.optionalData = opt.optionalData; }
      if (opt.mrzLine1) { this.mrzLine1 = opt.mrzLine1; }
      if (opt.mrzLine2) { this.mrzLine2 = opt.mrzLine2; }
      if (opt.machineReadableZone) { this.machineReadableZone = opt.machineReadableZone; }
      if (opt.picture) { this.picture = opt.picture; }
      if (opt.signature) { this.signature = opt.signature; }
    }
  }
}

export { TD3Document };