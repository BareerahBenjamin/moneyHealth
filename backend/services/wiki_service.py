"""OpenOrder 研究知识库服务 — 持久化投资研究 wiki"""
import json
import os
from datetime import datetime
from typing import List, Dict, Optional, Any

_BASE = os.environ.get("DATA_DIR", os.path.join(os.path.dirname(os.path.dirname(__file__)), "data"))
DATA_DIR = os.path.join(_BASE, "wiki")

# 单复数映射
SINGULAR = {"companies": "company", "industries": "industry", "frameworks": "framework"}
PLURAL = {v: k for k, v in SINGULAR.items()}


def _to_singular(entry_type: str) -> str:
    """复数 -> 单数"""
    return SINGULAR.get(entry_type, entry_type.rstrip("s"))


def _to_plural(entry_type: str) -> str:
    """单数 -> 复数"""
    return PLURAL.get(entry_type, entry_type + "s" if not entry_type.endswith("s") else entry_type)


def _ensure_dirs():
    """确保目录结构存在"""
    for subdir in ["companies", "industries", "frameworks"]:
        os.makedirs(os.path.join(DATA_DIR, subdir), exist_ok=True)


def _read_json(path: str, default=None):
    """读取 JSON 文件，不存在则返回 default"""
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return default if default is not None else {}


def _write_json(path: str, data):
    """写入 JSON 文件"""
    _ensure_dirs()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def _now():
    return datetime.now().strftime("%Y-%m-%d %H:%M")


def _today():
    return datetime.now().strftime("%Y-%m-%d")


# ========== 索引 ==========

def get_index() -> dict:
    """获取主索引"""
    _ensure_dirs()
    index = _read_json(os.path.join(DATA_DIR, "index.json"), {
        "lastUpdated": _today(),
        "companies": [],
        "industries": [],
        "frameworks": []
    })
    return index


def _update_index(entry_type: str, entry_id: str, name: str):
    """更新主索引（添加或更新条目）"""
    index = get_index()
    plural = _to_plural(entry_type)
    entries = index.get(plural, [])

    # 查找已有条目
    found = False
    for e in entries:
        if e.get("id") == entry_id:
            e["name"] = name
            e["lastUpdated"] = _today()
            found = True
            break

    if not found:
        entries.append({
            "id": entry_id,
            "name": name,
            "lastUpdated": _today()
        })

    index[plural] = entries
    index["lastUpdated"] = _today()
    _write_json(os.path.join(DATA_DIR, "index.json"), index)


def _remove_from_index(entry_type: str, entry_id: str):
    """从索引中移除条目"""
    index = get_index()
    plural = _to_plural(entry_type)
    index[plural] = [e for e in index.get(plural, []) if e.get("id") != entry_id]
    index["lastUpdated"] = _today()
    _write_json(os.path.join(DATA_DIR, "index.json"), index)


# ========== 条目 CRUD ==========

def _entry_path(entry_type: str, entry_id: str) -> str:
    """获取条目文件路径"""
    plural = _to_plural(entry_type)
    return os.path.join(DATA_DIR, plural, f"{entry_id}.json")


def get_entry(entry_type: str, entry_id: str) -> Optional[dict]:
    """读取单个条目"""
    path = _entry_path(entry_type, entry_id)
    return _read_json(path, None)


def save_entry(entry_type: str, entry_id: str, data: dict) -> dict:
    """创建或更新条目"""
    _ensure_dirs()

    # 读取已有条目（如果有）
    existing = get_entry(entry_type, entry_id)
    now = _now()

    if existing:
        # 更新：保留 changelog，追加新记录
        changelog = existing.get("changelog", [])
        changelog.insert(0, {"date": now, "action": "updated"})
        data["changelog"] = changelog
        data["lastUpdated"] = _today()
    else:
        # 新建
        data["changelog"] = [{"date": now, "action": "created"}]
        data["lastUpdated"] = _today()

    data["id"] = entry_id
    data["type"] = _to_singular(entry_type)

    _write_json(_entry_path(entry_type, entry_id), data)
    _update_index(entry_type, entry_id, data.get("name", entry_id))

    # 追加活动日志
    add_log(
        action="create" if not existing else "update",
        summary=f"{entry_type} {data.get('name', entry_id)}",
        files_touched=[f"{entry_type}s/{entry_id}.json"]
    )

    return data


def delete_entry(entry_type: str, entry_id: str) -> bool:
    """删除条目"""
    path = _entry_path(entry_type, entry_id)
    if os.path.exists(path):
        os.remove(path)
        _remove_from_index(entry_type, entry_id)
        add_log(
            action="delete",
            summary=f"deleted {entry_type} {entry_id}",
            files_touched=[f"{entry_type}s/{entry_id}.json"]
        )
        return True
    return False


def list_entries(entry_type: str) -> List[dict]:
    """列出某类全部条目（从索引读取，轻量级）"""
    index = get_index()
    plural = _to_plural(entry_type)
    return index.get(plural, [])


def get_entry_detail(entry_type: str, entry_id: str) -> Optional[dict]:
    """获取条目完整详情"""
    return get_entry(entry_type, entry_id)


# ========== 搜索 ==========

def search_entries(keyword: str) -> List[dict]:
    """全文搜索（遍历所有 JSON 的 name/summary/notes 字段）"""
    results = []
    keyword_lower = keyword.lower()

    for entry_type_plural in ["companies", "industries", "frameworks"]:
        type_dir = os.path.join(DATA_DIR, entry_type_plural)
        if not os.path.isdir(type_dir):
            continue
        for filename in os.listdir(type_dir):
            if not filename.endswith(".json"):
                continue
            entry = _read_json(os.path.join(type_dir, filename))
            if not entry:
                continue

            # 搜索字段
            searchable = " ".join([
                str(entry.get("name", "")),
                str(entry.get("summary", "")),
                str(entry.get("notes", "") if isinstance(entry.get("notes"), str) else ""),
                " ".join(entry.get("bull", [])),
                " ".join(entry.get("bear", [])),
            ]).lower()

            if keyword_lower in searchable:
                results.append({
                    "type": _to_singular(entry_type_plural),
                    "id": entry.get("id", filename.replace(".json", "")),
                    "name": entry.get("name", ""),
                    "summary": entry.get("summary", ""),
                    "lastUpdated": entry.get("lastUpdated", ""),
                    "matchField": "name/summary/notes"
                })

    return results


# ========== 活动日志 ==========

def get_log(limit: int = 50) -> List[dict]:
    """读取活动日志"""
    log = _read_json(os.path.join(DATA_DIR, "log.json"), [])
    return log[:limit]


def add_log(action: str, summary: str, files_touched: List[str] = None):
    """追加活动日志"""
    log_path = os.path.join(DATA_DIR, "log.json")
    log = _read_json(log_path, [])

    entry = {
        "timestamp": _now(),
        "action": action,
        "summary": summary,
        "filesTouched": files_touched or []
    }

    log.insert(0, entry)  # 最新的在前

    # 限制日志长度
    if len(log) > 500:
        log = log[:500]

    _write_json(log_path, log)
