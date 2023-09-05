import { TravelDocument } from "./TravelDocument.js";

class TD1Document {
  /* This defines common fields, properties, and methods for ICAO 9303 TD1
     travel documents (credit card) with machine-readable zone (MRZ). */

  #document = new TravelDocument();
  
  // General Text and Graphical Data (Forwards/Calls TravelDocument)
  get typeCode() { return this.#document.typeCode; }
  get typeCodeMRZ() { return this.#document.typeCodeMRZ; }
  get typeCodeVIZ() { return this.#document.typeCodeVIZ; }
  set typeCode(value) { this.#document.typeCode = value; }
  get authorityCode() { return this.#document.authorityCode; }
  get authorityCodeMRZ() { return this.#document.authorityCodeMRZ; }
  get authorityCodeVIZ() { return this.#document.authorityCodeVIZ; }
  set authorityCode(value) { this.#document.authorityCode = value; }
  get number() { return this.#document.number; }
  get numberMRZ() { return this.#document.numberMRZ; }
  get numberVIZ() { return this.#document.numberVIZ; }
  set number(value) { this.#document.number = value; }
  get dateOfBirth() { return this.#document.dateOfBirth; }
  get dateOfBirthMRZ() { return this.#document.dateOfBirthMRZ; }
  get dateOfBirthVIZ() { return this.#document.dateOfBirthVIZ; }
  set dateOfBirth(value) { this.#document.dateOfBirth = value; }
  get genderMarker() { return this.#document.genderMarker; }
  get genderMarkerMRZ() { return this.#document.genderMarkerMRZ; }
  get genderMarkerVIZ() { return this.#document.genderMarkerVIZ; }
  set genderMarker(value) { this.#document.genderMarker = value; }
  get dateOfExpiration() { return this.#document.dateOfExpiration; }
  get dateOfExpirationMRZ() { return this.#document.dateOfExpirationMRZ; }
  get dateOfExpirationVIZ() { return this.#document.dateOfExpirationVIZ; }
  set dateOfExpiration(value) { this.#document.dateOfExpiration = value; }
  get nationalityCode() { return this.#document.nationalityCode; }
  get nationalityCodeMRZ() { return this.#document.nationalityCodeMRZ; }
  get nationalityCodeVIZ() { return this.#document.nationalityCodeVIZ; }
  set nationalityCode(value) { this.#document.nationalityCode = value; }
  get fullName() { return this.#document.fullName; } // 30 characters
  get fullNameMRZ() { return this.#document.fullNameMRZ(30); }
  get fullNameVIZ() { return this.#document.fullNameVIZ; }
  set fullName(value) { this.#document.fullName = value; }
  get optionalData() { return this.#document.optionalData; } // 26 characters
  get optionalDataMRZ() { return this.#document.optionalDataMRZ(26); }
  set optionalData(value) { this.#document.optionalData = value; }
  get picture() { return this.#document.picture; }
  set picture(value) { this.#document.picture = value; }
  get logo() { return this.#document.logo; }
  set logo(value) { this.#document.logo = value; }
  get signature() { return this.#document.signature; }
  set signature(value) { this.#document.signature = value; }

  // TD1 MRZ Getters
  get mrzLine1() {
    return this.typeCodeMRZ +
      this.authorityCodeMRZ +
      this.numberMRZ +
      TravelDocument.generateMRZCheckDigit(this.numberMRZ) +
      this.optionalDataMRZ.slice(0,15);
  }
  get mrzLine2() {
    let uncheckedLine = this.dateOfBirthMRZ +
      TravelDocument.generateMRZCheckDigit(this.dateOfBirthMRZ) +
      this.genderMarkerMRZ +
      this.dateOfExpirationMRZ +
      TravelDocument.generateMRZCheckDigit(this.dateOfExpirationMRZ) +
      this.nationalityCodeMRZ +
      this.optionalDataMRZ.slice(15);
    return uncheckedLine +
      TravelDocument.generateMRZCheckDigit(
        this.mrzLine1.slice(5) +
        uncheckedLine.slice(0,7) +
        uncheckedLine.slice(8,15) +
        uncheckedLine.slice(18)
      );
  }
  get mrzLine3() { return this.fullNameMRZ; }
  get machineReadableZone() {
    return this.mrzLine1 +
      "\n" +
      this.mrzLine2 +
      "\n" +
      this.mrzLine3; }

  // Constructor
  constructor(opt) {
    if (opt) {
      if (opt.typeCode) { this.typeCode = opt.typeCode; }
      if (opt.authorityCode) { this.authorityCode = opt.authorityCode; }
      if (opt.number) { this.number = opt.number; }
      if (opt.dateOfBirth) { this.dateOfBirth = opt.dateOfBirth; }
      if (opt.genderMarker) { this.genderMarker = opt.genderMarker; }
      if (opt.dateOfExpiration) { this.dateOfExpiration = opt.dateOfExpiration; }
      if (opt.nationalityCode) { this.nationalityCode = opt.nationalityCode; }
      if (opt.fullName) { this.fullName = opt.fullName; }
      if (opt.optionalData) { this.optionalData = opt.optionalData; }
      if (opt.picture) { this.picture = opt.picture; }
      if (opt.logo) { this.logo = opt.logo; }
      if (opt.signature) { this.signature = opt.signature; }
    }
  }
}

export { TD1Document };