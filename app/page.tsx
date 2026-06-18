"use client";

import { useMemo, useState } from "react";

const categoryOptions = [
  "全部",
  "市場商品",
  "交易下單",
  "財報指標",
  "估值指標",
  "報酬風險",
  "總經與利率",
  "投資策略",
  "進階商品",
] as const;

const levelOptions = ["全部", "基礎", "進階", "風險提醒"] as const;

type Category = Exclude<(typeof categoryOptions)[number], "全部">;
type Level = Exclude<(typeof levelOptions)[number], "全部">;

type Term = {
  id: string;
  category: Category;
  level: Level;
  termZh: string;
  termEn: string;
  aliases: string[];
  definition: string;
  context: string;
  example: string;
  note: string;
  relatedIds: string[];
};

const terms: Term[] = [
  {
    id: "stock",
    category: "市場商品",
    level: "基礎",
    termZh: "股票",
    termEn: "Stock / Share",
    aliases: ["equity", "common stock", "普通股"],
    definition: "股票代表對一家公司的部分所有權，股東會隨公司價值與市場預期承擔漲跌。",
    context: "看單一公司時會用到，例如 Apple、Microsoft、NVIDIA 這類上市公司股票。",
    example: "買進 10 股某公司股票，代表你持有那家公司很小的一部分權益。",
    note: "股票不是固定收益商品，價格可能因財報、利率、產業週期和市場情緒大幅波動。",
    relatedIds: ["market-cap", "eps", "pe"],
  },
  {
    id: "etf",
    category: "市場商品",
    level: "基礎",
    termZh: "ETF",
    termEn: "Exchange-Traded Fund",
    aliases: ["指數股票型基金", "exchange traded fund", "spy", "qqq", "voo"],
    definition: "ETF 是在交易所買賣的一籃子資產，常用來追蹤指數、產業、債券或其他主題。",
    context: "想分散投資、追蹤大盤或特定產業時常會看到 ETF。",
    example: "追蹤 S&P 500 的 ETF 會持有或模擬一籃子大型美國公司股票。",
    note: "ETF 仍有費用率、追蹤誤差、流動性與折溢價問題，名稱相似不代表風險相同。",
    relatedIds: ["index", "expense-ratio", "leveraged-etf"],
  },
  {
    id: "index",
    category: "市場商品",
    level: "基礎",
    termZh: "指數",
    termEn: "Index",
    aliases: ["s&p 500", "nasdaq 100", "dow jones", "sp500", "nasdaq"],
    definition: "指數是一組證券的表現衡量標準，用來觀察市場、產業或策略的整體變化。",
    context: "新聞說美股大盤上漲，通常是在說 S&P 500、Nasdaq 或 Dow Jones 等指數。",
    example: "S&P 500 約代表美國大型股市場的整體走勢。",
    note: "指數本身不能直接買賣，通常透過 ETF、基金或衍生品取得曝險。",
    relatedIds: ["etf", "diversification", "market-cap"],
  },
  {
    id: "adr",
    category: "市場商品",
    level: "進階",
    termZh: "美國存託憑證",
    termEn: "ADR",
    aliases: ["american depositary receipt", "存託憑證"],
    definition: "ADR 讓美國投資人能在美國市場交易外國公司的憑證，價格通常對應海外原股。",
    context: "想投資非美國公司但在美股交易時會看到，例如部分台灣、歐洲或中國企業。",
    example: "某外國公司可能同時有本國普通股與在美國掛牌的 ADR。",
    note: "ADR 可能有匯率、海外監管、存託費與流動性差異，不等同於直接持有當地股票。",
    relatedIds: ["stock", "spread", "currency-risk"],
  },
  {
    id: "market-cap",
    category: "市場商品",
    level: "基礎",
    termZh: "市值",
    termEn: "Market Capitalization",
    aliases: ["market cap", "capitalization"],
    definition: "市值是股價乘以流通股數，代表市場給一家公司的整體權益估值。",
    context: "常用來區分大型股、中型股、小型股，也常影響指數權重。",
    example: "股價 100 美元、流通股數 10 億股，市值約為 1,000 億美元。",
    note: "市值不是公司帳上現金，也不等於收購一家公司實際要付出的全部成本。",
    relatedIds: ["stock", "index", "ev-ebitda"],
  },
  {
    id: "market-order",
    category: "交易下單",
    level: "基礎",
    termZh: "市價單",
    termEn: "Market Order",
    aliases: ["市價買進", "市價賣出"],
    definition: "市價單會盡快以市場可成交價格買進或賣出，重點是成交速度而不是指定價格。",
    context: "常用在高流動性商品，但在波動大或盤前盤後可能出現較差成交價。",
    example: "你下市價買進，實際成交價可能和畫面上最後成交價不同。",
    note: "市價單不保證成交價格，流動性差時可能發生明顯滑價。",
    relatedIds: ["limit-order", "bid-ask", "spread"],
  },
  {
    id: "limit-order",
    category: "交易下單",
    level: "基礎",
    termZh: "限價單",
    termEn: "Limit Order",
    aliases: ["限價買進", "限價賣出"],
    definition: "限價單指定可接受的最高買價或最低賣價，重點是價格控制。",
    context: "想避免用太高價格買進或太低價格賣出時常用。",
    example: "買進限價 50 美元代表只會在 50 美元或更低價格成交。",
    note: "限價單不保證成交，市場沒有碰到你的價格時可能完全沒成交。",
    relatedIds: ["market-order", "bid-ask", "spread"],
  },
  {
    id: "bid-ask",
    category: "交易下單",
    level: "基礎",
    termZh: "買價與賣價",
    termEn: "Bid / Ask",
    aliases: ["bid", "ask", "買盤", "賣盤"],
    definition: "Bid 是買方願意出的最高價，Ask 是賣方願意接受的最低價。",
    context: "下單前看 Bid/Ask 可以理解目前市場願意交易的價格區間。",
    example: "Bid 99.90、Ask 100.00，代表立即買進可能接近 100.00 成交。",
    note: "報價會一直變動，盤前盤後和冷門標的的 Bid/Ask 可能差距很大。",
    relatedIds: ["spread", "market-order", "limit-order"],
  },
  {
    id: "spread",
    category: "交易下單",
    level: "風險提醒",
    termZh: "買賣價差",
    termEn: "Bid-Ask Spread",
    aliases: ["spread", "價差"],
    definition: "買賣價差是 Ask 與 Bid 的差距，常反映交易成本、流動性與市場壓力。",
    context: "短線交易、冷門 ETF、盤前盤後交易尤其需要注意。",
    example: "Bid 20.00、Ask 20.20，價差是 0.20 美元。",
    note: "價差越大，進出場成本越高；用市價單可能更容易吃到不利價格。",
    relatedIds: ["bid-ask", "market-order", "liquidity"],
  },
  {
    id: "liquidity",
    category: "交易下單",
    level: "進階",
    termZh: "流動性",
    termEn: "Liquidity",
    aliases: ["成交量", "volume", "流動性風險"],
    definition: "流動性描述資產能否用合理價格快速買賣，通常與成交量、買賣價差和市場深度有關。",
    context: "交易冷門股票、特殊 ETF 或盤前盤後時，流動性會直接影響成交品質。",
    example: "熱門大型股通常流動性高，冷門小型股可能掛單少且價差大。",
    note: "高成交量不一定永遠安全，壓力時期流動性可能突然消失。",
    relatedIds: ["spread", "market-order", "volume"],
  },
  {
    id: "volume",
    category: "交易下單",
    level: "基礎",
    termZh: "成交量",
    termEn: "Trading Volume",
    aliases: ["volume", "交易量"],
    definition: "成交量是在一段時間內完成交易的股數或單位數，用來觀察市場參與程度。",
    context: "價格突破、財報公布或重大新聞時，成交量常被用來判斷市場反應是否強烈。",
    example: "某股票平常每天成交 100 萬股，財報日成交 800 萬股，代表交易明顯放大。",
    note: "成交量只能說明交易活躍，不直接代表價格一定會繼續上漲或下跌。",
    relatedIds: ["liquidity", "volatility", "market-order"],
  },
  {
    id: "revenue",
    category: "財報指標",
    level: "基礎",
    termZh: "營收",
    termEn: "Revenue",
    aliases: ["sales", "top line", "銷售額"],
    definition: "營收是公司銷售商品或服務取得的收入，是損益表最上方的重要項目。",
    context: "評估公司成長時，常先看營收是否持續增加以及成長來源是否健康。",
    example: "一家軟體公司的訂閱收入增加，通常會反映在營收成長。",
    note: "營收成長不等於獲利成長，仍要看成本、費用與毛利率。",
    relatedIds: ["gross-margin", "eps", "free-cash-flow"],
  },
  {
    id: "eps",
    category: "財報指標",
    level: "基礎",
    termZh: "每股盈餘",
    termEn: "EPS",
    aliases: ["earnings per share", "每股獲利"],
    definition: "EPS 是公司獲利分攤到每一股後的金額，常用來衡量股東角度的獲利能力。",
    context: "財報新聞常比較實際 EPS 與分析師預期 EPS。",
    example: "公司淨利 10 億美元、流通股數 5 億股，EPS 約為 2 美元。",
    note: "EPS 可能受庫藏股、一次性損益或會計項目影響，不能單獨判斷公司品質。",
    relatedIds: ["pe", "revenue", "guidance"],
  },
  {
    id: "gross-margin",
    category: "財報指標",
    level: "進階",
    termZh: "毛利率",
    termEn: "Gross Margin",
    aliases: ["毛利", "gross profit margin"],
    definition: "毛利率是毛利占營收的比例，反映產品或服務扣除直接成本後的獲利空間。",
    context: "用來比較同產業公司的定價能力、成本控制和產品組合變化。",
    example: "營收 100、銷貨成本 40，毛利 60，毛利率為 60%。",
    note: "不同產業毛利率差異很大，軟體、零售、製造業不能直接用同一標準比較。",
    relatedIds: ["revenue", "free-cash-flow", "operating-margin"],
  },
  {
    id: "operating-margin",
    category: "財報指標",
    level: "進階",
    termZh: "營業利益率",
    termEn: "Operating Margin",
    aliases: ["operating income margin", "營業利潤率"],
    definition: "營業利益率是營業利益占營收的比例，反映本業在扣除營運費用後的獲利能力。",
    context: "評估公司規模化、費用控制和本業獲利品質時常用。",
    example: "營收 100、營業利益 25，營業利益率為 25%。",
    note: "一次性費用、研發投入和景氣循環都可能影響營業利益率。",
    relatedIds: ["gross-margin", "free-cash-flow", "eps"],
  },
  {
    id: "free-cash-flow",
    category: "財報指標",
    level: "進階",
    termZh: "自由現金流",
    termEn: "Free Cash Flow",
    aliases: ["fcf", "free cash flow", "自由現金流量"],
    definition: "自由現金流通常指營運現金流扣除資本支出後，公司可用於還債、回購、配息或再投資的現金。",
    context: "評估公司獲利是否能轉成真實現金時非常重要。",
    example: "公司營運現金流 50 億美元，資本支出 15 億美元，自由現金流約 35 億美元。",
    note: "資本密集產業的自由現金流可能波動很大，需搭配產業週期判讀。",
    relatedIds: ["revenue", "operating-margin", "dividend"],
  },
  {
    id: "guidance",
    category: "財報指標",
    level: "進階",
    termZh: "財測",
    termEn: "Guidance",
    aliases: ["outlook", "公司展望", "業績指引"],
    definition: "財測是公司管理層對未來營收、獲利、毛利率或其他指標的預估。",
    context: "財報後股價常不只反映過去結果，也反映管理層對下一季或全年展望。",
    example: "公司本季 EPS 優於預期，但下季財測低於市場預期，股價仍可能下跌。",
    note: "財測不是保證，管理層也可能因市場環境變化而上修或下修。",
    relatedIds: ["eps", "revenue", "volatility"],
  },
  {
    id: "pe",
    category: "估值指標",
    level: "基礎",
    termZh: "本益比",
    termEn: "P/E Ratio",
    aliases: ["price to earnings", "per", "pe ratio"],
    definition: "本益比是股價除以每股盈餘，表示市場願意為每一元獲利支付多少價格。",
    context: "用來粗略比較公司估值，但通常要和成長率、利率、產業特性一起看。",
    example: "股價 100 美元、EPS 5 美元，本益比為 20 倍。",
    note: "虧損公司沒有有意義的 P/E，高成長公司也可能長期維持較高本益比。",
    relatedIds: ["eps", "pb", "ev-ebitda"],
  },
  {
    id: "pb",
    category: "估值指標",
    level: "進階",
    termZh: "股價淨值比",
    termEn: "P/B Ratio",
    aliases: ["price to book", "pb ratio", "市淨率"],
    definition: "股價淨值比是股價除以每股帳面淨值，常用於金融、資產型公司或週期股分析。",
    context: "銀行、保險和資產負債表重要的公司，P/B 有時比 P/E 更有參考性。",
    example: "每股淨值 40 美元、股價 60 美元，P/B 為 1.5 倍。",
    note: "無形資產、商譽和資產品質會影響帳面淨值的參考性。",
    relatedIds: ["pe", "market-cap", "ev-ebitda"],
  },
  {
    id: "ev-ebitda",
    category: "估值指標",
    level: "進階",
    termZh: "企業價值倍數",
    termEn: "EV / EBITDA",
    aliases: ["enterprise value", "ebitda multiple", "ev ebitda"],
    definition: "EV/EBITDA 用企業價值除以稅息折舊攤提前盈餘，常用來比較資本結構不同的公司。",
    context: "併購、產業比較和高負債公司估值時常會使用。",
    example: "企業價值 1,000 億美元、EBITDA 100 億美元，EV/EBITDA 為 10 倍。",
    note: "EBITDA 不等於現金流，也忽略資本支出與營運資金需求。",
    relatedIds: ["market-cap", "free-cash-flow", "pe"],
  },
  {
    id: "expense-ratio",
    category: "估值指標",
    level: "基礎",
    termZh: "費用率",
    termEn: "Expense Ratio",
    aliases: ["管理費", "基金費用", "expense"],
    definition: "費用率是基金或 ETF 每年向資產收取的費用比例，會直接侵蝕投資報酬。",
    context: "比較 ETF 或共同基金時，費用率是最容易被忽略但長期很重要的成本。",
    example: "費用率 0.03% 代表每年每 10,000 美元資產約收 3 美元費用。",
    note: "費用率低不代表一定好，仍要看追蹤標的、流動性、稅務與風險。",
    relatedIds: ["etf", "tracking-error", "index"],
  },
  {
    id: "tracking-error",
    category: "估值指標",
    level: "進階",
    termZh: "追蹤誤差",
    termEn: "Tracking Error",
    aliases: ["tracking difference", "指數追蹤誤差"],
    definition: "追蹤誤差衡量基金或 ETF 與其追蹤指數之間的報酬差異。",
    context: "比較同類 ETF 是否有效追蹤標的時會用到。",
    example: "同樣追蹤某指數的兩檔 ETF，追蹤誤差較低者通常更貼近標的表現。",
    note: "費用、抽樣策略、交易成本、稅務和市場流動性都會造成追蹤差異。",
    relatedIds: ["etf", "expense-ratio", "liquidity"],
  },
  {
    id: "dividend",
    category: "報酬風險",
    level: "基礎",
    termZh: "股息",
    termEn: "Dividend",
    aliases: ["dividend yield", "殖利率", "配息"],
    definition: "股息是公司將部分現金或盈餘分配給股東，殖利率則是年度股息相對股價的比例。",
    context: "重視現金流或防禦型股票時，投資人常會看股息與配息穩定度。",
    example: "一年配息 3 美元、股價 100 美元，殖利率約為 3%。",
    note: "高殖利率可能是股價下跌造成，也可能暗示市場擔心未來配息不可持續。",
    relatedIds: ["free-cash-flow", "drawdown", "yield"],
  },
  {
    id: "volatility",
    category: "報酬風險",
    level: "基礎",
    termZh: "波動率",
    termEn: "Volatility",
    aliases: ["波動", "price swing", "standard deviation"],
    definition: "波動率描述價格變動幅度，常用來衡量投資持有過程中的不確定性。",
    context: "成長股、財報前後、升息週期或市場恐慌時，波動率可能上升。",
    example: "同樣一年報酬 10%，波動較大的資產持有體驗可能更難承受。",
    note: "波動率不是唯一風險；流動性、槓桿、估值和基本面惡化也很重要。",
    relatedIds: ["beta", "drawdown", "options"],
  },
  {
    id: "beta",
    category: "報酬風險",
    level: "進階",
    termZh: "貝他值",
    termEn: "Beta",
    aliases: ["market beta", "系統性風險"],
    definition: "Beta 衡量一檔股票相對整體市場的敏感度，常用來估計市場波動對該股票的影響。",
    context: "投資組合風險、資產配置和 CAPM 模型中常出現。",
    example: "Beta 為 1.5 的股票，理論上可能比市場指數波動更大。",
    note: "Beta 來自歷史資料，不能保證未來關係維持不變。",
    relatedIds: ["volatility", "drawdown", "diversification"],
  },
  {
    id: "drawdown",
    category: "報酬風險",
    level: "風險提醒",
    termZh: "回撤",
    termEn: "Drawdown",
    aliases: ["最大回撤", "max drawdown"],
    definition: "回撤是資產從高點下跌到低點的幅度，用來衡量持有期間可能承受的下跌壓力。",
    context: "比較策略或基金時，不只看年化報酬，也常看最大回撤。",
    example: "投資組合從 100 萬跌到 70 萬，回撤為 30%。",
    note: "高報酬策略若回撤過大，投資人可能在最差時點承受不住而賣出。",
    relatedIds: ["volatility", "diversification", "margin"],
  },
  {
    id: "currency-risk",
    category: "報酬風險",
    level: "進階",
    termZh: "匯率風險",
    termEn: "Currency Risk",
    aliases: ["foreign exchange risk", "fx risk", "匯損"],
    definition: "匯率風險是投資報酬因本國貨幣與投資標的計價貨幣變動而受影響。",
    context: "台灣投資人買美元資產時，除了標的漲跌，美元兌台幣匯率也會影響換回台幣的結果。",
    example: "美股上漲 5%，但美元兌台幣下跌，換回台幣後報酬可能被抵消一部分。",
    note: "匯率可能放大或降低投資報酬，尤其在短期或需要換匯使用資金時更明顯。",
    relatedIds: ["adr", "yield", "diversification"],
  },
  {
    id: "diversification",
    category: "投資策略",
    level: "基礎",
    termZh: "分散投資",
    termEn: "Diversification",
    aliases: ["資產配置", "分散風險"],
    definition: "分散投資是將資金配置到不同標的、產業、地區或資產類別，以降低單一風險衝擊。",
    context: "建立長期投資組合時，分散程度通常比單一熱門標的更重要。",
    example: "同時持有大型股 ETF、債券和現金，風險來源比只持有一檔股票更分散。",
    note: "分散不能消除市場整體下跌風險，也可能降低押中單一標的時的高報酬。",
    relatedIds: ["etf", "drawdown", "beta"],
  },
  {
    id: "dca",
    category: "投資策略",
    level: "基礎",
    termZh: "定期定額",
    termEn: "Dollar-Cost Averaging",
    aliases: ["dca", "定投", "平均成本法"],
    definition: "定期定額是在固定時間投入固定金額，減少一次投入時點選擇的壓力。",
    context: "長期累積 ETF 或退休投資時常被使用。",
    example: "每月投入 500 美元買進同一檔 ETF，不因短期漲跌改變金額。",
    note: "定期定額不保證獲利；若標的長期下跌，仍可能虧損。",
    relatedIds: ["etf", "diversification", "drawdown"],
  },
  {
    id: "growth-value",
    category: "投資策略",
    level: "基礎",
    termZh: "成長股與價值股",
    termEn: "Growth / Value Stocks",
    aliases: ["growth stock", "value stock", "成長投資", "價值投資"],
    definition: "成長股重視未來營收與獲利擴張，價值股重視價格相對資產或獲利是否便宜。",
    context: "市場風格輪動、利率變化和景氣循環常影響成長股與價值股表現。",
    example: "高研發、高營收成長的科技公司常被視為成長股；低估值、高配息的成熟企業可能被視為價值股。",
    note: "成長與價值不是絕對二分，同一家公司在不同價格下可能具有不同投資屬性。",
    relatedIds: ["pe", "free-cash-flow", "interest-rate"],
  },
  {
    id: "rebalance",
    category: "投資策略",
    level: "進階",
    termZh: "再平衡",
    termEn: "Rebalancing",
    aliases: ["portfolio rebalance", "投資組合再平衡"],
    definition: "再平衡是把投資組合調回目標配置比例，控制風險曝險不要偏離原本規劃太多。",
    context: "股債配置、不同市場 ETF 或長期資產配置策略常需要定期檢查。",
    example: "原本目標股票 70%、債券 30%，股票大漲後變 80%，賣出部分股票買債券可回到目標比例。",
    note: "再平衡可能產生交易成本與稅務影響，頻率過高也可能削弱趨勢收益。",
    relatedIds: ["diversification", "drawdown", "dca"],
  },
  {
    id: "interest-rate",
    category: "總經與利率",
    level: "基礎",
    termZh: "利率",
    termEn: "Interest Rate",
    aliases: ["fed funds rate", "聯邦基金利率", "升息", "降息"],
    definition: "利率是資金的價格，會影響企業融資成本、債券價格、估值折現率和投資人風險偏好。",
    context: "美國聯準會政策利率變化常牽動美股估值與市場情緒。",
    example: "利率上升時，高估值成長股可能因未來現金流折現更低而承壓。",
    note: "利率影響方向不只一種，仍要看通膨、成長、企業獲利與市場預期。",
    relatedIds: ["fomc", "yield-curve", "growth-value"],
  },
  {
    id: "fomc",
    category: "總經與利率",
    level: "進階",
    termZh: "聯邦公開市場委員會",
    termEn: "FOMC",
    aliases: ["federal open market committee", "fed meeting", "聯準會會議"],
    definition: "FOMC 是美國聯準會制定貨幣政策的重要委員會，市場關注其利率決策與政策聲明。",
    context: "FOMC 會議、點陣圖與主席記者會常影響股債匯市場。",
    example: "市場原本預期降息，但 FOMC 聲明偏鷹，科技股可能短線承壓。",
    note: "市場反應常取決於實際結果與預期差，而不是單純升息或降息。",
    relatedIds: ["interest-rate", "yield-curve", "cpi"],
  },
  {
    id: "yield",
    category: "總經與利率",
    level: "基礎",
    termZh: "殖利率",
    termEn: "Yield",
    aliases: ["bond yield", "treasury yield", "收益率"],
    definition: "殖利率是投資取得現金流相對價格的比例，債券殖利率常被用來觀察市場利率環境。",
    context: "美國十年期公債殖利率常被用作估值、房貸利率和風險資產定價的重要參考。",
    example: "公債價格下跌時，殖利率通常上升。",
    note: "股息殖利率與債券殖利率概念相近但風險不同，不能只看數字高低。",
    relatedIds: ["yield-curve", "interest-rate", "dividend"],
  },
  {
    id: "yield-curve",
    category: "總經與利率",
    level: "進階",
    termZh: "殖利率曲線",
    termEn: "Yield Curve",
    aliases: ["treasury curve", "inverted yield curve", "殖利率倒掛"],
    definition: "殖利率曲線呈現不同期限債券的殖利率，常用來觀察市場對經濟、通膨與利率的預期。",
    context: "短天期利率高於長天期利率時稱為倒掛，市場常討論其與景氣循環的關係。",
    example: "2 年期美債殖利率高於 10 年期，被稱為殖利率曲線倒掛。",
    note: "倒掛不是精準計時工具，市場可能在倒掛後很久才反映景氣壓力。",
    relatedIds: ["yield", "fomc", "interest-rate"],
  },
  {
    id: "cpi",
    category: "總經與利率",
    level: "進階",
    termZh: "消費者物價指數",
    termEn: "CPI",
    aliases: ["consumer price index", "通膨", "inflation"],
    definition: "CPI 衡量一籃子消費商品與服務價格變化，是市場觀察通膨的重要指標。",
    context: "CPI 高於預期時，市場可能重新評估聯準會降息或升息路徑。",
    example: "核心 CPI 降溫可能讓市場期待利率壓力下降。",
    note: "CPI 只是通膨指標之一，市場也會看 PCE、薪資、租金和商品價格。",
    relatedIds: ["fomc", "interest-rate", "yield"],
  },
  {
    id: "options",
    category: "進階商品",
    level: "風險提醒",
    termZh: "選擇權",
    termEn: "Options",
    aliases: ["call", "put", "option", "calls", "puts"],
    definition: "選擇權是一種衍生性商品，給買方在特定條件下買進或賣出標的的權利。",
    context: "市場常用選擇權避險、槓桿交易、收益策略或表達事件預期。",
    example: "買進買權可能受標的價格、時間價值和隱含波動率共同影響。",
    note: "選擇權可能快速歸零，也可能因槓桿與保證金造成超出預期的損失，需先理解規則與風險。",
    relatedIds: ["volatility", "margin", "leverage"],
  },
  {
    id: "margin",
    category: "進階商品",
    level: "風險提醒",
    termZh: "融資交易",
    termEn: "Margin Trading",
    aliases: ["margin", "保證金", "margin call", "融資"],
    definition: "融資交易是向券商借款買進證券，投資人以帳戶資產作為擔保。",
    context: "想放大部位時會看到，但漲跌都會被放大，且需支付利息。",
    example: "用 5,000 美元自有資金搭配借款買進 10,000 美元股票，等於使用槓桿。",
    note: "價格下跌可能觸發追繳保證金或強制平倉，風險高於現金帳戶。",
    relatedIds: ["leverage", "drawdown", "short-selling"],
  },
  {
    id: "leverage",
    category: "進階商品",
    level: "風險提醒",
    termZh: "槓桿",
    termEn: "Leverage",
    aliases: ["槓桿倍數", "leveraged"],
    definition: "槓桿是用借款或衍生品放大資產曝險，使報酬與損失都可能被放大。",
    context: "融資、期貨、選擇權與槓桿 ETF 都可能涉及槓桿。",
    example: "2 倍槓桿代表標的上漲或下跌時，理論曝險約放大成 2 倍。",
    note: "槓桿會放大錯誤與波動，長期持有槓桿產品還可能受到複利路徑影響。",
    relatedIds: ["margin", "leveraged-etf", "options"],
  },
  {
    id: "leveraged-etf",
    category: "進階商品",
    level: "風險提醒",
    termZh: "槓桿 ETF",
    termEn: "Leveraged ETF",
    aliases: ["反向 ETF", "inverse etf", "2x etf", "3x etf"],
    definition: "槓桿 ETF 透過衍生品追求每日倍數或反向報酬，常見 2 倍、3 倍或反向產品。",
    context: "短線交易者可能用來表達方向，但它不是一般長期指數 ETF 的替代品。",
    example: "某 3 倍 ETF 目標是單日表現約為標的指數的 3 倍，而非長期三倍。",
    note: "長期持有會受每日再平衡、波動耗損與複利路徑影響，風險很高。",
    relatedIds: ["etf", "leverage", "volatility"],
  },
  {
    id: "short-selling",
    category: "進階商品",
    level: "風險提醒",
    termZh: "放空",
    termEn: "Short Selling",
    aliases: ["short", "short interest", "賣空"],
    definition: "放空是借入股票賣出，期待未來以更低價格買回歸還，從價格下跌中獲利。",
    context: "避險、事件交易或看空某公司時會使用。",
    example: "以 100 美元放空，若跌到 80 美元買回，未計成本前獲利 20 美元。",
    note: "放空理論損失沒有上限，且可能遇到借券成本、軋空與強制回補風險。",
    relatedIds: ["margin", "volatility", "leverage"],
  },
];

const sourceLinks = [
  {
    label: "Investor.gov 投資名詞表",
    href: "https://www.investor.gov/introduction-investing/investing-basics/glossary",
  },
  {
    label: "Investor.gov 訂單種類",
    href: "https://www.investor.gov/introduction-investing/investing-basics/how-stock-markets-work/types-orders",
  },
  {
    label: "SEC ETF 與共同基金指南",
    href: "https://www.sec.gov/investor/pubs/sec-guide-to-mutual-funds.pdf",
  },
  {
    label: "FINRA 投資者教育",
    href: "https://www.finra.org/investors",
  },
];

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}

function buildSearchText(term: Term) {
  return normalizeText(
    [
      term.termZh,
      term.termEn,
      term.category,
      term.level,
      term.definition,
      term.context,
      term.example,
      term.note,
      ...term.aliases,
    ].join(" ")
  );
}

const searchIndex = terms.map((term) => ({
  id: term.id,
  text: buildSearchText(term),
}));

const termById = new Map(terms.map((term) => [term.id, term]));

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-11 shrink-0 rounded-md border px-4 py-2 text-sm font-semibold transition ${
        active
          ? "border-[#0c6b4f] bg-[#0c6b4f] text-white shadow-sm"
          : "border-[#d7ded3] bg-white text-[#23332b] hover:border-[#0c6b4f] hover:text-[#0c6b4f]"
      }`}
    >
      {children}
    </button>
  );
}

function DetailPanel({
  term,
  onRelatedClick,
}: {
  term: Term;
  onRelatedClick: (id: string) => void;
}) {
  const relatedTerms = term.relatedIds
    .map((id) => termById.get(id))
    .filter((item): item is Term => Boolean(item));

  return (
    <article className="rounded-lg border border-[#d9e2d5] bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#657267]">{term.category}</p>
          <h2 className="mt-2 text-2xl font-bold text-[#14221a]">
            {term.termZh}
          </h2>
          <p className="mt-1 font-mono text-sm text-[#546157]">{term.termEn}</p>
        </div>
        <span
          className={`rounded-md px-3 py-1 text-sm font-bold ${
            term.level === "基礎"
              ? "bg-[#dff5e8] text-[#0c6b4f]"
              : term.level === "進階"
                ? "bg-[#e2efff] text-[#1e568d]"
                : "bg-[#fff0d9] text-[#8a4c08]"
          }`}
        >
          {term.level}
        </span>
      </div>

      <div className="mt-6 space-y-5">
        <section>
          <h3 className="text-sm font-bold text-[#0c6b4f]">定義</h3>
          <p className="mt-2 leading-7 text-[#25352c]">{term.definition}</p>
        </section>
        <section>
          <h3 className="text-sm font-bold text-[#0c6b4f]">使用情境</h3>
          <p className="mt-2 leading-7 text-[#25352c]">{term.context}</p>
        </section>
        <section>
          <h3 className="text-sm font-bold text-[#0c6b4f]">例子</h3>
          <p className="mt-2 leading-7 text-[#25352c]">{term.example}</p>
        </section>
        <section className="rounded-lg border border-[#f0d7aa] bg-[#fff8ea] p-4">
          <h3 className="text-sm font-bold text-[#8a4c08]">注意事項</h3>
          <p className="mt-2 leading-7 text-[#4a3520]">{term.note}</p>
        </section>
      </div>

      {relatedTerms.length > 0 ? (
        <section className="mt-6">
          <h3 className="text-sm font-bold text-[#657267]">相關名詞</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {relatedTerms.map((related) => (
              <button
                type="button"
                key={related.id}
                onClick={() => onRelatedClick(related.id)}
                className="min-h-10 rounded-md border border-[#cdd8c8] bg-[#f7faf5] px-3 py-2 text-sm font-semibold text-[#22352b] transition hover:border-[#0c6b4f] hover:text-[#0c6b4f]"
              >
                {related.termZh}
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] =
    useState<(typeof categoryOptions)[number]>("全部");
  const [level, setLevel] = useState<(typeof levelOptions)[number]>("全部");
  const [selectedId, setSelectedId] = useState(terms[0].id);

  const normalizedQuery = normalizeText(query);

  const filteredTerms = useMemo(() => {
    return terms.filter((term) => {
      const matchesCategory = category === "全部" || term.category === category;
      const matchesLevel = level === "全部" || term.level === level;
      const indexed = searchIndex.find((item) => item.id === term.id);
      const matchesQuery =
        normalizedQuery.length === 0 ||
        Boolean(indexed?.text.includes(normalizedQuery));

      return matchesCategory && matchesLevel && matchesQuery;
    });
  }, [category, level, normalizedQuery]);

  const activeTerm =
    filteredTerms.find((term) => term.id === selectedId) ??
    filteredTerms[0] ??
    terms.find((term) => term.id === selectedId) ??
    terms[0];

  function selectRelated(id: string) {
    setCategory("全部");
    setLevel("全部");
    setQuery("");
    setSelectedId(id);
    window.setTimeout(() => {
      document
        .getElementById("term-detail")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  return (
    <main className="min-h-[100svh] bg-[#f4f7f1] text-[#14221a]">
      <section className="border-b border-[#d9e2d5] bg-[#f4f7f1] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-[minmax(0,1.15fr)_minmax(17rem,0.85fr)] md:items-end">
          <div>
            <p className="text-sm font-bold text-[#0c6b4f]">US Equity Terms</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-[#14221a]">
              美股投資術語地圖
            </h1>
            <p className="mt-3 max-w-3xl leading-7 text-[#4b5b50]">
              從 ETF、財報、估值到 FOMC 與進階商品，把常見英文縮寫和中文語境放在同一張查詢表。
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-lg border border-[#d9e2d5] bg-white p-4 shadow-sm">
            <div>
              <p className="text-2xl font-bold text-[#0c6b4f]">{terms.length}</p>
              <p className="mt-1 text-xs font-semibold text-[#657267]">名詞</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1e568d]">
                {categoryOptions.length - 1}
              </p>
              <p className="mt-1 text-xs font-semibold text-[#657267]">分類</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#8a4c08]">3</p>
              <p className="mt-1 text-xs font-semibold text-[#657267]">層級</p>
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-0 z-20 border-b border-[#d9e2d5] bg-[#f4f7f1]/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-4">
          <label className="block">
            <span className="sr-only">搜尋名詞</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜尋 ETF、P/E、FOMC、自由現金流..."
              className="min-h-12 w-full rounded-lg border border-[#cdd8c8] bg-white px-4 text-base text-[#14221a] outline-none transition placeholder:text-[#879185] focus:border-[#0c6b4f] focus:ring-4 focus:ring-[#0c6b4f]/15"
            />
          </label>

          <div className="flex gap-3 overflow-x-auto pb-1">
            {categoryOptions.map((option) => (
              <FilterButton
                key={option}
                active={category === option}
                onClick={() => setCategory(option)}
              >
                {option}
              </FilterButton>
            ))}
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1">
            {levelOptions.map((option) => (
              <FilterButton
                key={option}
                active={level === option}
                onClick={() => setLevel(option)}
              >
                {option}
              </FilterButton>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-[minmax(0,25rem)_minmax(0,1fr)]">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-[#657267]">
                顯示 {filteredTerms.length} 個結果
              </p>
              {(query || category !== "全部" || level !== "全部") && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setCategory("全部");
                    setLevel("全部");
                  }}
                  className="min-h-10 rounded-md border border-[#cdd8c8] bg-white px-3 py-2 text-sm font-semibold text-[#22352b] transition hover:border-[#0c6b4f] hover:text-[#0c6b4f]"
                >
                  清除
                </button>
              )}
            </div>

            {filteredTerms.length > 0 ? (
              filteredTerms.map((term) => {
                const active = term.id === activeTerm.id;
                return (
                  <article
                    key={term.id}
                    className={`rounded-lg border bg-white shadow-sm transition ${
                      active
                        ? "border-[#0c6b4f] ring-4 ring-[#0c6b4f]/10"
                        : "border-[#d9e2d5]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedId(term.id)}
                      className="block w-full p-4 text-left"
                      aria-expanded={active}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-[#657267]">
                            {term.category}
                          </p>
                          <h2 className="mt-2 text-lg font-bold text-[#14221a]">
                            {term.termZh}
                          </h2>
                          <p className="mt-1 font-mono text-xs text-[#657267]">
                            {term.termEn}
                          </p>
                        </div>
                        <span
                          className={`rounded-md px-2.5 py-1 text-xs font-bold ${
                            term.level === "基礎"
                              ? "bg-[#dff5e8] text-[#0c6b4f]"
                              : term.level === "進階"
                                ? "bg-[#e2efff] text-[#1e568d]"
                                : "bg-[#fff0d9] text-[#8a4c08]"
                          }`}
                        >
                          {term.level}
                        </span>
                      </div>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#4b5b50]">
                        {term.definition}
                      </p>
                    </button>

                    {active ? (
                      <div className="border-t border-[#e3eadf] p-4 md:hidden">
                        <DetailPanel
                          term={term}
                          onRelatedClick={selectRelated}
                        />
                      </div>
                    ) : null}
                  </article>
                );
              })
            ) : (
              <div className="rounded-lg border border-[#d9e2d5] bg-white p-6 text-[#4b5b50]">
                沒有符合的名詞。可以換一個縮寫、中文詞或清除篩選。
              </div>
            )}
          </div>

          <aside id="term-detail" className="hidden md:block">
            <div className="sticky top-48">
              <DetailPanel term={activeTerm} onRelatedClick={selectRelated} />
            </div>
          </aside>
        </div>
      </section>

      <section className="border-t border-[#d9e2d5] bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-[#4b5b50] md:flex-row md:items-center md:justify-between">
          <p>內容為投資教育用途，不構成投資建議或交易推薦。</p>
          <div className="flex flex-wrap gap-3">
            {sourceLinks.map((source) => (
              <a
                key={source.href}
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[#0c6b4f] underline-offset-4 hover:underline"
              >
                {source.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
