/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/** Return a fully-loaded `HTMLImageElement` from a path/URL
 * @param { string } img - A path/URL to an image file.
 */
function loadImageFromURL(img) {
  return new Promise((resolve) => {
    const imgNode = new Image();
    imgNode.addEventListener(
      "load",
      () => { resolve(imgNode); },
      false
    );
    imgNode.src = img;
  });
}

export { loadImageFromURL };
