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

    def analyze(self, text: str) -> dict[str, Any]:
        trimmed = (text or "")[:3000]
        if not trimmed.strip():
            return {
                "summary": "No readable text detected.",
                "classification": "Unknown",
                "entities": [],
                "embeddings": [],
                "insights": {
                    "word_count": 0,
                    "confidence": 0.0,
                    "detected_skills": [],
                    "recommended_professions": [],
                    "improvement_areas": [],
                    "strengths": [],
                    "profession_scores": [],
                },
            }

        summary_seed = self._summarize(trimmed)
        classification = self._classify(trimmed)
        entities = self._entities(trimmed)
        career = self._career_insights(trimmed, entities)
        summary = self._compose_career_summary(summary_seed, career)
        embedding = self._embedding(summary or trimmed)

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

    def _summarize(self, text: str) -> str:
        if self.fast_mode:
            lines = [line.strip() for line in text.splitlines() if line.strip()]
            if lines:
                return " ".join(lines[:4])[:700]
            return " ".join(text.split()[:120])

        try:
            out = self.summarizer(text, max_length=130, min_length=40, do_sample=False)
            return out[0]["summary_text"]
        except Exception:
            return " ".join(text.split()[:120])

    def _classify(self, text: str) -> str:
        content = text.lower()

        if self.fast_mode:
            if "invoice" in content:
                return "Invoice"
            if "agreement" in content or "contract" in content:
                return "Contract"
            if "financial" in content or "balance" in content:
                return "Financial document"
            if "curriculum" in content or "resume" in content or "cv" in content:
                return "CV"
            cv_signals = ["education", "experience", "skills", "projects", "objective", "linkedin", "certification"]
            if sum(1 for signal in cv_signals if signal in content) >= 2:
                return "CV"
            return "Unknown"

        try:
            out = self.classifier(text, self.labels)
            return out["labels"][0]
        except Exception:
            if "invoice" in content:
                return "Invoice"
            if "agreement" in content or "contract" in content:
                return "Contract"
            if "financial" in content or "balance" in content:
                return "Financial document"
            if "curriculum" in content or "resume" in content or "cv" in content:
                return "CV"
            cv_signals = ["education", "experience", "skills", "projects", "objective", "linkedin", "certification"]
            if sum(1 for signal in cv_signals if signal in content) >= 2:
                return "CV"
            return "Unknown"

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
            return [
                {"text": e["word"], "type": e["entity_group"], "score": float(e["score"])}
                for e in self.ner(text)
            ]
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

    def _career_insights(self, text: str, entities: list[dict[str, Any]]) -> dict[str, Any]:
        content = text.lower()
        profile_map = {
            "Software Engineer": ["python", "java", "javascript", "react", "node", "api", "git", "c++"],
            "Data Analyst": ["sql", "excel", "power bi", "tableau", "analytics", "reporting"],
            "Data Scientist": ["machine learning", "tensorflow", "pytorch", "statistics", "pandas"],
            "Electrical Engineer": ["electrical", "circuit", "power systems", "autocad", "plc", "renewable"],
            "Mechanical Engineer": ["mechanical", "cad", "solidworks", "manufacturing", "thermodynamics"],
            "Civil Engineer": ["civil", "structural", "construction", "survey", "autocad", "infrastructure"],
            "Project Manager": ["project management", "pmp", "scrum", "stakeholder", "risk management"],
            "Marketing Specialist": ["marketing", "seo", "campaign", "branding", "social media"],
            "Financial Analyst": ["finance", "accounting", "budget", "forecast", "valuation"],
            "Healthcare Professional": ["patient", "clinical", "healthcare", "nursing", "medical"],
            "Teacher / Educator": ["teaching", "curriculum", "classroom", "education", "assessment"],
            "Operations Specialist": ["operations", "supply chain", "logistics", "process improvement"],
        }

        detected_skills = sorted({skill for skills in profile_map.values() for skill in skills if skill in content})

        scored_profiles: list[tuple[str, int, list[str]]] = []
        for profile, skills in profile_map.items():
            matched = [skill for skill in skills if skill in content]
            if matched:
                scored_profiles.append((profile, len(matched), matched))

        scored_profiles.sort(key=lambda pair: pair[1], reverse=True)

        if not scored_profiles:
            profession_scores = [{"name": "General Professional Role", "score": 60, "reason": "Insufficient explicit domain signals in CV text."}]
            recommended_professions = ["General Professional Role"]
        else:
            max_score = max(score for _, score, _ in scored_profiles)
            top = scored_profiles[:3]
            profession_scores = []
            for name, score, matched in top:
                pct = int(65 + ((score / max_score) * 30)) if max_score > 0 else 65
                pct = max(60, min(98, pct))
                profession_scores.append(
                    {
                        "name": name,
                        "score": pct,
                        "reason": f"Matched signals: {', '.join(matched[:4])}",
                    }
                )
            recommended_professions = [item["name"] for item in profession_scores]

        top_profile = recommended_professions[0]
        required_for_top = profile_map.get(top_profile, [])
        missing_for_top = [skill for skill in required_for_top if skill not in detected_skills][:4]

        return {
            "recommended_professions": recommended_professions,
            "profession_scores": profession_scores,
            "missing_for_top": missing_for_top,
            "detected_skills": detected_skills[:6],
        }

    def _compose_career_summary(self, base_summary: str, career: dict[str, Any]) -> str:
        top_roles = career.get("recommended_professions", [])[:2]
        missing = career.get("missing_for_top", [])[:3]
        detected = career.get("detected_skills", [])[:4]

        role_sentence = f"Top-fit career direction: {', '.join(top_roles)}." if top_roles else "Top-fit career direction: General Professional Role."
        strengths_sentence = (
            f"Strong signals from your CV include: {', '.join(detected)}."
            if detected
            else "Your CV shows foundational potential that can be strengthened with clearer technical outcomes."
        )
        improve_sentence = (
            f"To improve your match quality, focus next on: {', '.join(missing)}."
            if missing
            else "To improve your profile, add measurable project outcomes, practical certifications, and role-specific tools."
        )

        return f"{base_summary} {role_sentence} {strengths_sentence} {improve_sentence}".strip()


ai_pipeline = AIPipeline()
