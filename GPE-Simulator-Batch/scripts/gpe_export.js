// type: text/plain, text/csv, text/json, ...
function download(filename, type, content) {
  let element = document.createElement("a");
  element.setAttribute("href", "data:"+type+";charset=utf-8," + encodeURIComponent(text));
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.remove(element);
}
