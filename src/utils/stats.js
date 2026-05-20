// 統計ユーティリティ
// すべて純関数。引数は数値配列を想定。空配列の場合は null / 0 を返す。

export function mean(arr) {
  if (!arr.length) return 0;
  let s = 0;
  for (const v of arr) s += v;
  return s / arr.length;
}

export function median(arr) {
  if (!arr.length) return 0;
  const a = [...arr].sort((x, y) => x - y);
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}

// 標本標準偏差 (n-1)。要素数 < 2 の場合は 0。
export function stdev(arr) {
  if (arr.length < 2) return 0;
  const mu = mean(arr);
  let s = 0;
  for (const v of arr) s += (v - mu) ** 2;
  return Math.sqrt(s / (arr.length - 1));
}

// 線形補間によるパーセンタイル (p は 0-100)
export function percentile(arr, p) {
  if (!arr.length) return 0;
  const a = [...arr].sort((x, y) => x - y);
  if (a.length === 1) return a[0];
  const idx = (p / 100) * (a.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return a[lo];
  return a[lo] + (a[hi] - a[lo]) * (idx - lo);
}

// 上位 ratio (0-1) の合計が全合計に占める割合
// 例: topShare(likes, 0.1) → 上位10%記事のLGTMが全体に占める比率
export function topShare(arr, ratio) {
  if (!arr.length) return 0;
  const total = arr.reduce((s, v) => s + v, 0);
  if (total <= 0) return 0;
  const a = [...arr].sort((x, y) => y - x);
  const n = Math.max(1, Math.ceil(a.length * ratio));
  let s = 0;
  for (let i = 0; i < n; i++) s += a[i];
  return s / total;
}

// Gini 係数 (0=完全平等, 1=極端な集中)
export function gini(arr) {
  if (!arr.length) return 0;
  const a = [...arr].filter(v => v >= 0).sort((x, y) => x - y);
  const n = a.length;
  const total = a.reduce((s, v) => s + v, 0);
  if (total <= 0) return 0;
  let cum = 0;
  for (let i = 0; i < n; i++) cum += (i + 1) * a[i];
  return (2 * cum) / (n * total) - (n + 1) / n;
}

// 単純移動平均。window 未満の先頭要素は null。
export function movingAverage(arr, window) {
  const out = [];
  if (window <= 1) return [...arr];
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
    if (i >= window) sum -= arr[i - window];
    out.push(i >= window - 1 ? sum / window : null);
  }
  return out;
}

// 最小二乗法による線形回帰。y = slope * x + intercept (x はインデックス 0..n-1)
// R² も返す。
export function linearRegression(y) {
  const n = y.length;
  if (n < 2) return { slope: 0, intercept: n ? y[0] : 0, r2: 0, line: [...y] };
  let sx = 0, sy = 0, sxy = 0, sxx = 0;
  for (let i = 0; i < n; i++) {
    sx += i;
    sy += y[i];
    sxy += i * y[i];
    sxx += i * i;
  }
  const denom = n * sxx - sx * sx;
  const slope = denom === 0 ? 0 : (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;
  const meanY = sy / n;
  let ssTot = 0, ssRes = 0;
  const line = [];
  for (let i = 0; i < n; i++) {
    const yhat = slope * i + intercept;
    line.push(yhat);
    ssTot += (y[i] - meanY) ** 2;
    ssRes += (y[i] - yhat) ** 2;
  }
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  return { slope, intercept, r2, line };
}

// 連続する月の Date 配列から、平均投稿間隔(日) / 最長ブランク(日) / アクティブ月数 / 沈黙月数 を算出
// items: { created_at } の配列
export function postingCadence(items) {
  if (!items.length) {
    return { intervalMean: 0, intervalMedian: 0, longestGapDays: 0, activeMonths: 0, silentMonths: 0 };
  }
  const dates = items
    .map(it => new Date(it.created_at).getTime())
    .filter(t => !isNaN(t))
    .sort((a, b) => a - b);
  const intervals = [];
  for (let i = 1; i < dates.length; i++) {
    intervals.push((dates[i] - dates[i - 1]) / 86400000);
  }
  // 月キー集合
  const monthSet = new Set(
    dates.map(t => {
      const d = new Date(t);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    })
  );
  let totalMonths = 0;
  if (dates.length > 0) {
    const first = new Date(dates[0]);
    const last = new Date(dates[dates.length - 1]);
    totalMonths =
      (last.getFullYear() - first.getFullYear()) * 12 +
      (last.getMonth() - first.getMonth()) +
      1;
  }
  return {
    intervalMean: intervals.length ? mean(intervals) : 0,
    intervalMedian: intervals.length ? median(intervals) : 0,
    longestGapDays: intervals.length ? Math.max(...intervals) : 0,
    activeMonths: monthSet.size,
    silentMonths: Math.max(0, totalMonths - monthSet.size),
  };
}
