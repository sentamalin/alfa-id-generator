// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

import { DEFAULT_PHOTO, DEFAULT_SIGNATURE_IMAGE } from "./utilities/default-images.js";
import { validateMRZString } from "./utilities/validate-mrz-string.js";

/**
 * Stores common properties and methods for all ICAO 9303 machine-readable
 *     travel documents (MRTDs) with machine-readable zones.
 * 
 * While `TravelDocument` provides useful utility methods, the actual class is
 *     intended to be used to compose different kinds of MRTDs. It is not
 *     intended to be instantiated directly.
 */
export class TravelDocument {
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
   * @type { string }
   */
  get typeCode() { return this.#typeCode; }
  /**
   * @param { string } value - A 1-2 character string consisting of the letters
   *     A-Z.
   */
  set typeCode(value) {
    const isInvalid = validateMRZString(value, {
      minimum: 1,
      maximum: 2
    });
    if (isInvalid) {
      throw new RangeError(`Value set on 'typeCode' has errors: ${isInvalid}`);
    }
    this.#typeCode = value.toUpperCase();
  }

  #authorityCode;
  /**
   * A code identifying the authority who issued this document.
   * @type { string }
   */
  get authorityCode() { return this.#authorityCode; }
  /**
   * @param { string } value - A 3-character string consisting of the letters
   *     A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges:
   *     AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   */
  set authorityCode(value) {
    const isInvalid = validateMRZString(value, {
      minimum: 1,
      maximum: 3
    });
    if (isInvalid) {
      throw new RangeError(
        `Value set on 'authorityCode' has errors: ${isInvalid}`
      );
    }
    this.#authorityCode = value.toUpperCase();
  }

  #number;
  /**
   * An identity document number unique for this document.
   * @type { string }
   */
  get number() { return this.#number; }
  /**
   * @param { string } value - A string no longer than 9 characters consisting
   *     of the characters 0-9 and A-Z.
   */
  set number(value) {
    const isInvalid = validateMRZString(value, {
      minimum: 1,
      maximum: 9
    });
    if (isInvalid) {
      throw new RangeError(`Value set on 'number' has errors: ${isInvalid}`);
    }
    this.#number = value.toUpperCase();
  }

  #birthDate;
  /**
   * The document holder's date of birth.
   * @type { Date }
   */
  get birthDate() { return this.#birthDate; }
  /**
   * @param { string | Date } value - A calendar date string in YYYY-MM-DD
   *     format or a `Date` string.
   */
  set birthDate(value) {
    const test = typeof value === "string" ? new Date(`${value}T00:00:00`)
        : new Date(value);
    if (test.toString() === "Invalid Date") {
      throw new TypeError(
        "Date of birth (dateOfBirth) must be a valid date string."
      );
    }
    this.#birthDate = test;
  }

  #genderMarker;
  /**
   * A marker representing the document holder's gender.
   * @type { string }
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
    this.#genderMarker = value.toUpperCase();
  }

  #expirationDate;
  /**
   * The last date on which this document is valid.
   * @type { Date }
   */
  get expirationDate() { return this.#expirationDate; }
  /**
   * @param { string | Date } value - A calendar date string in YYYY-MM-DD
   *     format or a `Date` string.
   */
  set expirationDate(value) {
    const test = typeof value === "string" ? new Date(`${value}T00:00:00`)
        : new Date(value);
    if (test.toString() === "Invalid Date") {
      throw new TypeError(
        "Date of expiration (dateOfExpiration) must be a valid date string."
      );
    }
    this.#expirationDate = test;
  }

  #nationalityCode;
  /**
   * A code identifying the document holder's nationality (or lack thereof).
   * @type { string }
   */
  get nationalityCode() { return this.#nationalityCode; }
  /**
   * @param { string } value - A 3-character string consisting of the letters
   *     A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges:
   *     AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   */
  set nationalityCode(value) {
    const isInvalid = validateMRZString(value, {
      minimum: 1,
      maximum: 3
    });
    if (isInvalid) {
      throw new TypeError(
        `Value set on 'nationalityCode has errors: ${isInvalid}`
      );
    }
    this.#nationalityCode = value.toUpperCase();
  }

  /**
   * The document holder's full name.
   * @type { string }
   */
  fullName

  #optionalData;
  /**
   * Optional data to include in the Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get optionalData() { return this.#optionalData; }
  /**
   * @param { string } value - Valid characters are from the ranges 0-9, A-Z,
   *     and ' '.
   */
  set optionalData(value) {
    const isInvalid = validateMRZString(value);
    if (isInvalid) {
      throw new RangeError(
        `Value set on 'optionalData' has errors: ${isInvalid}`
      );
    }
    this.#optionalData = value;
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
}
