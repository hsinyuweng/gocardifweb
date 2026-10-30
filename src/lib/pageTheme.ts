// 每頁代表色（2026-10-27 視覺改版）：整頁底色＝代表色極淡色，從首頁哪一色的框點進去，就是那個顏色。
// 實際色碼在 index.css 的 [data-theme]。

export type PageTheme = 'home' | 'pulse' | 'news' | 'watch' | 'research' | 'plain';

/** 路徑 → 代表色；子頁用所屬首頁框的顏色（報告頁、我的待辦屬於競品研究），使用說明、找不到頁面用中性色 */
export function themeForPath(pathname: string): PageTheme {
  if (pathname === '/' || pathname === '') return 'home';
  const first = pathname.split('/')[1];
  switch (first) {
    case 'market':
      return 'pulse';
    case 'news':
      return 'news';
    case 'watchlist':
      return 'watch';
    case 'research':
    case 'cases':
    case 'report':
    case 'tasks':
      return 'research';
    default:
      return 'plain';
  }
}
