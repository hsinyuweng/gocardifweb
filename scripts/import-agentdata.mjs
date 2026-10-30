// 把後端整包輸出 agentdata/ 轉成網站格式，放到 incoming/agentdata/，再由 sync-reports.mjs 匯入
// 用法：npm run import            （= 本程式 + sync --from incoming/agentdata --replace）
//       node scripts/import-agentdata.mjs --from <agentdata 路徑>
//
// 讀（後端資料夾結構，見 docs/progress/data-status.md）：
//   <商品 id>/3.json                          統整報告（sync 驗證後原樣匯入）
//   <商品 id>/1.json                          商品原始資料 → 報告沒有 product_snapshot.source_documents 時補上；
//                                              發行公司、國家、幣別、繳費方式是空的時也從這裡補
//   news-monitor-work/news-regulatory-monitor.json → feed.json
//   market-pulse.json                          → market-pulse.json
//   market-pulse-work/output/pulse.json        → 同業排名（market-pulse 沒有 ranking 指標時補上，格式同後端需求 M7）
// 後端日後直接交這些欄位時，這裡的補充會自動跳過。只使用 Node.js 內建模組。

import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'incoming', 'agentdata');

/**
 * 不匯入的商品資料夾（id → 原因）。同一商品重複時在這裡選定一份。
 * 2026-10-31：CareScout 兩份平行執行、結論不同，先用市場需求信心較高的 61187f98，待後端說明。
 */
const SKIP = {
  'aacd2f35-e52a-4085-aa6b-5fb616eb1167': 'CareScout 重複（使用 61187f98），待後端說明哪份為準',
};

const isObject = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);

function parseFrom(argv) {
  const i = argv.indexOf('--from');
  return i === -1 ? path.join(ROOT, 'agentdata') : path.resolve(process.cwd(), argv[i + 1] ?? '');
}

async function readJsonOrNull(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') return null;
    throw new Error(`${path.basename(file)} 不是合法的 JSON（${e.message}）`);
  }
}

const writeJson = (name, data) => writeFile(path.join(OUT_DIR, name), `${JSON.stringify(data, null, 2)}\n`, 'utf8');

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

/** 同一商品（原文名稱＋發行公司）有兩份報告時提醒，請在 SKIP 選定 */
function productKey(one) {
  const core = isObject(one?.core) ? one.core : {};
  return `${core.product_name?.original ?? ''}|${core.source_market?.insurer_name ?? ''}`;
}

async function importReports(fromDir) {
  const entries = await readdir(fromDir, { withFileTypes: true });
  const seen = new Map();
  let count = 0;
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
    const one = await readJsonOrNull(path.join(fromDir, dir, '1.json'));
    const key = productKey(one);
    if (one && seen.has(key)) console.warn(`  注意：${dir} 與 ${seen.get(key)} 是同一商品，請在 import-agentdata.mjs 的 SKIP 選定一份`);
    seen.set(key, dir);

    const snap = isObject(report.product_snapshot) ? report.product_snapshot : (report.product_snapshot = {});
    fillSnapshot(snap, one);
    if (!Array.isArray(snap.source_documents)) {
      const docs = sourceDocuments(one);
      if (docs.length > 0) snap.source_documents = docs;
    }
    await writeJson(`${dir}.json`, report);
    count += 1;
  }
  return count;
}

/** 「2026-08」→「2026-08-31」；其他格式照原文 */
function monthEnd(period) {
  const m = /^(\d{4})-(\d{2})$/.exec(period ?? '');
  if (!m) return period ?? null;
  const last = new Date(Date.UTC(+m[1], +m[2], 0)).getUTCDate();
  return `${m[1]}-${m[2]}-${String(last).padStart(2, '0')}`;
}

/** pulse.json 的 company_ranking → market-pulse 2.2 的 ranking 指標（後端需求 M7） */
function rankingMetric(pulse, metrics) {
  const ind = isObject(pulse?.indicators) ? pulse.indicators.company_ranking : null;
  if (!isObject(ind) || ind.status !== 'ok' || !Array.isArray(ind.series)) return null;
  const latest = ind.series.at(-1);
  if (!isObject(latest) || !Array.isArray(latest.rows) || latest.rows.length === 0) return null;
  // 來源名稱、資料較舊旗標沿用同一來源網址的指標
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

/** pulse.json 的一個指標（status ok、有 series），沒有時為 null */
function pulseIndicator(pulse, key) {
  const ind = isObject(pulse?.indicators) ? pulse.indicators[key] : null;
  return isObject(ind) && ind.status === 'ok' && Array.isArray(ind.series) ? ind : null;
}

const round = (v, d) => Math.round(v * 10 ** d) / 10 ** d;

/** 單線趨勢的最新值與變化（後端需求 M7：change_pct 為比上一期的百分比，或 pp 的差） */
function trendTail(series, unit) {
  const last = series.at(-1)?.value ?? null;
  const prev = series.at(-2)?.value ?? null;
  let change = null;
  if (last !== null && prev !== null) change = unit === 'pp' ? round(last - prev, 4) : prev !== 0 ? round((last / prev - 1) * 100, 2) : null;
  return { latest_value: last, change_pct: change };
}

/** pulse.json 的 new_premium_total（億元）→ market-pulse 2.2 的 new_premium_amount（新台幣元，月資料） */
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

/** pulse.json 的 gov_bond_yield_10y（日資料）→ market-pulse 2.2 的 tw_10y_yield_daily */
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

/** product_mix 每個 part 補 amount_ntd（新台幣元整數；pulse.json 的 new_premium_by_type，依險別名稱對應） */
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

/** 後端還沒交 market-pulse 2.2 時，由 pulse.json 補上 2.2 的欄位（後端已有同 key 就不補） */
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
      // 放在年增率後面
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

async function importMarket(fromDir) {
  const feed = await readJsonOrNull(path.join(fromDir, 'news-monitor-work', 'news-regulatory-monitor.json'));
  if (feed) await writeJson('feed.json', feed);
  else console.warn('  沒有 news-monitor-work/news-regulatory-monitor.json，新聞不更新');

  const market = await readJsonOrNull(path.join(fromDir, 'market-pulse.json'));
  if (!market) {
    console.warn('  沒有 market-pulse.json，市場脈動不更新');
    return;
  }
  if (!Array.isArray(market.metrics)) market.metrics = [];
  const pulse = await readJsonOrNull(path.join(fromDir, 'market-pulse-work', 'output', 'pulse.json'));
  if (pulse) fillFromPulse(pulse, market);
  await writeJson('market-pulse.json', market);
}

const fromDir = parseFrom(process.argv.slice(2));
try {
  await readdir(fromDir);
} catch {
  console.error(`錯誤：找不到後端資料夾 ${fromDir}`);
  process.exit(1);
}
await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });
console.log(`轉換：${path.relative(ROOT, fromDir) || fromDir} → incoming/agentdata/`);
const n = await importReports(fromDir);
await importMarket(fromDir);
console.log(`轉換完成：報告 ${n} 份`);
