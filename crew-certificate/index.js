/* 
 * SPDX-FileCopyrightText: Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: CC0-1.0
 */

import { CrewCertificateViewModel } from "./CrewCertificateViewModel.js";

window.addEventListener("load", initViewModel, false);

let viewModel;
async function initViewModel() {
  viewModel = new CrewCertificateViewModel();
  await viewModel.initialize(document);
}
