// 商品簡稱與所屬險種（2026-11-01 使用者回饋：截斷的全名看不出是什麼商品）。
// 簡稱先由前端維護（使用者確認，見 docs/architecture/diagrams/2026-11-01_回饋整理.md §6），之後改用後端 short_name。

const SHORT_NAMES: Record<string, string> = {
  'CareScout Care Assurance長期照顧保險': 'CareScout 長照險',
  '瑞駿（尊尚版）萬用壽險保險計劃': '瑞駿萬用壽險',
  '日圓低解約返還型終身壽險 Yen Can': 'Yen Can 日圓終身壽險',
  '林肯財富建構早期現金價值指數型萬能壽險': '林肯指數萬能壽險',
  '盛裕精英定期壽險II（限期繳費）': '盛裕精英定期壽險',
  'Secure Horizon指數型萬能壽險': 'Secure Horizon 指數萬能壽險',
  'RapidProtect即時核保指數型萬能壽險': 'RapidProtect 指數萬能壽險',
  '存續型變額萬能壽險加值版': '西北人壽變額萬能壽險',
};

/** 簡稱；字典沒有時用全名 */
export function shortNameOf(name: string | null): string | null {
  if (name === null) return null;
  return SHORT_NAMES[name.trim()] ?? name;
}

/** 市場脈動「各險別」的名稱（與 market-pulse 的 product_mix 一致） */
export type ProductLine = '人壽保險' | '健康保險' | '年金保險' | '傷害保險';

/** 依險種文字判斷屬於哪個險別；長照、醫療屬健康保險；判斷不出來時為 null */
export function productLineOf(category: string | null, name: string | null): ProductLine | null {
  const text = `${category ?? ''} ${name ?? ''}`;
  if (/長期照顧|長照|健康|醫療|重大疾病|癌/.test(text)) return '健康保險';
  if (/年金/.test(text)) return '年金保險';
  if (/傷害|意外/.test(text)) return '傷害保險';
  if (/壽險|人壽/.test(text)) return '人壽保險';
  return null;
}
