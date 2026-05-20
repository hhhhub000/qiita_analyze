// 数値フォーマット
export function formatNum(n) {
  // 小数点以下があれば 1 桁表示
  return Number.isInteger(n)
    ? n.toLocaleString()
    : n.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

// YYYY-MM-DD
export function formatDate(isoString) {
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
