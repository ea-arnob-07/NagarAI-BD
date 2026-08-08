<div align="center">

# 🟢 🔴 NAGAR·AI BD (নাগরাই)
### **Intelligent Civic Grievance Triage & Human-Reviewed Decision Support System**
*Empowering Citizens · Assisting Administrators · Accelerating Public Governance in Bangladesh*

<br/>

[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python_3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![Scikit-Learn](https://img.shields.io/badge/scikit_learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare_D1-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/d1/)
[![License: MIT](https://img.shields.io/badge/License-MIT-f32948.svg?style=for-the-badge)](LICENSE)

<br/>

[🌟 Features](#-key-features) • [🧠 6-Model Ensemble](#-six-model-machine-learning-ensemble) • [🗺️ Ward Geolocation](#-interactive-ward-map--gis) • [🏗️ Architecture](#-system-architecture) • [🚀 Quickstart](#-getting-started) • [👥 Team](#-team-evolutionx)

<br/>

<img src="./public/nagarai-civic-operations.png" alt="NagarAI Civic Intelligence Operations Dashboard" width="100%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.25);" />

</div>

---

## 📖 Overview

**NagarAI BD** is a state-of-the-art, human-reviewed civic complaint triage demonstrator engineered specifically for Bangladesh's municipal governance challenges. Citizens across urban and rural wards often voice critical public utility issues in **Bangla (বাংলা)**, **Banglish**, or **English**. 

NagarAI bridges citizens and municipal authorities by leveraging an **ensemble of 6 supervised Machine Learning models** to analyze incoming grievances, predict civic departments, evaluate severity and public safety risk, verify duplicate reports, and automatically route dockets to responsible ward councilors and municipal engineers.

> 🛡️ **Ethical AI & Human-in-the-Loop Principle:**  
> NagarAI functions strictly as **decision support**. It **never** automatically deletes, ignores, or deprioritizes citizen reports. Whenever model confidence or consensus is uncertain, complaints are flagged for priority human review.

---

## 🌟 Key Features

<table>
  <tr>
    <td width="50%">
      <h3>🇧🇩 Bilingual & Banglish NLP</h3>
      <p>Seamlessly accepts citizen grievances in standard <b>Bangla</b>, informal phonetically typed <b>Banglish</b>, and <b>English</b> with high noise tolerance and spelling resilience.</p>
    </td>
    <td width="50%">
      <h3>🧠 6-Model Supervised Ensemble</h3>
      <p>Six distinct ML classifiers vote independently using validation-derived <b>Soft-Voting</b> weights. Full transparency with individual model probabilities and consensus scores.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🗺️ Ward-Level GIS & Map Picker</h3>
      <p>Interactive Leaflet map with GPS pinpointing, landmarks, automated ward identification, and department jurisdiction lookup.</p>
    </td>
    <td width="50%">
      <h3>🚨 Emergency Helplines Hub</h3>
      <p>Instant one-touch access to Bangladesh national emergencies (<b>999</b>), Fire Service (<b>199</b>), Women & Child Helpline (<b>10921</b>), and ACC Hotline (<b>106</b>).</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🔍 Semantic Duplicate Detection</h3>
      <p>Real-time TF-IDF cosine similarity checking alerts reviewers to recurring or identical incidents in the same geographic radius.</p>
    </td>
    <td width="50%">
      <h3>📑 Official Case Docket & Notice Dispatch</h3>
      <p>One-click PDF/print-ready municipal dockets, complete with photo evidence, ward official contact info, automated SMS/Call notice dispatch.</p>
    </td>
  </tr>
</table>

---

## 🧠 Six-Model Machine Learning Ensemble

NagarAI employs an ensemble of 6 complementary supervised classifiers to avoid single-model bias and ensure robust classification across noisy, multilingual public grievance texts.

```
                               ┌────────────────────────────────────────┐
                               │     Citizen Grievance Submission       │
                               │     (Bangla / Banglish / English)      │
                               └───────────────────┬────────────────────┘
                                                   │
                                ┌──────────────────┴──────────────────┐
                                ▼                                     ▼
                     [ Word TF-IDF (1-2 grams) ]        [ Char TF-IDF (3-5 grams) ]
                                │                                     │
           ┌────────────────────┼─────────────────┐                   │
           ▼                    ▼                 ▼                   ▼
    ┌─────────────┐      ┌─────────────┐   ┌─────────────┐     ┌─────────────┐
    │  Model 1:   │      │  Model 3:   │   │  Model 5:   │     │  Model 2:   │
    │  Logistic   │      │ Multinomial │   │   SGD Log   │     │ Calibrated  │
    │ Regression  │      │ Naive Bayes │   │    Loss     │     │  Char SVM   │
    └──────┬──────┘      └──────┬──────┘   └──────┬──────┘     └──────┬──────┘
           │                    │                 │                   │
           └────────────────────┼─────────────────┼───────────────────┘
                                │                 │
                                ▼                 ▼
                         ┌─────────────┐   ┌─────────────┐
                         │  Model 4:   │   │  Model 6:   │
                         │ Complement  │   │ Hybrid SVD  │
                         │ Naive Bayes │   │Random Forest│
                         └──────┬──────┘   └──────┬──────┘
                                │                 │
                                └────────┬────────┘
                                         ▼
                     ┌────────────────────────────────────────┐
                     │   Validation-Tuned Soft Voting (F1)    │
                     └───────────────────┬────────────────────┘
                                         ▼
                     ┌────────────────────────────────────────┐
                     │   Category + Severity + Confidence     │
                     └───────────────────┬────────────────────┘
                                         ▼
                     ┌────────────────────────────────────────┐
                     │ Human Review Threshold (Confidence < θ)│
                     └────────────────────────────────────────┘
```

### Detailed Model Architecture

| Model | Feature Representation | Primary Specialty in NagarAI |
| :--- | :--- | :--- |
| **Word Logistic Regression** | Word TF-IDF (1–2 n-grams) | Strong, interpretable linear baseline for standard vocabulary |
| **Calibrated Character SVM** | Character TF-IDF (3–5 n-grams) | Highly robust to Banglish spelling variations & typos |
| **Multinomial Naive Bayes** | Word TF-IDF | Rapid, low-data probabilistic baseline with calibrated priors |
| **Complement Naive Bayes** | Character TF-IDF | Compensates for class imbalance in rare grievance types |
| **SGD Log-Loss Classifier** | Combined Word + Char TF-IDF | Scalable, regularized linear decision boundary |
| **Hybrid SVD Random Forest** | TruncatedSVD Reduced Dense Features | Captures non-linear feature interactions and semantic clusters |

> **Voting Mechanism:** Every model produces probabilities independently. Normalized weights are derived strictly from validation split **Macro-F1 scores** (test data is never used during weight tuning).

---

## 🏢 Supported Public Service Sectors

NagarAI categorizes grievances into six core civic service divisions:

| Sector | Code | Scope & Description |
| :---: | :--- | :--- |
| 🚰 | `water` | Water supply cuts, pipeline leaks, contaminated water, open drainage overflow |
| 🛣️ | `road_transport` | Potholes, damaged highways, broken footbridges, illegal parking, traffic congestion |
| 🗑️ | `waste` | Uncollected municipal garbage, open dumping, overflowing bins, road sweeping |
| ⚡ | `electricity` | Power transformer outages, hanging live wires, load-shedding, unlit streetlights |
| 🏥 | `healthcare` | Community health clinics, public hospital hygiene, vector-borne disease control |
| 🍲 | `food` | Adulteration reports, illegal chemical usage, unhygienic restaurant conditions |

---

## 🗺️ Interactive Ward Map & GIS

- **Ward Boundary Triage:** Automatically maps citizen location to local administrative units (e.g., Dhaka North/South City Corporation, Chittagong, Sylhet).
- **Responsible Official Registry:** Displays the assigned Ward Councilor and Executive Engineer's contact number and office credentials.
- **One-Click Notice:** Directly dispatches official inquiry notices, SMS alerts, or phone calls from the administration panel.

---

## 💻 Tech Stack & Frameworks

<div align="center">

| Area | Technologies |
| :--- | :--- |
| **Frontend UI** | Next.js 16 (App Router), React 19, TypeScript, Vanilla CSS + Tailwind CSS |
| **UI Components** | Radix UI Primitives, Lucide Icons, Recharts Analytics, Leaflet GIS |
| **Runtime & Edge** | Cloudflare Workers, Vite RSC, Drizzle ORM, Cloudflare D1 Database |
| **Machine Learning** | Python 3.11+, Scikit-Learn, NumPy, Pandas, Joblib |
| **Inference Service** | FastAPI, Uvicorn, Pydantic, Cross-Origin Resource Sharing |
| **Testing** | Node.js Native Test Runner (`node:test`), End-to-End Shell Verifiers |

</div>

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** `>= 22.13.0`
- **Python** `>= 3.10` (for training custom models / ML API)

---

### 1. Web Application

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/nagarai-bd.git
cd nagarai-bd

# Install packages
npm install

# Start development server
npm run dev
```

The web application runs with a **portable in-browser ensemble engine** out of the box (`lib/ensemble.ts`), enabling full demonstration without requiring Python services.

To build and run tests:
```bash
# Build production bundle
npm run build

# Run automated tests (5/5 unit & render tests)
npm test
```

---

### 2. Python ML Service & Custom Model Training (Optional)

To train models on the full dataset or run the dedicated FastAPI inference microservice:

#### Windows (PowerShell):
```powershell
cd ml
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Train ensemble on grievance dataset
python -m nagarai_ml.train --data ../data/demo_complaints.csv --output artifacts

# Launch FastAPI Microservice
uvicorn nagarai_ml.api:app --reload --port 8000
```

#### Linux / macOS (Bash):
```bash
cd ml
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Train ensemble on grievance dataset
python -m nagarai_ml.train --data ../data/demo_complaints.csv --output artifacts

# Launch FastAPI Microservice
uvicorn nagarai_ml.api:app --reload --port 8000
```

#### Connecting Frontend to ML Microservice:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_NAGARAI_API_URL=https://api.nagarai.org
```
*(If the API server is unreachable, the frontend seamlessly falls back to the embedded client ensemble).*

---

## 📊 Evaluation & Benchmarking

When running the training pipeline, metrics are written to `ml/artifacts/metrics.json` and include:
- **Macro-Averaged F1** across all categories and severities
- **Per-Class Precision, Recall, and F1**
- **Confusion Matrices** for both category and priority tasks
- **Learned Soft-Voting Weights** for all 6 classifiers

### Recommended External Datasets for Retraining:
- **BanglaPSG Dataset:** Comprehensive public-service grievance dataset in Bangla (CC BY 4.0)
- **RDD2022 (Road Damage Dataset):** Road surface damage benchmark
- **Roadway Flooding Image Dataset:** Urban waterlogging and drainage benchmark

---

## 📂 Project Structure

```text
├── app/                        # Next.js App Router (Bilingual UI & Dashboards)
│   ├── auth.ts                 # Civic platform user authentication handlers
│   ├── layout.tsx              # Root HTML layout with font tokens & themes
│   ├── page.tsx                # Main citizen triage & admin operations portal
│   └── globals.css             # Theme tokens, dark mode, high-contrast styles
├── build/                      # Build plugins & bundling utilities
│   └── nagarai-vite-plugin.ts  # NagarAI custom production build plugin
├── components/                 # Reusable UI component library
│   ├── LocationMap.tsx         # Leaflet interactive ward map & GIS selector
│   └── ui/                     # Accessible UI primitives & charts
├── data/                       # Benchmark civic complaints datasets (CSV/JSON)
├── db/                         # Drizzle schema & Cloudflare D1 bindings
├── lib/                        # Core application business logic
│   ├── ensemble.ts             # Portable 6-model in-browser inference engine
│   └── api.ts                  # Resilient API client with automatic fallback
├── ml/                         # Machine Learning source code
│   ├── artifacts/              # Serialized joblib weights & metrics.json
│   └── nagarai_ml/             # Scikit-learn trainers & FastAPI application
├── tests/                      # Automated regression & component test suite
├── package.json                # Project dependencies & build scripts
└── vite.config.ts              # Vite & Cloudflare runtime configuration
```

---

## 👥 Team EvolutionX

Developed with passion by **Team EvolutionX** for Bangladesh Civic Innovation:

* **Estiuk Arafat Arnob** — *Team Lead & Architecture*
* **Md. Riyad Hasan** — *Machine Learning & Data Pipeline*
* **Abubakkar Siddik** — *Frontend Engineering & GIS Systems*

📞 **Contact / Inquiry:** `+8801313602221`  
🌐 **Project Showcase:** *NagarAI BD Civic Intelligence Platform*

---

## ⚖️ License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">
<sub>Built with pride for a smarter, more responsive Bangladesh 🇧🇩</sub>
</div>
<!-- Refinement 119: perf(ml): cache parsed vocabulary tokens for fast client-side inference -->
<!-- Refinement 128: style(ui): update accent color palette for civic trust branding -->
<!-- Refinement 137: feat(gis): add dhaka north city corporation ward 19 boundary data -->
