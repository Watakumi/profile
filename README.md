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
```

## デプロイ（Cloudflare Pages）

Git連携で自動デプロイ。**同じリポジトリに Pages プロジェクトを2つ**つないでいます。

| | 本サイト | 名刺 |
| --- | --- | --- |
| Custom domain | `watakumi.page` | `me.watakumi.page` |
| Build command | `npm run build` | `npm run build:card` |
| Build output directory | `dist` | `dist-card` |
| Root directory | （空） | （空） |
| Framework preset | — | **None**（Astro を選ぶと `npm run build` / `dist` が強制される） |
| 環境変数 | — | `NODE_VERSION=22` |

名刺側は静的ビルドのため endpoint のレスポンスヘッダが失われます。
`.vcf` の `Content-Type` は [`public-card/_headers`](./public-card/_headers) で付けています。
