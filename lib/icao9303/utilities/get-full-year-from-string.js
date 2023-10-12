// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * A cutoff year in a two-digit year after which the year being parsed is
 *     interpreted as referring to the current century.
 */
const cutoffYear = 60;

/**
 * Given a two-digit year string, get a four-digit year string.
 * @param { string } year - A two-digit year string.
 */
export function getFullYearFromString(year) {
  return parseInt(year, 10) > cutoffYear ? `19${year}` : `20${year}`;
}