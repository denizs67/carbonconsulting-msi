const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, TableOfContents, Header, Footer, VerticalAlign
} = require('docx');

const CW = 9026; // A4 content width (DXA) with 1" margins
const IMGDIR = 'img/';

// ---------- helpers ----------
const TNR = 'Times New Roman';

function P(text, opts = {}) {
  return new Paragraph({
    alignment: opts.align || AlignmentType.JUSTIFIED,
    spacing: { after: opts.after ?? 140, line: 276, before: opts.before ?? 0 },
    children: (Array.isArray(text) ? text : [new TextRun({ text, bold: opts.bold, italics: opts.italics })]),
  });
}
function H1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 280, after: 160 },
    children: [new TextRun({ text })] });
}
function H2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 220, after: 120 },
    children: [new TextRun({ text })] });
}
function H3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 160, after: 100 },
    children: [new TextRun({ text })] });
}
function bullet(text) {
  return new Paragraph({ numbering: { reference: 'b', level: 0 }, spacing: { after: 60, line: 276 },
    children: [new TextRun({ text })] });
}
function numItem(text) {
  return new Paragraph({ numbering: { reference: 'n', level: 0 }, spacing: { after: 60, line: 276 },
    children: [new TextRun({ text })] });
}
function figure(file, w, ratio, caption) {
  const h = Math.round(w / ratio);
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 40 },
      children: [new ImageRun({ type: 'png', data: fs.readFileSync(IMGDIR + file),
        transformation: { width: w, height: h },
        altText: { title: caption, description: caption, name: file } })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 180 },
      children: [new TextRun({ text: caption, italics: true, size: 20, color: '555555' })] }),
  ];
}
const border = { style: BorderStyle.SINGLE, size: 1, color: 'BBBBBB' };
const borders = { top: border, bottom: border, left: border, right: border,
  insideHorizontal: border, insideVertical: border };
function cell(text, width, { head = false, bold = false, align = AlignmentType.LEFT } = {}) {
  const runs = Array.isArray(text) ? text : [new TextRun({ text: String(text), bold: bold || head, size: 20,
    color: head ? 'FFFFFF' : '000000' })];
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders, verticalAlign: VerticalAlign.CENTER,
    shading: head ? { fill: '1E293B', type: ShadingType.CLEAR, color: 'auto' } : undefined,
    margins: { top: 60, bottom: 60, left: 110, right: 110 },
    children: [new Paragraph({ alignment: align, spacing: { after: 0, line: 252 }, children: runs })],
  });
}
function table(colW, rows) {
  return new Table({
    width: { size: colW.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: colW,
    rows: rows.map((r, i) => new TableRow({
      tableHeader: i === 0,
      children: r.map((c, j) => cell(c, colW[j], { head: i === 0, align: typeof c === 'object' ? AlignmentType.LEFT : (i===0?AlignmentType.LEFT:AlignmentType.LEFT) })),
    })),
  });
}
function tcap(text) {
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 180 },
    children: [new TextRun({ text, italics: true, size: 20, color: '555555' })] });
}

// ---------- content ----------
const cover = [
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 600, after: 0 },
    children: [new TextRun({ text: 'İSTANBUL TECHNICAL UNIVERSITY', bold: true, size: 30 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 },
    children: [new TextRun({ text: 'Faculty of Management — Department of Management Engineering', size: 24 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 },
    children: [new TextRun({ text: 'ISL 343E — Management Information Systems · 2025–2026 Spring', size: 24 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 },
    children: [new TextRun({ text: 'TERM PROJECT — FINAL REPORT', bold: true, size: 28, color: '1D4ED8' })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 60 },
    children: [new TextRun({ text: 'CarbonConsulting', bold: true, size: 44 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 500 },
    children: [new TextRun({ text: 'A CBAM Compliance and Carbon Certificate Management System', size: 26, italics: true })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 },
    children: [new TextRun({ text: 'Course Instructor: Doç. Dr. Nihan Yıldırım', size: 24 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 220 },
    children: [new TextRun({ text: 'Live Application: https://carbonconsulting-msi.web.app', size: 22, color: '1D4ED8' })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 },
    children: [new TextRun({ text: 'Prepared by:', bold: true, size: 22 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 20 },
    children: [new TextRun({ text: 'Deniz Sevindi — 070190412', size: 24 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400 },
    children: [new TextRun({ text: 'June 2026 — Istanbul', size: 22 })] }),
  new Paragraph({ children: [new PageBreak()] }),
];

const toc = [
  new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: 'Table of Contents', bold: true, size: 28 })] }),
  new TableOfContents('Table of Contents', { hyperlink: true, headingStyleRange: '1-2' }),
  new Paragraph({ children: [new PageBreak()] }),
];

const abstract = [
  H1('Abstract / Management Summary'),
  P('The European Union’s Carbon Border Adjustment Mechanism (CBAM) entered its definitive period on 1 January 2026, requiring importers of carbon-intensive goods to surrender CBAM certificates priced against the EU Emissions Trading System (EU ETS). For Türkiye — whose exports of steel, cement, aluminium, fertilizer and electricity are heavily oriented toward the EU — this creates an urgent need to quantify embedded emissions and the resulting certificate cost. This project analyses the as-is, largely manual process by which Turkish exporters estimate their CBAM obligation and designs an information system, CarbonConsulting, to automate it. The methodology follows the classic system analysis and design cycle: problem identification and benchmarking of existing tools, analysis of the current process and data structures (context diagram, process flowcharts, entity-relationship modelling, use-case modelling and a gap analysis), and a full system design (process hierarchy, database design, application and interface design, an output and testing plan, and implementation recommendations). A working prototype was built and deployed to a public URL, with sector-specific emission factors, a dynamic calculation engine, and live certificate prices served from a cloud database. The main finding is that a lightweight, sector-specific web tool removes the inconsistency, error risk and certificate-price staleness of the manual process, producing an auditable Scope 1+2 emission figure, a certificate requirement and two procurement cost scenarios in seconds. We recommend a phased roll-out with the database and role model fully implemented, and integration with official CBAM reporting formats.'),
  new Paragraph({ children: [new PageBreak()] }),
];

const preliminary = [
  H1('1. Preliminary Study'),

  H2('1.1 Description of the Company / Sector'),
  P('The system addresses the Turkish export-oriented heavy industry, specifically the five sectors covered by the EU CBAM: iron & steel, cement, aluminium, fertilizers and electricity. These sectors are strategically important for Türkiye:'),
  bullet('Iron & Steel: Türkiye is Europe’s largest and the world’s 7th largest crude-steel producer (≈38.1 Mt/year); around 41.7% of steel exports go to the EU, making the sector the single most CBAM-exposed industry.'),
  bullet('Cement: ≈82 Mt/year, the largest producer in Europe; clinker calcination accounts for ≈60% of process emissions that cannot be reduced by energy efficiency alone.'),
  bullet('Aluminium: a 5.6 billion USD export sector; primary production is extremely electricity-intensive (>60% Scope 2).'),
  bullet('Fertilizer: nitric-acid N₂O (GWP 265) is the dominant emission driver; tertiary abatement can cut it up to 12-fold.'),
  bullet('Electricity: the Turkish grid factor fell to ≈400 gCO₂/kWh in 2024 versus an EU-27 average of ≈250 gCO₂/kWh.'),
  P('The "organisation" modelled by the system is therefore a representative Turkish exporting manufacturer in one of these sectors, together with a consulting/operator role (CarbonConsulting) that maintains the reference data and serves the calculation as a service.'),

  H2('1.2 Project Definition and Background'),
  P('Problem. With CBAM now in force, every EU shipment carries an implicit carbon cost equal to the embedded emissions of the goods multiplied by the weekly-average EUA price. Turkish exporters currently estimate this obligation manually: production data is gathered in spreadsheets, emission factors are looked up across scattered standards (Worldsteel, GNR, IAI, Fertilizers Europe, IEA), the calculation is done by hand in Excel, and certificate prices are searched on the web. The process is slow, inconsistent between staff, error-prone (e.g. double-counting scrap-based emission reductions), and the certificate price is often stale by the time the report is complete. There is no reusable record and no comparison of procurement scenarios.'),
  P('Aim and objectives. The aim is to design — and demonstrate with a working prototype — an information system that turns this manual, error-prone estimation into a fast, consistent, auditable and data-driven calculation. The objectives are: (i) to centralise sector-specific emission factors; (ii) to compute Scope 1+2 emissions from a small set of production inputs; (iii) to derive the CBAM certificate requirement from the EU export ratio; (iv) to retrieve live certificate prices and present procurement cost scenarios; and (v) to provide an interface and a database design suitable for hand-over and future implementation.'),

  H2('1.3 Existing Systems — Benchmark'),
  P('A brief survey of available solutions was conducted. They fall into four groups: enterprise carbon-accounting suites, generic free calculators, the official EU reporting registry, and the manual spreadsheet/consultant approach. None combines CBAM-specificity, Turkish sector factors, live certificate pricing, cost-scenario comparison and low cost.'),
  table([1750, 1500, 1550, 1300, 2926], [
    ['Solution', 'Provider', 'Type', 'Cost', 'Main limitation'],
    ['SAP Green Ledger / CBAM', 'SAP', 'Enterprise SaaS', 'Very high (€100k+)', 'Requires SAP ERP; oversized for SMEs'],
    ['Persefoni / Watershed', 'US vendors', 'ESG/carbon SaaS', 'High subscription', 'Generic accounting, not CBAM-cert/cost specific'],
    ['CarbonChain', 'CarbonChain', 'Supply-chain SaaS', 'Subscription', 'Not tuned to Turkish sector routes'],
    ['GHG Türkiye Calculator', 'ghg-turkiye.com', 'Free web calculator', 'Free', 'Generic GHG; no CBAM cert need or live price'],
    ['EU CBAM Transitional Registry', 'European Commission', 'Reporting portal', 'Free (mandatory)', 'Reporting only; not a calculator or cost tool'],
    ['Excel + external consultant', 'In-house / advisory', 'Manual', 'Low–medium', 'Error-prone, slow, no live data, no record'],
  ]),
  tcap('Table 1. Benchmark of existing CBAM/carbon estimation solutions.'),
  P('Common features across tools: an emission factor library and an emissions total. Differentiating features missing from most: CBAM-specific certificate-need logic, Turkish sector-route factors, live EUA/VCM pricing, side-by-side procurement cost scenarios, and free public access. CarbonConsulting targets exactly this gap.'),

  H2('1.4 Environmental and Implementation Requirements'),
  P('Environmental (infrastructure) requirements: a modern web browser on the client side; static web hosting (the prototype uses Firebase Hosting); a cloud database with a public read API (the prototype uses Supabase/PostgreSQL); and outbound HTTPS to data sources for certificate prices. No installation, ERP or on-premise server is required.'),
  P('Implementation requirements: front-end web development (HTML/CSS/JavaScript); database design and administration; curation of sector emission factors from authoritative standards; and a small operations role to keep certificate prices and factors up to date. The skills are modest and the stack is free-tier, which is appropriate for the social/SME context of the project.'),
  new Paragraph({ children: [new PageBreak()] }),
];

const analysis = [
  H1('2. System Analysis'),

  H2('2.1 Sub & Supra Systems — Context Diagram'),
  P('The system boundary contains a single top-level process, the CarbonConsulting System (process 0). Its supra-systems (external entities) are: the Exporter Company User and the System Administrator (human actors), the Emission Factor Standards bodies (Worldsteel, IEA, GNR, IAI, Fertilizers Europe) that supply benchmark factors, and the Certificate Price Sources (Ember Climate, ICAP, and the Supabase live store) that supply prices. The context (level-0 DFD) diagram below shows the data flows crossing the boundary.'),
  ...figure('context.png', 580, 1.516, 'Figure 1. Context Diagram (Level-0 DFD) of the CarbonConsulting system.'),

  H2('2.2 Process Analysis of the Existing (AS-IS) System'),
  P('The current process is manual and iterative. When an EU export order arrives, staff gather production data from spreadsheets and plant records, search for emission factors across multiple standards, calculate emissions by hand in Excel, look up certificate prices through manual web search, and judge whether the result is accurate and consistent. When it is not — which is frequent — an external consultant is engaged and the loop repeats. Only then is a compliance report compiled manually. The flowchart below maps this process and the pain points that motivate the new system.'),
  ...figure('asis.png', 470, 1.079, 'Figure 2. AS-IS process flowchart for manual CBAM obligation estimation, with pain points.'),

  H2('2.3 Data Analysis of the Existing System'),
  P('In the as-is system there is no integrated database; data lives in loose stores: spreadsheet files of production figures, PDF copies of emission-factor standards, ad-hoc notes of certificate prices, and Word/PDF compliance reports. The conceptual entities implicit in this manual practice — sector, emission factor, company, user, calculation and certificate price — are formalised into the entity-relationship model below, which becomes the basis for the database design in Section 3.3. (No ER diagram can be drawn for the genuine as-is system because no database exists; the model below is the proposed logical data structure derived from the analysis.)'),
  ...figure('er.png', 590, 1.4, 'Figure 3. Entity-Relationship diagram (proposed logical data structure).'),
  P('Principal entities and relationships: a SECTOR defines many EMISSION_FACTORs and classifies many COMPANYs; a COMPANY employs many USERs and runs many CALCULATIONs; each CALCULATION references the SECTOR it was run for and takes a price snapshot from CERTIFICATE_PRICE. The full attribute-level data dictionary is given in Section 3.3.'),

  H2('2.4 Use Case Diagram'),
  P('Two actors interact with the system. The Exporter Company User performs the core calculation use cases; the System Administrator maintains the reference data and accounts. The «include» relationships show that "Calculate carbon emission" always includes "Select sector" and "Enter production data", and "Export report" «extend»s "View CBAM certificate need".'),
  ...figure('usecase_en.png', 540, 1.25, 'Figure 4. Use Case diagram with two actors and include/extend relationships.'),

  H2('2.5 Information Requirements List (Gap Analysis)'),
  P('The gap analysis maps each defect of the existing system to a concrete information requirement for the new system.'),
  table([2900, 4126, 2000], [
    ['Defect of existing system', 'Information requirement for new system', 'Priority'],
    ['Emission factors scattered, inconsistent', 'Single curated factor library per sector & route', 'High'],
    ['Manual Excel calculation, high error risk', 'Deterministic calculation engine (Scope 1+2)', 'High'],
    ['Scrap/abatement double-counting', 'Route-aware adjusters that prevent double discount', 'High'],
    ['Certificate prices stale / manual lookup', 'Live price feed from a cloud data source', 'High'],
    ['No certificate-need figure', 'Auto certificate need = emission × EU export ratio', 'High'],
    ['No scenario comparison', 'Two procurement cost scenarios (EUA, CBAM+VCM)', 'Medium'],
    ['No reusable record', 'Persisted calculation history per company', 'Medium'],
    ['No role separation', 'User & Administrator roles', 'Low'],
  ]),
  tcap('Table 2. Information requirements list / gap analysis.'),

  H2('2.6 Decision for the Solution — Alternatives, Feasibility and MCDM'),
  P('Four alternatives were considered: (A) purchase an enterprise carbon-accounting SaaS, (B) outsource each estimate to a consultant, (C) build a custom lightweight web application, and (D) continue with manual Excel. A weighted multi-criteria decision matrix (scores 1–5, higher is better) was used to choose between them.'),
  table([2300, 1126, 1400, 1400, 1400, 1400], [
    ['Criterion (weight)', 'A SaaS', 'B Consult', 'C Web app', 'D Excel', ''],
    ['Cost (0.25)', '1', '2', '5', '4', ''],
    ['Accuracy (0.20)', '5', '4', '4', '2', ''],
    ['Ease of use (0.15)', '3', '4', '5', '3', ''],
    ['TR-sector fit (0.20)', '2', '4', '5', '3', ''],
    ['Maintainability (0.10)', '4', '2', '4', '2', ''],
    ['Time-to-deploy (0.10)', '2', '4', '4', '5', ''],
    ['Weighted score', '2.60', '3.30', '4.55', '3.10', '← C wins'],
  ]),
  tcap('Table 3. Multi-criteria decision matrix (weighted). Alternative C — custom web application — scores highest.'),
  P('Feasibility. Economic: the chosen solution runs on free hosting and a free-tier database, so capital cost is negligible and the marginal cost per calculation is effectively zero. Technical: the stack (static web front-end, cloud SQL database) is mature, well-documented and within the team’s skills. Operational: the tool requires no installation and fits the existing workflow of export and sustainability staff, lowering adoption risk. The recommended solution is therefore Alternative C, the custom CarbonConsulting web application.'),
  new Paragraph({ children: [new PageBreak()] }),
];

const design = [
  H1('3. System Design'),

  H2('3.1 Process Hierarchy Chart'),
  P('The TO-BE system decomposes into five functional areas, each with sub-functions, as shown below.'),
  ...figure('hierarchy.png', 590, 1.714, 'Figure 5. Process hierarchy chart of the TO-BE system.'),

  H2('3.2 Physical Design / System Components'),
  P('The system is a three-tier web application. The presentation tier is a set of static HTML/CSS/JavaScript pages (home, sectors, certificates, calculator, green finance) served from Firebase Hosting. The logic tier is client-side JavaScript: a deterministic calculation engine plus a price-loader module. The data tier is a Supabase (PostgreSQL) database exposing a public read API protected by row-level security. External data sources (emission-factor standards and certificate-price references) feed the data tier. The TO-BE process below shows how these components cooperate during a calculation.'),
  ...figure('tobe.png', 460, 1.139, 'Figure 6. TO-BE process flowchart (swimlane: User / System / Data Sources).'),
  P('Core calculation logic. Emission = Production × Emission Factor × Adjuster; the adjuster is route-aware (e.g. for steel it applies a scrap discount only to ore-based routes, never to the already-scrap-based Scrap-EAF route, preventing double counting). Certificate need = Emission × (EU export ratio). Two cost scenarios are produced: Scenario 1 = certificate need × EUA price (the mandatory CBAM cost); Scenario 2 = Scenario 1 + (total emission − certificate need) × VCM price, i.e. mandatory CBAM plus voluntary offsetting of the non-EU residual emission for a net-zero target. VCM credits cannot discharge the CBAM obligation, so they are never substituted into Scenario 1.'),

  H2('3.3 Input and Storage — Database Design'),
  P('The logical data structure (Figure 3) is implemented as six relational tables. In the prototype, the CERTIFICATE_PRICE table is live in Supabase and feeds the calculator; the remaining tables form the designed schema for full implementation. The data dictionary follows.'),
  table([1700, 1700, 1300, 900, 3426], [
    ['Table', 'Field', 'Type', 'Key', 'Description'],
    ['SECTOR', 'sector_id', 'text', 'PK', 'Sector code (e.g. steel)'],
    ['', 'name / standard', 'text', '', 'Display name and reference standard'],
    ['EMISSION_FACTOR', 'factor_id', 'serial', 'PK', 'Factor identifier'],
    ['', 'sector_id', 'text', 'FK', 'Owning sector'],
    ['', 'route_type / value / unit', 'mixed', '', 'Production route, factor value, unit'],
    ['COMPANY', 'company_id', 'serial', 'PK', 'Exporter company'],
    ['', 'sector_id', 'text', 'FK', 'Company’s sector'],
    ['', 'name / country / export_ratio', 'mixed', '', 'Profile and EU export share'],
    ['USER', 'user_id', 'serial', 'PK', 'System user'],
    ['', 'company_id', 'integer', 'FK', 'Employer company'],
    ['', 'role / email', 'text', '', 'user | admin; login email'],
    ['CALCULATION', 'calc_id', 'serial', 'PK', 'Saved calculation'],
    ['', 'company_id / sector_id', 'mixed', 'FK', 'Owning company and sector'],
    ['', 'production_amount …', 'numeric', '', 'Inputs and computed emission/need/cost'],
    ['CERTIFICATE_PRICE', 'cert_id', 'text', 'PK', 'EUA | VCM | TR-ETS'],
    ['(live in prototype)', 'price / currency / change_pct', 'numeric', '', 'Latest price, currency, daily change'],
  ]),
  tcap('Table 4. Data dictionary of the CarbonConsulting database.'),
  P('Live table definition (executed in the prototype): certificate_prices(id text PK, name text, price numeric, currency text, change_pct numeric, unit text, updated_at timestamptz). Row-level security is enabled with a public read policy so the static front-end can read prices safely with a publishable key.'),

  H2('3.4 Program / Application Design'),
  P('The application realises the use cases of Figure 4 as five front-end modules mapped to the process hierarchy: (1) Sector & Data Input, (2) Emission Calculation, (3) Certificate & Cost Analysis, (4) Reporting & Output, and (5) Data Administration. Module 1 renders a sector-specific input form (five distinct field sets). Module 2 runs the deterministic engine. Module 3 derives the certificate need and the two cost scenarios. Module 4 displays results and is the hook for report export. Module 5 is the administrator surface for factors, prices and accounts. A neighbouring/environmental system that must be integrated in full implementation is the official EU CBAM reporting interface (for quarterly XML submission) and an authentication provider for the role model.'),

  H2('3.5 Output Design — Screens, Queries and Reports'),
  P('Input interface. The calculator presents a three-step input: sector selection, sector-specific production data, and EU export ratio, with client-side validation.'),
  ...figure('input_mockup.png', 560, 1.226, 'Figure 7. Input interface — carbon calculation form.'),
  P('Output interface. On submission the result panel shows total emission, the CBAM certificate need, and the two cost scenarios. The worked example uses steel (BF/BOF, 500,000 t, 25% scrap, 35% EU export): Emission = 500,000 × 1.530 × 0.925 = 707,625 tCO₂e; certificate need = 707,625 × 0.35 = 247,669; Scenario 1 = € 20,420,288; Scenario 2 = € 26,511,088.'),
  ...figure('output_mockup.png', 560, 1.286, 'Figure 8. Output interface — result and cost report panel.'),
  P('Screen list: Home (live price summary), Sectors (5 sector profiles), Certificates (EU ETS / TR-ETS / VCM with price chart), Calculator (input + result), Green Finance (information). Reports designed for export: CBAM Quarterly (PDF + XML), ISO 14064-1 inventory, CSRD/TSRS and CDP summaries.'),
  P('Example SQL queries the database supports (Output / query design):'),
  bullet('Latest prices: SELECT id, price, currency, change_pct FROM certificate_prices;'),
  bullet('Company history: SELECT created_at, emission_total, cost_eua FROM calculation WHERE company_id = $1 ORDER BY created_at DESC;'),
  bullet('Top emitters by sector: SELECT sector_id, SUM(emission_total) AS total FROM calculation GROUP BY sector_id ORDER BY total DESC;'),
  bullet('Average certificate need per sector: SELECT sector_id, AVG(certificate_need) FROM calculation GROUP BY sector_id;'),

  H2('3.6 Test Design / Testing Plan'),
  P('A test plan combining functional, data-integration and usability tests was defined and partly executed on the prototype. Each calculation case verifies the engine output against a hand-computed expected value.'),
  table([1100, 1750, 2700, 1900, 1576], [
    ['Test ID', 'Type', 'Scenario', 'Expected', 'Result'],
    ['T-01', 'Functional', 'Steel BF/BOF, 100k t, scrap 50%, export 100%', '130,050 tCO₂e', 'Pass'],
    ['T-02', 'Functional', 'Steel Scrap-EAF + forced scrap 50% (double-count guard)', '37,000 tCO₂e (no extra discount)', 'Pass'],
    ['T-03', 'Integration', 'Live price fetch from Supabase', 'Prices loaded; TR-ETS row present', 'Pass'],
    ['T-04', 'Integration', 'Engine uses live EUA price (set to 200)', 'Cost = 37,000 × 200 = € 7,400,000', 'Pass'],
    ['T-05', 'Resilience', 'Data source unavailable', 'Falls back to static prices; no break', 'Pass'],
    ['T-06', 'Usability', 'Scrap field disabled for Scrap-EAF', 'Field locked with explanatory note', 'Pass'],
  ]),
  tcap('Table 5. Testing plan and executed results on the prototype.'),

  H2('3.7 Implementation Recommendations — Conversion Strategy'),
  P('Because the system replaces a manual practice rather than a live legacy system, a low-risk conversion is feasible. The options were compared in a decision table.'),
  table([1900, 3100, 2526, 1500], [
    ['Strategy', 'Pros', 'Cons', 'Decision'],
    ['Direct', 'Fast, cheap', 'No fallback if errors slip through', 'Rejected'],
    ['Parallel', 'Safe; manual cross-check', 'Double effort for a period', 'Partly'],
    ['Phased', 'Roll out per sector/module', 'Longer total timeline', 'Recommended'],
    ['Pilot', 'Validate with one sector first', 'Limited early coverage', 'Recommended'],
  ]),
  tcap('Table 6. Conversion strategy decision table.'),
  P('Recommendation: a pilot with the steel sector (the most CBAM-exposed), run in parallel with the existing manual estimate for one quarter to validate the engine, then a phased roll-out to the remaining four sectors. Full implementation should add authenticated roles, the persisted calculation history, and integration with the EU CBAM reporting format.'),
  new Paragraph({ children: [new PageBreak()] }),
];

const conclusion = [
  H1('4. Conclusion and Discussion'),
  H2('4.1 Summary'),
  P('This project analysed the manual process by which Turkish exporters estimate their CBAM obligation and designed an information system to automate it. We produced a benchmark of existing tools, a context diagram, an AS-IS process analysis, an entity-relationship and use-case model, a gap analysis, and a multi-criteria decision that selected a custom web application. We then delivered a full design — process hierarchy, three-tier physical design, a six-table database with data dictionary, application and interface design, an output/query/report design, a testing plan and a conversion strategy — and demonstrated it with a deployed prototype featuring a live certificate-price database.'),
  H2('4.2 Potential Impacts on the Organization'),
  P('The system replaces inconsistent, manual estimation with a deterministic, auditable calculation, cutting turnaround from days to seconds and removing the consultant dependency for routine estimates. It standardises emission factors across staff, eliminates double-counting errors, and keeps certificate costs current via a live feed. Organisationally it shifts effort from repetitive calculation toward decision-making (procurement strategy across the two cost scenarios) and creates a reusable record that supports CBAM, ISO 14064-1 and CSRD reporting.'),
  H2('4.3 Challenges Faced'),
  bullet('Reconciling emission-factor methodologies across five sectors and multiple standards into one consistent factor library.'),
  bullet('Modelling sector-specific subtleties correctly — notably avoiding the scrap double-discount in steel and the VCM-cannot-discharge-CBAM rule in the cost logic.'),
  bullet('Serving live data to a static site safely: using a publishable key with row-level security and a static fallback so the site never breaks.'),
  bullet('Keeping the scope realistic for an analysis-and-design course while still delivering a working, deployed demonstration.'),
  H2('4.4 Recommendations for Further Practices'),
  P('Future work should: implement authenticated user/administrator roles and persist the calculation history (the designed tables); connect emission factors and prices to live APIs on a scheduled refresh; generate the CBAM quarterly XML directly; add the TR-ETS price once the national pilot establishes one; and extend coverage as CBAM widens to additional goods. A redesign of the exporter’s internal workflow — capturing production data at source and feeding it to the system — would maximise the benefit. From a database and infrastructure standpoint, moving price ingestion server-side and adding caching would improve robustness at scale.'),
  new Paragraph({ children: [new PageBreak()] }),
];

const references = [
  H1('References'),
  ...[
    'European Commission, Carbon Border Adjustment Mechanism (CBAM). https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en',
    'European Commission, EU Emissions Trading System (EU ETS). https://climate.ec.europa.eu/eu-action/eu-emissions-trading-system-eu-ets_en',
    'Worldsteel Association, CO₂ emissions data and methodology. https://worldsteel.org/',
    'IEA, Emissions Factors 2025. https://www.iea.org/data-and-statistics/data-product/emissions-factors-2025',
    'GNR — Getting the Numbers Right, Cement CO₂ and Energy Protocol. https://gccassociation.org/',
    'International Aluminium Institute (IAI), GHG Protocol for the aluminium sector. https://international-aluminium.org/',
    'Fertilizers Europe, Carbon Footprint Calculator. https://www.fertilizerseurope.com/',
    'Ember Climate, Carbon Price Viewer (EU ETS). https://ember-climate.org/',
    'ICAP, Allowance Price Explorer. https://icapcarbonaction.com/',
    'Republic of Türkiye, Ministry of Trade — CBAM information note. https://ticaret.gov.tr/',
    'IPCC, Sixth Assessment Report (AR6) — Global Warming Potentials. https://www.ipcc.ch/',
    'Supabase documentation (PostgreSQL backend & row-level security). https://supabase.com/docs',
    'Firebase Hosting documentation. https://firebase.google.com/docs/hosting',
  ].map(r => new Paragraph({ numbering: { reference: 'refs', level: 0 }, spacing: { after: 80, line: 276 },
    children: [new TextRun({ text: r, size: 22 })] })),
  new Paragraph({ children: [new PageBreak()] }),
  H1('Appendix A — Prototype'),
  P([new TextRun({ text: 'Live application: ', bold: true }),
     new TextRun({ text: 'https://carbonconsulting-msi.web.app', color: '1D4ED8' })]),
  P([new TextRun({ text: 'Technology stack: ', bold: true }),
     new TextRun({ text: 'HTML, Tailwind CSS, Chart.js (front-end); Supabase / PostgreSQL (database, live certificate prices); Firebase Hosting (deployment).' })]),
  P([new TextRun({ text: 'Modules: ', bold: true }),
     new TextRun({ text: 'home, sectors, certificates, calculator (dynamic engine), green finance.' })]),
];

// ---------- document ----------
const doc = new Document({
  creator: 'CarbonConsulting Group',
  title: 'CarbonConsulting — CBAM Compliance System — Final Report',
  styles: {
    default: { document: { run: { font: TNR, size: 24 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 30, bold: true, font: TNR, color: '1E293B' },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 26, bold: true, font: TNR, color: '1D4ED8' },
        paragraph: { spacing: { before: 220, after: 120 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, font: TNR },
        paragraph: { spacing: { before: 160, after: 100 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: 'b', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 540, hanging: 280 } } } }] },
      { reference: 'n', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 540, hanging: 280 } } } }] },
      { reference: 'refs', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '[%1]', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 600, hanging: 360 } } } }] },
    ],
  },
  sections: [
    // Cover (no footer)
    { properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children: cover },
    // Body (with page numbers)
    { properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'CarbonConsulting — ISL 343E Term Project    |    Page ', size: 18, color: '888888' }),
                   new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '888888' })] })] }) },
      children: [...toc, ...abstract, ...preliminary, ...analysis, ...design, ...conclusion, ...references] },
  ],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('CarbonConsulting_Final_Report.docx', buf);
  console.log('Report written:', buf.length, 'bytes');
});
