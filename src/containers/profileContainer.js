// ユーザープロフィールカード
// API: https://qiita.com/api/v2/users/:user_id

let rootEl;

export function init(el) {
  rootEl = el;
}

function esc(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function render(user) {
  if (!user) { clear(); return; }
  const links = [];
  if (user.github_login_name) {
    links.push(`<a href="https://github.com/${encodeURIComponent(user.github_login_name)}" target="_blank" rel="noopener">GitHub: @${esc(user.github_login_name)}</a>`);
  }
  if (user.twitter_screen_name) {
    links.push(`<a href="https://twitter.com/${encodeURIComponent(user.twitter_screen_name)}" target="_blank" rel="noopener">X/Twitter: @${esc(user.twitter_screen_name)}</a>`);
  }
  if (user.website_url) {
    links.push(`<a href="${esc(user.website_url)}" target="_blank" rel="noopener">Web</a>`);
  }

  const meta = [];
  meta.push(`<span><b>${(user.items_count ?? 0).toLocaleString()}</b> 記事</span>`);
  meta.push(`<span><b>${(user.followees_count ?? 0).toLocaleString()}</b> フォロー中</span>`);
  meta.push(`<span><b>${(user.followers_count ?? 0).toLocaleString()}</b> フォロワー</span>`);
  if (user.organization) meta.push(`<span>所属: <b>${esc(user.organization)}</b></span>`);
  if (user.location) meta.push(`<span>📍 ${esc(user.location)}</span>`);

  rootEl.innerHTML = `
    <img class="avatar" src="${esc(user.profile_image_url || "")}" alt="${esc(user.id || "")}" />
    <div class="profile-body">
      <p class="profile-name">${esc(user.name || user.id || "")}</p>
      <p class="profile-id"><a href="https://qiita.com/${encodeURIComponent(user.id || "")}" target="_blank" rel="noopener">@${esc(user.id || "")}</a></p>
      ${user.description ? `<p class="profile-desc">${esc(user.description)}</p>` : ""}
      <div class="profile-meta">${meta.join("")}</div>
      ${links.length ? `<div class="profile-links">${links.join("")}</div>` : ""}
    </div>
  `;
  rootEl.style.display = "flex";
}

export function clear() {
  if (rootEl) {
    rootEl.style.display = "none";
    rootEl.innerHTML = "";
  }
}
