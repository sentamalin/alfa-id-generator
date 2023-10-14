// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Default color for the dark (black) areas of a barcode.
 * @readonly
 */
export const BARCODE_DARK_COLOR = "#000000ff";

/**
 * Default color for the light (white) areas of a barcode.
 * @readonly
 */
export const BARCODE_LIGHT_COLOR = "#00000000";

/**
 * Default error correction used in a barcode.
 * @readonly
 */
export const BARCODE_ERROR_CORRECTION = "M";

/**
 * Default header color used in a rendered travel document.
 * @readonly
 */
export const HEADER_COLOR = "#4090ba";

/**
 * Default text color used in a rendered travel document.
 * @readonly
 */
export const TEXT_COLOR = "#000000";

/**
 * Default background color used in a rendered travel document when no
 *     background image is set.
 * @readonly
 */
export const BACKGROUND_COLOR = "#eeeeee";

/**
 * Default background color used in a rendered travel document's
 *     Machine-Readable Zone (MRZ) when no background image is set.
 * @readonly
 */
export const MRZ_BACKGROUND_COLOR = "#ffffff";

/**
 * Default opacity of the photo or logo underlay areas of a rendered
 *     travel document.
 * @readonly
 */
export const UNDERLAY_OPACITY = 255;

/**
 * Default full name or title of a rendered travel document's issuing
 *     authority.
 * @readonly
 */
export const FULL_AUTHORITY = "AIR LINE FURRIES ASSOCIATION, INTERNATIONAL";

/**
 * Default name of a rendered visa document.
 * @readonly
 */
export const VISA_NAME = "FURRY EVENTS VISA";

/**
 * Machine-Readable Zone (MRZ) line length of a TD1-sized travel document.
 * @readonly
 */
export const TD1_MRZ_LINE_LENGTH = 30;

/**
 * Machine-Readable Zone (MRZ) line length of a TD2-sized travel document.
 * @readonly
 */
export const TD2_MRZ_LINE_LENGTH = 36;

/**
 * Machine-Readable Zone (MRZ) line length of a TD3-sized travel document.
 * @readonly
 */
export const TD3_MRZ_LINE_LENGTH = 44;

/**
 * Default text for a rendered travel document's name header in English, French,
 *     and Spanish.
 * @readonly
 */
export const nameHeader = [
  "NAME",
  "NOM",
  "APELLIDOS"
];

/**
 * Default text for a rendered travel document's gender marker header in
 *     English, French, and Spanish.
 * @readonly
 */
export const genderHeader = [
  "GENDER",
  "GENRE",
  "GENÉRO"
];

/**
 * Default text for a rendered travel document's nationality header in English,
 *     French, and Spanish.
 * @readonly
 */
export const nationalityHeader = [
  "NATIONALITY",
  "NATIONALITÉ",
  "NACIONALIDAD"
];

/**
 * Default text for a rendered travel document's date of birth header in
 *     English, French, and Spanish.
 * @readonly
 */
export const birthDateHeader = [
  "DATE OF BIRTH",
  "DATE DE NAISSANCE",
  "FECHA DE NACIMIENTO"
];

/**
 * Default text for a rendered travel document's employer header in English,
 *     French, and Spanish.
 * @readonly
 */
export const employerHeader = [
  "EMPLOYER",
  "EMPLOYEUR",
  "EMPLEADOR"
];

/**
 * Default text for a rendered travel document's occupation header in English,
 *     French, and Spanish.
 * @readonly
 */
export const occupationHeader = [
  "OCCUPATION",
  "OCCUPATION",
  "OCUPACIÓN"
];

/**
 * Default text for a rendered travel document's certificate number header in
 *     English, French, and Spanish.
 * @readonly
 */
export const certificateNoHeader = [
  "CERTIFICATE NO",
  "NO DU CERTIFICAT",
  "NO DEL CERTIFICADO"
];

/**
 * Default text for a rendered travel document's document number header in
 *     English, French, and Spanish.
 * @readonly
 */
export const documentNoHeader = [
  "DOCUMENT NO",
  "NO DU DOCUMENT",
  "NO DEL DOCUMENTO"
];

/**
 * Default text for a rendered travel document's passport number header in
 *     English, French, and Spanish.
 * @readonly
 */
export const passportNoHeader = [
  "PASSPORT NO",
  "NO DE PASSEPORT",
  "NO DE PASAPORTE"
];

/**
 * Default text for a rendered travel document's date of expiration header in
 *     English, French, and Spanish.
 * @readonly
 */
export const expirationDateHeader = [
  "EXPIRY",
  "EXPIRATION",
  "EXPIRACIÓN"
];

/**
 * Default text for a rendered travel document's authority header in English,
 *     French, and Spanish.
 * @readonly
 */
export const authorityHeader = [
  "AUTHORITY",
  "AUTORITÉ",
  "AUTORIDAD"
];

/**
 * Default text for a rendered travel document's place of issue header in
 *     English, French, and Spanish.
 * @readonly
 */
export const placeOfIssueHeader = [
  "PLACE OF ISSUE",
  "LIEU DE DÉLIVRANCE",
  "LUGAR DE EMISIÓN"
];

/**
 * Default text for a rendered travel document's valid from header in English,
 *     French, and Spanish.
 * @readonly
 */
export const validFromHeader = [
  "VALID FROM",
  "VALABLE À PARTIR DU",
  "VÁLIDO DESDE EL"
];

/**
 * Default text for a rendered travel document's valid thru header in English,
 *     French, and Spanish.
 * @readonly
 */
export const validThruHeader = [
  "VALID THRU",
  "VALABLE JUSQU'AU",
  "VÁLIDO HASTA"
];

/**
 * Default text for a rendered travel document's number of entries header in
 *     English, French, and Spanish.
 * @readonly
 */
export const numberOfEntriesHeader = [
  "NUMBER OF ENTRIES",
  "NOMBRE D'ENTRÉES",
  "NÚMERO DE ENTRADAS"
];

/**
 * Default text for a rendered travel document's visa type header in English,
 *     French, and Spanish.
 * @readonly
 */
export const visaTypeHeader = [
  "TYPE",
  "TYPE",
  "TIPO"
];

/**
 * Default text for a rendered travel document's additional info header in
 *     English, French, and Spanish.
 * @readonly
 */
export const additionalInfoHeader = [
  "ADDITIONAL INFORMATION",
  "INFORMATIONS COMPLÉMENTAIRES",
  "INFORMACIÓN ADICIONAL"
];
