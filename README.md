<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Formly AI

Formly AI is an AI-native decision intelligence platform that transforms traditional data collection into a high-integrity, evidence-aware assessment ecosystem. Unlike static survey tools, Formly AI bridges the gap between raw input and executive-ready insights by forcing a paradigm shift: **Design your outputs first, then let AI engineer the inquiry.**

## Core Pillars of the Platform

### The Assessment Architect
A sophisticated builder where users define strategic goals (e.g., "Audit regional alignment on carbon-neutrality"). The platform uses Gemini 3 Pro to work backward from these goals, generating optimized, weighted question sets and identifying the specific evidence respondents must acknowledge before answering.

### Evidence-Aware Workflows
High-stakes decisions require informed respondents. Formly integrates "Compulsory Evidence Review" into the flow, requiring users to demonstrate comprehension via AI-scored checks before their responses are captured and weighted.

### Adaptive Interview Engine
Instead of a fixed form, respondents engage with an intelligent agent. The platform uses real-time semantic analysis to identify brief or shallow answers, triggering adaptive follow-up probes to ensure narrative depth and clarity.

### Intelligence Hub
A command center for organizational health. It features cross-segment alignment mapping, strategic drift detection, and semantic outlier analysis. It identifies "Dissent Risks"—responses that conflict with core goals—and allows executives to audit the "Integrity Score" of their data.

### Predictive Sandbox
A decision-modeling environment where leaders can run Monte Carlo simulations. By adjusting "Strategic Levers" (like budget autonomy or hiring freezes), the engine predicts ROI and risk trends based on existing assessment data.

### The Marketplace
A global exchange for high-integrity assets, featuring sector-optimized templates (e.g., M&S Retail Awareness Quiz) and cryptographically verified evidence libraries.

## Technical & Aesthetic DNA

### Design System
A "Technical but Friendly" aesthetic using a Humanist sans-serif (Inter) typography system, minimal cool greys, and a signature formly-gradient (Purple-Pink-Orange) used for primary action states and intelligence-driven UI elements.

### Intelligence Layer
Deeply integrated with the Google Gemini API, utilizing Gemini 3 Pro for complex reasoning and Flash for low-latency conversational persistence.

### Data Integrity
A robust audit trail system ensures every change to assessment logic and every respondent comprehension score is logged, providing a verifiable "Governance Trail" for enterprise-level compliance.

### Architecture
Built on a modern React stack with Tailwind CSS, Recharts for high-density data visualization, and a Supabase-backed infrastructure designed for real-time semantic syncing.

---

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1fy16_v6GjWf9xvS-7FmGTlBxGhfOcWJY

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
