//
// global variables
//

// genealogy

var genealogy_config_inputs = {};
var genealogy_config = {};
var genealogy_config_defaults = {};

var genealogy = null;

// gpe analysis

var gpe_result_table = null;

//
// genealogy config
//

function add_genealogy_config_input(id) {
  let element = document.getElementById("input_"+id);
  genealogy_config_inputs[id] = element;
  return element;
}

genealogy_config_defaults = {
  trait_mode: "1b",
  //
  initial_distribution_trait0: 2,
  initial_distribution_trait1: 2,
  initial_distribution_trait00: 1,
  initial_distribution_trait01: 1,
  initial_distribution_trait10: 1,
  initial_distribution_trait11: 1,
  //
  fitness_trait0: 1,
  fitness_trait1: 1,
  fitness_trait00: 1,
  fitness_trait01: 1,
  fitness_trait10: 1,
  fitness_trait11: 1,
  //
  parentality: 2,
  //
  generations: 2,
  //
  allow_older_parents: false,
  edge_physics: false,
  show_graph: true,
  //
  measure_trait: null
};

for (var id in genealogy_config_defaults) {
  let value = genealogy_config_defaults[id];
  let element = add_genealogy_config_input(id)
  switch (typeof(value)) {
    case "number"  : element.value   = value; break;
    case "boolean" : element.checked = value; break;
    case "string"  : element.value   = value; break;
    case null      : break;
  }
}

var trait_modes = ["1b", "2b"];
var for_trait_modes = {};
trait_modes.forEach((trait_mode) => {
  for_trait_modes[trait_mode] = document.getElementsByClassName("for_trait_mode_"+trait_mode);
});

function update_trait_mode() {
  // show/hide appropriate controls
  genealogy_config.trait_mode = genealogy_config_inputs.trait_mode.value;
  let trait_mode = genealogy_config.trait_mode;
  trait_modes.forEach((trait_mode_) => {
    let elements = for_trait_modes[trait_mode_];
    if (trait_mode == trait_mode_)
    { for (var i = 0; i < elements.length; i++) { unhide(elements[i]); } } else
    { for (var i = 0; i < elements.length; i++) { hide(elements[i]); } }
  });

  // update measure_trait options
  // clear old options
  let measure_trait = genealogy_config_inputs.measure_trait;
  while (measure_trait.children.length > 0)
  { measure_trait.removeChild(measure_trait.children[0]); }
  // chiise
  switch (genealogy_config.trait_mode) {
    case "1b" : traits = [[0], [1]];                       break;
    case "2b" : traits = [[0, 0], [0, 1], [1, 0], [1, 1]]; break;
    default   : traits = [[0], [1]];                       break;
  }
  traits.forEach((trait, index) => {
    let option = document.createElement("option");
    option.value = index;
    option.innerText = represent_trait(trait).string;
    measure_trait.appendChild(option);
  });
}

function load_genealogy_config() {
  // initial_distribution and fitness

  switch (genealogy_config.trait_mode) {
    case "1b":
      genealogy_config.initial_distribution = [
        parseInt(genealogy_config_inputs.initial_distribution_trait0.value),
        0,
        parseInt(genealogy_config_inputs.initial_distribution_trait0.value),
        0
      ];
      let fitnesses_1b = [
        parseInt(genealogy_config_inputs.fitness_trait0.value),
        0,
        parseInt(genealogy_config_inputs.fitness_trait1.value),
        0
      ];
      genealogy_config.fitness = (trait) => fitnesses_1b[trait_to_index(trait)];
      break;
    case "2b":
      genealogy_config.initial_distribution = [
        parseInt(genealogy_config_inputs.initial_distribution_trait00.value),
        parseInt(genealogy_config_inputs.initial_distribution_trait01.value),
        parseInt(genealogy_config_inputs.initial_distribution_trait10.value),
        parseInt(genealogy_config_inputs.initial_distribution_trait11.value)
      ];
      let fitnesses_2b = [
        parseInt(genealogy_config_inputs.fitness_trait00.value),
        parseInt(genealogy_config_inputs.fitness_trait01.value),
        parseInt(genealogy_config_inputs.fitness_trait10.value),
        parseInt(genealogy_config_inputs.fitness_trait11.value)
      ];
      genealogy_config.fitness = (trait) => fitnesses_2b[trait_to_index(trait)];
      break;
  }

  genealogy_config.parents_count = parseInt(genealogy_config_inputs.parentality.value);

  genealogy_config.generations_count = parseInt(genealogy_config_inputs.generations.value);

  genealogy_config.allow_older_parents = genealogy_config_inputs.allow_older_parents.checked

  genealogy_config.measure_trait = index_to_trait(genealogy_config_inputs.measure_trait.value, genealogy_config.initial_distribution.length);

  genealogy_config.link_strength = genealogy_config_inputs.edge_physics.checked ? 1 : 0;

  genealogy_config.show_graph = genealogy_config_inputs.show_graph.checked;

  genealogy_config.precision = 100000;
}

function update_config_inputs() {
  update_trait_mode();
}
update_config_inputs();

function load_configs() {
  load_genealogy_config();
}

//
// graph
//

var genealogy_progress = {
  container: document.getElementById("progress_container_generate_genealogy"),
  bar: document.getElementById("progress_bar_generate_genealogy")
};

const genealogy_graph_layout = {
  width: 400,
  height: 500
}

function generate_genealogy() {
  load_configs();

  // create genealogy
  create_simple_genealogy(
      genealogy_config.initial_distribution,
      genealogy_config.fitness,
      genealogy_config.parents_count,
      genealogy_config.generations_count,
      allow_older_parents = genealogy_config.allow_older_parents,
      progress = genealogy_progress
  ).then((genealogy_new) =>
  // calculate gpe result
  {
    genealogy = genealogy_new;
    simulate_graph(
      genealogy,
      "#graph_container",
      genealogy_graph_layout.width,
      genealogy_graph_layout.height,
      link_strength=genealogy_config.link_strength,
      show_graph=genealogy_config.show_graph);
    calculate_gpe_result();
  });
}

//
// gpe results
//

// initialize gpe result table
gpe_result_table = new Dynamic_Table(
  document.getElementById("gpe_table_container"));

gpe_result_table.add_column("gen", "generation")

gpe_result_table.add_column("\\(\\overline{X}^a\\)", "Xbar_ancestors");
gpe_result_table.add_column("\\(\\overline{X}_d\\)", "Xbar_descendants");
gpe_result_table.add_column("\\(\\Delta\\overline{X}\\)", "DXbar");

gpe_result_table.add_column("\\(\\textit{cov}(\\tilde{C}^a_*, X^a)\\)", "cov_Ctil_X_ancestors");
gpe_result_table.add_column("\\(\\textit{ave}(\\Delta X)\\)", "ave_DX");
gpe_result_table.add_column("\\(\\textit{cov}(\\tilde{C}^*_d, X_d)\\)", "cov_Ctil_X_descendants");

function parse_gpe_result(x) {
  return Math.round(parseFloat(x) * genealogy_config.precision) / genealogy_config.precision;
}

function update_gpe_result_outputs() {
  gpe_result_table.clear_rows();

  for(var ancestor_level = 0;
      ancestor_level < genealogy_config.generations_count - 1;
      ancestor_level++)
  {
    let gpe_analysis = new GPE_Analysis(genealogy, genealogy_config.measure_trait, ancestor_level);
    let covt_a = gpe_analysis.cov_Ctil_X_ancestors();
    let ave_DX = gpe_analysis.ave_DX();
    let covt_d = gpe_analysis.cov_Ctil_X_descendants();
    let DXbar = gpe_analysis.DXbar_simple();
    gpe_result_table.add_row([
      ancestor_level+"→"+(ancestor_level+1),
      parse_gpe_result(gpe_analysis.Xbar_ancestors()),
      parse_gpe_result(gpe_analysis.Xbar_descendants()),
      parse_gpe_result(DXbar),
      parse_gpe_result(covt_a),
      parse_gpe_result(ave_DX),
      parse_gpe_result(covt_d)
    ]);
  }

  gpe_result_table.update_html();
}

function test_gpe_result() {
  let ancestor_level = 0;
  let gpe_analysis = new GPE_Analysis(
    genealogy, gpe_config.trait, ancestor_level);
  return {
    level: ancestor_level+"→"+(ancestor_level+1),
    cov_Ctil_X_ancestors: gpe_analysis.cov_Ctil_X_ancestors(),
    ave_DX: gpe_analysis.ave_DX(),
    cov_Ctil_X_descendants: gpe_analysis.cov_Ctil_X_descendants(),
    Xbar_ancestors: gpe_analysis.Xbar_ancestors(),
    Xbar_descendants: gpe_analysis.Xbar_descendants(),
    DXbar_simple: gpe_analysis.DXbar_simple()
  };
}

//
// gpe analysis
//

function calculate_gpe_result() {
  update_gpe_result_outputs();
  update_gpe_graph();
}

//
// run
//


function when_available(name, callback) {
  let interval = 10; // ms
  let interval_id = setInterval(() => {
    if (window[name] !== undefined) {
      clearInterval(interval_id);
      callback();
    }
  }, interval);
}

when_available("Plotly", () => generate_genealogy());


window.addEventListener("keypress", (e) => {
  if (e.key === " ") {
    e.preventDefault();
    generate_genealogy();
  }
})

/*
window.onload = () => {
  load_configs();

  // genealogy = create_simple_genealogy(
  //   genealogy_config.initial_distribution,
  //   genealogy_config.fitness,
  //   genealogy_config.parents_count,
  //   genealogy_config.generations_count,
  //   allow_older_parents=genealogy_config.allow_older_parents,
  //   progress=genealogy_progress
  // );

  // create genealogy
  genealogy = new Graph();
  // create nodes
  let node_ids = [];
  let red_ids  = [2,3,5,6,7];
  let blue_ids = [0,1,4];
  for (var i = 0; i < 8; i++) {
    let node_id = genealogy.add_node();
    genealogy.set_level(node_id, Math.floor(i/4));
    if (red_ids.includes(i))
    { genealogy.update_node_metadata(node_id, { trait: 0, fill: "red" }); }
    else
    { genealogy.update_node_metadata(node_id, { trait: 1, fill: "blue" }); }
    node_ids.push(node_id);
  }
  // create edges
  let edges = [
    [1, 4],
    [2, 5],
    [3, 6],
    [3, 7]
  ];
  for (var i = 0; i < edges.length; i++) {
    genealogy.add_edge(edges[i][0], edges[i][1],
      { stroke: genealogy.get_node_metadata(edges[i][0]).fill });
  }

  // genealogy.add_edge(node_ids[1], node_ids[4], { stroke: "red" });
  // genealogy.add_edge(node_ids[2], node_ids[5], { stroke: "blue" });
  // genealogy.add_edge(node_ids[3], node_ids[6], { stroke: "blue" });
  // genealogy.add_edge(node_ids[3], node_ids[7], { stroke: "blue" });

  simulate_graph(
    genealogy,
    "#graph_container",
    genealogy_graph_layout.width,
    genealogy_graph_layout.height,
    link_strength=genealogy_config.link_strength,
    show_graph=genealogy_config.show_graph);
  calculate_gpe_result();
}
*/
