# Propeller Specification Sheet
### For: Hybrid-Electric Surveillance UAV (Team GARUN — MTOW 1000 kg, Cruise Power 53 kW)

This sheet defines each propeller parameter, gives typical values/ranges appropriate for your drone class, and includes a blank comparison table so you can score candidate propellers side by side before feeding a final choice into `pack_sizing.py` / `optimizer_mdo.py`.

---

## 1. Parameter Definitions

### Diameter (D)
The tip-to-tip circle swept by the blades, usually in meters or inches.
- **Why it matters:** Larger diameter = more thrust per unit power at low speed (better for takeoff/loiter), but more drag, weight, and ground-clearance/stowage constraints.
- **Typical range for a 1000 kg UAV:** 1.5–2.5 m, depending on whether it's a single large prop or multiple smaller motors (your framework optimizes "number of motors," so diameter trades directly against motor count).

### Pitch (P)
The theoretical forward distance the propeller advances per revolution if moving through a solid medium (usually stated in inches, e.g., "20x10" = 20 in diameter, 10 in pitch).
- **Why it matters:** Higher pitch = more speed per RPM but higher torque demand and lower efficiency at low airspeed (bad for loiter); lower pitch = better low-speed thrust, worse cruise speed.
- **Pitch-to-diameter ratio (P/D):** A useful normalized number — typically 0.5–0.8 for efficient cruise-optimized UAV props, lower (~0.3–0.5) for loiter/endurance-optimized props like yours.

### Efficiency (η_prop)
Propulsive efficiency = useful thrust power out / shaft power in. Varies with advance ratio J = V / (n·D).
- **Why it matters:** This directly multiplies into your endurance equation — it's the link between `motor/generator efficiencies` (Layer 1) and actual flight time.
- **Typical values:** 75–85% at design cruise point for a well-matched UAV prop; drops off sharply outside its designed advance-ratio range — this is why loiter (low speed) and cruise (higher speed) often want *different* pitch settings, which is a strong argument for a **variable-pitch** or **dual-prop-mode** design in your report.

### Blade Count
Number of blades (2, 3, 4+).
- **Why it matters:** More blades = more thrust in a smaller diameter (useful if diameter is constrained) but slightly lower peak efficiency per blade due to interference, plus more weight and noise.
- **Typical choice:** 2-blade for max efficiency if diameter isn't constrained; 3–4 blade for surveillance UAVs where **acoustic signature** matters (fewer, bigger blades tend to be quieter — worth a line in your report given this is a *military surveillance* platform).

### Material
Common options: carbon fiber composite, wood-composite, aluminum, injection-molded plastic (small scale only).
- **Why it matters:** Affects weight (feeds MTOW), stiffness (affects blade twist under load → efficiency), fatigue life, and cost.
- **Typical choice at this scale:** Carbon fiber composite — best strength-to-weight, standard for this power/size class.

### RPM Limits
Max safe rotational speed, set by tip speed (structural/aeroacoustic limit) and gearbox/motor rating.
- **Why it matters:** Tip speed = π·D·RPM/60. Keeping tip Mach number below ~0.85–0.9 avoids a sharp efficiency and noise penalty from compressibility (shock formation at the tips).
- **Rule of thumb:** For a 2 m diameter prop, tip speed limits typically cap RPM around 2000–2500 RPM before compressibility losses bite.

### Thrust Curve
Thrust vs. RPM (static) and thrust vs. airspeed at fixed RPM (dynamic) — usually derived from manufacturer test data or blade-element momentum theory (BEMT).
- **Why it matters:** This is what your Mission Simulator (Layer 2) actually needs at each flight phase — takeoff/climb need the static/low-speed curve, cruise/loiter need the curve at operating airspeed.
- **Source:** Either pull from a manufacturer's published curve (e.g., APC, MT-Propeller, Xoar for this scale) or generate one yourself with an open-source BEMT tool (e.g., QPROP, or a simple Python BEMT script) if no published data exists for your custom diameter/pitch.

---

## 2. Candidate Propeller Comparison Table (fill in as you evaluate options)

| Candidate | Diameter | Pitch | P/D | Blade Count | Material | RPM Limit | η @ Cruise | Thrust @ Static (0 kt) | Thrust @ Cruise Speed | Mass | Source/Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| A |  |  |  |  |  |  |  |  |  |  |  |
| B |  |  |  |  |  |  |  |  |  |  |  |
| C |  |  |  |  |  |  |  |  |  |  |  |

---

## 3. How This Feeds Your Existing Framework

- **Layer 1 (Physics & Sizing Engine):** Propeller η_prop is another efficiency term in your power chain (turboshaft → generator → DC bus → battery → motor → **propeller**) — don't let it default to 1.0, it's often the single biggest loss after the engine itself.
- **Layer 2 (Mission Simulator):** Feed in the thrust-vs-RPM-vs-airspeed curve per phase (takeoff needs static thrust, loiter needs your best-efficiency point).
- **Layer 3 (Optimizer):** If you let blade diameter/pitch be design variables (not just engine/battery/motor count), you get a more honest Pareto front — worth mentioning even if you only sensitivity-test it rather than fully optimize it, given hackathon time limits.
- **Report defensibility:** Judges may ask "what propeller efficiency did you assume and why" — cite whichever real prop (APC/MT-Propeller/Xoar datasheet) you used as ground truth rather than an assumed flat percentage.

---

## 4. Quick Search Terms (if you need reference data fast)
- `APC propeller performance data thrust curve`
- `blade element momentum theory BEMT propeller python`
- `QPROP propeller design software tutorial`
- `UAV propeller selection static thrust RPM`
