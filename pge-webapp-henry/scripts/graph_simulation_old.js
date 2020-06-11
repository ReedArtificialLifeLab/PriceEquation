const width = 400;
const height = 400;

var nodes = [
  {value: "a", level: 0},
  {value: "a1", level: 0},
  {value: "a2", level: 0},
  {value: "a3", level: 0},
  {value: "a4", level: 0},
  {value: "a5", level: 0},
  {value: "a6", level: 0},
  {value: "a7", level: 0},
  {value: "a8", level: 0},
  {value: "b", level: 1},
  {value: "c", level: 2}
];

var edges = [
  {source: 0, target: 9},
  {source: 0, target: 10}
];

var level_ys = {
  0: height*1/4,
  1: height*2/4,
  2: height*3/4
}

var size = nodes.length;

var svg = d3.select("#graph-container").append("svg")
      .attr("width", width).attr("height", height)

var simulation = d3.forceSimulation(nodes);

// forces

simulation.force("y", d3.forceY().y((d) => level_ys[d.level]).strength(1));
simulation.force("x", d3.forceX().x((d) => width/2));

simulation.force("charge", d3.forceManyBody().strength(-50));

simulation.force("link", d3.forceLink().links(edges).strength(0))

// tick

function tick_nodes() {
  let u = svg.selectAll("line").data(edges);
  u.enter()
    .append("line")
    .merge(u)
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y);
  u.exit().remove();
}

function tick_edges() {
  let u = svg.selectAll("circle").data(nodes);
  u.enter()
    .append("circle")
    .merge(u)
    .attr("r", 5)
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y);
  u.exit().remove();
}

simulation.on("tick", (tick) => {
  tick_nodes();
  tick_edges();
});
