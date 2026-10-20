// 匯入 summarizer 報告到 public/data/reports/，並重新產生 index.json（第 7 節）
// 市場總覽資料：來源資料夾若有 feed.json、market-pulse.json，檢查基本結構後複製到 public/data/
// 用法：npm run sync            （讀 incoming/）
//       npm run sync -- --from <路徑>
// 只使用 Node.js 內建模組。

import { copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORTS_DIR = path.join(ROOT, 'public', 'data', 'reports');
const INDEX_FILE = 'index.json';
const DATA_DIR = path.join(ROOT, 'public', 'data');
/** 檔名 → 必須存在的陣列欄位（正式格式未定版，改格式時一併調整） */
const MARKET_FILES = { 'feed.json': 'items', 'market-pulse.json': 'metrics' };

function parseArgs(argv) {
  const i = argv.indexOf('--from');
  if (i === -1) return path.join(ROOT, 'incoming');
  const value = argv[i + 1];
  if (!value) {
    console.error('錯誤：--from 後面需要接資料夾路徑');
    process.exit(1);
  }
  return path.resolve(process.cwd(), value);
}

function warn(file, reason) {
  console.warn(`  略過 ${file}：${reason}`);
}

const isObject = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);
const orNull = (v) => (v === undefined ? null : v);

async function listJson(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.json'))
    .map((e) => e.name)
    .sort();
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

/** report_id 會成為檔名：不允許路徑字元，也不可與 index.json 撞名 */
function isSafeId(id) {
  return id !== '' && id !== 'index' && !id.includes('/') && !id.includes('\\') && !id.includes('..');
}

/** 依 api-contract 第 2.1 節由報告產生清單項目；缺欄位填 null，計數缺少時填 0 */
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
    // 追蹤清單的數值分數（後端需求 S10）：原樣複製，前端 normalize 時容錯
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
  };
}

/** 市場總覽資料：檢查是 JSON 物件且有對應陣列，原樣複製；不合格只警告 */
async function importMarketFiles(fromDir, files) {
  for (const [file, key] of Object.entries(MARKET_FILES)) {
    if (!files.includes(file)) continue;
    try {
      const data = await readJson(path.join(fromDir, file));
      if (!isObject(data) || !Array.isArray(data[key])) throw new Error(`缺少 ${key} 陣列`);
      await mkdir(DATA_DIR, { recursive: true });
      await copyFile(path.join(fromDir, file), path.join(DATA_DIR, file));
      console.log(`  匯入 ${file} → public/data/${file}`);
    } catch (e) {
      warn(file, e.message);
    }
  }
}

async function importBatch(fromDir) {
  let files;
  try {
    files = await listJson(fromDir);
  } catch {
    console.error(`錯誤：找不到來源資料夾 ${fromDir}`);
    process.exit(1);
  }

  const rel = path.relative(ROOT, fromDir);
  const shown = rel && !rel.startsWith('..') ? rel : fromDir;
  console.log(`來源：${shown}（${files.length} 個 .json）`);
  await importMarketFiles(fromDir, files);
  files = files.filter((f) => !(f in MARKET_FILES));

  // 1. 整批先驗證，全部通過才複製
  const accepted = []; // { file, id }
  let skipped = 0;
  for (const file of files) {
    let report;
    try {
      report = await readJson(path.join(fromDir, file));
    } catch (e) {
      warn(file, `不是合法的 JSON（${e.message}）`);
      skipped += 1;
      continue;
    }
    const meta = isObject(report) && isObject(report.report_meta) ? report.report_meta : null;
    const id = meta?.report_id;
    if (typeof id !== 'string') {
      warn(file, '缺少 report_meta.report_id');
      skipped += 1;
      continue;
    }
    const version = meta.schema_version;
    if (typeof version !== 'string' || !version.startsWith('1.')) {
      warn(file, `schema_version 為 ${JSON.stringify(version ?? null)}，不是 1.x`);
      skipped += 1;
      continue;
    }
    if (!isSafeId(id)) {
      warn(file, `report_id「${id}」含有不允許的字元`);
      skipped += 1;
      continue;
    }
    accepted.push({ file, id });
  }

  // 2. 同批次 report_id 重複 → 停止
  const byId = new Map();
  for (const { file, id } of accepted) byId.set(id, [...(byId.get(id) ?? []), file]);
  const dups = [...byId.entries()].filter(([, list]) => list.length > 1);
  if (dups.length > 0) {
    console.error('錯誤：同一批次中 report_id 重複，未匯入任何檔案：');
    for (const [id, list] of dups) console.error(`  ${id}：${list.join('、')}`);
    process.exit(1);
  }

  // 3. 原樣複製（不重新序列化，確保內容不變）
  await mkdir(REPORTS_DIR, { recursive: true });
  for (const { file, id } of accepted) {
    await copyFile(path.join(fromDir, file), path.join(REPORTS_DIR, `${id}.json`));
    console.log(`  匯入 ${file} → public/data/reports/${id}.json`);
  }
  return { imported: accepted.length, skipped };
}

async function rebuildIndex() {
  const files = (await listJson(REPORTS_DIR)).filter((f) => f !== INDEX_FILE);
  const reports = [];
  for (const file of files) {
    try {
      const report = await readJson(path.join(REPORTS_DIR, file));
      if (!isObject(report)) throw new Error('不是 JSON 物件');
      reports.push(toIndexEntry(report));
    } catch (e) {
      console.warn(`  清單略過 public/data/reports/${file}：${e.message}`);
    }
  }
  const index = { generated_at: new Date().toISOString(), reports };
  await writeFile(path.join(REPORTS_DIR, INDEX_FILE), `${JSON.stringify(index, null, 2)}\n`, 'utf8');
  return reports.length;
}

const fromDir = parseArgs(process.argv.slice(2));
const { imported, skipped } = await importBatch(fromDir);
const total = await rebuildIndex();
console.log(`完成：匯入 ${imported} 份、略過 ${skipped} 份；index.json 共 ${total} 份報告。`);
