import { getTopByLikes, getTopByStocks, getTopByViews, hasPageViews } from "../utils/aggregate.js";
import { formatDate } from "../utils/format.js";

let rootEl, likesTbody, stocksTbody, viewsTbody, viewsNoteEl;

export function init(el) {
  rootEl = el;
  likesTbody = el.querySelector("#topLikesBody");
  stocksTbody = el.querySelector("#topStocksBody");
  viewsTbody = el.querySelector("#topViewsBody");
  viewsNoteEl = el.querySelector("#topViewsNote");
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

function viewsRowsHtml(items) {
  if (!items.length) return `<tr><td colspan="5" class="no-data">データなし</td></tr>`;
  return items.map((it, i) => {
    const views = (it.page_views_count || 0).toLocaleString();
    const likes = (it.likes_count || 0).toLocaleString();
    const date = formatDate(it.created_at);
    const url = esc(it.url || "");
    const title = esc(it.title || "(no title)");
    return `
      <tr>
        <td class="rank">${i + 1}</td>
        <td class="title"><a href="${url}" target="_blank" rel="noopener">${title}</a></td>
        <td class="num" style="color:#2c3e50;font-weight:bold;">${views}</td>
        <td class="num">${likes}</td>
        <td class="date">${date}</td>
      </tr>
    `;
  }).join("");
}

export function render(items) {
  if (!items || items.length === 0) { clear(); return; }
  likesTbody.innerHTML = rowsHtml(getTopByLikes(items, 5), "likes");
  stocksTbody.innerHTML = rowsHtml(getTopByStocks(items, 5), "stocks");

  if (hasPageViews(items)) {
    viewsTbody.innerHTML = viewsRowsHtml(getTopByViews(items, 5));
    if (viewsNoteEl) viewsNoteEl.style.display = "none";
  } else {
    viewsTbody.innerHTML = `<tr><td colspan="5" class="no-data">閲覧数は本人記事のみ取得可能です。トークンを指定ください。</td></tr>`;
    if (viewsNoteEl) viewsNoteEl.style.display = "none";
  }

  rootEl.style.display = "grid";
}

export function clear() {
  if (rootEl) rootEl.style.display = "none";
  if (likesTbody) likesTbody.innerHTML = "";
  if (stocksTbody) stocksTbody.innerHTML = "";
  if (viewsTbody) viewsTbody.innerHTML = "";
}
