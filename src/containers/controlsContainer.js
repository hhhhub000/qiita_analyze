import { loadToken, saveToken, clearToken } from "../api/qiita.js";

let userIdInput, tokenInput, rememberInput, analyzeBtn, clearTokenBtn;
let onAnalyzeCb = null;

export function init(rootEl) {
  userIdInput = rootEl.querySelector("#userId");
  tokenInput = rootEl.querySelector("#token");
  rememberInput = rootEl.querySelector("#remember");
  analyzeBtn = rootEl.querySelector("#analyzeBtn");
  clearTokenBtn = rootEl.querySelector("#clearTokenBtn");

  // 起動時に保存済みトークンを読み込み
  const saved = loadToken();
  if (saved) tokenInput.value = saved;

  analyzeBtn.addEventListener("click", invoke);
  userIdInput.addEventListener("keydown", (e) => { if (e.key === "Enter") invoke(); });
  tokenInput.addEventListener("keydown", (e) => { if (e.key === "Enter") invoke(); });
  clearTokenBtn.addEventListener("click", () => {
    tokenInput.value = "";
    clearToken();
    onClearTokenCb && onClearTokenCb();
  });
}

let onClearTokenCb = null;
export function onClearToken(cb) { onClearTokenCb = cb; }

export function onAnalyze(cb) { onAnalyzeCb = cb; }

function invoke() {
  if (!onAnalyzeCb) return;
  let userId = userIdInput.value.trim();
  // 先頭の @ を除去して許容
  if (userId.startsWith("@")) {
    userId = userId.slice(1);
    userIdInput.value = userId;
  }
  const token = tokenInput.value.trim();
  // トークン保存/削除
  if (token && rememberInput.checked) saveToken(token);
  else if (!rememberInput.checked) clearToken();
  onAnalyzeCb({ userId, token });
}

export function setBusy(busy) {
  if (analyzeBtn) analyzeBtn.disabled = !!busy;
}
