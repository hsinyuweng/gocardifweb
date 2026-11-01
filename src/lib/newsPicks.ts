import type { FeedItemViewModel } from '../types/viewModel';
import { zhTW } from '../i18n/zh-TW';

// 重點新聞（2026-11-01 使用者回饋第二輪）：和法巴最有關、和候選商品有關的新聞放最上面。
// 比對標題與 AI 摘要的關鍵字（前端規則，不是 AI 判斷）；財產保險的項目不列。同分時新的在前。

const t = zhTW.news.pick;

interface Rule {
  re: RegExp;
  label: string;
  points: number;
}

/** 和自家公司、主力通路有關 */
const SELF_RULES: Rule[] = [
  { re: /法國巴黎|法巴|Cardif/i, label: t.self, points: 3 },
  { re: /銀保|銀行保險|銀行通路|銀.{0,3}保險經紀/, label: t.bank, points: 2 },
];

/** 和候選商品有關（依商品特性歸類，同一類只算一次） */
const PRODUCT_RULES: Rule[] = [
  { re: /長照|長期照顧|失能/, label: t.product('長照'), points: 2 },
  { re: /萬能|指數型|投資型|變額/, label: t.product('萬能壽險'), points: 2 },
  { re: /外幣|美元|日圓/, label: t.product('外幣保單'), points: 2 },
  { re: /利變|預定利率|宣告利率/, label: t.product('利率'), points: 2 },
  { re: /保單價值準備金|保單帳戶價值|死亡給付/, label: t.product('保單價值'), points: 2 },
];

const EXCLUDE = /財產保險|產險|產物/;
/** 至少要有這個分數才列 */
const MIN_POINTS = 2;
export const PICK_LIMIT = 5;

export interface NewsPick {
  item: FeedItemViewModel;
  /** 理由標籤，例如「和法巴有關」「和候選商品有關：長照」 */
  reasons: string[];
  points: number;
}

function pickOf(item: FeedItemViewModel): NewsPick | null {
  const text = `${item.title ?? ''}\n${item.summary ?? ''}`;
  if (EXCLUDE.test(text) || EXCLUDE.test(item.source ?? '')) return null;
  const hits = [...SELF_RULES, ...PRODUCT_RULES].filter((r) => r.re.test(text));
  if (hits.length === 0) return null;
  // 法規比一般新聞多 1 分：直接影響能不能賣
  const points = hits.reduce((sum, r) => sum + r.points, 0) + (item.kind === 'regulation' ? 1 : 0);
  return points >= MIN_POINTS ? { item, reasons: hits.map((r) => r.label), points } : null;
}

/** items 已是新到舊；回傳分數高到低、同分新的在前，最多 PICK_LIMIT 則 */
export function newsPicks(items: FeedItemViewModel[]): NewsPick[] {
  return items
    .map(pickOf)
    .filter((p): p is NewsPick => p !== null)
    .map((p, i) => ({ p, i }))
    .sort((a, b) => b.p.points - a.p.points || a.i - b.i)
    .slice(0, PICK_LIMIT)
    .map((x) => x.p);
}
