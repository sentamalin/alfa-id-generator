import { CrewLicenseViewModel } from "./CrewLicenseViewModel.js";

window.addEventListener("load", initViewModel, false);

let viewModel;
async function initViewModel() {
  viewModel = new CrewLicenseViewModel();
  await viewModel.initialize(document);
}