// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * If the gender marker is 'X', convert to a '<' in the Machine-Readable Zone.
 * @param { string } gender
 * @example
 * // Returns '<'
 * genderMarkerToMRZ('X');
 */
export function genderMarkerToMRZ(gender) {
  return gender === "X" ? "<" : gender;
}
