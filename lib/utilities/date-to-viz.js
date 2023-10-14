// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Convert a Date object to a Visual Inspection Zone (VIZ) DD MMM YYY
 *     date string.
 * @param { Date } date
 * @example
 * // Returns "30 SEP 2023"
 * dateToVIZ(new Date("2023-09-30T00:00:00"));
 */
export function dateToVIZ(date) {
  const DAY = date.getDate().toString().padStart(2, "0");
  return (DAY + " " + date.toLocaleString("en-us", { month : "short" }) +
      " " + date.getFullYear()).toUpperCase();
}
