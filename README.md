# Watakumi Page

My profile site 👋 — https://watakumi.page
Digital business card 💳 — https://me.watakumi.page

ブラウザで完結する小さくて楽しい個人アプリを量産しています。
そのプロフィールページのソースコードです。

このリポジトリからは **2つのサイト** をビルドします。

| サイト | URL | srcDir | 出力 | 中身 |
| --- | --- | --- | --- | --- |
| 本サイト | `watakumi.page` | `src/` | `dist/` | 縦スクロールの詳細プロフィール |
| 名刺 | `me.watakumi.page` | `src-card/` | `dist-card/` | 1枚の名刺（クリックで表裏フリップ） |

`src/data`・`src/styles`・`src/layouts` は両方で共有しています。
`src/pages/index.astro` が既に `/` を占有しているため、名刺をサブドメインの `/` に
置くには `srcDir` を分けるしかありません（Astro のルーティングはファイルシステム固定のため）。

## Stack

- [Astro 5](https://astro.build/) — 静的サイト生成（`output: static`）
- [Tailwind CSS 4](https://tailwindcss.com/)（`@tailwindcss/vite`）
- アイコンはインラインSVG（外部依存なし）
- **Cloudflare Pages** にデプロイ

## コンテンツの編集

自己紹介・スキル・プロジェクト・リンクはすべて
[`src/data/profile.ts`](./src/data/profile.ts) の1ファイルで管理しています。
テキストやURLを書き換えるだけでサイトに反映されます。

名刺だけの内容（凝縮した8つのスキル・副題・vCard の項目）は
[`src/data/card.ts`](./src/data/card.ts) にあります。名前・肩書き・リンクは
`profile.ts` から取り込んでいるので二重管理は不要です。

> `.vcf` の `REV` は再現可能ビルドのため定数です。名刺の内容を変えたら
> `card.ts` の `CARD_REV` も更新してください。

## 開発

```bash
npm install
npm run dev       # 本サイト   (http://localhost:4321)
npm run dev:card  # 名刺       (http://localhost:4322)

npm run build       # dist/      に静的ビルド
npm run build:card  # dist-card/ に静的ビルド
npm run build:all   # 両方

npm run preview       # ビルド結果をプレビュー
npm run preview:card

# 名刺を Workers ランタイム（workerd）で確認する
npx wrangler dev -c wrangler.card.jsonc
```

## デプロイ

2つのサイトで**デプロイ方式が異なります**。Cloudflare が新規プロジェクトを
Workers に寄せ、ダッシュボードから Pages の作成導線が無くなったためです。
本サイトは既存の Pages プロジェクトをそのまま使い続けています。

| | 本サイト | 名刺 |
| --- | --- | --- |
| 方式 | Cloudflare **Pages**（既存） | Cloudflare **Workers**（静的アセット） |
| ドメイン | `watakumi.page` | `me.watakumi.page` |
| Build command | `npm run build` | `npm run build:card` |
| 出力 | `dist` | `dist-card` |
| Deploy command | —（Pages が自動） | `npx wrangler deploy -c wrangler.card.jsonc` |
| 環境変数 | — | `NODE_VERSION=22` |

名刺の Worker 設定は [`wrangler.card.jsonc`](./wrangler.card.jsonc) です。
**あえて既定名（`wrangler.toml` / `.json` / `.jsonc`）にしていません。**
本サイトの Pages プロジェクトが同じリポジトリルートをビルドしているため、
既定名だと Pages 側がこの設定を拾ってしまう恐れがあるからです。
そのため deploy 時は必ず `-c` で明示します。

- `main` は不要（サーバーコードのない静的アセットのみの Worker）
- `not_found_handling: "404-page"` で未マッチのパスに `404.html` を 404 で返す
- カスタムドメインは `routes` の `custom_domain: true` でデプロイ時に自動設定

静的ビルドでは endpoint のレスポンスヘッダが破棄されるため、`.vcf` の
`Content-Type: text/vcard` は [`public-card/_headers`](./public-card/_headers) で付けています
（Astro が `dist-card/_headers` にコピーし、Workers がアセット配信時に適用）。
