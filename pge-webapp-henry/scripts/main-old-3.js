var height = 600
var width = 600

var n = 1

var color = d3.scaleSequential(d3.interpolateTurbo).domain([0, n])

var replay = null

var nodes = (
      replay,
      Array.from({ length: n }, (_, i) => ({
        r: 2 * (4 + 9 * Math.random()**2),
        color: color(i)
      }))
    )

// the default phyllotaxis arrangement is centered on <0,0> with a distance between nodes of ~10 pixels
// we will scale & translate it to fit the canvas
const scale = 1.7,
  center = [width / 2, height / 2],
  rescale = isNaN(nodes[0].x);

// const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);
const svg = d3.select("body").append("svg").attr("viewBox", [0, 0, width, height]);


const node = svg
  .append("g")
  .selectAll("circle")
  .data(nodes)
  .join("circle")
  .attr("r", 4)
  .attr("fill", d => d.color);

function tick() {
  node.attr("cx", d => d.x).attr("cy", d => d.y);
}

const simulation = d3
  .forceSimulation(nodes)
  .on("tick", tick)
  .force("collide", d3.forceCollide().radius(d => 1 + d.r))
  .force("x", d3.forceX(center[0]).strength(0.001))
  .force("y", d3.forceY(center[1]).strength(0.001))
  .stop();

// differ application of the forces
setTimeout(() => {
  simulation.restart();
  node.transition().attr("r", d => d.r);
}, 2000);

// once the arrangement is initialized, scale and translate it
if (rescale) {
  for (const node of nodes) {
    node.x = node.x * scale + center[0];
    node.y = node.y * scale + center[1];
  }
}

// show the initial arrangement
tick();
