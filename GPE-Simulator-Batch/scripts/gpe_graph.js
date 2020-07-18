const gpe_graph_layout = {
  width: 800,
  height: 600
}

const gpe_graph_margin = {
  l:50, r:50, b:50, t:50,
  pad: 0
}

const gpe_result_names = {
          "Xbar_ancestors": "Xbar_a",
        "Xbar_descendants": "Xbar_d",
                   "DXbar": "DXbar",
    "cov_Ctil_X_ancestors": "cov(Ctil_a, X_a)",
                  "ave_DX": "ave(DX)",
  "cov_Ctil_X_descendants": "cov(Ctil_d, X_d)"
}

const y_ranges = {
          "Xbar_ancestors": [0, 1],
        "Xbar_descendants": [0, 1],
                   "DXbar": [-1, 1],
    "cov_Ctil_X_ancestors": [-1, 1],
                  "ave_DX": [-1, 1],
  "cov_Ctil_X_descendants": [-1, 1]
}

var gpe_result_values = {};
var gpe_result_errors = {};
// init
gpe_result_keys.forEach((result_key) => {
  gpe_result_values[result_key] = [];
  gpe_result_errors[result_key] = [];
});

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
  let gpe_result_values = {};
  let gpe_result_errors = {};
  gpe_result_keys.forEach((result_key) => {
    gpe_result_values[result_key] = [];
    gpe_result_errors[result_key] = [];
  });

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

    gpe_result_values[result_key] = ys;
    gpe_result_errors[result_key] = ys_error;

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
      margin: gpe_graph_margin,
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
      margin: gpe_graph_margin,
      showlegend: false
    };

    Plotly.newPlot("gpe_results_graph_"+result_key, data, layout);
    Plotly.newPlot("gpe_results_graph_fitted_"+result_key, data, layout_fitted);
  }

  function plot_gpe_batch_results_summary() {
    let ys = gpe_result_values;

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
      width: gpe_graph_layout.width,
      height: gpe_graph_layout.height,
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
      margin: gpe_graph_margin,
      showlegend: true
    };

    Plotly.newPlot("gpe_results_graph_summary", data, layout);
  }

  //

  // individual results
  gpe_result_keys.forEach(result_key => plot_gpe_batch_result(result_key));
  // summary of results
  plot_gpe_batch_results_summary();
}

//
// UI
//

function set_displayed_gpe_results_graph(value) {
  let target_id = "gpe_results_graph_"+value;
  let children = div_gpe_results_graph_container.children;
  for (var i = 0; i < children.length; i++) {
    let child = children[i];
    if (child.id == target_id)
    { unhide(child); }
    else
    { hide(child); }
  }
}

function update_show_gpe_results_graph(event) {
  let id = event.target.id;
  let value = event.target.checked;
  let gpe_result_key = id.split("gpe_results_option_")[1];
  let target_id = "gpe_results_graph_"+gpe_result_key;
  console.log(target_id);
  set_hidden(target_id, !value);
}
