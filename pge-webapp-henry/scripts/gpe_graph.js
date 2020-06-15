const gpe_graph_layout = {
  width: 600,
  height: 400
}

// const gpe_graph_layout = {top: 10, right: 30, bottom: 30, left: 60};
// gpe_graph_layout.width = 460 - gpe_graph_layout.left - gpe_graph_layout.right;
// gpe_graph_layout.height = 400 - gpe_graph_layout.top - gpe_graph_layout.bottom;

const gpe_graph_colors = {
  covt_a: "red",
  ave_DX: "blue",
  Xbar_a: "green",
  DXbar: "orange",
};

function update_gpe_graph() {
  let xs = [];
  let ys = {
    covt_a: [],
    ave_DX: [],
    Xbar_a: [],
    DXbar: []
  };
  for (var gen_index = 0;
       gen_index < gpe_result_table.rows.length;
       gen_index++)
  {
      xs.push(gen_index);
      ys.covt_a.push(gpe_result_table.get_entry("covt_ancestors", gen_index));
      ys.ave_DX.push(gpe_result_table.get_entry("ave_DX", gen_index));
      ys.Xbar_a.push(gpe_result_table.get_entry("Xbar_ancestors", gen_index));
      ys.DXbar.push(gpe_result_table.get_entry("DXbar", gen_index));
  }

  let trace = {
    covt_a: {
      name: "covt_a",
      x: xs,
      y: ys.covt_a,
      type: "scatter"
    },
    ave_DX: {
      name: "ave(DX)",
      x: xs,
      y: ys.ave_DX,
      type: "scatter"
    },
    Xbar_a: {
      name: "Xbar_a",
      yaxis: "y2",
      x: xs,
      y: ys.Xbar_a,
      type: "scatter",
      fill: "tonexty",
      fillcolor: color_from_trait(gpe_analysis.trait),
      line: { color: color_from_trait(gpe_analysis.trait) }
    },
    DXbar: {
      name: "DXbar",
      x: xs,
      y: ys.DXbar,
      type: "scatter"
    }
  };

  function generate_plot1() {
    let data = [
      trace.covt_a,
      // trace.ave_DX,
      trace.DXbar
    ];

    let layout = {
      title: "PGE Results (Proportion Changes)",
      width: gpe_graph_layout.width,
      height: gpe_graph_layout.height,
      yaxis: {
        title: "proportion change",
        range: [-1, 1]
      },
      showlegend: true
    };

    Plotly.newPlot("gpe_graph_1", data, layout);
  }

  function generate_plot2() {
    let data = [
      trace.Xbar_a
    ];

    let layout = {
      title: "PGE Results (Proportion)",
      width: gpe_graph_layout.width,
      height: gpe_graph_layout.height,
      yaxis: {
        title: "proportion",
        range: [0, 1]
      },
      showlegend: true
    };

    Plotly.newPlot("gpe_graph_2", data, layout);
  }

  generate_plot1();
  generate_plot2();
}
