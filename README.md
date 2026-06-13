# אדמון סוכנות לביטוח — Website

Hebrew (RTL) marketing and lead-generation website for Admon Insurance Agency,
deployed on Vercel as a fully static site (no backend).

## Structure

| Path | Purpose |
|---|---|
| `index.html` | Homepage — all services (private insurance, pension/finance, business, employers), partner logo wall, animated AUM counter, FAQ, lead form |
| `accessibility-statement.html` | Accessibility statement (הצהרת נגישות) |
| `privacy-policy.html` / `terms-of-service.html` | Legal pages |
| `site.css` / `site.js` | Unified design system (navy/white/gold) and site behavior |
| `images/logos/` | Insurance companies & investment houses logo wall (official brand logos) |
| `sw.js` | Kill-switch service worker that removes the legacy cache for returning visitors |

## Lead flow

The site is contact-only — there is no backend. The homepage lead form
(interest + name + phone + optional note) and every WhatsApp button open
WhatsApp directly with a prefilled Hebrew message to `https://wa.me/972509313531`.
The chosen service is included automatically; name and phone are appended when entered.

## Partner logos

`images/logos/` holds the official brand logos shown in the partners section
(insurance companies & investment houses), displayed full-color with a subtle
hover zoom.

## Local preview

```bash
npm run dev   # serves the static site
```
