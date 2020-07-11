//
// constants
//


const gpe_result_keys = [
  "Xbar_ancestors",
  "Xbar_descendants",
  "DXbar",
  "cov_Ctil_X_ancestors",
  "ave_DX"
  // "cov_Ctil_X_descendants"
];


//
// global variables
//


var config_inputs = {};
var config_defaults = {};
var config = {};

// each value is a 2D array, where
// - first index is generation index
// - second index is batch index
var gpe_batch_results = {};

var trait_modes = ["1b", "2b"];
var for_trait_modes = {};

var a_gpe_export = document.getElementById("a_gpe_export");
