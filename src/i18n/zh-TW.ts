// 介面固定文字（D6）。來自報告 JSON 的文字不放在這裡。

export const zhTW = {
  appName: 'Cardif 商品引入評估',

  common: {
    dash: '—',
    none: '無',
    loading: '載入中…',
    roadmap: '規劃中',
    backToOverview: '回到案件總覽',
  },

  nav: {
    overview: '案件總覽',
    guide: '使用說明',
    roadmapGroup: '規劃中',
    roadmapItems: ['海外商品雷達', '市場趨勢報告', '法規變化追蹤', '跨部門審查'],
    dataUpdated: '資料更新：',
    dataSource: '資料來源：',
    dataSourceStatic: '離線資料',
    dataSourceApi: '後端連線',
  },

  errors: {
    network: '無法讀取資料，請確認網路連線後重新整理頁面。',
    notFoundIndex: '找不到報告清單。請先執行 npm run sync 匯入報告。',
    notFoundReport: '找不到此報告',
    invalidFormat: '資料格式錯誤，無法顯示。',
    server: '伺服器發生錯誤，請稍後再試。',
  },

  placeholder: {
    comingSoon: '此頁面將於後續階段完成。',
    notFound: '找不到此頁面。',
  },

  overview: {
    title: '案件總覽',
    total: (n: number) => `共 ${n} 件`,
    updatedAt: (t: string) => `資料更新於 ${t}`,
    all: '全部',
    searchPlaceholder: '搜尋商品名稱或發行公司',
    allCountries: '全部國家',
    allCategories: '全部險種',
    empty: '目前沒有報告。新增方式請見 README。',
    noMatch: '沒有符合條件的案件。',
    columns: {
      product: '商品',
      country: '國家',
      category: '險種',
      marketDemand: '市場需求',
      actuarial: '發生率暨獲利',
      regulatory: '法規適用',
      recommendation: '整體建議',
      blockers: '待解決',
      generatedDate: '產出日期',
    },
    blockerCritical: (n: number) => `重大 ${n}`,
    blockerBlocking: (n: number) => `阻斷 ${n}`,
    blockerWarning: (n: number) => `注意 ${n}`,
    sortAsc: '▲',
    sortDesc: '▼',
  },

  // 第 9.1 節：research_status 固定標籤（legend 查不到時使用）
  researchStatus: {
    sufficient_evidence: '證據充分',
    partial_evidence: '部分證據',
    insufficient_evidence: '證據不足',
  },
} as const;
