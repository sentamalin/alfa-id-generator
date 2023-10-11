// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

import { TravelDocument } from "./TravelDocument.js";
import { VisaDocument } from "./VisaDocument.js";
import { DEFAULT_PHOTO, DEFAULT_SIGNATURE_IMAGE } from "./utilities/default-images.js";
import { getFullYearFromString } from "./utilities/get-full-year-from-string.js";

/**
 * Stores properties and methods for machine-readable visas (MRV-A) with
 *     machine-readable zones. These visas are used when additional information
 *     is placed on the visa sticker and clear zones along the visa sticker is
 *     unnecessary for the passport page.
 * 
 * `MRVADocument` may be used on its own or may be used to compose different
 *     kinds of MRTDs.
 */
class MRVADocument {
  /**
   * Create a `MRVADocument`.
   * @param { Object } [opt] - An options object.
   * @param { string } [opt.typeCode] - A 1-2 character string consisting of the
   *     letters A-Z.
   * @param { string } [opt.authorityCode] - A 3-character string consisting of
   *     the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned
   *     ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   * @param { string } [opt.number] - A string no longer than 9 characters
   *     consisting of the characters 0-9 and A-Z.
   * @param { string } [opt.fullName] - A ', ' separates the visa holder's
   *     primary identifier from their secondary identifiers. A '/' separates
   *     the full name in a non-Latin national language from a
   *     transcription/transliteration into the Latin characters A-Z.
   * @param { string } [opt.nationalityCode] - A 3-character string consisting
   *     of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned
   *     ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   * @param { string } [opt.birthDate] - A calendar date string in YYYY-MM-DD
   *     format.
   * @param { string } [opt.genderMarker] - The character 'F', 'M', or 'X'.
   * @param { string } [opt.validThru] - A calendar date string in YYYY-MM-DD
   *     format.
   * @param { string } [opt.optionalData] - Up to 16 characters. Valid
   *     characters are from the ranges 0-9, A-Z, and ' '.
   * @param { string } [opt.mrzLine1] - A MRZ line string of a 44-character
   *     length.
   * @param { string } [opt.mrzLine2] - A MRZ line string of a 44-character
   *     length.
   * @param { string } [opt.machineReadableZone] - A MRZ string of an
   *     88-character length.
   * @param { string | HTMLImageElement | SVGImageElement | HTMLVideoElement |
   *     HTMLCanvasElement | ImageBitmap | OffscreenCanvas |
   *     VideoFrame } [opt.photo] - A path/URL to an image, or an image object,
   *     representing a photo of the visa holder or an image from the issuing
   *     authority.
   * @param { string | HTMLImageElement | SVGImageElement | HTMLVideoElement |
   *     HTMLCanvasElement | ImageBitmap | OffscreenCanvas |
   *     VideoFrame } [opt.signatureImage] - A path/URL to an image, or an image
   *     object, representing the signature or usual mark of the visa issuer.
   * @param { string } [opt.placeOfIssue] - Location where the visa was issued.
   * @param { string } [opt.validFrom] - A calendar date string in YYYY-MM-DD
   *     format.
   * @param { string | number } [opt.numberOfEntries] - 0 or any string denotes
   *     an unlimited number of entries.
   * @param { string } [opt.visaType] - A type/name/description for this visa.
   * @param { string } [opt.additionalInfo] - Additional textual information.
   * @param { string } [opt.passportNumber] - A string no longer than 9
   *     characters consisting of the characters 0-9 and A-Z.
   * @param { boolean } [opt.usePassportInMRZ] - Use `this.passportNumber`
   *     instead of `this.number` in the Machine-Readable Zone (MRZ).
   */
  constructor(opt) {
    this.#document = new TravelDocument();
    this.#visa = new VisaDocument();

    this.typeCode = opt?.typeCode ?? "V";
    this.authorityCode = opt?.authorityCode ?? "UTO";
    this.number = opt?.number ?? "T32069231";
    this.fullName = opt?.fullName ?? "Eriksson, Anna-Maria";
    this.nationalityCode = opt?.nationalityCode ?? "UTO";
    this.birthDate = opt?.birthDate ?? "1974-08-12";
    this.genderMarker = opt?.genderMarker ?? "F";
    this.validThru = opt?.validThru ?? "2012-04-15";
    this.optionalData = opt?.optionalData ?? "";
    this.photo = opt?.photo ?? DEFAULT_PHOTO;
    this.signatureImage = opt?.signatureImage ?? DEFAULT_SIGNATURE_IMAGE;
    this.placeOfIssue = opt?.placeOfIssue ?? "Utopia";
    this.validFrom = opt?.validFrom ?? "2007-04-15";
    this.numberOfEntries = opt?.numberOfEntries ?? "Multiple";
    this.visaType = opt?.visaType ?? "Tourist";
    this.additionalInfo = opt?.additionalInfo ?? "";
    this.passportNumber = opt?.passportNumber ?? "D23145890";
    this.usePassportInMRZ = opt?.usePassportInMRZ ?? false;

    if (opt?.mrzLine1) { this.mrzLine1 = opt.mrzLine1; }
    if (opt?.mrzLine2) { this.mrzLine2 = opt.mrzLine2; }
    if (opt?.machineReadableZone) {
      this.machineReadableZone = opt.machineReadableZone;
    }
  }

  // The objects `MRVADocument` uses to compose itself.
  #document;
  #visa;
  
  /**
   * A code identifying the visa type.
   * @type { String }
   */
  get typeCode() { return this.#document.typeCode; }
  /**
   * @param { string } value - A 1-2 character string consisting of the letters
   *     A-Z.
   */
  set typeCode(value) { this.#document.typeCode = value; }

  /**
   * A code identifying the authority who issued this visa.
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
   * An identity document number unique for this visa.
   * @type { String }
   */
  get number() { return this.#document.number; }
  /**
   * @param { string } value - A string no longer than 9 characters consisting
   *     of the characters 0-9 and A-Z.
   */
  set number(value) { this.#document.number = value; }

  /**
   * The visa holder's full name.
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
    this.#document.fullName.toMRZ = MRVADocument.#fullNameToMRZ;
  }

  /**
   * A code identifying the visa holder's nationality (or lack thereof).
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
   * The visa holder's date of birth.
   * @type { Date }
   */
  get birthDate() { return this.#document.birthDate; }
  /**
   * @param { string } value - A calendar date string in YYYY-MM-DD format.
   */
  set birthDate(value) { this.#document.birthDate = value; }

  /**
   * A marker representing the visa holder's gender.
   * @type { String }
   */
  get genderMarker() { return this.#document.genderMarker; }
  /**
   * @param { string } value - The character 'F', 'M', or 'X'.
   */
  set genderMarker(value) { this.#document.genderMarker = value; }

  /**
   * The last date on which this visa is valid.
   * @type { Date }
   */
  get validThru() { return this.#document.expirationDate; }
  /**
   * @param { string } value - A calendar date string in YYYY-MM-DD format.
   */
  set validThru(value) { this.#document.expirationDate = value; }

  /**
   * Optional data to include in the Machine-Readable Zone (MRZ).
   * @type { String }
   */
  get optionalData() { return this.#document.optionalData; }
  /**
   * @param { string } value - Up to 16 characters. Valid characters are from
   *     the ranges 0-9, A-Z, and '<'.
   */
  set optionalData(value) {
    this.#document.optionalData = value;
    this.#document.optionalData.toMRZ = MRVADocument.#optionalDataToMRZ;
  }

  /**
   * A path/URL to an image, or an image object, representing a photo of the
   *     visa holder or an image from the issuing authority.
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
   *     usual mark of the visa issuer.
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
   * Location where the visa was issued.
   * @type { String }
   */
  get placeOfIssue() { return this.#visa.placeOfIssue; }
  /**
   * @param { string } value
   */
  set placeOfIssue(value) { this.#visa.placeOfIssue = value; }

  /**
   * Starting date on which the visa is valid.
   * @type { Date }
   */
  get validFrom() { return this.#visa.validFrom; }
  /**
   * @param { string } value - A calendar date string in YYYY-MM-DD format.
   */
  set validFrom(value) { this.#visa.validFrom = value; }

  /**
   * Maximum number of entries this visa allows.
   * @type { String }
   */
  get numberOfEntries() { return this.#visa.numberOfEntries; }
  /**
   * @param { string | number } value - 0 or any string denotes an unlimited
   *     number of entries.
   */
  set numberOfEntries(value) { this.#visa.numberOfEntries = value; }

  /**
   * The textual type/name/description for this visa.
   * @type { String }
   */
  get visaType() { return this.#visa.visaType; }
  /**
   * @param { string } value
   */
  set visaType(value) { this.#visa.visaType = value; }

  /**
   * Additional textual information to include with this visa.
   * @type { String }
   */
  get additionalInfo() { return this.#visa.additionalInfo; }
  /**
   * @param { string } value
   */
  set additionalInfo(value) { this.#visa.additionalInfo = value; }

  /**
   * The identity document number for which this visa is issued.
   * @type { String }
   */
  get passportNumber() { return this.#visa.passportNumber; }
  /**
   * @param { string } value - A string no longer than 9 characters consisting
   *     of the characters 0-9 and A-Z.
   */
  set passportNumber(value) { this.#visa.passportNumber = value; }

  /**
   * Use `this.passportNumber` instead of `this.number` in the Machine-Readable
   *     Zone (MRZ).
   * @type { boolean }
   */
  get usePassportInMRZ() { return this.#visa.usePassportInMRZ; }
  /**
   * @param { boolean } value
   */
  set usePassportInMRZ(value) { this.#visa.usePassportInMRZ = value; }

  /**
   * The first line of the Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get mrzLine1() {
    return this.typeCode.toMRZ() +
      this.authorityCode.toMRZ() +
      this.fullName.toMRZ();
  }
  /**
   * @param { string } value - A MRZ line string of a 44-character length.
   */
  set mrzLine1(value) {
    if (value.length !== 44) {
      throw new RangeError(
        `Length '${value.length}' does not match the length of a MRV-A ` +
            `Machine-Readable Zone (MRZ) line.`
      );
    }
    this.typeCode = value.slice(0, 2).replace(/</gi, "");
    this.authorityCode = value.slice(2, 5).replace(/</gi, "");
    this.fullName =
        value.slice(5).replace("<<", ", ").replace(/</gi, " ").trimEnd();
  }

  /**
   * The second line of the Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get mrzLine2() {
    const MRZ_NUMBER = this.usePassportInMRZ ? this.passportNumber.toMRZ()
        : this.number.toMRZ();
    return MRZ_NUMBER +
      TravelDocument.generateMRZCheckDigit(MRZ_NUMBER) +
      this.nationalityCode.toMRZ() +
      this.birthDate.toMRZ() +
      TravelDocument.generateMRZCheckDigit(this.birthDate.toMRZ()) +
      this.genderMarker.toMRZ() +
      this.validThru.toMRZ() +
      TravelDocument.generateMRZCheckDigit(this.validThru.toMRZ()) +
      this.optionalData.toMRZ();
  }
  /**
   * @param { string } value - A MRZ line string of a 44-character length.
   */
  set mrzLine2(value) {
    if (value.length !== 44) {
      throw new RangeError(
        `Length '${value.length}' does not match the length of a MRV-A ` +
            `Machine-Readable Zone (MRZ) line.`
      );
    }
    if (value[9] !== TravelDocument.generateMRZCheckDigit(
      value.slice(0, 9)
    )) {
      throw new EvalError(
        `Check digit '${value[9]}' does not match for the check digit on the ` +
            `document number.`
      );
    }
    if (value[19] !== TravelDocument.generateMRZCheckDigit(
      value.slice(13, 19)
    )) {
      throw new EvalError(
        `Check digit '${value[19]}' does not match for the check digit on the` +
            ` date of birth.`
      );
    }
    if (value[27] !== TravelDocument.generateMRZCheckDigit(
      value.slice(21, 27)
    )) {
      throw new EvalError(
        `Check digit '${value[27]}' does not match for the check digit on the` +
            ` valid thru date.`
      );
    }
    this.number = value.slice(0, 9).replace(/</gi, "");
    this.nationalityCode = value.slice(10, 13).replace(/</gi, "");
    this.birthDate = `${getFullYearFromString(value.slice(13, 15))}-` +
        `${value.slice(15, 17)}-${value.slice(17, 19)}`;
    this.genderMarker = value[20] === "<" ? "X" : value[20];
    this.validThru = `${getFullYearFromString(value.slice(21, 23))}-` +
        `${value.slice(23, 25)}-${value.slice(25, 27)}`;
    this.optionalData = value.slice(28).replace(/</gi, " ").trimEnd();
  }

  /**
   * The full Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get machineReadableZone() {
    return this.mrzLine1 + this.mrzLine2;
  }
  /**
   * @param { string } value - A MRZ string of a 88-character length.
   */
  set machineReadableZone(value) {
    if (value.length !== 88) {
      throw new RangeError(
        `Length '${value.length} does not match the length of a MRV-A ` +
            `Machine-Readable Zone (MRZ).`
      );
    }
    this.mrzLine1 = value.slice(0, 44);
    this.mrzLine2 = value.slice(44);
  }

  // Functions to be assigned to properties `toMRZ` and `toVIZ` when set.
  static #fullNameToMRZ = function() {
    return TravelDocument.fullNameMRZ(this, 39);
  }
  static #optionalDataToMRZ = function() {
    return TravelDocument.optionalDataMRZ(this, 16);
  }
}

export { MRVADocument };
