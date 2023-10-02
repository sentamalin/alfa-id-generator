/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { TravelDocument } from "./icao9303/TravelDocument.js";
import { TD1Document } from "./icao9303/TD1Document.js";
import { DigitalSeal } from "./icao9303/DigitalSeal.js";
import { DigitalSealV4 } from "./icao9303/DigitalSealV4.js";

/** `CrewID` describes an ALFA Crewmember Identification Badge, a TD1-sized
 *  identification document with a visible digital seal (VDS) that has a
 *  Machine-Readable Zone (MRZ). Though it resembles a machine-readable
 *  travel document (MRTD), its purpose is to identify furries belonging
 *  to an organization versus identifying furries across authority
 *  borders. Consequently, many of the properties in full MRTDs are
 *  not utilized for these documents.
 * 
 * @mixes TD1Document
 * @mixes DigitalSealV4
 */
class CrewID {
  #document = new TD1Document();
  #seal = new DigitalSealV4({
    typeCategory: 0x08,
    featureDefinition: 0x01
  });

  /** A code identifying the document type.
   * @type { String }
   */
  get typeCode() { return this.#document.typeCode; }
  /** @param { string } value - A 1-2 character string consisting of the letters A-Z. */
  set typeCode(value) {
    this.#document.typeCode = value;
    this.#setDigitalSealMRZ();
  }

  /** A code identifying the authority who issued this document.
   * @type { String }
   */
  get authorityCode() { return this.#document.authorityCode; }
  /** @param { string } value - A 3-character string consisting of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ. */
  set authorityCode(value) {
    this.#document.authorityCode = value;
    this.#seal.authorityCode = value;
    this.#setDigitalSealMRZ();
  }

  /** An identity document number unique for this document.
   * @type { String }
   */
  get number() { return this.#document.number; }
  /** @param { string } value - A string no longer than 9 characters consisting of the characters 0-9 and A-Z. */
  set number(value) {
    this.#document.number = value;
    this.#setDigitalSealMRZ();
  }

  /** The last date on which this document is valid.
   * @type { Date }
   */
  get expirationDate() { return this.#document.expirationDate; }
  /** @param { string } value - A calendar date string in YYYY-MM-DD format. */
  set expirationDate(value) {
    this.#document.expirationDate = value;
    this.#setDigitalSealMRZ();
  }

  /** The document holder's full name.
   * @type { String }
   */
  get fullName() { return this.#document.fullName; }
  /** @param { string } value - A ', ' separates the document holder's primary identifier from their secondary identifiers. A '/' separates the full name in a non-Latin national language from a transcription/transliteration into the Latin characters A-Z. */
  set fullName(value) {
    this.#document.fullName = value;
    this.#setDigitalSealMRZ();
  }

  /** Optional data to include in the Machine-Readable Zone (MRZ).
   * @type { String }
   */
  get optionalData() { return this.#document.optionalData; }
  /** @param { string } value - Up to 26 characters. Valid characters are from the ranges 0-9 and A-Z. */
  set optionalData(value) { this.#document.optionalData = value; }

  /** A path/URL to an image, or an image object, representing a photo of the document holder.
   * @type { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame }
   */
  get picture() { return this.#document.picture; }
  /** @param { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame } value */
  set picture(value) { this.#document.picture = value; }

  /** A URL chosen by the document holder to store in the front barcode area and in place of a visible digital seal (VDS) in the back barcode area.
   * @type { string }
   */
  url;

  #employer;
  /** The full name of the employer who employs or contracts the document holder.
   * @type { String }
   */
  get employer() { return this.#employer; }
  /** @param { string } value */
  set employer(value) {
    this.#employer = new String(value);
    this.#employer.toVIZ = CrewID.#employerToVIZ;
  }

  /** The first line of the Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get mrzLine1() { return this.#document.mrzLine1; }
  /** @param { string } value - A MRZ line string of a 30-character length. */
  set mrzLine1(value) { this.#document.mrzLine1 = value; }

  /** The second line of the Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get mrzLine2() {
    let uncheckedLine = "<<<<<<0<" +
      this.expirationDate.toMRZ() +
      TravelDocument.generateMRZCheckDigit(this.expirationDate.toMRZ()) +
      "XXX" +
      this.optionalData.toMRZ().slice(15);
    return uncheckedLine +
      TravelDocument.generateMRZCheckDigit(
        this.mrzLine1.slice(5) +
        uncheckedLine.slice(0,7) +
        uncheckedLine.slice(8,15) +
        uncheckedLine.slice(18)
      );
  }
  /** @param { string } value - A MRZ line string of a 30-character length. */
  set mrzLine2(value) {}

  /** The third line of the Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get mrzLine3() { return this.#document.mrzLine3; }
  /** @param { string } value - A MRZ line string of a 30-character length. */
  set mrzLine3(value) { this.#document.mrzLine3 = value; }

  /** The full Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get machineReadableZone() {
    return this.mrzLine1 +
      "\n" +
      this.mrzLine2 +
      "\n" +
      this.mrzLine3;
  }
  /** @param { string } value - A MRZ string of a 90-character length. */
  set machineReadableZone(value) {}

  /** A combination of a two-letter authority code and of two alphanumeric characters to identify a signer within the issuing authority.
   * @type { string }
   */
  get identifierCode() { return this.#seal.identifierCode; }
  /** @param { string } value - A 4-character string consisting of the characters 0-9 and A-Z. */
  set identifierCode(value) { this.#seal.identifierCode = value; }

  /** A hex-string that uniquely identifies a certificate for a given signer.
   * @type { string }
   */
  get certReference() { return this.#seal.certReference; }
  /** @param { string } value - A hex string. */
  set certReference(value) { this.#seal.certReference = value; }

  /** A date string on which the document was issued.
   * @type { string }
   */
  get issueDate() { return this.#seal.issueDate; }
  /** @param { string } value - A calendar date string in YYYY-MM-DD format. */
  set issueDate(value) { this.#seal.issueDate = value; }

  /** A date string on which the seal was signed.
   * @type { string }
   */
  get sealSignatureDate() { return this.#seal.signatureDate; }
  /** @param { string } value - A calendar date string in YYYY-MM-DD format. */
  set sealSignatureDate(value) { this.#seal.signatureDate = value; }

  /** The raw signature data generated by concatenating the header and message zone, hashing the result, and signing the hash with a cryptographic key.
   * @type { number[] }
   */
  get sealSignature() { return this.#seal.signature; }
  /** @param { number[] } value */
  set sealSignature(value) { this.#seal.signature = value; }

  /** The header zone of the VDS as defined by ICAO 9303 part 13.
   * @type { number[] }
   */
  get headerZone() { return this.#seal.headerZone; }
  /** @param { number[] } value */
  set headerZone(value) {
    this.#seal.headerZone = value;
    this.#document.authorityCode = this.#seal.authorityCode;
  }

  /** The message zone of the VDS; a binary TLV representation of all key-values set in `this.features`.
   * @type { number[] }
   */
  get messageZone() { return this.#seal.messageZone; }
  /** @param { number[] } value */
  set messageZone(value) {
    this.#seal.messageZone = value;
    this.#setAllValuesFromDigitalSeal();
  }

  /** The signature zone of the VDS as a TLV of the signature marker, its length in BER/DER definite length form, and the raw signature data.
   * @type { number[] }
   */
  get sealSignatureZone() { return this.#seal.signatureZone; }
  /** @param { number[] } value */
  set sealSignatureZone(value) { this.#seal.signatureZone = value; }

  /** A concatenation of the header zone and the message zone of the VDS.
   * @type { number[] }
   */
  get unsignedSeal() { return this.#seal.unsignedSeal; }
  /** @param { number[] } value */
  set unsignedSeal(value) {
    this.#seal.unsignedSeal = value;
    this.#setAllValuesFromDigitalSeal();
  }

  /** A concatenation of the header zone, the message zone, and the signature zone of the VDS.
   * @type { number[] }
   */
  get signedSeal() { return this.#seal.signedSeal; }
  /** @param { number[] } value */
  set signedSeal(value) {
    this.#seal.signedSeal = value;
    this.#setAllValuesFromDigitalSeal();
  }

  /** A hex-string defined by the issuing authority for the employer that employs or contracts the document holder.
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
  /** @param { string } code - A hex string up to 8 characters long. */
  set employerCode(code) {
    if (code.length > 8) {
      throw new RangeError(
        `Length '${code.length}' of employer code must be 8 characters or less.`
      );
    }
    const input = [];
    const paddedType = code.padStart(8, "0");
    let previousIsZero = true;
    for (let i = 0; i < paddedType.length; i += 2) {
      if ((parseInt(paddedType.slice(i, i + 2), 16) === 0) && previousIsZero === true) {
        continue;
      }
      input.push(parseInt(paddedType.slice(i, i + 2), 16));
      previousIsZero = false;
    }
    this.#seal.features.set(0x02, input);
  }

  /* Functions to be assigned to properties `toMRZ` and `toVIZ` when set. */
  static #employerToVIZ = function() {
    return this.toUpperCase();
  }

  /** Create a new `CrewID`.
   * @param { Object } [opt] - An options object.
   * @param { string } [opt.typeCode] - A 1-2 character string consisting of the letters A-Z.
   * @param { string } [opt.authorityCode] - A 3-character string consisting of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   * @param { string } [opt.number] - A string no longer than 9 characters consisting of the characters 0-9 and A-Z.
   * @param { string } [opt.expirationDate] - A calendar date string in YYYY-MM-DD format.
   * @param { string } [opt.fullName] - A ', ' separates the document holder's primary identifier from their secondary identifiers. A '/' separates the full name in a non-Latin national language from a transcription/transliteration into the Latin characters A-Z.
   * @param { string } [opt.optionalData] - Up to 26 characters. Valid characters are from the ranges 0-9 and A-Z.
   * @param { string } [opt.mrzLine1] - A MRZ line string of a 30-character length.
   * @param { string } [opt.mrzLine2] - A MRZ line string of a 30-character length.
   * @param { string } [opt.mrzLine3] - A MRZ line string of a 30-character length.
   * @param { string } [opt.machineReadableZone] - A MRZ string of a 90-character length.
   * @param { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame } [opt.picture] - A path/URL to an image, or an image object, representing a photo of the document holder.
   * @param { string } [opt.url] - A URL chosen by the document holder to store in the front barcode area and in place of a visible digital seal (VDS) in the back barcode area.
   * @param { string } [opt.employer] - The full name of the employer who employs or contracts the document holder.
   * @param { string } [opt.identifierCode] - A 4-character string consisting of the characters 0-9 and A-Z.
   * @param { string } [opt.certReference] - A hex-string that uniquely identifies a certificate for a given signer.
   * @param { string } [opt.issueDate] - A calendar date string in YYYY-MM-DD format.
   * @param { string } [opt.sealSignatureDate] - A calendar date string in YYYY-MM-DD format.
   * @param { number[] } [opt.sealSignature] - The raw signature data generated by concatenating the header and message zone, hashing the result, and signing the hash with a cryptographic key.
   * @param { number[] } [opt.headerZone] - The header zone of the VDS as defined by ICAO 9303 part 13.
   * @param { number[] } [opt.messageZone] - The message zone of the VDS; a binary TLV representation of all key-values set in `this.features`.
   * @param { number[] } [opt.sealSignatureZone] - The signature zone of the VDS as a TLV of the signature marker, its length in BER/DER definite length form, and the raw signature data.
   * @param { number[] } [opt.unsignedSeal] - A concatenation of the header zone and the message zone of the VDS.
   * @param { number[] } [opt.signedSeal] - A concatenation of the header zone, the message zone, and the signature zone of the VDS.
   * @param { string } [opt.employerCode] - A hex string up to 8 characters long.
   */
  constructor(opt) {
    this.employer = "Unknown";
    
    if (opt) {
      if (opt.typeCode) { this.typeCode = opt.typeCode; }
      if (opt.authorityCode) { this.authorityCode = opt.authorityCode; }
      if (opt.number) { this.number = opt.number; }
      if (opt.expirationDate) { this.expirationDate = opt.expirationDate; }
      if (opt.fullName) { this.fullName = opt.fullName; }
      if (opt.optionalData) { this.optionalData = opt.optionalData; }
      if (opt.mrzLine1) { this.mrzLine1 = opt.mrzLine1; }
      if (opt.mrzLine2) { this.mrzLine2 = opt.mrzLine2; }
      if (opt.mrzLine3) { this.mrzLine3 = opt.mrzLine3; }
      if (opt.machineReadableZone) { this.machineReadableZone = opt.machineReadableZone; }
      if (opt.picture) { this.picture = opt.picture; }
      if (opt.url) { this.url = opt.url; }
      if (opt.employer) { this.employer = opt.employer; }
      if (opt.identifierCode) { this.identifierCode = opt.identifierCode; }
      if (opt.certReference) { this.certReference = opt.certReference; }
      if (opt.issueDate) { this.issueDate = opt.issueDate; }
      if (opt.sealSignatureDate) { this.sealSignatureDate = opt.sealSignatureDate; }
      if (opt.sealSignature) { this.sealSignature = opt.sealSignature; }
      if (opt.headerZone) { this.headerZone = opt.headerZone; }
      if (opt.messageZone) { this.messageZone = opt.messageZone; }
      if (opt.sealSignatureZone) { this.sealSignatureZone = opt.sealSignatureZone; }
      if (opt.unsignedSeal) { this.unsignedSeal = opt.unsignedSeal; }
      if (opt.signedSeal) { this.signedSeal = opt.signedSeal; }
      if (opt.employerCode) { this.employerCode = opt.employerCode; }
    }
  }

  /** Set the visible digital seal's (VDS) Machine-Readable Zone (MRZ) when setting any properties shown on the MRZ. */
  #setDigitalSealMRZ() {
    this.#seal.features.set(0x01, DigitalSeal.c40Encode(
      this.mrzLine1.slice(0, 15) +
      this.mrzLine2.slice(0, 18) +
      this.mrzLine3
    ));
  }

  /** Re-set all properties using values from the visible digital seal (VDS) when setting the VDS header, message, or signature zones. */
  #setAllValuesFromDigitalSeal() {
    const twoDigitYearStart = 32;
    const sealMRZ = DigitalSeal.c40Decode(this.#seal.features.get(0x01));
    this.#document.typeCode = sealMRZ.slice(0, 2).trimEnd();
    this.#document.authorityCode = sealMRZ.slice(2, 5).trimEnd();
    if (sealMRZ[14] !== TravelDocument.generateMRZCheckDigit(sealMRZ.slice(5, 14).replace(/ /gi, "<"))) {
      throw new EvalError(
        `Document number check digit '${sealMRZ[45]}' does not match for document number '${sealMRZ.slice(5, 14).replace(/ /gi, "<")}'.`
      );
    } else {
      this.#document.number = sealMRZ.slice(5, 14).trimEnd();
    }
    if (sealMRZ[29] !== TravelDocument.generateMRZCheckDigit(sealMRZ.slice(23, 29).replace(/ /gi, "<"))) {
      throw new EvalError(
        `Date of expiration check digit '${sealMRZ[29]}' does not match for date of expiration '${sealMRZ.slice(23, 29).replace(/ /gi, "<")}'.`
      );
    } else {
      const yearExpiration = sealMRZ.slice(23, 25);
      const monthExpiration = sealMRZ.slice(25, 27);
      const dayExpiration = sealMRZ.slice(27, 29);
      this.#document.expirationDate = `20${yearExpiration}-${monthExpiration}-${dayExpiration}`;
    }
    this.#document.fullName = sealMRZ.slice(33).replace("  ", ", ").trimEnd();
  }
}

export { CrewID }