const gpe_graph_layout = {
  width: 400,
  height: 400
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

function mean(xs) {
  let xs_total = xs.reduce((total, x) => total + x);
  return xs_total / xs.length;
}

function std(xs, xs_mean) {
  xs_mean = xs_mean === undefined ? mean(xs) : xs_mean;
  let numerator = xs.reduce((total, x) => Math.pow(x - xs_mean, 2));
  let denomenator = xs.length - 1;
  return Math.sqrt(numerator/denomenator);
}

function plot_gpe_batch_results(gpe_batch_results) {
  let gpe_result_keys = [
    "Xbar_ancestors",
    "Xbar_descendants",
    "DXbar",
    "cov_Ctil_X_ancestors",
    "ave_DX"
    // "cov_Ctil_X_descendants"
  ];

  let y_ranges = {
    "Xbar_ancestors": [0, 1],
    "Xbar_descendants": [0, 1],
    "DXbar": [-1, 1],
    "cov_Ctil_X_ancestors": [-1, 1],
    "ave_DX": [-1, 1],
    "cov_Ctil_X_descendants": [-1, 1]
  }

  // for reference:
  // gpe_batch_results[result_key][gen_i][batch_i]

  function plot_gpe_batch_result(result_key) {
    let xs = [];
    let ys = [];
    let ys_error = [];

    for (var gen_i = 0; gen_i < config.generations_count - 1; gen_i++) {
      let y_distibution = gpe_batch_results[result_key][gen_i];
      let y_mean = mean(y_distibution);
      let y_std = std(y_distibution, y_mean);

      xs.push(gen_i);
      ys.push(y_mean);
      ys_error.push(y_std);
    }

    let data = [
      {
        x: xs,
        y: ys,
        type: "scatter",
        error_y: {
          type: "data",
          array: ys_error,
          visible: true
        }
      }
    ];

    let layout = {
      title: result_key,
      width: gpe_graph_layout.width,
      height: gpe_graph_layout.height,
      xaxis: {
        title: "ancestor generation",
        autotick: false,
        tick0: 0,
        dtick: 1
      },
      yaxis: {
        range: y_ranges[result_key],
        showgrid: true,
        zeroline: true,
        showline: true,
        gridcolor: '#bdbdbd',
        gridwidth: 2,
        zerolinecolor: '#969696',
        zerolinewidth: 4
      },
      showlegend: false
    };

    let layout_fitted = {
      title: result_key + " (Fitted)",
      width: gpe_graph_layout.width,
      height: gpe_graph_layout.height,
      xaxis: {
        title: "ancestor generation",
        autotick: false,
        tick0: 0,
        dtick: 1
      },
      yaxis: {
        showgrid: true,
        zeroline: true,
        showline: true,
        gridcolor: '#bdbdbd',
        gridwidth: 2,
        zerolinecolor: '#969696',
        zerolinewidth: 4
      },
      showlegend: false
    };

    Plotly.newPlot("gpe_results_graph_"+result_key, data, layout, {displayModeBar: false});
    Plotly.newPlot("gpe_results_graph_fitted_"+result_key, data, layout_fitted, {displayModeBar: false});
  }

  gpe_result_keys.forEach(result_key => plot_gpe_batch_result(result_key));
}

//
// OLD
//

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
