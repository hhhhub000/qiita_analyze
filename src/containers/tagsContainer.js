import { aggregateTags } from "../utils/aggregate.js";
import { formatNum } from "../utils/format.js";

let rootEl, canvas, tbody;
let tagChart;

export function init(el) {
  rootEl = el;
  canvas = el.querySelector("#tagsChart");
  tbody = el.querySelector("#tagsTableBody");
}

function esc(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function render(items) {
  if (!items || items.length === 0) { clear(); return; }
  const tags = aggregateTags(items, 10);
  if (tags.length === 0) { clear(); return; }

  // テーブル
  tbody.innerHTML = tags.map((t) => {
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

  // 横棒チャート (記事数 と 合計いいね を並列表示)
  const labels = tags.map((t) => t.name);
  if (tagChart) tagChart.destroy();
  tagChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "記事数",
          data: tags.map((t) => t.posts),
          backgroundColor: "rgba(85,197,0,0.7)",
          borderColor: "#55c500",
          borderWidth: 1,
        },
        {
          label: "合計いいね",
          data: tags.map((t) => t.likes),
          backgroundColor: "rgba(255,99,132,0.6)",
          borderColor: "#ff6384",
          borderWidth: 1,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      scales: { x: { beginAtZero: true } },
      plugins: { legend: { position: "bottom" } },
    },
  });

  rootEl.style.display = "block";
}

export function clear() {
  if (tagChart) { tagChart.destroy(); tagChart = null; }
  if (rootEl) rootEl.style.display = "none";
  if (tbody) tbody.innerHTML = "";
}
