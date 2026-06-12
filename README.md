# אדמון סוכנות לביטוח — Website

Hebrew (RTL) marketing and lead-generation website for Admon Insurance Agency,
deployed on Vercel as a static site with a single serverless function.

## Structure

| Path | Purpose |
|---|---|
| `index.html` | Homepage — all agency services (insurance, pension, finance), employers section, FAQ, lead form |
| `home-insurance.html` | Home insurance landing page (coverage, process, FAQ, lead form) |
| `accessibility-statement.html` | Accessibility statement (הצהרת נגישות) |
| `privacy-policy.html` / `terms-of-service.html` | Legal pages |
| `site.css` / `site.js` | Unified design system (navy/white/gold) and site behavior |
| `api/lead.js` | Serverless lead endpoint — validates the inquiry and emails it via the Gmail API |
| `sw.js` | Kill-switch service worker that removes the legacy cache for returning visitors |

## Lead flow

Every page carries a short inquiry form (interest + name + phone + optional note).
Submissions POST to `/api/lead`, which emails the lead to `LEAD_TO_EMAIL`.
If the endpoint is unavailable, the UI offers a prefilled WhatsApp fallback to
`https://wa.me/972509313531`.

## Environment variables (Vercel)

See `env.example`: `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REDIRECT_URI`,
`GMAIL_REFRESH_TOKEN`, `LEAD_TO_EMAIL`.

## Local preview

```bash
npm run dev   # serves the static site; /api/lead requires `vercel dev` + env vars
```
