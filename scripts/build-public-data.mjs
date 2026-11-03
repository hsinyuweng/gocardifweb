#!/usr/bin/env node
// 把後端整包輸出（agentdata）轉成網站資料，直接寫進網站的 public/data/。單一檔案、只用 Node.js 內建模組（Node 18 以上）。
//
// 用法：node build-public-data.mjs --from <agentdata 資料夾> --out <網站 public 資料夾>
//   例：node build-public-data.mjs --from ./agentdata --out ./public
//   產出（整批換新，舊的報告會被刪掉）：
//     <out>/data/feed.json                 新聞與法規
//     <out>/data/market-pulse.json         市場脈動
//     <out>/data/reports/<report_id>.json  每份商品報告
//     <out>/data/reports/index.json        報告清單
//   <out> 底下其他檔案（config.json 等）不動。
//
// 讀（agentdata 結構）：
//   <商品 id>/3.json                                 統整報告（必要；沒有就略過該商品）
//   <商品 id>/1.json                                 商品原始資料：補報告漏填的發行公司、國家、幣別、繳費方式、原始資料連結、商品概要
//   news-monitor-work/news-regulatory-monitor.json  → feed.json
//   market-pulse.json                               → market-pulse.json
//   market-pulse-work/output/pulse.json             → 補同業排名、新契約保費金額、10 年債日資料、各險別金額
// 後端日後直接交這些欄位時，這裡的補充會自動跳過（有值就不覆蓋）。
//
// 安全：所有資料先在記憶體轉換、驗證；有任何報告 report_id 重複或一份報告都沒有時，停止且不改動 <out>。
// 結束代碼：0 成功；1 失敗（public 未被改動）。

import { mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

// ───────────────────────── 設定 ─────────────────────────

/**
 * 不匯入的商品資料夾（資料夾名稱 → 原因）。同一商品有兩份報告時在這裡選定一份。
 * 2026-10-31：CareScout 兩份平行執行、結論不同，先用 61187f98，待後端確認哪份為準後修改。
 */
const SKIP = {
  'aacd2f35-e52a-4085-aa6b-5fb616eb1167': 'CareScout 重複（使用 61187f98）',
};

/**
 * 法巴歷年市占率（使用者手動從「法巴_23-25市占率.pdf」抄錄，後端沒有這份資料）。
 * 轉成市場脈動指標 self_market_share_history（只用「合計・初年度」）。有新年度時在這裡加。單位 %。
 */
const SELF_MARKET_SHARE = {
  source: '法國巴黎人壽',
  unit: '%',
  years: [2023, 2024, 2025],
  first_year_total: [2.28, 4.02, 4.6],
};

// ───────────────────────── 共用 ─────────────────────────

const isObject = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);
const orNull = (v) => (v === undefined ? null : v);
const text = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null);
const textOrNum = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : text(v));
const textList = (v) => (Array.isArray(v) ? v.map(text).filter((x) => x !== null) : []);
const round = (v, d) => Math.round(v * 10 ** d) / 10 ** d;
const toJson = (data) => `${JSON.stringify(data, null, 2)}\n`;

function parseArgs(argv) {
  const get = (flag) => {
    const i = argv.indexOf(flag);
    if (i === -1) return null;
    const v = argv[i + 1];
    if (!v || v.startsWith('--')) fail(`${flag} 後面需要接資料夾路徑`);
    return path.resolve(process.cwd(), v);
  };
  const from = get('--from');
  const out = get('--out');
  if (!from || !out) fail('用法：node build-public-data.mjs --from <agentdata 資料夾> --out <網站 public 資料夾>');
  return { from, out };
}

function fail(message) {
  console.error(`錯誤：${message}`);
  process.exit(1);
}

async function readJsonOrNull(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') return null;
    throw new Error(`${file} 不是合法的 JSON（${e.message}）`);
  }
}

// ───────────────────────── 商品報告 ─────────────────────────

/** 1.json 的 core.source_documents → 網站用的原始資料清單（只留有網址的） */
function sourceDocuments(one) {
  const docs = isObject(one?.core) && Array.isArray(one.core.source_documents) ? one.core.source_documents : [];
  return docs
    .filter((d) => isObject(d) && typeof d.url === 'string' && /^https?:\/\//.test(d.url))
    .map((d) => ({
      title: d.title ?? null,
      type: d.type ?? null,
      url: d.url,
      publication_date: d.publication_date ?? null,
    }));
}

/** 統整報告漏填的基本資料，用 1.json 的原始資料補（報告有值就不動） */
function fillSnapshot(snap, one) {
  const core = isObject(one?.core) ? one.core : {};
  const from = {
    issuer: core.source_market?.insurer_name,
    country: core.source_market?.country,
    currency: core.product_classification?.currency_denomination,
    premium_mode: core.mechanism?.premium_payment_mode,
  };
  for (const [k, v] of Object.entries(from)) {
    if ((snap[k] === null || snap[k] === undefined || snap[k] === '') && typeof v === 'string' && v.trim()) snap[k] = v.trim();
  }
}

/** 報告頁「商品概要」用的商品資料：從 1.json 搬原文，組句在網站前端。 */
function productProfile(one) {
  if (!isObject(one?.core)) return null;
  const core = one.core;
  const risk = one['for_塗_發生率暨獲利調查'] ?? {};
  const legal = one['for_孫_法規']?.compliance_key_attributes ?? {};
  const profile = {
    launch_date: text(core.source_market?.launch_date),
    mechanism: text(core.mechanism?.summary),
    target_segment: text(core.target_customer_analysis?.primary_segment),
    issue_age_min: textOrNum(legal.min_insured_age),
    issue_age_max: textOrNum(legal.max_insured_age),
    premium_mode: text(core.mechanism?.premium_payment_mode),
    benefit_period: text(core.mechanism?.benefit_period),
    payout_type: text(risk.benefit_payout_type),
    trigger_condition: text(risk.underlying_risk_coverage?.trigger_condition),
    guarantees: (Array.isArray(core.mechanism?.guarantee_features) ? core.mechanism.guarantee_features : [])
      .filter(isObject)
      .map((g) => ({ feature: text(g.feature), value: text(g.value) }))
      .filter((g) => g.feature && g.value),
    riders: textList(core.mechanism?.riders_available),
  };
  return profile.mechanism || profile.target_segment ? profile : null;
}

/** 同一商品（原文名稱＋發行公司）判斷用 */
function productKey(one) {
  const core = isObject(one?.core) ? one.core : {};
  return `${core.product_name?.original ?? ''}|${core.source_market?.insurer_name ?? ''}`;
}

/** report_id 會成為檔名：不允許路徑字元，也不可與 index.json 撞名 */
function isSafeId(id) {
  return id !== '' && id !== 'index' && !id.includes('/') && !id.includes('\\') && !id.includes('..');
}

/** 報告清單的一列（網站競品研究頁、追蹤清單用）；缺欄位填 null，計數缺少時填 0 */
function toIndexEntry(report) {
  const meta = isObject(report.report_meta) ? report.report_meta : {};
  const snap = isObject(report.product_snapshot) ? report.product_snapshot : {};
  const head = isObject(report.headline) ? report.headline : {};
  const sc = isObject(report.scorecard) ? report.scorecard : {};
  const md = isObject(sc.market_demand) ? sc.market_demand : {};
  const ac = isObject(sc.actuarial) ? sc.actuarial : {};
  const rg = isObject(sc.regulatory) ? sc.regulatory : {};
  const blockers = Array.isArray(report.blockers) ? report.blockers : [];
  const countSeverity = (s) => blockers.filter((b) => isObject(b) && b.severity === s).length;
  const cc = isObject(report.sections?.market_demand?.competitor_comparison) ? report.sections.market_demand.competitor_comparison : null;
  const competitors = Array.isArray(cc?.competitors) ? cc.competitors.filter(isObject) : null;
  const topBlocker = ['critical', 'blocking'].flatMap((s) => blockers.filter((b) => isObject(b) && b.severity === s))[0];

  return {
    report_id: orNull(meta.report_id),
    name: orNull(snap.name),
    issuer: orNull(snap.issuer),
    country: orNull(snap.country),
    category: orNull(snap.category),
    recommendation: orNull(head.recommendation),
    label: orNull(head.label),
    signal_color: orNull(head.signal_color),
    generated_date: orNull(meta.generated_date),
    generated_at: orNull(meta.generated_at),
    dimension_scores: isObject(report.dimension_scores) ? report.dimension_scores : null,
    module_summary: {
      market_demand: { signal: orNull(md.signal), text: orNull(md.label) },
      actuarial: { signal: orNull(ac.signal), research_status: orNull(ac.research_status) },
      regulatory: { signal: orNull(rg.signal), overall_verdict: orNull(rg.overall_verdict) },
    },
    blocker_counts: {
      critical: countSeverity('critical'),
      blocking: countSeverity('blocking'),
      warning: countSeverity('warning'),
    },
    direct_competitor_count: competitors ? competitors.filter((c) => c.is_direct === true).length : null,
    top_blocker: topBlocker ? orNull(topBlocker.title) : null,
  };
}

/** 讀所有商品資料夾 → [{ id, report }]（已補欄位、已驗證） */
async function buildReports(fromDir) {
  const entries = await readdir(fromDir, { withFileTypes: true });
  const seen = new Map();
  const reports = [];
  for (const dir of entries.filter((e) => e.isDirectory()).map((e) => e.name).sort()) {
    const report = await readJsonOrNull(path.join(fromDir, dir, '3.json'));
    if (report === null) {
      // 不是商品資料夾（enrichscript 等）或統整沒有產出報告
      if (await readJsonOrNull(path.join(fromDir, dir, '1.json'))) console.warn(`  略過 ${dir}：沒有 3.json（統整未完成）`);
      continue;
    }
    if (dir in SKIP) {
      console.warn(`  略過 ${dir}：${SKIP[dir]}`);
      continue;
    }
    const meta = isObject(report) && isObject(report.report_meta) ? report.report_meta : null;
    const id = meta?.report_id;
    if (typeof id !== 'string') {
      console.warn(`  略過 ${dir}：3.json 缺少 report_meta.report_id`);
      continue;
    }
    if (typeof meta.schema_version !== 'string' || !meta.schema_version.startsWith('1.')) {
      console.warn(`  略過 ${dir}：schema_version 為 ${JSON.stringify(meta.schema_version ?? null)}，不是 1.x`);
      continue;
    }
    if (!isSafeId(id)) {
      console.warn(`  略過 ${dir}：report_id「${id}」含有不允許的字元`);
      continue;
    }

    const one = await readJsonOrNull(path.join(fromDir, dir, '1.json'));
    const key = productKey(one);
    if (one && seen.has(key)) console.warn(`  注意：${dir} 與 ${seen.get(key)} 是同一商品，兩份都會上網站；請在本檔的 SKIP 選定一份`);
    seen.set(key, dir);

    const snap = isObject(report.product_snapshot) ? report.product_snapshot : (report.product_snapshot = {});
    fillSnapshot(snap, one);
    if (!Array.isArray(snap.source_documents)) {
      const docs = sourceDocuments(one);
      if (docs.length > 0) snap.source_documents = docs;
    }
    if (!isObject(snap.profile)) {
      const profile = productProfile(one);
      if (profile) snap.profile = profile;
    }
    reports.push({ id, dir, report });
  }

  const byId = new Map();
  for (const r of reports) byId.set(r.id, [...(byId.get(r.id) ?? []), r.dir]);
  const dups = [...byId.entries()].filter(([, dirs]) => dirs.length > 1);
  if (dups.length > 0) fail(`report_id 重複，未改動網站資料：${dups.map(([id, dirs]) => `${id}（${dirs.join('、')}）`).join('；')}`);
  return reports;
}

// ───────────────────────── 市場脈動 ─────────────────────────

/** 「2026-08」→「2026-08-31」；其他格式照原文 */
function monthEnd(period) {
  const m = /^(\d{4})-(\d{2})$/.exec(period ?? '');
  if (!m) return period ?? null;
  const last = new Date(Date.UTC(+m[1], +m[2], 0)).getUTCDate();
  return `${m[1]}-${m[2]}-${String(last).padStart(2, '0')}`;
}

/** pulse.json 的一個指標（status ok、有 series），沒有時為 null */
function pulseIndicator(pulse, key) {
  const ind = isObject(pulse?.indicators) ? pulse.indicators[key] : null;
  return isObject(ind) && ind.status === 'ok' && Array.isArray(ind.series) ? ind : null;
}

/** 單線趨勢的最新值與變化（change_pct：比上一期的百分比；pp 時為差值） */
function trendTail(series, unit) {
  const last = series.at(-1)?.value ?? null;
  const prev = series.at(-2)?.value ?? null;
  let change = null;
  if (last !== null && prev !== null) change = unit === 'pp' ? round(last - prev, 4) : prev !== 0 ? round((last / prev - 1) * 100, 2) : null;
  return { latest_value: last, change_pct: change };
}

/** pulse.json 的 company_ranking → ranking 指標 */
function rankingMetric(pulse, metrics) {
  const ind = isObject(pulse?.indicators) ? pulse.indicators.company_ranking : null;
  if (!isObject(ind) || ind.status !== 'ok' || !Array.isArray(ind.series)) return null;
  const latest = ind.series.at(-1);
  if (!isObject(latest) || !Array.isArray(latest.rows) || latest.rows.length === 0) return null;
  const sibling = metrics.find((m) => isObject(m) && m.source_url === ind.source_url);
  return {
    key: 'company_ranking',
    group: 'brand',
    type: 'ranking',
    label: '同業新契約保費市占率排名（當年1月起累計）',
    unit: '%',
    period: latest.period ?? null,
    rows: latest.rows.map((r) => ({
      name: r.company ?? null,
      value: r.share_pct ?? null,
      rank: r.rank ?? null,
      is_self: r.is_self === true,
    })),
    source: sibling?.source ?? null,
    source_url: ind.source_url ?? null,
    as_of: monthEnd(latest.period),
    stale: sibling?.stale === true,
  };
}

/** pulse.json 的 new_premium_total（億元）→ new_premium_amount（新台幣元，月資料） */
function premiumAmountMetric(pulse, metrics) {
  const ind = pulseIndicator(pulse, 'new_premium_total');
  if (!ind) return null;
  const series = ind.series.flatMap((p) =>
    typeof p?.values?.total === 'number' ? [{ period: p.period ?? null, value: Math.round(p.values.total * 100_000_000) }] : [],
  );
  if (series.length === 0) return null;
  const sibling = metrics.find((m) => isObject(m) && m.source_url === ind.source_url);
  return {
    key: 'new_premium_amount',
    group: 'growth',
    type: 'trend',
    label: '新契約保費',
    source: sibling?.source ?? null,
    source_url: ind.source_url ?? null,
    as_of: monthEnd(series.at(-1).period),
    stale: sibling?.stale === true,
    unit: '新台幣元',
    ...trendTail(series, 'pct'),
    change_unit: 'pct',
    change_label: '較上月',
    series,
  };
}

/** pulse.json 的 gov_bond_yield_10y（日資料）→ tw_10y_yield_daily */
function dailyYieldMetric(pulse, metrics) {
  const ind = pulseIndicator(pulse, 'gov_bond_yield_10y');
  if (!ind) return null;
  const series = ind.series.flatMap((p) =>
    typeof p?.values?.yield_pct === 'number' && /^\d{4}-\d{2}-\d{2}$/.test(p.period ?? '')
      ? [{ period: p.period, value: round(p.values.yield_pct, 4) }]
      : [],
  );
  if (series.length === 0) return null;
  const weekly = metrics.find((m) => isObject(m) && m.key === 'tw_10y_yield');
  return {
    key: 'tw_10y_yield_daily',
    group: 'pricing',
    type: 'trend',
    label: weekly?.label ?? '10年期公債殖利率',
    source: weekly?.source ?? null,
    source_url: ind.source_url ?? weekly?.source_url ?? null,
    as_of: series.at(-1).period,
    featured: weekly?.featured === true,
    unit: '%',
    ...trendTail(series, 'pp'),
    change_unit: 'pp',
    change_label: '較前一交易日',
    series,
  };
}

/** product_mix 每個 part 補 amount_ntd（新台幣元；pulse.json 的 new_premium_by_type，依險別名稱對應） */
function fillProductMixAmounts(pulse, metrics) {
  const ind = pulseIndicator(pulse, 'new_premium_by_type');
  const mix = metrics.find((m) => isObject(m) && m.key === 'product_mix' && Array.isArray(m.periods));
  if (!ind || !mix || !isObject(ind.series_labels)) return 0;
  const keyOf = new Map(Object.entries(ind.series_labels).map(([k, name]) => [name, k]));
  let filled = 0;
  for (const p of mix.periods) {
    const src = ind.series.find((s) => s?.period === p?.period);
    if (!src || !Array.isArray(p.parts)) continue;
    for (const part of p.parts) {
      if (!isObject(part) || 'amount_ntd' in part) continue;
      const v = src.values?.[keyOf.get(part.name)];
      part.amount_ntd = typeof v === 'number' ? Math.round(v * 100_000_000) : null;
      if (part.amount_ntd !== null) filled += 1;
    }
  }
  return filled;
}

/** 由 pulse.json 補上 market-pulse.json 沒有的指標（已有同 key 就不補） */
function fillFromPulse(pulse, market) {
  const metrics = market.metrics;
  const has = (key) => metrics.some((m) => isObject(m) && m.key === key);
  const added = [];
  if (!metrics.some((m) => isObject(m) && m.type === 'ranking')) {
    const ranking = rankingMetric(pulse, metrics);
    if (ranking) {
      metrics.push(ranking);
      added.push(`同業排名（${ranking.period}，${ranking.rows.length} 家）`);
    }
  }
  if (!has('new_premium_amount')) {
    const amount = premiumAmountMetric(pulse, metrics);
    if (amount) {
      const at = metrics.findIndex((m) => isObject(m) && m.key === 'new_premium_yoy');
      metrics.splice(at === -1 ? metrics.length : at + 1, 0, amount);
      added.push(`新契約保費金額（${amount.series.length} 個月）`);
    }
  }
  if (!has('tw_10y_yield_daily')) {
    const daily = dailyYieldMetric(pulse, metrics);
    if (daily) {
      const at = metrics.findIndex((m) => isObject(m) && m.key === 'tw_10y_yield');
      metrics.splice(at === -1 ? metrics.length : at, 0, daily);
      added.push(`10 年債日資料（${daily.series.length} 天）`);
    }
  }
  const filled = fillProductMixAmounts(pulse, metrics);
  if (filled > 0) added.push(`各險別金額（${filled} 筆）`);
  if (added.length > 0) console.log(`  市場脈動：由 pulse.json 補上${added.join('、')}`);
}

/** SELF_MARKET_SHARE → self_market_share_history 指標（已有同 key 就不補） */
function selfShareHistoryMetric(metrics) {
  if (metrics.some((m) => isObject(m) && m.key === 'self_market_share_history')) return null;
  const { years, first_year_total: values } = SELF_MARKET_SHARE;
  if (years.length === 0 || values.length !== years.length) return null;
  const series = years.map((y, i) => ({ period: String(y), value: values[i] }));
  return {
    key: 'self_market_share_history',
    group: 'brand',
    type: 'trend',
    label: '法巴初年度保費市占率',
    source: SELF_MARKET_SHARE.source,
    source_url: null,
    as_of: `${years.at(-1)}-12-31`,
    unit: SELF_MARKET_SHARE.unit,
    latest_value: values.at(-1),
    change_pct: null,
    change_unit: 'pp',
    change_label: null,
    series,
  };
}

/** → { feed, market }（沒有來源檔時為 null，網站沿用舊檔） */
async function buildMarket(fromDir) {
  let feed = await readJsonOrNull(path.join(fromDir, 'news-monitor-work', 'news-regulatory-monitor.json'));
  if (feed === null) console.warn('  沒有 news-monitor-work/news-regulatory-monitor.json，新聞沿用舊檔');
  else if (!isObject(feed) || !Array.isArray(feed.items)) {
    console.warn('  news-regulatory-monitor.json 缺少 items 陣列，新聞沿用舊檔');
    feed = null;
  }

  const market = await readJsonOrNull(path.join(fromDir, 'market-pulse.json'));
  if (market === null) {
    console.warn('  沒有 market-pulse.json，市場脈動沿用舊檔');
    return { feed, market: null };
  }
  if (!isObject(market)) {
    console.warn('  market-pulse.json 不是 JSON 物件，市場脈動沿用舊檔');
    return { feed, market: null };
  }
  if (!Array.isArray(market.metrics)) market.metrics = [];
  const pulse = await readJsonOrNull(path.join(fromDir, 'market-pulse-work', 'output', 'pulse.json'));
  if (pulse) fillFromPulse(pulse, market);
  const history = selfShareHistoryMetric(market.metrics);
  if (history) {
    market.metrics.push(history);
    console.log(`  市場脈動：補上法巴歷年市占率（${history.series.length} 年）`);
  }
  return { feed, market };
}

// ───────────────────────── 寫入 ─────────────────────────

/** 先寫到 data/reports 旁的暫存資料夾，全部寫完再換掉舊的 reports（中途失敗不會留下半套） */
async function writeOutput(outDir, reports, { feed, market }) {
  const dataDir = path.join(outDir, 'data');
  const reportsDir = path.join(dataDir, 'reports');
  const tmpDir = path.join(dataDir, `.reports-tmp-${process.pid}`);
  await mkdir(tmpDir, { recursive: true });
  try {
    for (const { id, report } of reports) await writeFile(path.join(tmpDir, `${id}.json`), toJson(report), 'utf8');
    const index = { generated_at: new Date().toISOString(), reports: reports.map((r) => toIndexEntry(r.report)) };
    await writeFile(path.join(tmpDir, 'index.json'), toJson(index), 'utf8');
    if (feed) await writeFile(path.join(dataDir, 'feed.json.tmp'), toJson(feed), 'utf8');
    if (market) await writeFile(path.join(dataDir, 'market-pulse.json.tmp'), toJson(market), 'utf8');
  } catch (e) {
    await rm(tmpDir, { recursive: true, force: true });
    throw e;
  }
  await rm(reportsDir, { recursive: true, force: true });
  await rename(tmpDir, reportsDir);
  if (feed) await rename(path.join(dataDir, 'feed.json.tmp'), path.join(dataDir, 'feed.json'));
  if (market) await rename(path.join(dataDir, 'market-pulse.json.tmp'), path.join(dataDir, 'market-pulse.json'));
}

// ───────────────────────── 主程式 ─────────────────────────

const { from, out } = parseArgs(process.argv.slice(2));
try {
  await readdir(from);
} catch {
  fail(`找不到後端資料夾 ${from}`);
}
console.log(`轉換：${from} → ${path.join(out, 'data')}`);
try {
  const reports = await buildReports(from);
  if (reports.length === 0) fail('一份報告都沒有，未改動網站資料');
  const market = await buildMarket(from);
  await writeOutput(out, reports, market);
  console.log(
    `完成：報告 ${reports.length} 份${market.feed ? '、feed.json' : ''}${market.market ? '、market-pulse.json' : ''} 已寫入 ${path.join(out, 'data')}`,
  );
} catch (e) {
  fail(e.message);
}
