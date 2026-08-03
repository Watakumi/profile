# 名刺サイト `me.watakumi.page` 設計メモ

本サイト（`watakumi.page`）とは別に、**「渡す・見せる」用途に振り切った1枚の名刺**を
サブドメインで配信しています。スクロールせずに一目で誰か分かり、その場で連絡先を渡せることが目的です。

- 表面: アバター・名前・肩書き・タグライン
- 裏面: スキル・SNSリンク・vCard(.vcf) ダウンロード・QRコード
- クリック／タップで 3D フリップ

このドキュメントは「なぜそうなっているか」と「触ると壊れる箇所」を残すためのものです。
セットアップ手順は [README](../README.md) を参照してください。

---

## 1. リポジトリ構成

1つのリポジトリから **2つのサイト**をビルドします。

| サイト | URL | srcDir | 出力 | 設定ファイル |
| --- | --- | --- | --- | --- |
| 本サイト | `watakumi.page` | `src/` | `dist/` | `astro.config.mjs` |
| 名刺 | `me.watakumi.page` | `src-card/` | `dist-card/` | `astro.config.card.mjs` |

`src/data`・`src/styles`・`src/layouts` は両方で共有しています。

### なぜ `srcDir` を分けたのか

名刺はサブドメインの `/` に置く必要がありますが、`src/pages/index.astro` が既に `/` を占有しています。
Astro のルーティングは**ファイルシステム固定**で、`pagesDir` オプションも除外フィルタも無いため、
**1つの `src/` から2種類の `/` は出せません**。`srcDir` を分けるのが最小コストです
（`node_modules` / `package.json` / lockfile は共有されるので install 手順は両方で同一）。

### 検証済みの Astro 挙動

`node_modules/astro` のソースを読んで確認した事実です（Astro 5.18.2 時点）。

| 項目 | 挙動 |
| --- | --- |
| `--config` | `root` は変わらない。`srcDir`/`publicDir`/`outDir`/`cacheDir` はすべて `root` 基準で解決 |
| `publicDir` | `output: 'static'` では `outDir` にコピーされる |
| `outDir` | ビルド開始時に空にされる |
| `pages/x.vcf.ts` | `dist/x.vcf` を出力する（`x.vcf/index.html` にはならない） |
| **endpoint のレスポンスヘッダ** | **静的ビルドでは破棄される**（body だけがファイルに書かれる） |
| `.vcf` と sitemap | endpoint は sitemap に載らない。手動 filter 不要 |
| `@astrojs/sitemap` | config ごとの `site` を使うので、2つ目の config で正しい URL が出る |
| Tailwind 4 のスキャン範囲 | Vite root（＝リポジトリルート）から。**両ビルドが `src/` と `src-card/` の両方を走査する** |

最後の項目の影響は実測で、本サイトの CSS に増えたのは
**未使用のユーティリティ2つ（`min-h-[100dvh]` / `sr-only`）・+177バイトのみ**、
削除・変更されたルールはゼロでした。許容しています。

> 共有している `src/styles/global.css` に `@source not './src-card'` を足すと
> **名刺側のビルドが壊れます**。やらないでください。

---

## 2. デプロイ

**2つのサイトで方式が異なります。** Cloudflare が新規プロジェクトを Workers に寄せ、
ダッシュボードから Pages の作成導線が無くなったためです。本サイトは既存の Pages をそのまま使い続けています。

| | 本サイト | 名刺 |
| --- | --- | --- |
| 方式 | Cloudflare **Pages**（既存） | Cloudflare **Workers**（静的アセット） |
| Build command | `npm run build` | `npm run build:card` |
| 出力 | `dist` | `dist-card` |
| Deploy command | —（Pages が自動） | `npx wrangler deploy -c wrangler.card.jsonc` |

### `wrangler.card.jsonc` を既定名にしない理由

wrangler が自動検出するのは `wrangler.toml` / `wrangler.json` / `wrangler.jsonc` の3つです。
本サイトの Pages プロジェクトが**同じリポジトリルート**をビルドしているため、
既定名にすると Pages 側がこの設定を拾う恐れがあります。
既定名を避けることで構造的に事故を防ぎ、deploy 時は `-c` で明示します
（`astro.config.card.mjs` と同じ考え方）。

### Workers 静的アセットの設定

| 項目 | 結論 |
| --- | --- |
| `main`（サーバーコード） | **不要**。静的アセットのみの Worker が作れる |
| `compatibility_date` | **必須** |
| `not_found_handling` | `"404-page"` で最寄りの `404.html` を **404 ステータス**で返す。既定はこの挙動ではないので明示が必要 |
| `html_handling` | 既定 `"auto-trailing-slash"` が SSG に適切。指定不要 |
| `_headers` | **対応済み**。アセットディレクトリ直下（＝`dist-card/_headers`）に置く |
| カスタムドメイン | `routes` の `custom_domain: true` でデプロイ時に自動設定 |
| ビルドイメージの既定 Node | **24.18.0**（Astro 5 の要件 ≥22 を満たすので `NODE_VERSION` の設定は不要） |

### wrangler CLI でできないこと

- **Git 連携（push→自動ビルド）の設定** — `pages project create` にリポジトリ・ビルドコマンド・
  出力先を指定するオプションが無い
- **カスタムドメインの紐付け** — `wrangler pages` に `domain` サブコマンドが存在しない
  （Workers 側は設定ファイルの `routes` で可能）

### 環境変数の置き場は2つあり別物

| | 場所 | 用途 |
| --- | --- | --- |
| Build 変数 | Settings → **Build** → Build Variables and Secrets | ビルド実行時に効く |
| Runtime 変数 (`vars`) | Settings → Variables and Secrets | デプロイ後の Worker コードが読む |

`wrangler deploy` はリモートの設定をローカルの設定ファイルで**上書き**します。
ダッシュボードでランタイム変数を足しても、設定ファイルに書かなければ次のデプロイで消えます。

---

## 3. 触ると壊れる箇所

### 3.1 3D を平坦化するプロパティ

`transform-style: preserve-3d` の中で以下を使うと 3D コンテキストが平坦化され、
**Safari で反転中に裏面が鏡像で透けます**。

> `overflow`（visible 以外） / `filter` / `backdrop-filter` / `clip-path` / `mask` /
> `opacity < 1` / `mix-blend-mode` / `contain: paint`

そのため `.card-face` には **`backdrop-filter` を付けていません**。
グラス感は `background: rgb(255 255 255 / 0.85)` の不透明度で代替しています。

角丸からはみ出す要素を切り抜きたい場合は、`.card-face` ではなく
**`.card-bleed`（`inset: 0` の専用ラッパー）に `overflow: hidden` を載せます**。
こうすれば face の `backface-visibility` に触れません。

同様に、名前の縁取りに使う `filter: drop-shadow()` は `.card-name`（子孫）に載せています。
面そのものではないため反転には影響しません。

保険として、アニメーション完了後に裏側を `visibility: hidden` にする指定も入れてあります
（`transition: visibility 0s linear var(--flip-ms)`）。

### 3.2 グラデーション文字に `text-shadow` は使えない

`.text-brand-flow` は **文字色を透明にして背景を切り抜く**（`background-clip: text`）実装です。
ここに `.text-legible`（暗い `text-shadow`）を重ねると、**影が glyph を透けて濁った暗赤色**になります。

本サイトの `Hero.astro` でも `.text-legible` は単色の行に、`.text-brand-flow` は名前の行にと
**別々の span に分けて**あり、併用していません。

グラデーションを保ったまま縁を付けるには `filter: drop-shadow()` を使います。
これは**描画された結果のアルファ**に効くため、透明な文字でも実際に見えている部分にだけ影が乗ります。

### 3.3 インライン要素は空白が無いと折り返せない

Astro の `.map()` 出力は **span 同士の間に空白テキストノードを作りません**。
区切り記号を `::before` で入れるとテキスト中に改行可能位置が消滅し、
1行に繋がったまま折り返せず**カード幅を突き破って横にはみ出します**
（実測: カード 288px に対し裏面 463px）。

スキル一覧は `display: flex; flex-wrap: wrap` にして、各項目を独立した折り返し単位にしています。
区切り記号を置かず間隔で切っているのは、折り返した行の先頭や末尾に記号だけが取り残されるのを避けるためです。

---

## 4. vCard

`src-card/pages/watakumi.vcf.ts` が静的エンドポイントとして `dist-card/watakumi.vcf` を出力します。

| 項目 | 決定 | 理由 |
| --- | --- | --- |
| バージョン | **3.0** | iOS 連絡先 / Google 連絡先 / Outlook が揃って素直に解釈できる最大公約数 |
| 改行 | CRLF | RFC 2426 |
| 折り返し | 75オクテット、継続行は先頭に半角スペース1つ | ASCII 専用の長い行（base64）にのみ適用。日本語行に使うとオクテット数と文字数がズレる |
| `PHOTO` | **base64 埋め込み** | `PHOTO;VALUE=URI:` は iOS が取得せず Google 連絡先もほぼ無視するため、リモート参照だと写真が出ない |
| `REV` | **定数**（`2026-08-03T00:00:00Z`） | `new Date()` にすると毎ビルドでバイト列が変わり差分が汚れる。**内容を変えたら手で更新する** |
| メール・本名・電話 | **含めない** | 本サイトの匿名ポリシーを踏襲 |
| `Content-Type` | `public-card/_headers` で付与 | 静的ビルドでは endpoint のヘッダが破棄されるため |
| アンカーの `download` 属性 | **付ける** | 付けないと挙動が配信 Content-Type 依存でプラットフォーム毎にブレる |

アバターが将来差し替わっても肥大化しないよう、60,000バイト超なら `PHOTO` を省くガードを入れています。

---

## 5. QR コード

- `qrcode` パッケージで**ビルド時に inline SVG を生成**。クライアント JS はゼロ
- 内容は名刺ページの URL（vCard データではない）
- `margin: 0` にして、クワイエットゾーンは `.qr-frame` の `padding: 8px` で確保
- **`.qr-frame` はダークモードでも白のまま**。明背景に暗モジュールが唯一確実に読める向きのため
- オーロラ背景を QR に透けさせない

`qrcode` は `dependencies` に入れています。このリポジトリは `astro` / `tailwindcss` という
ビルド専用パッケージを既に `dependencies` に置いており、install 時に devDeps が含まれるかの曖昧さも避けられるためです。

---

## 6. OGP 画像

URL を貼ったときに出る画像は名刺専用のものを用意しています（`public-card/ogp-card.png`、1200×630）。

`satori` や `@vercel/og` といった画像生成ライブラリは入れず、
**HTML を実寸でスクリーンショットする**方式にしています（外部依存を増やさない方針のため）。
元ページは `src-card/pages/ogp-preview.astro` で、表示用ではないので `noindex`、
かつ `astro.config.card.mjs` の `sitemap({ filter })` で sitemap からも除外しています
（noindex のページを sitemap に載せると検索エンジンに矛盾したシグナルを送るため）。

### 再生成手順

```bash
npm run build:card
npx serve dist-card -l 4322

"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --hide-scrollbars \
  --window-size=1200,630 \
  --screenshot=public-card/ogp-card.png \
  http://localhost:4322/ogp-preview

npm run build:card   # public-card/ を dist-card/ に反映
```

> **ヘッドレス Chrome は既定でライトモードです。**
> `prefers-color-scheme: dark` 前提の配色に頼ると白背景に白文字で撮れてしまうため、
> `ogp-preview.astro` は背景と `.og-sub` のグラデーションを自前で持ち、配色を自己完結させています。

---

## 7. フリップのアクセシビリティ設計

**裏面にリンクがあるため、フリップのトリガでコンテンツを包むことはできません**
（`<a>` を `<button>` に入れるのは不正で、リンクが機能しなくなる）。

そこで各面に **`inset: 0` の透明な `<button>`** を敷き、面のコンテンツは `pointer-events: none` で
タップをボタンへ通し、**裏面の `a` / `button` / `.qr-frame` だけ `pointer-events: auto` に戻して**います。

> リンクをタップすればリンクが開き、それ以外をタップすれば反転する

実体が本物の `<button>` なので Enter / Space / Tab はコード追加なしで動きます。

- 隠れる面に **`inert`** を立て、タブ順とアクセシビリティツリーの両方から外す
  （`visibility: hidden` 単体ではトランジション中の担保にならない）
- 裏面には**初期 HTML の時点で** `inert` を書いてあるので、JS 実行前に隠れたリンクへフォーカスが入らない
- キーボード起動（`e.detail === 0`）のときだけ反転後の面へフォーカスを移す。マウスでは動かさない
- **Escape** で表面に戻し、フォーカスを復帰
- `prefers-reduced-motion` では回転せずクロスフェード。このとき裏面の `rotateY(180deg)` を
  **必ず `transform: none` で打ち消す**（忘れると裏面が鏡文字になる）
- `<noscript>` に素のリンク集を置き、JS 無効でも情報が届く

---

## 8. 検証

```bash
# 本サイトが無傷であること（最重要。head を前後で diff）
npm run build

npm run dev       # 本サイト (http://localhost:4321)
npm run dev:card  # 名刺     (http://localhost:4322)
npm run build:all

# Workers ランタイム（workerd）で実際に配信を確認する
npx wrangler dev -c wrangler.card.jsonc
curl -sI http://localhost:8787/watakumi.vcf | grep -i content-type   # text/vcard
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8787/none  # 404

# 出力の検査
grep -o 'https://[a-z.]*' dist-card/sitemap-0.xml | sort -u   # me.watakumi.page のみ
grep -c 'watakumi.vcf' dist-card/sitemap-0.xml                # 0（endpoint は載らない）
awk '{sub(/\r$/,""); if(length($0)>m) m=length($0)} END{print m}' dist-card/watakumi.vcf  # 75以下
grep -ci EMAIL dist-card/watakumi.vcf                         # 0
ls dist-card/_astro/*.js                                      # フリップ用JSはHTMLにインライン化される
```

### 実測済みの結果

| 項目 | 結果 |
| --- | --- |
| 本サイトの出力 | CSS のハッシュ以外バイト単位で不変 |
| `.vcf` | `file(1)` が "vCard visiting card, version 3.0" と認識。495行すべて CRLF、最長行75、`EMAIL` なし |
| QR の内容 | 生成し直して SVG のパスデータが完全一致（対照として本サイトURLでは不一致） |
| `.vcf` の MIME | workerd で `text/vcard; charset=utf-8` を確認 |
| 404 | 未マッチのパスでカスタム `404.html` を 404 ステータスで返す |
| 横はみ出し | 全幅で解消（`facesOverflowCard: false`） |
| モバイル | 320〜430px で収まる。最も狭い 320px でも 529px、iPhone SE の 568px 以内 |
| フリップ | リンクをタップしても反転しない／空白部で反転する／Escape で戻る／隠れた面は双方向でフォーカスを拒否 |

---

## 9. 未確認事項

- **iOS Safari 実機での反転** — 3.1 の対策は入れてあるが、実機で裏面が鏡像で透けないかは未確認
- **`npm audit` の既存脆弱性3件（high）** — `astro` / `esbuild` / `sharp` 由来。
  修正には Astro 7 への破壊的メジャーアップグレードが必要なため未対応
- **型チェック** — `astro check` は `@astrojs/check` と `typescript` の追加インストールが必要なため未実行。
  `astro build` はトランスパイルするだけで型検査はしない
