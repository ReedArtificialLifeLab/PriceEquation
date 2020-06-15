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

var gpe_result = {};
var gpe_result_table = null;

var gpe_analysis = null;

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
gpe_result_table.add_column("\\(\\textit{cov}(\\tilde{C}^a_*, X^a)\\)", "covt_ancestors");
gpe_result_table.add_column("\\(\\textit{ave}(\\Delta X)\\)", "ave_DX");
gpe_result_table.add_column("\\(\\textit{cov}(\\tilde{C}^*_d, X_d)\\)", "covt_descendants");
gpe_result_table.add_column("\\(\\overline{X}^a\\)", "Xbar_ancestors");
gpe_result_table.add_column("\\(\\overline{X}_d\\)", "Xbar_descendants");
gpe_result_table.add_column("\\(\\Delta\\overline{X}\\)", "DXbar");

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
    gpe_result_table.add_row([
      ancestor_level+"→"+(ancestor_level+1),
      parse_gpe_result(gpe_analysis.covt_ancestors()),
      parse_gpe_result(gpe_analysis.ave_DX()),
      parse_gpe_result(gpe_analysis.covt_descendants()),
      parse_gpe_result(gpe_analysis.Xbar_ancestors()),
      parse_gpe_result(gpe_analysis.Xbar_descendants()),
      parse_gpe_result(gpe_analysis.DXbar_simple())
    ]);
  }

  gpe_result_table.update_html();
}

//
// gpe analysis
//

function calculate_gpe_result() {
  gpe_analysis = new GPE_Analysis(genealogy, gpe_config.trait);

  gpe_result = {
    covt_ancestors: gpe_analysis.covt_ancestors(),
    ave_DX: gpe_analysis.ave_DX(),
    covt_descendants: gpe_analysis.covt_descendants(),
    DXbar: gpe_analysis.DXbar_simple(),
    Xbar_ancestors: gpe_analysis.Xbar_ancestors(),
    Xbar_descendants: gpe_analysis.Xbar_descendants()
  };

  update_gpe_result_outputs();
  update_gpe_graph();
}

//
// run
//

window.onload = () => {
  generate_genealogy();
};
