# AlphaLoop 方法论（已融合）

本目录是 [AlphaLoop](https://github.com/realnaka/alphaloop)（MIT 协议）的方法论留档，作为
本项目「谣言验真」功能的设计出处与未来扩展参考。**这些 `SKILL.md` 本身是给 AI 助手读的提示词
工作流，不是可运行代码。**

## 已经融合进 App 的部分

`claim-verification`（二手信息验真方法论）已落地为一个真实功能：

- 后端 `backend/services/llm_service.py` → `verify_claims()`：把「拆解 → 定级 → 判定」5 步
  工作流、证据可信度梯度、8 类失真模式、✅🟡🔴⚠️ 判定标签编码进 LLM system prompt，返回结构化
  核验矩阵 JSON。
- 后端路由 `POST /api/verify`（`backend/main.py`）。
- 前端 `谣言验真` 页面 `frontend/src/components/FactCheck.jsx`：粘贴小作文/研报 → 渲染总评 +
  彩色标签矩阵 + 最大风险 + 免责声明。

### 实时行情佐证（已融合 `stock-data-fetch` 的核心铁律）

AlphaLoop 的铁律之一是「行情必须现取，标时间 + 源」。验真流程现在是**两段式**：

1. `_extract_entities()`：LLM 从文本抽出可查行情的标的（A股 6 位码 / 公募基金 6 位码 / 加密货币符号）。
2. `_fetch_market_evidence()`：用项目已有的 `get_stock_info`（东方财富）、`get_fund_info`（天天基金/akshare）、
   `get_crypto_detail`（CoinGecko）**现取实时价**，标来源 + 时间；名字没给代码时用 `search_stock`/`search_fund` 解析。
3. 真实行情作为 ground truth 喂回验真 LLM，量级声明因此能被真正 ✅证实 / 🔴纠正，而非一律 ⚠️。
   响应含 `market_evidence`，前端「实时行情佐证」面板展示。

仍有意保留的裁剪：只覆盖 **A股 / 中国公募基金 / CoinGecko 币种**。美股 / 港股 / 外汇 / 大宗商品本系统
无数据源，相关量级声明仍判 ⚠️ 并提示去「数据看板」自查。要补全可接 Finnhub/FMP（需 key）。

## 已融合：产业链分析（`strategic-materials` 五层漏斗）

第二个落地的能力。新增「产业链」页面 `frontend/src/components/SupplyChain.jsx`：

- 后端 `backend/services/llm_service.py` → `analyze_supply_chain(material, context)`：把五层漏斗
  （供需 → 资源掌控 → 国产替代 → AI 关联 → 政策地缘 → 受益标的）+ 适用边界判断 + 逐层自检
  编码进 system prompt，返回结构化 JSON（总评 / Scorecard 五维 / 五层结论+自检 / 受益标的表 /
  核验矩阵 / 催化剂日历）。
- 后端路由 `POST /api/supply-chain`（`backend/main.py`）。
- **强制接线** `stock-data-fetch`：LLM 挑出的 A 股受益标的，用上一轮抽出的 `_fetch_one()` 现取实时价，
  满足「现价必须现取、标时间+源」铁律；产业链占比/国产化率等量级数字进核验矩阵并诚实标 ⚠️（AI 未逐条
  溯源，符合 `claim-verification` 的「量级未证实」纪律）。

裁剪：未接 `openorder` 落档（需存储层），分析结果暂不跨会话沉淀。

## 尚未融合、可作为后续扩展的子技能

| 子技能 | 角色 | 如何接进本项目 |
|---|---|---|
| `stock-data-fetch` | 多市场实时行情 | ✅ 已接入验真 + 产业链（A股/基金/crypto 现取）；可再补美股/港股源 |
| `strategic-materials` | 产业链五层漏斗 | ✅ 已落地为「产业链」页面 |
| `openorder` | 跨会话研究 wiki | 需引入存储层，把验真/研究结论落档复用 |
| `trade-journal` | 建仓即记 + 归因 | 在「录入持仓」基础上记录每笔交易的判断理由 |
| `agent-tool-escalation` | 工具失败升级纪律 | 偏 AI 助手开发侧，非 App 功能 |

## 协议

上游 AlphaLoop 为 MIT 协议，见 `LICENSE`。
