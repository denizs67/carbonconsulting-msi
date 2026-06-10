# CarbonConsulting — CBAM Compliance & Carbon Certificate Management System

> İstanbul Technical University · Faculty of Management — Department of Management Engineering
> **ISL 343E — Management Information Systems**, 2025–2026 Spring · Term Project
> Course Instructor: **Doç. Dr. Nihan Yıldırım** · Prepared by: **Deniz Sevindi (070190412)**

**🔴 Live application:** https://carbonconsulting-msi.web.app
**📄 Final report:** [`CarbonConsulting_Final_Report.docx`](CarbonConsulting_Final_Report.docx)

---

## 1. Problem & Aim (Preliminary Study summary)

The EU **Carbon Border Adjustment Mechanism (CBAM)** entered its definitive period on **1 January 2026**. Importers of carbon-intensive goods must surrender CBAM certificates priced against the EU ETS (EUA). Türkiye — a major EU exporter of steel, cement, aluminium, fertilizer and electricity — must therefore quantify the embedded emissions of its exports and the resulting certificate cost.

Today this is done **manually**: production data in spreadsheets, emission factors scattered across standards, hand calculations in Excel, and certificate prices looked up by web search. The process is slow, inconsistent, error-prone (e.g. double-counting scrap-based reductions) and the price is stale by the time the report is done.

**CarbonConsulting** turns this into a fast, consistent, auditable web tool: select a sector, enter a few production inputs, and obtain the Scope 1+2 emission, the CBAM certificate requirement and two procurement cost scenarios — using **live certificate prices**.

## 2. Existing systems (benchmark summary)

| Solution | Type | Gap it leaves |
|---|---|---|
| SAP Green Ledger / CBAM | Enterprise SaaS | Requires SAP ERP; very expensive |
| Persefoni / Watershed / CarbonChain | ESG/carbon SaaS | Generic, not CBAM-cert/cost or TR-sector specific |
| GHG Türkiye Calculator | Free web | Generic GHG; no CBAM need / live price |
| EU CBAM Transitional Registry | Reporting portal | Reporting only, not a calculator |
| Excel + consultant | Manual | Error-prone, slow, no live data, no record |

CarbonConsulting fills the gap: **CBAM-specific, Turkish sector factors, live pricing, cost scenarios, free public access.**

## 3. Covered sectors

Iron & Steel · Cement · Aluminium · Fertilizer · Electricity — each with its own emission factors and calculation logic (production routes, clinker ratio, PFC/technology, N₂O abatement, fuel mix).

## 4. System overview (Analysis & Design summary)

- **Actors:** Exporter Company User (primary) and System Administrator.
- **Core logic:** `Emission = Production × Emission Factor × Adjuster` (route-aware — e.g. the steel scrap discount is never applied to the already scrap-based Scrap-EAF route, preventing double counting). `Certificate Need = Emission × EU export ratio`. Two cost scenarios: mandatory CBAM (EUA) and CBAM + voluntary net-zero (VCM offsets the non-EU residual only — VCM cannot discharge the CBAM obligation).
- **Architecture:** three-tier — static front-end (HTML/Tailwind/Chart.js) · client-side calculation + price loader · Supabase (PostgreSQL) data tier · Firebase Hosting.

Full context diagram, AS-IS/TO-BE flowcharts, ER diagram, use-case diagram, data dictionary, MCDM, test plan and conversion strategy are in the [final report](CarbonConsulting_Final_Report.docx).

## 5. Project structure

```
website/                     Deployed web app (5 pages)
  index.html                 Home + live price summary
  sektorler.html             5 sector profiles
  sertifikalar.html          EU ETS / TR-ETS / VCM markets + price chart
  hesaplama.html             Calculator (dynamic engine, live prices)
  yesil-finansman.html       Green finance (informational)
  supabase-prices.js         Live certificate-price loader (with static fallback)
  kaynaklar.md               Internal data-source reference
report_build/                Report generator
  build_report.js            docx-js report builder
  svg/  img/                 Diagram sources (SVG) and rendered PNGs
CarbonConsulting_Final_Report.docx   Final report (deliverable)
kullanici-tipleri.md / .svg   User types & use-case design notes
firebase.json / .firebaserc   Firebase Hosting config
```

## 6. Database (Supabase)

Live table feeding the calculator:

```sql
create table certificate_prices (
  id text primary key,        -- 'EUA' | 'VCM' | 'TR-ETS'
  name text not null,
  price numeric,              -- null for TR-ETS (no price yet)
  currency text,              -- 'EUR' | 'USD'
  change_pct numeric,
  unit text default 'tCO2e',
  updated_at timestamptz default now()
);
alter table certificate_prices enable row level security;
create policy "public read" on certificate_prices for select using (true);
```

> **API key note (per course guideline):** the front-end uses the Supabase **publishable (anon) key** only. This key is *designed* to be public — it sits in client-side code and is protected by Row-Level Security (read-only access). The **service_role / secret key is never committed** to this repository.

## 7. Run locally

It is a static site — any static server works:

```bash
cd website
python -m http.server 8000
# open http://localhost:8000
```

## 8. Deploy (Firebase Hosting)

```bash
firebase deploy --only hosting
```

## 9. Rebuild the report

```bash
cd report_build
npm install            # docx, @resvg/resvg-js, mammoth
node render_all.js     # SVG diagrams -> PNG
node build_report.js   # -> CarbonConsulting_Final_Report.docx
```

---

*This repository serves as the hand-over documentation for the system analysed and designed in the term project.*
