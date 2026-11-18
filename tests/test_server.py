from __future__ import annotations

import datetime
import io
import json
import os
import tempfile
import unittest
from pathlib import Path
from typing import Optional
from unittest import mock

import server


class _FakeSocket:
    def __init__(self, raw_request: bytes):
        self._rfile = io.BytesIO(raw_request)
        self._wfile = io.BytesIO()

    def makefile(self, mode, *args, **kwargs):
        if "r" in mode:
            return self._rfile
        return self._wfile

    def sendall(self, data: bytes):
        self._wfile.write(data)

    def raw_response(self) -> bytes:
        return self._wfile.getvalue()


def invoke_handler(method: str, path: str, body: Optional[dict] = None, extra_headers: Optional[dict] = None):
    raw_body = json.dumps(body).encode("utf-8") if body is not None else b""
    headers = [f"{method} {path} HTTP/1.1", "Host: localhost"]
    if body is not None:
        headers.append("Content-Type: application/json")
        headers.append(f"Content-Length: {len(raw_body)}")
    if extra_headers:
        for k, v in extra_headers.items():
            headers.append(f"{k}: {v}")
    raw_req = ("\r\n".join(headers) + "\r\n\r\n").encode("utf-8") + raw_body

    sock = _FakeSocket(raw_req)
    # BaseHTTPRequestHandler processes one request during __init__
    server.MyMigoRequestHandler(sock, ("127.0.0.1", 12345), None, directory=str(server.BASE_DIR))
    raw_resp = sock.raw_response()
    head, _, resp_body = raw_resp.partition(b"\r\n\r\n")
    status_line = head.decode("utf-8", errors="replace").splitlines()[0]
    status_code = int(status_line.split()[1])
    try:
        parsed_body = json.loads(resp_body.decode("utf-8"))
    except Exception:
        parsed_body = {"raw": resp_body.decode("utf-8", errors="replace"), "bytes_len": len(resp_body)}
    return status_code, parsed_body


class MyMigoServerTests(unittest.TestCase):
    def setUp(self):
        self._orig_env = os.environ.copy()
        self._orig_counter_file = server.COUNTER_FILE
        self._orig_homepage_file = server.HOMEPAGE_FILE
        self._tmp_dir = tempfile.TemporaryDirectory()
        server.COUNTER_FILE = Path(self._tmp_dir.name) / "counter.json"
        server.HOMEPAGE_FILE = Path(self._tmp_dir.name) / "homepage.json"
        os.environ["MYMIGO_QUIET_LOGS"] = "1"
        for key in (
            "GOOGLE_APPS_SCRIPT_URL",
            "GOOGLE_APPS_SCRIPT_SECRET",
            "GOOGLE_SHEETS_SPREADSHEET_ID",
            "GOOGLE_SERVICE_ACCOUNT_JSON",
            "GOOGLE_SERVICE_ACCOUNT_FILE",
            "SUPABASE_URL",
            "SUPABASE_ANON_KEY",
        ):
            os.environ.pop(key, None)

    def tearDown(self):
        server.COUNTER_FILE = self._orig_counter_file
        server.HOMEPAGE_FILE = self._orig_homepage_file
        self._tmp_dir.cleanup()
        os.environ.clear()
        os.environ.update(self._orig_env)

    def test_health_endpoint_does_not_leak_secrets(self):
        status, payload = invoke_handler("GET", "/api/health")
        self.assertEqual(status, 200)
        self.assertTrue(payload["ok"])
        self.assertFalse(payload["googleSheetsConfigured"])
        self.assertEqual(payload["googleSheetsMode"], "unconfigured")

    def test_stores_returns_only_active_stores(self):
        status, payload = invoke_handler("GET", "/api/stores")
        self.assertEqual(status, 200)
        self.assertTrue(payload["ok"])
        stores = payload["stores"]
        self.assertGreaterEqual(len(stores), 7)
        self.assertTrue(all(s["active"] is True for s in stores))
        # store-010 is inactive in data/stores.json and must not appear
        self.assertFalse(any(s["id"] == "store-010" for s in stores))

    def test_sensitive_files_blocked_from_static_access(self):
        for blocked_path in ("/.env.example", "/server.py", "/data/stores.json"):
            status, _ = invoke_handler("GET", blocked_path)
            self.assertEqual(status, 403, f"Expected 403 for {blocked_path}")

    def test_booking_validation_rejects_missing_fields(self):
        status, payload = invoke_handler(
            "POST",
            "/api/bookings",
            {"customerName": "Meera", "mobileNumber": ""},
        )
        self.assertEqual(status, 400)
        self.assertFalse(payload["ok"])

    def test_booking_does_not_fake_success_when_google_sheets_unconfigured(self):
        status, payload = invoke_handler(
            "POST",
            "/api/bookings",
            {
                "customerName": "Meera Sundaram",
                "mobileNumber": "+91 98401 23456",
                "city": "Coimbatore",
                "store": "Pooja Boutique",
                "requirement": "Cotton sarees under ₹2,000",
                "preferredDate": "2026-11-20",
                "preferredTime": "11:00 AM",
            },
        )
        self.assertEqual(status, 503)
        self.assertFalse(payload["ok"])
        self.assertFalse(payload["configured"])
        self.assertEqual(payload["code"], "GOOGLE_SHEETS_NOT_CONFIGURED")

    def test_booking_persists_exact_columns_via_apps_script(self):
        captured = []

        class FakeResponse:
            def __init__(self, data: dict):
                self._data = json.dumps(data).encode("utf-8")

            def read(self):
                return self._data

            def __enter__(self):
                return self

            def __exit__(self, exc_type, exc_val, exc_tb):
                return False

        def fake_urlopen(req, timeout=15):
            captured.append(json.loads(req.data.decode("utf-8")))
            return FakeResponse({"ok": True})

        os.environ["GOOGLE_APPS_SCRIPT_URL"] = "https://script.google.com/macros/s/demo/exec"
        os.environ["GOOGLE_APPS_SCRIPT_SECRET"] = "test-secret"

        with mock.patch("urllib.request.urlopen", side_effect=fake_urlopen):
            status, payload = invoke_handler(
                "POST",
                "/api/bookings",
                {
                    "customerName": "Meera Sundaram",
                    "mobileNumber": "+91 98401 23456",
                    "whatsappNumber": "+91 98401 23456",
                    "email": "meera@example.com",
                    "city": "Coimbatore",
                    "store": "Pooja Boutique",
                    "requirement": "Saree for wedding",
                    "preferredDate": "2026-11-20",
                    "preferredTime": "11:00 AM",
                    "additionalNotes": "Pastel shades preferred",
                },
            )

            self.assertEqual(status, 201)
            self.assertTrue(payload["ok"])
            self.assertEqual(payload["bookingStatus"], "New")
            today_str = datetime.datetime.now().strftime("%Y%m%d")
            self.assertEqual(payload["bookingId"], f"MYMIGO-{today_str}-001")

            self.assertEqual(len(captured), 1)
            sent = captured[0]
            self.assertEqual(sent["secret"], "test-secret")
            self.assertEqual(
                sent["columns"],
                [
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
                ],
            )
            row = sent["row"]
            self.assertEqual(len(row), 13)
            self.assertEqual(row[0], f"MYMIGO-{today_str}-001")
            self.assertEqual(row[2], "Meera Sundaram")
            self.assertEqual(row[3], "+91 98401 23456")
            self.assertEqual(row[12], "New")

            # Verify sequence increments cleanly on second submission
            status2, payload2 = invoke_handler(
                "POST",
                "/api/bookings",
                {
                    "customerName": "Karthik R.",
                    "mobileNumber": "+91 98765 00001",
                    "city": "Bengaluru",
                    "store": "Loom & Tailors Studio",
                    "requirement": "Men's shirts",
                    "preferredDate": "2026-11-21",
                    "preferredTime": "03:00 PM",
                },
            )
            self.assertEqual(status2, 201)
            self.assertEqual(payload2["bookingId"], f"MYMIGO-{today_str}-002")

            # Verify submission with only WhatsApp Number and no email or additional notes
            status3, payload3 = invoke_handler(
                "POST",
                "/api/bookings",
                {
                    "customerName": "Ananya K.",
                    "whatsappNumber": "+91 99887 76655",
                    "city": "Salem",
                    "store": "Sri Murugan Handloom Weavers",
                    "requirement": "Ilampillai cotton sarees",
                    "preferredDate": "2026-11-22",
                    "preferredTime": "10.30 AM - 11.30 AM",
                },
            )
            self.assertEqual(status3, 201)
            self.assertEqual(payload3["bookingId"], f"MYMIGO-{today_str}-003")
            sent3 = captured[2]
            row3 = sent3["row"]
            self.assertEqual(row3[3], "+91 99887 76655")  # mobileNumber populated
            self.assertEqual(row3[4], "+91 99887 76655")  # whatsappNumber populated
            self.assertEqual(row3[5], "")                 # email empty
            self.assertEqual(row3[11], "")                # additionalNotes empty

    def test_homepage_api_get_and_post(self):
        # 1. GET returns valid config
        status_get, payload_get = invoke_handler("GET", "/api/homepage")
        self.assertEqual(status_get, 200)
        self.assertTrue(payload_get.get("ok"))
        self.assertIn("banner", payload_get.get("homepage", {}))
        self.assertIn("featuredStores", payload_get.get("homepage", {}))
        self.assertIn("featuredVideos", payload_get.get("homepage", {}))

        # 2. POST updates homepage config
        new_config = {
            "banner": {
                "imageDesktop": "./assets/hero-desktop.jpg",
                "imageMobile": "./assets/hero-mobile.jpg",
                "badgeTitle": "Custom Badge",
                "badgeSubtitle": "Across Cities",
                "headingLine1": "Style Made",
                "headingLine2": "Simple.",
                "subtitle": "Shop boutique collections live.",
                "button1": {"text": "Book Now", "action": "book_session", "link": "#/book", "enabled": True},
                "button2": {"text": "View Stores", "action": "explore_stores", "link": "#/stores", "enabled": True},
            },
            "featuredStores": ["store-silkwalk-studio", "store-kalyani-cotton", "store-urban-tops"],
            "featuredVideos": ["ig-02", "ig-01", "ig-04", "ig-03"],
        }
        status_post, payload_post = invoke_handler("POST", "/api/homepage", new_config)
        self.assertEqual(status_post, 200)
        self.assertTrue(payload_post.get("ok"))
        self.assertEqual(payload_post["homepage"]["banner"]["badgeTitle"], "Custom Badge")
        self.assertEqual(payload_post["homepage"]["featuredStores"][0], "store-silkwalk-studio")

        # 3. GET reflects updated values
        status_check, payload_check = invoke_handler("GET", "/api/homepage")
        self.assertEqual(status_check, 200)
        self.assertEqual(payload_check["homepage"]["banner"]["badgeTitle"], "Custom Badge")
        self.assertEqual(payload_check["homepage"]["featuredStores"][0], "store-silkwalk-studio")

    def test_users_api_crud(self):
        # 1. GET users
        status_get, payload_get = invoke_handler("GET", "/api/users")
        self.assertEqual(status_get, 200)
        self.assertTrue(payload_get.get("ok"))
        self.assertIsInstance(payload_get.get("users"), list)

        # 2. POST create user
        new_user = {
            "name": "Test Shopper",
            "email": "testshopper@example.com",
            "phone": "+91 99999 88888",
            "city": "Coimbatore",
            "preferences": "Handloom Sarees",
        }
        status_post, payload_post = invoke_handler("POST", "/api/users", new_user)
        self.assertEqual(status_post, 200)
        self.assertTrue(payload_post.get("ok"))
        created_user = payload_post.get("user", {})
        self.assertEqual(created_user.get("name"), "Test Shopper")
        user_id = created_user.get("id")
        self.assertTrue(bool(user_id))

        # 3. POST delete user
        status_del, payload_del = invoke_handler("POST", "/api/users", {"action": "delete", "id": user_id})
        self.assertEqual(status_del, 200)
        self.assertTrue(payload_del.get("ok"))
        self.assertFalse(any(u.get("id") == user_id for u in payload_del.get("users", [])))

    def test_sellers_api_and_store_sync(self):
        # 1. GET sellers
        status_get, payload_get = invoke_handler("GET", "/api/sellers")
        self.assertEqual(status_get, 200)
        self.assertTrue(payload_get.get("ok"))

        # 2. POST create seller
        new_seller = {
            "storeName": "Zari Luxe Handlooms",
            "ownerName": "Anand Kumar",
            "email": "anand@zariluxe.com",
            "phone": "+91 98888 77777",
            "city": "Chennai",
            "category": "Sarees",
            "description": "Pure zari borders and festive drapes.",
            "image": "https://example.com/zari.jpg",
            "videoUrl": "https://example.com/zari_reel.mp4",
            "badge": "Top Rated.",
            "rating": 4.9,
            "active": True,
        }
        status_post, payload_post = invoke_handler("POST", "/api/sellers", new_seller)
        self.assertEqual(status_post, 200)
        self.assertTrue(payload_post.get("ok"))
        created_seller = payload_post.get("seller", {})
        self.assertEqual(created_seller.get("storeName"), "Zari Luxe Handlooms")
        seller_id = created_seller.get("id")

        # Verify synced to stores
        status_stores, payload_stores = invoke_handler("GET", "/api/stores")
        self.assertEqual(status_stores, 200)
        self.assertTrue(any(s.get("name") == "Zari Luxe Handlooms" for s in payload_stores.get("stores", [])))

        # Clean up
        invoke_handler("POST", "/api/sellers", {"action": "delete", "id": seller_id})

    def test_upload_api(self):
        # Test base64 image upload
        dummy_base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        status_up, payload_up = invoke_handler("POST", "/api/upload", {
            "filename": "pixel.png",
            "fileData": dummy_base64,
        })
        self.assertEqual(status_up, 200)
        self.assertTrue(payload_up.get("ok"))
        self.assertTrue(payload_up.get("url", "").startswith("./uploads/"))
        self.assertEqual(payload_up.get("mediaType"), "image")

    def test_videos_api(self):
        # 1. GET /api/videos
        status_get, payload_get = invoke_handler("GET", "/api/videos")
        self.assertEqual(status_get, 200)
        self.assertTrue(payload_get.get("ok"))
        self.assertIsInstance(payload_get.get("videos"), list)

        # 2. POST /api/videos (upload/create)
        new_video = {
            "storeName": "Test Kurti Studio",
            "city": "Coimbatore",
            "caption": "Test Diwali Kurtis Collection!",
            "videoUrl": "./uploads/diwali_sale_kurtis.mp4",
        }
        status_post, payload_post = invoke_handler("POST", "/api/videos", new_video)
        self.assertEqual(status_post, 200)
        self.assertTrue(payload_post.get("ok"))
        created = payload_post.get("video", {})
        video_id = created.get("id")
        self.assertEqual(created.get("caption"), "Test Diwali Kurtis Collection!")

        # 3. POST /api/videos (like)
        status_like, payload_like = invoke_handler("POST", "/api/videos", {"action": "like", "id": video_id})
        self.assertEqual(status_like, 200)
        self.assertTrue(payload_like.get("video", {}).get("isLiked"))

        # 4. POST /api/videos (comment)
        status_cmt, payload_cmt = invoke_handler("POST", "/api/videos", {
            "action": "comment",
            "id": video_id,
            "text": "Beautiful kurti collections!",
            "userName": "Divya M",
        })
        self.assertEqual(status_cmt, 200)
        self.assertEqual(payload_cmt.get("comment", {}).get("text"), "Beautiful kurti collections!")

        # 5. POST /api/videos (share)
        status_share, payload_share = invoke_handler("POST", "/api/videos", {"action": "share", "id": video_id})
        self.assertEqual(status_share, 200)
        self.assertEqual(payload_share.get("video", {}).get("shareCount"), 1)

        # Clean up
        invoke_handler("POST", "/api/videos", {"action": "delete", "id": video_id})

    def test_video_range_request_returns_206(self):
        # Test HTTP 206 Partial Content Range support on static video file
        status, payload = invoke_handler(
            "GET",
            "/uploads/diwali_sale_kurtis.mp4",
            extra_headers={"Range": "bytes=0-1023"}
        )
        self.assertEqual(status, 206)
        self.assertEqual(payload.get("bytes_len"), 1024)


if __name__ == "__main__":
    unittest.main()
