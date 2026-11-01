import type { RawProductProfile } from '../types/report';
import type { ProductIntroViewModel } from '../types/viewModel';
import { zhTW } from '../i18n/zh-TW';

// 報告頁最上面的「商品概要」（2026-11-01 使用者回饋）：讓保險專業讀者一眼看懂商品在做什麼。
// 資料是 import-agentdata 從 1.json 帶進來的 product_snapshot.profile；前端只整理與組句，不改寫內容。

const t = zhTW.report.intro;

/** 只有英文原文（沒有中文字）的欄位不顯示 */
const hasCjk = (s: string) => /[㐀-鿿]/.test(s);

function clean(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  // 「（分析）」是後端標註來源的註記，不給讀者看
  const s = v.replace(/（分析）/g, '').trim();
  return s && hasCjk(s) ? s : null;
}

const ageText = (v: unknown): string | null =>
  typeof v === 'number' && Number.isFinite(v) ? String(v) : typeof v === 'string' && v.trim() ? v.trim() : null;
const isDigits = (s: string) => /^\d+$/.test(s);

/** 承保年齡：「40–65 歲」「15 歲至男性78歲；女性80歲（依繳費期不同）」「0歲（最近生日年齡）至60歲（最近生日年齡）」 */
function ageRange(min: unknown, max: unknown): string | null {
  const a = ageText(min);
  const b = ageText(max);
  if (a && b) return isDigits(a) && isDigits(b) ? t.ageRange(a, b) : `${isDigits(a) ? t.age(a) : a}${t.ageTo}${isDigits(b) ? t.age(b) : b}`;
  if (a) return t.ageFrom(isDigits(a) ? t.age(a) : a);
  if (b) return t.ageUpTo(isDigits(b) ? t.age(b) : b);
  return null;
}

/** 「2025-10」「2025-12-02」→「2025 年 10 月」 */
function launchText(v: unknown): string | null {
  const m = typeof v === 'string' ? /^(\d{4})-(\d{2})/.exec(v) : null;
  return m ? t.launch(+m[1]!, +m[2]!) : null;
}

/** profile 沒有時用報告的 mechanism_summary 當主句；兩者都沒有時為 null（不顯示概要） */
export function productIntro(profile: RawProductProfile | null | undefined, fallbackMechanism: string | null): ProductIntroViewModel | null {
  const p = profile ?? {};
  const mechanism = clean(p.mechanism) ?? fallbackMechanism;
  if (!mechanism) return null;
  const facts = (
    [
      [t.facts.age, ageRange(p.issue_age_min, p.issue_age_max)],
      [t.facts.premium, clean(p.premium_mode)],
      [t.facts.period, clean(p.benefit_period)],
      [t.facts.payout, clean(p.payout_type)],
      [t.facts.launch, launchText(p.launch_date)],
    ] as Array<[string, string | null]>
  ).flatMap(([label, value]) => (value !== null ? [{ label, value }] : []));
  return {
    mechanism,
    forWhom: clean(p.target_segment),
    trigger: clean(p.trigger_condition),
    facts,
    guarantees: (Array.isArray(p.guarantees) ? p.guarantees : []).flatMap((g) => {
      const feature = clean(g?.feature);
      const value = typeof g?.value === 'string' && g.value.trim() ? g.value.trim() : null;
      return feature && value ? [{ feature, value }] : [];
    }),
    riders: (Array.isArray(p.riders) ? p.riders : []).flatMap((r) => (typeof r === 'string' && r.trim() ? [r.trim()] : [])),
  };
}
