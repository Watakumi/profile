// ============================================================
// プロフィールの中身はすべてこのファイルで管理します。
// テキスト・URL を書き換えるだけでサイトに反映されます。
// （旧サイトは外部API依存でしたが、APIごと廃止しローカル化しました）
// ============================================================

export type Link = {
  name: string;
  src: string;
};

export type SkillItem = {
  name: string;
  /** 公式サイト等。無ければリンクなしのチップになる */
  src?: string;
};

export type SkillGroup = {
  label: string;
  emoji: string;
  /** グループのアクセント色（チップのドット） */
  color: string;
  items: SkillItem[];
};

export type CareerEntry = {
  period: string;
  company: string;
  role: string;
  /** 携わった代表プロダクト（任意） */
  product?: string;
};

export type Project = {
  name: string;
  description: string;
  /** カードの絵文字アイコン */
  emoji: string;
  /** グラデーションのテーマキー（styles の gradientMap を参照） */
  theme: 'ruby' | 'astro' | 'ts' | 'react' | 'sky' | 'sun';
  src: string;
};

// ※ プライバシー配慮のため本名・生年月日などの個人情報は載せていません。
export const profile = {
  name: 'Watakumi',
  role: 'Web Developer',
  tagline: 'I wanna develop simple, fun apps!',
};

// 職務要約（公開向けに要約）
export const about =
  'Webアプリの設計から実装・運用までを一貫して担うエンジニアです。クリーンアーキテクチャとDDDを軸に長期保守に耐える構造を組み、デザイン起点のUX設計からフロントの実装まで通して手がけます。直近は教育機関向けSaaSのテックリードとして、マルチテナント基盤・AIエージェント基盤・開発プロセス整備を主導しています。';

export const skillGroups: SkillGroup[] = [
  {
    label: 'Languages',
    emoji: '💎',
    color: '#e11d48',
    items: [
      { name: 'Ruby', src: 'https://www.ruby-lang.org/ja/' },
      { name: 'JavaScript', src: 'https://developer.mozilla.org/ja/docs/Web/JavaScript' },
      { name: 'TypeScript', src: 'https://www.typescriptlang.org/' },
      { name: 'Python', src: 'https://www.python.org/' },
      { name: 'SQL' },
      { name: 'HTML / CSS' },
    ],
  },
  {
    label: 'Frameworks',
    emoji: '🛠️',
    color: '#06b6d4',
    items: [
      { name: 'Ruby on Rails', src: 'https://rubyonrails.org/' },
      { name: 'NestJS', src: 'https://nestjs.com/' },
      { name: 'React', src: 'https://react.dev/' },
      { name: 'Next.js', src: 'https://nextjs.org/' },
      { name: 'Hono', src: 'https://hono.dev/' },
      { name: 'TanStack Query', src: 'https://tanstack.com/query' },
      { name: 'Jotai', src: 'https://jotai.org/' },
      { name: 'Tailwind CSS', src: 'https://tailwindcss.com/' },
      { name: 'LangChain / LangGraph', src: 'https://www.langchain.com/' },
      { name: 'zod', src: 'https://zod.dev/' },
      { name: 'Storybook', src: 'https://storybook.js.org/' },
    ],
  },
  {
    label: 'Infra & Tools',
    emoji: '☁️',
    color: '#8b5cf6',
    items: [
      { name: 'GCP', src: 'https://cloud.google.com/' },
      { name: 'Vertex AI (Gemini)', src: 'https://cloud.google.com/vertex-ai' },
      { name: 'Cloudflare', src: 'https://www.cloudflare.com/' },
      { name: 'Docker', src: 'https://www.docker.com/' },
      { name: 'Terraform', src: 'https://www.terraform.io/' },
      { name: 'GitHub Actions', src: 'https://github.com/features/actions' },
      { name: 'Turborepo', src: 'https://turbo.build/' },
      { name: 'Prisma + MySQL', src: 'https://www.prisma.io/' },
    ],
  },
];

// 経歴（会社・役割・期間。個人情報は含めない）
export const career: CareerEntry[] = [
  {
    period: '2023 – 現在',
    company: '株式会社EduTopia',
    role: 'テックリード / アーキテクト / フルスタック・AIエンジニア',
    product: '教育機関向け事案管理SaaS',
  },
  {
    period: '2023',
    company: 'フリーランス',
    role: '開発ディレクション / コーディング',
    product: '東京ドームシティ クイズラリーアプリ「記録の石板」',
  },
  {
    period: '2022 – 2023',
    company: 'freeeサイン株式会社（旧サイトビジット）',
    role: 'エンジニアリングマネージャー',
    product: '電子契約サービス freeeサイン',
  },
  {
    period: '2021 – 2022',
    company: '株式会社サイトビジット',
    role: 'エンジニア / チームリーダー',
    product: '電子契約サービス',
  },
  {
    period: '2020 – 2021',
    company: '株式会社サイトビジット',
    role: 'エンジニア / チームリーダー',
    product: '資格スクエア（オンライン通信講座）',
  },
];

// 公開URLが確定しているものだけ実URLを入れています。
// "#" のものは公開後に URL を差し替えてください。
export const projects: Project[] = [
  {
    name: 'パケる',
    description: '手持ちの写真を、おもちゃのブリスターパックやお菓子パウチ風のパッケージ画像に。',
    emoji: '📦',
    theme: 'ts',
    src: 'https://pakeru.app',
  },
  {
    name: '短歌ポストカードメーカー',
    description: '写真に短歌を美しく重ねて、絵葉書やSNS画像を書き出せるブラウザ完結ツール。',
    emoji: '📮',
    theme: 'sun',
    src: 'https://utae.app/',
  },
  {
    name: '命名書メーカー',
    description: 'お子さまの名前・生年月日から、和の命名書を縦書きで美しく作成し画像化。',
    emoji: '🖌️',
    theme: 'ruby',
    src: 'https://nazuke.app/',
  },
];

export const links: Link[] = [
  { name: 'GitHub', src: 'https://github.com/Watakumi' },
  { name: 'X', src: 'https://x.com/Watadayooo__' },
];
