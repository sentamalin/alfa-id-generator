import { CrewCertificateViewModel } from "./CrewCertificateViewModel.js";

window.addEventListener("load", initViewModel, false);

let viewModel;
async function initViewModel() {
  viewModel = new CrewCertificateViewModel();
  await viewModel.initialize(document);
}