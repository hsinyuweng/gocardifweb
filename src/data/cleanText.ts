import type { Report } from '../types/report';
import type { ReportIndex } from '../types/reportIndex';

// 後端文字清理（2026-10-31 使用者要求：格式錯位、內部代號、組員姓氏等不該出現在網頁上的東西，直接處理）。
// 只在讀進來時清理畫面用的複本，原始 JSON 不改（規格 0.5 的例外記在 decisions/deviations.md）。
// 規則：組員姓氏括號拿掉；內部引用（source_ref、模組:欄位路徑）拿掉；英文欄位名換中文；
// 法規項目代號（G-RATE-01）在句子裡換成項目名稱、在標題開頭拿掉；處理過程註記（data_quality.notes）不顯示。

/** 不清理的欄位：代號、網址、列舉值（畫面另外對照成中文） */
const KEEP_KEYS = new Set([
  'report_id', 'id', 'item_id', 'url', 'source_url', 'source_ref', 'schema_version', 'format_variant', 'status',
  'signal', 'signal_color', 'recommendation', 'severity', 'light', 'level', 'module', 'source_module', 'kind',
  'domain', 'evidence_scheme', 'evidence_level', 'basis', 'unit', 'scale', 'method_version', 'research_status',
  'color', 'key', 'type', 'group', 'change_unit', 'period', 'as_of', 'generated_date', 'generated_at',
  'review_date', 'publication_date', 'published_at', 'dimensions',
]);

const MODULE_LABELS: Record<string, string> = { market_demand: '市場需求', actuarial: '發生率暨獲利調查', regulatory: '法規適用' };

/** 欄位名 → 中文（路徑取最後一段；description 接在上一段後面） */
const FIELD_LABELS: Record<string, string> = {
  guaranteed_return_rate: '保證回報率',
  pricing_interest_rate: '定價預定利率',
  dividend_mechanism: '分紅機制',
  has_dividend: '是否分紅',
  minor_death_benefit_type: '未成年身故給付方式',
  min_insured_age: '最低投保年齡',
  max_insured_age: '最高投保年齡',
  contract_terms: '契約條款',
  suicide_clause: '自殺條款',
  incontestability_clause: '不可抗辯條款',
  free_look_period: '猶豫期',
  policy_loan: '保單借款',
  surrender_value: '解約金',
  investment_linked_details: '投資連結細節',
  sales_channel_and_commission: '通路與佣金',
  beneficiary_and_consent_structure: '受益人與同意結構',
  pricing_implication_flags: '定價提示',
  product_classification: '商品分類',
  currency_denomination: '計價幣別',
  target_audience_source_market: '原市場目標客群',
  age_range: '年齡範圍',
  underlying_risk_coverage: '承保風險',
  trigger_condition: '給付條件',
  exclusions_summary: '除外責任',
  waiting_period: '等待期',
  market_sizing: '市場規模',
  calculation_notes: '市場規模計算說明',
  taiwan_version_currency: '臺灣版幣別',
  incidence_rate_references: '發生率參考資料',
  incidence_rate_gap: '發生率差距',
  comparability_assessment: '可比性評估',
  missing_inputs: '缺漏資料',
  market_growth: '市場成長',
  market_size: '市場規模',
  consumer_pain_points: '消費者痛點',
  data_gaps: '資料缺口',
  premium_payment_mode: '繳費方式',
  benefit_period: '保障期間',
  compliance_key_attributes: '合規屬性',
  sufficient_evidence: '證據充分',
  age_limit: '年齡限制',
  product_id: '商品編號',
  confidence: '信心',
  verdict: '需求結論',
};

/** 路徑裡只當前綴、不翻譯的段落 */
const PREFIX_SEGMENTS = new Set(['core', 'compliance_key_attributes', 'verified', 'sections']);

const MARK = '\u0000';
const mark = (s: string) => `${MARK}${s}${MARK}`;

function translatePath(path: string): string | null {
  const segs = path.split('.').filter((s) => !s.startsWith('for_'));
  if (segs.length === 0) return null;
  if (segs.join('.') === 'verdict.confidence') return '需求結論信心';
  const body = segs.length > 1 ? segs.filter((s, i) => i === segs.length - 1 || !PREFIX_SEGMENTS.has(s)) : segs;
  if (!body.every((s) => s === 'description' || s in FIELD_LABELS)) return null;
  const last = body.at(-1)!;
  if (last === 'description') return body.length > 1 ? `${FIELD_LABELS[body.at(-2)!]}說明` : null;
  return FIELD_LABELS[last]!;
}

const CODE = /\b[A-Z]{1,5}(?:-[A-Z]{1,5})?-\d{2}\b/g;

/** 一段文字的清理；codes：本報告的法規項目代號 → 項目名稱 */
export function cleanText(text: string, codes: Map<string, string> = new Map()): string {
  let s = text
    // 組員姓氏
    .replace(/[（(][翁塗孫顏][）)]/g, '')
    // 內部引用：「；source_ref：…」到句尾、「（market_demand:market_growth[1]；…）」
    .replace(/\s*[；;，,]?\s*source_ref\s*[:：][^。]*/g, '')
    .replace(/[（(][^（）()]*\b(?:market_demand|actuarial|regulatory)\s*:[^（）()]*[）)]/g, '')
    // 「actuarial:pricing_implication_flags」→ 欄位名
    .replace(/\b(?:market_demand|actuarial|regulatory)\s*:\s*([A-Za-z_][\w.]*)(?:\[[^\]]*\])?/g, (m, p: string) => {
      const label = translatePath(p);
      return label ? mark(label) : m;
    })
    // 模組代號 → 模組名稱
    .replace(/\b(market_demand|actuarial|regulatory)\b/g, (_, k: string) => mark(MODULE_LABELS[k]!))
    // 欄位路徑、底線欄位名
    .replace(/(?:for_\S+?\.)?[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)+|\b[a-z]+(?:_[a-z]+)+\b/g, (m) => {
      const label = translatePath(m);
      return label ? mark(label) : m;
    })
    .replace(/\bmechanism\b/g, mark('商品機制'))
    .replace(/risk\/disease/g, mark('承保風險／疾病'))
    .replace(/上游輸入的?/g, '原始商品資料的')
    .replace(/三份上游\s*JSON/g, '三個面向的資料')
    .replace(/上游/g, '原始商品資料')
    .replace(/為\s*null/g, '為空')
    .replace(/\bnull\b/g, '空值')
    .replace(/[（(]開啟新視窗[）)]/g, '');
  // 法規項目代號：句子裡換成「項目名稱」（找不到名稱就保留）
  s = s.replace(CODE, (c) => (codes.has(c) ? mark(`「${codes.get(c)}」`) : c));
  // 換上中文後，去掉它旁邊多出來的空白
  return s.replace(new RegExp(`\\s*${MARK}\\s*`, 'g'), '').replace(/\s{2,}/g, ' ').trim();
}

function deepClean<T>(value: T, codes: Map<string, string>, key: string | null = null): T {
  if (typeof value === 'string') return (key !== null && KEEP_KEYS.has(key) ? value : cleanText(value, codes)) as T;
  if (Array.isArray(value)) return value.map((v) => deepClean(v, codes, key)) as T;
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, deepClean(v, codes, k)])) as T;
  }
  return value;
}

/** 標題開頭的代號拿掉：「G-RATE-01：保證回報率…」→「保證回報率…」 */
const stripLeadingCode = (s: unknown) => (typeof s === 'string' ? s.replace(/^\s*[A-Z]{1,5}(?:-[A-Z]{1,5})?-\d{2}\s*[：:]\s*/, '') : s);

/** 來源文字裡夾著網址（「經濟日報轉述：https://…」）：網址移到網址欄（原本沒有時），文字只留名稱 */
function splitSourceUrl<T extends { source?: unknown; source_url?: unknown }>(o: T | null | undefined): T | null | undefined {
  if (!o || typeof o.source !== 'string') return o;
  const m = /\s*[：:]?\s*(https?:\/\/\S+)\s*$/.exec(o.source);
  if (!m) return o;
  return { ...o, source: o.source.slice(0, m.index), source_url: o.source_url || m[1] };
}

export function cleanReport(r: Report): Report {
  const codes = new Map<string, string>();
  for (const f of r.sections?.regulatory?.findings ?? []) {
    if (f?.item_id && f.title) codes.set(f.item_id, f.title.replace(/[（(][翁塗孫顏][）)]/g, ''));
  }
  const blockers = r.blockers?.map((b) => (b ? { ...b, title: stripLeadingCode(b.title) as typeof b.title } : b));
  const sections = r.sections && {
    ...r.sections,
    market_demand: r.sections.market_demand && { ...r.sections.market_demand, key_points: r.sections.market_demand.key_points?.map(splitSourceUrl) },
    actuarial: r.sections.actuarial && { ...r.sections.actuarial, key_points: r.sections.actuarial.key_points?.map(splitSourceUrl) },
  };
  const ds = r.dimension_scores;
  const dimension_scores = ds && {
    ...ds,
    market_size: splitSourceUrl(ds.market_size),
    market_growth: splitSourceUrl(ds.market_growth),
    feasibility: splitSourceUrl(ds.feasibility),
  };
  const out = deepClean({ ...r, blockers, sections, dimension_scores } as Report, codes);
  // 處理過程註記（單位判讀、未改寫上游結論等）不顯示
  if (out.data_quality) out.data_quality = { ...out.data_quality, notes: [] };
  return out;
}

export function cleanReportIndex(index: ReportIndex): ReportIndex {
  const reports = index.reports.map((e) => {
    const ds = e?.dimension_scores;
    if (!ds) return e;
    return {
      ...e,
      dimension_scores: {
        ...ds,
        market_size: splitSourceUrl(ds.market_size),
        market_growth: splitSourceUrl(ds.market_growth),
        feasibility: splitSourceUrl(ds.feasibility),
      },
    };
  });
  return deepClean({ ...index, reports }, new Map());
}
