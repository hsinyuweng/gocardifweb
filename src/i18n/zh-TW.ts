// 介面固定文字（D6）。來自報告 JSON 的文字不放在這裡。

export const zhTW = {
  appName: 'Cardif 商品引入評估',

  common: {
    dash: '—',
    none: '無',
    loading: '載入中…',
    roadmap: '規劃中',
    backToHome: '回到市場總覽',
  },

  nav: {
    home: '市場總覽',
    overview: '案件總覽',
    tasks: '我的待辦',
    guide: '使用說明',
    roadmapGroup: '規劃中',
    // 市場動態、市場脈動於階段 C 完成詳細頁後改為可點擊（2026-10-18 經確認）
    roadmapItems: ['市場動態', '市場脈動', '跨部門審查'],
    dataUpdated: '資料更新：',
    dataSource: '資料來源：',
    dataSourceStatic: '離線資料',
    dataSourceApi: '後端連線',
    myUnit: '我的單位：',
    myUnitUnset: '未設定',
    myUnitSet: '設定',
    myUnitChange: '更改',
    myUnitCancel: '取消',
  },

  errors: {
    network: '無法讀取資料，請確認網路連線後重新整理頁面。',
    notFoundIndex: '找不到報告清單。請先執行 npm run sync 匯入報告。',
    notFoundReport: '找不到此報告',
    invalidFormat: '資料格式錯誤，無法顯示。',
    server: '伺服器發生錯誤，請稍後再試。',
    badRequest: '請求格式錯誤，無法取得資料。',
    configError: '設定錯誤：config.json 的 dataSource 為 api，但 apiBaseUrl 是空的。',
  },

  offlineNotice: '目前無法連線後端，顯示的是離線資料',

  layout: {
    openMenu: '開啟選單',
    closeMenu: '關閉選單',
  },

  // 第 11.4 節：使用說明頁（固定內容）
  guide: {
    title: '使用說明',
    whatTitle: '這個網站做什麼',
    whatBody: '彙整國外保險商品在台灣的市場需求、發生率暨獲利、法規適用三面向分析結果，並提供統整建議。',
    flowTitle: '流程',
    flowSteps: ['資料蒐集', '三面向分析', '統整建議', '部門審查（規劃中）'],
    questionsTitle: '三個面向回答的問題',
    questionsColumns: { module: '面向', question: '核心問題' },
    howTitle: '怎麼看一份報告',
    howBody: '先看最上方建議與理由；再看三面向燈號；接著依自己的部門篩選「待解決事項」；需要細節時看下方分頁。',
    noteTitle: '注意',
    noteBody: '本網站內容為 AI 輔助之內部初審，須經相關部門人員覆核；資料不足不代表負面結論。',
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

  // 我的待辦（規格外功能，2026-10-18 經確認）
  tasks: {
    title: '我的待辦',
    choosePrompt: '請選擇負責單位，查看各商品需要處理的事項。',
    summary: (blockers: number, critical: number, steps: number, products: number) =>
      `待解決事項 ${blockers}（重大 ${critical}）· 建議下一步 ${steps} · 涉及 ${products} 件商品`,
    openReport: '看報告 →',
    allUnits: '← 所有單位',
    partialFailure: (n: number, names: string) => `有 ${n} 份報告無法讀取，以下內容不包含：${names}。`,
  },

  // 市場總覽（首頁儀表板，2026-10-18 經確認）
  home: {
    title: '市場總覽',
    updatedAt: (t: string) => `資料更新於 ${t}`,
    pending: '資料準備中，後端提供後會自動顯示。',
    cards: {
      news: '新聞監控',
      pulse: '市場脈動',
      changes: '競品與法規異動',
      watchlist: '我的追蹤清單',
    },
    noFeedItems: '目前沒有新的動態。',
    noMetrics: '目前沒有指標資料。',
    changeTags: { product: '新商品', regulation: '法規' } as Record<string, string>,
    affects: (n: number) => `影響 ${n} 項既有商品評估`,
    changeUp: (pct: string) => `▲ ${pct}%`,
    changeDown: (pct: string) => `▼ ${pct}%`,
    changeFlat: '— 0%',
  },

  // 相對時間（市場總覽動態）
  time: {
    minutesAgo: (n: number) => `${n} 分鐘前`,
    hoursAgo: (n: number) => `${n} 小時前`,
    today: '今天',
    yesterday: '昨天',
    daysAgo: (n: number) => `${n} 天前`,
  },

  watchlist: {
    allCategories: '全部險種',
    allCountries: '全部國家',
    itemLabel: (category: string, country: string) => `${category}・${country}`,
    productCount: (n: number) => `${n} 件商品`,
    updatedToday: '今天更新',
    updatedYesterday: '昨天更新',
    updatedDaysAgo: (n: number) => `${n} 天前更新`,
    updatedOn: (date: string) => `${date} 更新`,
    noMatch: '目前沒有相符的案件',
    empty: '還沒有追蹤項目。按「＋新增追蹤」選擇險種與市場。',
    add: '＋ 新增追蹤',
    confirmAdd: '加入',
    cancel: '取消',
    duplicate: '已在追蹤清單中',
    remove: '移除追蹤',
    categoryLabel: '險種',
    countryLabel: '市場',
  },

  schemaMismatch: '報告格式版本不符，部分內容可能無法正確顯示',

  report: {
    flow: {
      collect: '資料蒐集',
      analysis: '三面向分析',
      synthesis: '統整建議',
      review: '部門審查',
      done: '完成',
      analysisProgress: (n: number, total: number) => `${n}／${total} 完成`,
    },
    print: '列印／另存 PDF',
    generatedDate: (d: string) => `產出日期 ${d}`,
    reviewDates: '審閱日期：',
    reasons: '判定理由',
    mechanism: '商品機制',
    notProvided: '未提供',
    rawStatus: (s: string) => `（原始值：${s}）`,
    indicators: {
      demandLevel: '需求等級',
      confidence: '信心等級',
      researchStatus: '研究狀態',
      comparability: '可比程度',
      pricingFlagCount: '定價提示數',
    },
    blockersTitle: '待解決事項',
    nextStepsTitle: '建議下一步',
    ownerFilter: '負責單位',
    ownerAll: '全部',
    ownerUnassigned: '未指定',
    noOwnerMatch: '此負責單位沒有相關項目。',
    blockerColumns: {
      severity: '嚴重度',
      module: '面向',
      title: '事項',
      owner: '負責單位',
      action: '處理方式',
    },
    nextStepOwner: '負責單位：',
    nextStepSource: '來源面向：',
    dataQualityTitle: '資料品質',
    suspectedInputErrors: '疑似輸入錯誤',
    moreDataQuality: '更多資料品質註記',
    dataQualityGroups: {
      conflicts: '資料衝突',
      evidence_mismatch: '證據不一致',
      missing_fields: '缺漏欄位',
      notes: '備註',
    },
    dataGapsTitle: '資料缺口',
    showDetail: '看詳細內容',
    backToCards: '↑ 回到三面向',
    printOwnerNote: (owner: string) => `篩選：負責單位＝${owner}`,
    details: {
      summary: '摘要',
      marketSizing: '市場規模',
      methodology: '估算方法',
      targetPopulation: '目標人口',
      estimate: '市場規模估計',
      confidence: '信心等級',
      low: '低估',
      mid: '中估',
      high: '高估',
      keyPoints: '關鍵發現',
      source: '來源：',
      evidenceLevel: (level: string) => `證據等級 ${level}`,
      pricingFlags: '定價提示',
      pricingColumns: { topic: '項目', direction: '方向', sourceCount: '來源數' },
      findingColumns: {
        itemId: '編號',
        title: '項目',
        light: '燈號',
        law: '法規依據',
        remedy: '建議措施',
        owner: '負責單位',
      },
      suspectedRed: '疑似紅燈',
      keyLaws: '關鍵法規',
      lightAll: '全部',
      noLightMatch: '此燈號沒有項目。',
    },
    disclaimerTitle: '免責聲明',
  },

  units: {
    person: '人',
    hundredMillion: '億元',
    /** 第 9.3 節：需換算為億元的原始單位 */
    ntd: '新台幣元',
  },

  charts: {
    noData: '無資料',
  },

  // 第 9.1 節：各模組核心問題
  coreQuestion: {
    market_demand: '產品是否有需求',
    actuarial: '產品是否能獲利',
    regulatory: '產品是否能引入',
  },

  // 第 9.1 節：research_status 固定標籤（legend 查不到時使用）
  researchStatus: {
    sufficient_evidence: '證據充分',
    partial_evidence: '部分證據',
    insufficient_evidence: '證據不足',
  },
} as const;
