// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Convert a Date object to a Machine-Readable Zone (MRZ) YYMMDD date string.
 * @param { Date } date 
 * @example
 * // Returns "230930"
 * dateToMRZ(new Date("2023-09-30T00:00:00"));
 */
export function dateToMRZ(date) {
  return date.toISOString().slice(2, 10).replace(/-/gi, "");
}
