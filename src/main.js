import { fetchAllItems, fetchUser } from "./api/qiita.js";
import * as statusContainer from "./containers/statusContainer.js";
import * as controlsContainer from "./containers/controlsContainer.js";
import * as summaryContainer from "./containers/summaryContainer.js";
import * as chartsContainer from "./containers/chartsContainer.js";
import * as profileContainer from "./containers/profileContainer.js";
import * as rankingsContainer from "./containers/rankingsContainer.js";
import * as tagsContainer from "./containers/tagsContainer.js";
import * as statsContainer from "./containers/statsContainer.js";

// 各コンテナ初期化
statusContainer.init(document.getElementById("status"));
controlsContainer.init(document.getElementById("controls"));
summaryContainer.init(document.getElementById("summary"));
chartsContainer.init(document.getElementById("charts"), document.getElementById("noteWrap"));
profileContainer.init(document.getElementById("profile"));
rankingsContainer.init(document.getElementById("rankings"));
tagsContainer.init(document.getElementById("tagsSection"));
statsContainer.init(document.getElementById("stats"));

controlsContainer.onClearToken(() => {
  statusContainer.setStatus("保存済みトークンを削除しました");
});

controlsContainer.onAnalyze(run);

async function run({ userId, token }) {
  if (!userId) {
    statusContainer.setStatus("ユーザーIDを入力してください", true);
    return;
  }
  controlsContainer.setBusy(true);
  statusContainer.setStatus("取得開始...");

  // 直前の表示をリセット
  profileContainer.clear();
  summaryContainer.clear();
  statsContainer.clear();
  chartsContainer.clear();
  rankingsContainer.clear();
  tagsContainer.clear();

  try {
    // 記事一覧とプロフィールを並列取得
    // fetchUser は失敗時 null を返すのでメイン処理は止まらない
    const [items, user] = await Promise.all([
      fetchAllItems(userId, token, (loaded, total) => {
        statusContainer.setStatus(`記事取得中... ${loaded} / ${total}`);
      }),
      fetchUser(userId, token),
    ]);

    // プロフィールは記事0件でも表示
    if (user) profileContainer.render(user);

    if (items.length === 0) {
      statusContainer.setStatus("このユーザーの記事は見つかりませんでした");
      return;
    }

    statusContainer.setStatus(`取得完了: ${items.length} 件`);
    summaryContainer.render(items);
    statsContainer.render(items);
    chartsContainer.render(items);
    rankingsContainer.render(items);
    tagsContainer.render(items);
  } catch (e) {
    statusContainer.setStatus(e.message || String(e), true);
  } finally {
    controlsContainer.setBusy(false);
  }
}
