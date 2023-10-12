// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

import { TravelDocument } from "./TravelDocument.js";
import { DEFAULT_PHOTO, DEFAULT_SIGNATURE_IMAGE } from "./utilities/default-images.js";
import { getFullYearFromString } from "./utilities/get-full-year-from-string.js";
import { generateMRZCheckDigit } from "./utilities/generate-mrz-check-digit.js";
import { fullNameMRZ } from "./utilities/full-name-mrz.js";
import { optionalDataMRZ } from "./utilities/optional-data-mrz.js";

/**
 * Stores properties and methods for TD1-sized machine-readable travel documents
 *     (MRTDs) with machine-readable zones. The US Passport Card is an example
 *     of this type of document.
 * 
 * `TD1Document` may be used on its own or may be used to compose different
 *     kinds of MRTDs.
 */
class TD1Document {
  /**
   * Create a `TD1Document`.
   * @param { Object } [opt] - An options object.
   * @param { string } [opt.typeCode] - A 1-2 character string consisting of the
   *     letters A-Z.
   * @param { string } [opt.authorityCode] - A 3-character string consisting of
   *     the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned
   *     ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   * @param { string } [opt.number] - A string no longer than 9 characters
   *     consisting of the characters 0-9 and A-Z.
   * @param { string | Date } [opt.birthDate] - A calendar date string in
   *     YYYY-MM-DD format or a `Date` object.
   * @param { string } [opt.genderMarker] - The character 'F', 'M', or 'X'.
   * @param { string | Date } [opt.expirationDate] - A calendar date string in
   *     YYYY-MM-DD format or a `Date` object.
   * @param { string } [opt.nationalityCode] - A 3-character string consisting
   *     of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned
   *     ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   * @param { string } [opt.fullName] - A ', ' separates the document holder's
   *     primary identifier from their secondary identifiers. A '/' separates
   *     the full name in a non-Latin national language from a
   *     transcription/transliteration into the Latin characters A-Z.
   * @param { string } [opt.optionalData] - Up to 26 characters. Valid
   *     characters are from the ranges 0-9, A-Z, and ' '.
   * @param { string } [opt.mrzLine1] - A MRZ line string of a 30-character
   *     length.
   * @param { string } [opt.mrzLine2] - A MRZ line string of a 30-character
   *     length.
   * @param { string } [opt.mrzLine3] - A MRZ line string of a 30-character
   *     length.
   * @param { string } [opt.machineReadableZone] - A MRZ string of a
   *     90-character length.
   * @param { string | HTMLImageElement | SVGImageElement | HTMLVideoElement |
   *     HTMLCanvasElement | ImageBitmap | OffscreenCanvas |
   *     VideoFrame } [opt.photo] - A path/URL to an image, or an image object,
   *     representing a photo of the document holder.
   * @param { string | HTMLImageElement | SVGImageElement | HTMLVideoElement |
   *     HTMLCanvasElement | ImageBitmap | OffscreenCanvas |
   *     VideoFrame } [opt.signatureImage] - A path/URL to an image, or an image
   *     object, representing the signature or usual mark of the document
   *     holder.
   */
  constructor(opt) {
    this.#document = new TravelDocument();

    this.typeCode = opt?.typeCode ?? "I";
    this.authorityCode = opt?.authorityCode ?? "UTO";
    this.number = opt?.number ?? "D23145890";
    this.birthDate = opt?.birthDate ?? "1974-08-12";
    this.genderMarker = opt?.genderMarker ?? "F";
    this.expirationDate = opt?.expirationDate ?? "2012-04-15";
    this.nationalityCode = opt?.nationalityCode ?? "UTO";
    this.fullName = opt?.fullName ?? "Eriksson, Anna-Maria";
    this.optionalData = opt?.optionalData ?? "";
    this.photo = opt?.photo ?? DEFAULT_PHOTO;
    this.signatureImage = opt?.signatureImage ?? DEFAULT_SIGNATURE_IMAGE;

    if (opt?.mrzLine1) { this.mrzLine1 = opt.mrzLine1; }
    if (opt?.mrzLine2) { this.mrzLine2 = opt.mrzLine2; }
    if (opt?.mrzLine3) { this.mrzLine3 = opt.mrzLine3; }
    if (opt?.machineReadableZone) {
      this.machineReadableZone = opt.machineReadableZone;
    }
  }

  // The object `TD1Document` uses to compose itself.
  #document;
  
  /**
   * A code identifying the document type.
   * @type { String }
   */
  get typeCode() { return this.#document.typeCode; }
  /**
   * @param { string } value - A 1-2 character string consisting of the letters
   *     A-Z.
   */
  set typeCode(value) { this.#document.typeCode = value; }

  /**
   * A code identifying the authority who issued this document.
   * @type { String }
   */
  get authorityCode() { return this.#document.authorityCode; }
  /**
   * @param { string } value - A 3-character string consisting of the letters
   *     A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges:
   *     AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   */
  set authorityCode(value) { this.#document.authorityCode = value; }

  /**
   * An identity document number unique for this document.
   * @type { String }
   */
  get number() { return this.#document.number; }
  /**
   * @param { string } value - A string no longer than 9 characters consisting
   *     of the characters 0-9 and A-Z.
   */
  set number(value) { this.#document.number = value; }

  /**
   * The document holder's date of birth.
   * @type { Date }
   */
  get birthDate() { return this.#document.birthDate; }
  /**
   * @param { string | Date } value - A calendar date string in YYYY-MM-DD
   *     format or a `Date` object.
   */
  set birthDate(value) { this.#document.birthDate = value; }

  /**
   * A marker representing the document holder's gender.
   * @type { String }
   */
  get genderMarker() { return this.#document.genderMarker; }
  /**
   * @param { string } value - The character 'F', 'M', or 'X'.
   */
  set genderMarker(value) { this.#document.genderMarker = value; }

  /**
   * The last date on which this document is valid.
   * @type { Date }
   */
  get expirationDate() { return this.#document.expirationDate; }
  /**
   * @param { string | Date } value - A calendar date string in YYYY-MM-DD
   *     format or a `Date` string.
   */
  set expirationDate(value) { this.#document.expirationDate = value; }

  /**
   * A code identifying the document holder's nationality (or lack thereof).
   * @type { String }
   */
  get nationalityCode() { return this.#document.nationalityCode; }
  /**
   * @param { string } value - A 3-character string consisting of the letters
   *     A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges:
   *     AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   */
  set nationalityCode(value) { this.#document.nationalityCode = value; }

  /**
   * The document holder's full name.
   * @type { String }
   */
  get fullName() { return this.#document.fullName; }
  /**
   * @param { string } value - A ', ' separates the document holder's primary
   *     identifier from their secondary identifiers. A '/' separates the full
   *     name in a non-Latin national language from a
   *     transcription/transliteration into the Latin characters A-Z.
   */
  set fullName(value) {
    this.#document.fullName = value;
    this.#document.fullName.toMRZ = TD1Document.#fullNameToMRZ;
  }

  /**
   * Optional data to include in the Machine-Readable Zone (MRZ).
   * @type { String }
   */
  get optionalData() { return this.#document.optionalData; }
  /**
   * @param { string } value - Up to 26 characters. Valid characters are from
   *     the ranges 0-9, A-Z, and ' '.
   */
  set optionalData(value) {
    this.#document.optionalData = value;
    this.#document.optionalData.toMRZ = TD1Document.#optionalDataToMRZ;
  }

  /**
   * A path/URL to an image, or an image object, representing a photo of the
   *     document holder.
   * @type { string | HTMLImageElement | SVGImageElement | HTMLVideoElement |
   *     HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame }
   */
  get photo() { return this.#document.photo; }
  /**
   * @param { string | HTMLImageElement | SVGImageElement | HTMLVideoElement |
   *     HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame } value
   */
  set photo(value) { this.#document.photo = value; }

  /**
   * A path/URL to an image, or an image object, representing the signature or
   *     usual mark of the document holder.
   * @type { string | HTMLImageElement | SVGImageElement | HTMLVideoElement |
   *     HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame }
   */
  get signatureImage() { return this.#document.signatureImage; }
  /**
   * @param { string | HTMLImageElement | SVGImageElement | HTMLVideoElement |
   *     HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame } value
   */
  set signatureImage(value) { this.#document.signatureImage = value; }

  /**
   * The first line of the Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get mrzLine1() {
    return this.typeCode.toMRZ() +
      this.authorityCode.toMRZ() +
      this.number.toMRZ() +
      generateMRZCheckDigit(this.number.toMRZ()) +
      this.optionalData.toMRZ().slice(0,15);
  }
  /**
   * @param { string } value - A MRZ line string of a 30-character length.
   */
  set mrzLine1(value) {
    if (value.length !== 30) {
      throw new RangeError(
        `Length '${value.length}' does not match the length of a TD1-sized ` +
            `Machine-Readable Zone (MRZ) line.`
      );
    }
    if (value[14] !== generateMRZCheckDigit(
      value.slice(5, 14)
    )) {
      throw new EvalError(
        `Check digit '${value[14]}' does not match for the check digit on the` +
            ` document number.`
      );
    }
    this.typeCode = value.slice(0, 2).replace(/</gi, "");
    this.authorityCode = value.slice(2, 5).replace(/</gi, "");
    this.number = value.slice(5, 14).replace(/</gi, "");
  }

  /**
   * The second line of the Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get mrzLine2() {
    const UNCHECKED_LINE = this.birthDate.toMRZ() +
      generateMRZCheckDigit(this.birthDate.toMRZ()) +
      this.genderMarker.toMRZ() +
      this.expirationDate.toMRZ() +
      generateMRZCheckDigit(this.expirationDate.toMRZ()) +
      this.nationalityCode.toMRZ() +
      this.optionalData.toMRZ().slice(15);
    return UNCHECKED_LINE +
      generateMRZCheckDigit(
        this.mrzLine1.slice(5) +
        UNCHECKED_LINE.slice(0,7) +
        UNCHECKED_LINE.slice(8,15) +
        UNCHECKED_LINE.slice(18)
      );
  }
  /**
   * @param { string } value - A MRZ line string of a 30-character length.
   */
  set mrzLine2(value) {
    if (value.length !== 30) {
      throw new RangeError(
        `Length '${value.length}' does not match the length of a TD1-sized ` +
            `Machine Readable-Zone (MRZ) line.`
      );
    }
    if (value[6] !== generateMRZCheckDigit(
      value.slice(0, 6)
    )) {
      throw new EvalError(
        `Check digit '${value[6]} does not match for the check digit on the ` +
            `date of birth.`
      );
    }
    if (value[14] !== generateMRZCheckDigit(
      value.slice(8, 14)
    )) {
      throw new EvalError(
        `Check digit '${value[14]}' does not match for the check digit on the` +
            ` date of expiration.`
      );
    }
    this.birthDate = `${getFullYearFromString(value.slice(0, 2))}-` +
        `${value.slice(2, 4)}-${value.slice(4, 6)}`;
    this.genderMarker = value[7] === "<" ? "X" : value[7];
    this.expirationDate = `${getFullYearFromString(value.slice(8, 10))}-` +
        `${value.slice(10, 12)}-${value.slice(12, 14)}`;
    this.nationalityCode = value.slice(15, 18).replace(/</gi, "");
  }

  /**
   * The third line of the Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get mrzLine3() { return this.fullName.toMRZ(); }
  /**
   * @param { string } value - A MRZ line string of a 30-character length.
   */
  set mrzLine3(value) {
    if (value.length !== 30) {
      throw new RangeError(
        `Length '${value.length}' does not match the length of a TD1-sized ` +
            `Machine-Readable Zone (MRZ) line.`
      );
    }
    this.fullName = value.replace("<<", ", ").replace(/</gi, " ").trimEnd();
  }

  /**
   * The full Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get machineReadableZone() {
    return this.mrzLine1 + this.mrzLine2 + this.mrzLine3;
  }
  /**
   * @param { string } value - A MRZ string of a 90-character length.
   */
  set machineReadableZone(value) {
    if (value.length !== 90) {
      throw new RangeError(
        `Length '${value.length}' does not match the length of a TD1-sized ` +
            `Machine-Readable Zone (MRZ).`
      );
    }
    const LINE_CHECK_DIGIT = generateMRZCheckDigit(
      value.slice(5, 30) +
      value.slice(30, 37) +
      value.slice(38, 45) +
      value.slice(48, 59)
    );
    if (value[59] !== LINE_CHECK_DIGIT) {
      throw new EvalError(
        `Check digit '${value[59]}' does not match for the check digit on the` +
            ` Machine-Readable Zone (MRZ) lines 1 and 2.`
      );
    }
    this.mrzLine1 = value.slice(0, 30);
    this.mrzLine2 = value.slice(30, 60);
    this.mrzLine3 = value.slice(60);
    this.optionalData = (value.slice(15, 30) + value.slice(
      48, 59
    )).replace(/</gi, " ").trimEnd();
  }

  // Functions to be assigned to properties `toMRZ` and `toVIZ` when set.
  static #fullNameToMRZ = function() {
    return fullNameMRZ(this, 30);
  }
  static #optionalDataToMRZ = function() {
    return optionalDataMRZ(this, 26);
  }
}

export { TD1Document };
