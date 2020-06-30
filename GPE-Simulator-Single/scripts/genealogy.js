// TODO: make these more modular

function represent_trait(trait) {
  let representation = { string: "" };

  function add_aspect(aspect, aspect_options) {
    let key = aspect_options[0];
    let value_0 = aspect_options[1];
    let value_1 = aspect_options[2];
    let value = aspect == "0" ? value_0 : value_1;
    representation[key] = value;
    representation.string += value + " ";
  }

  let all_aspect_options = [
    ["color", "red", "blue"],
    ["shape", "circle", "triangle"]
  ];
  for (var i = 0; i < 2; i++)
  { add_aspect(i < trait.length ? trait[i] : "0", all_aspect_options[i]); }
  representation.string = representation.string.trim();
  return representation;
}

function index_to_trait(i, n) {
  trait = [];
  while (i > 0) { trait.push(i % 2); i = Math.floor(i / 2); }
  while (trait.length < Math.log2(n)) { trait.push(0); }
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


// initial_distribution : list where ith entry is number of members in first generation that have trait i
// fitness : traits -> fitness score
// parents_count : number of parents each node has
// generations_count : number of generations_count
// progress : { container:element, bar:element }
function create_simple_genealogy(
  initial_distribution, fitness, parents_count, generations_count,
  allow_older_parents=false,
  progress=null)
{
  let graph = new Graph();
  let trait_count = initial_distribution.length;
  let ancestor_ids = [];

  //
  // progress
  // TODO: this doesn't work... probably because its during the execution of a function
  //

  progress.percent = 0;
  let progress_increment = 100/generations_count;

  function update_progress() {
    progress.bar.style.width = Math.round(progress.percent).toString() + "%";
  }
  update_progress();

  function increment_progress() {
    progress.percent = Math.min(100, progress.percent + progress_increment);
    update_progress();
  }

  //
  // initial generation
  //

  initial_distribution.forEach((member_count, index) => {
    let trait = index_to_trait(index, trait_count);
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
  increment_progress();

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
    r = max * Math.random();
    cumulative = 0;
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
    let index_count = 0;
    for (var key in weighted_data) {
      weighted_indices[index_count] = weighted_data[key];
      indices_to_data[index_count] = key;
      index_count++;
    }

    max = 1.0;
    selected_indices = [];
    for (var i = 0; i < n; i++) {
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
    let weighted_traits = new DefaultDictionary(() => 0);
    parent_ids.forEach((parent_id) => {
      let parent_trait = graph.get_node_metadata(parent_id).trait
      let parent_trait_index = trait_to_index(parent_trait);
      weighted_traits.modify(parent_trait_index, (x) => x + 1/parent_ids.length);
    });
    return index_to_trait(select_weighted(weighted_traits.items), trait_count);
  }

  function fill_genealogy() {

    function fill_generation(generation_index) {
      return new Promise((resolve, reject) => {

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
          // parents generates trait for child
          let child_trait = polysex(parent_ids);
          graph.get_node_metadata(child_id).trait = child_trait;
          graph.get_node_metadata(child_id).fill = represent_trait(child_trait).color;
          graph.get_node_metadata(child_id).shape = represent_trait(child_trait).shape;

          // link parents to child
          parent_ids.forEach((parent_id) => {
            let parent_color = represent_trait(graph.get_node_metadata(parent_id).trait).color;
            graph.add_edge(parent_id, child_id, { stroke: parent_color })
          });
        }

        if (allow_older_parents) {
          // choose from all ancestors
          ancestor_ids = ancestor_ids.concat(child_ids);
        } else {
          // choose only from immediately previous generation
          ancestor_ids = child_ids;
        }

        resolve(null);
      });
    }

    function iterate(i) {
      return new Promise(function(resolve, reject) {
        if (i < generations_count) {
          fill_generation(i)
            .then((_) => {
              increment_progress();
              resolve(iterate(i + 1));
            })
        } else {
          resolve(null);
        }
      });

      // if (i < generations_count) {
      //   fill_generation(i).then((_) => {
      //     increment_progress();
      //     iterate(i + 1);
      //   });
      // }
    }
    return iterate(1);
  }

  return new Promise((resolve, reject) => {
    fill_genealogy().then((_) => resolve(graph));
  });
}
