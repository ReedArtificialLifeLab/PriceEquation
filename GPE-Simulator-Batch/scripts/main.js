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
  initial_distribution_trait0: 10,
  initial_distribution_trait1: 10,
  initial_distribution_trait00: 5,
  initial_distribution_trait01: 5,
  initial_distribution_trait10: 5,
  initial_distribution_trait11: 5,
  //
  fitness_trait0: 1,
  fitness_trait1: 1,
  fitness_trait00: 1,
  fitness_trait01: 1,
  fitness_trait10: 1,
  fitness_trait11: 1,
  //
  gerophilia: -1,
  mutation: 0.0,
  parentality: 2,
  generations: 10,
  allow_older_parents: false,
  //
  measure_traitset: null,
  //
  batch_size: 1
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

  // update measure_traitset options
  // clear old options
  let measure_traitset = config_inputs.measure_traitset;
  while (measure_traitset.children.length > 0)
  { measure_traitset.removeChild(measure_traitset.children[0]); }
  let traitsets = null;
  // choose
  switch (config.trait_mode) {
    case "1b":
      traitsets = [[[0, 0], [0, 1]], [[1, 0], [1, 1]]];
      break;
    case "2b":
      traitsets = [
        [[0, 0], [0, 1]], [[0, 0], [1, 0]], [[1, 1], [1, 0]], [[1, 1], [0, 1]],
        [[0, 0]], [[0, 1]], [[1, 0]], [[1, 1]]
      ];
      break;
    default:
      traitsets = [[[0, 0], [0, 1]], [[1, 0], [1, 1]]];
      break;
  }
  traitsets.forEach(traitset => {
    let option = document.createElement("option");
    option.value = encode_traitset(traitset);
    option.innerText = traitset_to_string(traitset);
    measure_traitset.appendChild(option);
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

  config.mutation = parseFloat(config_inputs.mutation.value);

  // TODO: config.gerophilia = ...

  config.parents_count = parseInt(config_inputs.parentality.value);

  config.generations_count = parseInt(config_inputs.generations.value);

  config.allow_older_parents = config_inputs.allow_older_parents.checked

  config.measure_traitset = decode_traitset(config_inputs.measure_traitset.value);

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
      config.measure_traitset,
      ancestor_level);
    add_gpe_generation_result(gpe_single_result, {
      "Xbar_ancestors": gpe_analysis.Xbar_ancestors(),
      "Xbar_descendants": gpe_analysis.Xbar_descendants(),
      "DXbar": gpe_analysis.DXbar_simple(),
      "cov_Ctil_X_ancestors": gpe_analysis.cov_Ctil_X_ancestors(),
      "ave_DX": gpe_analysis.ave_DX(),
      "cov_Ctil_X_descendants": gpe_analysis.cov_Ctil_X_descendants()
    });
  }
  return gpe_single_result;
}

//
// export
//

function gpe_export() {
  let d = new Date();
  let t = d.getTime();

  let name = "gpe_batch_results_"+t.toString();
  let filename = name+".json";

  let content = JSON.stringify({
    config: config,
    gpe_results: {
      keys: gpe_result_keys,
      values: gpe_result_values,
      errors: gpe_result_errors
    }
  });

  a_gpe_export.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(content));
  a_gpe_export.setAttribute("download", filename);
}


//
// run
//


function simulate_batch() {
  load_config();
  reset_gpe_batch_results();

  // simulations

  let promise_batch = [];
  for (var i = 0; i < config.batch_size; i++) {
    promise_batch.push(new Promise(function(resolve, reject) {
      let genealogy = create_simple_genealogy(config);
      let gpe_single_result = calculate_gpe_single_result(genealogy);
      add_gpe_single_result(gpe_single_result);
      resolve(null)
    }));
  }

  // graphs

  Promise.all(promise_batch).then((_) => {
    plot_gpe_batch_results(gpe_batch_results);
    gpe_export();
    // alert("done generating batch");
  });
}

document.addEventListener("keypress", (e) => {
  if (e.key === " ") {
    e.preventDefault();
    simulate_batch();
  }
});
