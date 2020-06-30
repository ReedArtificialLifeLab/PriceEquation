# PGE Web App (Henry)

A web app for visualizing the generalized price equation (GPE) statistics for simple, randomly-generated genealogies. A batch of genealogies are simulated, and then the aggregated results are displayed.

## Usage

### Setup

**Recommended:** Run an HTTP server this repository's parent directory. Then open a web browser to `index.html`.

**Alternative:** Open the `index.html` file directly by a web browser.


### Interface

There are three main panels:

- **Genealogy Configuration.** The table of configuration options on the left. Hover over a parameter to see a short description tooltip. Set the configurations, then click the "generate genealogy" button to update the network, table, and graphs. The "show ..." options will immediately show/hide other panels.
- **GPE Results Table.** The graphs at the bottom. These graphs are of the statistics appearing in the GPE results table. The table to the right of the genealogy network. These graphs contain the batch-aggregated statistics used by the GPE, measured for each pair of consecutive generations in the genealogy (the GPE focusses on the change between consecutive generations). Values are rounded to 10e-3.
