// SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * "Signs" a visible digital seal (VDS) using random numbers.
 */
async function signSealUsingRNG(model) {
  model.signatureData = [];
  for (let i = 0; i < 64; i += 1) {
    model.signatureData.push(Math.floor(Math.random() * 256));
  }
}

export { signSealUsingRNG };
