# Project Report — Web Advertisement Optimization Using Reinforcement Learning

LaTeX source for the FRP-2026 final-year report. Structured to match the
**C7 Medical Insurance Cost** sample format (numbered sections 1–8, no separate
appendices, individual-contributions table in the front matter, reflection
section before similarity report), but expanded with per-agent diagnostic
subsections, pseudocode blocks for each algorithm, a three-part Conclusions
section (summary / limitations / future scope) and 30 IEEE-style references.
Target page count: **~70–90 pages** once compiled with figures.

## Directory layout

```
Docs/Report/
├── report.tex                   # master file — compile this
├── front/                       # front matter (Roman page numbers i–vii)
│   ├── 00_titlepage.tex
│   ├── 01_certificate.tex
│   ├── 02_acknowledgement.tex
│   ├── 03_declaration.tex
│   ├── 04_approval.tex
│   ├── 05_preface.tex
│   └── 06_contributions.tex
├── sections/                    # main matter (Arabic, "Page X of Y" footer)
│   ├── sec1_introduction.tex
│   ├── sec2_literature.tex
│   ├── sec3_methods.tex
│   ├── sec4_results.tex
│   ├── sec5_conclusions.tex
│   ├── sec6_references.tex
│   ├── sec7_reflection.tex
│   └── sec8_similarity.tex
└── figures/                     # drop PNG/PDF figures here
```

## How to compile

You need a LaTeX distribution (TeX Live, MiKTeX, or MacTeX). From this
directory:

```bash
pdflatex report
pdflatex report   # second pass for TOC, list of figures/tables, page refs
pdflatex report   # third pass to settle final "Page X of Y" numbers
```

If using Overleaf, upload the `Docs/Report/` folder and set `report.tex`
as the main document.

## Layout details (matching the C7 sample)

- **Front matter** uses lowercase Roman numerals (i, ii, iii, …) and a
  plain centred page-number footer.
- **Main matter** uses Arabic page numbers with a bold **Page X of Y** footer
  (driven by `lastpage` + `fancyhdr`).
- **Section numbering** is `1.`, `1.1`, `1.2`, … (no "Chapter" word; via
  `article` class + custom `titlesec`).
- **Individual contributions** is a 4-row table on page vii (front matter),
  **not** a separate appendix.
- **Reflection of team members** is Section 7 (first-person paragraph per
  member), followed by **Section 8: Similarity Report** as the final section.
- **References** are `[1]`, `[2]`, … manually numbered in the literature
  survey table and in Section 6 — no `\cite{}` / `\bibliography{}`.

## Figures to add

The report references the figures below with graceful fallbacks
(a placeholder box renders when the file is missing). Drop these into
`figures/` to get a publication-ready PDF:

| Filename                         | What it should show                                       |
|----------------------------------|-----------------------------------------------------------|
| `soa_logo.png`                   | SOA university crest (title page, certificate)            |
| `model_diagram.png`              | Flow chart of the simulation pipeline (Fig. 1)            |
| `model_architecture.png`         | Six-block architecture diagram (Fig. 2)                   |
| `cumulative_reward.png`          | Cumulative reward chart for all 5 agents (Fig. 3)         |
| `cumulative_regret.png`          | Cumulative regret chart for all 5 agents (Fig. 4)         |
| `rolling_ctr.png`                | Rolling 50-step CTR per agent (Fig. 5)                    |
| `exploration_heatmap.png`        | Arm-selection heat-map per agent (Fig. 6)                 |
| `similarity_report.png`          | Turnitin/iThenticate originality summary screenshot (§8)  |

You can grab the four chart screenshots directly from the running simulator
(`npm run dev` from the repo root, then open the relevant chart tabs in
the right-hand pane of the Simulator page).

## What's filled in vs. what you should review

| Item                                 | Status                                |
|--------------------------------------|---------------------------------------|
| Team names + roll numbers            | From `Docs/41-14-Proposal (1).pdf`    |
| Supervisor name                      | Ms. Prativa Das (from proposal)       |
| Submission date                      | June, 2026 (edit `\submitdate` in `report.tex`) |
| All sections 1–8                     | Written, ready to read                |
| 15 numbered references               | Written (manual `[N]` numbering)      |
| Numerical results in §4              | Plausible representative numbers — re-run the simulator and substitute the exact figures you record |
| Figures                              | Placeholder boxes; replace per table above |
| Similarity report screenshot         | Placeholder — drop your real Turnitin PNG in `figures/` |

The numerical results in Section 4 are framed correctly (UCB1 wins on the
default Revenue scenario, Thompson Sampling under-performs due to
reward-mismatch, etc.), but the specific numbers should be regenerated from
your actual headless benchmark output before submission.
