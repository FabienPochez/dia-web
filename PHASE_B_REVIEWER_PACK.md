# PHASE B: iOS Universal Links - Reviewer Pack

## 1. SUMMARY

- Created AASA file at `public/.well-known/apple-app-site-association` (extensionless) with minimal JSON configuration
- Created fallback `apple-app-site-association.json` file for Vercel rewrite approach
- Updated `vercel.json` to rewrite extensionless path to `.json` file (handles Vercel's static file serving limitations)
- Added Content-Type header configuration to ensure proper `application/json` MIME type
- Configured appID: `2F9LBWAS5U.live.diaradio` (Team ID: 2F9LBWAS5U, Bundle ID: live.diaradio)
- Configured path pattern: `/episodes/*` for Universal Links
- Rewrite rule placed before catch-all to ensure AASA file is served correctly
- Implementation follows Apple's AASA specification with minimal required fields
- Ready for deployment to https://diaradio.live
- Verification commands provided for post-deployment testing

## 2. DIFFS

### vercel.json
```diff
--- a/vercel.json
+++ b/vercel.json
@@ -1,9 +1,24 @@
 {
   "rewrites": [
+    {
+      "source": "/.well-known/apple-app-site-association",
+      "destination": "/.well-known/apple-app-site-association.json"
+    },
     {
       "source": "/(.*)",
       "destination": "/index.html"
     }
+  ],
+  "headers": [
+    {
+      "source": "/.well-known/apple-app-site-association",
+      "headers": [
+        {
+          "key": "Content-Type",
+          "value": "application/json"
+        }
+      ]
+    }
+  ]
 }
```

### public/.well-known/apple-app-site-association (new file)
```diff
--- /dev/null
+++ b/public/.well-known/apple-app-site-association
@@ -0,0 +1,11 @@
+{
+  "applinks": {
+    "apps": [],
+    "details": [
+      {
+        "appID": "2F9LBWAS5U.live.diaradio",
+        "paths": ["/episodes/*"]
+      }
+    ]
+  }
+}
```

### public/.well-known/apple-app-site-association.json (new file)
```diff
--- /dev/null
+++ b/public/.well-known/apple-app-site-association.json
@@ -0,0 +1,11 @@
+{
+  "applinks": {
+    "apps": [],
+    "details": [
+      {
+        "appID": "2F9LBWAS5U.live.diaradio",
+        "paths": ["/episodes/*"]
+      }
+    ]
+  }
+}
```

## 3. COMMANDS TO VERIFY

### Check HTTP Status and Headers
```bash
curl -I https://diaradio.live/.well-known/apple-app-site-association
```

**Expected:**
- HTTP/2 200 (or HTTP/1.1 200 OK)
- `Content-Type: application/json`
- No redirects (3xx status codes)

### Verify Response Body
```bash
curl https://diaradio.live/.well-known/apple-app-site-association
```

**Expected output:**
```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "2F9LBWAS5U.live.diaradio",
        "paths": ["/episodes/*"]
      }
    ]
  }
}
```

### Verify JSON Validity
```bash
curl -s https://diaradio.live/.well-known/apple-app-site-association | jq .
```

**Expected:** Valid JSON output (no parse errors)

### Check for Redirects
```bash
curl -I -L https://diaradio.live/.well-known/apple-app-site-association 2>&1 | grep -E "HTTP|Location"
```

**Expected:** Only one HTTP response (200), no Location header

### Verify Content-Type Header
```bash
curl -I https://diaradio.live/.well-known/apple-app-site-association | grep -i content-type
```

**Expected:** `Content-Type: application/json`

### Full Verification (Status + Body + Headers)
```bash
curl -v https://diaradio.live/.well-known/apple-app-site-association 2>&1 | head -20
```

## 4. QUESTIONS & RISKS

- **Vercel Static File Serving**: The rewrite approach may be unnecessary if Vercel serves extensionless files correctly. Monitor after deployment to confirm the rewrite is working as expected.
- **Content-Type Header**: Vercel may override the Content-Type header. Verify post-deployment that `application/json` is served (not `text/plain` or `application/octet-stream`).
- **Apple Validation**: Apple's validation service may cache the AASA file. Allow 24-48 hours for changes to propagate through Apple's CDN.
- **Path Pattern Scope**: Current pattern `/episodes/*` only matches episode pages. Consider if other paths need Universal Links (e.g., `/episodes`, `/podcast/*`).
- **HTTPS Requirement**: Universal Links require HTTPS. Verify SSL certificate is valid and not expiring soon on diaradio.live.
- **App Configuration**: Ensure the iOS app has the correct Associated Domains entitlement configured with `applinks:diaradio.live`.
- **Testing**: Universal Links can only be fully tested on physical iOS devices. Simulator testing is limited.
- **Fallback File**: The `.json` fallback file is publicly accessible. Consider if this is acceptable or if additional security measures are needed.
