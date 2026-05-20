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
// 戻り値: [{ name, posts, likes, avgLikes }] の全タグ配列 (ソートは呼び出し側で行う)
export function aggregateTags(items) {
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
  return [...map.entries()].map(([name, v]) => ({
    name,
    posts: v.posts,
    likes: v.likes,
    avgLikes: v.posts > 0 ? v.likes / v.posts : 0,
  }));
}

// タグ配列のソート (新しい配列を返す)
// key: "name" | "posts" | "likes" | "avgLikes"
// dir: "asc" | "desc"
export function sortTags(tags, key, dir = "desc") {
  const factor = dir === "asc" ? 1 : -1;
  const arr = [...tags];
  arr.sort((a, b) => {
    let cmp;
    if (key === "name") cmp = a.name.localeCompare(b.name);
    else cmp = (a[key] || 0) - (b[key] || 0);
    if (cmp !== 0) return cmp * factor;
    // タイブレーク: 合計いいね降順 → 記事数降順 → 名前昇順
    if (key !== "likes") {
      const d = (b.likes || 0) - (a.likes || 0);
      if (d !== 0) return d;
    }
    if (key !== "posts") {
      const d = (b.posts || 0) - (a.posts || 0);
      if (d !== 0) return d;
    }
    return a.name.localeCompare(b.name);
  });
  return arr;
}
