from functools import cached_property
from typing import Any

import numpy as np
from sentence_transformers import SentenceTransformer
from transformers import pipeline


class AIPipeline:
    labels = ["Invoice", "CV", "Contract", "Report", "Financial document", "Unknown"]

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
        trimmed = (text or "")[:4000]
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
                },
            }

        summary = self._summarize(trimmed)
        classification = self._classify(trimmed)
        entities = self._entities(trimmed)
        embedding = self._embedding(summary or trimmed)
        career = self._career_insights(trimmed, entities)

        insights = {
            "word_count": len(trimmed.split()),
            "entity_count": len(entities),
            "contains_financial_signals": any("$" in token for token in trimmed.split()),
            "detected_skills": career["detected_skills"],
            "recommended_professions": career["recommended_professions"],
            "improvement_areas": career["improvement_areas"],
            "strengths": career["strengths"],
        }
        return {
            "summary": summary,
            "classification": classification,
            "entities": entities,
            "embeddings": embedding,
            "insights": insights,
        }

    def _summarize(self, text: str) -> str:
        try:
            out = self.summarizer(text, max_length=150, min_length=40, do_sample=False)
            return out[0]["summary_text"]
        except Exception:
            return " ".join(text.split()[:120])

    def _classify(self, text: str) -> str:
        try:
            out = self.classifier(text, self.labels)
            return out["labels"][0]
        except Exception:
            content = text.lower()
            if "invoice" in content:
                return "Invoice"
            if "curriculum" in content or "resume" in content or "cv" in content:
                return "CV"
            cv_signals = ["education", "experience", "skills", "projects", "objective", "linkedin", "certification"]
            if sum(1 for signal in cv_signals if signal in content) >= 2:
                return "CV"
            if "agreement" in content or "contract" in content:
                return "Contract"
            if "financial" in content or "balance" in content:
                return "Financial document"
            return "Unknown"

    def _entities(self, text: str) -> list[dict[str, Any]]:
        try:
            return [
                {"text": e["word"], "type": e["entity_group"], "score": float(e["score"])}
                for e in self.ner(text)
            ]
        except Exception:
            return []

    def _embedding(self, text: str) -> list[float]:
        try:
            vector = self.embedder.encode(text)
            return np.asarray(vector).astype(float).tolist()
        except Exception:
            return []

    def _career_insights(self, text: str, entities: list[dict[str, Any]]) -> dict[str, list[str]]:
        content = text.lower()
        profile_map = {
            "Software Engineer": ["python", "java", "javascript", "react", "node", "api", "git"],
            "Data Analyst": ["sql", "excel", "power bi", "tableau", "analytics", "reporting"],
            "Data Scientist": ["machine learning", "tensorflow", "pytorch", "statistics", "pandas"],
            "Cloud Engineer": ["aws", "azure", "gcp", "docker", "kubernetes", "devops"],
            "Product Manager": ["product", "roadmap", "stakeholder", "strategy", "agile"],
        }

        detected_skills = sorted(
            {
                skill
                for skills in profile_map.values()
                for skill in skills
                if skill in content
            }
        )

        scored_profiles: list[tuple[str, int]] = []
        for profile, skills in profile_map.items():
            score = sum(1 for skill in skills if skill in content)
            if score > 0:
                scored_profiles.append((profile, score))

        scored_profiles.sort(key=lambda pair: pair[1], reverse=True)
        recommended_professions = [name for name, _ in scored_profiles[:3]]

        if not recommended_professions:
            recommended_professions = ["General Technology Role"]

        top_profile = recommended_professions[0]
        required_for_top = profile_map.get(top_profile, [])
        missing_for_top = [skill for skill in required_for_top if skill not in detected_skills][:4]

        strengths = detected_skills[:6]
        if not strengths:
            strengths = [entity.get("text", "") for entity in entities[:4] if entity.get("text")]

        improvement_areas = [f"Build evidence of {skill.title()}" for skill in missing_for_top]
        if not improvement_areas:
            improvement_areas = [
                "Add measurable project outcomes to the CV",
                "Include certifications or proof of practical experience",
            ]

        return {
            "detected_skills": detected_skills,
            "recommended_professions": recommended_professions,
            "improvement_areas": improvement_areas,
            "strengths": strengths,
        }


ai_pipeline = AIPipeline()
