# ui/ — Dashboard Design Tokens

Five token files for the Streamlit dashboard (Non-Tech 1's ownership per the PRD). Aesthetic direction is fixed by the brief: dark mode, aerospace mission-control feel, NASA cyan (#00D2FF) on charcoal (#0B0F19) — everything here derives from that rather than defaulting to a generic dashboard look.

| File | Covers |
|---|---|
| `colors.json` | Background/panel/text/accent palette, plus a `status` block mapped 1:1 to `simulation/states.json` health states, and a `data_series` block for chart lines |
| `typography.json` | Two-family system: monospace for telemetry data, sans for UI chrome — with a full type scale |
| `spacing.json` | 8px grid, semantic spacing tokens, and the 6-panel responsive grid layout (spans, breakpoints) |
| `icons.json` | lucide icon names for the 6 panels, 4 health states, 4 power sources, and mission phases |
| `animations.json` | Duration/easing scale, one signature interaction (the status pulse), and an explicit "avoid" list |

## The one signature element: status pulse

Per the frontend-design principle of spending boldness in one place — the health-status indicator (NOMINAL/DEGRADED/EMERGENCY/ABORT) pulses at a rate tied to severity, defined in `animations.json` → `signature_interaction`. It's the one spot where motion *encodes simulation state* rather than decorating the UI — a judge glancing at the dashboard gets urgency information from the pulse rate alone, before reading any number. Everything else in the token set is intentionally quiet so this doesn't have to compete for attention.

## How this connects to what you already have

- `colors.json` status tokens ↔ `simulation/states.json` `health_states` (NOMINAL/DEGRADED/EMERGENCY/ABORT)
- `icons.json` power_source_icons ↔ `simulation/states.json` `active_power_source` enum
- `icons.json` mission_phase_icons ↔ `phase_name` values in `missions/*.json`
- `typography.json` `data` family is meant specifically for the fields in `timeline.json`'s `output_record_schema` (time_min, altitude_m, power_kw, soc) — anything that came from the simulator, not from a human-written label

This means Non-Tech 1 can wire the dashboard to real state without waiting on Tech 1/2 to explain the schema — the token files already point at the exact field names to bind to.

## Using these in Streamlit

Load once at app start and reference throughout rather than hardcoding hex values in individual `st.markdown`/CSS blocks:

```python
import json

def load_tokens():
    tokens = {}
    for name in ["colors", "typography", "spacing", "icons", "animations"]:
        with open(f"ui/{name}.json") as f:
            tokens[name] = json.load(f)
    return tokens

TOKENS = load_tokens()
accent = TOKENS["colors"]["palette"]["accent"]["primary"]  # "#00D2FF"
```

Inject as CSS custom properties once, so every component and every panel stays consistent even as four people edit different files under time pressure:

```python
css_vars = "\n".join(
    f"--color-{k}: {v};" for k, v in TOKENS["colors"]["palette"]["background"].items()
)
st.markdown(f"<style>:root {{ {css_vars} }}</style>", unsafe_allow_html=True)
```

## Validating any file after editing

```bash
python3 -m json.tool ui/<file>.json
```
