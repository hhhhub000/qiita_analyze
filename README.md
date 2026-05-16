# Qiita Contribution 分析

QiitaユーザーIDを入力すると、そのユーザーの Contribution の推移（折れ線グラフ）と内訳（円グラフ）を表示するシンプルなWebアプリです。

## 使い方

[index.html](index.html) をブラウザで開き、Qiita のユーザーID（例: `Qiita`）を入力して「分析する」を押してください。

ローカルサーバーで動かしたい場合:

```powershell
# Python があれば
python -m http.server 8000
# ブラウザで http://localhost:8000/ を開く
```

## 機能

- **Contribution の月次推移（累計）**: 折れ線グラフ。LGTM累計 / ストック累計 / 月次バーも重ねて表示。
- **Contribution 内訳**: LGTM数 と ストック数 の比率をドーナツグラフで表示。
- **サマリー**: 記事数、合計LGTM、合計ストック、合計Contribution。

## Contribution の算出方法について（重要）

Qiita API v2 には **Contribution を直接取得するエンドポイントは存在しません**。
そのため、本ツールでは公開APIで取得可能な以下の値を使って Contribution を再現しています:

```
Contribution = 各記事の likes_count + 各記事の stocks_count （を投稿月で集計）
```

Qiitaの公式プロフィールに表示される値と完全に一致しない可能性があります（コメント等の要素の扱いの違い）。
内訳円グラフも、API で取得できる **LGTM / ストック** の2要素のみとなります。

## 制限

- 未認証アクセスのため、Qiita API のレート制限は **IP あたり 60 リクエスト/時** です。
- 1ユーザーあたり最大 10,000 記事まで対応 (`per_page=100` × 100ページ)。
- ブラウザから直接 Qiita API を呼んでいます（CORS許可済み）。
