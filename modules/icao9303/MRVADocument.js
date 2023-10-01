/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { TravelDocument } from "./TravelDocument.js";
import { VisaDocument } from "./VisaDocument.js";

/** Stores properties and methods for machine-readable visas (MRV-A) with
 *     machine-readable zones. These visas are used when additional information
 *     is placed on the visa sticker and clear zones along the visa sticker is
 *     unnecessary for the passport page.
 * 
 *     `MRVADocument` may be used on its own or may be used to compose different
 *     kinds of MRTDs.
 * 
 * @mixes TravelDocument
 * @mixes VisaDocument
 * @mixin
 */
class MRVADocument {
  #document = new TravelDocument();
  #visa = new VisaDocument();
  
  /** A code identifying the visa type.
   * @type { String }
   */
  get typeCode() { return this.#document.typeCode; }
  /** @param { string } value - A 1-2 character string consisting of the letters A-Z. */
  set typeCode(value) { this.#document.typeCode = value; }

  /** A code identifying the authority who issued this visa.
   * @type { String }
   */
  get authorityCode() { return this.#document.authorityCode; }
  /** @param { string } value - A 3-character string consisting of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ. */
  set authorityCode(value) { this.#document.authorityCode = value; }

  /** An identity document number unique for this visa.
   * @type { String }
   */
  get number() { return this.#document.number; }
  /** @param { string } value - A string no longer than 9 characters consisting of the characters 0-9 and A-Z. */
  set number(value) { this.#document.number = value; }

  /** The visa holder's full name.
   * @type { String }
   */
  get fullName() { return this.#document.fullName; }
  /** @param { string } value - The visa holder's full name. A ', ' separates the document holder's primary identifier from their secondary identifiers. A '/' separates the full name in a non-Latin national language from a transcription/transliteration into the Latin characters A-Z. */
  set fullName(value) {
    this.#document.fullName = value;
    this.#document.fullName.toMRZ = function() {
      return TravelDocument.fullNameMRZ(this, 39);
    }
  }

  /** A code identifying the visa holder's nationality (or lack thereof).
   * @type { String }
   */
  get nationalityCode() { return this.#document.nationalityCode; }
  /** @param { string } value - A 3-character string consisting of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ. */
  set nationalityCode(value) { this.#document.nationalityCode = value; }

  /** The visa holder's date of birth.
   * @type { Date }
   */
  get birthDate() { return this.#document.birthDate; }
  /** @param { string } value - A calendar date string in YYYY-MM-DD format. */
  set birthDate(value) { this.#document.birthDate = value; }

  /** A marker representing the visa holder's gender.
   * @type { String }
   */
  get genderMarker() { return this.#document.genderMarker; }
  /** @param { string } value - The character 'F', 'M', or 'X'. */
  set genderMarker(value) { this.#document.genderMarker = value; }

  /** The last date on which this visa is valid.
   * @type { Date }
   */
  get validThru() { return this.#document.expirationDate; }
  /** @param { string } value - A calendar date string in YYYY-MM-DD format. */
  set validThru(value) { this.#document.expirationDate = value; }

  /** Optional data to include in the Machine-Readable Zone (MRZ).
   * @type { String }
   */
  get optionalData() { return this.#document.optionalData; }
  /** @param { string } value - Up to 16 characters to include in the Machine-Readable Zone (MRZ). Valid characters are from the ranges 0-9 and A-Z. */
  set optionalData(value) {
    this.#document.optionalData = value;
    this.#document.optionalData.toMRZ = function() {
      return TravelDocument.optionalDataMRZ(this, 16);
    }
  }

  /** A path/URL to an image, or an image object, representing a photo of the visa holder or an image from the issuing authority.
   * @type { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame }
   */
  get picture() { return this.#document.picture; }
  /** @param { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame } value */
  set picture(value) { this.#document.picture = value; }

  /** A path/URL to an image, or an image object, representing the signature or usual mark of the visa issuer.
   * @type { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame }
   */
  get signature() { return this.#document.signature; }
  /** @param { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame } value */
  set signature(value) { this.#document.signature = value; }
  
  /** Location where the visa was issued.
   * @type { String }
   */
  get placeOfIssue() { return this.#visa.placeOfIssue; }
  /** @param { string } value - Location where the visa was issued. */
  set placeOfIssue(value) { this.#visa.placeOfIssue = value; }

  /** Starting date on which the visa is valid.
   * @type { Date }
   */
  get validFrom() { return this.#visa.validFrom; }
  /** @param { string } value - A calendar date string in YYYY-MM-DD format. */
  set validFrom(value) { this.#visa.validFrom = value; }

  /** Maximum number of entries this visa allows.
   * @type { String }
   */
  get numberOfEntries() { return this.#visa.numberOfEntries; }
  /** @param { string | number } value - Number of entries. 0 or any string denotes an unlimited number of entries. */
  set numberOfEntries(value) { this.#visa.numberOfEntries = value; }

  /** The textual type/name/description for this visa.
   * @type { String }
   */
  get visaType() { return this.#visa.visaType; }
  /** @param { string } value - A type/name/description for this visa. */
  set visaType(value) { this.#visa.visaType = value; }

  /** Additional textual information to include with this visa.
   * @type { String }
   */
  get additionalInfo() { return this.#visa.additionalInfo; }
  /** @param { string } value - Additional textual information. */
  set additionalInfo(value) { this.#visa.additionalInfo = value; }

  /** The identity document number for which this visa is issued.
   * @type { String }
   */
  get passportNumber() { return this.#visa.passportNumber; }
  /** @param { string } value - A string no longer than 9 characters consisting of the characters 0-9 and A-Z. */
  set passportNumber(value) { this.#visa.passportNumber = value; }

  /** Whether the visa's Machine-Readable Zone (MRZ) should use 'passportNumber' instead of 'number'.
   * @type { boolean }
   */
  get usePassportInMRZ() { return this.#visa.usePassportInMRZ; }
  /** @param { boolean } value */
  set usePassportInMRZ(value) { this.#visa.usePassportInMRZ = value; }

  /** The first line of the Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get mrzLine1() {
    return this.typeCode.toMRZ() +
      this.authorityCode.toMRZ() +
      this.fullName.toMRZ();
  }

  /** The second line of the Machine-Readable Zone (MRZ).
   * @type { string }
   */
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

  /** The full Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get machineReadableZone() {
    return this.mrzLine1 +
    "\n" +
    this.mrzLine2;
  }

  /** Create a new MRVADocument.
   * @param { Object } [opt] - An options object.
   * @param { string } [opt.typeCode] - A 1-2 character string consisting of the letters A-Z.
   * @param { string } [opt.authorityCode] - A 3-character string consisting of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   * @param { string } [opt.number] - A string no longer than 9 characters consisting of the characters 0-9 and A-Z.
   * @param { string } [opt.fullName] - The visa holder's full name. A ', ' separates the document holder's primary identifier from their secondary identifiers. A '/' separates the full name in a non-Latin national language from a transcription/transliteration into the Latin characters A-Z.
   * @param { string } [opt.nationalityCode] - A 3-character string consisting of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   * @param { string } [opt.birthDate] - A calendar date string in YYYY-MM-DD format.
   * @param { string } [opt.genderMarker] - The character 'F', 'M', or 'X'.
   * @param { string } [opt.validThru] - A calendar date string in YYYY-MM-DD format.
   * @param { string } [opt.optionalData] - Up to 8 characters to include in the Machine-Readable Zone (MRZ). Valid characters are from the ranges 0-9 and A-Z.
   * @param { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame } [opt.picture] - A path/URL to an image, or an image object, representing a photo of the visa holder or an image from the issuing authority.
   * @param { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame } [opt.signature] - A path/URL to an image, or an image object, representing the signature or usual mark of the visa issuer.
   * @param { string } [opt.placeOfIssue] - Location where the visa was issued.
   * @param { string } [opt.validFrom] - A calendar date string in YYYY-MM-DD format.
   * @param { string | number } [opt.numberOfEntries] - Number of entries. 0 or any string denotes an unlimited number of entries.
   * @param { string } [opt.visaType] - A type/name/description for this visa.
   * @param { string } [opt.additionalInfo] - Additional textual information.
   * @param { string } [opt.passportNumber] - A string no longer than 9 characters consisting of the characters 0-9 and A-Z.
   * @param { boolean } [opt.usePassportInMRZ] - Whether the visa's Machine-Readable Zone (MRZ) should use 'passportNumber' instead of 'number'.
   */
  constructor(opt) {
    this.fullName = "Mann, Mister";
    this.optionalData = "";

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

export { MRVADocument };