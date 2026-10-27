import type { PulseMetricViewModel, PulsePointViewModel } from '../types/viewModel';
import { zhTW } from '../i18n/zh-TW';
import { formatPulseValue, formatSharePct, orDash, pulseChangeText } from './format';
import { periodLong } from './marketStory';
import { pulseDigits } from './pulse';

// 市場脈動指標表（2026-10-27 視覺改版 V5，參考 TradingView 指標列表）：
// 指標｜最新｜上期｜變化｜資料期間｜頻率｜來源。單線一列；占比與多線先一列標題，下面每個項目一列；時程一列。

const t = zhTW.market.table;

export interface PulseTableRow {
  key: string;
  /** 指標的 key（「看圖 ▾」展開的是整個指標） */
  metricKey: string;
  /** item：占比或多線底下的項目（縮排，沒有「看圖」） */
  level: 'metric' | 'item';
  label: string;
  latest: string;
  prev: string;
  change: string;
  period: string;
  frequency: string;
  source: { name: string; url: string | null } | null;
  stale: boolean;
  /** 有圖可看（只有 metric 列） */
  chart: boolean;
}

const dash = zhTW.common.dash;

/** 頻率：依期間格式判斷，判斷不出來為「—」 */
export function frequencyOf(period: string | null | undefined): string {
  if (!period) return dash;
  if (/^\d{4}-\d{2}$/.test(period)) return t.freq.month;
  if (/^\d{4}-W\d{2}$/.test(period)) return t.freq.week;
  if (/^\d{4}-\d{2}-\d{2}$/.test(period)) return t.freq.day;
  if (/^\d{4}-?Q[1-4]$/i.test(period)) return t.freq.quarter;
  if (/^\d{4}$/.test(period)) return t.freq.year;
  return dash;
}

/** 兩點的差：% 用百分點，其他單位寫「▲ 3 名」這類 */
function diffText(latest: number, prev: number, unit: string | null, digits: 1 | 2): string {
  if (unit === '%') return pulseChangeText(latest - prev, 'pp', digits);
  const d = latest - prev;
  if (d === 0) return zhTW.market.change.flat;
  return `${d > 0 ? zhTW.market.change.up : zhTW.market.change.down} ${formatPulseValue(Math.abs(d), unit, digits)}`;
}

function pointRow(base: Omit<PulseTableRow, 'latest' | 'prev' | 'change' | 'period' | 'frequency'>, points: PulsePointViewModel[], unit: string | null, digits: 1 | 2): PulseTableRow {
  const last = points.at(-1);
  const prev = points.at(-2);
  return {
    ...base,
    latest: last ? formatPulseValue(last.value, unit, digits) : dash,
    prev: prev ? formatPulseValue(prev.value, unit, digits) : dash,
    change: last && prev ? diffText(last.value, prev.value, unit, digits) : dash,
    period: periodLong(last?.period ?? null) ?? dash,
    frequency: frequencyOf(last?.period),
  };
}

export function pulseTableRows(metrics: PulseMetricViewModel[]): PulseTableRow[] {
  const rows: PulseTableRow[] = [];
  for (const m of metrics) {
    const digits = pulseDigits(m.group);
    const base = {
      key: m.key,
      metricKey: m.key,
      level: 'metric' as const,
      label: orDash(m.label),
      source: m.source ? { name: m.source, url: m.sourceUrl } : null,
      stale: m.stale,
      chart: true,
    };
    const blank = { latest: '', prev: '', change: '' };
    if (m.type === 'trend') {
      const row = pointRow(base, m.points, m.unit, digits);
      // 最新值與變化以後端欄位為準（只有一期時仍有最新值）
      rows.push({
        ...row,
        latest: formatPulseValue(m.latestValue, m.unit, digits),
        change: m.change !== null ? pulseChangeText(m.change, m.changeUnit, digits) : row.change,
      });
    } else if (m.type === 'multi_line') {
      const last = m.lines.flatMap((l) => l.points.at(-1)?.period ?? []).sort().at(-1) ?? null;
      rows.push({ ...base, ...blank, period: periodLong(last) ?? dash, frequency: frequencyOf(last) });
      m.lines.forEach((l, i) =>
        rows.push({ ...pointRow({ ...base, key: `${m.key}-${i}`, level: 'item', label: orDash(l.name), chart: false }, l.points, m.unit, digits) }),
      );
    } else if (m.type === 'share') {
      const last = m.periods.at(-1);
      const prev = m.periods.at(-2);
      rows.push({ ...base, ...blank, period: periodLong(last?.period ?? null) ?? dash, frequency: frequencyOf(last?.period) });
      [...(last?.parts ?? [])]
        .sort((a, b) => b.sharePct - a.sharePct)
        .forEach((p, i) => {
          const before = prev?.parts.find((x) => x.name !== null && x.name === p.name);
          rows.push({
            ...base,
            key: `${m.key}-${p.name ?? i}`,
            level: 'item',
            label: orDash(p.name),
            latest: formatSharePct(p.sharePct),
            prev: before ? formatSharePct(before.sharePct) : dash,
            change: before ? pulseChangeText(p.sharePct - before.sharePct, 'pp', 1) : dash,
            period: '',
            frequency: '',
            chart: false,
          });
        });
    } else {
      // 時程：最新＝最近發生的事件，上期欄放下一個預計事件
      const done = m.events.filter((e) => !e.upcoming).at(-1);
      const next = m.events.find((e) => e.upcoming);
      const ev = (e: typeof done) => (e ? `${orDash(e.date)} ${orDash(e.title)}` : dash);
      rows.push({
        ...base,
        latest: ev(done),
        prev: next ? `${zhTW.market.upcoming} ${ev(next)}` : dash,
        change: dash,
        period: orDash(done?.date ?? null),
        frequency: dash,
      });
    }
  }
  return rows;
}
