// Portfolio data, typed.

export interface SocialLink {
  label: string;
  url: string;
  href: string;
}

export interface Project {
  id: string;
  title: string;
  year: string;
  kind: string;
  tags: string[];
  blurb: string;
  role: string;
  status: string;
  metric: string;
  repo?: string;
  live?: string;
  accent: string;
}

export interface ExperienceEntry {
  co: string;
  role: string;
  yr: string;
}

export interface Stat {
  k: string;
  v: string;
}

export interface Portfolio {
  name: string;
  handle: string;
  role: string;
  location: string;
  tagline: string;
  email: string;
  phone: string;
  social: SocialLink[];
  projects: Project[];
  experience: ExperienceEntry[];
  experienceDetails: string[];
  coursework: string[];
  skills: Record<string, string[]>;
  achievements: Array<{ title: string; desc: string }>;
  now: string[];
  stats: Stat[];
}

export const PORTFOLIO: Portfolio = {
  name: "Kshitij Betwal",
  handle: "@theNeuralHorizon",
  role: "Software Engineer · Builder",
  location: "Bengaluru, India",
  tagline:
    "Building scalable backend/frontend systems, Python, C++, JavaScript, with a soft spot for ML and infra.",
  email: "kshitij.betwal@gmail.com",
  phone: "+91 9558412620",
  social: [
    { label: "GitHub", url: "github.com/theNeuralHorizon", href: "https://github.com/theNeuralHorizon" },
    { label: "LinkedIn", url: "linkedin.com/in/kshitijbetwal", href: "https://linkedin.com/in/kshitijbetwal" },
    { label: "Email", url: "kshitij.betwal@gmail.com", href: "mailto:kshitij.betwal@gmail.com" },
  ],

  projects: [
    {
      id: "predictive-maintenance",
      title: "Predictive Maintenance System",
      year: "2026",
      kind: "Infra · ML",
      tags: ["FastAPI", "React 18", "scikit-learn", "Docker", "Render", "Vercel"],
      blurb:
        "Enterprise-grade Industry 4.0 predictive-maintenance platform with a decoupled microservices architecture. Random Forest for binary failure classification + Isolation Forest for anomaly detection on sensor telemetry (AI4I 2020). OAuth2 via GitHub + stateless JWT, Dockerized backend on Render, Vite-built React dashboard on Vercel.",
      role: "Solo · Full-stack",
      status: "Deployed",
      metric: "Live",
      repo: "theNeuralHorizon/predictive-maintenance-system",
      live: "https://predictive-maintenance-system-two.vercel.app",
      accent: "#d97757",
    },
    {
      id: "skam",
      title: "SKAM",
      year: "2026",
      kind: "Platform · SRE",
      tags: ["Kubernetes", "k3d", "Go", "Python", "PyTorch", "Prometheus", "Grafana"],
      blurb:
        "Autonomous chaos-engineering & self-healing platform. Deploys 6 Go microservices on k3d, programmatically injects failures (pod kill, memory pressure, network partition, latency, cache loss), detects anomalies via Isolation Forest + LSTM autoencoder on live Prometheus telemetry, and recovers through the K8s API, closed loop, zero human intervention.",
      role: "Team · Platform",
      status: "Shipped",
      metric: "5 scenarios",
      repo: "theNeuralHorizon/skam",
      accent: "#b87ab3",
    },
    {
      id: "fakecallshield",
      title: "FakeCallShield",
      year: "2026",
      kind: "Mobile · ML",
      tags: ["React Native", "Kotlin", "TypeScript", "scikit-learn", "STIR/SHAKEN"],
      blurb:
        "Android app that detects spoofed and AI-generated phone calls entirely on-device. Combines carrier-level STIR/SHAKEN attestation with a 104-feature MLP (MFCCs, jitter, shimmer, HNR) running in pure TypeScript,~20ms inference, zero network, zero data collection.",
      role: "Solo · Mobile + ML",
      status: "Shipped",
      metric: "100% offline",
      repo: "theNeuralHorizon/FakeCallShield-",
      accent: "#6b9e7d",
    },
    {
      id: "credit-dashboard",
      title: "Credit Card Financial Dashboard",
      year: "2025",
      kind: "Data",
      tags: ["PostgreSQL", "Docker", "Power BI", "SQL", "DAX"],
      blurb:
        "Real-time financial analytics pipeline: containerized PostgreSQL ingests raw CSV transaction + customer data, SQL transforms feed Power BI dashboards tracking revenue, interest, transaction volume, and demographic KPIs. Surfaces insights across card tiers, seasonal Q4 surges, regional concentration, and payment-mode mix.",
      role: "Solo · Analytics",
      status: "Shipped",
      metric: "$806M vol.",
      repo: "theNeuralHorizon/Credit-Card-Financial-Dashboard",
      accent: "#e8b74f",
    },
    {
      id: "claimrail",
      title: "ClaimRail",
      year: "2026",
      kind: "Fintech · AI",
      tags: ["Python", "LLM", "RAG", "FastAPI"],
      blurb:
        "Insurance claims automation pipeline, intake, document extraction, and triage for complex multi-document claims. AI-driven OCR + structured-field extraction feed a rules + LLM reasoning layer that routes claims, flags fraud signals, and drafts adjuster notes. Built with guardrails, audit trails, and human-in-the-loop review.",
      role: "Builder · In development",
      status: "Private · in development",
      metric: "WIP",
      accent: "#c98a5a",
    },
    {
      id: "sentinel",
      title: "Sentinel",
      year: "2026",
      kind: "Security",
      tags: ["Bun", "Hono", "Go", "SvelteKit 5", "pgvector", "Claude"],
      blurb:
        "AI-native software supply-chain security platform. Treats your supply chain as a living graph and remediation as a fleet of autonomous agents, multi-ecosystem SBOM scanning (npm, Cargo, PyPI, Go, containers, AI-BOM), LLM-powered semantic risk scoring, pgvector-indexed provenance, and n8n-driven auto-PRs.",
      role: "Solo · Full-stack + Infra",
      status: "Active",
      metric: "46+6 tests",
      repo: "theNeuralHorizon/sentinel",
      accent: "#9a6fb0",
    },
    {
      id: "quantforge",
      title: "QuantForge",
      year: "2026",
      kind: "Quant",
      tags: ["Python", "FastAPI", "NumPy", "scikit-learn", "Streamlit", "Docker", "K8s"],
      blurb:
        "End-to-end quantitative research stack in one repo: 12 strategies, 25+ indicators, options pricing (BS / CRR / MC), portfolio optimizers (Markowitz, HRP, Black-Litterman, CVaR), risk analytics, ML, plus a hardened REST API, web terminal, Streamlit dashboard, CLI, and K8s manifests.",
      role: "Solo · Library + API",
      status: "Shipped",
      metric: "322 tests",
      repo: "theNeuralHorizon/quantforge",
      accent: "#d4a24f",
    },
    {
      id: "incident-env",
      title: "IncidentEnv",
      year: "2026",
      kind: "RL · Agents",
      tags: ["OpenEnv", "FastAPI", "Docker", "LLM"],
      blurb:
        "OpenEnv RL environment where agents act as SREs investigating production incidents across distributed microservices. 12-command action space, dense per-step rewards, red herrings at every difficulty, Kimi K2 hits 0.82 avg across three tasks. Built for the Meta × PyTorch × HuggingFace OpenEnv Hackathon.",
      role: "Team · Env design",
      status: "Hackathon",
      metric: "0.82 avg",
      repo: "theNeuralHorizon/MetaPyTorchScalerHackathon",
      accent: "#7a8cb3",
    },
    {
      id: "mobility",
      title: "Artpark Mobility (R3)",
      year: "2026",
      kind: "Robotics",
      tags: ["ROS 2 Jazzy", "Gazebo Harmonic", "Python", "AprilTags"],
      blurb:
        "End-to-end exploration-based autonomous navigation stack for the MIT × Artpark mobility hackathon Round 3. No pre-built map, robot explores a walled arena, detects 5 AprilTags, follows green then orange floor markers, and reaches a STOP tile. Seven ROS 2 packages covering perception, decision, logging.",
      role: "Team · Perception + Decision",
      status: "Hackathon",
      metric: "5 tags",
      repo: "theNeuralHorizon/mobilityyy",
      accent: "#5a87a8",
    },
    {
      id: "drifting-oracle",
      title: "Drifting Oracle",
      year: "2026",
      kind: "ML Ops",
      tags: ["Python", "Model Drift", "LLM Eval"],
      blurb:
        "Credit-risk model drift detection and LLM hallucination monitoring, built for HackBricks 2026. Dual-surface monitoring: statistical drift on classical credit scorecards plus grounded-answer checks for LLM responses.",
      role: "Team · Hackathon",
      status: "Hackathon",
      metric: "Dual loop",
      repo: "theNeuralHorizon/drifting-oracle",
      accent: "#8aa88a",
    },
  ],

  experience: [
    { co: "Zeoxia", role: "Builder Resident (R&D) · Builder Residency v1", yr: "2026 → now" },
    { co: "Manipal Institute of Technology", role: "B.Tech CS (AI)", yr: "2023 → 2027" },
  ],

  experienceDetails: [
    "Collaborating with cross-functional teams on early-stage R&D across AI systems and edge computing, ensuring end-to-end feature delivery.",
    "Developing AI experimentation workflows and prototyping tools to accelerate model validation and reduce production cycle time.",
    "Building and optimizing internal developer tooling to streamline engineering processes and improve system efficiency.",
    "Conducting research documentation to support internal initiatives, applying problem-solving skills to complex technical challenges.",
    "Mentored by senior engineers, gaining hands-on experience in shipping production-grade deep-tech products.",
  ],

  coursework: [
    "Data Structures & Algorithms",
    "OOPS",
    "DBMS",
    "System Design",
    "Operating Systems",
    "Computer Architecture",
    "Distributed Systems",
    "Machine Learning",
  ],

  skills: {
    Languages: ["Python", "C++", "JavaScript", "SQL (PostgreSQL, MySQL)"],
    Frameworks: ["FastAPI", "React.js", "Node.js", "Tailwind CSS", "Scikit-learn", "Pandas", "NumPy", "PyTorch"],
    Tools: ["AWS (EC2, Cognito)", "Power BI", "Docker", "Git", "Linux", "CI/CD", "Microservices", "REST APIs"],
    Concepts: ["DSA", "OOPS", "DBMS", "System Design", "Distributed Computing"],
  },

  achievements: [
    { title: "Google Hackathon, Finalist", desc: "Led a 5-member team to the final round among 200+ teams." },
    { title: "Honeywell Hackathon 2025, Top 10", desc: "Recognized for technical innovation in real-time system design." },
    { title: "Meta × PyTorch × HF OpenEnv Hackathon", desc: "Shipped IncidentEnv, an SRE-agent RL environment with a Kimi K2 baseline averaging 0.82 across tasks." },
  ],

  now: [
    "ClaimRail in build: multi-doc intake, OCR + structured extraction, LLM triage layer.",
    "B.Tech CS-AI at Manipal, 2027 cohort.",
    "Predictive Maintenance API in prod: FastAPI + Random Forest on Render and Vercel.",
    "Sentinel: SBOM graph across npm, Cargo, PyPI, Go and containers; pgvector provenance, agentic auto-PRs.",
    "Reading: distributed systems, consensus, queueing theory.",
  ],

  stats: [
    { k: "Projects shipped", v: "9" },
    { k: "Live deployments", v: "2" },
    { k: "Graduation", v: "2027" },
  ],
};
