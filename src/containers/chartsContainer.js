import { aggregateByMonth } from "../utils/aggregate.js";
import { formatNum } from "../utils/format.js";
import { movingAverage, linearRegression } from "../utils/stats.js";

let rootEl, noteEl, lineCanvas, monthlyCanvas, pieCanvas;
let lineChart, monthlyChart, pieChart;

export function init(el, noteWrapEl) {
  rootEl = el;
  noteEl = noteWrapEl;
  lineCanvas = el.querySelector("#lineChart");
  monthlyCanvas = el.querySelector("#monthlyChart");
  pieCanvas = el.querySelector("#pieChart");
}

export function render(items) {
  const totalLikes = items.reduce((s, x) => s + (x.likes_count || 0), 0);
  const totalStocks = items.reduce((s, x) => s + (x.stocks_count || 0), 0);
  const totalPosts = items.length;
  const contribLikes = totalLikes * 1;
  const contribPosts = totalPosts * 1;
  const contribStocks = totalStocks * 0.5;

  const { labels, monthly, cumulative, likesCum, stocksCum, postsCum } = aggregateByMonth(items);

  // 月次Contribution の 3ヶ月移動平均 と 線形回帰トレンド
  const ma3 = movingAverage(monthly, 3);
  const reg = linearRegression(monthly);
  const trendLabel = `回帰トレンド (slope=${formatNum(reg.slope)}/月, R²=${reg.r2.toFixed(2)})`;

  // ===== チャートA: 累計推移 =====
  if (lineChart) lineChart.destroy();
  lineChart = new Chart(lineCanvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Contribution (累計)",
          data: cumulative,
          borderColor: "#55c500",
          backgroundColor: "rgba(85,197,0,0.15)",
          fill: true,
          tension: 0.2,
        },
        {
          label: "いいね分 (累計×1)",
          data: likesCum,
          borderColor: "#ff6384",
          backgroundColor: "rgba(255,99,132,0.05)",
          fill: false,
          tension: 0.2,
        },
        {
          label: "記事投稿分 (累計×1)",
          data: postsCum,
          borderColor: "#ffa500",
          backgroundColor: "rgba(255,165,0,0.05)",
          fill: false,
          tension: 0.2,
        },
        {
          label: "ストック分 (累計×0.5)",
          data: stocksCum,
          borderColor: "#36a2eb",
          backgroundColor: "rgba(54,162,235,0.05)",
          fill: false,
          tension: 0.2,
        },
      ],
    },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      scales: { y: { beginAtZero: true } },
    },
  });

  // ===== チャートB: 月次の活動とトレンド =====
  if (monthlyChart) monthlyChart.destroy();
  monthlyChart = new Chart(monthlyCanvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "月次 Contribution",
          data: monthly,
          type: "bar",
          backgroundColor: "rgba(85,197,0,0.4)",
          borderColor: "rgba(85,197,0,0.8)",
          borderWidth: 1,
        },
        {
          label: "3ヶ月移動平均",
          data: ma3,
          type: "line",
          borderColor: "#8e44ad",
          backgroundColor: "rgba(142,68,173,0.05)",
          borderDash: [4, 4],
          pointRadius: 0,
          fill: false,
          tension: 0.2,
        },
        {
          label: trendLabel,
          data: reg.line,
          type: "line",
          borderColor: "#c0392b",
          borderWidth: 1.5,
          borderDash: [2, 3],
          pointRadius: 0,
          fill: false,
          tension: 0,
        },
      ],
    },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      scales: { y: { beginAtZero: true } },
    },
  });

  // ===== チャートC: Contribution内訳 =====
  if (pieChart) pieChart.destroy();
  pieChart = new Chart(pieCanvas, {
    type: "doughnut",
    data: {
      labels: [
        `いいね ×1 (${formatNum(contribLikes)})`,
        `記事投稿 ×1 (${formatNum(contribPosts)})`,
        `ストック ×0.5 (${formatNum(contribStocks)})`,
      ],
      datasets: [{
        data: [contribLikes, contribPosts, contribStocks],
        backgroundColor: ["#ff6384", "#ffa500", "#36a2eb"],
      }],
    },
    options: { responsive: true },
  });

  rootEl.style.display = "grid";
  if (noteEl) noteEl.style.display = "block";
}

export function clear() {
  if (lineChart) { lineChart.destroy(); lineChart = null; }
  if (monthlyChart) { monthlyChart.destroy(); monthlyChart = null; }
  if (pieChart) { pieChart.destroy(); pieChart = null; }
  if (rootEl) rootEl.style.display = "none";
  if (noteEl) noteEl.style.display = "none";
}
