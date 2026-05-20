// 統計サマリーセクション。
// LGTM分布の代表値・ばらつき・集中度・投稿頻度などを表示。
import { formatNum } from "../utils/format.js";
import {
  mean, median, stdev, percentile, postingCadence,
} from "../utils/stats.js";

let rootEl;

export function init(el) {
  rootEl = el;
}

function card(label, value, hint) {
  const h = hint ? `<div class="stat-hint">${hint}</div>` : "";
  return `<div class="stat-card">
    <div class="stat-label">${label}</div>
    <div class="stat-value">${value}</div>
    ${h}
  </div>`;
}

export function render(items) {
  if (!rootEl) return;
  const likes = items.map(it => it.likes_count || 0);
  const stocks = items.map(it => it.stocks_count || 0);
  const totalLikes = likes.reduce((s, v) => s + v, 0);
  const totalStocks = stocks.reduce((s, v) => s + v, 0);
  const n = items.length;
  const contribTotal = totalLikes + n + totalStocks * 0.5;

  const lgtmMean = mean(likes);
  const lgtmMedian = median(likes);
  const lgtmStd = stdev(likes);
  const lgtmP90 = percentile(likes, 90);
  const lgtmMax = likes.length ? Math.max(...likes) : 0;
  const stockLikeRatio = totalLikes > 0 ? totalStocks / totalLikes : 0;
  const contribPerPost = n > 0 ? contribTotal / n : 0;
  const cadence = postingCadence(items);

  const distHtml = `
    <h3 class="stats-subtitle">LGTM 分布</h3>
    <div class="stats-grid">
      ${card("平均", formatNum(lgtmMean))}
      ${card("中央値", formatNum(lgtmMedian))}
      ${card("標準偏差 σ", formatNum(lgtmStd))}
      ${card("P90 (上位10%境界)", formatNum(lgtmP90))}
      ${card("最大", formatNum(lgtmMax))}
    </div>`;

  const efficiencyHtml = `
    <h3 class="stats-subtitle">記事あたり効率</h3>
    <div class="stats-grid">
      ${card("1記事あたり Contribution", formatNum(contribPerPost))}
      ${card(
        "ストック / いいね 比率",
        stockLikeRatio.toFixed(2),
        stockLikeRatio >= 0.5
          ? "実用 / リファレンス記事の傾向"
          : "読み物 / ニュース記事の傾向",
      )}
    </div>`;

  const cadenceHtml = `
    <h3 class="stats-subtitle">投稿ペース</h3>
    <div class="stats-grid">
      ${card("平均投稿間隔", formatNum(cadence.intervalMean) + " 日")}
      ${card("中央値投稿間隔", formatNum(cadence.intervalMedian) + " 日")}
      ${card("最長ブランク", formatNum(cadence.longestGapDays) + " 日")}
      ${card("アクティブ月数", cadence.activeMonths.toLocaleString())}
      ${card("沈黙月数", cadence.silentMonths.toLocaleString())}
    </div>`;

  rootEl.innerHTML = `
    <h2>統計サマリー</h2>
    ${distHtml}
    ${efficiencyHtml}
    ${cadenceHtml}
    <div class="hint">
      ※ 平均と中央値が大きく乖離する場合、少数のヒット記事に分布が引っ張られています。
      P90 は「上位10%以上の記事はLGTMがこの値以上」という閾値です。
    </div>
  `;
  rootEl.style.display = "block";
}

export function clear() {
  if (rootEl) {
    rootEl.style.display = "none";
    rootEl.innerHTML = "";
  }
}
