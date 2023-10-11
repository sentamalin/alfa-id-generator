// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Remove diacritics and punctuation from a Machine-Readable Zone (MRZ)
 *     string.
 * @param { string } string
 * @example
 * // Returns "ADRIAN<CLAUDE<DEVELEAU"
 * TravelDocument.normalizeMRZString("ADRIAN-CLAUDE D'EVELEAU");
 */
export function normalizeMRZString(string) {
  const NORMALIZE = string.normalize("NFD").replace(/\p{Diacritic}/gu,"");
  const REPLACE_COMMA_AND_DASH =
      NORMALIZE.replace(/'/gi,"").replace(/-/gi,"<");
  const REPLACE_SPACE_AND_COMMA =
      REPLACE_COMMA_AND_DASH.replace(/ /gi,"<").replace(/,/gi,"");
  return REPLACE_SPACE_AND_COMMA.toUpperCase();
}
