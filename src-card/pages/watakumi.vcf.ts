import type { APIRoute } from 'astro';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { card, CARD_REV } from '../../src/data/card';
import { links } from '../../src/data/profile';

// ============================================================
// 名刺の「連絡先を保存」で配る vCard 3.0。
// 3.0 は iOS 連絡先 / Google 連絡先 / Outlook が揃って素直に解釈できる最大公約数です。
// ※ 本サイトのポリシーどおり、メールアドレス・本名・電話番号は含めません。
//
// 注意: 静的ビルドでは endpoint が返す Response のヘッダは破棄されます。
//       Content-Type は public-card/_headers で付けています。
// ============================================================

/** vCard 3.0 のテキスト値エスケープ（RFC 2426 §5）。URL 値には適用しない */
const esc = (v: string): string =>
  v.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

/**
 * 1行75オクテット制限に合わせて折り返す（継続行の先頭は半角スペース1つ）。
 * base64 のような ASCII 専用の長い行にだけ使います
 * （日本語を含む行に使うとオクテット数と文字数がズレるため）。
 */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [line.slice(0, 75)];
  let rest = line.slice(75);
  while (rest.length > 74) {
    parts.push(rest.slice(0, 74));
    rest = rest.slice(74);
  }
  if (rest) parts.push(rest);
  return parts.join('\r\n ');
}

/**
 * アバターを base64 で埋め込む。
 * PHOTO;VALUE=URI: はiOSが取得せずGoogle連絡先もほぼ無視するため、
 * リモート参照だと写真が出ません。埋め込みが唯一確実に表示される方法です。
 * 読めなくてもビルドは壊さない（写真なしで続行）。
 */
function photoLines(): string[] {
  // astro build の cwd はリポジトリルート（Cloudflare Pages も同じ）
  for (const rel of ['public-card/avatar.png', 'public/avatar.png']) {
    try {
      const buf = readFileSync(path.resolve(rel));
      // 将来アバターが差し替わっても .vcf が肥大化しないようにガード
      if (buf.byteLength > 60_000) return [];
      return [foldLine(`PHOTO;ENCODING=b;TYPE=PNG:${buf.toString('base64')}`)];
    } catch {
      // 次の候補パスを試す
    }
  }
  return [];
}

const github = links.find((l) => l.name === 'GitHub')?.src ?? card.siteUrl;
const x = links.find((l) => l.name === 'X')?.src ?? card.siteUrl;

const lines: string[] = [
  'BEGIN:VCARD',
  'VERSION:3.0',
  // N は family;given;additional;prefix;suffix。ハンドル名のみなので given に入れる
  `N:;${esc(card.name)};;;`,
  `FN:${esc(card.name)}`,
  `NICKNAME:${esc(card.name)}`,
  `TITLE:${esc(card.role)}`,
  `ROLE:${esc(card.subrole)}`,
  `URL:${card.siteUrl}`,
  // item*.X-ABLabel は Apple のグループ化拡張。iOS でラベル付きURLとして並ぶ
  `item1.URL:${github}`,
  'item1.X-ABLabel:GitHub',
  `item2.URL:${x}`,
  'item2.X-ABLabel:X',
  `item3.URL:${card.cardUrl}`,
  'item3.X-ABLabel:Digital Card',
  // Apple 以外のクライアント向け（未知の TYPE は無視されるだけ）
  `X-SOCIALPROFILE;TYPE=github:${github}`,
  `X-SOCIALPROFILE;TYPE=twitter:${x}`,
  `NOTE:${esc(card.tagline)}`,
  ...photoLines(),
  `REV:${CARD_REV}`,
  'END:VCARD',
];

// output: 'static' では endpoint は既定でプリレンダーされます
export const GET: APIRoute = () =>
  new Response(lines.join('\r\n') + '\r\n', {
    headers: { 'Content-Type': 'text/vcard; charset=utf-8' },
  });
