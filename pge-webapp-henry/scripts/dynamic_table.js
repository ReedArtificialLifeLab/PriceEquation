// dynamically control a <table>

class Dynamic_Table {
  // container : html container that table will be placed inside
  constructor(container) {
    this.container = container;
    this.element = null;

    this.column_keys = [];
    // list of data list,
    // where each data list has an entry for each column key
    this.rows = [];
  }

  add_column_key(column_key) {
    this.column_keys.push(column_key);
  }

  add_row(row_data) {
    this.rows.push(row_data);
  }

  set_entry(column_key, row_index, entry) {
    this.rows[row_index][this.column_keys.indexOf(column_key)] = entry;
  }

  update_html() {
    if (this.element !== null) {
      this.element.remove();
    }

    // table
    this.element = document.createElement("table");
    this.container.appendChild(this.element);

    // header row
    let header_row = document.createElement("tr");
    this.element.appendChild(header_row);
    this.column_keys.forEach((column_key) => {
      let header_cell = document.createElement("th");
      header_row.appendChild(header_cell);
      header_cell.innerText = column_key;
    });

    // data rows
    this.rows.forEach((row) => {
      let table_row = document.createElement("tr");
      this.element.appendChild(table_row);
      row.forEach((entry) => {
        let table_data = document.createElement("td");
        table_row.appendChild(table_data);
        table_data.innerText = entry;
      });
    });
  }
}

function main() {
  let dt = new Dynamic_Table(document.getElementById("table-container"));
  dt.add_column_key("A");
  dt.add_column_key("B");
  dt.add_row(["a", "b"]);
  dt.add_row(["a", "b"]);
  dt.add_row(["a", "b"]);
  dt.add_row(["a", "b"]);
  dt.update_html();
  return dt;
}
