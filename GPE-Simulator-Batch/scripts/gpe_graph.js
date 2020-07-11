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

  let gpe_result_names = {
    "Xbar_ancestors": "Xbar_a",
    "Xbar_descendants": "Xbar_d",
    "DXbar": "DXbar",
    "cov_Ctil_X_ancestors": "cov(Ctil_a, X_a)",
    "ave_DX": "ave(DX)",
    "cov_Ctil_X_descendants": "cov(Ctil_d, X_d)"
  }

  let y_ranges = {
    "Xbar_ancestors": [0, 1],
    "Xbar_descendants": [0, 1],
    "DXbar": [-1, 1],
    "cov_Ctil_X_ancestors": [-1, 1],
    "ave_DX": [-1, 1],
    "cov_Ctil_X_descendants": [-1, 1]
  }

  let gpe_result_ys = {};
  gpe_result_keys.forEach((result_key) => { gpe_result_ys[result_key] = []; });

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

    gpe_result_ys[result_key] = ys;

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

  function plot_gpe_batch_results_summary() {
    let ys = gpe_result_ys;

    let xs = [];
    for (var gen_i = 0; gen_i < config.generations_count - 1; gen_i++) {
      xs.push(gen_i);
    }

    let traces = {};
    gpe_result_keys.forEach(result_key => {
      traces[result_key] = {
        name: gpe_result_names[result_key],
        x: xs,
        y: ys[result_key],
        type: "scatter"
      };
    });

    let data = [];
    gpe_result_keys.forEach(result_key => { data.push(traces[result_key]); });

    let layout = {
      title: "PGE Results Summary",
      width: gpe_graph_layout.width*2,
      height: gpe_graph_layout.height*1.5,
      xaxis: {
        title: "ancestor generation",
        autotick: false,
        tick0: 0,
        dtick: 1
      },
      yaxis: {
        range: [-1, 1],
        showgrid: true,
        zeroline: true,
        showline: true,
        gridcolor: '#bdbdbd',
        gridwidth: 2,
        zerolinecolor: '#969696',
        zerolinewidth: 4
      },
      showlegend: true
    };

    Plotly.newPlot("gpe_results_graph_summary", data, layout, {displayModeBar: false});
  }

  //

  // individual results
  gpe_result_keys.forEach(result_key => plot_gpe_batch_result(result_key));
  // summary of results
  plot_gpe_batch_results_summary();
}
