// json

// var input_graph_json = document.getElementById("input-graph-json");
//
// var graph = null;
//
// function load_input_json() {
//   let file = input_graph_json.files[0];
//   let reader = new FileReader();
//   reader.readAsText(file, "UTF-8");
//   reader.onload = (e) => {
//     let graph_text = e.target.result;
//     let graph_json = JSON.parse(graph_text);
//     graph = graph_from_json(graph_json);
//     simulate_graph(graph, 400, 400, "#graph-container");
//   }
//   reader.onerror = (e) => {
//     console.log("error reading file");
//     console.log(e);
//   }
// }

// genealogy_config.

var genealogy_config_inputs = {
  initial_distribution_trait0: document.getElementById("input-initial-distribution-trait0"),
  initial_distribution_trait1: document.getElementById("input-initial-distribution-trait1"),
  fitness_trait0: document.getElementById("input-fitness-trait0"),
  fitness_trait1: document.getElementById("input-fitness-trait1"),
  parentality: document.getElementById("input-parentality"),
  generations: document.getElementById("input-generations"),
  edge_physics: document.getElementById("input-edge-physics")
}

var genealogy_config = {};

function load_genealogy_config() {
  genealogy_config.initial_distribution = [
    parseInt(genealogy_config_inputs.initial_distribution_trait0.value),
    parseInt(genealogy_config_inputs.initial_distribution_trait0.value)
  ];

  let fitness_trait0 = parseInt(genealogy_config_inputs.fitness_trait0.value);
  let fitness_trait1 = parseInt(genealogy_config_inputs.fitness_trait1.value);
  genealogy_config.fitness = (trait) => {
    if (trait == 0) { return fitness_trait0; } else
    if (trait == 1) { return fitness_trait1; }
  }

  genealogy_config.parents_count = parseInt(genealogy_config_inputs.parentality.value);

  genealogy_config.generations_count = parseInt(genealogy_config_inputs.generations.value);

  if (genealogy_config_inputs.edge_physics.checked) {
    genealogy_config.link_strength = 1;
  } else {
    genealogy_config.link_strength = 0;
  }
}

// graph

var genealogy = null;

function generate_genealogy() {
  load_genealogy_config();
  genealogy = create_simple_genealogy(
    genealogy_config.initial_distribution,
    genealogy_config.fitness,
    genealogy_config.parents_count,
    genealogy_config.generations_count
  );
  simulate_graph(genealogy, 600, 600, "#graph-container", link_strength=genealogy_config.link_strength);
}

generate_genealogy();


//
// outputs
//

var gpe_result_outputs = {
  cov_ancestors: document.getElementById("output-cov-ancestors"),
  ave_Dx: document.getElementById("output-ave-Dx"),
  cov_descendants: document.getElementById("output-cov-descendants"),
  DXbar: document.getElementById("output-DXbar"),
  Xbar_ancestors: document.getElementById("output-Xbar-ancestors"),
  Xbar_descendants: document.getElementById("output-Xbar-descendants")
};

var gpe_result = {};

function update_gpe_result_outputs() {
  for (var key in gpe_result) {
    gpe_result_outputs[key].innerText = gpe_result[key].toString();
  }
}

var gpe_analysis = null;

var gpe_trait = 1;
var gpe_ancestor_level;

function calculate_results() {
  gpe_analysis = new GPE_Analysis(genealogy, gpe_trait, gpe_ancestor_level);
  gpe_result = {
    cov_ancestors: gpe_analysis.cov_ancestors(),
    ave_Dx: gpe_analysis.ave_Dx(),
    cov_descendants: gpe_analysis.cov_descendants(),
    DXbar: gpe_analysis.DXbar_simple(),
    Xbar_ancestors: gpe_analysis.Xbar_ancestors(),
    Xbar_descendants: gpe_analysis.Xbar_descendants()
  };
  console.log(gpe_result);
  update_gpe_result_outputs();
}
