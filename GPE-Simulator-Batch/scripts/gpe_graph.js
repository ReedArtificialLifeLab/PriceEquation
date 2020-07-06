const gpe_graph_layout = {
  width: 500,
  height: 300
}

// const gpe_graph_layout = {top: 10, right: 30, bottom: 30, left: 60};
// gpe_graph_layout.width = 460 - gpe_graph_layout.left - gpe_graph_layout.right;
// gpe_graph_layout.height = 400 - gpe_graph_layout.top - gpe_graph_layout.bottom;

const gpe_graph_colors = {
  cov_Ctil_X_ancestors: "red",
  ave_DX: "blue",
  Xbar_ancestors: "green",
  DXbar: "orange",
};

function plot_gpe_batch_results(gpe_batch_results) {
  let result_keys = [
    "cov_Ctil_X_ancestors",
    "ave_DX",
    "cov_Ctil_X_descendants",
    "Xbar_ancestors",
    "DXbar"
  ];

  // TODO: plot with error bars and whatnot
}

function update_gpe_graph() {
  let result_keys = [
    "cov_Ctil_X_ancestors",
    "ave_DX",
    "cov_Ctil_X_descendants",
    "Xbar_ancestors",
    "DXbar"
  ];

  let xs = {};
  let ys = {};
  result_keys.forEach((result_key) => {
    xs[result_key] = [];
    ys[result_key] = [];
  });

  function add_result(result_key, gen_index) {
    xs[result_key].push(gen_index);
    ys[result_key].push(gpe_result);

    ys[result_key].push(gpe_result_table.get_entry(result_key, gen_index));
  }

  for (var gen_index = 0;
       gen_index < gpe_result_table.rows.length;
       gen_index++)
  {
    result_keys.forEach((result_key) => {
      add_result(result_key, gen_index);
    });
  }
  // include final generation in DXbar plot
  xs.Xbar_ancestors.push(gpe_result_table.rows.length);
  ys.Xbar_ancestors.push(gpe_result_table.get_entry(
    "Xbar_descendants",
    gpe_result_table.rows.length - 1));

  let traces = {
    cov_Ctil_X_ancestors: {
      name: "cov(Ctil_a, X_a)",
      x: xs.cov_Ctil_X_ancestors,
      y: ys.cov_Ctil_X_ancestors,
      type: "scatter"
    },
    ave_DX: {
      name: "ave(DX)",
      x: xs.ave_DX,
      y: ys.ave_DX,
      type: "scatter"
    },
    cov_Ctil_X_descendants: {
      name: "cov(Ctil_d, X_d)",
      x: xs.cov_Ctil_X_descendants,
      y: ys.cov_Ctil_X_descendants,
      type: "scatter"
    },
    Xbar_ancestors: {
      name: "Xbar",
      x: xs.Xbar_ancestors,
      y: ys.Xbar_ancestors,
      type: "scatter",
      fill: "tonexty",
      fillcolor: represent_trait(genealogy_config.measure_trait).color,
      line: { color: represent_trait(genealogy_config.measure_trait).color }
    },
    DXbar: {
      name: "DXbar",
      x: xs.DXbar,
      y: ys.DXbar,
      type: "scatter"
    }
  };

  function generate_plot_general_fixed() {
    let data = [
      traces.cov_Ctil_X_ancestors,
      traces.ave_DX,
      traces.cov_Ctil_X_descendants,
      traces.DXbar
    ];

    let layout = {
      title: "PGE Results (Fixed)",
      width: gpe_graph_layout.width,
      height: gpe_graph_layout.height,
      xaxis: {
        title: "ancestor generation",
        autotick: false,
        tick0: 0,
        dtick: 1
      },
      yaxis: {
        range: [-1, 1]
      },
      showlegend: true
    };

    Plotly.newPlot("gpe_graph_general_fixed", data, layout);
  }

  function generate_plot_general_fitted() {
    let data = [
      traces.cov_Ctil_X_ancestors,
      traces.ave_DX,
      traces.cov_Ctil_X_descendants,
      traces.DXbar
    ];

    let layout = {
      title: "PGE Results (Fitted)",
      width: gpe_graph_layout.width,
      height: gpe_graph_layout.height,
      xaxis: {
        title: "ancestor generation",
        autotick: false,
        tick0: 0,
        dtick: 1
      },
      showlegend: true
    };

    Plotly.newPlot("gpe_graph_general_fitted", data, layout);
  }

  function generate_plot_Xbar() {
    let data = [
      traces.Xbar_ancestors
    ];

    let layout = {
      title: "Trait Proportion",
      width: gpe_graph_layout.width,
      height: gpe_graph_layout.height,
      xaxis: {
        title: "generation",
        autotick: false,
        tick0: 0,
        dtick: 1
      },
      yaxis: {
        range: [0, 1]
      },
      showlegend: true
    };

    Plotly.newPlot("gpe_graph_trait_proportion", data, layout);
  }

  generate_plot_general_fixed();
  generate_plot_general_fitted();
  generate_plot_Xbar();
}
