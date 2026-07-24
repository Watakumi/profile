# Watakumi Page

My profile site 👋 — https://watakumi.page

ブラウザで完結する小さくて楽しい個人アプリを量産しています。
そのプロフィールページのソースコードです。

## Stack

- [Astro 5](https://astro.build/) — 静的サイト生成（`output: static`）
- [Tailwind CSS 4](https://tailwindcss.com/)（`@tailwindcss/vite`）
- アイコンはインラインSVG（外部依存なし）
- **Cloudflare Pages** にデプロイ

## コンテンツの編集

自己紹介・スキル・プロジェクト・リンクはすべて
[`src/data/profile.ts`](./src/data/profile.ts) の1ファイルで管理しています。
テキストやURLを書き換えるだけでサイトに反映されます。

## 開発

```bash
npm install
npm run dev      # 開発サーバー (http://localhost:4321)
npm run build    # dist/ に静的ビルド
npm run preview  # ビルド結果をプレビュー
```

## デプロイ（Cloudflare Pages）

Git連携で自動デプロイ。ビルド設定は以下:

- Build command: `npm run build`
- Build output directory: `dist`
