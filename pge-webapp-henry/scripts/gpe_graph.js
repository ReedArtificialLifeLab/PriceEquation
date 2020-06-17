const gpe_graph_layout = {
  width: 600,
  height: 400
}

// const gpe_graph_layout = {top: 10, right: 30, bottom: 30, left: 60};
// gpe_graph_layout.width = 460 - gpe_graph_layout.left - gpe_graph_layout.right;
// gpe_graph_layout.height = 400 - gpe_graph_layout.top - gpe_graph_layout.bottom;

const gpe_graph_colors = {
  cov_Ctil_X_a: "red",
  ave_DX: "blue",
  Xbar_a: "green",
  DXbar: "orange",
};

function update_gpe_graph() {
  let xs = [];
  let ys = {
    cov_Ctil_X_a: [],
    ave_DX: [],
    cov_Ctil_X_d: [],
    Xbar_a: [],
    DXbar: []
  };
  for (var gen_index = 0;
       gen_index < gpe_result_table.rows.length;
       gen_index++)
  {
      xs.push(gen_index);
      ys.cov_Ctil_X_a.push(gpe_result_table.get_entry("cov_Ctil_X_ancestors", gen_index));
      ys.ave_DX.push(gpe_result_table.get_entry("ave_DX", gen_index));
      ys.cov_Ctil_X_d.push(gpe_result_table.get_entry("cov_Ctil_X_descendants", gen_index));
      ys.Xbar_a.push(gpe_result_table.get_entry("Xbar_ancestors", gen_index));
      ys.DXbar.push(gpe_result_table.get_entry("DXbar", gen_index));
  }

  let trace = {
    cov_Ctil_X_a: {
      name: "cov(Ctil_a, X_a)",
      x: xs,
      y: ys.cov_Ctil_X_a,
      type: "scatter"
    },
    ave_DX: {
      name: "ave(DX)",
      x: xs,
      y: ys.ave_DX,
      type: "scatter"
    },
    cov_Ctil_X_d: {
      name: "cov(Ctil_d, X_d)",
      x: xs,
      y: ys.cov_Ctil_X_d,
      type: "scatter"
    },
    Xbar_a: {
      name: "Xbar_a",
      x: xs,
      y: ys.Xbar_a,
      type: "scatter",
      fill: "tonexty",
      fillcolor: color_from_trait(gpe_config.trait),
      line: { color: color_from_trait(gpe_config.trait) }
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
      trace.cov_Ctil_X_a,
      trace.ave_DX,
      trace.cov_Ctil_X_d,
      trace.DXbar
    ];

    let layout = {
      title: "PGE Results (Proportion Changes)",
      width: gpe_graph_layout.width,
      height: gpe_graph_layout.height,
      yaxis: {
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

    let layout2 = {
      title: "PGE Results (Proportion)",
      width: gpe_graph_layout.width,
      height: gpe_graph_layout.height,
      yaxis: {
        range: [0, 1]
      },
      showlegend: true
    };

    Plotly.newPlot("gpe_graph_2", data, layout2);
  }

  generate_plot1();
  generate_plot2();
}
