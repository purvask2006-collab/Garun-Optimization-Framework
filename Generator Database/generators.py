"""
generators/generators.py -- GARUN generator component database.

Loads generator specifications from generators_database.csv. Follows the
same citation-discipline convention as motors.py and aircraft.py: every
component row must have a `source` before it's used in the optimizer, and
`confidence` tells a reviewer at a glance which rows are real vs placeholder.

USAGE:
    from generators.generators import load_generator_database
    gens = load_generator_database()
    g = gens["GEN-001"]
    print(g.losses_kw, g.is_citable)

CSV field reference (generators_database.csv):
    generator_id      -- unique identifier, e.g. "GEN-001"
    manufacturer, model
    ac_dc              -- "AC" or "DC" output
    voltage_v            -- rated output voltage
    rated_power_kw         -- rated continuous electrical output
    efficiency_pct           -- rated-point conversion efficiency (%).
                                NOTE: like motor efficiency, this is a
                                single rated-point figure here, not a full
                                curve -- flag this as a simplification if a
                                load-dependent generator efficiency curve
                                becomes necessary (same pattern as motors.py
                                would need extending).
    weight_kg
    cooling_type
    frequency_hz              -- AC output frequency; leave blank for DC
    losses_kw                   -- rated-point loss (should be internally
                                    consistent with rated_power_kw and
                                    efficiency_pct: losses ~= rated_power *
                                    (1/efficiency - 1); the loader flags a
                                    mismatch if all three are populated)
    source, confidence, notes
"""

from __future__ import annotations
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional
import csv

_HERE = Path(__file__).parent
DEFAULT_DB_PATH = _HERE / "generators_database.csv"


@dataclass
class Generator:
    generator_id: str
    manufacturer: str = ""
    model: str = ""
    ac_dc: str = ""
    voltage_v: Optional[float] = None
    rated_power_kw: Optional[float] = None
    efficiency_pct: Optional[float] = None
    weight_kg: Optional[float] = None
    cooling_type: str = ""
    frequency_hz: Optional[float] = None
    losses_kw: Optional[float] = None
    source: str = ""
    confidence: str = "Low - placeholder"
    notes: str = ""

    @property
    def is_citable(self) -> bool:
        return bool(self.source) and "TBD" not in self.source.upper()

    def consistency_check(self, tol_frac: float = 0.10) -> Optional[str]:
        """
        Cross-checks rated_power_kw, efficiency_pct, and losses_kw against
        each other if all three are populated: losses should approximately
        equal rated_power * (1/efficiency - 1). Returns a warning string if
        they disagree by more than tol_frac (default 10%), else None.
        This exists to catch transcription errors when filling in the CSV
        from a datasheet, not to validate the underlying physics.
        """
        if self.rated_power_kw is None or self.efficiency_pct is None or self.losses_kw is None:
            return None
        if self.efficiency_pct <= 0:
            return f"{self.generator_id}: efficiency_pct must be > 0"
        implied_losses = self.rated_power_kw * (100.0 / self.efficiency_pct - 1.0)
        if implied_losses == 0:
            return None
        rel_err = abs(implied_losses - self.losses_kw) / max(implied_losses, 1e-9)
        if rel_err > tol_frac:
            return (f"{self.generator_id}: losses_kw ({self.losses_kw:.3f}) does not match "
                    f"rated_power_kw/efficiency_pct implied losses ({implied_losses:.3f}) "
                    f"-- off by {rel_err*100:.1f}%, check the source datasheet")
        return None


def _parse_float(val: str) -> Optional[float]:
    val = (val or "").strip()
    if not val:
        return None
    try:
        return float(val)
    except ValueError:
        return None


def load_generator_database(db_path: Path = DEFAULT_DB_PATH) -> Dict[str, Generator]:
    """Load all generator rows, keyed by generator_id. Skips blank rows."""
    generators: Dict[str, Generator] = {}
    if not db_path.exists():
        return generators

    with open(db_path, newline="") as f:
        for row in csv.DictReader(f):
            gid = (row.get("generator_id") or "").strip()
            if not gid:
                continue
            generators[gid] = Generator(
                generator_id=gid,
                manufacturer=row.get("manufacturer", "") or "",
                model=row.get("model", "") or "",
                ac_dc=(row.get("ac_dc", "") or "").strip().upper(),
                voltage_v=_parse_float(row.get("voltage_v", "")),
                rated_power_kw=_parse_float(row.get("rated_power_kw", "")),
                efficiency_pct=_parse_float(row.get("efficiency_pct", "")),
                weight_kg=_parse_float(row.get("weight_kg", "")),
                cooling_type=row.get("cooling_type", "") or "",
                frequency_hz=_parse_float(row.get("frequency_hz", "")),
                losses_kw=_parse_float(row.get("losses_kw", "")),
                source=row.get("source", "") or "",
                confidence=row.get("confidence", "") or "Low - placeholder",
                notes=row.get("notes", "") or "",
            )
    return generators


def citable_generators(generators: Dict[str, Generator]) -> List[Generator]:
    return [g for g in generators.values() if g.is_citable]


if __name__ == "__main__":
    db = load_generator_database()
    print(f"Loaded {len(db)} generator row(s) from {DEFAULT_DB_PATH.name}")
    for gid, g in db.items():
        flag = "OK" if g.is_citable else "PLACEHOLDER (no source cited)"
        print(f"  {gid}: {g.manufacturer} {g.model} ({g.ac_dc or '?'}) -- {flag}")
        warning = g.consistency_check()
        if warning:
            print(f"    WARNING: {warning}")
    print(f"\nCitable (optimizer-ready) generators: {len(citable_generators(db))}")
