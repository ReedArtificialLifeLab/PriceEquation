var gpe_graph_svg = null;

const gpe_graph_layout = {top: 10, right: 30, bottom: 30, left: 60};
gpe_graph_layout.width = 460 - gpe_graph_layout.left - gpe_graph_layout.right;
gpe_graph_layout.height = 400 - gpe_graph_layout.top - gpe_graph_layout.bottom;

function update_gpe_graph() {
  // let trace_Xbar_a = {
  //   x: [],
  //   y: [],
  //   type: "scatter"
  // }

  console.log(gpe_result_table.rows)

  let xs = [];
  let Xbar_ys = [];
  let DXbar_ys = [];
  for (var generation_index = 0;
       generation_index < gpe_result_table.rows.length;
       generation_index++)
  {
      xs.push(generation_index);
      Xbar_ys.push(gpe_result_table.get_entry("Xbar_ancestors", generation_index));
      DXbar_ys.push(gpe_result_table.get_entry("DXbar", generation_index));
  }
  let trace_Xbar = {
    name: "Xbar_a",
    x: xs,
    y: Xbar_ys,
    type: "scatter",
    marker: {
      color: color_from_trait(gpe_config.trait)
    }
  };

  let trace_DXbar = {
    name: "DXbar",
    x: xs,
    y: DXbar_ys,
    type: "scatter",
    marker: {
      color: color_from_trait(gpe_config.trait)
    }
  }

  // let data = [trace_Xbar];
  let data = [trace_DXbar];

  let layout = {
    title: "GPE Results",
    showlegend: true,
    xaxis: {
      title: "ancestor generation",
      dtick: 1
    },
    yaxis: {
      title: "result value",
      // range: [0, 1]
      range: [-1, 1]
    }
  }

  Plotly.newPlot("gpe-graph-container", data, layout, {displayModeBar: false});
}
