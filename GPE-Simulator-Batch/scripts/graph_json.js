// json

var input_graph_json = document.getElementById("input-graph-json");

var graph = null;

function load_input_json() {
  let file = input_graph_json.files[0];
  let reader = new FileReader();
  reader.readAsText(file, "UTF-8");
  reader.onload = (e) => {
    let graph_text = e.target.result;
    let graph_json = JSON.parse(graph_text);
    graph = graph_from_json(graph_json);
    simulate_graph(graph, 400, 400, "#graph-container");
  }
  reader.onerror = (e) => {
    console.log("error reading file");
    console.log(e);
  }
}
