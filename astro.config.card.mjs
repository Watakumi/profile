import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// ============================================================
// 名刺サイト（https://me.watakumi.page）専用のビルド設定。
// 同じリポジトリから 2つ目の Cloudflare Pages プロジェクトとしてデプロイします。
//
//   npm run build:card  ->  dist-card/
//   npm run dev:card    ->  http://localhost:4322
//
// src/pages/index.astro が既に "/" を占有しているため、
// 名刺を "/" に置くには srcDir を分けるしかありません（Astro のルーティングは
// ファイルシステム固定で、除外フィルタが無いため）。
// src/data・src/styles・src/layouts は本サイトと共有しています。
// ============================================================
export default defineConfig({
  site: 'https://me.watakumi.page',
  srcDir: './src-card',
  // public/ は本サイト用（robots.txt が apex を指し、未使用の巨大PNGもある）ので分ける
  publicDir: './public-card',
  outDir: './dist-card',
  // .astro キャッシュを本サイトのビルドと分け、相互に無効化し合わないようにする
  cacheDir: './node_modules/.astro-card',
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
