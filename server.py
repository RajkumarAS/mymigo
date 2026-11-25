#!/usr/bin/env python3
"""
MyMigo MVP Backend Server

Serves the static MyMigo MVP website and provides secure API endpoints:
  - GET  /api/health    -> Reports Google Sheets & Supabase readiness (no secrets exposed)
  - GET  /api/stores    -> Returns Active stores from Supabase (if configured) or data/stores.json
  - POST /api/bookings  -> Validates booking request, generates MYMIGO-YYYYMMDD-XXX ID,
                           and writes to Google Sheets via Apps Script or Service Account API.
                           Never fakes a successful Google Sheets submission.
"""

from __future__ import annotations

import base64
import datetime
import functools
import http.server
import json
import mimetypes
import os
import posixpath
import re
import shutil
import socketserver
import subprocess
import tempfile
import threading
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
STORES_FILE = DATA_DIR / "stores.json"
HOMEPAGE_FILE = DATA_DIR / "homepage.json"
USERS_FILE = DATA_DIR / "users.json"
SELLERS_FILE = DATA_DIR / "sellers.json"
VIDEOS_FILE = DATA_DIR / "videos.json"
UPLOADS_DIR = BASE_DIR / "uploads"
COUNTER_FILE = DATA_DIR / ".booking-counter.json"

BOOKING_COLUMNS = [
    "Booking ID",
    "Date Submitted",
    "Customer Name",
    "Mobile Number",
    "WhatsApp Number",
    "Email",
    "City",
    "Store",
    "Requirement",
    "Preferred Date",
    "Preferred Time",
    "Additional Notes",
    "Booking Status",
]

COUNTER_LOCK = threading.Lock()

# Paths that must never be exposed via static file serving
BLOCKED_STATIC_PREFIXES = (
    ".env",
    ".git",
    "data/",
    "tests/",
    "google-apps-script/",
    "supabase/",
    "server.py",
)


class GoogleSheetsNotConfiguredError(Exception):
    """Raised when no Google Sheets integration credentials/webhook are configured."""


class GoogleSheetsWriteError(Exception):
    """Raised when Google Sheets returns an error or is unreachable."""


def load_dotenv(env_path: Path) -> None:
    """Load key=value pairs from .env into os.environ without overriding existing vars."""
    if not env_path.is_file():
        return
    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()
        if len(value) >= 2 and (
            (value.startswith('"') and value.endswith('"'))
            or (value.startswith("'") and value.endswith("'"))
        ):
            value = value[1:-1]
        if key and key not in os.environ:
            os.environ[key] = value


def get_supabase_credentials() -> Tuple[str, str]:
    """Resolve Supabase URL and Key supporting both old and new Supabase dashboard naming."""
    project_id = os.environ.get("SUPABASE_PROJECT_ID", "").strip()
    url = os.environ.get("SUPABASE_URL", "").strip()
    if not url and project_id:
        url = f"https://{project_id}.supabase.co"
    url = url.rstrip("/")

    key = (
        os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
        or os.environ.get("SUPABASE_SECRET_KEY", "").strip()
        or os.environ.get("SUPABASE_ANON_KEY", "").strip()
        or os.environ.get("SUPABASE_PUBLISHABLE_KEY", "").strip()
        or os.environ.get("SUPABASE_KEY", "").strip()
        or os.environ.get("SUPABASE_API_KEY", "").strip()
    )
    return url, key


def get_integration_status() -> Dict[str, Any]:
    """Return safe integration status booleans without exposing secrets."""
    apps_script_url = os.environ.get("GOOGLE_APPS_SCRIPT_URL", "").strip()
    spreadsheet_id = os.environ.get("GOOGLE_SHEETS_SPREADSHEET_ID", "").strip()
    sa_json = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON", "").strip()
    sa_file = os.environ.get("GOOGLE_SERVICE_ACCOUNT_FILE", "").strip()

    apps_script_ready = bool(apps_script_url)
    sheets_api_ready = bool(spreadsheet_id and (sa_json or sa_file))

    supabase_url, supabase_key = get_supabase_credentials()

    return {
        "googleSheetsConfigured": apps_script_ready or sheets_api_ready,
        "googleSheetsMode": (
            "apps_script"
            if apps_script_ready
            else ("service_account" if sheets_api_ready else "unconfigured")
        ),
        "supabaseConfigured": bool(supabase_url and supabase_key),
    }


def load_active_stores() -> List[Dict[str, Any]]:
    """Fetch active stores from Supabase (if configured) or fallback to data/stores.json."""
    supabase_url, supabase_key = get_supabase_credentials()

    if supabase_url and supabase_key:
        query_url = (
            f"{supabase_url}/rest/v1/stores"
            "?active=eq.true&select=id,name,city,category,description,image,instagram_url,active"
        )
        req = urllib.request.Request(
            query_url,
            headers={
                "apikey": supabase_key,
                "Authorization": f"Bearer {supabase_key}",
                "Accept": "application/json",
            },
            method="GET",
        )
        try:
            with urllib.request.urlopen(req, timeout=6) as resp:
                rows = json.loads(resp.read().decode("utf-8"))
                if isinstance(rows, list):
                    return [s for s in rows if s.get("active") is True]
        except Exception:
            # Fall back cleanly to local store catalog if Supabase is unreachable
            pass

    if not STORES_FILE.is_file():
        return []

    stores = json.loads(STORES_FILE.read_text(encoding="utf-8"))
    return [store for store in stores if store.get("active") is True]


def load_homepage_config() -> Dict[str, Any]:
    """Load homepage configuration (banner, featuredStores, featuredVideos) from data/homepage.json."""
    if not HOMEPAGE_FILE.is_file():
        return {
            "banner": {
                "imageDesktop": "./assets/hero-desktop.jpg",
                "imageMobile": "./assets/hero-mobile.jpg",
                "badgeTitle": "Personal Shopping Assistance",
                "badgeSubtitle": "Across Indian Cities",
                "headingLine1": "Someone is",
                "headingLine2": "there.",
                "subtitle": "Shop from anywhere.",
                "button1": {
                    "text": "Book a Session",
                    "action": "book_session",
                    "link": "#/book",
                    "enabled": True,
                },
                "button2": {
                    "text": "Explore Stores",
                    "action": "explore_stores",
                    "link": "#/stores",
                    "enabled": True,
                },
            },
            "featuredStores": [
                "store-kalyani-cotton",
                "store-silkwalk-studio",
                "store-urban-tops",
            ],
            "featuredVideos": [
                "ig-01",
                "ig-02",
                "ig-03",
                "ig-04",
            ],
        }
    try:
        data = json.loads(HOMEPAGE_FILE.read_text(encoding="utf-8"))
        if isinstance(data, dict):
            return data
    except Exception:
        pass
    return {}


def save_homepage_config(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Persist homepage configuration atomically to data/homepage.json."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    temp_path = HOMEPAGE_FILE.with_suffix(".tmp")
    temp_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    temp_path.replace(HOMEPAGE_FILE)
    return payload


def sync_user_to_supabase(user_entry: Dict[str, Any], delete: bool = False) -> Tuple[bool, str]:
    """Sync a user record to Supabase public.users if credentials exist."""
    supabase_url, supabase_key = get_supabase_credentials()
    if not (supabase_url and supabase_key):
        return False, "Supabase credentials not configured"

    user_id = str(user_entry.get("id", "")).strip()
    if not user_id:
        return False, "Missing user id"

    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    if delete:
        url = f"{supabase_url}/rest/v1/users?id=eq.{urllib.parse.quote(user_id)}"
        req = urllib.request.Request(url, headers=headers, method="DELETE")
    else:
        url = f"{supabase_url}/rest/v1/users?on_conflict=id"
        headers["Prefer"] = "resolution=merge-duplicates"
        row = {
            "id": user_id,
            "name": str(user_entry.get("name", "")).strip() or "Shopper",
            "handle": str(user_entry.get("handle") or f"@{str(user_entry.get('name', 'shopper')).lower().replace(' ', '_')}").strip(),
            "avatar": str(user_entry.get("avatar", "")).strip() or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
            "interests": str(user_entry.get("interests") or user_entry.get("preferences", "")).strip(),
            "preferences": str(user_entry.get("preferences") or user_entry.get("interests", "")).strip(),
            "email": str(user_entry.get("email", "")).strip(),
            "phone": str(user_entry.get("phone", "")).strip(),
            "role": str(user_entry.get("role", "shopper")).strip(),
            "connections_count": int(user_entry.get("connectionsCount", 140)),
            "status": str(user_entry.get("status", "active")).strip(),
        }
        body = json.dumps(row).encode("utf-8")
        req = urllib.request.Request(url, data=body, headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return True, f"HTTP {resp.status}"
    except urllib.error.HTTPError as e:
        err_msg = ""
        try:
            err_msg = e.read().decode("utf-8")
        except Exception:
            pass
        msg = f"HTTP {e.code}: {err_msg}"
        print(f"[Supabase sync user warning] {user_id}: {msg}")
        return False, msg
    except Exception as e:
        print(f"[Supabase sync user warning] {user_id}: {e}")
        return False, str(e)


def sync_seller_to_supabase(seller_entry: Dict[str, Any], delete: bool = False) -> Tuple[bool, str]:
    """Sync a seller record to Supabase public.sellers if credentials exist."""
    supabase_url, supabase_key = get_supabase_credentials()
    if not (supabase_url and supabase_key):
        return False, "Supabase credentials not configured"

    seller_id = str(seller_entry.get("id", "")).strip()
    if not seller_id:
        return False, "Missing seller id"

    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    if delete:
        url = f"{supabase_url}/rest/v1/sellers?id=eq.{urllib.parse.quote(seller_id)}"
        req = urllib.request.Request(url, headers=headers, method="DELETE")
    else:
        url = f"{supabase_url}/rest/v1/sellers?on_conflict=id"
        headers["Prefer"] = "resolution=merge-duplicates"
        row = {
            "id": seller_id,
            "store_id": str(seller_entry.get("storeId") or seller_entry.get("store_id") or f"store-{seller_id}").strip(),
            "store_name": str(seller_entry.get("storeName") or seller_entry.get("name", "")).strip(),
            "handle": str(seller_entry.get("handle") or f"@{str(seller_entry.get('storeName', 'store')).lower().replace(' ', '_')}").strip(),
            "category": str(seller_entry.get("category", "Sarees")).strip(),
            "description": str(seller_entry.get("description", "")).strip(),
            "avatar": str(seller_entry.get("avatar") or seller_entry.get("image", "")).strip(),
            "image": str(seller_entry.get("image") or seller_entry.get("avatar", "")).strip(),
            "rating": float(seller_entry.get("rating", 5.0)),
            "connections_count": int(seller_entry.get("connectionsCount", 1)),
            "active": bool(seller_entry.get("active", True)),
        }
        body = json.dumps(row).encode("utf-8")
        req = urllib.request.Request(url, data=body, headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return True, f"HTTP {resp.status}"
    except urllib.error.HTTPError as e:
        err_msg = ""
        try:
            err_msg = e.read().decode("utf-8")
        except Exception:
            pass
        msg = f"HTTP {e.code}: {err_msg}"
        print(f"[Supabase sync seller warning] {seller_id}: {msg}")
        return False, msg
    except Exception as e:
        print(f"[Supabase sync seller warning] {seller_id}: {e}")
        return False, str(e)


def sync_local_data_to_supabase() -> Dict[str, Any]:
    """Ensure all local users and sellers are synced into Supabase and return diagnostic report."""
    supabase_url, supabase_key = get_supabase_credentials()
    if not (supabase_url and supabase_key):
        return {
            "ok": False,
            "supabaseConfigured": False,
            "message": "Supabase credentials are not configured.",
        }

    masked_url = (
        supabase_url[:15] + "..." + supabase_url[-8:]
        if len(supabase_url) > 25
        else supabase_url
    )

    report: Dict[str, Any] = {
        "ok": True,
        "supabaseConfigured": True,
        "supabaseUrl": masked_url,
        "usersSynced": 0,
        "sellersSynced": 0,
        "errors": [],
    }

    try:
        if USERS_FILE.is_file():
            users = json.loads(USERS_FILE.read_text(encoding="utf-8"))
            for u in users:
                ok, msg = sync_user_to_supabase(u)
                if ok:
                    report["usersSynced"] += 1
                else:
                    report["errors"].append({"type": "user", "id": u.get("id"), "error": msg})
    except Exception as e:
        report["errors"].append({"type": "users_batch", "error": str(e)})

    try:
        if SELLERS_FILE.is_file():
            sellers = json.loads(SELLERS_FILE.read_text(encoding="utf-8"))
            for s in sellers:
                ok, msg = sync_seller_to_supabase(s)
                if ok:
                    report["sellersSynced"] += 1
                else:
                    report["errors"].append({"type": "seller", "id": s.get("id"), "error": msg})
    except Exception as e:
        report["errors"].append({"type": "sellers_batch", "error": str(e)})

    if report["errors"]:
        report["ok"] = False

    return report


def load_users() -> List[Dict[str, Any]]:
    """Load user profiles from Supabase if configured, otherwise fallback to data/users.json."""
    supabase_url, supabase_key = get_supabase_credentials()
    if supabase_url and supabase_key:
        query_url = f"{supabase_url}/rest/v1/users?select=*"
        req = urllib.request.Request(
            query_url,
            headers={
                "apikey": supabase_key,
                "Authorization": f"Bearer {supabase_key}",
                "Accept": "application/json",
            },
            method="GET",
        )
        try:
            with urllib.request.urlopen(req, timeout=6) as resp:
                rows = json.loads(resp.read().decode("utf-8"))
                if isinstance(rows, list) and len(rows) > 0:
                    users = []
                    for r in rows:
                        users.append({
                            "id": r.get("id"),
                            "name": r.get("name"),
                            "handle": r.get("handle"),
                            "avatar": r.get("avatar"),
                            "interests": r.get("interests"),
                            "preferences": r.get("preferences"),
                            "email": r.get("email"),
                            "phone": r.get("phone"),
                            "mobile": r.get("phone"),
                            "city": r.get("city", ""),
                            "role": r.get("role", "shopper"),
                            "connectionsCount": r.get("connections_count", 140),
                            "status": r.get("status", "active"),
                            "createdAt": r.get("created_at"),
                        })
                    return users
        except Exception:
            pass

    if not USERS_FILE.is_file():
        return []
    try:
        data = json.loads(USERS_FILE.read_text(encoding="utf-8"))
        if isinstance(data, list):
            return data
    except Exception:
        pass
    return []


def save_users(users: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Atomically save user profiles to data/users.json."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    temp_path = USERS_FILE.with_suffix(".tmp")
    temp_path.write_text(json.dumps(users, indent=2, ensure_ascii=False), encoding="utf-8")
    temp_path.replace(USERS_FILE)
    return users


def load_sellers() -> List[Dict[str, Any]]:
    """Load seller profiles from Supabase if configured, otherwise fallback to data/sellers.json."""
    supabase_url, supabase_key = get_supabase_credentials()
    if supabase_url and supabase_key:
        query_url = f"{supabase_url}/rest/v1/sellers?select=*"
        req = urllib.request.Request(
            query_url,
            headers={
                "apikey": supabase_key,
                "Authorization": f"Bearer {supabase_key}",
                "Accept": "application/json",
            },
            method="GET",
        )
        try:
            with urllib.request.urlopen(req, timeout=6) as resp:
                rows = json.loads(resp.read().decode("utf-8"))
                if isinstance(rows, list) and len(rows) > 0:
                    sellers = []
                    for r in rows:
                        sellers.append({
                            "id": r.get("id"),
                            "storeId": r.get("store_id"),
                            "name": r.get("store_name"),
                            "storeName": r.get("store_name"),
                            "handle": r.get("handle"),
                            "category": r.get("category"),
                            "description": r.get("description"),
                            "avatar": r.get("avatar"),
                            "image": r.get("image"),
                            "rating": r.get("rating", 5.0),
                            "connectionsCount": r.get("connections_count", 1),
                            "active": r.get("active", True),
                            "createdAt": r.get("created_at"),
                        })
                    return sellers
        except Exception:
            pass

    if not SELLERS_FILE.is_file():
        return []
    try:
        data = json.loads(SELLERS_FILE.read_text(encoding="utf-8"))
        if isinstance(data, list):
            return data
    except Exception:
        pass
    return []


def save_sellers(sellers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Atomically save seller profiles to data/sellers.json."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    temp_path = SELLERS_FILE.with_suffix(".tmp")
    temp_path.write_text(json.dumps(sellers, indent=2, ensure_ascii=False), encoding="utf-8")
    temp_path.replace(SELLERS_FILE)
    return sellers


def load_videos() -> List[Dict[str, Any]]:
    """Load video reels from data/videos.json."""
    if not VIDEOS_FILE.is_file():
        return []
    try:
        data = json.loads(VIDEOS_FILE.read_text(encoding="utf-8"))
        if isinstance(data, list):
            return data
    except Exception:
        pass
    return []


def save_videos(videos: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Atomically save video reels to data/videos.json."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    temp_path = VIDEOS_FILE.with_suffix(".tmp")
    temp_path.write_text(json.dumps(videos, indent=2, ensure_ascii=False), encoding="utf-8")
    temp_path.replace(VIDEOS_FILE)
    return videos


def sync_seller_to_stores(seller_data: Dict[str, Any], remove: bool = False) -> None:
    """Keep data/stores.json synchronized with seller profile additions/edits/deletions."""
    stores: List[Dict[str, Any]] = []
    if STORES_FILE.is_file():
        try:
            loaded = json.loads(STORES_FILE.read_text(encoding="utf-8"))
            if isinstance(loaded, list):
                stores = loaded
        except Exception:
            stores = []

    store_id = str(seller_data.get("storeId") or seller_data.get("id") or "").strip()
    if not store_id.startswith("store-"):
        raw_slug = re.sub(r"[^a-z0-9]+", "-", str(seller_data.get("storeName", "store")).lower()).strip("-")
        store_id = f"store-{raw_slug}" if raw_slug else "store-custom"

    if remove:
        stores = [s for s in stores if s.get("id") != store_id]
    else:
        found = False
        rating_val = 4.8
        try:
            if seller_data.get("rating") is not None and str(seller_data.get("rating")).strip() != "":
                rating_val = float(seller_data.get("rating"))
        except (ValueError, TypeError):
            rating_val = 4.8

        store_entry = {
            "id": store_id,
            "handle": re.sub(r"[^a-z0-9_]+", "", str(seller_data.get("storeName", "")).lower()),
            "name": str(seller_data.get("storeName", "")).strip(),
            "city": str(seller_data.get("city", "")).strip(),
            "category": str(seller_data.get("category", "")).strip(),
            "description": str(seller_data.get("description", "")).strip(),
            "image": str(seller_data.get("image", "")).strip(),
            "videoUrl": str(seller_data.get("videoUrl", "")).strip(),
            "instagram_url": str(seller_data.get("instagramUrl", "")).strip() or "https://www.instagram.com/",
            "rating": rating_val,
            "badge": str(seller_data.get("badge", "")).strip() or "Top Rated.",
            "active": bool(seller_data.get("active", True)),
        }
        for idx, s in enumerate(stores):
            if s.get("id") == store_id:
                stores[idx] = {**s, **store_entry}
                found = True
                break
        if not found:
            stores.append(store_entry)

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    temp_path = STORES_FILE.with_suffix(".tmp")
    temp_path.write_text(json.dumps(stores, indent=2, ensure_ascii=False), encoding="utf-8")
    temp_path.replace(STORES_FILE)


def generate_booking_id(
    counter_path: Optional[Path] = None,
    now: Optional[datetime.datetime] = None,
) -> str:
    """Generate a unique daily sequential Booking ID like MYMIGO-20261112-001."""
    target_path = counter_path or COUNTER_FILE
    current = now or datetime.datetime.now()
    date_str = current.strftime("%Y%m%d")

    with COUNTER_LOCK:
        state: Dict[str, int] = {}
        if target_path.is_file():
            try:
                loaded = json.loads(target_path.read_text(encoding="utf-8"))
                if isinstance(loaded, dict):
                    state = {str(k): int(v) for k, v in loaded.items()}
            except Exception:
                state = {}

        next_seq = state.get(date_str, 0) + 1
        state[date_str] = next_seq

        target_path.parent.mkdir(parents=True, exist_ok=True)
        target_path.write_text(json.dumps(state, indent=2), encoding="utf-8")

    return f"MYMIGO-{date_str}-{next_seq:03d}"


def sanitize_sheet_text(value: Any, allow_leading_plus: bool = False) -> str:
    """Trim strings and neutralize spreadsheet formula prefixes (=, @, etc.)."""
    text = str(value or "").strip()
    if not text:
        return ""
    if text[0] in ("=", "@", "\t", "\r") or (text[0] == "+" and not allow_leading_plus):
        return "'" + text
    return text


def validate_booking_payload(payload: Any) -> Tuple[Optional[Dict[str, str]], Optional[str]]:
    """Validate incoming booking JSON and return normalized fields or an error message."""
    if not isinstance(payload, dict):
        return None, "Invalid JSON payload."

    required = [
        ("customerName", "Customer Name"),
        ("city", "City"),
        ("store", "Store"),
        ("requirement", "What are you looking for"),
        ("preferredDate", "Preferred Date"),
        ("preferredTime", "Preferred Time"),
    ]

    for key, label in required:
        val = str(payload.get(key, "")).strip()
        if not val:
            return None, f"{label} is required."

    whatsapp = str(payload.get("whatsappNumber", "")).strip()
    mobile = str(payload.get("mobileNumber", "")).strip()
    contact = whatsapp or mobile
    if not contact:
        return None, "WhatsApp Number is required."

    digits_only = re.sub(r"\D", "", contact)
    if len(digits_only) < 8 or len(digits_only) > 15:
        return None, "Please enter a valid WhatsApp Number."

    if not whatsapp:
        whatsapp = mobile
    if not mobile:
        mobile = whatsapp

    email = str(payload.get("email", "")).strip()
    if email and not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        return None, "Please enter a valid Email address."

    normalized = {
        "customerName": sanitize_sheet_text(payload.get("customerName")),
        "mobileNumber": sanitize_sheet_text(mobile, allow_leading_plus=True),
        "whatsappNumber": sanitize_sheet_text(whatsapp, allow_leading_plus=True),
        "email": sanitize_sheet_text(email),
        "city": sanitize_sheet_text(payload.get("city")),
        "store": sanitize_sheet_text(payload.get("store")),
        "requirement": sanitize_sheet_text(payload.get("requirement")),
        "preferredDate": sanitize_sheet_text(payload.get("preferredDate")),
        "preferredTime": sanitize_sheet_text(payload.get("preferredTime")),
        "additionalNotes": sanitize_sheet_text(payload.get("additionalNotes")),
    }
    return normalized, None


def build_booking_record(
    normalized: Dict[str, str],
    booking_id: str,
    now: Optional[datetime.datetime] = None,
) -> Dict[str, Any]:
    """Assemble the canonical 13-column booking record with Booking Status = New."""
    current = now or datetime.datetime.now()
    date_submitted = current.strftime("%Y-%m-%d %H:%M:%S")
    booking = {
        "bookingId": booking_id,
        "dateSubmitted": date_submitted,
        "customerName": normalized["customerName"],
        "mobileNumber": normalized["mobileNumber"],
        "whatsappNumber": normalized["whatsappNumber"],
        "email": normalized["email"],
        "city": normalized["city"],
        "store": normalized["store"],
        "requirement": normalized["requirement"],
        "preferredDate": normalized["preferredDate"],
        "preferredTime": normalized["preferredTime"],
        "additionalNotes": normalized["additionalNotes"],
        "bookingStatus": "New",
    }
    row_values = [
        booking["bookingId"],
        booking["dateSubmitted"],
        booking["customerName"],
        booking["mobileNumber"],
        booking["whatsappNumber"],
        booking["email"],
        booking["city"],
        booking["store"],
        booking["requirement"],
        booking["preferredDate"],
        booking["preferredTime"],
        booking["additionalNotes"],
        booking["bookingStatus"],
    ]
    return {"booking": booking, "row": row_values}


def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _load_service_account_creds() -> Dict[str, Any]:
    raw_json = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON", "").strip()
    sa_file = os.environ.get("GOOGLE_SERVICE_ACCOUNT_FILE", "").strip()

    if raw_json:
        return json.loads(raw_json)
    if sa_file:
        path = Path(sa_file)
        if not path.is_absolute():
            path = BASE_DIR / path
        return json.loads(path.read_text(encoding="utf-8"))
    raise GoogleSheetsNotConfiguredError("Service account credentials not found.")


def _fetch_google_access_token(sa_creds: Dict[str, Any]) -> str:
    """Create a JWT signed with RS256 via OpenSSL and exchange for an OAuth2 token."""
    client_email = sa_creds.get("client_email", "")
    private_key = sa_creds.get("private_key", "")
    token_uri = sa_creds.get("token_uri", "https://oauth2.googleapis.com/token")

    if not client_email or not private_key:
        raise GoogleSheetsWriteError("Service account JSON is missing client_email or private_key.")

    now_ts = int(datetime.datetime.now(datetime.timezone.utc).timestamp())
    header = _b64url(json.dumps({"alg": "RS256", "typ": "JWT"}).encode("utf-8"))
    claims = _b64url(
        json.dumps(
            {
                "iss": client_email,
                "scope": "https://www.googleapis.com/auth/spreadsheets",
                "aud": token_uri,
                "iat": now_ts,
                "exp": now_ts + 3600,
            }
        ).encode("utf-8")
    )
    signing_input = f"{header}.{claims}".encode("ascii")

    with tempfile.NamedTemporaryFile("w", suffix=".pem", delete=False) as key_file:
        key_file.write(private_key)
        key_path = key_file.name

    try:
        proc = subprocess.run(
            ["openssl", "dgst", "-sha256", "-sign", key_path],
            input=signing_input,
            capture_output=True,
            check=False,
        )
        if proc.returncode != 0:
            raise GoogleSheetsWriteError("Failed to sign Google OAuth JWT with OpenSSL.")
        signature = _b64url(proc.stdout)
    finally:
        try:
            os.unlink(key_path)
        except OSError:
            pass

    assertion = f"{header}.{claims}.{signature}"
    form_data = urllib.parse.urlencode(
        {
            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
            "assertion": assertion,
        }
    ).encode("utf-8")

    req = urllib.request.Request(
        token_uri,
        data=form_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            token_resp = json.loads(resp.read().decode("utf-8"))
            access_token = token_resp.get("access_token")
            if not access_token:
                raise GoogleSheetsWriteError("OAuth token response did not include access_token.")
            return access_token
    except urllib.error.HTTPError as err:
        detail = err.read().decode("utf-8", errors="replace")
        raise GoogleSheetsWriteError(f"Google OAuth error ({err.code}): {detail}") from err
    except urllib.error.URLError as err:
        raise GoogleSheetsWriteError(f"Unable to reach Google OAuth endpoint: {err.reason}") from err


def persist_booking_to_google_sheets(record: Dict[str, Any]) -> Dict[str, Any]:
    """Send booking record to Google Sheets via Apps Script webhook or Sheets API v4."""
    apps_script_url = os.environ.get("GOOGLE_APPS_SCRIPT_URL", "").strip()
    apps_script_secret = os.environ.get("GOOGLE_APPS_SCRIPT_SECRET", "").strip()

    if apps_script_url:
        body = json.dumps(
            {
                "secret": apps_script_secret,
                "columns": BOOKING_COLUMNS,
                "booking": record["booking"],
                "row": record["row"],
            }
        ).encode("utf-8")
        req = urllib.request.Request(
            apps_script_url,
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                raw = resp.read().decode("utf-8")
                parsed = json.loads(raw)
                if not parsed.get("ok"):
                    raise GoogleSheetsWriteError(
                        parsed.get("error") or "Google Apps Script returned an error."
                    )
                return {"provider": "apps_script", "response": parsed}
        except urllib.error.HTTPError as err:
            detail = err.read().decode("utf-8", errors="replace")
            raise GoogleSheetsWriteError(f"Google Apps Script HTTP {err.code}: {detail}") from err
        except urllib.error.URLError as err:
            raise GoogleSheetsWriteError(f"Could not reach Google Apps Script: {err.reason}") from err
        except json.JSONDecodeError as err:
            raise GoogleSheetsWriteError("Google Apps Script returned a non-JSON response.") from err

    spreadsheet_id = os.environ.get("GOOGLE_SHEETS_SPREADSHEET_ID", "").strip()
    sheet_range = os.environ.get("GOOGLE_SHEETS_RANGE", "Bookings!A:M").strip() or "Bookings!A:M"
    sa_json = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON", "").strip()
    sa_file = os.environ.get("GOOGLE_SERVICE_ACCOUNT_FILE", "").strip()

    if spreadsheet_id and (sa_json or sa_file):
        sa_creds = _load_service_account_creds()
        access_token = _fetch_google_access_token(sa_creds)
        encoded_range = urllib.parse.quote(sheet_range, safe="!")
        append_url = (
            f"https://sheets.googleapis.com/v4/spreadsheets/{urllib.parse.quote(spreadsheet_id)}"
            f"/values/{encoded_range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS"
        )
        body = json.dumps({"values": [record["row"]]}).encode("utf-8")
        req = urllib.request.Request(
            append_url,
            data=body,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                parsed = json.loads(resp.read().decode("utf-8"))
                return {"provider": "google_sheets_api", "response": parsed}
        except urllib.error.HTTPError as err:
            detail = err.read().decode("utf-8", errors="replace")
            raise GoogleSheetsWriteError(f"Google Sheets API HTTP {err.code}: {detail}") from err
        except urllib.error.URLError as err:
            raise GoogleSheetsWriteError(f"Could not reach Google Sheets API: {err.reason}") from err

    raise GoogleSheetsNotConfiguredError(
        "Google Sheets storage is not configured yet. Set GOOGLE_APPS_SCRIPT_URL or Google "
        "Service Account credentials in your server .env file."
    )


class MyMigoRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP handler serving static frontend assets and secure API endpoints."""

    def __init__(self, *args: Any, directory: Optional[str] = None, **kwargs: Any) -> None:
        super().__init__(*args, directory=directory or str(BASE_DIR), **kwargs)

    def end_headers(self) -> None:
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def guess_type(self, path: str) -> str:
        # Strip query parameters before guessing MIME type to prevent application/octet-stream
        clean_path = path.split("?", 1)[0]
        ext = posixpath.splitext(clean_path)[1].lower()
        if ext in (".js", ".mjs"):
            return "text/javascript; charset=utf-8"
        if ext == ".css":
            return "text/css; charset=utf-8"
        if ext == ".json":
            return "application/json; charset=utf-8"
        if ext == ".webmanifest":
            return "application/manifest+json; charset=utf-8"
        if ext in (".jpg", ".jpeg"):
            return "image/jpeg"
        if ext == ".png":
            return "image/png"
        if ext == ".webp":
            return "image/webp"
        if ext == ".svg":
            return "image/svg+xml"
        if ext in (".mp4", ".m4v"):
            return "video/mp4"
        if ext == ".webm":
            return "video/webm"
        if ext == ".mov":
            return "video/quicktime"
        return super().guess_type(clean_path)

    def send_json(self, status_code: int, payload: Dict[str, Any]) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _is_blocked_static_path(self, url_path: str) -> bool:
        cleaned = posixpath.normpath(urllib.parse.unquote(url_path.split("?", 1)[0])).lstrip("/")
        if cleaned == "" or cleaned == ".":
            return False
        for prefix in BLOCKED_STATIC_PREFIXES:
            if cleaned == prefix.rstrip("/") or cleaned.startswith(prefix):
                return True
        if "/." in "/" + cleaned:
            return True
        return False

    def do_GET(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/health":
            self.send_json(200, {"ok": True, **get_integration_status()})
            return

        if parsed.path == "/api/sync-supabase":
            report = sync_local_data_to_supabase()
            status_code = 200 if report.get("ok") else 207
            self.send_json(status_code, report)
            return

        if parsed.path == "/api/stores":
            stores = load_active_stores()
            self.send_json(200, {"ok": True, "stores": stores})
            return

        if parsed.path == "/api/homepage":
            config = load_homepage_config()
            self.send_json(200, {"ok": True, "homepage": config})
            return

        if parsed.path == "/api/users":
            users = load_users()
            self.send_json(200, {"ok": True, "users": users})
            return

        if parsed.path == "/api/sellers":
            sellers = load_sellers()
            self.send_json(200, {"ok": True, "sellers": sellers})
            return

        if parsed.path == "/api/videos":
            videos = load_videos()
            self.send_json(200, {"ok": True, "videos": videos})
            return

        if parsed.path.startswith("/api/"):
            self.send_json(404, {"ok": False, "error": "API endpoint not found."})
            return

        if self._is_blocked_static_path(parsed.path):
            self.send_error(403, "Forbidden")
            return

        filepath = self.translate_path(self.path)
        if self.headers.get("Range") or parsed.path.lower().endswith((".mp4", ".webm", ".mov", ".m4v", ".mp3", ".ogg")):
            self.send_file_with_range(filepath)
            return

        super().do_GET()

    def send_file_with_range(self, filepath: str) -> None:
        p = Path(filepath)
        if not p.is_file():
            self.send_error(404, "File not found")
            return

        file_size = p.stat().st_size
        range_header = self.headers.get("Range")
        ctype = self.guess_type(str(p)) or "application/octet-stream"

        if not range_header:
            self.send_response(200)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(file_size))
            self.send_header("Accept-Ranges", "bytes")
            self.send_header("Cache-Control", "public, max-age=86400")
            self.end_headers()
            try:
                with open(p, "rb") as f:
                    shutil.copyfileobj(f, self.wfile)
            except BrokenPipeError:
                pass
            return

        try:
            bytes_range = range_header.strip().split("=")[1]
            parts = bytes_range.split("-")
            start = int(parts[0]) if parts[0] else 0
            end = int(parts[1]) if parts[1] else file_size - 1
            if end >= file_size:
                end = file_size - 1
            if start > end or start >= file_size:
                self.send_response(416)
                self.send_header("Content-Range", f"bytes */{file_size}")
                self.end_headers()
                return

            length = end - start + 1
            self.send_response(206)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Range", f"bytes {start}-{end}/{file_size}")
            self.send_header("Content-Length", str(length))
            self.send_header("Accept-Ranges", "bytes")
            self.send_header("Cache-Control", "public, max-age=86400")
            self.end_headers()

            with open(p, "rb") as f:
                f.seek(start)
                bytes_left = length
                chunk_size = 64 * 1024
                while bytes_left > 0:
                    chunk = f.read(min(chunk_size, bytes_left))
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    bytes_left -= len(chunk)
        except (ValueError, IndexError):
            self.send_response(416)
            self.send_header("Content-Range", f"bytes */{file_size}")
            self.end_headers()
        except BrokenPipeError:
            pass

    def do_POST(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/homepage":
            try:
                content_length = int(self.headers.get("Content-Length", "0"))
            except ValueError:
                self.send_json(400, {"ok": False, "error": "Invalid Content-Length header."})
                return

            if content_length <= 0 or content_length > 128 * 1024:
                self.send_json(400, {"ok": False, "error": "Request body size is invalid."})
                return

            raw_body = self.rfile.read(content_length)
            try:
                payload = json.loads(raw_body.decode("utf-8"))
            except Exception:
                self.send_json(400, {"ok": False, "error": "Request body must be valid JSON."})
                return

            if not isinstance(payload, dict):
                self.send_json(400, {"ok": False, "error": "Payload must be a JSON object."})
                return

            saved = save_homepage_config(payload)
            self.send_json(200, {"ok": True, "homepage": saved})
            return

        if parsed.path == "/api/upload":
            try:
                content_length = int(self.headers.get("Content-Length", "0"))
            except ValueError:
                self.send_json(400, {"ok": False, "error": "Invalid Content-Length header."})
                return

            if content_length <= 0 or content_length > 30 * 1024 * 1024:
                self.send_json(400, {"ok": False, "error": "Media file exceeds size limit (30MB)."})
                return

            raw_body = self.rfile.read(content_length)
            try:
                payload = json.loads(raw_body.decode("utf-8"))
            except Exception:
                self.send_json(400, {"ok": False, "error": "Request body must be valid JSON."})
                return

            filename = str(payload.get("filename", "upload")).strip()
            data_url = str(payload.get("fileData", "")).strip()
            if not data_url or "," not in data_url:
                self.send_json(400, {"ok": False, "error": "Missing base64 fileData URL."})
                return

            header_part, base64_data = data_url.split(",", 1)
            try:
                raw_bytes = base64.b64decode(base64_data)
            except Exception:
                self.send_json(400, {"ok": False, "error": "Invalid base64 payload."})
                return

            ext = posixpath.splitext(filename)[1].lower()
            if not ext:
                if "video/mp4" in header_part:
                    ext = ".mp4"
                elif "video/webm" in header_part:
                    ext = ".webm"
                elif "video/quicktime" in header_part:
                    ext = ".mov"
                elif "image/png" in header_part:
                    ext = ".png"
                elif "image/webp" in header_part:
                    ext = ".webp"
                elif "image/gif" in header_part:
                    ext = ".gif"
                else:
                    ext = ".jpg"

            clean_stem = re.sub(r"[^a-zA-Z0-9_-]+", "_", posixpath.splitext(filename)[0]).strip("_") or "file"
            timestamp = int(datetime.datetime.now().timestamp() * 1000)
            safe_filename = f"{clean_stem}_{timestamp}{ext}"

            UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
            target_path = UPLOADS_DIR / safe_filename
            target_path.write_bytes(raw_bytes)

            file_url = f"./uploads/{safe_filename}"
            is_video = ext in (".mp4", ".webm", ".mov", ".m4v")
            self.send_json(200, {
                "ok": True,
                "url": file_url,
                "filename": safe_filename,
                "mediaType": "video" if is_video else "image"
            })
            return

        if parsed.path == "/api/users":
            try:
                content_length = int(self.headers.get("Content-Length", "0"))
            except ValueError:
                self.send_json(400, {"ok": False, "error": "Invalid Content-Length header."})
                return

            raw_body = self.rfile.read(content_length)
            try:
                payload = json.loads(raw_body.decode("utf-8"))
            except Exception:
                self.send_json(400, {"ok": False, "error": "Request body must be valid JSON."})
                return

            action = str(payload.get("action", "save")).lower()
            users = load_users()

            if action == "delete":
                user_id = str(payload.get("id", "")).strip()
                users = [u for u in users if str(u.get("id")) != user_id]
                save_users(users)
                sync_user_to_supabase({"id": user_id}, delete=True)
                self.send_json(200, {"ok": True, "users": users})
                return

            user_id = str(payload.get("id", "")).strip()
            if not user_id:
                timestamp = int(datetime.datetime.now().timestamp())
                user_id = f"usr-{timestamp}"

            phone_num = str(payload.get("phone") or payload.get("mobile", "")).strip()

            user_entry = {
                "id": user_id,
                "name": str(payload.get("name", "New Shopper")).strip(),
                "handle": str(payload.get("handle", "")).strip(),
                "email": str(payload.get("email", "")).strip(),
                "phone": phone_num,
                "mobile": phone_num,
                "city": str(payload.get("city", "")).strip(),
                "avatar": str(payload.get("avatar", "")).strip() or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
                "interests": str(payload.get("interests", "")).strip(),
                "preferences": str(payload.get("preferences", "")).strip(),
                "connectionsCount": int(payload.get("connectionsCount", 140)),
                "role": "shopper",
                "status": str(payload.get("status", "active")).strip(),
                "createdAt": payload.get("createdAt") or datetime.datetime.now().isoformat(),
            }

            found = False
            for idx, u in enumerate(users):
                if str(u.get("id")) == user_id:
                    # Preserve existing phone/mobile if not passed in this edit request
                    if not user_entry["phone"] and (u.get("phone") or u.get("mobile")):
                        user_entry["phone"] = u.get("phone") or u.get("mobile")
                        user_entry["mobile"] = user_entry["phone"]
                    users[idx] = {**u, **user_entry}
                    found = True
                    break
            if not found:
                users.append(user_entry)

            save_users(users)
            sync_user_to_supabase(user_entry)
            self.send_json(200, {"ok": True, "user": user_entry, "users": users})
            return

        if parsed.path == "/api/sellers":
            try:
                content_length = int(self.headers.get("Content-Length", "0"))
            except ValueError:
                self.send_json(400, {"ok": False, "error": "Invalid Content-Length header."})
                return

            raw_body = self.rfile.read(content_length)
            try:
                payload = json.loads(raw_body.decode("utf-8"))
            except Exception:
                self.send_json(400, {"ok": False, "error": "Request body must be valid JSON."})
                return

            action = str(payload.get("action", "save")).lower()
            sellers = load_sellers()

            if action == "delete":
                seller_id = str(payload.get("id", "")).strip()
                target_seller = next((s for s in sellers if str(s.get("id")) == seller_id), None)
                if target_seller:
                    sync_seller_to_stores(target_seller, remove=True)
                sellers = [s for s in sellers if str(s.get("id")) != seller_id]
                save_sellers(sellers)
                sync_seller_to_supabase({"id": seller_id}, delete=True)
                self.send_json(200, {"ok": True, "sellers": sellers})
                return

            store_name = str(payload.get("storeName", "New Store")).strip()
            raw_slug = re.sub(r"[^a-z0-9]+", "-", store_name.lower()).strip("-")
            store_id = str(payload.get("storeId", "")).strip() or f"store-{raw_slug}"
            seller_id = str(payload.get("id", "")).strip() or f"seller-{raw_slug}"

            rating_val = 4.8
            try:
                if payload.get("rating") is not None and str(payload.get("rating")).strip() != "":
                    rating_val = float(payload.get("rating"))
            except (ValueError, TypeError):
                rating_val = 4.8

            seller_entry = {
                "id": seller_id,
                "storeId": store_id,
                "storeName": store_name,
                "ownerName": str(payload.get("ownerName", "")).strip(),
                "email": str(payload.get("email", "")).strip(),
                "phone": str(payload.get("phone", "")).strip(),
                "city": str(payload.get("city", "Chennai")).strip(),
                "category": str(payload.get("category", "Sarees")).strip(),
                "description": str(payload.get("description", "")).strip(),
                "image": str(payload.get("image", "")).strip() or "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80",
                "videoUrl": str(payload.get("videoUrl", "")).strip(),
                "instagramUrl": str(payload.get("instagramUrl", "")).strip() or "https://www.instagram.com/",
                "rating": rating_val,
                "badge": str(payload.get("badge", "")).strip() or "Top Rated.",
                "active": bool(payload.get("active", True)),
                "createdAt": payload.get("createdAt") or datetime.datetime.now().isoformat(),
            }

            found = False
            for idx, s in enumerate(sellers):
                if str(s.get("id")) == seller_id:
                    sellers[idx] = {**s, **seller_entry}
                    found = True
                    break
            if not found:
                sellers.append(seller_entry)

            save_sellers(sellers)
            sync_seller_to_stores(seller_entry)
            sync_seller_to_supabase(seller_entry)
            self.send_json(200, {"ok": True, "seller": seller_entry, "sellers": sellers})
            return

        if parsed.path == "/api/videos":
            try:
                content_length = int(self.headers.get("Content-Length", "0"))
            except ValueError:
                self.send_json(400, {"ok": False, "error": "Invalid Content-Length header."})
                return

            raw_body = self.rfile.read(content_length)
            try:
                payload = json.loads(raw_body.decode("utf-8"))
            except Exception:
                self.send_json(400, {"ok": False, "error": "Request body must be valid JSON."})
                return

            action = str(payload.get("action", "upload")).lower()
            videos = load_videos()

            if action == "like":
                video_id = str(payload.get("id", "")).strip()
                for v in videos:
                    if str(v.get("id")) == video_id:
                        currently_liked = bool(v.get("isLiked", False))
                        v["isLiked"] = not currently_liked
                        v["likesCount"] = max(0, int(v.get("likesCount", 0)) + (1 if not currently_liked else -1))
                        save_videos(videos)
                        self.send_json(200, {"ok": True, "video": v, "videos": videos})
                        return
                self.send_json(404, {"ok": False, "error": f"Video {video_id} not found."})
                return

            if action == "comment":
                video_id = str(payload.get("id", "")).strip()
                comment_text = str(payload.get("text", "")).strip()
                user_name = str(payload.get("userName", "Shopper")).strip() or "Shopper"
                user_avatar = str(payload.get("userAvatar", "")).strip() or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                if not comment_text:
                    self.send_json(400, {"ok": False, "error": "Comment text cannot be empty."})
                    return

                new_comment = {
                    "id": f"cmt-{int(datetime.datetime.now().timestamp() * 1000)}",
                    "userName": user_name,
                    "userAvatar": user_avatar,
                    "text": comment_text,
                    "createdAt": datetime.datetime.now().isoformat()
                }

                for v in videos:
                    if str(v.get("id")) == video_id:
                        if not isinstance(v.get("comments"), list):
                            v["comments"] = []
                        v["comments"].insert(0, new_comment)
                        v["commentsCount"] = int(v.get("commentsCount", 0)) + 1
                        save_videos(videos)
                        self.send_json(200, {"ok": True, "comment": new_comment, "video": v, "videos": videos})
                        return
                self.send_json(404, {"ok": False, "error": f"Video {video_id} not found."})
                return

            if action == "share":
                video_id = str(payload.get("id", "")).strip()
                for v in videos:
                    if str(v.get("id")) == video_id:
                        v["shareCount"] = int(v.get("shareCount", 0)) + 1
                        save_videos(videos)
                        self.send_json(200, {"ok": True, "video": v, "videos": videos})
                        return
                self.send_json(404, {"ok": False, "error": f"Video {video_id} not found."})
                return

            if action == "delete":
                video_id = str(payload.get("id", "")).strip()
                videos = [v for v in videos if str(v.get("id")) != video_id]
                save_videos(videos)
                self.send_json(200, {"ok": True, "videos": videos})
                return

            # Action: upload / create
            caption = str(payload.get("caption", "")).strip()
            video_url = str(payload.get("videoUrl", "")).strip()
            if not video_url:
                video_url = "./uploads/diwali_sale_kurtis.mp4"

            video_id = str(payload.get("id", "")).strip()
            if not video_id:
                timestamp = int(datetime.datetime.now().timestamp())
                video_id = f"video-{timestamp}"

            store_name = str(payload.get("storeName", "Partner Boutique")).strip()
            store_id = str(payload.get("storeId", "")).strip()
            if not store_id:
                raw_slug = re.sub(r"[^a-z0-9]+", "-", store_name.lower()).strip("-")
                store_id = f"store-{raw_slug}" if raw_slug else "store-custom"

            handle = str(payload.get("handle", "")).strip() or re.sub(r"[^a-z0-9_]+", "", store_name.lower())
            city = str(payload.get("city", "Coimbatore")).strip()
            avatar = str(payload.get("avatar", "")).strip() or "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80"
            poster = str(payload.get("poster", "")).strip() or avatar
            whatsapp = str(payload.get("whatsappNumber", "")).strip() or "+919876543210"
            instagram = str(payload.get("instagramUrl", "")).strip() or f"https://www.instagram.com/{handle}/"
            tags = payload.get("tags") if isinstance(payload.get("tags"), list) else ["DiwaliSale", "Kurtis", "FestiveWear"]

            video_entry = {
                "id": video_id,
                "storeId": store_id,
                "storeName": store_name,
                "handle": handle,
                "city": city,
                "avatar": avatar,
                "videoUrl": video_url,
                "poster": poster,
                "caption": caption or "New festive collection available now! Book a live personal shopping call.",
                "tags": tags,
                "likesCount": int(payload.get("likesCount", 0)),
                "isLiked": False,
                "commentsCount": 0,
                "comments": [],
                "shareCount": 0,
                "whatsappNumber": whatsapp,
                "instagramUrl": instagram,
                "createdAt": datetime.datetime.now().isoformat()
            }

            videos.insert(0, video_entry)
            save_videos(videos)
            self.send_json(200, {"ok": True, "video": video_entry, "videos": videos})
            return

        if parsed.path != "/api/bookings":
            self.send_json(404, {"ok": False, "error": "API endpoint not found."})
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self.send_json(400, {"ok": False, "error": "Invalid Content-Length header."})
            return

        if content_length <= 0 or content_length > 64 * 1024:
            self.send_json(400, {"ok": False, "error": "Request body size is invalid."})
            return

        raw_body = self.rfile.read(content_length)
        try:
            payload = json.loads(raw_body.decode("utf-8"))
        except Exception:
            self.send_json(400, {"ok": False, "error": "Request body must be valid JSON."})
            return

        normalized, validation_error = validate_booking_payload(payload)
        if validation_error or normalized is None:
            self.send_json(400, {"ok": False, "error": validation_error or "Validation failed."})
            return

        if not get_integration_status()["googleSheetsConfigured"]:
            self.send_json(
                503,
                {
                    "ok": False,
                    "configured": False,
                    "code": "GOOGLE_SHEETS_NOT_CONFIGURED",
                    "error": (
                        "Google Sheets storage is not configured yet. Set GOOGLE_APPS_SCRIPT_URL "
                        "or Google Service Account credentials in your server .env file."
                    ),
                },
            )
            return

        booking_id = generate_booking_id()
        record = build_booking_record(normalized, booking_id)

        try:
            persist_booking_to_google_sheets(record)
        except GoogleSheetsNotConfiguredError as err:
            self.send_json(
                503,
                {
                    "ok": False,
                    "configured": False,
                    "code": "GOOGLE_SHEETS_NOT_CONFIGURED",
                    "error": str(err),
                    "bookingId": booking_id,
                },
            )
            return
        except GoogleSheetsWriteError as err:
            self.send_json(
                502,
                {
                    "ok": False,
                    "configured": True,
                    "code": "GOOGLE_SHEETS_WRITE_FAILED",
                    "error": str(err),
                    "bookingId": booking_id,
                },
            )
            return

        self.send_json(
            201,
            {
                "ok": True,
                "bookingId": record["booking"]["bookingId"],
                "dateSubmitted": record["booking"]["dateSubmitted"],
                "bookingStatus": record["booking"]["bookingStatus"],
                "message": "Thank you. Your MyMigo request has been received. Our team will contact you shortly.",
            },
        )

    def do_DELETE(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        query = urllib.parse.parse_qs(parsed.query)
        item_id = query.get("id", [""])[0].strip()

        if parsed.path == "/api/users":
            users = load_users()
            users = [u for u in users if str(u.get("id")) != item_id]
            save_users(users)
            sync_user_to_supabase({"id": item_id}, delete=True)
            self.send_json(200, {"ok": True, "users": users})
            return

        if parsed.path == "/api/sellers":
            sellers = load_sellers()
            target = next((s for s in sellers if str(s.get("id")) == item_id), None)
            if target:
                sync_seller_to_stores(target, remove=True)
            sellers = [s for s in sellers if str(s.get("id")) != item_id]
            save_sellers(sellers)
            sync_seller_to_supabase({"id": item_id}, delete=True)
            self.send_json(200, {"ok": True, "sellers": sellers})
            return

        self.send_json(404, {"ok": False, "error": "Endpoint not found."})

    def log_message(self, format: str, *args: Any) -> None:
        if os.environ.get("MYMIGO_QUIET_LOGS") == "1":
            return
        super().log_message(format, *args)


class ReusableTCPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    allow_reuse_address = True
    daemon_threads = True


def main() -> None:
    load_dotenv(BASE_DIR / ".env")
    mimetypes.add_type("application/javascript", ".js")
    mimetypes.add_type("application/manifest+json", ".webmanifest")

    port = int(os.environ.get("PORT", "3000"))
    handler = functools.partial(MyMigoRequestHandler, directory=str(BASE_DIR))
    with ReusableTCPServer(("0.0.0.0", port), handler) as httpd:
        status = get_integration_status()
        print(f"MyMigo MVP server running on http://localhost:{port}")
        print(f"Google Sheets mode: {status['googleSheetsMode']}")
        print(f"Supabase stores configured: {status['supabaseConfigured']}")
        if status.get("supabaseConfigured"):
            threading.Thread(target=sync_local_data_to_supabase, daemon=True).start()
        httpd.serve_forever()


if __name__ == "__main__":
    main()
