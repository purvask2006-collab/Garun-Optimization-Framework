# reports/ — Documentation & Presentation Pipeline

Four config files that turn simulation/optimizer output into every judge-facing and team-facing document, owned primarily by **Non-Tech 2 (Pitch Lead)** per the PRD's RACI matrix.

| File | Role |
|---|---|
| `sections.json` | Reusable content blocks (Problem Statement, Assumptions, Results, HAL Impact, Judge FAQ, etc.) — each with an owner, required inputs, and length guidance, so the same content isn't rewritten slightly differently in three places |
| `templates.json` | Assembles sections into concrete deliverables: README, Pitch Deck, Judge FAQ, Demo Script, Literature Review, Sensitivity Report, Submission Form |
| `charts.json` | Chart specs (Pareto front, endurance comparison, mission profile, battery SoC, convergence, sensitivity tornado, constraint checker) with data sources pointing straight at the optimizer JSON contract and `simulation/*.json` fields, and colors pointing at `ui/colors.json` — so dashboard and static-report charts look identical |
| `exports.json` | Where each template compiles to, in what format, plus the final submission package checklist |

## How this connects to everything else you've built

```
missions/*.json, simulation/*.json     →  raw data + state
optimizer_mdo.py output (PRD contract)  →  sections.json "required_inputs" pull from here
sections.json                           →  assembled into templates.json documents
charts.json                             →  embedded in templates.json documents, styled via ui/colors.json
exports.json                            →  final files judges actually see, per the submission_package_checklist
```

## Ownership at a glance (matches PRD RACI)

- **Tech 1 (Physics Architect):** `assumptions`, `equations`, `validation`, `sensitivity_analysis` sections — anything that needs to survive a thermodynamics-professor-style challenge question.
- **Tech 2 (Optimization Engineer):** `results`, `how_to_run` sections — outputs the clean JSON everything else reads from.
- **Non-Tech 1 (Dashboard Lead):** doesn't own report content directly, but `charts.json` is the shared contract between their live dashboard and Non-Tech 2's static exports — same specs, same colors, two surfaces.
- **Non-Tech 2 (Pitch Lead):** owns `templates.json` and `exports.json` end-to-end — assembling, reviewing, and shipping every deliverable.

## Timing (matches PRD phases)

- **Hours 2-6:** README sections drafted with placeholder data (`sections.json` content can be written before real numbers exist — the `required_inputs` field tells you what will eventually fill each gap).
- **Hours 6-14:** `judge_faq_doc` and `sensitivity_report` updated continuously as Tech 1/2 produce real results.
- **Hours 18-24:** `pitch_deck_export`, `dashboard_backup_video`, `submission_form_export` finalized — see `exports.json` → `submission_package_checklist` for the full list to check off before submitting.

## Validating any file after editing

```bash
python3 -m json.tool reports/<file>.json
```
