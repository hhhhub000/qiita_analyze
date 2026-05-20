const API_BASE = "https://qiita.com/api/v2";
const TOKEN_KEY = "qiita_analyze_token";

export function loadToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch (_) {
    return "";
  }
}

export function saveToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (_) {}
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (_) {}
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function toError(status) {
  if (status === 401) return new Error("アクセストークンが無効です");
  if (status === 404) return new Error("ユーザーが見つかりません");
  if (status === 403 || status === 429) {
    return new Error("APIレート制限に達しました。しばらく待ってから再試行してください");
  }
  return new Error(`APIエラー: ${status}`);
}

// ユーザーの全記事を取得
// onProgress(loaded, total) で進捗通知
export async function fetchAllItems(userId, token, onProgress) {
  const perPage = 100;
  let page = 1;
  const all = [];
  const headers = authHeaders(token);
  while (page <= 100) {
    const url = `${API_BASE}/users/${encodeURIComponent(userId)}/items?page=${page}&per_page=${perPage}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw toError(res.status);
    const totalCount = parseInt(res.headers.get("Total-Count") || "0", 10);
    const items = await res.json();
    all.push(...items);
    if (typeof onProgress === "function") onProgress(all.length, totalCount);
    if (items.length < perPage) break;
    if (all.length >= totalCount) break;
    page++;
  }
  return all;
}

// ユーザープロフィール取得。失敗時は null を返す（メイン処理を止めない）
export async function fetchUser(userId, token) {
  try {
    const url = `${API_BASE}/users/${encodeURIComponent(userId)}`;
    const res = await fetch(url, { headers: authHeaders(token) });
    if (!res.ok) return null;
    return await res.json();
  } catch (_) {
    return null;
  }
}
