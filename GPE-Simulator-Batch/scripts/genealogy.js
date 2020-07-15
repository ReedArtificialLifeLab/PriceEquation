// TODO: make these more modular

const trait_count = 2;

function represent_trait(trait) {
  let representation = { aspect_string: [] };

  function add_aspect(aspect, aspect_options) {
    let key = aspect_options[0];
    let value_0 = aspect_options[1];
    let value_1 = aspect_options[2];
    let value = aspect == "0" ? value_0 : value_1;
    representation[key] = value;
    representation.aspect_string.push(value);
  }

  let all_aspect_options = [
    ["color", "red", "blue"],
    ["shape", "circle", "triangle"]
  ];
  for (var i = 0; i < 2; i++)
  { add_aspect(i < trait.length ? trait[i] : "0", all_aspect_options[i]); }
  representation.string = representation.aspect_string.join(" ");
  return representation;
}

function index_to_trait(i) {
  trait = [];
  while (i > 0) { trait.push(i % 2); i = Math.floor(i / 2); }
  while (trait.length < trait_count) { trait.push(0); }
  return trait.reverse();
}

function trait_to_index(trait) {
  let index = 0;
  let n = trait.length - 1;
  trait.forEach((x, i) => { index += x * Math.pow(2, n - i); });
  return index;
}

function trait_equal(trait1, trait2) {
  return trait_to_index(trait1) == trait_to_index(trait2);
}

function traitset_to_string(traitset) {
  switch (traitset.length) {
    case 1:
      let trait = traitset[0];
      return represent_trait(trait).string;
    case 2:
      let i = traitset[0][0] == traitset[1][0] ? 0 : 1;
      return represent_trait(traitset[0]).aspect_string[i];
  }
}

function encode_traitset(traitset) { return JSON.stringify(traitset); }
function decode_traitset(string) { return JSON.parse(string); }


// initial_distribution : list where ith entry is number of members in first generation that have trait i
// fitness : traits -> fitness score
// parents_count : number of parents each node has
// generations_count : number of generations_count
function create_simple_genealogy(config) {
  let trait_mode = config.trait_mode;
  let initial_distribution = config.initial_distribution;
  let fitness = config.fitness;
  let mutation = config.mutation;
  let parents_count = config.parents_count;
  let generations_count = config.generations_count;
  let allow_older_parents = config.allow_older_parents;


  let graph = new Graph();
  let ancestor_ids = [];

  //
  // initial generation
  //

  initial_distribution.forEach((member_count, index) => {
    let trait = index_to_trait(index);
    for (var i = 0; i < member_count; i++) {
      let node_id = graph.add_node({
        trait: trait,
        fill: represent_trait(trait).color,
        shape: represent_trait(trait).shape
      });
      graph.set_level(node_id, 0);
      ancestor_ids.push(node_id);
    }
  });

  // console.log("# new genealogy");
  // console.log(graph.get_level_node_ids(0).map(id => represent_trait(graph.get_node_metadata(id).trait).string));

  //
  // evolution functions
  //

  let population = ancestor_ids.length;

  function calculate_parent_weighted_ids(parent_ids) {
    let weighted_ids = {};
    let fitness_total = 0;
    parent_ids.forEach((node_id) => {
      let trait = graph.get_node_metadata(node_id).trait;
      let trait_fitness = fitness(trait);
      weighted_ids[node_id] = trait_fitness;
      fitness_total += trait_fitness;
    });
    // normalize
    for (var node_id in weighted_ids) {
      weighted_ids[node_id] = weighted_ids[node_id]/fitness_total;
    }
    return weighted_ids;
  }

  function select_weighted(weighted_data, max=1.0) {
    let r = max * Math.random();
    let cumulative = 0;
    for (var key in weighted_data) {
      let weight = weighted_data[key];
      cumulative += weight;
      if (r <= cumulative) {
        return key;
      }
    }
  }

  function selected_multiple_weighted(weighted_data, n, replacement=true) {
    let weighted_indices = {};
    let indices_to_data = {};
    let i = 0;
    for (var key in weighted_data) {
      weighted_indices[i] = weighted_data[key];
      indices_to_data[i] = key;
      i++;
    }

    let max = 1.0;
    let selected_indices = [];
    for (i = 0; i < n; i++) {
      let index = select_weighted(weighted_indices, max=max);
      selected_indices.push(index);
      if (!replacement) {
        max -= weighted_indices[index];
        delete weighted_indices[index];
      }
    }

    return selected_indices.map((index) => indices_to_data[index]);
  }

  function polysex(parent_ids) {
    let child_trait = [];
    for (var i = 0; i < trait_count; i++) {
      let weights = [0, 0];
      parent_ids.forEach(parent_id => {
        let parent_trait = graph.get_node_metadata(parent_id).trait[i];
        weights[parent_trait]++;
      });
      let weights_total = weights[0] + weights[1];
      weights = weights.map(w => w/weights_total);
      // false => 0 | true => 1
      let aspect = Math.random() < weights[1];
      // mutation,
      // which only operates on appropriate trait for trait_mode
      switch (trait_mode) {
        case "1b":
          if (i <= 0 && Math.random() < mutation) { aspect = !aspect; }
          break;
        case "2b":
          if (i <= 1 && Math.random() < mutation) { aspect = !aspect; }
          break;
      }
      aspect = aspect ? 1 : 0;
      child_trait.push(aspect);
    }
    return child_trait;
  }

  function fill_genealogy() {

    function fill_generation(generation_index) {
      let ancestor_weighted_ids = calculate_parent_weighted_ids(ancestor_ids);
      let child_ids = [];
      for (var member_index = 0; member_index < population; member_index++) {
        // create new node at new generation's level
        let child_id = graph.add_node();
        child_ids.push(child_id)
        graph.set_level(child_id, generation_index);

        // select parents for child
        let parent_ids =
          selected_multiple_weighted(
            ancestor_weighted_ids,
            parents_count,
            replacement=false)
          .map((parent_id) => parseInt(parent_id));
        // parents generates trait for child,
        // each component chosen from a random parent
        let child_trait = polysex(parent_ids);
        let child_metadata = graph.get_node_metadata(child_id);
        child_metadata.trait = child_trait;
        child_metadata.fill =  represent_trait(child_trait).color;
        child_metadata.shape = represent_trait(child_trait).shape;

        // link parents to child
        parent_ids.forEach((parent_id) => {
          let parent_color = represent_trait(graph.get_node_metadata(parent_id).trait).color;
          graph.add_edge(parent_id, child_id, { stroke: parent_color })
        });
      }

      // console.log(child_ids.map(id => represent_trait(graph.get_node_metadata(id).trait).string));

      // choose from all ancestors
      if (allow_older_parents)
      { ancestor_ids = ancestor_ids.concat(child_ids); }
      // choose only from immediately previous generation
      else
      { ancestor_ids = child_ids; }
    }

    for (var i = 1; i < generations_count; i++) { fill_generation(i) }
  }

  fill_genealogy();
  return graph;
}
