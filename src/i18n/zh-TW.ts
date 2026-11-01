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
    overview: '競品研究',
    news: '新聞與法規監控',
    market: '市場脈動',
    watchlist: '追蹤清單',
    tasks: '我的待辦',
    guide: '使用說明',
    roadmapGroup: '規劃中',
    roadmapItems: ['跨部門審查'],
    dataUpdated: '資料更新：',
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
    // 2026-11-01 第二輪：改成圖示卡片，刪掉長段文字
    what: '國外保險商品適不適合引進台灣：看市場、看新聞法規、比商品。',
    pagesTitle: '四個頁面',
    pages: [
      { key: 'market', body: '台灣壽險市場在成長還是衰退、利率、法巴排第幾' },
      { key: 'news', body: '最上面是重點新聞（★），下面是全部新聞與法規' },
      { key: 'watchlist', body: '你追蹤的商品，依引進分數排好' },
      { key: 'research', body: '全部國外商品：推薦哪件、卡在哪裡、分數多少' },
    ],
    go: '前往 →',
    colorsTitle: '顏色怎麼看',
    colors: [
      { key: 'good', name: '綠色＝好', body: '成長、可推進、可引進' },
      { key: 'bad', name: '紅色＝壞', body: '衰退、不建議、不可引進' },
      { key: 'gray', name: '灰色＝還不能判斷', body: '暫緩、待確認' },
      { key: 'key', name: '實心＝重點', body: '圖上要看的那一項，用該頁的代表色' },
    ],
    scoreTitle: '引進分數怎麼看',
    scoreBody: '0–100 分，越高越值得引進。三部分加起來：',
    scoreExample: '例：CareScout 長照險',
    scoreParts: [
      { key: 'rec', name: '整體建議', max: 50, body: '推進 50、暫緩 20、不建議 0' },
      { key: 'blocking', name: '阻斷項目', max: 25, body: '沒有阻斷 25，每 1 項扣 5' },
      { key: 'market', name: '潛在市場', max: 25, body: '和最大的那件比' },
    ],
    reportTitle: '怎麼看一份報告',
    reportSteps: ['整體建議', '三面向燈號', '待解決事項', '台灣競品與細節'],
    note: '內容為 AI 輔助的內部初審，須經相關部門覆核；資料不足不代表負面結論。',
  },

  placeholder: {
    comingSoon: '此頁面將於後續階段完成。',
    notFound: '找不到此頁面。',
  },

  overview: {
    title: '競品研究',
    total: (n: number) => `共 ${n} 件`,
    updatedAt: (t: string) => `資料更新於 ${t}`,
    all: '全部',
    searchPlaceholder: '搜尋商品名稱或發行公司',
    allCountries: '全部國家',
    allCategories: '全部險種',
    empty: '目前沒有報告。新增方式請見 README。',
    noMatch: '沒有符合條件的案件。',
    unread: '沒看過',
    unreadHint: '這台瀏覽器還沒打開過這份報告',
    columns: {
      market: '潛在市場',
      feasibility: '法規',
      blocking: '阻斷',
      competitors: '台灣競品',
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
    blockingCount: (n: number) => `${n} 項`,
    competitorCount: (n: number) => `${n} 件`,
    points: (n: number) => `${n} 分`,
    blockerBlocking: (n: number) => `阻斷 ${n}`,
    blockerWarning: (n: number) => `注意 ${n}`,
    sortAsc: '▲',
    sortDesc: '▼',
    // 第一個畫面（2026-10-27 V6）
    story: {
      // 2026-11-01 使用者回饋：兩行結論、用簡稱
      recommend: '推薦：',
      paren: (label: string) => `（${label}）`,
      restOf: (list: string) => `其餘 ${list}`,
      noneRecommended: (n: number) => `${n} 件國外商品目前都還不能推進`,
      count: (n: number) => `${n} 件`,
      missing: '未提供建議',
      tile: {
        best: (label: string) => `推薦（${label}）`,
        bestMany: '推薦',
        commonBlocker: '最常見的卡關原因',
        commonBlockerNote: (n: number) => `${n} 件商品卡在這裡`,
        topMarket: '台灣潛在市場最大',
      },
      allReports: '全部報告',
      scoreHeading: '引進分數：越高越值得引進',
    },
  },

  // 引進分數（lib/introScore.ts，2026-11-01 第二輪）
  score: {
    column: '引進分數',
    points: (n: number) => `${n} 分`,
    chartLabel: '各商品引進分數',
    breakdown: (rec: number, blocking: number, market: number) => `建議 ${rec}／50 ＋ 阻斷 ${blocking}／25 ＋ 潛在市場 ${market}／25`,
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

  // 法規判斷（lib/legal.ts，2026-11-01）
  legal: {
    ok: '可引進',
    okWithFixes: (n: number) => `可引進，需修改 ${n} 處`,
    pending: '待確認',
    blocked: (n: number) => `不可引進（違規 ${n} 項）`,
  },

  // 市場總覽（首頁，2026-10-20 新規劃）
  home: {
    title: '市場總覽',
    updatedAt: (t: string) => `資料更新於 ${t}`,
    pending: '資料準備中。',
    cards: {
      news: '新聞與法規監控',
      pulse: '市場脈動',
      watchlist: '追蹤清單',
      research: '競品研究',
    },
    noMetrics: '目前沒有指標資料。',
    newsTag: '新聞',
    regulationTag: '法規',
    seeAll: '看全部 →',
    // 2026-11-01 顯示資料整理
    stuckOn: (s: string) => `卡在：${s}`,
    noRecommended: '目前沒有可推進的商品。',
    restLabel: (list: string) => `其餘 ${list}`,
    moreItems: (n: number) => `還有 ${n} 件`,
    latestRegulation: '最新法規',
    relatedCount: (n: number) => `${n} 件`,
    pulseOverallLine: (period: string | null) => `${period ? `${period} ` : ''}整體新契約保費比去年同期 `,
    noBlocker: '沒有阻斷項目',
    pulseOverall: (label: string, v: string) => `整體${label} ${v}`,
    noRegulation: '近 30 天沒有新的法規。',
  },

  // 每頁頁首的一行說明（2026-10-27 視覺改版）
  pageDesc: {
    news: '同業新聞稿、主管機關法規與公告',
    market: '台灣壽險市場的成長、利率、通路與同業競爭',
    watchlist: '你追蹤的商品，依引進分數排序',
    research: '已完成的國外商品分析報告',
    tasks: '依負責單位查看各商品要處理的事項',
    guide: '這個網站做什麼、怎麼看報告',
  },

  // 一句結論（lib/insights.ts，2026-10-27 視覺改版）
  insights: {
    month: (m: number) => `${m} 月`,
    news: (n: number, regulation: number) => `近 30 天 ${n} 則動態，法規 ${regulation} 則`,
  },

  // 等級說明（2026-10-31：不直觀的等級一律註明哪端高）
  grade: {
    letters: (lowest: string) => `A 最高、${lowest} 最低`,
    tiers: 'T1 最高、數字越大越低',
    evidenceNote: (scale: string) => `證據等級：${scale}，越高代表證據越直接可靠`,
    confidenceNote: (scale: string) => `信心等級：${scale}`,
    scoreNote: '級數 1–5，越高越有利；可信度 A 最高、C 最低。',
  },

  // 市場脈動（2026-10-20 經確認）
  market: {
    title: '市場脈動',
    noChartData: '資料不足，無法畫圖。',
    stale: '資料較舊',
    /** 週期間（2026-W43）顯示為該週星期一 */
    weekOf: (md: string) => `${md} 當週`,
    /** 直條圖 x 軸的月份 */
    monthShort: (m: number) => `${m}月`,
    /** unit「萬分比」 */
    perTenThousand: (v: string) => `${v}（每萬件簽單）`,
    /** unit「名」 */
    rank: (v: string) => `第 ${v} 名`,
    asOf: (d: string) => `資料日期 ${d}`,
    upcoming: '預計',
    highest: '最高',
    periodLong: (y: number, m: number) => `${y} 年 ${m} 月`,
    dayLong: (y: number, m: number, d: number) => `${y} 年 ${m} 月 ${d} 日`,
    headerAside: (period: string | null, updated: string) => (period ? `${period} · 資料更新於 ${updated}` : `資料更新於 ${updated}`),
    sources: '資料來源：',
    // 一句結論（lib/marketStory.ts）
    vsLastYear: (period: string | null) => `${period ? `${period}` : ''}新契約保費比去年同期`,
    grow: (v: string) => `成長 ${v}`,
    shrink: (v: string) => `衰退 ${v}`,
    streakTail: (n: number, positive: boolean) => `，連續 ${n} 個月${positive ? '成長' : '衰退'}`,
    // 2026-11-01 第二輪：一頁，大標題＋大圖＋4 張圖卡
    hero: {
      lead: '新契約保費',
      streak: (n: number, positive: boolean) => `連續 ${n} 個月${positive ? '成長' : '衰退'}`,
      vsLastYear: (period: string | null) => `${period ? `${period}` : ''}比去年同期`,
      amount: (v: string) => `新契約保費 ${v}`,
      chart: '每月新契約保費比去年同期',
    },
    heading: {
      lines: '各險種新契約保費比去年同期',
      lineTop: (n: number, name: string) => `${n} 件候選商品屬於${name}，比去年同期 `,
      linesNote: (period: string | null) => `${period ? `${period} ` : ''}各險種新契約保費比去年同期`,
      yieldNote: (latest: string, meaning: string) => `目前 ${latest}，${meaning}`,
      yieldChart: '近 12 個月每日',
    },
    lineTag: (n: number) => `${n} 件候選`,
    yield: {
      inYear: '一年 ',
      flat: '持平',
      upMeaning: '儲蓄型商品較有定價空間',
      downMeaning: '儲蓄型商品定價空間縮小',
      flatMeaning: '儲蓄型商品定價環境不變',
    },
    // 同業排名
    ranking: {
      gap: '⋯',
      selfLead: (name: string) => `${name}排`,
      shareTail: (v: string) => `，市占率 ${v}`,
      behind: (rank: number, name: string, v: string) => `比第 ${rank} 名${name}少 ${v}%`,
      ahead: (rank: number, name: string, v: string) => `比第 ${rank} 名${name}多 ${v}%`,
    },
    channel: {
      heading: (v: string) => `銀行通路占 ${v}，是法巴的主力通路`,
    },
    // 法巴市占率過去五年（2026-11-01）
    selfShare: {
      title: '法巴新契約保費市占率（過去五年）',
      years: (n: number) => `近 ${n} 年`,
      sincePeriod: (p: string) => `自 ${p} `,
      from: (v: string) => `從 ${v} `,
      up: '升到 ',
      down: '降到 ',
      pending: '資料準備中',
      pendingNote: (v: string | null) => (v ? `目前只有最新一期 ${v}，等過去五年的資料` : '等過去五年的資料'),
    },
    change: {
      up: '▲',
      down: '▼',
      flat: '持平',
      /** 「較前一交易日」→「與前一交易日持平」；沒有基準時只寫「持平」 */
      flatWith: (label: string | null) => (label ? `與${label.replace(/^較/, '')}持平` : '持平'),
    },
  },

  // 新聞與法規監控（2026-10-20 經確認）
  news: {
    title: '新聞與法規監控',
    domains: {
      product_channel: '商品與通路動態',
      market_macro: '市場與總經情勢',
      regulation: '監理法規',
      claims_consumer: '理賠與消保',
      customer_brand: '客群經營與品牌公關',
      none: '未分類',
    },
    affectsToggle: '只看可能相關追蹤清單商品',
    // 關鍵字比對，不是影響判斷：一律寫「可能相關」，不寫「影響」
    affects: (n: number) => `可能相關追蹤清單 ${n} 項商品`,
    sameCategory: (n: number) => `同險種 ${n} 項`,
    selfReported: '業者自述',
    company: (name: string) => `（${name}）`,
    showMore: '顯示更多',
    // 清單（2026-10-27 視覺改版 V5，參考 ITIS 每日新聞）：日期膠囊＋依領域分組
    datesLabel: '出版日期',
    last30: '近 30 天',
    groupEmpty: '這段期間沒有項目',
    collapse: '收合',
    expand: '展開',
    emptyAffects: '目前沒有與追蹤清單商品可能相關的項目。',
    // 第一個畫面（2026-11-01 顯示資料整理）
    leadRecent: '近 30 天',
    original: '原文 ↗',
    regulationCount: (n: number) => `法規 ${n} 則`,
    productTail: (n: number) => `、同業商品與通路動態 ${n} 則`,
    count: (n: number) => `${n} 則`,
    range: (from: string, to: string) => `${from}–${to}`,
    allItems: '全部動態',
    // 重點新聞（lib/newsPicks.ts，2026-11-01 第二輪）
    pick: {
      heading: '重點新聞',
      note: '和法巴、候選商品最有關的幾則',
      starHint: '重點新聞',
      self: '和法巴有關',
      bank: '銀行通路',
      product: (theme: string) => `和候選商品有關：${theme}`,
    },
  },

  // 相對時間（市場總覽動態）
  time: {
    minutesAgo: (n: number) => `${n} 分鐘前`,
    hoursAgo: (n: number) => `${n} 小時前`,
    today: '今天',
    yesterday: '昨天',
    daysAgo: (n: number) => `${n} 天前`,
  },

  // 追蹤清單（2026-10-20 經確認）
  watchlist: {
    title: '追蹤清單',
    compare: { rank: '名次', product: '商品', actions: '操作' },
    remove: '移出',
    removed: (name: string) => `已移出「${name}」。`,
    undo: '復原',
    missing: (id: string) => `找不到此報告（${id}）`,
    empty: '還沒有追蹤的商品。到「競品研究」打開報告，按右上角「加入追蹤清單」。',
    goResearch: '前往競品研究 →',
    addFromResearch: '＋ 到競品研究加入商品 →',
    homeEmpty: '還沒有追蹤的商品。在報告頁右上角按「加入追蹤清單」。',
    homeSuggestLead: (n: number) => `還沒有追蹤的商品。最值得看的 ${n} 件，可以直接加入：`,
    homeSuggestNote: '也可以在競品研究列表或報告頁加入。',
    add: '☆ 加入追蹤清單',
    added: '★ 已在追蹤清單',
    addedShort: '★ 已追蹤',
    // 競品研究列表的追蹤欄（2026-10-31）
    column: '追蹤',
    listAdd: '＋ 追蹤',
    listAdded: '★ 已追蹤',
    listAddHint: '加入追蹤清單（不會打開報告）',
    listRemoveHint: '已在追蹤清單；再按一次移出',
    viewList: '看追蹤清單 →',
  },

  schemaMismatch: '報告格式版本不符，部分內容可能無法正確顯示',

  report: {
    // 報告頁最上方（2026-10-27 V3）
    nav: {
      label: '報告切換',
      back: (label: string) => `← 回${label}`,
      prev: '‹ 上一份',
      next: '下一份 ›',
      position: (i: number, n: number) => `${i} / ${n}`,
    },
    print: '列印／另存 PDF',
    generatedDate: (d: string) => `產出日期 ${d}`,
    reasons: '判定理由',
    brandNote: '品牌定位：',
    brandNoteSource: '來源',
    mechanism: '商品機制',
    // 商品概要（lib/productIntro.ts，2026-11-01）
    intro: {
      title: '商品概要',
      forWhom: '目標客群',
      trigger: '給付條件',
      riders: '附約',
      age: (n: string) => `${n} 歲`,
      ageRange: (a: string, b: string) => `${a}–${b} 歲`,
      ageTo: '至',
      ageFrom: (a: string) => `${a}起`,
      ageUpTo: (b: string) => `最高 ${b}`,
      launch: (y: number, m: number) => `${y} 年 ${m} 月`,
      facts: { age: '承保年齡', premium: '繳費', period: '保障期間', payout: '給付', launch: '上市' },
    },
    notProvided: '未提供',
    rawStatus: (s: string) => `（原始值：${s}）`,
    skipReason: (s: string) => `（原因：${s}）`,
    indicators: {
      demandLevel: '需求等級',
      confidence: '信心等級',
      researchStatus: '研究狀態',
      comparability: '可比程度',
      pricingFlagCount: '定價提示數',
    },
    blockersTitle: '待解決事項',
    // 顯示資料整理（2026-11-01）：三個問題回答「適不適合引進」
    answers: {
      marketQ: '有多少人會買？',
      marketLabel: '台灣潛在市場（中間情境，年繳保費）',
      marketLink: '看市場估算 ↓',
      regulatoryQ: '法規過得了嗎？',
      regulatoryLabel: '法規判斷',
      regulatoryLink: '看卡在哪裡 ↓',
      competitorQ: '台灣已經有誰在賣？',
      competitorLabel: '台灣直接競品',
      competitorLink: '看競品比較 ↓',
      count: (n: number) => `${n} 件`,
      blocking: (n: number) => `還有 ${n} 項阻斷要先解決`,
      noBlocking: '沒有阻斷項目',
      similarOnly: (n: number) => `沒有直接競品，有 ${n} 項類似商品`,
      noScore: '尚未判斷',
      noData: '沒有資料',
    },
    gapsTitle: (n: number) => (n > 0 ? `還差什麼才能決定（阻斷 ${n} 項）` : '還差什麼才能決定'),
    noGaps: '沒有阻斷項目，可以進入下一步。',
    otherWarnings: (n: number) => `其他注意事項（${n} 項）`,
    sourceDocsToggle: (n: number) => `商品原始資料 ${n} 份`,
    // 閱讀路徑重排（2026-10-27 V4）
    blockerTotal: (n: number) => `${n} 項`,
    blockerBreakdown: (c: number, b: number, w: number) => `重大 ${c} · 阻斷 ${b} · 注意 ${w}`,
    showBlockers: '看待解決事項',
    showAllBlockers: (n: number, w: number) => `看全部 ${n} 項（另有注意 ${w} 項）▾`,
    showAllSteps: (n: number) => `看全部 ${n} 項 ▾`,
    collapse: '收合 ▴',
    reasonsTitle: '判斷理由',
    // 台灣競品比較（後端需求 M1；2026-10-31）
    competitors: {
      headingDirect: (direct: number, other: number) => `台灣有 ${direct} 項直接競品${other > 0 ? `、${other} 項類似商品` : ''}`,
      headingNone: (n: number) => (n > 0 ? `台灣沒有直接競品，列出 ${n} 項類似商品` : '台灣沒有直接競品'),
      dimension: '比較項目',
      direct: '直接競品',
      similar: '類似商品',
      source: '條款 ↗',
      currency: '幣別',
      premiumMode: '繳費方式',
      difference: '與本商品差異',
      gapTitle: '差異分析',
      level: (l: string) => `證據等級 ${l}`,
      scrollHint: '表格可左右捲動',
    },
    // 商品原始資料（1.json source_documents；2026-10-31）
    sourceDocs: {
      title: (n: number) => `商品原始資料（${n} 份）`,
      headerLink: (n: number) => `原始資料 ${n} 份 ↓`,
      note: '國外商品的官方新聞稿、說明書與監理文件，開新分頁',
      back: '↑ 回到頁首',
    },
    detailsDivider: '詳細資料',
    nextStepsTitle: '建議下一步',
    ownerAllProducts: (owner: string) => `看${owner}在所有商品的事項 →`,
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
      asOf: (d: string) => ` · 資料日期 ${d}`,
      evidenceLevel: (level: string) => `證據等級 ${level}`,
      findingSources: '來源',
      findingEvidence: (level: string, label: string | null) => (label ? `可信度 ${level}：${label}` : `可信度 ${level}`),
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
    tenThousandNtd: '萬元',
    ntdShort: '元',
    /** 市場脈動 unit（M5） */
    perTenThousand: '萬分比',
    rank: '名',
  },

  charts: {
    noData: '無資料',
  },

  // 第 9.1 節：research_status 固定標籤（legend 查不到時使用）
  researchStatus: {
    sufficient_evidence: '證據充分',
    partial_evidence: '部分證據',
    insufficient_evidence: '證據不足',
  },
} as const;
