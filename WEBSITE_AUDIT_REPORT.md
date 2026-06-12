# Admon Insurance Agency — Full Website Audit & Transformation Plan

**Audit date:** 2026-06-12
**Scope:** Entire repository — all pages, CSS, JavaScript, backend/API, deployment config, SEO assets.
**Standard applied:** "Would a 5,000-employee company trust this agency with its employee benefits program?"

---

## EXECUTIVE VERDICT

The website is a **single-product lead-gen funnel for home insurance, wearing the clothes of an agency homepage**. The agency manages ~₪1B across 16 service lines with 33 years of history and 10,000+ clients — and **none of that is on the website**. No pension, no provident funds, no keren hishtalmut, no Amendment 190, no employee benefits, no investments. A corporate decision-maker arriving here finds: a homepage where 5 of 6 insurance cards open a **"the site is still under construction"** popup, a contact section with **fake placeholder phone numbers**, dead social links, no license number, no testimonials, no partner logos, and a JPEG photo used as the logo.

The current site doesn't just undersell the agency — it actively contradicts its scale. This is fixable, and most of the highest-impact fixes are content and trust-signal work, not engineering.

---

## PART 1 — FINDINGS BY AREA

Severity levels: 🔴 Critical · 🟠 High · 🟡 Medium · ⚪ Low

### 1. Brand Positioning

| # | Sev | Finding |
|---|-----|---------|
| 1.1 | 🔴 | **The agency's core enterprise business is invisible.** 12 of 16 service lines (pension, gemel, hishtalmut, investment portfolios, executive insurance, Amendment 190, financial planning, employee benefits…) appear nowhere. The site positions a ₪1B financial house as a small home-insurance shop. |
| 1.2 | 🔴 | **Understated and inconsistent numbers.** Homepage: "30+ years, 9,000+ clients." Home-insurance footer: "20+ years." Reality: 33 years, 10,000+ clients, ~₪1B AUM. ₪1B AUM — the single strongest trust number — is never mentioned. Three different experience claims on one site reads as carelessness. |
| 1.3 | 🟠 | **Generic unverifiable superlative** as the entire positioning: "הסוכנות המובילה בישראל" (title tag, hero, footer). No proof, no specifics. Enterprise buyers discount this instantly; specifics ("₪1B בניהול, 33 שנים, MDRT Top of the Table") convert. |
| 1.4 | 🟠 | **No B2B narrative at all.** Nothing addresses HR departments, employers, or organizations. No "פתרונות לארגונים" section, no employer-facing CTA. |
| 1.5 | 🟡 | MDRT Top of the Table — genuinely elite credential — is buried inside the hero as a text block with a low-quality JPEG, instead of being a designed trust centerpiece. |

### 2. Visual Design

| # | Sev | Finding |
|---|-----|---------|
| 2.1 | 🔴 | **Logo is a JPEG photograph** (`images/admon.jpeg`, 803×538) used as header logo, favicon, apple-touch-icon, and og:image. No vector logo, no brand mark. This alone signals "small business." |
| 2.2 | 🔴 | **Two competing design systems.** Homepage (main-page.css): navy/teal (#013369/#00A3E0). Inner pages (css-split): indigo/purple/pink gradients (#667eea/#764ba2/#f093fb). `--primary-blue` is defined 4 times with 4 different values. 28 distinct blue shades. Clicking from homepage to the quote page feels like changing websites. |
| 2.3 | 🟠 | **Placeholder art shipped to production:** the About image is an inline SVG gradient with the text "30+ שנות מצוינות"; the hero and contact images are abstract inline SVGs. No real photography — no office, no team, no faces. Insurance is bought from people. |
| 2.4 | 🟠 | 28 keyframe animations: floating blurred shapes (`blur(80px)`), particles, pulsing CTAs. Reads as a startup template, not a financial institution. Financial-services design language is calm, dense, and confident. |
| 2.5 | 🟡 | 10 border-radius values, 10 font-family stacks, 357 box-shadows, emoji used in CSS `content` (🚧, 💡). No design tokens discipline. |
| 2.6 | 🟡 | The "לשכת סוכני הביטוח" membership badge is an inline SVG with tiny rendered text — looks homemade. |

### 3. UX

| # | Sev | Finding |
|---|-----|---------|
| 3.1 | 🔴 | **5 of 6 homepage insurance cards open an "under construction" modal** ("האתר עוד בבנייה"). Telling every visitor the site is unfinished is the fastest possible way to lose an enterprise prospect. Cards should lead to real content pages with a callback CTA. |
| 3.2 | 🟠 | The only conversion paths are WhatsApp/phone or a long multi-step underwriting wizard. No lightweight "leave name + phone, we'll call you" form anywhere — the highest-converting pattern in Israeli insurance. |
| 3.3 | 🟠 | The quote wizard collects **Teudat Zehut, full address, mortgage bank/branch, jewelry values** before any human contact. This is underwriting-grade friction for what should be a lead capture. Each extra sensitive field cuts completion sharply. |
| 3.4 | 🟡 | 12 blocking `alert()` dialogs in the form flow (script.js:394, 400, 487, 501, 1903…). |
| 3.5 | 🟡 | Construction-type dropdown has exactly one option ("בלוקים ובטון") — looks broken (home-insurance.html:762-765). |
| 3.6 | 🟡 | No breadcrumbs, no header phone number, no sticky CTA on desktop. |

### 4. UI

| # | Sev | Finding |
|---|-----|---------|
| 4.1 | 🟠 | 488 `!important` declarations (310 in the responsive file alone) — cascade wars, visual regressions waiting to happen. |
| 4.2 | 🟡 | Duplicated keyframes (fadeIn ×4, fadeInUp ×3), 801 comment blocks / dead CSS. |
| 4.3 | 🟡 | Inline styles on the logo and CTA sections in HTML, overriding the stylesheets. |

### 5. Mobile Experience

| # | Sev | Finding |
|---|-----|---------|
| 5.1 | 🔴 | **Homepage mobile navigation is broken.** CSS hides `.nav-menu` off-screen below 768px and shows it only via `.mobile-menu-toggle` — but `index.html` contains **no hamburger button** in the markup. Mobile users (the majority of Israeli insurance traffic) have no navigation on the homepage. |
| 5.2 | 🟠 | Heavy blur/particle animations on mobile patched with band-aid `!important` rules and a "prevent white screen on mobile" hack — evidence of recurring mobile breakage. |
| 5.3 | 🟡 | Touch targets are handled (48px on `pointer: coarse`) — good. But the long wizard on mobile with `overflow` hacks is fragile. |

### 6. Desktop Experience

| # | Sev | Finding |
|---|-----|---------|
| 6.1 | 🟡 | Hero spends an enormous viewport on animation; the actual value proposition ("מה אנחנו עושים, למי, ולמה לסמוך עלינו") is below the fold. |
| 6.2 | 🟡 | No header contact info / CTA button in the nav bar — standard for insurance sites. |

### 7. Accessibility

| # | Sev | Finding |
|---|-----|---------|
| 7.1 | 🔴 | **No accessibility statement and the footer "נגישות" link is `href="#"`.** Israeli law (תקנות שוויון זכויות, IS 5568 / WCAG 2.0 AA) requires both for a business website. This is real legal/financial exposure and an instant fail in corporate vendor screening. |
| 7.2 | 🟠 | No `dir="rtl"` on `<html>`; RTL is patched via 189 scattered CSS rules, many with `!important`. Screen readers and browser UI behave incorrectly. |
| 7.3 | 🟠 | `prefers-reduced-motion` respected in only 2 of 6 CSS files; 25+ `outline: none` occurrences, some force-removing focus indicators. |
| 7.4 | 🟡 | Two `<h1>` per page (logo + hero). Low-contrast gray placeholder text (#9ca3af). No skip-link. Modal lacks focus trap / `aria-modal`. |

### 8. Trust Signals

| # | Sev | Finding |
|---|-----|---------|
| 8.1 | 🔴 | **Fake placeholder contact details live in production** (home-insurance.html contact + footer): phone "1-800-ADMON-1" and "03-1234567", email `info@admon-insurance.co.il` (a domain the agency doesn't use), address "רחוב הרצל 100, תל אביב". The homepage footer says 03-9313135, `yizhaq@admon-ina.co.il`, מוטה גור 5 פתח תקווה. **Four different phone numbers exist across the site** (incl. +972-50-887-5945 in structured data). A prospect who calls the fake number is lost forever. |
| 8.2 | 🔴 | **Both WhatsApp links appear broken**: `wa.me/97239313135` (a landline — almost certainly not on WhatsApp) and `wa.me/9720509313531` (malformed: extra 0, 12 digits — invalid number). The site's primary CTAs likely dead-end. |
| 8.3 | 🔴 | **No insurance agent license number** (רישיון משווק/סוכן, רשות שוק ההון) anywhere. First thing corporate procurement and savvy individuals verify. |
| 8.4 | 🟠 | All 4 social links are `href="#"`. Dead LinkedIn especially hurts B2B. |
| 8.5 | 🟠 | Zero testimonials, zero client logos, zero Google-reviews integration, no team page, no insurer-partner logos (הראל, הפניקס, מגדל, כלל, מנורה…). |
| 8.6 | 🟡 | Footer copyright "© 2024" (it is 2026) — classic "abandoned site" signal. |
| 8.7 | 🟡 | Leads are emailed to `royadmon23@gmail.com` (hardcoded 15×). If a corporate contact ever receives correspondence from a Gmail address, credibility is gone. Use the domain. |

### 9. Conversion Optimization

| # | Sev | Finding |
|---|-----|---------|
| 9.1 | 🔴 | **Zero analytics.** No GA4, no GTM, no Meta pixel, no Clarity/Hotjar, no conversion events. The funnel cannot be measured, so it cannot be improved, and paid acquisition is impossible to optimize. |
| 9.2 | 🟠 | No simple callback form (name+phone) — only WhatsApp, phone, or the heavy wizard. |
| 9.3 | 🟠 | No exit-intent, no mid-wizard save/abandonment recovery (the lead's phone is captured at step 1 but partial leads are not forwarded to sales). |
| 9.4 | 🟡 | CTA copy is generic ("התחל עכשיו"); no risk-reversal copy ("ללא התחייבות", "תוך X שעות"). |

### 10. SEO

| # | Sev | Finding |
|---|-----|---------|
| 10.1 | 🔴 | **4 indexable pages for a 16-product business.** No pages exist for ביטוח פנסיוני, קרן השתלמות, קופת גמל, תיקון 190, ביטוח מנהלים, ביטוח משכנתא, ביטוחים לארגונים — all high-intent, winnable Hebrew keywords. Competitors own these SERPs. |
| 10.2 | 🟠 | Structured data is thin/incorrect: og:image declared 1200×630 but actual file is 803×538; `sameAs` points to itself; no street address in PostalAddress; no `aggregateRating`; foundingDate inconsistent with the claims. |
| 10.3 | 🟡 | Obsolete meta tags (`keywords`, `revisit-after`); no `og:locale=he_IL`; no FAQPage schema on the FAQ section (free rich snippet); duplicate H1s. |
| 10.4 | 🟡 | No blog/knowledge content at all — zero topical authority. |

### 11. Performance

| # | Sev | Finding |
|---|-----|---------|
| 11.1 | 🟠 | `script.js` (8,180 lines, ~300KB) served with `Cache-Control: no-cache, no-store` (vercel.json) — re-downloaded on every visit, on every page, including the homepage which barely uses it. |
| 11.2 | 🟠 | ~19,600 lines of CSS across 6 files, largely unminified, with render-blocking loads; `blur(80px)` animated shapes and 30+ backdrop-filters cause constant repaints (esp. mobile). |
| 11.3 | 🟡 | Google Fonts loaded twice (two `<link>`s incl. Inter twice); feather-icons from unpkg (third-party SPOF) — homepage loads it blocking. |
| 11.4 | 🟡 | sw.js caches with a hardcoded `v1` name and no busting strategy — users can be stuck on stale code after fixes ship. |

### 12. Security

| # | Sev | Finding |
|---|-----|---------|
| 12.1 | 🔴 | **Internal files are publicly deployed.** `outputDirectory: "."` with a minimal `.vercelignore` means `server.js`, `env.example`, `docker-compose.yml` (containing `admin:password123`), `script_backup.js`, `test-google-sheets.html`, and ~15 internal setup/troubleshooting .md docs are all fetchable from the production domain. This is a roadmap for attackers and devastating if a corporate IT team checks. |
| 12.2 | 🔴 | Unauthenticated debug endpoints in production: `/api/test-mongodb`, `/api/test-sheets-connection` (the latter returns the service-account email and spreadsheet ID). |
| 12.3 | 🔴 | JWT fallback secret `'your-secret-key'` (server.js:336,360) — if env var is unset, verification tokens are forgeable. |
| 12.4 | 🟠 | CORS `Access-Control-Allow-Origin: *` on all `/api/*` endpoints; `/api/submit-form` accepts unauthenticated POSTs (lead spam, sheet/email flooding); no CAPTCHA/honeypot; serverless endpoints have no rate limiting (the Express limiters don't apply on Vercel). |
| 12.5 | 🟠 | **PII mishandling:** Teudat Zehut + full form data stored unencrypted in `localStorage`; PII (incl. ID numbers) logged via `console.log` in serverless functions (visible in Vercel logs); debug functions exposed on `window` that dump form data; ID "encrypted" with bcrypt (wrong tool — irreversible and unsearchable, yet the raw ID still flows through email/Sheets in plaintext). Israeli Privacy Protection Law (incl. Amendment 13, 2025) exposure. |
| 12.6 | 🟡 | Formula-injection risk into Google Sheets (unsanitized `formData` rows); unescaped user input interpolated into email HTML. |

### 13. Architecture & 14. Code Quality

| # | Sev | Finding |
|---|-----|---------|
| 13.1 | 🟠 | Four overlapping backends — Express `server.js` (unused on Vercel), `/api` serverless functions, Google Sheets, n8n webhooks — with duplicated email-formatting logic (~350 lines duplicated between server.js and generate-pdf.js) and no documented data flow. |
| 13.2 | 🟠 | `script.js`: 8,180-line monolith, 122 global functions, 251 console.log statements, duplicate implementations (two code-input handlers), placeholder URL `'https://your-n8n-webhook-url'` (line 1506), TODOs, commented-out submission logic. |
| 13.3 | 🟡 | Dead weight in repo: `script_backup.js`, `test-email.js`, unused deps (`aws-sdk`, `nodemailer`, `html-pdf-node`, `open`, full `puppeteer` alongside `puppeteer-core`), 15+ internal .md guides in root. |
| 13.4 | ⚪ | Only one test file (`__tests__/postal.test.js`). No linting, no CI. |

### 15–17. Lead Generation, Contact Experience, Forms

| # | Sev | Finding |
|---|-----|---------|
| 15.1 | 🔴 | Only one product can generate a structured lead (home insurance). 15 lines of business have no capture mechanism at all. |
| 15.2 | 🟠 | Contact experience: no contact page, no office hours on homepage, no map, no embedded form; fake details on the funnel page (see 8.1). |
| 15.3 | 🟠 | Email-verification step in the wizard adds friction *before* the lead is secured; partial submissions are discarded. |
| 15.4 | 🟡 | No Israeli ID checksum validation (accepts invalid IDs → bad data to sales). |

### 18. Insurance Industry Credibility & 19. Corporate Sales Readiness

| # | Sev | Finding |
|---|-----|---------|
| 18.1 | 🔴 | Missing all industry-standard credibility content: license numbers, regulator links (רשות שוק ההון), insurer partnerships, claims-handling stats, team credentials, professional indemnity mention. |
| 19.1 | 🔴 | Nothing for a corporate evaluator: no employee-benefits page, no org-facing case studies, no RFP/contact path for employers, no English page, no company profile (about/management/history timeline). The agency cannot currently send this URL in a B2B email signature without losing deals. |

---

## SECTION A — Top 20 Highest-Impact Improvements

1. Fix all contact data sitewide — one real phone, real email on the domain, real address; remove "1-800-ADMON-1", "03-1234567", "info@admon-insurance.co.il", "רחוב הרצל 100" (🔴 8.1).
2. Fix/verify both WhatsApp deep links with the real WhatsApp business number (🔴 8.2).
3. Kill the "under construction" modal; create real landing pages (even concise ones) for every line of business with a callback form (🔴 3.1, 15.1).
4. Build the **financial services / פנסיה וגמל / employee benefits** section — pension, hishtalmut, gemel, Amendment 190, executive insurance, employer solutions (🔴 1.1, 19.1).
5. Publish the true numbers everywhere consistently: 33 שנים, 10,000+ לקוחות, כ-₪1 מיליארד בניהול (🔴 1.2).
6. Restore mobile navigation on the homepage (add the hamburger button) (🔴 5.1).
7. Add a short callback lead form (name + phone + topic) on every page, wired to the backend (🟠 9.2).
8. Display agent license number(s) + regulator reference in the footer and About (🔴 8.3).
9. Add an accessibility statement page and fix the legally required basics (dir="rtl", focus states, reduced motion) (🔴 7.1, 7.2).
10. Install GA4 + GTM + conversion events (+ Meta pixel if running ads) (🔴 9.1).
11. Stop deploying internal files: set proper deployment excludes for server.js, docs, env.example, docker-compose, backups, test pages (🔴 12.1).
12. Remove/protect `/api/test-*` endpoints; require `JWT_SECRET`; lock CORS to the real origin; add rate limiting + honeypot/CAPTCHA to form endpoints (🔴 12.2–12.4).
13. Unify the design system: one palette (recommend the navy/gold institutional direction), one font stack, tokens defined once (🔴 2.2).
14. Commission a real vector logo + favicon set + proper 1200×630 og:image (🔴 2.1).
15. Real photography: Yitzhak Admon, the team, the office; replace all placeholder SVGs (🟠 2.3).
16. Trust strip: insurer partner logos, לשכת סוכני הביטוח, MDRT (redesigned), Google reviews rating (🟠 8.5).
17. Testimonials + 2–3 case studies (incl. one business/organization client) (🟠 8.5).
18. SEO buildout: a page per service line targeting Hebrew keywords + FAQPage schema + corrected InsuranceAgency schema (🔴 10.1, 🟠 10.2).
19. Capture partial wizard leads (forward step-1 contact info on abandonment) and move ID/sensitive fields to the end or post-contact (🟠 3.3, 15.3).
20. Stop emailing leads to Gmail; move recipient to env var with a domain mailbox (🟠 8.7).

## SECTION B — Quick Wins (under 1 day each)

- Replace all fake/placeholder contact details (find-and-replace, 4 files).
- Fix the two WhatsApp links.
- Add the missing hamburger button to index.html (markup exists pattern in home-insurance.html; JS+CSS already support it).
- Update footer year to dynamic (`new Date().getFullYear()`).
- Unify the numbers: 33 years / 10,000+ clients everywhere; add ₪1B AUM to hero stats.
- Remove dead social links (or point to real profiles); keep only ones that exist.
- Add license number(s) to footer.
- Add GA4 snippet + basic events (CTA clicks, wizard step, submit).
- Add `dir="rtl"` to `<html>` on all pages.
- Delete `/api/test-mongodb.js`, `/api/test-sheets-connection.js`, `test-google-sheets.html`; expand `.vercelignore` (server.js, *.md, env.example, docker-compose.yml, Dockerfile, script_backup.js, init-mongo.js, brevo/n8n json, test-*).
- Set `JWT_SECRET` in Vercel env and remove the `'your-secret-key'` fallback (fail fast).
- Move `royadmon23@gmail.com` to an env var.
- Fix og:image dimensions claim; add `og:locale`; remove `keywords`/`revisit-after` metas.
- Add FAQPage structured data to the existing FAQ.
- Remove the 12 `alert()` calls in favor of the existing notification component.
- Allow `script.js` to cache with a version query param instead of `no-store`.

## SECTION C — Trust & Credibility Improvements

1. License numbers + regulator link + "מפוקח על ידי רשות שוק ההון" line.
2. Accessibility statement (legal requirement) + visible accessibility widget/controls.
3. Real logo, real photos, real people — About page with Yitzhak Admon's bio, team, office.
4. Insurer partner logo strip (the companies you actually broker for).
5. Redesigned MDRT Top of the Table feature (it's a world-class differentiator — treat it like one).
6. Google Reviews integration with live rating; 6–10 written testimonials with full names.
7. Consistent, verified numbers + a "33 שנות פעילות" timeline.
8. Domain-based email everywhere; no Gmail anywhere customer-visible.
9. Security/privacy posture page ("איך אנחנו שומרים על המידע שלך") — rare among Israeli agencies, powerful for corporates.
10. Press/recognition section if any exists.

## SECTION D — Lead Generation Improvements

1. Short callback form (name+phone+interest) on every page + sticky mobile CTA bar.
2. Landing page per product with its own form → 16 capture points instead of 1.
3. Partial-lead capture from the wizard (contact details are known at step 1 — route abandoners to sales).
4. Defer Teudat Zehut & bank details to post-contact; cut wizard friction.
5. Analytics + funnel events → iterate on drop-off points.
6. Click-to-call phone number in the sticky header.
7. "תיק ביטוח Check-Up חינם" lead magnet (the value-prop section already hints at this — make it a form, not a WhatsApp link).
8. Employer/HR-specific contact path ("פתרונות לארגונים — דברו עם מומחה").
9. Exit-intent offer on the funnel page.
10. Response-time promise ("נחזור אליך תוך X שעות בימי עסקים") near every form.

## SECTION E — Required Before Showing to a 1,000+ Employee Company

Gate list — do not send the URL to enterprise prospects until ALL are done:

1. All fake contact data removed; one consistent identity (phone/email/address) sitewide.
2. "Under construction" modal gone; every service line has at least a credible page.
3. Employee benefits / organizational solutions page with employer-facing copy and a dedicated contact route.
4. License numbers + accessibility statement + updated privacy policy (named DPO/contact, Amendment 13 compliance).
5. Real logo and real photography; one unified design system.
6. About/leadership page (corporate buyers buy the people).
7. Internal files no longer publicly accessible; test endpoints removed; basic security hygiene done.
8. Working mobile navigation and a clean mobile pass on all pages.
9. Domain email for all correspondence.
10. At least 2 organizational testimonials/case studies.

## SECTION F — Scores (1–10)

| Dimension | Score | Rationale |
|---|---|---|
| Trust | **2/10** | Fake contact info, dead links, no license, Gmail leads, "under construction" |
| Design | **4/10** | Modern template energy, but two clashing systems, JPEG logo, placeholder art |
| User Experience | **4/10** | Decent funnel page structure; broken mobile nav, heavy wizard, blocking alerts |
| Enterprise Readiness | **1/10** | The enterprise offering does not exist on the site |
| Lead Generation | **3/10** | One working funnel for one product; zero measurement; high friction |
| Brand Authority | **2/10** | Strongest assets (₪1B, 33y, MDRT ToT) absent or buried |
| Overall Professionalism | **3/10** | Production site contains placeholders, debug endpoints, and internal docs |

---

## ROI-RANKED ACTION PLAN

### Phase 1 — Stop the bleeding (Days 1–3) · Near-zero cost, maximum ROI
1. Fix all contact details + WhatsApp links (every wrong number is a lost lead **today**).
2. Add homepage hamburger button (mobile nav restored).
3. Remove "under construction" modal → cards link to a single interim "כל תחומי הביטוח" page with a callback form.
4. Security hygiene: expand .vercelignore, delete test endpoints/pages, enforce JWT_SECRET, env-var the lead email, lock CORS.
5. Install GA4/GTM + conversion events.
6. Consistent numbers (33/10,000/₪1B) + license number + dynamic copyright year + dir="rtl".

### Phase 2 — Trust layer (Weeks 1–2)
7. Vector logo + favicon set + og:image.
8. Accessibility statement + focus/reduced-motion/contrast fixes.
9. Real photography + About/team page.
10. Trust strip (insurer logos, MDRT redesign, lectures/membership), testimonials, Google reviews.
11. Short callback form component, deployed on all pages; partial-lead capture from wizard.

### Phase 3 — Become the business you actually are (Weeks 3–6)
12. Service pages for all 16 lines (start with: פנסיה, השתלמות, גמל, תיקון 190, ביטוח מנהלים, ביטוח משכנתא — highest search value).
13. "פתרונות לארגונים ומעסיקים" enterprise section + case studies.
14. Unify design system (single token file; migrate inner pages to the institutional palette).
15. SEO: schema corrections, FAQPage markup, sitemap expansion, internal linking.

### Phase 4 — Engineering hardening (Weeks 6–10)
16. Refactor script.js into modules; remove console.logs/debug globals/localStorage PII; checksum-validate IDs.
17. Consolidate backend (one path: API → DB → CRM/sheet → notification); shared email templates; input sanitization; rate limiting + CAPTCHA.
18. Performance: minify/bundle CSS, fix caching strategy, self-host fonts/icons, tame animations; target Lighthouse ≥90 mobile.
19. CI with lint + tests; staging environment so placeholders never ship again.

**Expected impact:** Phases 1–2 alone should multiply lead volume (working contact paths + measurement + lower friction) and remove every instant-disqualification signal for corporate visitors. Phase 3 is where the site starts *winning* enterprise deals instead of merely not losing them.
