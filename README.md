# GARUN

## Hybrid-Electric Propulsion Optimization for a Fixed-Wing UAV

<p align="center">
  <strong>A physics-based computational framework for UAV propulsion sizing, mission simulation, and multi-objective optimization.</strong>
</p>

<p align="center">
  <a href="https://github.com/purvask2006-collab/Garun-Optimization-Framework">
    <img src="https://img.shields.io/github/stars/purvask2006-collab/Garun-Optimization-Framework?style=flat-square" alt="GitHub Stars">
  </a>
  <a href="https://github.com/purvask2006-collab/Garun-Optimization-Framework">
    <img src="https://img.shields.io/github/forks/purvask2006-collab/Garun-Optimization-Framework?style=flat-square" alt="GitHub Forks">
  </a>
  <img src="https://img.shields.io/badge/domain-aerospace-blue?style=flat-square" alt="Aerospace">
  <img src="https://img.shields.io/badge/system-hybrid--electric-orange?style=flat-square" alt="Hybrid Electric">
  <img src="https://img.shields.io/badge/model-physics--based-green?style=flat-square" alt="Physics Based">
  <img src="https://img.shields.io/badge/optimization-multi--objective-purple?style=flat-square" alt="Multi Objective">
</p>

---

## 1. Overview

**GARUN** is a computational framework for the **design and optimization of hybrid-electric propulsion systems for fixed-wing UAVs**.

The framework combines aircraft performance models, aerodynamic relationships, propulsion-system models, energy-storage models, environmental conditions, mission profiles, and optimization algorithms into a unified workflow.

The primary objective is to determine propulsion-system configurations and operating strategies that satisfy mission requirements while optimizing competing parameters such as:

* Aircraft mass
* Fuel consumption
* Battery energy consumption
* Propulsive efficiency
* Endurance
* Power requirements
* Energy-management strategy

Rather than optimizing individual components independently, GARUN evaluates the **interaction between the aircraft, propulsion system, energy system, environment, and mission**.

---

## 2. Engineering Problem

Hybrid-electric UAV propulsion is a coupled system.

A change in one subsystem affects the performance of the others.

For example:

```text
Battery Mass
     │
     ▼
Aircraft Mass
     │
     ▼
Required Lift
     │
     ▼
Aerodynamic Drag
     │
     ▼
Required Propulsive Power
     │
     ├───────────────┐
     ▼               ▼
Engine            Battery
     │               │
     └───────┬───────┘
             ▼
       Total Propulsive
            Power
             │
             ▼
        Mission Energy
             │
             ▼
          Endurance
```

Consequently, selecting the largest battery, most powerful engine, or highest-efficiency motor independently does not necessarily produce the best aircraft-level solution.

GARUN addresses this coupling through integrated simulation and optimization.

---

# 3. System Architecture

The computational architecture follows the sequence:

```text
┌───────────────────┐
│ Mission Definition│
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Aircraft Parameters│
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Atmospheric Model │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Aerodynamic Model │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Power Requirement │
└─────────┬─────────┘
          │
          ▼
┌────────────────────────┐
│ Hybrid Propulsion Model│
└─────────┬──────────────┘
          │
          ▼
┌───────────────────┐
│ Energy Management │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Constraint Checks  │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Optimization       │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Design Candidates │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Performance Report│
└───────────────────┘
```

This architecture separates the **engineering model**, **simulation layer**, and **optimization layer**, allowing individual models to be modified without restructuring the complete system.

---

# 4. Physics-Based Modeling

GARUN uses aircraft-performance relationships to calculate the power required by the UAV.

### Lift

[
L = \frac{1}{2}\rho V^2 S C_L
]

where:

* (L) = lift
* (\rho) = air density
* (V) = aircraft velocity
* (S) = wing reference area
* (C_L) = coefficient of lift

For steady-level flight:

[
L \approx W = mg
]

Therefore:

[
C_L =
\frac{2W}{\rho V^2S}
]

---

### Drag

The aerodynamic drag is calculated using:

[
D = \frac{1}{2}\rho V^2S C_D
]

A conventional drag-polar representation can be expressed as:

[
C_D = C_{D0}+kC_L^2
]

where:

* (C_{D0}) = zero-lift drag coefficient
* (k) = induced-drag factor

---

### Propulsive Power

The power required at the aircraft is:

[
P_{aircraft}=DV
]

Accounting for propulsive efficiency:

[
P_{shaft}=
\frac{DV}{\eta_p}
]

where:

[
\eta_p = \frac{TV}{P_{shaft}}
]

The required power therefore depends on aircraft mass, atmospheric conditions, velocity, aerodynamic characteristics, and propulsion efficiency.

---

# 5. Hybrid-Electric Propulsion Model

GARUN represents the propulsion system as a combination of thermal and electrical power sources.

```text
                    Fuel
                     │
                     ▼
              ┌─────────────┐
              │    Engine   │
              └──────┬──────┘
                     │
                     ▼
              ┌─────────────┐
              │  Generator  │
              └──────┬──────┘
                     │
                     ▼
              ┌─────────────┐
              │ Electrical  │◄──────── Battery
              │     Bus     │
              └──────┬──────┘
                     │
                     ▼
              ┌─────────────┐
              │ Electric    │
              │   Motor     │
              └──────┬──────┘
                     │
                     ▼
              ┌─────────────┐
              │ Propeller   │
              └──────┬──────┘
                     │
                     ▼
                  Thrust
```

The total available propulsion power can be represented as a function of the engine-generator and battery contributions:

[
P_{total}=P_{engine}+P_{battery}
]

subject to system efficiencies and component limits.

The framework can therefore evaluate different power-split strategies across a mission.

---

# 6. Mission-Based Simulation

A propulsion system cannot be evaluated accurately using a single operating condition.

GARUN evaluates system performance over defined mission phases.

A typical mission may contain:

```text
Takeoff
   │
   ▼
Climb
   │
   ▼
Cruise
   │
   ▼
Loiter
   │
   ▼
Descent
   │
   ▼
Landing
```

Each phase can have different:

* Altitude
* Velocity
* Power requirement
* Engine operating point
* Battery demand
* State of charge
* Atmospheric conditions
* Propeller operating conditions

Mission-level integration enables total fuel and electrical-energy consumption to be evaluated over the complete flight.

---

# 7. Atmospheric Modeling

Aircraft performance is strongly dependent on atmospheric conditions.

GARUN therefore includes an atmosphere component for determining environmental parameters such as:

* Temperature
* Pressure
* Density
* Altitude-dependent operating conditions

Air density is particularly important because:

[
q=\frac{1}{2}\rho V^2
]

where (q) is dynamic pressure.

Since lift and drag depend on dynamic pressure, changes in altitude directly affect aircraft performance and propulsion requirements.

---

# 8. Optimization

The framework is designed to support **multi-objective optimization**.

A representative optimization problem can be expressed as:

[
\min
\left[
m_{UAV},
F_{fuel},
E_{battery}
\right]
]

subject to:

[
P_{required}\leq P_{available}
]

[
SOC_{min}\leq SOC(t)\leq SOC_{max}
]

[
m_{UAV}\leq m_{MTOW}
]

along with component and mission constraints.

The optimizer searches the feasible design space rather than evaluating a single predetermined configuration.

---

## Pareto Optimization

The objectives of a hybrid-electric UAV are inherently conflicting.

For example:

```text
Lower Battery Mass
        │
        ▼
Lower Aircraft Mass
        │
        ▼
Lower Required Power
        │
        ▼
Potential Endurance Benefit
```

but:

```text
Lower Battery Mass
        │
        ▼
Lower Stored Energy
        │
        ▼
Potential Endurance Penalty
```

Therefore, there may not be one universally optimal configuration.

GARUN can instead identify **Pareto-optimal designs**, allowing engineers to select a configuration based on mission priorities.

---

# 9. Adaptive Energy Management

A key objective of the framework is to evaluate dynamic power allocation between the engine and battery.

Instead of using a fixed power split:

[
P_{engine}=constant
]

[
P_{battery}=constant
]

the system can determine the required contribution as a function of mission state:

[
P_{engine}(t)+P_{battery}(t)=P_{required}(t)
]

subject to:

* Engine power limits
* Battery power limits
* Battery SOC limits
* Component efficiencies
* Mission requirements

This allows the propulsion system to operate differently during high-power and low-power mission phases.

---

# 10. Repository Structure

```text
Garun-Optimization-Framework/
│
├── Atmosphere Database/
│   └── Atmospheric parameters and models
│
├── Battery Database/
│   └── Battery characteristics
│
├── Engine Database/
│   └── Engine parameters
│
├── Equations Database/
│   └── Engineering equations and calculations
│
├── Generator Database/
│   └── Generator characteristics
│
├── HAL Platform Library/
│   └── Platform-specific configuration
│
├── Material Database/
│   └── Material properties
│
├── Mission Profiles/
│   └── Mission definitions
│
├── Motor Database/
│   └── Electric motor characteristics
│
├── Optimization/
│   └── Optimization algorithms and configuration
│
├── Propeller Database/
│   └── Propeller characteristics
│
├── Reports/
│   └── Simulation and optimization outputs
│
├── Simulation Inputs/
│   └── Input configurations
│
├── UI Theme/
│   └── Interface configuration
│
├── src/
│   └── Application source code
│
├── package.json
├── vite.config.ts
└── index.html
```

The modular organization is intended to maintain a clear separation between **input data, engineering models, optimization logic, simulation configuration, and application interface**.

---

# 11. Engineering Databases

GARUN uses dedicated databases for major propulsion and aircraft subsystems.

| Database         | Purpose                               |
| ---------------- | ------------------------------------- |
| Atmosphere       | Environmental operating conditions    |
| Battery          | Energy-storage parameters             |
| Engine           | Thermal propulsion characteristics    |
| Generator        | Electrical generation characteristics |
| Motor            | Electric propulsion characteristics   |
| Propeller        | Propulsive performance                |
| Materials        | Mass and material properties          |
| Mission Profiles | Flight scenarios                      |
| Equations        | Engineering calculation models        |

This approach allows component characteristics to be changed without modifying the fundamental simulation architecture.

---

# 12. Design Variables

Depending on the optimization configuration, candidate variables may include:

### Aircraft

* MTOW
* Wing area
* Cruise velocity
* Aerodynamic coefficients

### Thermal Propulsion

* Engine rating
* Engine operating point
* Generator rating

### Electrical Propulsion

* Motor rating
* Battery capacity
* Battery mass
* SOC operating limits

### Propeller

* Propeller operating point
* Propulsive efficiency
* Diameter / performance parameters

### Mission

* Cruise altitude
* Cruise velocity
* Loiter duration
* Mission phase allocation

---

# 13. Performance Metrics

GARUN can be used to evaluate:

| Category     | Example Metrics                    |
| ------------ | ---------------------------------- |
| Aircraft     | Mass, lift, drag                   |
| Aerodynamics | (C_L), (C_D), (L/D)                |
| Propulsion   | Thrust, shaft power, efficiency    |
| Energy       | Fuel consumption, battery energy   |
| Battery      | SOC, power demand                  |
| Mission      | Endurance, energy consumption      |
| Optimization | Objective values, Pareto solutions |
| Environment  | Density, temperature, pressure     |

---

# 14. Simulation Workflow

A typical GARUN analysis follows:

```text
1. Define UAV
        ↓
2. Select mission
        ↓
3. Define atmospheric conditions
        ↓
4. Select propulsion components
        ↓
5. Calculate aerodynamic performance
        ↓
6. Calculate required propulsion power
        ↓
7. Calculate engine/battery power contribution
        ↓
8. Integrate energy consumption
        ↓
9. Check constraints
        ↓
10. Evaluate objectives
        ↓
11. Optimize design
        ↓
12. Compare candidate solutions
```

This workflow makes the relationship between **input assumptions and final optimization results explicit**.

---

# 15. Example Design Study

A representative design study can compare a baseline propulsion configuration with an optimized configuration.

For example:

| Parameter                 | Baseline | Optimized |
| ------------------------- | -------: | --------: |
| MTOW                      |   450 kg |    418 kg |
| Endurance                 |    6.5 h |     7.7 h |
| Relative fuel consumption |     100% |       78% |

These values represent **design-study targets/results from the simulation framework** and should be interpreted according to the model assumptions and validation level.

They are not equivalent to flight-test or certification data.

The purpose of the optimization is to identify the underlying design changes responsible for the improvement rather than simply reporting the final numbers.

---

# 16. Technology Stack

| Technology        | Role                                 |
| ----------------- | ------------------------------------ |
| TypeScript        | Application development              |
| Vite              | Build and development environment    |
| Web UI            | Visualization and interaction        |
| Physics Models    | Aircraft and propulsion calculations |
| Optimization      | Design-space exploration             |
| Modular Databases | Engineering component data           |

---

# 17. Installation

### Prerequisites

* Node.js
* npm
* Git

### Clone

```bash
git clone https://github.com/purvask2006-collab/Garun-Optimization-Framework.git
cd Garun-Optimization-Framework
```

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

The development server will provide a local URL through the terminal.

---

# 18. Reproducibility

For an engineering result to be meaningful, the configuration that generated it must be recoverable.

A simulation should therefore specify:

```text
Aircraft Configuration
        +
Atmospheric Conditions
        +
Mission Profile
        +
Propulsion Configuration
        +
Battery Configuration
        +
Optimization Parameters
        =
Simulation Result
```

Future development will focus on storing complete simulation configurations alongside generated results so that optimization studies can be reproduced independently.

---

# 19. Validation Strategy

GARUN follows a progressive validation approach.

### Level 1 — Analytical Verification

Verify fundamental relationships:

* Lift
* Drag
* Power
* Energy
* Mass relationships

### Level 2 — Component Verification

Compare:

* Engine models
* Motor models
* Generator models
* Battery models
* Propeller models

against available component data.

### Level 3 — Mission Verification

Verify integrated mission performance against independently calculated cases.

### Level 4 — Higher-Fidelity Simulation

Potential integration with:

* MATLAB/Simulink
* Flight dynamics simulators
* CFD
* Hardware-in-the-loop systems

### Level 5 — Experimental Validation

Where applicable, compare predictions against component or flight-test measurements.

---

# 20. Limitations

GARUN is a **design and simulation framework**, not a certified aircraft-analysis system.

The accuracy of its results depends on:

* Aerodynamic assumptions
* Component models
* Battery characteristics
* Engine performance data
* Propeller data
* Atmospheric assumptions
* Mission definition
* Optimization constraints

Low-fidelity models can produce precise-looking numbers that are nevertheless physically inaccurate.

Therefore:

> **Numerical precision should not be confused with model accuracy.**

Independent verification and validation are required before using simulation outputs for flight-critical decisions.

---

# 21. Roadmap

### Current

* [x] Modular propulsion databases
* [x] Mission-profile architecture
* [x] Atmospheric modeling
* [x] Engineering equation framework
* [x] Battery, engine, motor and generator databases
* [x] Propeller modeling
* [x] Optimization framework
* [x] Simulation reporting

### Planned

* [ ] Automated model verification
* [ ] Expanded aerodynamic model
* [ ] Component efficiency maps
* [ ] Battery thermal model
* [ ] Battery degradation model
* [ ] Uncertainty quantification
* [ ] Sensitivity analysis
* [ ] Pareto-front visualization
* [ ] Surrogate models
* [ ] Reinforcement-learning-based energy management
* [ ] Hardware-in-the-loop integration
* [ ] Experimental validation

---

# 22. Research Direction

GARUN is intended to evolve from a propulsion optimization framework toward a broader **digital engineering environment for UAV system design**.

The long-term architecture is:

```text
                  GARUN
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
     Aircraft   Propulsion    Mission
        │           │           │
        └───────────┼───────────┘
                    │
                    ▼
              Digital Model
                    │
                    ▼
              Optimization
                    │
                    ▼
              Decision Space
                    │
                    ▼
             Validated Design
```

The objective is not simply to produce an optimized number.

It is to provide an engineering chain from:

**Mission Requirement → Physical Model → Simulation → Optimization → Design Decision**

---

# 23. Contributing

Contributions are welcome in the areas of:

* Aerodynamic modeling
* Propulsion modeling
* Battery modeling
* Mission simulation
* Optimization algorithms
* Energy-management strategies
* Validation
* Visualization
* Testing

When contributing an engineering model, document:

1. Governing equations
2. Assumptions
3. Input parameters
4. Validity range
5. Source/reference data
6. Verification method

---

# 24. License

See the repository license for the applicable terms of use.

---

# 25. Citation

If GARUN is used in academic or research work, cite the repository:

```bibtex
@software{garun_optimization_framework,
  author  = {Khanapurkar, Purva},
  title   = {GARUN: Hybrid-Electric Propulsion Optimization
             for a Fixed-Wing UAV},
  year    = {2026},
  url     = {https://github.com/purvask2006-collab/Garun-Optimization-Framework}
}
```

---

<p align="center">

<strong>GARUN</strong><br> <em>Hybrid-Electric Propulsion Optimization for a Fixed-Wing UAV</em>

<br><br>

Physics-based modeling • Mission simulation • Multi-objective optimization • Digital engineering

</p>
