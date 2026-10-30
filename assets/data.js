export const SYSTEMS = [
  {
    id: "rag",
    kind: "system",
    num: "01",
    name: "Regulatory RAG Advisor",
    short: "RAG ADVISOR",
    tag: "RETRIEVAL",
    metric: "300+ GB",
    color: "#0a84ff",
    accent: "#ff6a2b",
    lede: "A retrieval system that answers compliance questions across 300+ GB of regulation without losing the thread between chunks.",
    problem: "Compliance teams needed answers from documents spanning 15 regulatory bodies, where a single chunk rarely holds the full answer.",
    approach: [
      "Parent-child chunking: retrieve the passage, keep its full context.",
      "A ~35-field metadata layer for jurisdiction, body, and dates.",
      "Hybrid sparse + dense search for exact language and intent."
    ],
    pipeline: "ingest → parent/child chunk → 35-field metadata → hybrid retrieval → grounded answer",
    outcome: "No information lost between chunks. Accurate, cited retrieval at production scale.",
    stack: ["LangChain", "Azure OpenAI", "ChromaDB", "Hybrid search", "FastAPI"]
  },
  {
    id: "invoice",
    kind: "system",
    num: "02",
    name: "Invoice Intelligence",
    short: "INVOICE AI",
    tag: "DOCUMENT AI",
    metric: "150 / DAY",
    color: "#ff6a2b",
    accent: "#0a84ff",
    lede: "A multi-class OCR pipeline that turns a five-minute invoice into a one-minute one, 150 times a day.",
    problem: "Procurement processed roughly 150 invoices a day at about five minutes each, with manual keying and checking.",
    approach: [
      "Azure Document Intelligence for layout-aware extraction.",
      "GPT-4o for normalization and field reconciliation.",
      "FastAPI endpoints with validation and monitoring."
    ],
    pipeline: "upload → classify → extract → normalize → validate → API",
    outcome: "5 → 1 minute per invoice. 80% faster, 200+ hours reclaimed every month.",
    stack: ["Azure Doc Intelligence", "GPT-4o", "FastAPI", "Docker"]
  },
  {
    id: "trade",
    kind: "system",
    num: "03",
    name: "Trade Document OCR",
    short: "TRADE OCR",
    tag: "OCR",
    metric: "1,467 HRS",
    color: "#0a84ff",
    accent: "#ff6a2b",
    lede: "A pipeline that replaced five hours of daily manual entry with fifteen minutes, including handwritten cover pages.",
    problem: "Trade documents arrived with handwritten cover pages and inconsistent layouts, consuming about five hours a day.",
    approach: [
      "Layout analysis and OCR across mixed document types.",
      "A custom LLM validation layer for handwriting and drift.",
      "Structured export with an audit trail."
    ],
    pipeline: "scan → layout analysis → OCR → LLM validation → export",
    outcome: "1,500 → 33 hours a year. 1,467 hours saved annually.",
    stack: ["Azure Doc Intelligence", "GPT-4o", "Python", "FastAPI"]
  },
  {
    id: "account",
    kind: "system",
    num: "04",
    name: "Account Opening",
    short: "ACCOUNT OPENING",
    tag: "KYC",
    metric: "ALL BRANCHES",
    color: "#ff6a2b",
    accent: "#0a84ff",
    lede: "An in-house document-AI framework that reads KYC forms from every branch and replaced a paid vendor.",
    problem: "Account opening forms from every branch depended on a costly third-party extraction vendor.",
    approach: [
      "End-to-end OCR for KYC fields and signatures.",
      "Validated JSON output designed for downstream systems.",
      "A reusable in-house framework, not a one-off script."
    ],
    pipeline: "branch form → OCR → field extraction → signature capture → validated JSON",
    outcome: "Vendor dependency eliminated. One framework, every branch.",
    stack: ["Azure Doc Intelligence", "GPT-4o", "FastAPI", "Azure ML"]
  },
  {
    id: "entity",
    kind: "system",
    num: "05",
    name: "NTB / ETB Matching",
    short: "NTB / ETB",
    tag: "MATCHING",
    metric: "2,479",
    color: "#c4f000",
    accent: "#0a84ff",
    lede: "A multi-stage matcher that reconciled thousands of messy CRM names against bank records.",
    problem: "CRM company names rarely matched bank records exactly, so New-to-Bank versus Existing-to-Bank was guesswork.",
    approach: [
      "Stage one: exact and containment matching.",
      "Stage two: SentenceTransformer embeddings with cosine similarity.",
      "Semantic blocking to keep the comparison tractable."
    ],
    pipeline: "CRM names → normalize → exact/containment → embedding match → classify",
    outcome: "2,479 companies classified as NTB or ETB prospects.",
    stack: ["SentenceTransformers", "HuggingFace", "ChromaDB", "scikit-learn"]
  },
  {
    id: "geo",
    kind: "system",
    num: "06",
    name: "Geospatial Planner",
    short: "GEO PLANNER",
    tag: "GEOSPATIAL",
    metric: "116 ZONES",
    color: "#ff6a2b",
    accent: "#c4f000",
    lede: "A data-backed map of where the next branch should go, and where it shouldn't.",
    problem: "Branch expansion decisions needed evidence about coverage, competitors, and cannibalization.",
    approach: [
      "Mapped 2,200+ branches and geocoded 8,000+ competitor locations across five cities.",
      "Built 1×1 km grids with a 500 m cannibalization buffer.",
      "Scored cells into opportunity zones for executive review."
    ],
    pipeline: "locations → geocode → 1 km grid → 500 m buffer → opportunity score",
    outcome: "116 opportunity zones that shaped the annual branch expansion plan.",
    stack: ["SERP API", "GeoPandas", "Python", "Spatial analysis"]
  }
];

export const PROJECTS = [
  {
    id: "omnivault",
    kind: "project",
    num: "P1",
    name: "OmniVault",
    short: "OMNIVAULT",
    tag: "LOCAL-FIRST",
    metric: "ANDROID",
    color: "#ff6a2b",
    accent: "#0a84ff",
    lede: "Privacy-first bookmarking for everything you save.",
    body: "A fully local Android app that unifies saved content from Instagram, X, YouTube, LinkedIn, and the web. Tapping Share auto-fetches the platform, title, caption, description, and thumbnail, then sorts each saved item by platform and content type. It includes a distraction-free, ad-stripped reader, quick notes, custom categories, priorities, and deadlines with reminders. No accounts, no tracking: nothing leaves the device.",
    stack: ["Kotlin", "Android", "Local-first", "Share extension"]
  },
  {
    id: "narrative",
    kind: "project",
    num: "P2",
    name: "Multi-Agent Narrative",
    short: "NARRATIVE",
    tag: "MULTI-AGENT",
    metric: "LANGGRAPH",
    color: "#0a84ff",
    accent: "#c4f000",
    lede: "A director agent and characters with memory.",
    body: "A LangGraph + Google Gemini system where a Director agent orchestrates multiple character agents, each with persistent memory and a distinct personality. A non-verbal action system and memory-sharing protocols let characters express emotion and retain context across long story arcs. Built at Hackfest × Datathon, February 2026.",
    stack: ["LangGraph", "Google Gemini", "Multi-agent", "Persistent memory"]
  },
  {
    id: "ednova",
    kind: "project",
    num: "P3",
    name: "EDNOVA",
    short: "EDNOVA",
    tag: "EDTECH",
    metric: "MERN",
    color: "#0a84ff",
    accent: "#ff6a2b",
    lede: "A gamified, multi-tenant learning platform.",
    body: "A full-stack multi-tenant LMS with role-based access, real-time engagement tracking, a points-based reward engine, and leaderboards. An analytics dashboard turns activity into composite engagement scores, helping educators identify at-risk students early.",
    stack: ["MongoDB", "Express", "React", "Node.js"]
  }
];

export const ABOUT = {
  title: "Operator, not spectator.",
  lede: "I'm an AI engineer and data scientist at United Bank Limited, one of Pakistan's largest banks. I spend my days turning document-heavy, manual processes into systems that read, reason, and return something a person can trust.",
  body: [
    "Outside work I build small, opinionated products, including a local-first bookmarking app and a multi-agent storytelling system. The fastest way to understand a new idea is to ship it. I studied computer science at Iqra University, Karachi.",
    "The work I care about sits close to the mess: inconsistent documents, names that don't match, decisions that need evidence. That is where a model stops being a demo and starts being useful."
  ],
  facts: [
    { label: "Base", value: "Karachi, Pakistan" },
    { label: "Focus", value: "LLM systems · Document AI · Geospatial" },
    { label: "Education", value: "BS Computer Science, Iqra University" },
    { label: "Status", value: "Open to hard problems" }
  ],
  principles: [
    "Measure the manual cost first. Every system starts with hours wasted.",
    "Retrieval over guessing. Ground the model or don't ship it.",
    "The pipeline is the product. Demos impress; pipelines pay.",
    "Keep a human in the loop. Validation layers, change logs, audit trails."
  ],
  stack: "LLM engineering · Computer vision & OCR · ML & forecasting · NLP & embeddings · Geospatial engineering · MLOps"
};

export const CONTACT = {
  title: "Let's build something that works.",
  lede: "If you have a manual process that should be a system, or a model that needs to survive production, I'd like to hear about it.",
  email: "krishinlal1@gmail.com",
  phone: "+92 323 1305008",
  phoneHref: "tel:+923231305008",
  linkedin: "https://linkedin.com/in/krishin-lal",
  resume: "Krishin-Lal-Resume.pdf"
};

export const MODES = {
  systems: { label: "SYSTEMS", items: SYSTEMS, count: SYSTEMS.length },
  projects: { label: "PROJECTS", items: PROJECTS, count: PROJECTS.length }
};
