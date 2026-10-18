// 第 9.6 節：國家代碼轉換；其他代碼顯示原文
const COUNTRY_NAMES: Record<string, string> = {
  JP: '日本',
  US: '美國',
  GB: '英國',
  FR: '法國',
  SG: '新加坡',
  HK: '香港',
  KR: '韓國',
  CN: '中國',
};

export function countryLabel(code: string | null | undefined): string | null {
  if (code == null || code === '') return null;
  return COUNTRY_NAMES[code] ?? code;
}
