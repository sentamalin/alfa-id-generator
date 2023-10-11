// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Pad the end of a Machine-Readable Zone (MRZ) string to the desired length
 *     with a filler character.
 * @param { string } string
 * @param { number } length
 * @example
 * // Returns "ALFALFA<<"
 * TravelDocument.padMRZString("ALFALFA", 9);
 */
export function padMRZString(string, length) {
  return string.padEnd(length, "<").toUpperCase();
}
