// ============================================================
// 名刺ページ（https://me.watakumi.page）専用のデータ。
// 名前・肩書き・タグライン・リンクは profile.ts から取り込むので二重管理しません。
// 名刺は「在庫表」ではなく「見出し」なので、スキルは 8 つに絞っています。
// ※ 本サイトと同様、本名・メールアドレスなどの個人情報は載せていません。
// ============================================================
import { profile, links } from './profile';
import type { Link } from './profile';

export const SITE_ORIGIN = 'https://watakumi.page';
export const CARD_ORIGIN = 'https://me.watakumi.page';

/**
 * vCard の REV（最終更新）。
 * new Date() にすると毎ビルドで .vcf のバイト列が変わって差分が汚れるため、
 * あえて定数で持ちます。名刺の内容を変えたらこの日付も更新してください。
 */
export const CARD_REV = '2026-08-03T00:00:00Z';

export const card = {
  name: profile.name,
  role: profile.role,
  tagline: profile.tagline,
  /** 名刺の副題 */
  subrole: 'Tech Lead / Architect',
  /** 一番の強みを1行で（about の散文から抽出） */
  specialty: 'DDD × クリーンアーキテクチャ / AI エージェント基盤',
  avatar: '/avatar.png',
  siteUrl: SITE_ORIGIN,
  siteLabel: 'watakumi.page',
  cardUrl: CARD_ORIGIN,
  vcardPath: '/watakumi.vcf',
  vcardFileName: 'watakumi.vcf',
};

export type CardSkill = {
  name: string;
  /** チップのドット色。profile.ts の skillGroups の色をそのまま使う */
  color: string;
};

// 本サイトの skillGroups（25項目）→ 名刺の裏に収まる 8 チップへ凝縮。
// 自明なもの（JavaScript / SQL / HTML・CSS / zod）は省き、
// 近いものは併記に畳み、ツール層は落としています。
// 色: Languages #e11d48 / Frameworks #06b6d4 / Infra & Tools #8b5cf6
export const cardSkills: CardSkill[] = [
  { name: 'TypeScript', color: '#e11d48' },
  { name: 'Ruby', color: '#e11d48' },
  { name: 'Python', color: '#e11d48' },
  { name: 'Rails・NestJS', color: '#06b6d4' },
  { name: 'React・Next.js', color: '#06b6d4' },
  { name: 'LangGraph・AI Agents', color: '#06b6d4' },
  { name: 'GCP・Cloudflare', color: '#8b5cf6' },
  { name: 'Terraform・Docker', color: '#8b5cf6' },
];

/** 裏面のアイコンリンク（profile.ts の links をそのまま流用） */
export const cardIconLinks: Link[] = links;
