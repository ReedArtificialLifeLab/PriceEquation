class Registry {
  constructor() {
    this.current_id = -1;
    this.items = {};
  }

  add(item) {
    this.current_id++;
    this.items[this.current_id] = item;
    return this.current_id;
  }

  get(id) {
    return this.items[id];
  }

  toArray() {
    let array = [];
    for (var id in this.items) {
      array.push(this.items[id]);
    }
    return array;
  }
}


class DefaultDictionary {
  constructor (gen_default) {
    this.gen_default = gen_default;
    this.items = {};
    this.size = 0;
  }

  set(key, value) {
    if (!this.items.hasOwnProperty(key)) { this.size++; }
    this.items[key] = value;
  }

  get(key) {
    if (!this.items.hasOwnProperty(key)) {
      this.items[key] = this.gen_default();
      return this.gen_default();
    } else {
      return this.items[key];
    }
  }

  modify(key, f) {
    if (!this.items.hasOwnProperty(key)) {
      this.items[key] = f(this.gen_default());
    } else {
      this.items[key] = f(this.items[key]);
    }
  }

  delete(key) {
    if (this.items.hasOwnProperty(key)) {
      delete this.items[key];
      this.size--;
    }
  }

  append_at(key, subitem) {
    this.modify(key, (list) => list.concat([subitem]));
  }

  toArray() {
    let list = [];
    for (var key in this.items) {
      list.push(this.items[key]);
    }
    return list;
  }
}


class Graph {
  constructor() {
    this.nodes = new Registry();

    this.edges = new Registry();
    this.edges_from = new DefaultDictionary(() => []);
    this.edges_to = new DefaultDictionary(() => []);
    this.edges_from_to = new DefaultDictionary(() => []);

    this.levels = new DefaultDictionary(() => []);
  }

  get_width() {
    let max_width = 0;
    this.levels.toArray().forEach((level) => {
      max_width = Math.max(max_width, level.length);
    });
    return max_width;
  }

  get_height() {
    return this.levels.toArray().length;
  }

  add_node(metadata=false) {
    let node_data = { metadata: {} };
    if (metadata !== false) { node_data.metadata = metadata };
    let node_id = this.nodes.add(node_data);
    node_data.id = node_id;
    return node_id;
  }

  get_node(node_id) {
    return this.nodes.get(node_id);
  }

  get_node_metadata(node_id) {
    return this.get_node(node_id).metadata;
  }

  set_node_metadata(node_id, metadata) {
    this.get_node(node_id).metadata = metadata;
  }

  update_node_metadata(node_id, metadata_new) {
    let metadata = this.get_node_metadata(node_id);
    for (var key in metadata_new)
    { metadata[key] = metadata_new[key]; }
  }

  get_node_array() {
    return this.nodes.toArray();
  }

  get_children_ids(parent_id) {
    return this.get_edges_from(parent_id).map((edge) => edge.target);
  }

  get_parents_ids(child_id) {
    return this.get_edges_to(child_id).map((edge) => edge.source);
  }

  add_edge(source_id, target_id, metadata) {
    let edge_data = {
      source: source_id,
      target: target_id,
      metadata: metadata
    };
    let edge_id = this.edges.add(edge_data);
    edge_data.id = edge_id;
    this.edges_from.append_at(source_id, edge_id);
    this.edges_to.append_at(target_id, edge_id);
    this.edges_from_to.append_at(source_id.toString()+":"+target_id.toString(), edge_id)
    return edge_id;
  }

  get_edge(edge_id) {
    return this.edges.get(edge_id);
  }

  get_edge_metadata(edge_id) {
    return this.get_edge(edge_id).metadata;
  }

  set_edge_metadata(edge_id, metadata) {
    this.get_edge(edge_id).metadata = metadata;
  }

  update_edge_metadata(edge_id, metadata_new) {
    let metadata = this.get_edge_metadata(edge_id);
    for (var key in metadata_new)
    { metadata[key] = metadata_new[key]; }
  }

  get_edges_from(source_id) {
    return this.edges_from.get(source_id)
      .map((edge_id) => this.get_edge(edge_id));
  }

  get_edges_to(target_id) {
    return this.edges_to.get(target_id)
      .map((edge_id) => this.get_edge(edge_id));
  }

  get_edges_from_to(source_id, target_id) {
    return this.edges_from_to
      .get(source_id.toString()+":"+target_id.toString())
      .map((edge_id) => this.get_edge(edge_id));
  }

  get_edge_array() {
    return this.edges.toArray();
  }

  exists_edge(parent_id, child_id) {
    if (this.get_edges_from_to(parent_id, child_id).length > 0)
    { return 1; }
    else
    { return 0; }
  }

  set_level(node_id, level) {
    let level_length = this.levels.get(level).length;
    this.levels.append_at(level, node_id);
    let metadata = this.get_node_metadata(node_id);
    metadata.level = level;
    metadata.row = level_length;
  }

  get_level(node_id) {
    return this.get_node_metadata(node_id).level;
  }

  get_level_array() {
    return this.levels.toArray();
  }

  get_level_node_ids(level) {
    return this.levels.get(level);
  }


}


function graph_from_json(json) {
  let graph = new Graph();

  // nodes
  let node_ids_new = {}; // : node_id_old => node_id_new
  json.nodes.forEach((node_data) => {
    let node_id_old = node_data[0];
    let node_metadata = node_data[1];

    let node_id_new = graph.add_node(node_metadata);
    node_ids_new[node_id_old] = node_id_new;
  });

  // edges
  json.edges.forEach((edge_data) => {
    let edge_source_id_old = edge_data[0];
    let edge_target_id_old = edge_data[1];
    let edge_metadata = edge_data[2];

    let edge_source_id_new = node_ids_new[edge_source_id_old];
    let edge_target_id_new = node_ids_new[edge_target_id_old];
    graph.add_edge(edge_source_id_new, edge_target_id_new, edge_metadata);
  });

  // levels
  json.levels.forEach((level_nodes, level) => {
    level_nodes.forEach((node_id_old) => {
      let node_id_new = node_ids_new[node_id_old];
      graph.set_level(node_id_new, level);
    });
  });

  return graph;
}

const triangle_size = 6;
function triangle_points(d) {
  let s = triangle_size;
  let p1 = (d.x - s)+","+(d.y + s);
  let p2 = (d.x + 0)+","+(d.y - s);
  let p3 = (d.x + s)+","+(d.y + s);
  return p1+" "+p2+" "+p3;
}

var svg = null;

function simulate_graph(
    graph,
    container_selector,
    width, height,
    link_strength=1,
    show_graph=true)
{
  let nodes = graph.get_node_array()
                .map((node) => JSON.parse(JSON.stringify(node)));
  let edges = graph.get_edge_array()
                .map((edge) => JSON.parse(JSON.stringify(edge)));

  let level_ys = {};
  let i_max = graph.get_height();
  for (var i = 0; i < i_max; i++) {
    level_ys[i] = height*(i + 1) / (i_max + 1);
  }

  let row_xs = {};
  i_max = graph.get_width();
  for (var i = 0; i < i_max; i++) {
    row_xs[i] = width*(i + 1) / (i_max + 1);
  }

  if (svg !== null)  {
    svg.remove();
  }

  if (!show_graph) {
    return;
  }

  svg = d3.select(container_selector).append("svg")
        .attr("width", width)
        .attr("height", height)

  nodes.forEach((node) => {
    node.fx = row_xs[node.metadata.row];
    node.fy = level_ys[node.metadata.level];
  });

  let simulation = d3.forceSimulation(nodes);

  // forces

  // simulation.force("y", d3.forceY().y(
  //   (d) => level_ys[d.metadata.level]).strength(10));
  // simulation.force("x", d3.forceX().x(
  //   (d) => width/2).strength(0.25));
  // simulation.force("charge", d3.forceManyBody().strength(-100));
  simulation.force("link", d3.forceLink().links(edges).strength(link_strength));

  /* OLD
  // vertial
  simulation.force("y", d3.forceY().y(
    (d) => level_ys[d.metadata.level]).strength(10));
  simulation.force("x", d3.forceX().x(
    (d) => width/2).strength(0.25));
  // radial
  // simulation.force("center", d3.forceCenter(width/2, height/2));
  // simulation.force("r", d3.forceRadial((d) => 0.8*level_ys[d.metadata.level]).strength(2))
  // bodies
  simulation.force("charge", d3.forceManyBody().strength(-100));
  simulation.force("link", d3.forceLink().links(edges).strength(link_strength))
  */

  // tick

  function tick_edges() {
    let u = svg.selectAll(".edge").data(edges);
    u.enter()
      .append("line")
      .merge(u)
      .attr("class", ".edge")
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y)
      .attr("stroke", (d) => d.metadata.stroke);
    u.exit().remove();
  }

  function tick_nodes() {
    let u = svg.selectAll("circle").data(nodes);
    u.enter().filter((d) => d.metadata.shape == "circle")
      .append("circle")
      .merge(u)
      .attr("r", 5)
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("fill", (d) => d.metadata.fill);
    u.enter().filter((d) => d.metadata.shape == "triangle")
      .append("polygon")
      .merge(u)
      .attr("points", triangle_points)
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("fill", (d) => d.metadata.fill);
    u.exit().remove();
  }

  simulation.on("tick", (tick) => {
    tick_edges();
    tick_nodes();
  });

  while (simulation.alpha() > simulation.alphaMin()) { simulation.tick(); }
  // simulation.stop();

}
