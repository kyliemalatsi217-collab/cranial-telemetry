# Cranial Telemetry · Migraine Log

**Swiss Clinical Editorial** aesthetic for serious headache & migraine tracking.

Zero-glare surfaces, orthographic cranial maps, photophobia-safe amber mode, daily 18:00 preventative check-offs (Trepiline + Toplep), acute med logging with automatic 2-hour efficacy pop-ups, and clean CSV export.

## Features

- **Anatomical mapping** – Clickable anterior / posterior orthographic diagrams + quick presets (Left Unilateral, Tension Band, Retro-orbital, etc.)
- **Photophobia Soft Dim** – One-tap warm amber mode that reduces glare
- **2-hour medication follow-up** – Automatic in-app + optional browser notification after acute meds
- **Evening preventatives** – Trepiline 10 mg + Toplep 25 mg with 14-day adherence streak
- **Clinical ledger** – Severity badges, med tags, expandable notes, zone filtering
- **Analytics tiles** – 30-day episode count, Maxalt monthly usage (triptan ceiling awareness), top pain location, trigger frequency, med efficacy bars
- **Cross-device ready** – Supabase URL / Anon Key fields for laptop ↔ phone sync (localStorage first)
- **Export** – Clean CSV of every episode

## Quick Start

```bash
cd cranial-telemetry
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- Lucide React icons
- Pure localStorage persistence (no backend required)

## Design Notes

- Soft lavender / alabaster light theme with refined dusty-rose dim mode
- Tabular numerals, hairline borders, rounded-3xl cards
- Floating dark dock for mobile navigation
- Sample clinical baseline data included (clearable)

Built for real-world tracking — gentle on the eyes, precise on the data.
# cranial-telemetry
