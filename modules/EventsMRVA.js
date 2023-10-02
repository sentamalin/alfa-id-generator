/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { TravelDocument } from "./icao9303/TravelDocument.js";
import { MRVADocument } from "./icao9303/MRVADocument.js";
import { DigitalSeal } from "./icao9303/DigitalSeal.js";
import { DigitalSealV4 } from "./icao9303/DigitalSealV4.js";

/** `EventsMRVA` describes an ALFA Furry Events Visa in the MRV-A
 *  document size with a visible digital seal (VDS). Nearly the full
 *  size of a TD3 machine-readable passport (MRP) page, this visa
 *  is perfect for issuing authorities that want the most room
 *  for information and the passport page doesn't require a clear
 *  area aside the visa sticker.
 * 
 * @mixes MRVADocument
 * @mixes DigitalSealV4
 */
class EventsMRVA {
  #document = new MRVADocument();
  #seal = new DigitalSealV4({
    typeCategory: 0x0A,
    featureDefinition: 0x01
  });
  
  /** A code identifying the visa type.
   * @type { String }
   */
  get typeCode() { return this.#document.typeCode; }
  /** @param { string } value - A 1-2 character string consisting of the letters A-Z. */
  set typeCode(value) {
    this.#document.typeCode = value;
    this.#setDigitalSealMRZ();
  }

  /** A code identifying the authority who issued this visa.
   * @type { String }
   */
  get authorityCode() { return this.#document.authorityCode; }
  /** @param { string } value - A 3-character string consisting of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ. */
  set authorityCode(value) {
    this.#document.authorityCode = value;
    this.#seal.authorityCode = value;
    this.#setDigitalSealMRZ();
  }

  /** An identity document number unique for this visa.
   * @type { String }
   */
  get number() { return this.#document.number; }
  /** @param { string } value - A string no longer than 9 characters consisting of the characters 0-9 and A-Z. */
  set number(value) {
    this.#document.number = value;
    this.#setDigitalSealMRZ();
  }

  /** The visa holder's full name.
   * @type { String }
   */
  get fullName() { return this.#document.fullName; }
  /** @param { string } value - A ', ' separates the document holder's primary identifier from their secondary identifiers. A '/' separates the full name in a non-Latin national language from a transcription/transliteration into the Latin characters A-Z. */
  set fullName(value) {
    this.#document.fullName = value;
    this.#setDigitalSealMRZ();
  }

  /** A code identifying the visa holder's nationality (or lack thereof).
   * @type { String }
   */
  get nationalityCode() { return this.#document.nationalityCode; }
  /** @param { string } value - A 3-character string consisting of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ. */
  set nationalityCode(value) {
    this.#document.nationalityCode = value;
    this.#setDigitalSealMRZ();
  }

  /** The visa holder's date of birth.
   * @type { Date }
   */
  get birthDate() { return this.#document.birthDate; }
  /** @param { string } value - A calendar date string in YYYY-MM-DD format. */
  set birthDate(value) {
    this.#document.birthDate = value;
    this.#setDigitalSealMRZ();
  }

  /** A marker representing the visa holder's gender.
   * @type { String }
   */
  get genderMarker() { return this.#document.genderMarker; }
  /** @param { string } value - The character 'F', 'M', or 'X'. */
  set genderMarker(value) {
    this.#document.genderMarker = value;
    this.#setDigitalSealMRZ();
  }

  /** The last date on which this visa is valid.
   * @type { Date }
   */
  get validThru() { return this.#document.validThru; }
  /** @param { string } value - A calendar date string in YYYY-MM-DD format. */
  set validThru(value) {
    this.#document.validThru = value;
    this.#setDigitalSealMRZ();
  }

  /** Optional data to include in the Machine-Readable Zone (MRZ).
   * @type { String }
   */
  get optionalData() { return this.#document.optionalData; }
  /** @param { string } value - Up to 16 characters. Valid characters are from the ranges 0-9 and A-Z. */
  set optionalData(value) { this.#document.optionalData = value; }

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
  get placeOfIssue() { return this.#document.placeOfIssue; }
  /** @param { string } value */
  set placeOfIssue(value) { this.#document.placeOfIssue = value; }

  /** Starting date on which the visa is valid.
   * @type { Date }
   */
  get validFrom() { return this.#document.validFrom; }
  /** @param { string } value - A calendar date string in YYYY-MM-DD format. */
  set validFrom(value) { this.#document.validFrom = value; }

  /** Maximum number of entries this visa allows.
   * @type { String }
   */
  get numberOfEntries() { return this.#document.numberOfEntries; }
  /** @param { string | number } value - 0 or any string denotes an unlimited number of entries. */
  set numberOfEntries(value) {
    this.#document.numberOfEntries = value;
    if (isNaN(parseInt(value))) {
      this.#seal.features.set(0x03, [0]);
    } else {
      this.#seal.features.set(0x03, [parseInt(value)]);
    }
  }

  /** The textual type/name/description for this visa.
   * @type { String }
   */
  get visaType() { return this.#document.visaType; }
  /** @param { string } value */
  set visaType(value) { this.#document.visaType = value; }

  /** Additional textual information to include with this visa.
   * @type { String }
   */
  get additionalInfo() { return this.#document.additionalInfo; }
  /** @param { string } value */
  set additionalInfo(value) { this.#document.additionalInfo = value; }

  /** The identity document number for which this visa is issued.
   * @type { String }
   */
  get passportNumber() { return this.#document.passportNumber; }
  /** @param { string } value - A string no longer than 9 characters consisting of the characters 0-9 and A-Z. */
  set passportNumber(value) {
    this.#document.passportNumber = value;
    this.#seal.features.set(0x05, DigitalSeal.c40Encode(value));
    this.#setDigitalSealMRZ();
  }

  /** Use 'passportNumber' instead of 'number' in the Machine-Readable Zone (MRZ).
   * @type { boolean }
   */
  get usePassportInMRZ() { return this.#document.usePassportInMRZ; }
  /** @param { boolean } value */
  set usePassportInMRZ(value) {
    this.#document.usePassportInMRZ = value;
    this.#setDigitalSealMRZ();
  }

  /** A URL chosen by the document holder to store in the barcode area in place of a visible digital seal (VDS).
   * @type { string }
   */
  url;

  /** The first line of the Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get mrzLine1() { return this.#document.mrzLine1; }
  /** @param { string } value - A MRZ line string of a 44-character length. */
  set mrzLine1(value) {
    this.#document.mrzLine1 = value;
    this.#setDigitalSealMRZ();
  }

  /** The second line of the Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get mrzLine2() { return this.#document.mrzLine2; }
  /** @param { string } value - A MRZ line string of a 44-character length. */
  set mrzLine2(value) {
    this.#document.mrzLine2 = value;
    this.#setDigitalSealMRZ();
  }

  /** The full Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get machineReadableZone() { return this.#document.machineReadableZone; }
  /** @param { string } value - A MRZ string of a 88-character length. */
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

  /** The number of days, months, and years the visa holder may stay upon entering in [days, months, years].
   * @type { number[] }
   */
  get durationOfStay() {
    return this.#seal.features.get(0x04);
  }
  /** @param { number[] } duration - A three-number array represening the number of [days, months, years]. Each number may be in the range of 0-254. */
  set durationOfStay(duration) {
    if (duration.length !== 3 || duration[0] > 254 || duration[0] < 0 || duration[1] > 254 || duration[1] < 0 || duration[2] > 254 || duration[2] < 0) {
      throw new RangeError(
        "Duration of stay must be a number array [days, months, years] with each number in the range of 0-254."
      );
    }
    this.#seal.features.set(0x04, duration);
  }

  /** A hex-string defined by the issuing authority for this visa's type.
   * @type { string }
   */
  get visaTypeCode() {
    let output = "";
    const visaType = this.#seal.features.get(0x06);
    for (let i = 0; i < visaType.length; i += 1) {
      output += visaType[i].toString(16).padStart(2, "0").toUpperCase();
    }
    return output;
  }
  /** @param { string } code - A hex string up to 8 characters long. */
  set visaTypeCode(code) {
    if (code.length > 8) {
      throw new RangeError(
        `Length '${code.length}' of visa type code must be 8 characters or less.`
      );
    }
    const input = [];
    const paddedType = code.padStart(8, "0");
    let previousIsZero = true;
    for (let i = 0; i < paddedType.length; i += 2) {
      if ((parseInt(paddedType.slice(i, i + 2), 16) === 0) && previousIsZero === true ) {
        continue;
      }
      input.push(parseInt(paddedType.slice(i, i + 2), 16));
      previousIsZero = false;
    }
    this.#seal.features.set(0x06, input);
  }

  /** A feature reserved by ICAO for future use.
   * @type { number[] }
   */
  get additionalFeature() {
    return this.#seal.features.get(0x07);
  }
  /** @param { number[] } value */
  set additionalFeature(value) {
    this.#seal.features.set(0x07, value);
  }

  /** Create a new `EventsMRVB`.
   * @param { Object } [opt] - An options object.
   * @param { string } [opt.typeCode] - A 1-2 character string consisting of the letters A-Z.
   * @param { string } [opt.authorityCode] - A 3-character string consisting of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   * @param { string } [opt.placeOfIssue] - Location where the visa was issued.
   * @param { string } [opt.validFrom] - A calendar date string in YYYY-MM-DD format.
   * @param { string } [opt.validThru] - A calendar date string in YYYY-MM-DD format.
   * @param { string | number } [opt.numberOfEntries] - 0 or any string denotes an unlimited number of entries.
   * @param { string } [opt.number] - A string no longer than 9 characters consisting of the characters 0-9 and A-Z.
   * @param { string } [opt.visaType] - A type/name/description for this visa.
   * @param { string } [opt.additionalInfo] - Additional textual information.
   * @param { string } [opt.fullName] - A ', ' separates the visa holder's primary identifier from their secondary identifiers. A '/' separates the full name in a non-Latin national language from a transcription/transliteration into the Latin characters A-Z.
   * @param { string } [opt.passportNumber] - A string no longer than 9 characters consisting of the characters 0-9 and A-Z.
   * @param { boolean } [opt.usePassportInMRZ] - Use 'passportNumber' instead of 'number' in the Machine-Readable Zone (MRZ).
   * @param { string } [opt.nationalityCode] - A 3-character string consisting of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   * @param { string } [opt.birthDate] - A calendar date string in YYYY-MM-DD format.
   * @param { string } [opt.genderMarker] - The character 'F', 'M', or 'X'.
   * @param { string } [opt.optionalData] - Up to 16 characters. Valid characters are from the ranges 0-9 and A-Z.
   * @param { string } [opt.mrzLine1] - A MRZ line string of a 44-character length.
   * @param { string } [opt.mrzLine2] - A MRZ line string of a 44-character length.
   * @param { string } [opt.machineReadableZone] - A MRZ string of a 88-character length.
   * @param { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame } [opt.picture] - A path/URL to an image, or an image object, representing a photo of the visa holder or an image from the issuing authority.
   * @param { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame } [opt.signature] - A path/URL to an image, or an image object, representing the signature or usual mark of the visa issuer.
   * @param { string } [opt.url] - A URL chosen by the document holder to display in the barcode area in place of a visible digital seal (VDS).
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
   * @param { number[] } [opt.durationOfStay] - A three-number array represening the number of [days, months, years]. Each number may be in the range of 0-254.
   * @param { string } [opt.visaTypeCode] - A hex string up to 8 characters long.
   * @param { number[] } [opt.additionalFeature] - A feature reserved by ICAO for future use.
   */
  constructor(opt) {
    if (opt) {
      if (opt.typeCode) { this.typeCode = opt.typeCode; }
      if (opt.authorityCode) { this.authorityCode = opt.authorityCode; }
      if (opt.placeOfIssue) { this.placeOfIssue = opt.placeOfIssue; }
      if (opt.validFrom) { this.validFrom = opt.validFrom; }
      if (opt.validThru) { this.validThru = opt.validThru; }
      if (opt.numberOfEntries) { this.numberOfEntries = opt.numberOfEntries; }
      if (opt.number) { this.number = opt.number; }
      if (opt.visaType) { this.visaType = opt.visaType; }
      if (opt.additionalInfo) { this.additionalInfo = opt.additionalInfo; }
      if (opt.fullName) { this.fullName = opt.fullName; }
      if (opt.passportNumber) { this.passportNumber = opt.passportNumber; }
      if (opt.usePassportInMRZ) { this.usePassportInMRZ = opt.usePassportInMRZ; }
      if (opt.nationalityCode) { this.nationalityCode = opt.nationalityCode; }
      if (opt.birthDate) { this.birthDate = opt.birthDate; }
      if (opt.genderMarker) { this.genderMarker = opt.genderMarker; }
      if (opt.optionalData) { this.optionalData = opt.optionalData; }
      if (opt.mrzLine1) { this.mrzLine1 = opt.mrzLine1; }
      if (opt.mrzLine2) { this.mrzLine2 = opt.mrzLine2; }
      if (opt.machineReadableZone) { this.machineReadableZone = opt.machineReadableZone; }
      if (opt.picture) { this.picture = opt.picture; }
      if (opt.signature) { this.signature = opt.signature; }
      if (opt.url) { this.url = opt.url; }
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
      if (opt.durationOfStay) { this.durationOfStay = opt.durationOfStay; }
      if (opt.visaTypeCode) { this.visaTypeCode = opt.visaTypeCode; }
      if (opt.additionalFeature) { this.additionalFeature = opt.additionalFeature; }
    }
  }

  /** Set the visible digital seal's (VDS) Machine-Readable Zone (MRZ) when setting any properties shown on the MRZ. */
  #setDigitalSealMRZ() {
    this.#seal.features.set(0x01, DigitalSeal.c40Encode(
      this.mrzLine1 + this.mrzLine2.slice(0, 28)
    ));
  }

  /** Re-set all properties using values from the visible digital seal (VDS) when setting the VDS header, message, or signature zones. */
  #setAllValuesFromDigitalSeal() {
    const twoDigitYearStart = 32;
    const sealMRZ = DigitalSeal.c40Decode(this.#seal.features.get(0x01));
    this.#document.typeCode = sealMRZ.slice(0, 2).trimEnd();
    this.#document.authorityCode = sealMRZ.slice(2, 5).trimEnd();
    this.#document.fullName = sealMRZ.slice(5, 44).replace("  ", ", ").trimEnd();
    if (sealMRZ[53] !== TravelDocument.generateMRZCheckDigit(sealMRZ.slice(44, 53).replace(/ /gi, "<"))) {
      throw new EvalError(
        `Document number check digit '${sealMRZ[53]}' does not match for document number '${sealMRZ.slice(44, 53).replace(/ /gi, "<")}.`
      );
    } else {
      this.#document.number = sealMRZ.slice(44, 53).trimEnd();
    }
    this.#document.nationalityCode = sealMRZ.slice(54, 57).trimEnd();
    if (sealMRZ[63] !== TravelDocument.generateMRZCheckDigit(sealMRZ.slice(57, 63).replace(/ /gi, "<"))) {
      throw new EvalError(
        `Date of birth check digit '${sealMRZ[63]}' does not match for date of birth '${sealMRZ.slice(57, 63).replace(/ /gi, "<")}'.`
      );
    } else {
      const yearOfBirth = sealMRZ.slice(57, 59);
      const monthOfBirth = sealMRZ.slice(59, 61);
      const dayOfBirth = sealMRZ.slice(61, 63);
      if (parseInt(yearOfBirth, 10) >= twoDigitYearStart) {
        this.#document.birthDate = `19${yearOfBirth}-${monthOfBirth}-${dayOfBirth}`;
      } else {
        this.#document.birthDate = `20${yearOfBirth}-${monthOfBirth}-${dayOfBirth}`;
      }
    }
    this.#document.genderMarker = sealMRZ[64];
    if (sealMRZ[71] !== TravelDocument.generateMRZCheckDigit(sealMRZ.slice(65, 71).replace(/ /gi, "<"))) {
      throw new EvalError(
        `Valid thru check digit '${sealMRZ[71]}' does not match for valid thru '${sealMRZ.slice(65, 71).replace(/ /gi, "<")}'.`
      );
    } else {
      const yearValidThru = sealMRZ.slice(65, 67);
      const monthValidThru = sealMRZ.slice(67, 69);
      const dayValidThru = sealMRZ.slice(69, 71);
      this.#document.validThru = `20${yearValidThru}-${monthValidThru}-${dayValidThru}`;
    }
    if (this.#seal.features.get(0x03)[0] === 0) {
      this.#document.numberOfEntries = "MULTIPLE";
    } else {
      this.#document.numberOfEntries = this.#seal.features.get(0x03)[0];
    }
    this.#document.passportNumber = DigitalSeal.c40Decode(this.#seal.features.get(0x05));
  }
}

export { EventsMRVA };