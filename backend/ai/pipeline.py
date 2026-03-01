from functools import cached_property
from typing import Any
import os
import re

import numpy as np
from sentence_transformers import SentenceTransformer
from transformers import pipeline


class AIPipeline:
    labels = ["Invoice", "CV", "Contract", "Report", "Financial document", "Unknown"]

    def __init__(self) -> None:
        self.fast_mode = os.getenv("AI_FAST_MODE", "1").lower() not in {"0", "false", "no"}

        self.profile_map: dict[str, list[str]] = {
            "Software Engineer": ["python", "java", "javascript", "react", "node", "api", "git", "c++", "software", "backend", "frontend"],
            "Data Analyst": ["sql", "excel", "power bi", "tableau", "analytics", "reporting", "dashboard", "kpi", "data cleaning"],
            "Data Scientist": ["machine learning", "tensorflow", "pytorch", "statistics", "pandas", "model", "ai", "nlp"],
            "DevOps Engineer": ["docker", "kubernetes", "ci/cd", "jenkins", "linux", "terraform", "aws", "azure", "gcp"],
            "Cloud Engineer": ["aws", "azure", "gcp", "cloud", "infrastructure", "network", "iam", "serverless"],
            "Cybersecurity Analyst": ["security", "soc", "siem", "risk", "vulnerability", "incident response", "iso 27001", "compliance"],
            "QA Engineer": ["testing", "qa", "selenium", "cypress", "test cases", "automation", "quality assurance"],
            "UI/UX Designer": ["figma", "wireframe", "prototype", "ux", "ui", "design system", "user research"],
            "Electrical Engineer": ["electrical", "circuit", "power systems", "autocad", "plc", "renewable", "instrumentation"],
            "Mechanical Engineer": ["mechanical", "cad", "solidworks", "manufacturing", "thermodynamics", "maintenance"],
            "Civil Engineer": ["civil", "structural", "construction", "survey", "autocad", "infrastructure", "site"],
            "Project Manager": ["project management", "pmp", "scrum", "stakeholder", "risk management", "timeline", "budget"],
            "Product Manager": ["product", "roadmap", "user story", "stakeholder", "market research", "go-to-market", "backlog"],
            "Business Analyst": ["business analysis", "requirements", "process mapping", "uml", "sql", "stakeholder", "gap analysis"],
            "Operations Specialist": ["operations", "supply chain", "logistics", "process improvement", "lean", "inventory", "procurement"],
            "Procurement Specialist": ["procurement", "vendor", "sourcing", "rfq", "negotiation", "contract management", "supply"],
            "Financial Analyst": ["finance", "accounting", "budget", "forecast", "valuation", "financial modelling", "excel"],
            "Accountant": ["accounting", "bookkeeping", "reconciliation", "payroll", "tax", "ifrs", "ledger"],
            "Auditor": ["audit", "internal controls", "compliance", "risk", "financial statements", "sox"],
            "Marketing Specialist": ["marketing", "seo", "campaign", "branding", "social media", "google ads", "content"],
            "Sales Representative": ["sales", "lead generation", "crm", "negotiation", "pipeline", "client acquisition"],
            "Customer Success Manager": ["customer success", "onboarding", "retention", "account management", "nps", "client support"],
            "HR Specialist": ["human resources", "recruitment", "talent acquisition", "onboarding", "employee relations", "hris"],
            "Administrative Officer": ["administration", "scheduling", "documentation", "office management", "coordination", "support"],
            "Executive Assistant": ["calendar", "executive support", "meeting coordination", "travel", "minutes", "stakeholder communication"],
            "Legal Associate": ["legal", "contract", "compliance", "litigation", "case", "regulatory"],
            "Healthcare Professional": ["patient", "clinical", "healthcare", "nursing", "medical", "treatment", "hospital"],
            "Teacher / Educator": ["teaching", "curriculum", "classroom", "education", "assessment", "lesson planning"],
            "Research Analyst": ["research", "methodology", "literature", "analysis", "report writing", "survey"],
        }

    @cached_property
    def classifier(self):
        return pipeline("zero-shot-classification", model="distilbert-base-uncased")

    @cached_property
    def summarizer(self):
        return pipeline("summarization", model="facebook/bart-large-cnn")

    @cached_property
    def ner(self):
        return pipeline("ner", model="dslim/bert-base-NER", aggregation_strategy="simple")

    @cached_property
    def embedder(self):
        return SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

    def analyze(self, text: str, profile_context: dict[str, str] | None = None) -> dict[str, Any]:
        trimmed = (text or "")[:4500]
        if not trimmed.strip():
            return {
                "summary": "The CV could not be read clearly. Add a structured profile, experience with measurable outcomes, and skills aligned to your target role.",
                "classification": "Unknown",
                "entities": [],
                "embeddings": [],
                "insights": {
                    "word_count": 0,
                    "entity_count": 0,
                    "contains_financial_signals": False,
                    "recommended_professions": ["General Professional Role"],
                    "profession_scores": [{"name": "General Professional Role", "score": 60, "reason": "Limited readable signals found."}],
                },
            }

        classification = self._classify(trimmed)
        entities = self._entities(trimmed)
        career = self._career_insights(trimmed, profile_context or {})
        summary = self._compose_career_summary(career, profile_context or {})
        embedding = self._embedding(summary)

        insights = {
            "word_count": len(trimmed.split()),
            "entity_count": len(entities),
            "contains_financial_signals": any("$" in token for token in trimmed.split()),
            "recommended_professions": career["recommended_professions"],
            "profession_scores": career["profession_scores"],
        }
        return {
            "summary": summary,
            "classification": classification,
            "entities": entities,
            "embeddings": embedding,
            "insights": insights,
        }

    def _classify(self, text: str) -> str:
        content = text.lower()

        if self.fast_mode:
            role_hits = sum(1 for keywords in self.profile_map.values() for kw in keywords if kw in content)
            if role_hits >= 3 or "curriculum vitae" in content or "resume" in content:
                return "CV"
            if "invoice" in content:
                return "Invoice"
            if "agreement" in content or "contract" in content:
                return "Contract"
            if "financial" in content or "balance" in content:
                return "Financial document"
            return "Unknown"

        try:
            out = self.classifier(text, self.labels)
            return out["labels"][0]
        except Exception:
            return "CV" if "experience" in content and "education" in content else "Unknown"

    def _entities(self, text: str) -> list[dict[str, Any]]:
        if self.fast_mode:
            entities: list[dict[str, Any]] = []
            email_match = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
            phone_match = re.search(r"\+?\d[\d\s\-()]{7,}\d", text)
            linkedin_match = re.search(r"linkedin\.com/[^\s]+", text, re.IGNORECASE)
            for matched, entity_type in (
                (email_match.group(0) if email_match else None, "EMAIL"),
                (phone_match.group(0) if phone_match else None, "PHONE"),
                (linkedin_match.group(0) if linkedin_match else None, "LINK"),
            ):
                if matched:
                    entities.append({"text": matched, "type": entity_type, "score": 0.95})
            return entities

        try:
            return [{"text": e["word"], "type": e["entity_group"], "score": float(e["score"])} for e in self.ner(text)]
        except Exception:
            return []

    def _embedding(self, text: str) -> list[float]:
        if self.fast_mode:
            return []
        try:
            vector = self.embedder.encode(text)
            return np.asarray(vector).astype(float).tolist()
        except Exception:
            return []

    def _career_insights(self, text: str, profile_context: dict[str, str]) -> dict[str, Any]:
        content = text.lower()
        interests = (profile_context.get("interests") or "").lower()
        skills = (profile_context.get("skills") or "").lower()

        transferable_keywords = {
            "communication": ["communication", "presentation", "stakeholder"],
            "leadership": ["lead", "managed", "supervised", "mentored"],
            "delivery": ["delivered", "launched", "implemented", "improved"],
            "analytics": ["analyzed", "analysis", "insight", "kpi"],
            "collaboration": ["team", "collaborated", "cross-functional"],
        }

        scored_profiles: list[tuple[str, int, list[str], list[str]]] = []
        for profile, role_keywords in self.profile_map.items():
            matched = [kw for kw in role_keywords if kw in content]
            interest_matched = [kw for kw in role_keywords if kw in interests]
            skill_matched = [kw for kw in role_keywords if kw in skills]

            score = len(matched) * 12 + len(interest_matched) * 8 + len(skill_matched) * 10
            if score > 0:
                reason_terms = (matched + interest_matched + skill_matched)[:5]
                missing = [kw for kw in role_keywords if kw not in set(matched + skill_matched)][:4]
                scored_profiles.append((profile, score, reason_terms, missing))

        scored_profiles.sort(key=lambda pair: pair[1], reverse=True)

        if not scored_profiles:
            return {
                "recommended_professions": ["General Professional Role"],
                "profession_scores": [{"name": "General Professional Role", "score": 60, "reason": "Profile signals are broad; strengthen role-specific evidence and measurable outcomes."}],
                "missing_for_top": ["measurable achievements", "role-specific tools", "certification"],
                "transferable_strengths": [],
            }

        top = scored_profiles[:3]
        max_score = max(score for _, score, _, _ in top)

        profession_scores: list[dict[str, Any]] = []
        for name, score, reason_terms, _ in top:
            pct = int(62 + ((score / max_score) * 34)) if max_score > 0 else 62
            pct = max(60, min(97, pct))
            reason = "Signals aligned: " + ", ".join(reason_terms[:4]) if reason_terms else "Signals aligned with your profile."
            profession_scores.append({"name": name, "score": pct, "reason": reason})

        top_missing = top[0][3]

        transfer_hits = [
            label
            for label, words in transferable_keywords.items()
            if any(word in content for word in words)
        ]

        return {
            "recommended_professions": [item["name"] for item in profession_scores],
            "profession_scores": profession_scores,
            "missing_for_top": top_missing,
            "transferable_strengths": transfer_hits[:3],
        }

    def _compose_career_summary(self, career: dict[str, Any], profile_context: dict[str, str]) -> str:
        top_roles = career.get("recommended_professions", [])[:2]
        top_scores = career.get("profession_scores", [])
        missing = career.get("missing_for_top", [])[:3]
        strengths = career.get("transferable_strengths", [])
        interests = (profile_context.get("interests") or "").strip()

        top_score = top_scores[0]["score"] if top_scores else 60
        readiness = "high" if top_score >= 85 else "strong" if top_score >= 75 else "developing"

        role_line = f"Your strongest current fit is in {', '.join(top_roles)}." if top_roles else "Your profile currently maps to a broad professional path."
        readiness_line = f"Your hiring readiness is {readiness}, based on role alignment signals and evidence depth in the CV."

        strengths_line = (
            f"Transferable strengths detected: {', '.join(strengths)}."
            if strengths
            else "To become more hireable, increase evidence of communication, delivery ownership, and cross-functional collaboration."
        )

        focus_line = (
            f"Priority focus areas to improve employability in your target track: {', '.join(missing)}."
            if missing
            else "Priority focus areas: measurable achievements, role-specific tooling, and practical certification evidence."
        )

        interest_line = (
            f"Given your stated interests ({interests}), prioritize portfolio projects and certifications directly tied to those domains."
            if interests
            else "Align your next projects with your desired domain and quantify impact in every role entry."
        )

        roadmap = "Practical plan: 30 days—close one skill gap; 60 days—ship a portfolio project; 90 days—publish quantified outcomes and interview-ready case studies."
        return " ".join([role_line, readiness_line, strengths_line, focus_line, interest_line, roadmap]).strip()


ai_pipeline = AIPipeline()
