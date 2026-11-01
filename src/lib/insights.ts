import type { MarketPulseViewModel } from '../types/viewModel';
import { zhTW } from '../i18n/zh-TW';
import type { RecentFeed } from './feedSummary';
import { growthHeadline, pickMetrics } from './marketStory';
import type { Tone } from './tone';

// 一句結論（閱讀路徑 ②）：只用資料裡的數字。各頁的句子在 lib/researchStory.ts、lib/marketStory.ts、lib/newsStory.ts。

/** 一句結論的片段；strong 是中性重點（代表色深色），tone 標好壞（lib/tone.ts） */
export interface HeadlinePart {
  text: string;
  strong?: boolean;
  tone?: Tone;
}

/**
 * 首頁沒有任何報告時的結論：市場成長「8 月新契約保費比去年同期成長 68.5%，連續 8 個月成長」；
 * 沒有市場資料時用新聞「近 30 天 34 則動態，法規 0 則」；都沒有時為 null（不顯示）。
 */
export function homeHeadline(pulse: MarketPulseViewModel | null, news: RecentFeed | null): HeadlinePart[] | null {
  const yoy = pulse ? pickMetrics(pulse.metrics).yoy : undefined;
  if (yoy) return growthHeadline(yoy);
  if (news && news.items.length > 0) return [{ text: zhTW.insights.news(news.items.length, news.regulation) }];
  return null;
}
