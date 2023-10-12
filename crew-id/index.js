// SPDX-FileCopyrightText: Don Geronimo <https://sentamal.in/>
// SPDX-License-Identifier: CC0-1.0

import { CrewIDViewModel } from "../lib/crewid-viewmodel.js";

window.addEventListener("load", initViewModel, false);

let viewModel;
async function initViewModel() {
  viewModel = new CrewIDViewModel();
  await viewModel.initialize(document);
}
