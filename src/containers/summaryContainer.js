import { formatNum } from "../utils/format.js";

let rootEl, itemsEl, likesEl, stocksEl, totalEl;

export function init(el) {
  rootEl = el;
  itemsEl = el.querySelector("#sumItems");
  likesEl = el.querySelector("#sumLikes");
  stocksEl = el.querySelector("#sumStocks");
  totalEl = el.querySelector("#sumTotal");
}

export function render(items) {
  const totalLikes = items.reduce((s, x) => s + (x.likes_count || 0), 0);
  const totalStocks = items.reduce((s, x) => s + (x.stocks_count || 0), 0);
  const totalPosts = items.length;
  // Qiita Contribution (記事投稿要素のみ): いいね×1 + 記事投稿×1 + ストック×0.5
  const contribTotal = totalLikes * 1 + totalPosts * 1 + totalStocks * 0.5;

  itemsEl.textContent = totalPosts.toLocaleString();
  likesEl.textContent = totalLikes.toLocaleString();
  stocksEl.textContent = totalStocks.toLocaleString();
  totalEl.textContent = formatNum(contribTotal);

  rootEl.style.display = "grid";
}

export function clear() {
  if (rootEl) rootEl.style.display = "none";
}
