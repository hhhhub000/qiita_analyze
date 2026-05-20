let el;

export function init(rootEl) {
  el = rootEl;
}

export function setStatus(msg, isError = false) {
  if (!el) return;
  el.textContent = msg;
  el.className = "status" + (isError ? " error" : "");
}

export function clear() {
  setStatus("");
}
