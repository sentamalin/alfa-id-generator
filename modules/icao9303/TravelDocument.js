/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/** Stores common properties and methods for all ICAO 9303 machine-readable
 *     travel documents (MRTDs) with machine-readable zones.
 * 
 *     While `TravelDocument` provides useful utility methods, the actual class
 *     is intended to be used to compose different kinds of MRTDs and not
 *     intended to be used directly.
 * 
 * @mixin
 */
class TravelDocument {
  #typeCode;
  /** A code identifying the document type.
   * @type { String }
   */
  get typeCode() { return this.#typeCode; }
  /** @param { string } value - A 1-2 character string consisting of the letters A-Z. */
  set typeCode(value) {
    if (value.toString().length > 2) {
      throw new RangeError(
        "Document code (typeCode) must be no more than 2 characters."
      );
    } else {
      this.#typeCode = new String(value.toString().toUpperCase());
      this.#typeCode.toMRZ = function() {
        return TravelDocument.padMRZString(this, 2);
      }
      this.#typeCode.toVIZ = function() {
        return this.toUpperCase();
      }
    }
  }

  #authorityCode;
  /** A code identifying the authority who issued this document.
   * @type { String }
   */
  get authorityCode() { return this.#authorityCode; }
  /** @param { string } value - A 3-character string consisting of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ. */
  set authorityCode(value) {
    if (value.toString().toUpperCase().length !== 3) {
      throw new RangeError(
        "Issuing state or organization code (authorityCode) must be 3 characters."
      );
    } else {
      if (TravelDocument.NationalityCodes[value.toString().toUpperCase()] === undefined) {
        console.warn(
          "Issuing state or organization code (authorityCode) " +
          `'${value.toString().toUpperCase()}' is not defined in ISO-3166-1 ` +
          `or ICAO 9303. '${value.toString().toUpperCase()}' may be an ` +
          "acceptable user-assigned code if it is in these letter ranges: " +
          "AAA-AAZ, QMA-QZZ, XAA-XZZ, and ZZA-ZZZ."
        );
      }
      this.#authorityCode = new String(value.toString().toUpperCase());
      this.#authorityCode.toMRZ = function() {
        return this;
      }
      this.#authorityCode.toVIZ = function() {
        return this;
      }
    }
  }

  #number;
  /** An identity document number unique for this document.
   * @type { String }
   */
  get number() { return this.#number; }
  /** @param { string } value - A string no longer than 9 characters consisting of the characters 0-9 and A-Z. */
  set number(value) {
    if (value.toString().length > 9) {
      throw new RangeError(
        "Document number (number) must be no more than 9 characters."
      );
    } else {
      this.#number = new String(value.toString().toUpperCase());
      this.#number.toMRZ = function() {
        return TravelDocument.padMRZString(this, 9);
      }
      this.#number.toVIZ = function() {
        return this.toUpperCase();
      }
    }
  }

  #birthDate;
  /** The document holder's date of birth.
   * @type { Date }
   */
  get birthDate() { return this.#birthDate; }
  /** @param { string } value - A calendar date string in YYYY-MM-DD format. */
  set birthDate(value) {
    let test = new Date(`${value}T00:00:00`);
    if (test.toString() === "Invalid Date") {
      throw new TypeError(
        "Date of birth (dateOfBirth) must be a valid date string."
      );
    } else {
      this.#birthDate = test;
      this.#birthDate.toMRZ = function() {
        return TravelDocument.dateToMRZ(this);
      }
      this.#birthDate.toVIZ = function() {
        return TravelDocument.dateToVIZ(this);
      }
    }
  }

  #genderMarker;
  /** A marker representing the document holder's gender.
   * @type { String }
   */
  get genderMarker() { return this.#genderMarker; }
  /** @param { string } value - The character 'F', 'M', or 'X'. */
  set genderMarker(value) {
    if (!["F", "M", "X"].includes(value.toUpperCase())) {
      throw new RangeError(
        "Gender marker (genderMarker) must be [F]emale, [M]ale, or Other/Unspecified [X]."
      );
    } else {
      this.#genderMarker = new String(value.toUpperCase());
      this.#genderMarker.toMRZ = function() {
        if (`${this}` === "X") { return "<"; }
        else { return this; }
      }
      this.#genderMarker.toVIZ = function() {
        return this;
      }
    }
  }

  #expirationDate;
  /** The last date on which this document is valid.
   * @type { Date }
   */
  get expirationDate() { return this.#expirationDate; }
  /** @param { string } value - A calendar date string in YYYY-MM-DD format. */
  set expirationDate(value) {
    let test = new Date(`${value}T00:00:00`);
    if (test.toString() === "Invalid Date") {
      throw new TypeError(
        "Date of expiration (dateOfExpiration) must be a valid date string."
      );
    } else {
      this.#expirationDate = test;
      this.#expirationDate.toMRZ = function() {
        return TravelDocument.dateToMRZ(this);
      }
      this.#expirationDate.toVIZ = function() {
        return TravelDocument.dateToVIZ(this);
      }
    }
  }

  #nationalityCode;
  /** A code identifying the document holder's nationality (or lack thereof).
   * @type { String }
   */
  get nationalityCode() { return this.#nationalityCode; }
  /** @param { string } value - A 3-character string consisting of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ. */
  set nationalityCode(value) {
    if (value.toString().length !== 3) {
      throw new RangeError(
        "Nationality code (nationalityCode) must be 3 characters."
      );
    }
    else {
      if (TravelDocument.NationalityCodes[value.toString().toUpperCase()] === undefined) {
        console.warn(
          `Nationality code (nationalityCode) '${value.toString().toUpperCase()}' ` +
          "is not defined in ISO-3166-1 or ICAO9303. " +
          `'${value.toString().toUpperCase()}' may be an acceptable user-assigned ` +
          "code if it is in these letter ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, and " +
          "ZZA-ZZZ."
        );
      }
      this.#nationalityCode = new String(value.toString().toUpperCase());
      this.#nationalityCode.toMRZ = function() {
        return this.toUpperCase();
      }
      this.#nationalityCode.toVIZ = function() {
        return this.toUpperCase();
      }
    }
  }

  #fullName;
  /** The document holder's full name.
   * @type { String }
   */
  get fullName() { return this.#fullName; }
  /** @param { string } value - The document holder's full name. A ', ' separates the document holder's primary identifier from their secondary identifiers. A '/' separates the full name in a non-Latin national language from a transcription/transliteration into the Latin characters A-Z. */
  set fullName(value) {
    this.#fullName = new String(value.toString());
    this.#fullName.toVIZ = function() {
      return this.toUpperCase();
    }
  }
  /** Normalize and pad a document holder's name for the name area of a Machine-Readable Zone (MRZ) of a given character length.
   * @param { string } name - The document holder's full name in the Latin characters A-Z, or a transcription/transliteration of their full name in Latin characters. A ', ' separates the document holder's primary identifier from their secondary identifiers.
   * @param { number } length - The number of characters available for the document holder's name in a Machine-Readable Zone (MRZ).
   * @example
   * // Returns "MILLEFEUILLE<<ALFALFA<<<<<<<<<"
   * TravelDocument.fullNameMRZ("Millefeuille, Alfalfa", 30);
   */
  static fullNameMRZ(name, length) {
    const normalized = TravelDocument.normalizeMRZString(name.replace(", ","<<"));
    if (normalized.length > length) {
      console.warn(
        `Name (fullName) is longer than ${length} and will be truncated.`
      );
    }
    return TravelDocument.padMRZString(normalized.substring(0,length), length);
  }

  #optionalData;
  /** Optional data to include in the Machine-Readable Zone (MRZ).
   * @type { String }
   */
  get optionalData() { return this.#optionalData; }
  /** @param { string } value - Optional data to include in the Machine-Readable Zone (MRZ). Valid characters are from the ranges 0-9 and A-Z. */
  set optionalData(value) { this.#optionalData = new String(value.toString()); }
  /** Normalize and pad optional data for the optional data area of a Machine-Readable Zone (MRZ) of a given character length.
   * @param { string } data - Optional data to include in the Machine-Readable Zone (MRZ). Valid characters are from the ranges 0-9 and A-Z.
   * @param { number } length - The number of characters available for the optional data in a Machine-Readable Zone (MRZ).
   * @example
   * // Returns "EXAMPLE<<<<<<<"
   * TravelDocument.optionalDataMRZ("EXAMPLE", 14);
   */
  static optionalDataMRZ(data, length) {
    const normalized = TravelDocument.normalizeMRZString(data);
    if (normalized.length > length) {
      console.warn(
        `Optional data (optionalData) is longer than ${length} and will be truncated.`
      );
    }
    return TravelDocument.padMRZString(normalized.substring(0,length), length);
  }

  /** A path/URL to an image, or an image object, representing a photo of the document holder.
   * @type { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame }
   */
  picture;

  /** A path/URL to an image, or an image object, representing the signature or usual mark of the document holder.
   * @type { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame }
   */
  signature;

  /** The full Machine-Readable Zone (MRZ).
   * @type { string }
   * @abstract
   */
  get machineReadableZone() {
    throw new TypeError(
      "TravelDocument.machineReadableZone must be implemented by a subclass."
    );
  }
  /**
   * @param { string } value
   * @abstract
   */
  set machineReadableZone(value) {
    throw new TypeError(
      "TravelDocument.machineReadableZone must be implemented by a subclass."
    );
  }

  /** A cutoff year in a two-digit year after which the year being parsed is interpreted as referring to the current century. */
  static cutoffYear = 60;

  /** Given a two-digit year string, get a four-digit year string.
   * @param { string } year - A two-digit year string.
   */
  static getFullYear(year) {
    return parseInt(year, 10) > this.cutoffYear ? `19${year}` : `20${year}`;
  }

  /** A list of 3-digit nationality codes available in ISO 3166-1 and ICAO 9303-3.
   * @readonly
   * @enum { Symbol }
   */
  static NationalityCodes = Object.freeze({
    // Official ISO 3166-1 alpha-3 nationality codes
    ABW: Symbol.for("Aruba"),
    AFG: Symbol.for("Afghanistan"),
    AGO: Symbol.for("Angola"),
    AIA: Symbol.for("Anguilla"),
    ALA: Symbol.for("Åland Islands"),
    ALB: Symbol.for("Albania"),
    AND: Symbol.for("Andorra"),
    ARE: Symbol.for("United Arab Emirates"),
    ARG: Symbol.for("Argentina"),
    ARM: Symbol.for("Armenia"),
    ASM: Symbol.for("American Samoa"),
    ATA: Symbol.for("Antarctica"),
    ATF: Symbol.for("French Southern Territories"),
    ATG: Symbol.for("Antigua and Barbuda"),
    AUS: Symbol.for("Australia"),
    AUT: Symbol.for("Austria"),
    AZE: Symbol.for("Azerbaijan"),
    BDI: Symbol.for("Burundi"),
    BEL: Symbol.for("Belgium"),
    BEN: Symbol.for("Benin"),
    BES: Symbol.for("Bonaire, Sint Eustatius, and Saba"),
    BFA: Symbol.for("Burkina Faso"),
    BGD: Symbol.for("Bangladesh"),
    BGR: Symbol.for("Bulgaria"),
    BHR: Symbol.for("Bahrain"),
    BHS: Symbol.for("Bahamas"),
    BIH: Symbol.for("Bosnia and Herzegovina"),
    BLM: Symbol.for("Saint Barthélemy"),
    BLR: Symbol.for("Belarus"),
    BLZ: Symbol.for("Belize"),
    BMU: Symbol.for("Bermuda"),
    BOL: Symbol.for("Bolivia (Plurinational State of)"),
    BRA: Symbol.for("Brazil"),
    BRB: Symbol.for("Barbados"),
    BRN: Symbol.for("Brunei Darussalam"),
    BTN: Symbol.for("Bhutan"),
    BVT: Symbol.for("Bouvet Island"),
    BWA: Symbol.for("Botswana"),
    CAF: Symbol.for("Central African Republic"),
    CAN: Symbol.for("Canada"),
    CCK: Symbol.for("Cocos (Keeling) Islands"),
    CHE: Symbol.for("Switzerland"),
    CHL: Symbol.for("Chile"),
    CHN: Symbol.for("China"),
    CIV: Symbol.for("Côte d'Ivoire"),
    CMR: Symbol.for("Cameroon"),
    COD: Symbol.for("Congo, Democratic Republic of the"),
    COG: Symbol.for("Congo"),
    COK: Symbol.for("Cook Islands"),
    COL: Symbol.for("Colombia"),
    COM: Symbol.for("Comoros"),
    CPV: Symbol.for("Cabo Verde"),
    CRI: Symbol.for("Costa Rica"),
    CUB: Symbol.for("Cuba"),
    CUW: Symbol.for("Curaçao"),
    CXR: Symbol.for("Christmas Island"),
    CYM: Symbol.for("Cayman Islands"),
    CYP: Symbol.for("Cyprus"),
    CZE: Symbol.for("Czechia"),
    DEU: Symbol.for("Germany"),
    DJI: Symbol.for("Djibouti"),
    DMA: Symbol.for("Dominica"),
    DNK: Symbol.for("Denmark"),
    DOM: Symbol.for("Dominican Republic"),
    DZA: Symbol.for("Algeria"),
    ECU: Symbol.for("Ecuador"),
    EGY: Symbol.for("Egypt"),
    ERI: Symbol.for("Eritrea"),
    ESH: Symbol.for("Western Sahara"),
    ESP: Symbol.for("Spain"),
    EST: Symbol.for("Estonia"),
    ETH: Symbol.for("Ethiopia"),
    FIN: Symbol.for("Finland"),
    FJI: Symbol.for("Fiji"),
    FLK: Symbol.for("Falkland Islands (Malvinas)"),
    FRA: Symbol.for("France"),
    FRO: Symbol.for("Faroe Islands"),
    FSM: Symbol.for("Micronesia (Federated States of)"),
    GAB: Symbol.for("Gabon"),
    GBR: Symbol.for("United Kingdom of Great Britain and Northern Ireland"),
    GEO: Symbol.for("Georgia"),
    GGY: Symbol.for("Guernsey"),
    GHA: Symbol.for("Ghana"),
    GIB: Symbol.for("Gibraltar"),
    GIN: Symbol.for("Guinea"),
    GLP: Symbol.for("Guadeloupe"),
    GMB: Symbol.for("Gambia"),
    GNB: Symbol.for("Guinea-Bissau"),
    GNQ: Symbol.for("Equatorial Guinea"),
    GRC: Symbol.for("Greece"),
    GRD: Symbol.for("Grenada"),
    GRL: Symbol.for("Greenland"),
    GTM: Symbol.for("Guatemala"),
    GUF: Symbol.for("French Guiana"),
    GUM: Symbol.for("Guam"),
    GUY: Symbol.for("Guyana"),
    HKG: Symbol.for("Hong Kong"),
    HMD: Symbol.for("Heard Island and McDonald Islands"),
    HND: Symbol.for("Honduras"),
    HRV: Symbol.for("Croatia"),
    HTI: Symbol.for("Haiti"),
    HUN: Symbol.for("Hungary"),
    IDN: Symbol.for("Indonesia"),
    IMN: Symbol.for("Isle of Man"),
    IND: Symbol.for("India"),
    IOT: Symbol.for("British Indian Ocean Territory"),
    IRL: Symbol.for("Ireland"),
    IRN: Symbol.for("Iran (Islamic Republic of)"),
    IRQ: Symbol.for("Iraq"),
    ISL: Symbol.for("Iceland"),
    ISR: Symbol.for("Israel"),
    ITA: Symbol.for("Italy"),
    JAM: Symbol.for("Jamaica"),
    JEY: Symbol.for("Jersey"),
    JOR: Symbol.for("Jordan"),
    JPN: Symbol.for("Japan"),
    KAZ: Symbol.for("Kazakhstan"),
    KEN: Symbol.for("Kenya"),
    KGZ: Symbol.for("Kyrgyzstan"),
    KHM: Symbol.for("Cambodia"),
    KIR: Symbol.for("Kiribati"),
    KNA: Symbol.for("Saint Kitts and Nevis"),
    KOR: Symbol.for("Korea, Republic of"),
    KWT: Symbol.for("Kuwait"),
    LAO: Symbol.for("Lao People's Democratic Republic"),
    LBN: Symbol.for("Lebanon"),
    LBR: Symbol.for("Liberia"),
    LBY: Symbol.for("Libya"),
    LCA: Symbol.for("Saint Lucia"),
    LIE: Symbol.for("Liechtenstein"),
    LKA: Symbol.for("Sri Lanka"),
    LSO: Symbol.for("Lesotho"),
    LTU: Symbol.for("Lithuania"),
    LUX: Symbol.for("Luxembourg"),
    LVA: Symbol.for("Latvia"),
    MAC: Symbol.for("Macao"),
    MAF: Symbol.for("Saint Martin (French part)"),
    MAR: Symbol.for("Morocco"),
    MCO: Symbol.for("Monaco"),
    MDA: Symbol.for("Moldova, Republic of"),
    MDG: Symbol.for("Madagascar"),
    MDV: Symbol.for("Maldives"),
    MEX: Symbol.for("Mexico"),
    MHL: Symbol.for("Marshall Islands"),
    MKD: Symbol.for("North Macedonia"),
    MLI: Symbol.for("Mali"),
    MLT: Symbol.for("Malta"),
    MMR: Symbol.for("Myanmar"),
    MNE: Symbol.for("Montenegro"),
    MNG: Symbol.for("Mongolia"),
    MNP: Symbol.for("Northern Mariana Islands"),
    MOZ: Symbol.for("Mozambique"),
    MRT: Symbol.for("Mauritania"),
    MSR: Symbol.for("Montserrat"),
    MTQ: Symbol.for("Martinique"),
    MUS: Symbol.for("Mauritius"),
    MWI: Symbol.for("Malawi"),
    MYS: Symbol.for("Malaysia"),
    MYT: Symbol.for("Mayotte"),
    NAM: Symbol.for("Namibia"),
    NCL: Symbol.for("New Caledonia"),
    NER: Symbol.for("Niger"),
    NFK: Symbol.for("Norfolk Island"),
    NGA: Symbol.for("Nigeria"),
    NIC: Symbol.for("Nicaragua"),
    NIU: Symbol.for("Niue"),
    NLD: Symbol.for("Netherlands, Kingdom of the"),
    NOR: Symbol.for("Norway"),
    NPL: Symbol.for("Nepal"),
    NRU: Symbol.for("Nauru"),
    NZL: Symbol.for("New Zealand"),
    OMN: Symbol.for("Oman"),
    PAK: Symbol.for("Pakistan"),
    PAN: Symbol.for("Panama"),
    PCN: Symbol.for("Pitcairn"),
    PER: Symbol.for("Peru"),
    PHL: Symbol.for("Philippines"),
    PLW: Symbol.for("Palau"),
    PNG: Symbol.for("Papua New Guinea"),
    POL: Symbol.for("Poland"),
    PRI: Symbol.for("Puerto Rico"),
    PRK: Symbol.for("Korea (Democratic People's Republic of)"),
    PRT: Symbol.for("Portugal"),
    PRY: Symbol.for("Paraguay"),
    PSE: Symbol.for("Palestine, State of"),
    PYF: Symbol.for("French Polynesia"),
    QAT: Symbol.for("Qatar"),
    REU: Symbol.for("Réunion"),
    ROU: Symbol.for("Romania"),
    RUS: Symbol.for("Russian Federation"),
    RWA: Symbol.for("Rwanda"),
    SAU: Symbol.for("Saudi Arabia"),
    SDN: Symbol.for("Sudan"),
    SEN: Symbol.for("Senegal"),
    SGP: Symbol.for("Singapore"),
    SGS: Symbol.for("South Georgia and the South Sandwich Islands"),
    SHN: Symbol.for("Saint Helena, Ascension, and Tristan de Cunha"), 
    SJM: Symbol.for("Svalbard and Jan Mayen"),
    SLB: Symbol.for("Solomon Islands"),
    SLE: Symbol.for("Sierra Leone"),
    SLV: Symbol.for("El Salvador"),
    SMR: Symbol.for("San Marino"),
    SOM: Symbol.for("Somalia"),
    SPM: Symbol.for("Saint Pierre and Miquelon"),
    SRB: Symbol.for("Serbia"),
    SSD: Symbol.for("South Sudan"),
    STP: Symbol.for("Sao Tome and Principe"),
    SUR: Symbol.for("Suriname"),
    SVK: Symbol.for("Slovakia"),
    SVN: Symbol.for("Slovenia"),
    SWE: Symbol.for("Sweden"),
    SWZ: Symbol.for("Eswatini"),
    SXM: Symbol.for("Sint Maarten (Dutch part)"),
    SYC: Symbol.for("Seychelles"),
    SYR: Symbol.for("Syrian Arab Republic"),
    TCA: Symbol.for("Turks and Caicos Islands"),
    TCD: Symbol.for("Chad"),
    TGO: Symbol.for("Togo"),
    THA: Symbol.for("Thailand"),
    TJK: Symbol.for("Tajikistan"),
    TKL: Symbol.for("Tokelau"),
    TKM: Symbol.for("Turkmenistan"),
    TLS: Symbol.for("Timor-Leste"),
    TON: Symbol.for("Tonga"),
    TTO: Symbol.for("Trinidad and Tobago"),
    TUN: Symbol.for("Tunisia"),
    TUR: Symbol.for("Türkiye"),
    TUV: Symbol.for("Tuvalu"),
    TWN: Symbol.for("Taiwan, Province of China"),
    TZA: Symbol.for("Tanzania, United Republic of"),
    UGA: Symbol.for("Uganda"),
    UKR: Symbol.for("Ukraine"),
    UMI: Symbol.for("United States Minor Outlying Islands"),
    URY: Symbol.for("Uruguay"),
    USA: Symbol.for("United States of America"),
    UZB: Symbol.for("Uzbekistan"),
    VAT: Symbol.for("Holy See"),
    VCT: Symbol.for("Saint Vincent and the Grenadines"),
    VEN: Symbol.for("Venezuela (Bolivarian Republic of)"),
    VGB: Symbol.for("Virgin Islands (British)"),
    VIR: Symbol.for("Virgin Islands (U.S.)"),
    VNM: Symbol.for("Viet Nam"),
    VUT: Symbol.for("Vanuatu"),
    WLF: Symbol.for("Wallis and Futuna"),
    WSM: Symbol.for("Samoa"),
    YEM: Symbol.for("Yemen"),
    ZAF: Symbol.for("South Africa"),
    ZMB: Symbol.for("Zambia"),
    ZWE: Symbol.for("Zimbabwe"),
  
    // Codes not included in ISO 3166-1
    GBD: Symbol.for("British Overseas Territories Citizen"),
    GBN: Symbol.for("British National (Overseas)"),
    GBO: Symbol.for("British Overseas Citizen"),
    GBP: Symbol.for("British Protected Person"),
    GBS: Symbol.for("British Subject"),
    RKS: Symbol.for("Republic of Kosovo"),
  
    // Codes reserved by ISO 3166/MA
    EUE: Symbol.for("European Union (EU)"),
  
    // Codes used in UN Travel Documents
    UNO: Symbol.for("United Nations Organization"),
    UNA: Symbol.for("United Nations Specialized Agency"),
    UNK: Symbol.for("United Nations Interim Administration Mission in Kosovo"),
  
    // Other issuing authorities
    XBA: Symbol.for("African Development Bank (ADB)"),
    XIM: Symbol.for("African Export-Import Bank (AFREXIM)"),
    XCC: Symbol.for("Caribbean Community (CARICOM)"),
    XCE: Symbol.for("Council of Europe"),
    XCO: Symbol.for("Common Market for Eastern and Southern Africa (COMESA)"),
    XEC: Symbol.for("Economic Community of West African States (ECOWAS"),
    XPO: Symbol.for("International Criminal Police Organization (INTERPOL)"),
    XES: Symbol.for("Organization of Eastern Caribbean States (OECS)"),
    XMP: Symbol.for("Parliamentary Assembly of the Mediterranean (PAM)"),
    XOM: Symbol.for("Sovereign Military Order of Malta"),
    XDC: Symbol.for("Southern African Development Community"),
  
    // Persons without a defined nationality
    XXA: Symbol.for("Stateless Person"),
    XXB: Symbol.for("Refugee (defined in Article 1 of the 1951 Convention)"),
    XXC: Symbol.for("Refugee (not defined under code XXB)"),
    XXX: Symbol.for("Person of Unspecified Nationality"),
  
    // Specimen Documents
    UTO: Symbol.for("Utopia"),
  
    // Used by ICAO
    IAO: Symbol.for("International Civil Aviation Organization (ICAO)"),

    // Used by ALFA
    XAF: Symbol.for("Air Line Furries Association, International")
  });

  /** Convert a Date object to a Machine-Readable Zone (MRZ) YYMMDD date string.
   * @param { Date } date
   * @example
   * // Returns "230930"
   * TravelDocument.dateToMRZ(new Date("2023-09-30T00:00:00"));
   */
  static dateToMRZ(date) { // Converts a Date to a YYMMDD MRZ date string
    return date.toISOString().slice(2,10).replace(/-/gi,"");
  }

  /** Convert a Date object to a Visual Inspection Zone (VIZ) DD MMM YYY date string.
   * @param { Date } date
   * @example
   * // Returns "30 SEP 2023"
   * TravelDocument.dateToVIZ(new Date("2023-09-30T00:00:00"));
   */
  static dateToVIZ(date) { // Converts a Date to a DD MMM YYYY VIZ date string
    let day;
    if (date.getDate().toString().length < 2) { day = `0${date.getDate().toString()}`; }
    else { day = date.getDate().toString(); }
    return (day + " " + date.toLocaleString("en-us",{ month : "short" }) +
      " " + date.getFullYear()).toUpperCase();
  }

  /** Pad the end of a Machine-Readable Zone (MRZ) string to the desired length with filler characters.
   * @param { string } string
   * @param { number } length
   * @example
   * // Returns "ALFALFA<<"
   * TravelDocument.padMRZString("ALFALFA", 9);
   */
  static padMRZString(string, length) {
    return string.padEnd(length, "<").toUpperCase();
  }

  /** Remove diacritics and punctuation from a Machine-Readable Zone (MRZ) string.
   * @param { string } string
   * @example
   * // Returns "ADRIAN<CLAUDE<DEVELEAU"
   * TravelDocument.normalizeMRZString("ADRIAN-CLAUDE D'EVELEAU");
   */
  static normalizeMRZString(string) {
    let normalized = string.normalize("NFD").replace(/\p{Diacritic}/gu,"");
    return normalized.replace(/'/gi,"").replace(/-/gi,"<").replace(/ /gi,"<").replace(/,/gi,"").toUpperCase();
  }

  /** Generate a check digit for a Machine-Readable Zone (MRZ) string
   * @param { string } string
   * @example
   * // Returns "9"
   * TravelDocument.generateMRZCheckDigit("362142069");
   */
  static generateMRZCheckDigit(string) {
    const weight = [7, 3, 1];
    let value = 0;
    for (let i = 0; i < string.length; i += 1) {
      let currentValue;
      let currentWeight = weight[i % 3];
      switch (string[i]) {
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
      value += currentValue * currentWeight;
    }
    return (value % 10).toString();
  }

  /** Create a new TravelDocument.
   * @param { Object } [opt] - An options object.
   * @param { string } [opt.typeCode] - A 1-2 character string consisting of the letters A-Z.
   * @param { string } [opt.authorityCode] - A 3-character string consisting of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   * @param { string } [opt.number] - A string no longer than 9 characters consisting of the characters 0-9 and A-Z.
   * @param { string } [opt.birthDate] - A calendar date string in YYYY-MM-DD format.
   * @param { string } [opt.genderMarker] - The character 'F', 'M', or 'X'.
   * @param { string } [opt.expirationDate] - A calendar date string in YYYY-MM-DD format.
   * @param { string } [opt.nationalityCode] - A 3-character string consisting of the letters A-Z from ISO-3166-1, ICAO 9303-3, or these user-assigned ranges: AAA-AAZ, QMA-QZZ, XAA-XZZ, or ZZA-ZZZ.
   * @param { string } [opt.fullName] - The document holder's full name. A ', ' separates the document holder's primary identifier from their secondary identifiers. A '/' separates the full name in a non-Latin national language from a transcription/transliteration into the Latin characters A-Z.
   * @param { string } [opt.optionalData] - Optional data to include in the Machine-Readable Zone (MRZ). Valid characters are from the ranges 0-9 and A-Z.
   * @param { string } [opt.machineReadableZone] - The full Machine-Readable Zone (MRZ).
   * @param { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame } [opt.picture] - A path/URL to an image, or an image object, representing a photo of the document holder.
   * @param { string | HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame } [opt.signature] - A path/URL to an image, or an image object, representing the signature or usual mark of the document holder.
   */
  constructor(opt) {
    this.typeCode = "UN";
    this.authorityCode = "UNK";
    this.number = "111222333";
    this.birthDate = "2023-09-29";
    this.genderMarker = "X";
    this.expirationDate = "2023-09-29";
    this.nationalityCode = "UNK";
    
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
      if (opt.machineReadableZone) { this.machineReadableZone = opt.machineReadableZone; }
      if (opt.picture) { this.picture = opt.picture; }
      if (opt.signature) { this.signature = opt.signature; }
    }
  }
}

export { TravelDocument };