// 月次集計 + Contribution の累計算出
// Contribution = いいね×1 + 記事投稿×1 + ストック×0.5
export function aggregateByMonth(items) {
  const map = new Map();
  for (const it of items) {
    const d = new Date(it.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const cur = map.get(key) || { likes: 0, stocks: 0, posts: 0 };
    cur.likes += it.likes_count || 0;
    cur.stocks += it.stocks_count || 0;
    cur.posts += 1;
    map.set(key, cur);
  }
  const keys = [...map.keys()].sort();
  if (keys.length === 0) {
    return { labels: [], monthly: [], cumulative: [], likesCum: [], stocksCum: [], postsCum: [] };
  }
  // 月の連続性を保つ
  const fill = [];
  const [sy, sm] = keys[0].split("-").map(Number);
  const [ey, em] = keys[keys.length - 1].split("-").map(Number);
  let y = sy, m = sm;
  while (y < ey || (y === ey && m <= em)) {
    fill.push(`${y}-${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) { m = 1; y++; }
  }
  let cumL = 0, cumS = 0, cumP = 0;
  const monthly = [];
  const cumulative = [];
  const likesCum = [];
  const stocksCum = [];
  const postsCum = [];
  for (const k of fill) {
    const v = map.get(k) || { likes: 0, stocks: 0, posts: 0 };
    cumL += v.likes;
    cumS += v.stocks;
    cumP += v.posts;
    const monthContrib = v.likes * 1 + v.posts * 1 + v.stocks * 0.5;
    monthly.push(monthContrib);
    cumulative.push(cumL * 1 + cumP * 1 + cumS * 0.5);
    likesCum.push(cumL * 1);
    stocksCum.push(cumS * 0.5);
    postsCum.push(cumP * 1);
  }
  return { labels: fill, monthly, cumulative, likesCum, stocksCum, postsCum };
}

// いいね順 TOP N
export function getTopByLikes(items, n = 5) {
  return [...items]
    .sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
    .slice(0, n);
}

// ストック順 TOP N
export function getTopByStocks(items, n = 5) {
  return [...items]
    .sort((a, b) => (b.stocks_count || 0) - (a.stocks_count || 0))
    .slice(0, n);
}

// タグ集計
// 戻り値: [{ name, posts, likes, avgLikes }] の配列 (記事数降順、タイブレークは合計いいね降順)
export function aggregateTags(items, n = 10) {
  const map = new Map();
  for (const it of items) {
    const likes = it.likes_count || 0;
    for (const tag of it.tags || []) {
      const name = tag.name;
      if (!name) continue;
      const cur = map.get(name) || { posts: 0, likes: 0 };
      cur.posts += 1;
      cur.likes += likes;
      map.set(name, cur);
    }
  }
  const arr = [...map.entries()].map(([name, v]) => ({
    name,
    posts: v.posts,
    likes: v.likes,
    avgLikes: v.posts > 0 ? v.likes / v.posts : 0,
  }));
  arr.sort((a, b) => (b.posts - a.posts) || (b.likes - a.likes));
  return arr.slice(0, n);
}
