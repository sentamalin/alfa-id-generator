import { TravelDocument } from "./TravelDocument.js";

class TD2Document {
  /* This defines common fields, properties, and methods for ICAO 9303 TD2
     travel documents (small passport page) with machine-readable zone (MRZ). */
  
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
  get fullName() { return this.#document.fullName; } // 31 characters
  get fullNameMRZ() { return this.#document.fullNameMRZ(31); }
  get fullNameVIZ() { return this.#document.fullNameVIZ; }
  set fullName(value) { this.#document.fullName = value; }
  get number() { return this.#document.number; }
  get numberMRZ() { return this.#document.numberMRZ; }
  get numberVIZ() { return this.#document.numberVIZ; }
  set number(value) { this.#document.number = value; }
  get nationalityCode() { return this.#document.nationalityCode; }
  get nationalityCodeMRZ() { return this.#document.nationalityCodeMRZ; }
  get nationalityCodeVIZ() { return this.#document.nationalityCodeVIZ; }
  set nationalityCode(value) { this.#document.nationalityCode = value; }
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
  get optionalData() { return this.#document.optionalData; } // 7 characters
  get optionalDataMRZ() { return this.#document.optionalDataMRZ(7); }
  set optionalData(value) { this.#document.optionalData = value; }
  get picture() { return this.#document.picture; }
  set picture(value) { this.#document.picture = value; }
  get logo() { return this.#document.logo; }
  set logo(value) { this.#document.logo = value; }
  get signature() { return this.#document.signature; }
  set signature(value) { this.#document.signature = value; }

  // TD2 MRZ Getters
  get mrzLine1() {
    return this.typeCodeMRZ +
      this.authorityCodeMRZ +
      this.fullNameMRZ;
  }
  get mrzLine2() {
    let uncheckedLine = this.numberMRZ +
      TravelDocument.generateMRZCheckDigit(this.numberMRZ) +
      this.nationalityCodeMRZ +
      this.dateOfBirthMRZ +
      TravelDocument.generateMRZCheckDigit(this.dateOfBirthMRZ) +
      this.genderMarkerMRZ +
      this.dateOfExpirationMRZ +
      TravelDocument.generateMRZCheckDigit(this.dateOfExpirationMRZ) +
      this.optionalDataMRZ;
    return uncheckedLine +
      TravelDocument.generateMRZCheckDigit(
        uncheckedLine.slice(0,10) +
        uncheckedLine.slice(13,20) +
        uncheckedLine.slice(21)
      );
  }
  get machineReadableZone() {
    return this.mrzLine1 +
      "\n" +
      this.mrzLine2;
  }

  // Constructor
  constructor(opt) {
    if (opt) {
      if (opt.typeCode) { this.typeCode = opt.typeCode; }
      if (opt.authorityCode) { this.authorityCode = opt.authorityCode; }
      if (opt.fullName) { this.fullName = opt.fullName; }
      if (opt.number) { this.number = opt.number; }
      if (opt.nationalityCode) { this.nationalityCode = opt.nationalityCode; }
      if (opt.dateOfBirth) { this.dateOfBirth = opt.dateOfBirth; }
      if (opt.genderMarker) { this.genderMarker = opt.genderMarker; }
      if (opt.dateOfExpiration) { this.dateOfExpiration = opt.dateOfExpiration; }
      if (opt.optionalData) { this.optionalData = opt.optionalData; }
      if (opt.picture) { this.picture = opt.picture; }
      if (opt.logo) { this.logo = opt.logo; }
      if (opt.signature) { this.signature = opt.signature; }
    }
  }
}

export { TD2Document };