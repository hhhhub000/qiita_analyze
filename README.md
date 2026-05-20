# Qiita ユーザー分析ツール

QiitaユーザーIDを入力すると、そのユーザーの Contribution 推移・ランキング・タグ分析・プロフィールをまとめて表示するシンプルな静的Webアプリです。

## 使い方

ES Modules を使用しているため、`file://` で直接開くと動作しません。**ローカルサーバー経由で開いてください**。

```powershell
# Python があれば
python -m http.server 8000
# ブラウザで http://localhost:8000/ を開く
```

VS Code の `Live Server` 拡張などでも動作します。

## 機能

- **ユーザープロフィールカード**: アイコン・自己紹介・フォロワー数・所属・GitHub/X リンクなど。
- **サマリー**: 記事数、合計LGTM、合計ストック、合計Contribution。
- **Contribution の月次推移（累計）**: 折れ線グラフ。LGTM累計 / 記事投稿累計 / ストック累計 / 月次バーを重ねて表示。
- **Contribution 内訳**: いいね / 記事投稿 / ストック の3要素の比率をドーナツグラフで表示。
- **記事 いいね TOP5 / ストック TOP5**: 投稿日とリンク付きのランキングテーブル。
- **タグ分析 TOP10**: 記事数が多いタグの「記事数 / 合計いいね / 平均いいね」を横棒チャート + テーブルで表示。

## プロジェクト構成

```
index.html              # 骨組みのみ (HTML + <link rel="stylesheet"> + <script type="module">)
styles.css              # 全スタイル
src/
  main.js               # エントリ。コンテナの初期化と orchestration
  api/
    qiita.js            # fetchAllItems / fetchUser / トークン localStorage 管理
  utils/
    format.js           # 数値・日付フォーマット
    aggregate.js        # 月次集計・ランキング抽出・タグ集計
  containers/
    statusContainer.js
    controlsContainer.js
    summaryContainer.js
    chartsContainer.js
    profileContainer.js
    rankingsContainer.js
    tagsContainer.js
```

各コンテナは共通インターフェース `init(rootEl) / render(data) / clear()` を持ち、`main.js` から片方向に呼び出される設計です。

## Contribution の算出方法について

Qiita API v2 には **Contribution を直接取得するエンドポイントは存在しません**。
そのため、本ツールでは公開APIで取得可能な値から、Qiita ヘルプ記載の計算式（記事投稿要素のみ）で再現しています:

```
Contribution = いいね数 × 1 + 記事投稿数 × 1 + ストック数 × 0.5
```

コメント・編集リクエスト・質問・ストックリスト等の要素は API で人・記事単位に集計するのが困難なため未集計です。Qiita 公式プロフィールの値と完全一致しない場合があります。

## API 呼び出しについて

- `GET /users/:user_id` — プロフィール情報を取得（1回）
- `GET /users/:user_id/items` — 全記事を取得（ページング、最大 100 ページ）

未認証は IP あたり 60 req/h、トークン認証時は 1000 req/h。1ユーザーあたり最大 10,000 記事まで対応。
