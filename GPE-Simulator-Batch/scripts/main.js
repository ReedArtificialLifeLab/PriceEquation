//
// global variables
//

// global variables

var config_inputs = {};
var config_defaults = {};
var config = {};

// each value is a 2D array, where
// - first index is generation index
// - second index is batch index
var gpe_batch_results = {};

//
// genealogy config
//

function add_config_input(id) {
  let element = document.getElementById("input_"+id);
  config_inputs[id] = element;
  return element;
}

config_defaults = {
  trait_mode: "1b",
  //
  initial_distribution_trait0: 2,
  initial_distribution_trait1: 2,
  initial_distribution_trait00: 2,
  initial_distribution_trait01: 2,
  initial_distribution_trait10: 2,
  initial_distribution_trait11: 2,
  //
  fitness_trait0: 1,
  fitness_trait1: 1,
  fitness_trait00: 1,
  fitness_trait01: 1,
  fitness_trait10: 1,
  fitness_trait11: 1,
  //
  gerophilia: -1,
  mutation: -1,
  parentality: 2,
  generations: 10,
  allow_older_parents: false,
  //
  measure_trait: null,
  //
  batch_size: 10
};

for (var id in config_defaults) {
  let value = config_defaults[id];
  let element = add_config_input(id)
  switch (typeof(value)) {
    case "number"  : element.value   = value; break;
    case "boolean" : element.checked = value; break;
    case "string"  : element.value   = value; break;
    default : break;
  }
}

var trait_modes = ["1b", "2b"];
var for_trait_modes = {};
trait_modes.forEach((trait_mode) => {
  for_trait_modes[trait_mode] = document.getElementsByClassName("for_trait_mode_"+trait_mode);
});

function update_trait_mode() {
  // show/hide appropriate controls
  config.trait_mode = config_inputs.trait_mode.value;
  let trait_mode = config.trait_mode;
  trait_modes.forEach((trait_mode_) => {
    let elements = for_trait_modes[trait_mode_];
    if (trait_mode == trait_mode_)
    { for (var i = 0; i < elements.length; i++) { unhide(elements[i]); } } else
    { for (var i = 0; i < elements.length; i++) { hide(elements[i]); } }
  });

  // update measure_trait options
  // clear old options
  let measure_trait = config_inputs.measure_trait;
  while (measure_trait.children.length > 0)
  { measure_trait.removeChild(measure_trait.children[0]); }
  // choose
  switch (config.trait_mode) {
    case "1b" : traits = [[0, 0], [1, 0]];                 break;
    case "2b" : traits = [[0, 0], [0, 1], [1, 0], [1, 1]]; break;
    default   : traits = [[0, 0], [1, 0]];                 break;
  }
  traits.forEach((trait, index) => {
    let option = document.createElement("option");
    option.value = trait_to_index(trait);
    option.innerText = represent_trait(trait).string;
    measure_trait.appendChild(option);
  });
}

function load_config() {
  // initial_distribution and fitness

  switch (config.trait_mode) {
    case "1b":
      config.initial_distribution = [
        parseInt(config_inputs.initial_distribution_trait0.value),
        0,
        parseInt(config_inputs.initial_distribution_trait1.value),
        0
      ];
      let fitnesses_1b = [
        parseInt(config_inputs.fitness_trait0.value),
        0,
        parseInt(config_inputs.fitness_trait1.value),
        0
      ];
      config.fitness = (trait) => fitnesses_1b[trait_to_index(trait)];
      break;
    case "2b":
      config.initial_distribution = [
        parseInt(config_inputs.initial_distribution_trait00.value),
        parseInt(config_inputs.initial_distribution_trait01.value),
        parseInt(config_inputs.initial_distribution_trait10.value),
        parseInt(config_inputs.initial_distribution_trait11.value)
      ];
      let fitnesses_2b = [
        parseInt(config_inputs.fitness_trait00.value),
        parseInt(config_inputs.fitness_trait01.value),
        parseInt(config_inputs.fitness_trait10.value),
        parseInt(config_inputs.fitness_trait11.value)
      ];
      config.fitness = (trait) => fitnesses_2b[trait_to_index(trait)];
      break;
  }

  config.parents_count = parseInt(config_inputs.parentality.value);

  config.generations_count = parseInt(config_inputs.generations.value);

  config.allow_older_parents = config_inputs.allow_older_parents.checked

  config.measure_trait = index_to_trait(config_inputs.measure_trait.value, config.initial_distribution.length);

  config.precision = 100000;

  config.batch_size = parseInt(config_inputs.batch_size.value);
}

function update_config_inputs() {
  update_trait_mode();
}
update_config_inputs();


//
// gpe calculations
//

const gpe_result_keys = ["Xbar_ancestors", "Xbar_descendants", "DXbar", "cov_Ctil_X_ancestors", "ave_DX", "cov_Ctil_X_descendants"];

function add_gpe_single_result(gpe_single_result) {
  gpe_result_keys.forEach(key => {
    let generations = gpe_batch_results[key];
    for (var i = 0; i < config.generations_count - 1; i++)
    { generations[i].push(gpe_single_result[key][i]); }
    // gpe_batch_results[key][i] = gpe_single_result[key]
  });
}

function reset_gpe_batch_results() {
  gpe_batch_results = {};
  gpe_result_keys.forEach(key => {
    let generations = [];
    for (var i = 0; i < config.generations_count - 1; i++)
    { generations.push([]); }
    gpe_batch_results[key] = generations;
  })
}

function init_gpe_single_result() {
  let gpe_single_result = {};
  gpe_result_keys.forEach(key => gpe_single_result[key] = []);
  return gpe_single_result;
}

function add_gpe_generation_result(gpe_single_result, gpe_generation_result) {
  gpe_result_keys.forEach(key => gpe_single_result[key].push(gpe_generation_result[key]));
}

// returns dict[ result_key => [result for each generation] ]
function calculate_gpe_single_result(genealogy) {
  let gpe_single_result = init_gpe_single_result();

  for(var ancestor_level = 0;
      ancestor_level < config.generations_count - 1;
      ancestor_level++)
  {
    let gpe_analysis = new GPE_Analysis(
      genealogy,
      config.measure_trait,
      ancestor_level);
    add_gpe_generation_result(gpe_single_result, {
      "Xbar_ancestors": gpe_analysis.Xbar_ancestors(),
      "Xbar_descendants": gpe_analysis.Xbar_descendants(),
      "DXbar": gpe_analysis.DXbar_simple(),
      "cov_Ctil_X_ancestors": gpe_analysis.cov_Ctil_X_ancestors(),
      "ave_DX": gpe_analysis.ave_DX(),
      "cov_Ctil_X_ancestors": gpe_analysis.cov_Ctil_X_descendants()
    });
  }
  return gpe_single_result;
}


//
// graph
//


var progress_batch = {
  container: document.getElementById("progress_container_batch"),
  bar: document.getElementById("progress_bar_batch")
}

function simulate_batch() {
  load_config();
  reset_gpe_batch_results();

  let promise_batch = [];
  for (var i = 0; i < config.batch_size; i++) {
    promise_batch.push(new Promise(function(resolve, reject) {
      let genealogy = create_simple_genealogy(
        config.initial_distribution,
        config.fitness,
        config.parents_count,
        config.generations_count,
        allow_older_parents = config.allow_older_parents);
      let gpe_single_result = calculate_gpe_single_result(genealogy);
      add_gpe_single_result(gpe_single_result);
      resolve(null)
    }));
  }

  Promise.all(promise_batch).then((_) => {
    plot_gpe_batch_results(gpe_batch_results);

    set_hidden("button_simulate_batch", false);
    set_hidden("status_simulate_batch", true);
  });

  plot_gpe_batch_results(gpe_batch_results);

  for (var i = 0; i < config.batch_size; i++) {
    let genealogy = create_simple_genealogy(
      config.initial_distribution,
      config.fitness,
      config.parents_count,
      config.generations_count,
      allow_older_parents = config.allow_older_parents);
    let gpe_single_result = calculate_gpe_single_result(genealogy);
    add_gpe_single_result(gpe_single_result);
  }
  console.log("gpe_batch_results", gpe_batch_results);
  plot_gpe_batch_results(gpe_batch_results);

  set_hidden("button_simulate_batch", true);
  set_hidden("status_simulate_batch", false);
  alert("done generating batch");
}
