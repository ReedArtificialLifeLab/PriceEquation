//
// constants
//


const gpe_result_keys = [
  "Xbar_ancestors",
  "Xbar_descendants",
  "DXbar",
  "cov_Ctil_X_ancestors",
  "ave_DX",
  "cov_Ctil_X_descendants"
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

var div_gpe_results_graph_container = document.getElementById("gpe_results_graph_container");

var button_simulate_batch = document.getElementById("button_simulate_batch");

var div_simulate_batch_status = document.getElementById("simulate_batch_status");
// var image_simulate_batch_status = document.getElementById("simulate_batch_status_image");

var span_progress_text = document.getElementById("progress_text");
