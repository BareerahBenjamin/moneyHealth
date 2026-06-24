"""LLM 服务 - 调用 vectorengine 生成 AI 体检报告"""
import os
import json
import re
from datetime import datetime
from typing import Optional
from openai import OpenAI
from dotenv import load_dotenv

from services.crypto_service import get_crypto_detail
from services.stock_service import get_stock_info, search_stock
from services.fund_service import get_fund_info, search_fund

load_dotenv()

def get_client():
    return OpenAI(
        base_url=os.getenv("LLM_BASE_URL", "https://api.vectorengine.ai/v1"),
        api_key=os.getenv("LLM_API_KEY", "placeholder"),
    )

SYSTEM_PROMPT = """你是一位专业但亲切的理财翻译官，专门把复杂的投资数据用人话解释给投资小白听。

你的风格：
- 用大白话，不用专业术语（如果必须用，立刻解释）
- 温和但诚实，不制造焦虑
- 全程不使用任何 emoji 或表情符号，保持纯文字
- 像闺蜜聊天一样自然

你必须包含的内容：
1. 总体评价：用一句话概括"你的钱现在怎么样"
2. 基金部分分析
3. 加密货币部分分析
4. 风险提示：用人话说明最大的风险是什么
5. 一个小建议

不要推荐具体的基金或币种，只分析现状。
不要用"建议您"这种官方腔，直接说"你可以"。
"""

def generate_health_report(portfolio_summary: str, market_data: str) -> str:
    """生成投资体检报告"""
    client = get_client()
    
    user_prompt = f"""以下是我的投资组合和市场数据，请帮我生成一份"人话版"体检报告：

## 我的持仓
{portfolio_summary}

## 市场数据
{market_data}

请用中文生成报告，要求：
- 开头用一句话总结"我的钱现在还好吗"
- 每个持仓单独分析
- 最后给一个总体风险评价和一个小建议
- 语气像闺蜜聊天，不要像理财顾问
"""
    
    try:
        response = client.chat.completions.create(
            model="gpt-5-codex",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=1500,
            temperature=0.7,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"AI 报告生成暂时不可用：{str(e)}\n\n别担心，下面的数据分析依然有效！"

def explain_concept(concept: str) -> str:
    """解释投资概念"""
    client = get_client()
    
    try:
        response = client.chat.completions.create(
            model="gpt-5-codex",
            messages=[
                {"role": "system", "content": "你是一位耐心的投资老师，专门给完全不懂金融的人解释概念。用最简单的话，举生活中的例子，不超过100字。全程不要使用任何 emoji 或表情符号。"},
                {"role": "user", "content": f"请用大白话解释：{concept}"}
            ],
            max_tokens=200,
            temperature=0.7,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"暂时无法解释，稍后再试试～"


# ========== 谣言/研报验真（融合自 AlphaLoop claim-verification 方法论）==========

VERIFY_SYSTEM_PROMPT = """你是一位严谨又亲切的「投资信息验真官」，专门帮投资小白核实那些转发来的小作文、研报截图、群消息、大V观点的真伪。

# 核心原则
任何二手信息（推文/小作文/新闻/研报/别的AI说的）默认都是**待验证的假设**，不是事实。不能因为"听起来合理"或"很多人都这么说"就采信——plausible ≠ correct。

# 你的工作流（5步）
1. 拆解：把这段话拆成一条条「原子声明」，每条只包含一个可独立验证的事实。
2. 定级：判断每条声明的来源可信度。
3. 判定：给每条打标签：
   - "verified"（证实）：有权威一手源（公司公告、财报、官方、交易所、实时行情）可确认
   - "partial"（部分属实）：方向对但有偏差、有前提、被夸大
   - "false"（错误/误导）：与事实冲突、张冠李戴、概念混淆
   - "unverified"（无法证实）：找不到一手源；或属于量级声明（股价/涨跌幅/市值/净值等）但下方「实时行情佐证」里查不到对应标的

# 8类常见失真，看到就要警惕
张冠李戴、循环引用、把推断当事实、选择性报喜不报忧、过时数据、营销展示当商业事实、量级数字没出处、概念混淆。

# 如何使用「实时行情佐证」
user 消息里会附一个「实时行情佐证」板块，里面是系统**刚刚现取**的真实行情（已标来源+时间）。涉及股价/涨跌幅/市值/净值等量级声明时：
- 优先用佐证里的真实数字核实：对得上 → "verified"，并在 reason 里**引用真实数字+来源+时间**；
- 对不上 → "false"，给出真实数字纠正它（如「文中说已涨到3000，实测 ¥1680.5（东方财富 2026-06-24），对不上」）；
- 佐证里查不到该标的、或取数失败 → "unverified"，提示去「数据看板」自查。
- **绝对禁止**使用你训练记忆里的旧价；只认佐证板块里的现取数据。

# 重要边界
- 你只给证据和风险，**绝不替用户做买卖决策**。
- 用大白话解释，像闺蜜聊天，但保持诚实，不制造焦虑也不盲目附和。
- 全程不要在任何字段里使用 emoji 或表情符号，保持纯文字。

# 输出格式（必须是合法 JSON，不要任何额外文字、不要 markdown 代码块）
{
  "summary": "一句话总评：这段话大概几成靠谱、最大的坑在哪",
  "skeleton_truth": "整体判断，比如'骨架方向有道理，但有2处关键失真'",
  "claims": [
    {"claim": "拆出来的原子声明原文", "label": "verified|partial|false|unverified", "reason": "用大白话说明为什么这么判，正确的事实是什么"}
  ],
  "biggest_risk": "如果照着这段话去操作，最容易踩的坑",
  "bottom_line": "一句话落点（提醒决策权在用户自己）"
}
"""


def _safe_parse_json(text: str):
    """从 LLM 输出里尽量稳妥地抽出 JSON。"""
    if not text:
        return None
    # 去掉可能的 ```json ``` 包裹
    fenced = re.search(r"```(?:json)?\s*(\{.*\})\s*```", text, re.DOTALL)
    candidate = fenced.group(1) if fenced else text
    # 退一步：截取第一个 { 到最后一个 }
    if not fenced:
        start = candidate.find("{")
        end = candidate.rfind("}")
        if start != -1 and end != -1 and end > start:
            candidate = candidate[start:end + 1]
    try:
        return json.loads(candidate)
    except Exception:
        return None


ENTITY_EXTRACT_PROMPT = """你是金融实体抽取器。从用户文本里找出所有「可查实时行情」的标的，**只限三类**：
- A股股票：6位数字代码（如 600519 贵州茅台、000001 平安银行）
- 中国公募基金：6位数字代码（如 005827）
- 加密货币：符号（如 BTC、ETH、SOL）

规则：
- 对每个标的给出 type（"stock"/"fund"/"crypto"）、code、name。
- 股票/基金若文中只给了名字没给代码，code 留空字符串，name 填全称（系统会去搜代码）。
- 加密货币的 code 填符号本身（大写）。
- 美股/港股/外汇/大宗商品/指数等本系统查不到，**不要输出**。
- 拿不准是股票还是基金时，看语境（“买入/股价/上市公司”偏股票，“申购/净值/基金经理”偏基金）。

只输出 JSON，不要任何额外文字：
{"entities":[{"type":"stock","code":"600519","name":"贵州茅台"}]}
没有就输出 {"entities":[]}"""


def _extract_entities(client, content: str) -> list:
    """让 LLM 抽出文中可查行情的标的。失败返回空列表，不影响验真主流程。"""
    try:
        response = client.chat.completions.create(
            model="gpt-5-codex",
            messages=[
                {"role": "system", "content": ENTITY_EXTRACT_PROMPT},
                {"role": "user", "content": content},
            ],
            max_tokens=500,
            temperature=0,
        )
        parsed = _safe_parse_json(response.choices[0].message.content)
        ents = (parsed or {}).get("entities", [])
        return ents if isinstance(ents, list) else []
    except Exception:
        return []


def _fetch_one(ent: dict, fetched_at: str) -> Optional[dict]:
    """对单个标的现取实时行情，返回结构化佐证 dict（成功或 error），无法识别返回 None。"""
    etype = (ent.get("type") or "").strip().lower()
    code = (ent.get("code") or "").strip()
    name = (ent.get("name") or "").strip()
    if not (code or name):
        return None
    try:
        if etype == "crypto":
            sym = (code or name).upper()
            d = get_crypto_detail(sym)
            if "error" in d:
                return {"type": "crypto", "code": sym, "query": sym, "error": d["error"]}
            return {
                "type": "crypto", "code": d["symbol"], "label": f"{d['name']}（{d['symbol']}）",
                "price": f"${d['price_usd']}", "change_24h": d.get("price_change_24h"),
                "change_30d": d.get("price_change_30d"), "ath_change_pct": d.get("ath_change_pct"),
                "source": "CoinGecko", "as_of": fetched_at,
            }
        if etype == "stock":
            if not code and name:
                res = search_stock(name)
                if res:
                    code, name = res[0]["code"], res[0].get("name") or name
            if not code:
                return {"type": "stock", "query": name, "error": "未能解析出股票代码"}
            d = get_stock_info(code)
            if "error" in d:
                return {"type": "stock", "code": code, "query": code or name, "error": d["error"]}
            return {
                "type": "stock", "code": d["code"], "label": f"{d['name']}（{d['code']}）",
                "price": f"¥{d['latest_price']}", "daily_change": d.get("daily_change"),
                "return_30d": d.get("period_return_30d"), "volatility_30d": d.get("volatility_30d"),
                "source": "东方财富", "as_of": d.get("latest_date") or fetched_at,
            }
        if etype == "fund":
            if not code and name:
                res = search_fund(name)
                if res:
                    code, name = res[0]["code"], res[0].get("name") or name
            if not code:
                return {"type": "fund", "query": name, "error": "未能解析出基金代码"}
            d = get_fund_info(code)
            if "error" in d:
                return {"type": "fund", "code": code, "query": code or name, "error": d["error"]}
            return {
                "type": "fund", "code": d["code"], "label": f"{name or d.get('name')}（{d['code']}）",
                "price": f"净值 {d['latest_nav']}", "daily_change": d.get("daily_change"),
                "return_30d": d.get("period_return_30d"), "volatility_30d": d.get("volatility_30d"),
                "source": "天天基金", "as_of": d.get("latest_date") or fetched_at,
            }
    except Exception as e:
        return {"type": etype or "?", "code": code, "query": code or name, "error": str(e)}
    return None


def _fetch_market_evidence(entities: list) -> list:
    """对抽出的标的逐个现取实时行情，返回结构化佐证列表（含时间+源）。"""
    fetched_at = datetime.now().strftime("%Y-%m-%d %H:%M")
    evidence = []
    seen = set()
    for ent in (entities or [])[:8]:
        etype = (ent.get("type") or "").strip().lower()
        code = (ent.get("code") or "").strip()
        name = (ent.get("name") or "").strip()
        key = f"{etype}:{code or name}"
        if not (code or name) or key in seen:
            continue
        seen.add(key)
        item = _fetch_one(ent, fetched_at)
        if item:
            evidence.append(item)
    return evidence


def _market_evidence_text(evidence: list) -> str:
    """把佐证渲染成喂给验真 LLM 的纯文本。"""
    if not evidence:
        return "（本次未识别到可查实时行情的标的，或未取到数据。涉及量级数字的声明请按 unverified 处理。）"
    lines = []
    for e in evidence:
        if e.get("error"):
            lines.append(f"- {e.get('query', '?')}（{e['type']}）：取数失败/查不到 —— {e['error']}")
            continue
        parts = [str(e['price'])]
        if e.get("daily_change") is not None:
            parts.append(f"当日 {e['daily_change']}%")
        if e.get("change_24h") is not None:
            parts.append(f"24h {e['change_24h']}%")
        if e.get("return_30d") is not None:
            parts.append(f"近30天 {e['return_30d']}%")
        if e.get("change_30d") is not None:
            parts.append(f"近30天 {e['change_30d']}%")
        if e.get("ath_change_pct") is not None:
            parts.append(f"距历史最高 {e['ath_change_pct']}%")
        if e.get("volatility_30d") is not None:
            parts.append(f"波动率 {e['volatility_30d']}%")
        lines.append(f"- {e['label']}：{'，'.join(parts)}（来源 {e['source']}，{e['as_of']}）")
    return "\n".join(lines)


def verify_claims(content: str) -> dict:
    """核实一段二手信息（小作文/研报/群消息）的真伪，返回结构化核验矩阵。

    流程：抽取标的 → 现取实时行情佐证 → 带证据逐条验真（融合自 AlphaLoop）。
    """
    client = get_client()

    # 1. 抽取可查行情的标的；2. 现取实时行情
    entities = _extract_entities(client, content)
    evidence = _fetch_market_evidence(entities)
    evidence_text = _market_evidence_text(evidence)

    # 3. 带行情佐证做验真
    user_prompt = f"""请帮我核实下面这段转发来的消息/研报/观点，按你的5步工作流逐条验真：

\"\"\"
{content}
\"\"\"

## 实时行情佐证（系统刚现取，请据此核实量级声明，禁用旧价）
{evidence_text}

记住：默认这段话是待验证的假设，逐条拆解打标签；量级声明优先用上面的佐证核实并引用真实数字+时间源。严格只输出 JSON。"""

    try:
        response = client.chat.completions.create(
            model="gpt-5-codex",
            messages=[
                {"role": "system", "content": VERIFY_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=2000,
            temperature=0.3,
        )
        raw = response.choices[0].message.content
        parsed = _safe_parse_json(raw)
        if parsed and isinstance(parsed.get("claims"), list):
            parsed["ok"] = True
            parsed["market_evidence"] = evidence
            return parsed
        # 解析失败时降级为纯文本，前端仍可展示
        return {
            "ok": False,
            "summary": "AI 已给出分析，但格式化失败，下面是原始内容。",
            "raw": raw,
            "claims": [],
            "market_evidence": evidence,
        }
    except Exception as e:
        return {
            "ok": False,
            "error": str(e),
            "summary": f"验真服务暂时不可用：{str(e)}",
            "claims": [],
            "market_evidence": evidence,
        }


# ========== 产业链分析（融合自 AlphaLoop strategic-materials 五层漏斗）==========

SUPPLY_CHAIN_SYSTEM_PROMPT = """你是一位严谨的战略原材料/产业链研究员，用「五层漏斗」框架帮投资小白看懂某个原材料/金属/矿产的产业链格局，并落到受益标的。语气专业但用大白话，温和诚实，不制造焦虑，不替用户做买卖决策。全程不要在任何字段里使用 emoji 或表情符号，保持纯文字。

# 框架的适用边界（先判断！）
本框架只适用于「供给受限 + 资源/技术壁垒型的实物战略原材料」（如锂、钴、稀土、萤石、高纯石英砂、锗、镓、锑、钨等）。若用户给的对象命中以下任一，应把 applicable 设为 false 并在 applicable_note 里说明为什么不适用、建议换什么镜头：
- 需求纯消费/时尚驱动、供给充分的普通大宗（普通农产品、充分竞争工业品）
- 纯金融/货币属性资产（黄金、加密货币——定价靠宏观流动性，不是产业链）
- 服务业/软件/平台（没有资源掌控+国产替代维度）
- 已充分竞争、无卡脖子、无 AI 关联的成熟商品

# 五层漏斗（逐层分析 + 逐层显式自检）
1. 供需基本面：供给（主/副产品、弹性、产能周期、成本曲线、谁是边际产能）+ 需求（下游占比增速、是否有结构突变、高价是否触发替代）。自检：缺口是结构性长期还是短期脉冲？
2. 资源掌控力：储量/产量占比、进口依赖度、进口集中度(CR3)、定级（掌控/加工垄断/消费主导/依赖）。自检：中国是定价者还是价格接受者？
3. 技术自主性：哪里卡脖子、国产化率、有无已工业化的国产技术、替代路径。自检：国产替代已工业化还是还在 PPT？（找装置数量/产能/客户验证）
4. 新兴应用交叉：与 AI/新能源/量子的关联（A 隐形耗材 / B 动力储能核心 / C AI 反向赋能），评估商业化成熟度。自检：与 AI 是概念炒作还是真实用量？给当前+3 年需求占比估算。
5. 政策与地缘：出口管制/关税、资源民族主义、绿色低碳成本、战略清单/收储、运输咽喉。自检：最大黑天鹅来自哪里？

# 三条硬约束
- 关键量级（进口依赖度、集中度、国产化率、产能、需求占比等）你**无法实时溯源**，必须在 claims 核验矩阵里逐条标注可信度，绝大多数应标 "unverified"（凭行业常识估算、未溯源到一手），只有你高度确信的常识性事实才可标 "verified"。绝不把估算说成事实。
- 受益标的的**实时股价由系统现取后追加**，你只需给出标的的 type/code/name，不要自己编价格。
- 必须走到第六层挑出受益标的（沿资源端/加工冶炼端/设备工艺端/下游应用端分段），每个标 thesis 强度（强=合同/财报实证 / 中=战略合作 PR / 弱=demo送样/传闻），不可拔高。

# 受益标的只挑 A 股（本系统能查实时价的）
beneficiaries 里只放 A 股上市公司，type 一律 "stock"，code 给 6 位代码（不确定就把 code 留空、name 给全称，系统会去搜）。港股/美股可在 note 里文字提及但不要放进 beneficiaries。

# 输出格式（必须是合法 JSON，不要任何额外文字、不要 markdown 代码块）
{
  "material": "材料名",
  "applicable": true,
  "applicable_note": "不适用时说明原因+建议换的镜头；适用时可留空",
  "summary": "一句话总评：结构性/脉冲 + 定价权归属 + 国产替代成色 + AI关联真伪 + 最大风险",
  "scorecard": [
    {"dim": "进口依赖度", "value": "约XX%", "level": "高/中/低"},
    {"dim": "进口集中度(CR3)", "value": "约XX%", "level": "是否地缘高风险"},
    {"dim": "资源掌控定级", "value": "掌控/加工垄断/消费主导/依赖", "level": "—"},
    {"dim": "国产化率(关键工艺)", "value": "约XX%", "level": "已工业化?"},
    {"dim": "AI/前沿需求占比", "value": "当前X% → 3年后Y%", "level": "真实用量?"}
  ],
  "layers": [
    {"title": "第一层 · 供需基本面", "conclusion": "1-2句结论", "self_check": "缺口是结构性长期/短期脉冲：…"},
    {"title": "第二层 · 资源掌控力", "conclusion": "…", "self_check": "定价者/价格接受者：…"},
    {"title": "第三层 · 技术自主性", "conclusion": "…", "self_check": "已工业化/还在PPT：…"},
    {"title": "第四层 · 新兴应用交叉", "conclusion": "…", "self_check": "概念炒作/真实用量：…"},
    {"title": "第五层 · 政策与地缘", "conclusion": "…", "self_check": "最大黑天鹅：…"}
  ],
  "beneficiaries": [
    {"segment": "资源端/加工冶炼端/设备工艺端/下游应用端", "type": "stock", "code": "600111", "name": "北方稀土", "thesis_strength": "强/中/弱", "strength_reason": "为什么是这个强度（合同/财报/合作/传闻）", "note": "受益逻辑一句话"}
  ],
  "claims": [
    {"claim": "用到的关键量级数字（如'中国稀土产量占全球70%'）", "label": "verified|partial|false|unverified", "reason": "可信度说明，未溯源的注明'凭行业常识估算，未核实'"}
  ],
  "catalysts": [
    {"window": "2026 H2 / 未来6-18个月某节点", "event": "投产/关停/出口管制/收储等催化剂"}
  ],
  "biggest_risk": "最大的风险/反方观点",
  "bottom_line": "一句话落点（提醒决策权在用户自己）"
}
"""


def analyze_supply_chain(material: str, context: str = "") -> dict:
    """对某原材料/金属跑五层漏斗产业链分析，受益标的现取实时价（融合自 AlphaLoop）。"""
    client = get_client()

    ctx_block = f"\n\n补充背景/用户想验证的逻辑：\n{context}" if context and context.strip() else ""
    user_prompt = f"""请用五层漏斗框架分析这个原材料/产业链：**{material}**{ctx_block}

先判断这个对象是否适用本框架；适用则逐层分析+逐条显式自检，挑出 A 股受益标的并标 thesis 强度，关键量级数字进核验矩阵并诚实标注可信度。严格只输出 JSON。"""

    try:
        response = client.chat.completions.create(
            model="gpt-5-codex",
            messages=[
                {"role": "system", "content": SUPPLY_CHAIN_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=2800,
            temperature=0.4,
        )
        raw = response.choices[0].message.content
        parsed = _safe_parse_json(raw)
        if not (parsed and isinstance(parsed.get("layers"), list)):
            return {
                "ok": False,
                "summary": "AI 已给出分析，但格式化失败，下面是原始内容。",
                "raw": raw,
                "layers": [],
                "beneficiaries": [],
            }

        # 给受益标的现取实时价（满足「现价必须现取，标时间+源」铁律）
        fetched_at = datetime.now().strftime("%Y-%m-%d %H:%M")
        beneficiaries = parsed.get("beneficiaries") or []
        for b in beneficiaries[:10]:
            if isinstance(b, dict):
                b["market"] = _fetch_one(b, fetched_at)
        parsed["beneficiaries"] = beneficiaries
        parsed["ok"] = True
        return parsed
    except Exception as e:
        return {
            "ok": False,
            "error": str(e),
            "summary": f"产业链分析服务暂时不可用：{str(e)}",
            "layers": [],
            "beneficiaries": [],
        }
