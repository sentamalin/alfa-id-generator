// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

import { TD1Document } from "./icao9303/td1document.js";
import { DigitalSealV4 } from "./icao9303/digitalsealv4.js";
import { DEFAULT_PHOTO } from "./icao9303/utilities/default-images.js";
import { getFullYearFromString } from "./icao9303/utilities/get-full-year-from-string.js";
import { generateMRZCheckDigit } from "./icao9303/utilities/generate-mrz-check-digit.js";
import { c40Encode } from "./icao9303/utilities/c40-encode.js";
import { c40Decode } from "./icao9303/utilities/c40-decode.js";
import { validateHexString } from "./icao9303/utilities/validate-hex-string.js";

/**
 * `CrewID` describes an ALFA Crewmember Identification Badge, a TD1-sized
 *     identification document with a visible digital seal (VDS) that has a
 *     Machine-Readable Zone (MRZ). Though it resembles a machine-readable
 *     travel document (MRTD), its purpose is to identify furries belonging to
 *     an organization versus identifying furries across authority borders.
 *     Consequently, many of the properties in full MRTDs are not utilized for
 *     these documents.
 */
export class CrewID {
  /**
   * Create a `CrewID`.
   * @param { Object } [opt] - An options object.
   * @param { string } [opt.typeCode] - A 1-2 character string consisting of the
   *     letters A-Z.
   * @param { string } [opt.authorityCode] - A 3-character string consisting of
   *     the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned
   *     ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   * @param { string } [opt.number] - A string no longer than 9 characters
   *     consisting of the characters 0-9 and A-Z.
   * @param { string | Date } [opt.expirationDate] - A calendar date string in
   *     YYYY-MM-DD format or a `Date` object.
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
   * @param { string | HTMLImageElement | SVGImageElement | HTMLVideoElement
   *     | HTMLCanvasElement | ImageBitmap | OffscreenCanvas |
   *     VideoFrame } [opt.photo] - A path/URL to an image, or an image
   *     object, representing a photo of the document holder.
   * @param { string } [opt.url] - A URL chosen by the document holder to
   *     store in the front barcode area and in place of a visible digital seal
   *     (VDS) in the back barcode area.
   * @param { string } [opt.employer] - The full name of the employer who
   *     employs or contracts the document holder.
   * @param { string } [opt.identifierCode] - A 4-character string consisting of
   *     the characters 0-9 and A-Z.
   * @param { string } [opt.certReference] - A hex-string that uniquely
   *     identifies a certificate for a given signer.
   * @param { string | Date } [opt.issueDate] - A calendar date string in
   *     YYYY-MM-DD format or a `Date` object.
   * @param { string | Date } [opt.signatureDate] - A calendar date string in
   *     YYYY-MM-DD format or a `Date` object.
   * @param { number[] } [opt.signatureData] - The raw signature data generated
   *     by concatenating the header and message zone, hashing the result, and
   *     signing the hash with a cryptographic key.
   * @param { number[] } [opt.headerZone] - The header zone of the VDS as
   *     defined by ICAO 9303 part 13.
   * @param { number[] } [opt.messageZone] - The message zone of the VDS as
   *     defined by ICAO 9303 part 13.
   * @param { number[] } [opt.signatureZone] - The signature zone of the VDS as
   *     a TLV of the signature marker, its length in BER/DER definite length
   *     form, and the raw signature data.
   * @param { number[] } [opt.unsignedSeal] - A concatenation of the header zone
   *     and the message zone of the VDS.
   * @param { number[] } [opt.signedSeal] - A concatenation of the header zone,
   *     the message zone, and the signature zone of the VDS.
   * @param { string } [opt.employerCode] - A hex string up to 8 characters
   *     long.
   */
  constructor(opt) {
    this.#document = new TD1Document();
    this.#seal = new DigitalSealV4({
      typeCategory: 0x08,
      featureDefinition: 0x01
    });

    this.typeCode = opt?.typeCode ?? "I";
    this.authorityCode = opt?.authorityCode ?? "UTO";
    this.number = opt?.number ?? "D23145890";
    this.expirationDate = opt?.expirationDate ?? "2012-04-15";
    this.fullName = opt?.fullName ?? "Eriksson, Anna-Maria";
    this.optionalData = opt?.optionalData ?? "";
    this.photo = opt?.photo ?? DEFAULT_PHOTO;
    this.url = opt?.url ?? "http://example.org";
    this.employer = opt?.employer ?? "Unknown";
    this.identifierCode = opt?.identifierCode ?? "UTSS";
    this.certReference = opt?.certReference ?? "00000";
    this.issueDate = opt?.issueDate ?? "2007-04-15";
    this.signatureDate = opt?.signatureDate ?? "2007-04-15";
    this.signatureData = opt?.signatureData ?? Array(64).fill(0);
    this.employerCode = opt?.employerCode ?? "0";

    if (opt?.mrzLine1) { this.mrzLine1 = opt.mrzLine1; }
    if (opt?.mrzLine2) { this.mrzLine2 = opt.mrzLine2; }
    if (opt?.mrzLine3) { this.mrzLine3 = opt.mrzLine3; }
    if (opt?.machineReadableZone) {
      this.machineReadableZone = opt.machineReadableZone;
    }
    if (opt?.headerZone) { this.headerZone = opt.headerZone; }
    if (opt?.messageZone) { this.messageZone = opt.messageZone; }
    if (opt?.signatureZone) { this.signatureZone = opt.signatureZone; }
    if (opt?.unsignedSeal) { this.unsignedSeal = opt.unsignedSeal; }
    if (opt?.signedSeal) { this.signedSeal = opt.signedSeal; }
  }

  // The objects `CrewID` uses to compose itself.
  #document;
  #seal;

  /**
   * A code identifying the document type.
   * @type { String }
   */
  get typeCode() { return this.#document.typeCode; }
  /**
   * @param { string } value - A 1-2 character string consisting of the letters
   *     A-Z.
   */
  set typeCode(value) {
    this.#document.typeCode = value;
    this.#setDigitalSealMRZ();
  }

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
  set authorityCode(value) {
    this.#document.authorityCode = value;
    this.#seal.authorityCode = value;
    this.#setDigitalSealMRZ();
  }

  /**
   * An identity document number unique for this document.
   * @type { String }
   */
  get number() { return this.#document.number; }
  /**
   * @param { string } value - A string no longer than 9 characters consisting
   *     of the characters 0-9 and A-Z.
   */
  set number(value) {
    this.#document.number = value;
    this.#setDigitalSealMRZ();
  }

  /**
   * The last date on which this document is valid.
   * @type { Date }
   */
  get expirationDate() { return this.#document.expirationDate; }
  /**
   * @param { string | Date } value - A calendar date string in YYYY-MM-DD
   *     format or a `Date` object.
   */
  set expirationDate(value) {
    this.#document.expirationDate = value;
    this.#setDigitalSealMRZ();
  }

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
    this.#setDigitalSealMRZ();
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
  set optionalData(value) { this.#document.optionalData = value; }

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
   * A URL chosen by the document holder to store in the front barcode area and
   *     in place of a visible digital seal (VDS) in the back barcode area.
   * @type { string }
   */
  url;

  #employer;
  /**
   * The full name of the employer who employs or contracts the document holder.
   * @type { String }
   */
  get employer() { return this.#employer; }
  /**
   * @param { string } value
   */
  set employer(value) {
    this.#employer = new String(value);
    this.#employer.toVIZ = CrewID.#employerToVIZ;
  }

  /**
   * The first line of the Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get mrzLine1() { return this.#document.mrzLine1; }
  /**
   * @param { string } value - A MRZ line string of a 30-character length.
   */
  set mrzLine1(value) { this.#document.mrzLine1 = value; }

  /**
   * The second line of the Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get mrzLine2() {
    const UNCHECKED_LINE = "<<<<<<0<" +
        this.expirationDate.toMRZ() +
        generateMRZCheckDigit(this.expirationDate.toMRZ()) +
        "XXX" +
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
        `Length '${value.length}' does not match the length of a TD1-sized` + 
            `Machine Readable-Zone (MRZ) line.`
      );
    }
    if (value[14] !== generateMRZCheckDigit(
      value.slice(8, 14)
    )) {
      throw new EvalError(
        `Check digit '${value[14]}' does not match for the check digit on the` +
            `date of expiration.`
      );
    }
    this.expirationDate = `${getFullYearFromString(value.slice(8, 10))}-` +
        `${value.slice(10, 12)}-${value.slice(12, 14)}`;
  }

  /**
   * The third line of the Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get mrzLine3() { return this.#document.mrzLine3; }
  /**
   * @param { string } value - A MRZ line string of a 30-character length.
   */
  set mrzLine3(value) { this.#document.mrzLine3 = value; }

  /**
   * The full Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get machineReadableZone() {
    return this.mrzLine1 +
        this.mrzLine2 +
        this.mrzLine3;
  }
  /**
   * @param { string } value - A MRZ string of a 90-character length.
   */
  set machineReadableZone(value) {
    if (value.length !== 90) {
      throw new RangeError(
        `Length '${value.length}' does not match the length of a TD1-sized` +
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
            `Machine-Readable Zone (MRZ) lines 1 and 2.`
      );
    }
    this.mrzLine1 = value.slice(0, 30);
    this.mrzLine2 = value.slice(30, 60);
    this.mrzLine3 = value.slice(60);
    this.optionalData = (
      value.slice(15, 30) + value.slice(48, 59)
    ).replace(/</gi, " ").trimEnd();
  }

  /**
   * A combination of a two-letter authority code and of two alphanumeric
   *     characters to identify a signer within the issuing authority.
   * @type { string }
   */
  get identifierCode() { return this.#seal.identifierCode; }
  /**
   * @param { string } value - A 4-character string consisting of the characters
   *     0-9 and A-Z.
   */
  set identifierCode(value) { this.#seal.identifierCode = value; }

  /**
   * A hex-string that uniquely identifies a certificate for a given signer.
   * @type { string }
   */
  get certReference() { return this.#seal.certReference; }
  /**
   * @param { string } value - A hex string.
   */
  set certReference(value) { this.#seal.certReference = value; }

  /**
   * The date on which the document was issued.
   * @type { Date }
   */
  get issueDate() { return this.#seal.issueDate; }
  /**
   * @param { string | Date } value - A calendar date string in YYYY-MM-DD
   *     format or a `Date` object.
   */
  set issueDate(value) { this.#seal.issueDate = value; }

  /**
   * The date on which the seal was signed.
   * @type { Date }
   */
  get signatureDate() { return this.#seal.signatureDate; }
  /**
   * @param { string | Date } value - A calendar date string in YYYY-MM-DD
   *     format or a `Date` object.
   */
  set signatureDate(value) { this.#seal.signatureDate = value; }

  /**
   * The raw signature data generated by concatenating the header and message
   *     zone, hashing the result, and signing the hash with a cryptographic
   *     key.
   * @type { number[] }
   */
  get signatureData() { return this.#seal.signatureData; }
  /**
   * @param { number[] } value
   */
  set signatureData(value) { this.#seal.signatureData = value; }

  /**
   * The header zone of the VDS as defined by ICAO 9303 part 13.
   * @type { number[] }
   */
  get headerZone() { return this.#seal.headerZone; }
  /**
   * @param { number[] } value
   */
  set headerZone(value) {
    this.#seal.headerZone = value;
    this.#document.authorityCode = this.#seal.authorityCode;
  }

  /**
   * The message zone of the VDS as defined by ICAO 9303 part 13.
   * @type { number[] }
   */
  get messageZone() { return this.#seal.messageZone; }
  /**
   * @param { number[] } value
   */
  set messageZone(value) {
    this.#seal.messageZone = value;
    this.#setAllValuesFromDigitalSeal();
  }

  /**
   * The signature zone of the VDS as a TLV of the signature marker, its length
   *     in BER/DER definite length form, and the raw signature data.
   * @type { number[] }
   */
  get signatureZone() { return this.#seal.signatureZone; }
  /**
   * @param { number[] } value
   */
  set signatureZone(value) { this.#seal.signatureZone = value; }

  /**
   * A concatenation of the header zone and the message zone of the VDS.
   * @type { number[] }
   */
  get unsignedSeal() { return this.#seal.unsignedSeal; }
  /**
   * @param { number[] } value
   */
  set unsignedSeal(value) {
    this.#seal.unsignedSeal = value;
    this.#setAllValuesFromDigitalSeal();
  }

  /**
   * A concatenation of the header zone, the message zone, and the signature
   *     zone of the VDS.
   * @type { number[] }
   */
  get signedSeal() { return this.#seal.signedSeal; }
  /**
   * @param { number[] } value
   */
  set signedSeal(value) {
    this.#seal.signedSeal = value;
    this.#setAllValuesFromDigitalSeal();
  }

  /**
   * A hex-string defined by the issuing authority for the employer that employs
   *     or contracts the document holder.
   * @type { string }
   */
  get employerCode() {
    let output = "";
    const employerCode = this.#seal.features.get(0x02);
    for (let i = 0; i < employerCode.length; i += 1) {
      output += employerCode[i].toString(16).padStart(2, "0").toUpperCase();
    }
    return output;
  }
  /**
   * @param { string } code - A hex string up to 8 characters long.
   */
  set employerCode(code) {
    const isInvalid = validateHexString(code, { minimum: 1, maximum: 8 });
    if (isInvalid) {
      throw new RangeError(
        `Value set on 'employerCode' has errors: ${isInvalid}`
      );
    }
    const input = [];
    const PADDED_CODE = code.padStart(8, "0");
    let previousIsZero = true;
    for (let i = 0; i < PADDED_CODE.length; i += 2) {
      if ((parseInt(PADDED_CODE.slice(i, i + 2), 16) === 0) &&
          previousIsZero === true) {
        continue;
      }
      input.push(parseInt(PADDED_CODE.slice(i, i + 2), 16));
      previousIsZero = false;
    }
    this.#seal.features.set(0x02, input);
  }

  // Functions to be assigned to properties `toMRZ` and `toVIZ` when set.
  static #employerToVIZ = function() {
    return this.toUpperCase();
  }

  /**
   * Set the visible digital seal's (VDS) Machine-Readable Zone (MRZ) when
   *     setting any properties shown on the MRZ.
   */
  #setDigitalSealMRZ() {
    this.#seal.features.set(0x01, c40Encode(
      this.mrzLine1.slice(0, 15) +
      this.mrzLine2.slice(0, 18) +
      this.mrzLine3
    ));
  }

  /**
   * Re-set all properties using values from the visible digital seal (VDS) when
   *     setting the VDS header, message, or signature zones.
   */
  #setAllValuesFromDigitalSeal() {
    const SEAL_MRZ = c40Decode(this.#seal.features.get(0x01));
    this.#document.typeCode = SEAL_MRZ.slice(0, 2).trimEnd();
    this.#document.authorityCode = SEAL_MRZ.slice(2, 5).trimEnd();
    if (SEAL_MRZ[14] !== generateMRZCheckDigit(
      SEAL_MRZ.slice(5, 14).replace(/ /gi, "<")
    )) {
      throw new EvalError(
        `Document number check digit '${SEAL_MRZ[45]}' does not match for` +
            `document number '${SEAL_MRZ.slice(5, 14).replace(/ /gi, "<")}'.`
      );
    }
    if (SEAL_MRZ[29] !== generateMRZCheckDigit(
      SEAL_MRZ.slice(23, 29).replace(/ /gi, "<")
    )) {
      throw new EvalError(
        `Date of expiration check digit '${SEAL_MRZ[29]}' does not match for` +
            `date of expiration '${SEAL_MRZ.slice(23, 29).replace(/ /gi, "<")}'.`
      );
    }
    this.#document.number = SEAL_MRZ.slice(5, 14).trimEnd();
    const EXPIRATION_YEAR = SEAL_MRZ.slice(23, 25);
    const EXPIRATION_MONTH = SEAL_MRZ.slice(25, 27);
    const EXPIRATION_DAY = SEAL_MRZ.slice(27, 29);
    this.#document.expirationDate =
        `${getFullYearFromString(EXPIRATION_YEAR)}-${EXPIRATION_MONTH}-` +
        `${EXPIRATION_DAY}`;
    this.#document.fullName = SEAL_MRZ.slice(33).replace("  ", ", ").trimEnd();
  }
}
