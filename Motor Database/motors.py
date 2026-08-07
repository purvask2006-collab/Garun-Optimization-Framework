"""
motors/motors.py -- GARUN motor component database.

Loads motor specifications from motors_database.csv (a component-per-row
table) and efficiency_curves_template.csv (a long-format load_fraction ->
efficiency table, since a single "efficiency" number isn't physically
meaningful for a motor -- efficiency varies with load, as already modeled
in aircraft.py's motor_efficiency_map).

USAGE:
    from motors.motors import load_motor_database, Motor
    motors = load_motor_database()
    m = motors["MOT-001"]
    print(m.efficiency(0.6))  # interpolated efficiency at 60% load

CSV field reference (motors_database.csv):
    motor_id              -- unique identifier, e.g. "MOT-001"
    manufacturer, model    -- component identity
    peak_power_kw          -- maximum power, short-duration rating
    continuous_power_kw    -- sustained/continuous power rating
    rpm_max                -- maximum rated shaft speed
    torque_nm              -- rated torque (Nm)
    efficiency_curve_ref    -- motor_id, used to join against
                              efficiency_curves_template.csv
    weight_kg               -- component mass
    voltage_v                -- rated bus voltage
    cooling_type              -- e.g. "air", "liquid", "oil-cooled"
    controller_model           -- associated motor controller/inverter, if any
    source                       -- REQUIRED before use in optimizer: citation
                                    for every numeric field (datasheet, etc.)
    confidence                    -- High / Medium / Low, per GARUN's
                                    citation-discipline convention
    notes

CRITICAL: per GARUN's "no invented values" rule (see physics.py, aircraft.py
docstrings), do NOT feed a motor row into the optimizer until `source` is
filled in with a real citation. The `confidence` column exists specifically
so a reviewer can immediately see which components are placeholder vs real.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional
import csv

_HERE = Path(__file__).parent
DEFAULT_DB_PATH = _HERE / "motors_database.csv"
DEFAULT_CURVES_PATH = _HERE / "efficiency_curves_template.csv"


@dataclass
class Motor:
    motor_id: str
    manufacturer: str = ""
    model: str = ""
    peak_power_kw: Optional[float] = None
    continuous_power_kw: Optional[float] = None
    rpm_max: Optional[float] = None
    torque_nm: Optional[float] = None
    weight_kg: Optional[float] = None
    voltage_v: Optional[float] = None
    cooling_type: str = ""
    controller_model: str = ""
    source: str = ""
    confidence: str = "Low - placeholder"
    notes: str = ""
    efficiency_points: Dict[float, float] = field(default_factory=dict)  # {load_fraction: efficiency}

    @property
    def is_citable(self) -> bool:
        """True only if this row has a real source -- gates optimizer use."""
        return bool(self.source) and "TBD" not in self.source.upper()

    def efficiency(self, load_fraction: float) -> Optional[float]:
        """
        Linear interpolation over efficiency_points, same pattern as
        aircraft.py's Aircraft.motor_efficiency(). Returns None if no
        efficiency curve has been populated yet for this motor.
        """
        if not self.efficiency_points:
            return None
        pts = sorted(self.efficiency_points.items())
        pts = [(lf, eff) for lf, eff in pts if eff is not None]
        if not pts:
            return None
        load_fraction = max(pts[0][0], min(pts[-1][0], load_fraction))
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            if x0 <= load_fraction <= x1:
                if x1 == x0:
                    return y0
                t = (load_fraction - x0) / (x1 - x0)
                return y0 + t * (y1 - y0)
        return pts[-1][1]


def _parse_float(val: str) -> Optional[float]:
    val = (val or "").strip()
    if not val:
        return None
    try:
        return float(val)
    except ValueError:
        return None


def load_motor_database(
    db_path: Path = DEFAULT_DB_PATH,
    curves_path: Path = DEFAULT_CURVES_PATH,
) -> Dict[str, Motor]:
    """
    Load all motor rows plus their efficiency curves, keyed by motor_id.
    Rows with no motor_id are skipped (e.g. fully blank template rows).
    """
    motors: Dict[str, Motor] = {}

    if db_path.exists():
        with open(db_path, newline="") as f:
            for row in csv.DictReader(f):
                mid = (row.get("motor_id") or "").strip()
                if not mid:
                    continue
                motors[mid] = Motor(
                    motor_id=mid,
                    manufacturer=row.get("manufacturer", "") or "",
                    model=row.get("model", "") or "",
                    peak_power_kw=_parse_float(row.get("peak_power_kw", "")),
                    continuous_power_kw=_parse_float(row.get("continuous_power_kw", "")),
                    rpm_max=_parse_float(row.get("rpm_max", "")),
                    torque_nm=_parse_float(row.get("torque_nm", "")),
                    weight_kg=_parse_float(row.get("weight_kg", "")),
                    voltage_v=_parse_float(row.get("voltage_v", "")),
                    cooling_type=row.get("cooling_type", "") or "",
                    controller_model=row.get("controller_model", "") or "",
                    source=row.get("source", "") or "",
                    confidence=row.get("confidence", "") or "Low - placeholder",
                    notes=row.get("notes", "") or "",
                )

    if curves_path.exists():
        with open(curves_path, newline="") as f:
            for row in csv.DictReader(f):
                mid = (row.get("motor_id") or "").strip()
                lf = _parse_float(row.get("load_fraction", ""))
                eff = _parse_float(row.get("efficiency", ""))
                if mid in motors and lf is not None:
                    motors[mid].efficiency_points[lf] = eff

    return motors


def citable_motors(motors: Dict[str, Motor]) -> List[Motor]:
    """Convenience filter: only motors with a real (non-placeholder) source."""
    return [m for m in motors.values() if m.is_citable]


if __name__ == "__main__":
    db = load_motor_database()
    print(f"Loaded {len(db)} motor row(s) from {DEFAULT_DB_PATH.name}")
    for mid, m in db.items():
        flag = "OK" if m.is_citable else "PLACEHOLDER (no source cited)"
        print(f"  {mid}: {m.manufacturer} {m.model} -- {flag}")
    print(f"\nCitable (optimizer-ready) motors: {len(citable_motors(db))}")
