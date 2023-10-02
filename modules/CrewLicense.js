/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { TravelDocument } from "./icao9303/TravelDocument.js";
import { TD1Document } from "./icao9303/TD1Document.js"
import { DigitalSeal } from "./icao9303/DigitalSeal.js";
import { DigitalSealV4 } from "./icao9303/DigitalSealV4.js";

/** `CrewLicense` describes an ALFA Crewmember License, a TD1-sized
 *  machine-readable travel document (MRTD) with a visible digital seal
 *  (VDS). The size of a credit card, this identification document shows
 *  a furry is privileged to perform a specific function granted by an
 *  issuing authority. Example privileges are driving vehicles on land,
 *  on sea, or in the air; or possessing the competency to carry and
 *  operate specific items.
 * 
 * @mixes TD1Document
 * @mixes DigitalSealV4
 */
class CrewLicense {
  #document = new TD1Document();
  #seal = new DigitalSealV4({
    typeCategory: 0x06,
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

  /** The document holder's date of birth.
   * @type { Date }
   */
  get birthDate() { return this.#document.birthDate; }
  /** @param { string } value - A calendar date string in YYYY-MM-DD format. */
  set birthDate(value) {
    this.#document.birthDate = value;
    this.#setDigitalSealMRZ();
  }

  /** A marker representing the document holder's gender.
   * @type { String }
   */
  get genderMarker() { return this.#document.genderMarker; }
  /** @param { string } value - The character 'F', 'M', or 'X'. */
  set genderMarker(value) {
    this.#document.genderMarker = value;
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

  /** A code identifying the document holder's nationality (or lack thereof).
   * @type { String }
   */
  get nationalityCode() { return this.#document.nationalityCode; }
  /** @param { string } value - A 3-character string consisting of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ. */
  set nationalityCode(value) {
    this.#document.nationalityCode = value;
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

  /** A path/URL to an image, or an image object, representing the signature or usual mark of the document holder.
   * @type { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame }
   */
  get signature() { return this.#document.signature; }
  /** @param { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame } value */
  set signature(value) { this.#document.signature = value; }

  /** A URL chosen by the document holder to store in the barcode area in place of a visible digital seal (VDS).
   * @type { string }
   */
  url;

  #subauthority;
  /** The full name of the issuing (sub)authority who issued the document.
   * @type { String }
   */
  get subauthority() { return this.#subauthority; }
  /** @param { string } value */
  set subauthority(value) {
    this.#subauthority = new String(value);
    this.#subauthority.toVIZ = CrewLicense.#setThisToUppercase;
  }

  #privilege;
  /** The title or description of the privilege granted by the issuing (sub)authority.
   * @type { String }
   */
  get privilege() { return this.#privilege; }
  /** @param { string } value */
  set privilege(value) {
    this.#privilege = new String(value);
    this.#privilege.toVIZ = CrewLicense.#setThisToUppercase;
  }

  #ratings;
  /** A notation regarding any authorizations beyond the granted privilege--like specific aircraft types.
   * @type { String }
   */
  get ratings() { return this.#ratings; }
  /** @param { string } value */
  set ratings(value) {
    this.#ratings = new String(value);
    this.#ratings.toVIZ = CrewLicense.#setThisToUppercase;
  }

  #limitations;
  /** A notation regarding any restrictions that would otherwise be granted with the granted privilege or ratings.
   * @type { String }
   */
  get limitations() { return this.#limitations; }
  /** @param { string } value */
  set limitations(value) {
    this.#limitations = new String(value);
    this.#limitations.toVIZ = CrewLicense.#setThisToUppercase;
  }

  /** The first line of the Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get mrzLine1() { return this.#document.mrzLine1; }
  /** @param { string } value - A MRZ line string of a 30-character length. */
  set mrzLine1(value) {
    this.#document.mrzLine1 = value;
    this.#setDigitalSealMRZ();
  }

  /** The second line of the Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get mrzLine2() { return this.#document.mrzLine2; }
  /** @param { string } value - A MRZ line string of a 30-character length. */
  set mrzLine2(value) {
    this.#document.mrzLine2 = value;
    this.#setDigitalSealMRZ();
  }

  /** The third line of the Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get mrzLine3() { return this.#document.mrzLine3; }
  /** @param { string } value - A MRZ line string of a 30-character length. */
  set mrzLine3(value) {
    this.#document.mrzLine3 = value;
    this.#setDigitalSealMRZ();
  }

  /** The full Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get machineReadableZone() { return this.#document.machineReadableZone; }
  /** @param { string } value - A MRZ string of a 90-character length. */
  set machineReadableZone(value) {
    this.#document.machineReadableZone = value;
    this.#setDigitalSealMRZ();
  }

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

  /** A hex-string defined by the issuing authority for the (sub)authority that issued the document.
   * @type { string }
   */
  get subauthorityCode() {
    let output = "";
    const subauthorityCode = this.#seal.features.get(0x02);
    for (let i = 0; i < subauthorityCode.length; i += 1) {
      output += subauthorityCode[i].toString(16).padStart(2, "0").toUpperCase();
    }
    return output;
  }
  /** @param { string } code - A hex string up to 8 characters long. */
  set subauthorityCode(code) {
    if (code.length > 8) {
      throw new RangeError(
        `Length '${code.length}' of (sub)authority code must be 8 characters or less.`
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

  /** A hex-string defined by the issuing (sub)authority for the granted privilege.
   * @type { string }
   */
  get privilegeCode() {
    let output = "";
    const privilegeCode = this.#seal.features.get(0x03);
    for (let i = 0; i < privilegeCode.length; i += 1) {
      output += privilegeCode[i].toString(16).padStart(2, "0").toUpperCase();
    }
    return output;
  }
  /** @param { string } code - A hex string up to 8 characters long. */
  set privilegeCode(code) {
    if (code.length > 8) {
      throw new RangeError(
        `Length '${code.length}' of privilege code must be 8 characters or less.`
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
    this.#seal.features.set(0x03, input);
  }

  /* Functions to be assigned to properties `toMRZ` and `toVIZ` when set. */
  static #setThisToUppercase = function() {
    return this.toUpperCase();
  }

  /** Create a new `CrewLicense`.
   * @param { Object } [opt] - An options object.
   * @param { string } [opt.typeCode] - A 1-2 character string consisting of the letters A-Z.
   * @param { string } [opt.authorityCode] - A 3-character string consisting of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   * @param { string } [opt.number] - A string no longer than 9 characters consisting of the characters 0-9 and A-Z.
   * @param { string } [opt.birthDate] - A calendar date string in YYYY-MM-DD format.
   * @param { string } [opt.genderMarker] - The character 'F', 'M', or 'X'.
   * @param { string } [opt.expirationDate] - A calendar date string in YYYY-MM-DD format.
   * @param { string } [opt.nationalityCode] - A 3-character string consisting of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   * @param { string } [opt.fullName] - A ', ' separates the document holder's primary identifier from their secondary identifiers. A '/' separates the full name in a non-Latin national language from a transcription/transliteration into the Latin characters A-Z.
   * @param { string } [opt.optionalData] - Up to 26 characters. Valid characters are from the ranges 0-9 and A-Z.
   * @param { string } [opt.mrzLine1] - A MRZ line string of a 30-character length.
   * @param { string } [opt.mrzLine2] - A MRZ line string of a 30-character length.
   * @param { string } [opt.mrzLine3] - A MRZ line string of a 30-character length.
   * @param { string } [opt.machineReadableZone] - A MRZ string of a 90-character length.
   * @param { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame } [opt.picture] - A path/URL to an image, or an image object, representing a photo of the document holder.
   * @param { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame } [opt.signature] - A path/URL to an image, or an image object, representing the signature or usual mark of the document holder.
   * @param { string } [opt.url] - A URL chosen by the document holder to display in the barcode area in place of a visible digital seal (VDS).
   * @param { string } [opt.subauthority] - The full name of the issuing (sub)authority who issued the document.
   * @param { string } [opt.privilege] - The title or description of the privilege granted by the issuing (sub)authority.
   * @param { string } [opt.ratings] - A notation regarding any authorizations beyond the granted privilege--like specific aircraft types.
   * @param { string } [opt.limitations] - A notation regarding any restrictions that would otherwise be granted with the granted privilege or ratings.
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
   * @param { string } [opt.subauthorityCode] - A hex string up to 8 characters long.
   * @param { string } [opt.privilegeCode] - A hex string up to 8 characters long.
   */
  constructor(opt) {
    this.subauthority = "Unknown";
    this.privilege = "None";
    this.ratings = "None";
    this.limitations = "None";
    
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
      if (opt.mrzLine1) { this.mrzLine1 = opt.mrzLine1; }
      if (opt.mrzLine2) { this.mrzLine2 = opt.mrzLine2; }
      if (opt.mrzLine3) { this.mrzLine3 = opt.mrzLine3; }
      if (opt.machineReadableZone) { this.machineReadableZone = opt.machineReadableZone; }
      if (opt.picture) { this.picture = opt.picture; }
      if (opt.signature) { this.signature = opt.signature; }
      if (opt.url) { this.url = opt.url; }
      if (opt.subauthority) { this.subauthority = opt.subauthority; }
      if (opt.privilege) { this.privilege = opt.privilege; }
      if (opt.ratings) { this.ratings = opt.ratings; }
      if (opt.limitations) { this.limitations = opt.limitations; }
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
      if (opt.subauthorityCode) { this.subauthorityCode = opt.subauthorityCode; }
      if (opt.privilegeCode) { this.privilegeCode = opt.privilegeCode; }
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
    if (sealMRZ[21] !== TravelDocument.generateMRZCheckDigit(sealMRZ.slice(15, 21).replace(/ /gi, "<"))) {
      throw new EvalError(
        `Date of birth check digit '${sealMRZ[21]}' does not match for date of birth '${sealMRZ.slice(15, 21).replace(/ /gi, "<")}'.`
      );
    } else {
      const yearOfBirth = sealMRZ.slice(15, 17);
      const monthOfBirth = sealMRZ.slice(17, 19);
      const dayOfBirth = sealMRZ.slice(19, 21);
      if (parseInt(yearOfBirth, 10) >= twoDigitYearStart) {
        this.#document.birthDate = `19${yearOfBirth}-${monthOfBirth}-${dayOfBirth}`;
      } else {
        this.#document.birthDate = `20${yearOfBirth}-${monthOfBirth}-${dayOfBirth}`;
      }
    }
    this.#document.genderMarker = sealMRZ[22];
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
    this.#document.nationalityCode = sealMRZ.slice(30, 33).trimEnd();
    this.#document.fullName = sealMRZ.slice(33).replace("  ", ", ").trimEnd();
  }
}

export { CrewLicense };