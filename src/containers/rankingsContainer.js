import { getTopByLikes, getTopByStocks } from "../utils/aggregate.js";
import { formatDate } from "../utils/format.js";

let rootEl, likesTbody, stocksTbody;

export function init(el) {
  rootEl = el;
  likesTbody = el.querySelector("#topLikesBody");
  stocksTbody = el.querySelector("#topStocksBody");
}

function esc(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rowsHtml(items, metric) {
  if (!items.length) return `<tr><td colspan="5" class="no-data">データなし</td></tr>`;
  return items.map((it, i) => {
    const likes = (it.likes_count || 0).toLocaleString();
    const stocks = (it.stocks_count || 0).toLocaleString();
    const date = formatDate(it.created_at);
    const url = esc(it.url || "");
    const title = esc(it.title || "(no title)");
    const highlightLikes = metric === "likes" ? ' style="color:#ff6384;font-weight:bold;"' : "";
    const highlightStocks = metric === "stocks" ? ' style="color:#36a2eb;font-weight:bold;"' : "";
    return `
      <tr>
        <td class="rank">${i + 1}</td>
        <td class="title"><a href="${url}" target="_blank" rel="noopener">${title}</a></td>
        <td class="num"${highlightLikes}>${likes}</td>
        <td class="num"${highlightStocks}>${stocks}</td>
        <td class="date">${date}</td>
      </tr>
    `;
  }).join("");
}

export function render(items) {
  if (!items || items.length === 0) { clear(); return; }
  likesTbody.innerHTML = rowsHtml(getTopByLikes(items, 5), "likes");
  stocksTbody.innerHTML = rowsHtml(getTopByStocks(items, 5), "stocks");
  rootEl.style.display = "grid";
}

export function clear() {
  if (rootEl) rootEl.style.display = "none";
  if (likesTbody) likesTbody.innerHTML = "";
  if (stocksTbody) stocksTbody.innerHTML = "";
}
