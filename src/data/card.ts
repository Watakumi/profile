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

export type CardSkillGroup = {
  label: string;
  /** ラベル頭のドット色。profile.ts の skillGroups の色をそのまま使う */
  color: string;
  items: string[];
};

// 本サイトの skillGroups（25項目）→ 名刺の裏に収まる分量へ凝縮。
// 自明なもの（JavaScript / SQL / HTML・CSS / zod）とツール層は省いています。
// チップを並べるだけだとドットの色が何を指すのか伝わらないため、
// カテゴリ名を左に出して「ラベル自体が凡例になる」形にしています。
export const cardSkillGroups: CardSkillGroup[] = [
  {
    label: 'Languages',
    color: '#e11d48',
    items: ['TypeScript', 'Ruby', 'Python'],
  },
  {
    label: 'Frameworks',
    color: '#06b6d4',
    items: ['Rails', 'NestJS', 'React', 'Next.js', 'LangGraph'],
  },
  {
    label: 'Infra',
    color: '#8b5cf6',
    items: ['GCP', 'Cloudflare', 'Terraform', 'Docker'],
  },
];

/** 裏面のアイコンリンク（profile.ts の links をそのまま流用） */
export const cardIconLinks: Link[] = links;
