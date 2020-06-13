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

//
// global variables
//

// config
var genealogy_config_inputs = null;
var genealogy_config = {};

// result
var gpe_result_outputs = null;

// genealoy
var genealogy = null;

// gpe analysis
var gpe_config_inputs = null;
var gpe_result = {};
var gpe_result_precision = 100000;
var gpe_analysis = null;
var gpe_trait = 0;
var gpe_ancestor_level = 0;

//
// genealogy config
//

genealogy_config_inputs = {
  initial_distribution_trait0: document.getElementById("input-initial-distribution-trait0"),
  initial_distribution_trait1: document.getElementById("input-initial-distribution-trait1"),
  fitness_trait0: document.getElementById("input-fitness-trait0"),
  fitness_trait1: document.getElementById("input-fitness-trait1"),
  parentality: document.getElementById("input-parentality"),
  generations: document.getElementById("input-generations"),
  edge_physics: document.getElementById("input-edge-physics")
};

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

//
// gpe config
//

gpe_config_inputs = {
  measure_trait: null
};

function generate_gpe_config_inputs() {
  if (gpe_config_inputs.measure_trait !== null) {
    gpe_config_inputs.measure_trait.remove();
  }
  let container = document.getElementById("input-measure-trait-container");
  let measure_trait = document.createElement("select");
  container.appendChild(measure_trait);
  gpe_config_inputs.measure_trait = measure_trait;
  traits = [0, 1];
  traits.forEach((trait) => {
    let option = document.createElement("option");
    option.value = trait;
    option.innerText = color_from_trait(trait);
    measure_trait.appendChild(option);
  });
}
generate_gpe_config_inputs();

function load_gpe_config() {
  gpe_trait = parseInt(gpe_config_inputs.measure_trait.value);
}

function load_configs() {
  load_genealogy_config();
  load_gpe_config();
}

//
// graph
//

function generate_genealogy() {
  load_configs();
  genealogy = create_simple_genealogy(
    genealogy_config.initial_distribution,
    genealogy_config.fitness,
    genealogy_config.parents_count,
    genealogy_config.generations_count
  );
  simulate_graph(genealogy, 600, 600, "#graph-container", link_strength=genealogy_config.link_strength);
  calculate_gpe_result();
}

//
// outputs
//

gpe_result_outputs = {
  covt_ancestors: document.getElementById("output-cov-ancestors"),
  ave_DX: document.getElementById("output-ave-Dx"),
  covt_descendants: document.getElementById("output-cov-descendants"),
  DXbar: document.getElementById("output-DXbar"),
  Xbar_ancestors: document.getElementById("output-Xbar-ancestors"),
  Xbar_descendants: document.getElementById("output-Xbar-descendants")
};

function update_gpe_result_outputs() {
  for (var key in gpe_result) {
    let x = gpe_result[key].toString();
    x = Math.round(x*gpe_result_precision)/gpe_result_precision;
    gpe_result_outputs[key].innerText = x.toString();
  }
}

//
// gpe analysis
//

function calculate_gpe_result() {
  gpe_analysis = new GPE_Analysis(genealogy, gpe_trait, gpe_ancestor_level);

  gpe_result = {
    covt_ancestors: gpe_analysis.covt_ancestors(),
    ave_DX: gpe_analysis.ave_DX(),
    covt_descendants: gpe_analysis.covt_descendants(),
    DXbar: gpe_analysis.DXbar_simple(),
    Xbar_ancestors: gpe_analysis.Xbar_ancestors(),
    Xbar_descendants: gpe_analysis.Xbar_descendants()
  };

  // console.log(gpe_analysis.covt_ancestors());
  // console.log(gpe_analysis.ave_DX());
  // console.log(gpe_analysis.covt_descendants());
  // console.log(gpe_analysis.DXbar_simple());
  // console.log(gpe_analysis.Xbar_ancestors());
  // console.log(gpe_analysis.Xbar_descendants());

  update_gpe_result_outputs();
}

//
// run
//

generate_genealogy();
