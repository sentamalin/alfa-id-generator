// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

import { DEFAULT_PHOTO, DEFAULT_SIGNATURE_IMAGE } from "./utilities/default-images.js";
import { dateToVIZ } from "./utilities/date-to-viz.js";
import { padMRZString } from "./utilities/pad-mrz-string.js";
import { normalizeMRZString } from "./utilities/normalize-mrz-string.js";

/**
 * Stores common properties and methods for all ICAO 9303 machine-readable
 *     travel documents (MRTDs) with machine-readable zones.
 * 
 * While `TravelDocument` provides useful utility methods, the actual class is
 *     intended to be used to compose different kinds of MRTDs. It is not
 *     intended to be instantiated directly.
 */
class TravelDocument {
  /**
   * Create a `TravelDocument`.
   * @param { Object } [opt] - An options object.
   * @param { string } [opt.typeCode] - A 1-2 character string consisting of the
   *     letters A-Z.
   * @param { string } [opt.authorityCode] - A 3-character string consisting of
   *     the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned
   *     ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   * @param { string } [opt.number] - A string no longer than 9 characters
   *     consisting of the characters 0-9 and A-Z.
   * @param { string } [opt.birthDate] - A calendar date string in YYYY-MM-DD
   *     format.
   * @param { string } [opt.genderMarker] - The character 'F', 'M', or 'X'.
   * @param { string } [opt.expirationDate] - A calendar date string in
   *     YYYY-MM-DD format.
   * @param { string } [opt.nationalityCode] - A 3-character string consisting
   *     of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned
   *     ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   * @param { string } [opt.fullName] - A ', ' separates the document holder's
   *     primary identifier from their secondary identifiers. A '/' separates
   *     the full name in a non-Latin national language from a
   *     transcription/transliteration into the Latin characters A-Z.
   * @param { string } [opt.optionalData] - Valid characters are from the ranges
   *     0-9, A-Z, and ' '.
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
    this.typecode = opt?.typeCode ?? "I";
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
  }
  
  #typeCode;
  /**
   * A code identifying the document type.
   * @type { String }
   */
  get typeCode() { return this.#typeCode; }
  /**
   * @param { string } value - A 1-2 character string consisting of the letters
   *     A-Z.
   */
  set typeCode(value) {
    if (value.toString().length > 2) {
      throw new RangeError(
        "Document code (typeCode) must be no more than 2 characters."
      );
    } else {
      this.#typeCode = new String(value.toString().toUpperCase());
      this.#typeCode.toMRZ = TravelDocument.#typeCodeToMRZ;
      this.#typeCode.toVIZ = TravelDocument.#setThisToUppercase;
    }
  }

  #authorityCode;
  /**
   * A code identifying the authority who issued this document.
   * @type { String }
   */
  get authorityCode() { return this.#authorityCode; }
  /**
   * @param { string } value - A 3-character string consisting of the letters
   *     A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges:
   *     AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   */
  set authorityCode(value) {
    if (value.toString().toUpperCase().length !== 3) {
      throw new RangeError(
        "Issuing state or organization code (authorityCode) must be 3 charact" +
            "ers."
      );
    }
    this.#authorityCode = new String(value.toString().toUpperCase());
    this.#authorityCode.toMRZ = TravelDocument.#doNothingWithThis;
    this.#authorityCode.toVIZ = TravelDocument.#doNothingWithThis;
  }

  #number;
  /**
   * An identity document number unique for this document.
   * @type { String }
   */
  get number() { return this.#number; }
  /**
   * @param { string } value - A string no longer than 9 characters consisting
   *     of the characters 0-9 and A-Z.
   */
  set number(value) {
    if (value.toString().length > 9) {
      throw new RangeError(
        "Document number (number) must be no more than 9 characters."
      );
    } else {
      this.#number = new String(value.toString().toUpperCase());
      this.#number.toMRZ = TravelDocument.#numberToMRZ;
      this.#number.toVIZ = TravelDocument.#setThisToUppercase;
    }
  }

  #birthDate;
  /**
   * The document holder's date of birth.
   * @type { Date }
   */
  get birthDate() { return this.#birthDate; }
  /**
   * @param { string } value - A calendar date string in YYYY-MM-DD format.
   */
  set birthDate(value) {
    const test = new Date(`${value}T00:00:00`);
    if (test.toString() === "Invalid Date") {
      throw new TypeError(
        "Date of birth (dateOfBirth) must be a valid date string."
      );
    } else {
      this.#birthDate = test;
      this.#birthDate.toMRZ = TravelDocument.#thisDateToMRZ;
      this.#birthDate.toVIZ = TravelDocument.#thisDateToVIZ;
    }
  }

  #genderMarker;
  /**
   * A marker representing the document holder's gender.
   * @type { String }
   */
  get genderMarker() { return this.#genderMarker; }
  /**
   * @param { string } value - The character 'F', 'M', or 'X'.
   */
  set genderMarker(value) {
    if (!["F", "M", "X"].includes(value.toUpperCase())) {
      throw new RangeError(
        "Gender marker (genderMarker) must be [F]emale, [M]ale, " +
            "or Other/Unspecified [X]."
      );
    }
    this.#genderMarker = new String(value.toUpperCase());
    this.#genderMarker.toMRZ = TravelDocument.#genderMarkerToMRZ;
    this.#genderMarker.toVIZ = TravelDocument.#doNothingWithThis;
  }

  #expirationDate;
  /**
   * The last date on which this document is valid.
   * @type { Date }
   */
  get expirationDate() { return this.#expirationDate; }
  /**
   * @param { string } value - A calendar date string in YYYY-MM-DD format.
   */
  set expirationDate(value) {
    const test = new Date(`${value}T00:00:00`);
    if (test.toString() === "Invalid Date") {
      throw new TypeError(
        "Date of expiration (dateOfExpiration) must be a valid date string."
      );
    } else {
      this.#expirationDate = test;
      this.#expirationDate.toMRZ = TravelDocument.#thisDateToMRZ;
      this.#expirationDate.toVIZ = TravelDocument.#thisDateToVIZ;
    }
  }

  #nationalityCode;
  /**
   * A code identifying the document holder's nationality (or lack thereof).
   * @type { String }
   */
  get nationalityCode() { return this.#nationalityCode; }
  /**
   * @param { string } value - A 3-character string consisting of the letters
   *     A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges:
   *     AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   */
  set nationalityCode(value) {
    if (value.toString().length !== 3) {
      throw new RangeError(
        "Nationality code (nationalityCode) must be 3 characters."
      );
    }
    this.#nationalityCode = new String(value.toString().toUpperCase());
    this.#nationalityCode.toMRZ = TravelDocument.#setThisToUppercase;
    this.#nationalityCode.toVIZ = TravelDocument.#setThisToUppercase;
  }

  #fullName;
  /**
   * The document holder's full name.
   * @type { String }
   */
  get fullName() { return this.#fullName; }
  /**
   * @param { string } value - A ', ' separates the document holder's primary
   *     identifier from their secondary identifiers. A '/' separates the full
   *     name in a non-Latin national language from a
   *     transcription/transliteration into the Latin characters A-Z.
   */
  set fullName(value) {
    this.#fullName = new String(value.toString());
    this.#fullName.toVIZ = TravelDocument.#setThisToUppercase;
  }
  /**
   * Normalize and pad a document holder's name for the name area of a
   *     Machine-Readable Zone (MRZ) of a given character length.
   * @param { string } name - The document holder's full name in the Latin
   *     characters A-Z, or a transcription/transliteration of their full name
   *     in Latin characters. A ', ' separates the document holder's primary
   *     identifier from their secondary identifiers.
   * @param { number } length - The number of characters available for the
   *     document holder's name in a Machine-Readable Zone (MRZ).
   * @example
   * // Returns "MILLEFEUILLE<<ALFALFA<<<<<<<<<"
   * TravelDocument.fullNameMRZ("Millefeuille, Alfalfa", 30);
   */
  static fullNameMRZ(name, length) {
    const NORMALIZED_NAME =
        normalizeMRZString(name.replace(", ","<<"));
    if (NORMALIZED_NAME.length > length) {
      console.warn(
        `Name (fullName) is longer than ${length} and will be truncated.`
      );
    }
    return padMRZString(
      NORMALIZED_NAME.substring(0,length), length
    );
  }

  #optionalData;
  /**
   * Optional data to include in the Machine-Readable Zone (MRZ).
   * @type { String }
   */
  get optionalData() { return this.#optionalData; }
  /**
   * @param { string } value - Valid characters are from the ranges 0-9, A-Z,
   *     and ' '.
   */
  set optionalData(value) { this.#optionalData = new String(value.toString()); }
  /**
   * Normalize and pad optional data for the optional data area of a
   *     Machine-Readable Zone (MRZ) of a given character length.
   * @param { string } data - Optional data to include in the Machine-Readable
   *     Zone (MRZ). Valid characters are from the ranges 0-9 and A-Z.
   * @param { number } length - The number of characters available for the
   *     optional data in a Machine-Readable Zone (MRZ).
   * @example
   * // Returns "EXAMPLE<<<<<<<"
   * TravelDocument.optionalDataMRZ("EXAMPLE", 14);
   */
  static optionalDataMRZ(data, length) {
    const NORMALIZED_DATA = normalizeMRZString(data);
    if (NORMALIZED_DATA.length > length) {
      console.warn(
        `Optional data (optionalData) is longer than ${length} and will be ` +
            `truncated.`
      );
    }
    return padMRZString(
      NORMALIZED_DATA.substring(0,length), length
    );
  }

  /**
   * A path/URL to an image, or an image object, representing a photo of the
   *     document holder or image chosen by the issuer.
   * @type { string | HTMLImageElement | SVGImageElement | HTMLVideoElement |
   *     HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame }
   */
  photo;

  /**
   * A path/URL to an image, or an image object, representing the signature or
   *     usual mark of the document holder or issuer.
   * @type { string | HTMLImageElement | SVGImageElement | HTMLVideoElement |
   *     HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame }
   */
  signatureImage;

  // Functions to be assigned to properties `toMRZ` and `toVIZ` when set.
  static #doNothingWithThis = function() {
    return this;
  }
  static #setThisToUppercase = function() {
    return this.toUpperCase();
  }
  static #thisDateToMRZ = function() {
    return TravelDocument.#dateToMRZ(this);
  }
  static #thisDateToVIZ = function() {
    return dateToVIZ(this);
  }
  static #typeCodeToMRZ = function() {
    return padMRZString(this, 2);
  }
  static #numberToMRZ = function() {
    return padMRZString(this, 9);
  }
  static #genderMarkerToMRZ = function() {
    return `${this}` === "X" ? "<" : this;
  }

  /**
   * Convert a Date object to a Machine-Readable Zone (MRZ) YYMMDD date string.
   * @param { Date } date
   * @example
   * // Returns "230930"
   * TravelDocument.#dateToMRZ(new Date("2023-09-30T00:00:00"));
   */
  static #dateToMRZ(date) {
    return date.toISOString().slice(2,10).replace(/-/gi,"");
  }

  /**
   * Generate a check digit for a Machine-Readable Zone (MRZ) string.
   * @param { string } string
   * @example
   * // Returns "9"
   * TravelDocument.generateMRZCheckDigit("362142069");
   */
  static generateMRZCheckDigit(string) {
    const weight = [7, 3, 1];
    let value = 0;
    [...string].forEach((character, i) => {
      let currentValue;
      const CURRENT_WEIGHT = weight[i % 3];
      switch (character) {
        case "1": currentValue = 1; break;
        case "2": currentValue = 2; break;
        case "3": currentValue = 3; break;
        case "4": currentValue = 4; break;
        case "5": currentValue = 5; break;
        case "6": currentValue = 6; break;
        case "7": currentValue = 7; break;
        case "8": currentValue = 8; break;
        case "9": currentValue = 9; break;
        case "A": currentValue = 10; break;
        case "B": currentValue = 11; break;
        case "C": currentValue = 12; break;
        case "D": currentValue = 13; break;
        case "E": currentValue = 14; break;
        case "F": currentValue = 15; break;
        case "G": currentValue = 16; break;
        case "H": currentValue = 17; break;
        case "I": currentValue = 18; break;
        case "J": currentValue = 19; break;
        case "K": currentValue = 20; break;
        case "L": currentValue = 21; break;
        case "M": currentValue = 22; break;
        case "N": currentValue = 23; break;
        case "O": currentValue = 24; break;
        case "P": currentValue = 25; break;
        case "Q": currentValue = 26; break;
        case "R": currentValue = 27; break;
        case "S": currentValue = 28; break;
        case "T": currentValue = 29; break;
        case "U": currentValue = 30; break;
        case "V": currentValue = 31; break;
        case "W": currentValue = 32; break;
        case "X": currentValue = 33; break;
        case "Y": currentValue = 34; break;
        case "Z": currentValue = 35; break;
        default: currentValue = 0; break;
      }
      value += currentValue * CURRENT_WEIGHT;
    });
    return (value % 10).toString();
  }
}

export { TravelDocument };
