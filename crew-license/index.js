/*
 * SPDX-FileCopyrightText: 2023 Don Geronimo <https://sentamal.in/>
 * SPDX-License-Identifier: CC0-1.0
 */

import { CrewLicenseViewModel } from "./CrewLicenseViewModel.js";

window.addEventListener("load", initViewModel, false);

let viewModel;
async function initViewModel() {
  viewModel = new CrewLicenseViewModel();
  await viewModel.initialize(document);
}