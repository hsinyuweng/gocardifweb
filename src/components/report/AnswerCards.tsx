import type { ReportViewModel } from '../../types/viewModel';
import { zhTW } from '../../i18n/zh-TW';
import { legalText } from '../../lib/legal';
import { TONE_TEXT, type Tone } from '../../lib/tone';

const t = zhTW.report.answers;

interface Card {
  key: string;
  question: string;
  label: string;
  value: string;
  tone?: Tone;
  note: string | null;
  onClick: () => void;
  linkLabel: string;
}

interface AnswerCardsProps {
  vm: ReportViewModel;
  onMarket: () => void;
  onBlockers: () => void;
  onCompetitors: () => void;
}

/**
 * 報告頁 ③（2026-11-01 顯示資料整理）：用三個問題回答「適不適合引進」——
 * 有多少人會買（潛在市場）、法規過得了嗎（能不能引進＋阻斷件數）、台灣已經有誰在賣（直接競品件數）。
 * 卡內只放問題、數字、一行說明，不放段落。
 */
export function AnswerCards({ vm, onMarket, onBlockers, onCompetitors }: AnswerCardsProps) {
  const ds = vm.dimensionScores;
  const legal = legalText(vm.legal);
  const blocking = vm.blockers.filter((b) => b.severityKey === 'critical' || b.severityKey === 'blocking').length;
  const cc = vm.competitors;
  const direct = cc ? cc.competitors.filter((c) => c.isDirect) : [];
  const issuers = [...new Set(direct.map((c) => c.issuer).filter((x): x is string => !!x))];

  const cards: Card[] = [
    {
      key: 'market',
      question: t.marketQ,
      label: t.marketLabel,
      value: ds?.marketSize?.valueText ?? vm.details.market_demand.sizing.mid.text ?? t.noData,
      // 不寫市場規模分數（2026-11-01：多數商品都是 100，分不出差別）
      note: null,
      onClick: onMarket,
      linkLabel: t.marketLink,
    },
    {
      key: 'regulatory',
      question: t.regulatoryQ,
      label: t.regulatoryLabel,
      // 法規只看能不能引進（2026-11-01 使用者回饋），不寫 0–100 分數
      value: legal?.text ?? (vm.details.regulatory.summary ? t.noScore : t.noData),
      tone: legal?.tone,
      note: blocking > 0 ? t.blocking(blocking) : t.noBlocking,
      onClick: onBlockers,
      linkLabel: t.regulatoryLink,
    },
    {
      key: 'competitors',
      question: t.competitorQ,
      label: t.competitorLabel,
      value: cc ? t.count(direct.length) : t.noData,
      note: issuers.length > 0 ? issuers.join('、') : cc && cc.competitors.length > 0 ? t.similarOnly(cc.competitors.length) : null,
      onClick: onCompetitors,
      linkLabel: t.competitorLink,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
      {cards.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={c.onClick}
          className="flex min-w-0 flex-col items-start rounded-xl border border-line bg-white px-[18px] pt-3.5 pb-3 text-left transition-colors hover:border-p"
        >
          <span className="text-[13px] text-ink2">{c.question}</span>
          <span className="mt-0.5 text-[12.5px] text-muted">{c.label}</span>
          <span className={`text-[30px] leading-tight font-medium tabular-nums ${c.tone ? TONE_TEXT[c.tone] : 'text-ink'}`}>{c.value}</span>
          {c.note ? <span className="mt-0.5 text-[13px] text-ink2">{c.note}</span> : null}
          <span className="mt-auto pt-2 text-[13px] text-ink2 print:hidden">{c.linkLabel}</span>
        </button>
      ))}
    </div>
  );
}
