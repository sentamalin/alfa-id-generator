// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

import { MRVBDocument } from "./icao9303/MRVBDocument.js";
import { DigitalSealV4 } from "./icao9303/DigitalSealV4.js";
import { DEFAULT_PHOTO, DEFAULT_SIGNATURE_IMAGE } from "./icao9303/utilities/default-images.js";
import { generateMRZCheckDigit } from "./icao9303/utilities/generate-mrz-check-digit.js";
import { c40Encode } from "./icao9303/utilities/c40-encode.js";
import { c40Decode } from "./icao9303/utilities/c40-decode.js";
import { getFullYearFromString } from "./icao9303/utilities/get-full-year-from-string.js";

/**
 * `EventsMRVB` describes an ALFA Furry Events Visa in the MRV-B document size
 *     with a visible digital seal (VDS). Its smaller size allows it to be used
 *     in furry events passports that require a clear area aside the visa
 *     sticker. Justifications for this are because the passport number is
 *     perforated or printed on the pages, or the issuing authority wants to
 *     place a seal or mark that overlaps the visa sticker and the passport
 *     page. Due to its smaller dimensions, less data can fit on the visa
 *     sticker compared to a MRV-A visa.
 */
class EventsMRVB {
  /**
   * Create an `EventsMRVB`.
   * @param { Object } [opt] - An options object.
   * @param { string } [opt.typeCode] - A 1-2 character string consisting of the
   *     letters A-Z.
   * @param { string } [opt.authorityCode] - A 3-character string consisting of
   *     the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned
   *     ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   * @param { string } [opt.placeOfIssue] - Location where the visa was issued.
   * @param { string | Date } [opt.validFrom] - A calendar date string in
   *     YYYY-MM-DD format or a `Date` object.
   * @param { string | Date } [opt.validThru] - A calendar date string in
   *     YYYY-MM-DD format or a `Date` object.
   * @param { string | number } [opt.numberOfEntries] - 0 or any string denotes
   *     an unlimited number of entries.
   * @param { string } [opt.number] - A string no longer than 9 characters
   *     consisting of the characters 0-9 and A-Z.
   * @param { string } [opt.visaType] - A type/name/description for this visa.
   * @param { string } [opt.additionalInfo] - Additional textual information.
   * @param { string } [opt.fullName] - A ', ' separates the visa holder's
   *     primary identifier from their secondary identifiers. A '/' separates
   *     the full name in a non-Latin national language from a
   *     transcription/transliteration into the Latin characters A-Z.
   * @param { string } [opt.passportNumber] - A string no longer than 9
   *     characters consisting of the characters 0-9 and A-Z.
   * @param { boolean } [opt.usePassportInMRZ] - Use 'passportNumber' instead of
   *     'number' in the Machine-Readable Zone (MRZ).
   * @param { string } [opt.nationalityCode] - A 3-character string consisting
   *     of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned
   *     ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   * @param { string | Date } [opt.birthDate] - A calendar date string in
   *     YYYY-MM-DD format or a `Date` object.
   * @param { string } [opt.genderMarker] - The character 'F', 'M', or 'X'.
   * @param { string } [opt.optionalData] - Up to 16 characters. Valid
   *     characters are from the ranges 0-9, A-Z, and ' '.
   * @param { string } [opt.mrzLine1] - A MRZ line string of a 44-character
   *     length.
   * @param { string } [opt.mrzLine2] - A MRZ line string of a 44-character
   *     length.
   * @param { string } [opt.machineReadableZone] - A MRZ string of a
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
   * @param { string } [opt.url] - A URL chosen by the document holder to
   *     display in the barcode area in place of a visible digital seal (VDS).
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
   * @param { number[] } [opt.durationOfStay] - A three-number array represening
   *     the number of [days, months, years]. Each number may be in the range of
   *     0-254.
   * @param { string } [opt.visaTypeCode] - A hex string up to 8 characters
   *     long.
   * @param { number[] } [opt.additionalFeature] - A feature reserved by ICAO
   *     for future use.
   */
  constructor(opt) {
    this.#document = new MRVBDocument();
    this.#seal = new DigitalSealV4({
      typeCategory: 0x0A,
      featureDefinition: 0x01
    });

    this.typeCode = opt?.typeCode ?? "V";
    this.authorityCode = opt?.authorityCode ?? "UTO";
    this.placeOfIssue = opt?.placeOfIssue ?? "Utopia";
    this.validFrom = opt?.validFrom ?? "2007-04-15";
    this.validThru = opt?.validThru ?? "2012-04-15";
    this.numberOfEntries = opt?.numberOfEntries ?? "Multiple";
    this.number = opt?.number ?? "T32069231";
    this.visaType = opt?.visaType ?? "Tourist"
    this.additionalInfo = opt?.additionalInfo ?? "XXXXXXXXXXXXXXXXXXXXXXXXXXX" +
        "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
    this.fullName = opt?.fullName ?? "Eriksson, Anna-Maria";
    this.passportNumber = opt?.passportNumber ?? "D23145890";
    this.usePassportInMRZ = opt?.usePassportInMRZ ?? false;
    this.nationalityCode = opt?.nationalityCode ?? "UTO";
    this.birthDate = opt?.birthDate ?? "1974-08-12";
    this.genderMarker = opt?.genderMarker ?? "F";
    this.optionalData = opt?.optionalData ?? "";
    this.photo = opt?.photo ?? DEFAULT_PHOTO;
    this.signatureImage = opt?.signatureImage ?? DEFAULT_SIGNATURE_IMAGE;
    this.url = opt?.url ?? "https://example.org/";
    this.identifierCode = opt?.identifierCode ?? "UTSS";
    this.certReference = opt?.certReference ?? "00000";
    this.issueDate = opt?.issueDate ?? "2007-04-15";
    this.signatureDate = opt?.signatureDate ?? "2007-04-15";
    this.signatureData = opt?.signatureData ?? Array(64).fill(0);
    this.durationOfStay = opt?.durationOfStay ?? [0, 3, 0];
    this.visaTypeCode = opt?.visaTypeCode ?? "0";
    this.additionalFeature = opt?.additionalFeature ?? [];

    if (opt?.mrzLine1) { this.mrzLine1 = opt.mrzLine1; }
    if (opt?.mrzLine2) { this.mrzLine2 = opt.mrzLine2; }
    if (opt?.machineReadableZone) {
      this.machineReadableZone = opt.machineReadableZone;
    }
    if (opt?.headerZone) { this.headerZone = opt.headerZone; }
    if (opt?.messageZone) { this.messageZone = opt.messageZone; }
    if (opt?.signatureZone) { this.signatureZone = opt.signatureZone; }
    if (opt?.unsignedSeal) { this.unsignedSeal = opt.unsignedSeal; }
    if (opt?.signedSeal) { this.signedSeal = opt.signedSeal; }
  }

  // The objects `EventsMRVB` uses to compose itself.
  #document;
  #seal;
  
  /**
   * A code identifying the visa type.
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
   * A code identifying the authority who issued this visa.
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
   * An identity document number unique for this visa.
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
    this.#setDigitalSealMRZ();
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
  set nationalityCode(value) {
    this.#document.nationalityCode = value;
    this.#setDigitalSealMRZ();
  }

  /**
   * The visa holder's date of birth.
   * @type { Date }
   */
  get birthDate() { return this.#document.birthDate; }
  /**
   * @param { string | Date } value - A calendar date string in YYYY-MM-DD
   *     format or a `Date` object.
   */
  set birthDate(value) {
    this.#document.birthDate = value;
    this.#setDigitalSealMRZ();
  }

  /**
   * A marker representing the visa holder's gender.
   * @type { String }
   */
  get genderMarker() { return this.#document.genderMarker; }
  /**
   * @param { string } value - The character 'F', 'M', or 'X'.
   */
  set genderMarker(value) {
    this.#document.genderMarker = value;
    this.#setDigitalSealMRZ();
  }

  /**
   * The last date on which this visa is valid.
   * @type { Date }
   */
  get validThru() { return this.#document.validThru; }
  /**
   * @param { string | Date } value - A calendar date string in YYYY-MM-DD
   *     format or a `Date` object.
   */
  set validThru(value) {
    this.#document.validThru = value;
    this.#setDigitalSealMRZ();
  }

  /**
   * Optional data to include in the Machine-Readable Zone (MRZ).
   * @type { String }
   */
  get optionalData() { return this.#document.optionalData; }
  /**
   * @param { string } value - Up to 8 characters. Valid characters are from the
   *     ranges 0-9 and A-Z.
   */
  set optionalData(value) { this.#document.optionalData = value; }

  /**
   * A path/URL to an image, or an image object, representing a photo of the
   *     visa holder or an image from the issuing authority.
   * @type { string | HTMLImageElement | SVGImageElement | HTMLVideoElement |
   *     HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame }
   */
  get photo() { return this.#document.photo; }
  /**
   * @param { string | HTMLImageElement | SVGImageElement | HTMLVideoElement |
   * HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame } value
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
  get placeOfIssue() { return this.#document.placeOfIssue; }
  /**
   * @param { string } value
   */
  set placeOfIssue(value) { this.#document.placeOfIssue = value; }

  /**
   * Starting date on which the visa is valid.
   * @type { Date }
   */
  get validFrom() { return this.#document.validFrom; }
  /**
   * @param { string | Date } value - A calendar date string in YYYY-MM-DD
   *     format or a `Date` object.
   */
  set validFrom(value) { this.#document.validFrom = value; }

  /**
   * Maximum number of entries this visa allows.
   * @type { String }
   */
  get numberOfEntries() { return this.#document.numberOfEntries; }
  /**
   * @param { string | number } value - 0 or any string denotes an unlimited
   *     number of entries.
   */
  set numberOfEntries(value) {
    this.#document.numberOfEntries = value;
    if (isNaN(parseInt(value))) {
      this.#seal.features.set(0x03, [0]);
    } else {
      this.#seal.features.set(0x03, [parseInt(value)]);
    }
  }

  /**
   * The textual type/name/description for this visa.
   * @type { String }
   */
  get visaType() { return this.#document.visaType; }
  /**
   * @param { string } value
   */
  set visaType(value) { this.#document.visaType = value; }

  /**
   * Additional textual information to include with this visa.
   * @type { String }
   */
  get additionalInfo() { return this.#document.additionalInfo; }
  /**
   * @param { string } value
   */
  set additionalInfo(value) { this.#document.additionalInfo = value; }

  /**
   * The identity document number for which this visa is issued.
   * @type { String }
   */
  get passportNumber() { return this.#document.passportNumber; }
  /**
   * @param { string } value - A string no longer than 9 characters consisting
   *     of the characters 0-9 and A-Z.
   */
  set passportNumber(value) { 
    this.#document.passportNumber = value;
    this.#seal.features.set(0x05, c40Encode(value));
    this.#setDigitalSealMRZ();
  }

  /**
   * Use 'passportNumber' instead of 'number' in the Machine-Readable Zone
   *     (MRZ).
   * @type { boolean }
   */
  get usePassportInMRZ() { return this.#document.usePassportInMRZ; }
  /** @param { boolean } value */
  set usePassportInMRZ(value) {
    this.#document.usePassportInMRZ = value;
    this.#setDigitalSealMRZ();
  }

  /**
   * A URL chosen by the document holder to store in the barcode area in place
   *     of a visible digital seal (VDS).
   * @type { string }
   */
  url;

  /**
   * The first line of the Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get mrzLine1() { return this.#document.mrzLine1; }
  /**
   * @param { string } value - A MRZ line string of a 36-character length.
   */
  set mrzLine1(value) {
    this.#document.mrzLine1 = value;
    this.#setDigitalSealMRZ();
  }

  /**
   * The second line of the Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get mrzLine2() { return this.#document.mrzLine2; }
  /**
   * @param { string } value - A MRZ line string of a 36-character length.
   */
  set mrzLine2(value) {
    this.#document.mrzLine2 = value;
    this.#setDigitalSealMRZ();
  }

  /**
   * The full Machine-Readable Zone (MRZ).
   * @type { string }
   */
  get machineReadableZone() { return this.#document.machineReadableZone; }
  /**
   * @param { string } value - A MRZ string of a 72-character length.
   */
  set machineReadableZone(value) {
    this.#document.machineReadableZone = value;
    this.#setDigitalSealMRZ();
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
   * The number of days, months, and years the visa holder may stay upon
   *     entering in [days, months, years].
   * @type { number[] }
   */
  get durationOfStay() {
    return this.#seal.features.get(0x04);
  }
  /**
   * @param { number[] } duration - A three-number array representing the number
   *     of [days, months, years]. Each number may be in the range of 0-254.
   */
  set durationOfStay(duration) {
    if (
      (duration.length !== 3) || (duration[0] > 254) ||
          (duration[0] < 0) || (duration[1] > 254) ||
          (duration[1] < 0) || (duration[2] > 254) ||
          (duration[2] < 0)
    ) {
      throw new RangeError(
        "Duration of stay must be a number array [days, months, years] with " +
            "each number in the range of 0-254."
      );
    }
    this.#seal.features.set(0x04,duration);
  }

  /**
   * A hex-string defined by the issuing authority for this visa's type.
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
  /**
   * @param { string } code - A hex string up to 8 characters long.
   */
  set visaTypeCode(code) {
    if (code.length > 8) {
      throw new RangeError(
        `Length '${code.length}' of visa type code must be 8 characters or ` +
            `less.`
      );
    }
    const input = [];
    const PADDED_CODE = code.padStart(8, "0");
    let previousIsZero = true;
    for (let i = 0; i < PADDED_CODE.length; i += 2) {
      if (
        (parseInt(PADDED_CODE.slice(i, i + 2), 16) === 0) &&
            previousIsZero === true
      ) {
        continue;
      }
      input.push(parseInt(PADDED_CODE.slice(i, i + 2), 16));
      previousIsZero = false;
    }
    this.#seal.features.set(0x06, input);
  }

  /**
   * A feature reserved by ICAO for future use.
   * @type { number[] }
   */
  get additionalFeature() {
    return this.#seal.features.get(0x07);
  }
  /**
   * @param { number[] } value
   */
  set additionalFeature(value) {
    this.#seal.features.set(0x07, value);
  }

  /**
   * Set the visible digital seal's (VDS) Machine-Readable Zone (MRZ) when
   *     setting any properties shown on the MRZ.
   */
  #setDigitalSealMRZ() {
    this.#seal.features.set(0x02, c40Encode(
      this.mrzLine1 + this.mrzLine2.slice(0, 28)
    ));
  }

  /**
   * Re-set all properties using values from the visible digital seal (VDS) when
   *     setting the VDS header, message, or signature zones.
   */
  #setAllValuesFromDigitalSeal() {
    const SEAL_MRZ = c40Decode(this.#seal.features.get(0x02));
    if (SEAL_MRZ[45] !== generateMRZCheckDigit(
      SEAL_MRZ.slice(36, 45).replace(/ /gi, "<")
    )) {
      throw new EvalError(
        `Document number check digit '${SEAL_MRZ[45]}' does not match for ` +
            `document number '${SEAL_MRZ.slice(36, 45).replace(/ /gi, "<")}.`
      );
    }
    if (SEAL_MRZ[55] !== generateMRZCheckDigit(
      SEAL_MRZ.slice(49, 55).replace(/ /gi, "<")
    )) {
      throw new EvalError(
        `Date of birth check digit '${SEAL_MRZ[55]}' does not match for date ` +
            `of birth '${SEAL_MRZ.slice(49, 55).replace(/ /gi, "<")}'.`
      );
    }
    if (SEAL_MRZ[63] !== generateMRZCheckDigit(
      SEAL_MRZ.slice(57, 63).replace(/ /gi, "<")
    )) {
      throw new EvalError(
        `Valid thru check digit '${SEAL_MRZ[63]}' does not match for valid ` +
            `thru '${SEAL_MRZ.slice(57, 63).replace(/ /gi, "<")}'.`
      );
    }
    this.#document.typeCode = SEAL_MRZ.slice(0, 2).trimEnd();
    this.#document.authorityCode = SEAL_MRZ.slice(2, 5).trimEnd();
    this.#document.fullName =
        SEAL_MRZ.slice(5, 36).replace("  ", ", ").trimEnd();
    this.#document.number = SEAL_MRZ.slice(36, 45).trimEnd();
    this.#document.nationalityCode = SEAL_MRZ.slice(46, 49).trimEnd();
    const BIRTH_YEAR = SEAL_MRZ.slice(49, 51);
    const BIRTH_MONTH = SEAL_MRZ.slice(51, 53);
    const BIRTH_DAY = SEAL_MRZ.slice(53, 55);
    this.#document.birthDate =
        `${getFullYearFromString(BIRTH_YEAR)}-${BIRTH_MONTH}-${BIRTH_DAY}`;
    this.#document.genderMarker = SEAL_MRZ[56];
    const VALID_THRU_YEAR = SEAL_MRZ.slice(57, 59);
    const VALID_THRU_MONTH = SEAL_MRZ.slice(59, 61);
    const VALID_THRU_DAY = SEAL_MRZ.slice(61, 63);
    this.#document.validThru =
        `${getFullYearFromString(VALID_THRU_YEAR)}-${VALID_THRU_MONTH}-` +
        `${VALID_THRU_DAY}`;
    if (this.#seal.features.get(0x03)[0] === 0) {
      this.#document.numberOfEntries = "MULTIPLE";
    } else {
      this.#document.numberOfEntries = this.#seal.features.get(0x03)[0];
    }
    this.#document.passportNumber =
        c40Decode(this.#seal.features.get(0x05));
  }
}

export { EventsMRVB };
