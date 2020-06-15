function toggle_hidden(id) {
  let element = document.getElementById(id);
  if (element.classList.contains("hidden")) {
    element.classList.remove("hidden");
  } else {
    element.classList.add("hidden");
  }
}

function set_hidden(id, is_hidden) {
  let element = document.getElementById(id);
  if (is_hidden && !element.classList.contains("hidden")) {
    element.classList.add("hidden");
  } else if (!is_hidden && element.classList.contains("hidden")) {
    element.classList.remove("hidden");
  }
}
