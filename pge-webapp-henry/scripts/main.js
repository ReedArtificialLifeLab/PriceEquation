//
// global variables
//

// genealogy

var genealogy_config_inputs = null;
var genealogy_config = {};

var genealogy = null;

var gpe_config_inputs = {};
var gpe_config = {};

// gpe analysis

var gpe_result_table = null;

//
// genealogy config
//

genealogy_config_inputs = {};

function add_genealogy_config_input(id) {
  genealogy_config_inputs[id] = document.getElementById("input_"+id);
}

add_genealogy_config_input("initial_distribution_trait0");
add_genealogy_config_input("initial_distribution_trait1");
add_genealogy_config_input("fitness_trait0");
add_genealogy_config_input("fitness_trait1");
add_genealogy_config_input("parentality");
add_genealogy_config_input("generations");
add_genealogy_config_input("allow_older_parents");
add_genealogy_config_input("edge_physics");
add_genealogy_config_input("show_graph");

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

  genealogy_config.allow_older_parents = genealogy_config_inputs.allow_older_parents.checked

  if (genealogy_config_inputs.edge_physics.checked) {
    genealogy_config.link_strength = 1;
  } else {
    genealogy_config.link_strength = 0;
  }

  genealogy_config.show_graph = genealogy_config_inputs.show_graph.checked;
}

//
// gpe config
//

gpe_config_inputs = {
  measure_trait: null,
  precision: null
};

function generate_gpe_config_inputs() {
  if (gpe_config_inputs.measure_trait !== null) {
    // TODO: actually need to check for dynamic update of traits if there are other possibilities, but for now just 2 statically
    return
    gpe_config_inputs.measure_trait.remove();
  }
  let container = document.getElementById("input_measure_trait_container");
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
  gpe_config = {
    trait: parseInt(gpe_config_inputs.measure_trait.value),
    precision: 100000
  };
}

function load_configs() {
  load_genealogy_config();
  load_gpe_config();

  generate_gpe_config_inputs();
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

  genealogy = create_simple_genealogy(
    genealogy_config.initial_distribution,
    genealogy_config.fitness,
    genealogy_config.parents_count,
    genealogy_config.generations_count,
    allow_older_parents=genealogy_config.allow_older_parents,
    progress=genealogy_progress
  );

  simulate_graph(
    genealogy,
    "#graph_container",
    genealogy_graph_layout.width,
    genealogy_graph_layout.height,
    link_strength=genealogy_config.link_strength,
    show_graph=genealogy_config.show_graph);
  calculate_gpe_result();
}

//
// gpe results
//

// initialize gpe result table
gpe_result_table = new Dynamic_Table(
  document.getElementById("gpe_table_container"));
gpe_result_table.add_column("gen", "generation")
gpe_result_table.add_column("\\(\\textit{cov}(\\tilde{C}^a_*, X^a)\\)", "cov_Ctil_X_ancestors");
gpe_result_table.add_column("\\(\\textit{ave}(\\Delta X)\\)", "ave_DX");
gpe_result_table.add_column("\\(\\textit{cov}(\\tilde{C}^*_d, X_d)\\)", "cov_Ctil_X_descendants");
gpe_result_table.add_column("\\(\\overline{X}^a\\)", "Xbar_ancestors");
gpe_result_table.add_column("\\(\\overline{X}_d\\)", "Xbar_descendants");
gpe_result_table.add_column("\\(\\Delta\\overline{X}\\)", "DXbar");
gpe_result_table.add_column("error", "error");

function parse_gpe_result(x) {
  return Math.round(parseFloat(x) * gpe_config.precision) / gpe_config.precision;
}

function update_gpe_result_outputs() {
  gpe_result_table.clear_rows();

  for(var ancestor_level = 0;
      ancestor_level < genealogy_config.generations_count - 1;
      ancestor_level++)
  {
    let gpe_analysis = new GPE_Analysis(genealogy, gpe_config.trait, ancestor_level);
    let covt_a = gpe_analysis.cov_Ctil_X_ancestors();
    let ave_DX = gpe_analysis.ave_DX();
    let covt_d = gpe_analysis.cov_Ctil_X_descendants();
    let DXbar = gpe_analysis.DXbar_simple();
    let error = Math.abs(DXbar - (covt_a + ave_DX - covt_d));
    gpe_result_table.add_row([
      ancestor_level+"→"+(ancestor_level+1),
      parse_gpe_result(covt_a),
      parse_gpe_result(ave_DX),
      parse_gpe_result(covt_d),
      parse_gpe_result(gpe_analysis.Xbar_ancestors()),
      parse_gpe_result(gpe_analysis.Xbar_descendants()),
      parse_gpe_result(DXbar),
      parse_gpe_result(error)
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

window.onload = () => {
  generate_genealogy();
};

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
