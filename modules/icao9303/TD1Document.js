/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { TravelDocument } from "./TravelDocument.js";

/** Stores properties and methods for TD1-sized machine-readable travel documents
 *     (MRTDs) with machine-readable zones. The US Passport Card is an example
 *     of this type of document.
 * 
 *     `TD1Document` may be used on its own or may be used to compose different
 *     kinds of MRTDs.
 * 
 * @mixes TravelDocument
 * @mixin
 */
class TD1Document {
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

  /** An identity document number unique for this document.
   * @type { String }
   */
  get number() { return this.#document.number; }
  /** @param { string } value - A string no longer than 9 characters consisting of the characters 0-9 and A-Z. */
  set number(value) { this.#document.number = value; }

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

  /** A code identifying the document holder's nationality (or lack thereof).
   * @type { String }
   */
  get nationalityCode() { return this.#document.nationalityCode; }
  /** @param { string } value - A 3-character string consisting of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ. */
  set nationalityCode(value) { this.#document.nationalityCode = value; }

  /** The document holder's full name.
   * @type { String }
   */
  get fullName() { return this.#document.fullName; }
  /** @param { string } value - The document holder's full name. A ', ' separates the document holder's primary identifier from their secondary identifiers. A '/' separates the full name in a non-Latin national language from a transcription/transliteration into the Latin characters A-Z. */
  set fullName(value) {
    this.#document.fullName = value;
    this.#document.fullName.toMRZ = function() {
      return TravelDocument.fullNameMRZ(this, 30);
    }
  }

  /** Optional data to include in the Machine-Readable Zone (MRZ).
   * @type { String }
   */
  get optionalData() { return this.#document.optionalData; }
  /** @param { string } value - Up to 26 characters to include in the Machine-Readable Zone (MRZ). Valid characters are from the ranges 0-9 and A-Z. */
  set optionalData(value) {
    this.#document.optionalData = value;
    this.#document.optionalData.toMRZ = function() {
      return TravelDocument.optionalDataMRZ(this, 26);
    }
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
      this.number.toMRZ() +
      TravelDocument.generateMRZCheckDigit(this.number.toMRZ()) +
      this.optionalData.toMRZ().slice(0,15);
  }

  /** The second line of the Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get mrzLine2() {
    let uncheckedLine = this.birthDate.toMRZ() +
      TravelDocument.generateMRZCheckDigit(this.birthDate.toMRZ()) +
      this.genderMarker.toMRZ() +
      this.expirationDate.toMRZ() +
      TravelDocument.generateMRZCheckDigit(this.expirationDate.toMRZ()) +
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

  /** The third line of the Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get mrzLine3() { return this.fullName.toMRZ(); }

  /** The full Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get machineReadableZone() {
    return this.mrzLine1 + this.mrzLine2 + this.mrzLine3;
  }

  /** Create a new TD1Document.
   * @param { Object } [opt] - An options object.
   * @param { string } [opt.typeCode] - A 1-2 character string consisting of the letters A-Z.
   * @param { string } [opt.authorityCode] - A 3-character string consisting of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   * @param { string } [opt.number] - A string no longer than 9 characters consisting of the characters 0-9 and A-Z.
   * @param { string } [opt.birthDate] - A calendar date string in YYYY-MM-DD format.
   * @param { string } [opt.genderMarker] - The character 'F', 'M', or 'X'.
   * @param { string } [opt.expirationDate] - A calendar date string in YYYY-MM-DD format.
   * @param { string } [opt.nationalityCode] - A 3-character string consisting of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   * @param { string } [opt.fullName] - The document holder's full name. A ', ' separates the document holder's primary identifier from their secondary identifiers. A '/' separates the full name in a non-Latin national language from a transcription/transliteration into the Latin characters A-Z.
   * @param { string } [opt.optionalData] - Optional data to include in the Machine-Readable Zone (MRZ). Valid characters are from the ranges 0-9 and A-Z.
   * @param { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame } [opt.picture] - A path/URL to an image, or an image object, representing a photo of the document holder.
   * @param { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame } [opt.signature] - A path/URL to an image, or an image object, representing the signature or usual mark of the document holder.
   */
  constructor(opt) {
    this.fullName = "Mann, Mister";
    this.optionalData = "";
    
    if (opt) {
      if (opt.typeCode) { this.typeCode = opt.typeCode; }
      if (opt.authorityCode) { this.authorityCode = opt.authorityCode; }
      if (opt.number) { this.number = opt.number; }
      if (opt.birthDate) { this.birthDate = opt.birthDate; }
      if (opt.genderMarker) { this.genderMarker = opt.genderMarker; }
      if (opt.expirationDate) { this.expirationDate = opt.expirationDate; }
      if (opt.nationalityCode) { this.nationalityCode = opt.nationalityCode; }
      if (opt.fullName) { this.fullName = opt.fullName; }
      if (opt.optionalData) { this.optionalData = opt.optionalData; }
      if (opt.picture) { this.picture = opt.picture; }
      if (opt.signature) { this.signature = opt.signature; }
    }
  }
}

export { TD1Document };