import { aggregateTags, sortTags } from "../utils/aggregate.js";
import { formatNum } from "../utils/format.js";

const TOP_N = 10;
const SORT_KEYS = new Set(["name", "posts", "likes", "avgLikes"]);

let rootEl, canvas, tbody, theadRow;
let tagChart;
let allTags = [];
let sortKey = "posts";
let sortDir = "desc";

export function init(el) {
  rootEl = el;
  canvas = el.querySelector("#tagsChart");
  tbody = el.querySelector("#tagsTableBody");
  theadRow = el.querySelector("#tagsTableHead");
  if (theadRow) {
    theadRow.addEventListener("click", onHeaderClick);
  }
}

function esc(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function onHeaderClick(e) {
  const th = e.target.closest("th[data-sort-key]");
  if (!th) return;
  const key = th.dataset.sortKey;
  if (!SORT_KEYS.has(key)) return;
  if (sortKey === key) {
    sortDir = sortDir === "desc" ? "asc" : "desc";
  } else {
    sortKey = key;
    // 数値列はデフォルト降順、名前列は昇順
    sortDir = key === "name" ? "asc" : "desc";
  }
  refresh();
}

function sortIndicator(key) {
  if (sortKey !== key) return '<span class="sort-arrow">⇅</span>';
  return sortDir === "desc"
    ? '<span class="sort-arrow active">▼</span>'
    : '<span class="sort-arrow active">▲</span>';
}

function renderHeader() {
  if (!theadRow) return;
  theadRow.innerHTML = `
    <th data-sort-key="name" class="sortable">タグ${sortIndicator("name")}</th>
    <th data-sort-key="posts" class="sortable num">記事数${sortIndicator("posts")}</th>
    <th data-sort-key="likes" class="sortable num">合計いいね${sortIndicator("likes")}</th>
    <th data-sort-key="avgLikes" class="sortable num">平均いいね${sortIndicator("avgLikes")}</th>
  `;
}

function refresh() {
  if (!allTags.length) { clear(); return; }
  const sorted = sortTags(allTags, sortKey, sortDir).slice(0, TOP_N);

  renderHeader();

  // テーブル
  tbody.innerHTML = sorted.map((t) => {
    const tagUrl = `https://qiita.com/tags/${encodeURIComponent(t.name)}`;
    return `
      <tr>
        <td class="tag"><a href="${tagUrl}" target="_blank" rel="noopener">${esc(t.name)}</a></td>
        <td class="num">${t.posts.toLocaleString()}</td>
        <td class="num">${t.likes.toLocaleString()}</td>
        <td class="num">${formatNum(t.avgLikes)}</td>
      </tr>
    `;
  }).join("");

  // チャート (テーブルと同じ並び順)
  // 記事数と合計いいねはスケールが大きく異なるため、上下にデュアルX軸を設定
  const labels = sorted.map((t) => t.name);
  if (tagChart) tagChart.destroy();
  tagChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "記事数",
          data: sorted.map((t) => t.posts),
          backgroundColor: "rgba(85,197,0,0.7)",
          borderColor: "#55c500",
          borderWidth: 1,
          xAxisID: "xPosts",
        },
        {
          label: "合計いいね",
          data: sorted.map((t) => t.likes),
          backgroundColor: "rgba(255,99,132,0.6)",
          borderColor: "#ff6384",
          borderWidth: 1,
          xAxisID: "xLikes",
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      scales: {
        xPosts: {
          position: "top",
          beginAtZero: true,
          title: { display: true, text: "記事数", color: "#55c500" },
          ticks: { color: "#55c500" },
          grid: { drawOnChartArea: false },
        },
        xLikes: {
          position: "bottom",
          beginAtZero: true,
          title: { display: true, text: "合計いいね", color: "#ff6384" },
          ticks: { color: "#ff6384" },
        },
      },
      plugins: { legend: { position: "bottom" } },
    },
  });

  rootEl.style.display = "block";
}

export function render(items) {
  if (!items || items.length === 0) { clear(); return; }
  allTags = aggregateTags(items);
  if (allTags.length === 0) { clear(); return; }
  // 新しいユーザー分析のたびにデフォルトソートにリセット
  sortKey = "posts";
  sortDir = "desc";
  refresh();
}

export function clear() {
  if (tagChart) { tagChart.destroy(); tagChart = null; }
  if (rootEl) rootEl.style.display = "none";
  if (tbody) tbody.innerHTML = "";
  allTags = [];
}
