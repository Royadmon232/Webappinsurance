# Google Cloud Console Setup for OAuth Demo

## 🎯 Critical Setup Steps

### Step 1: Update Authorized Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `graceful-fact-463514-e5`
3. Navigate to: **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID: `476619737917-897o8kin4slckl9k3rqc39eu38gqsggo.apps.googleusercontent.com`
5. Click the **edit button** (pencil icon)

### Step 2: Add Demo Redirect URI

In the **Authorized redirect URIs** section, add:
```
http://localhost:8000/oauth-demo-english.html
```

**Keep your existing URI as well:**
```
https://webappinsurance.vercel.app/auth/google/callback
```

### Step 3: Enable Gmail API

1. Navigate to: **APIs & Services** → **Library**
2. Search for "Gmail API"
3. Click on "Gmail API"
4. Click **Enable** (if not already enabled)

### Step 4: Configure OAuth Consent Screen

1. Navigate to: **APIs & Services** → **OAuth consent screen**
2. Ensure the following details are set:

**App Information:**
- App name: `Admon Insurance Agency`
- User support email: `royadmon23@gmail.com`
- Developer contact: `royadmon23@gmail.com`

**App Domain:**
- Application home page: `https://admon-insurance-agency.co.il`
- Application privacy policy: `https://admon-insurance-agency.co.il/privacy`
- Application terms of service: `https://admon-insurance-agency.co.il/terms`

**Scopes:**
- `https://www.googleapis.com/auth/gmail.send`
- `https://www.googleapis.com/auth/gmail.compose`
- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/userinfo.profile`

---

## 🚨 Important Notes

### For Demo Recording:
- Use the localhost redirect URI: `http://localhost:8000/oauth-demo-english.html`
- This allows the demo to work locally while recording

### For Production:
- Your Vercel redirect URI remains active: `https://webappinsurance.vercel.app/auth/google/callback`
- Both URIs can coexist in the same OAuth client

### Security:
- Never share your Client Secret publicly
- The demo runs locally and doesn't send credentials anywhere
- Remove localhost URI after demo if desired

---

## ✅ Verification Checklist

Before recording:
- [ ] Gmail API enabled
- [ ] OAuth consent screen configured
- [ ] Both redirect URIs added
- [ ] App name shows as "Admon Insurance Agency"
- [ ] All 4 scopes are approved
- [ ] Test authentication works

---

## 🎬 Ready to Record!

Once setup is complete:
1. Run: `python3 run-english-demo.py`
2. Open: `http://localhost:8000/oauth-demo-english.html`
3. Start screen recording
4. Follow the OAuth flow
5. Show consent screen clearly
6. Send real email
7. Stop recording

**This configuration will show Google exactly what they need to see!** 🚀 