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
        profession = (profile_context.get("profession") or profile_context.get("interests") or "").lower()
        skills = (profile_context.get("skills") or "").lower()
        target_job_title = (profile_context.get("target_job_title") or "").lower()
        target_job_description = (profile_context.get("target_job_description") or "").lower()

        target_blob = " ".join(
            part
            for part in [interests, profession, target_job_title, target_job_description, skills]
            if part.strip()
        )

        transferable_keywords = {
            "communication": ["communication", "presentation", "stakeholder"],
            "leadership": ["lead", "managed", "supervised", "mentored"],
            "delivery": ["delivered", "launched", "implemented", "improved"],
            "analytics": ["analyzed", "analysis", "insight", "kpi"],
            "collaboration": ["team", "collaborated", "cross-functional"],
        }

        scored_profiles: list[tuple[str, int, list[str], list[str], list[str], list[str]]] = []
        for profile, role_keywords in self.profile_map.items():
            matched_cv = [kw for kw in role_keywords if kw in content]
            matched_target = [kw for kw in role_keywords if kw in target_blob]
            matched_skills = [kw for kw in role_keywords if kw in skills]

            score = len(matched_cv) * 14 + len(matched_target) * 16 + len(matched_skills) * 12
            if score > 0:
                reason_terms = (matched_cv + matched_target + matched_skills)[:6]
                missing = [kw for kw in role_keywords if kw not in set(matched_cv + matched_skills)][:6]
                scored_profiles.append((profile, score, reason_terms, missing, matched_cv[:8], matched_target[:8]))

        scored_profiles.sort(key=lambda pair: pair[1], reverse=True)

        if not scored_profiles:
            return {
                "recommended_professions": ["General Professional Role"],
                "profession_scores": [{"name": "General Professional Role", "score": 58, "reason": "Profile signals are broad; add role-specific achievements and keywords."}],
                "missing_for_top": ["measurable achievements", "role-specific tools", "certification", "impact metrics"],
                "transferable_strengths": [],
                "target_alignment": "No strong alignment could be measured against a specific target role.",
                "cv_strengths_for_target": ["General communication potential"],
                "cv_gaps_for_target": ["Target role keywords", "job-specific tools", "quantified impact"],
            }

        top = scored_profiles[:3]
        max_score = max(score for _, score, _, _, _, _ in top)

        profession_scores: list[dict[str, Any]] = []
        for name, score, reason_terms, _, matched_cv, matched_target in top:
            pct = int(58 + ((score / max_score) * 39)) if max_score > 0 else 58
            pct = max(55, min(98, pct))
            signal = ", ".join(reason_terms[:5]) if reason_terms else "broad role alignment"
            reason = f"Signals aligned with CV + target context: {signal}."
            profession_scores.append({"name": name, "score": pct, "reason": reason})

        top_profile, _, _, top_missing, top_cv_hits, top_target_hits = top[0]

        transfer_hits = [
            label
            for label, words in transferable_keywords.items()
            if any(word in content for word in words)
        ]

        alignment_ratio = len(set(top_cv_hits).intersection(set(top_target_hits))) / max(1, len(set(top_target_hits)))
        alignment_percent = int(alignment_ratio * 100)
        target_alignment = (
            f"Alignment with your target track ({top_profile}) is about {alignment_percent}%. "
            "This is based on overlap between CV evidence and the target profession/job requirements you entered."
        )

        cv_gaps_for_target = top_missing[:5] if top_missing else ["quantified achievements", "role-specific portfolio"]
        cv_strengths_for_target = top_cv_hits[:5] if top_cv_hits else ["general professional experience"]

        return {
            "recommended_professions": [item[0] for item in top],
            "profession_scores": profession_scores,
            "missing_for_top": top_missing,
            "transferable_strengths": transfer_hits[:4],
            "target_alignment": target_alignment,
            "cv_strengths_for_target": cv_strengths_for_target,
            "cv_gaps_for_target": cv_gaps_for_target,
            "target_job_title": profile_context.get("target_job_title") or "",
            "profession_input": profile_context.get("profession") or profile_context.get("interests") or "",
        }

    def _compose_career_summary(self, career: dict[str, Any], profile_context: dict[str, str]) -> str:
        top_roles = career.get("recommended_professions", [])[:2]
        top_scores = career.get("profession_scores", [])
        strengths = career.get("transferable_strengths", [])
        cv_strengths = career.get("cv_strengths_for_target", [])[:5]
        cv_gaps = career.get("cv_gaps_for_target", [])[:5]

        profession = (profile_context.get("profession") or profile_context.get("interests") or "").strip()
        target_job_title = (profile_context.get("target_job_title") or "").strip()
        target_job_description = (profile_context.get("target_job_description") or "").strip()
        skills = (profile_context.get("skills") or "").strip()

        top_score = top_scores[0]["score"] if top_scores else 58
        readiness = "high" if top_score >= 85 else "moderate-to-strong" if top_score >= 70 else "early-stage"

        target_line = (
            f"You are targeting the profession '{profession}' with a desired job title of '{target_job_title}'."
            if profession or target_job_title
            else "You did not provide a specific profession/job title, so analysis is based mostly on CV evidence."
        )

        match_line = (
            f"Current suitability for interview shortlisting is {readiness} (match score: {top_score}%)."
            " The AI compared your CV against your profession, skills, and target role requirements."
        )

        top_fit_line = (
            f"Best-fit roles right now: {', '.join(top_roles)}."
            if top_roles
            else "No clear top-fit role detected yet from current signals."
        )

        strengths_line = (
            f"Where your CV is currently strong for the target role: {', '.join(cv_strengths)}."
            if cv_strengths
            else "Current CV strengths are generic; add stronger role-specific examples."
        )

        transferable_line = (
            f"Transferable strengths detected: {', '.join(strengths)}."
            if strengths
            else "Increase evidence of communication, ownership, and delivery outcomes to improve interviewability."
        )

        improvement_line = (
            f"Critical improvements to become more hireable faster: {', '.join(cv_gaps)}."
            if cv_gaps
            else "Critical improvements: measurable outcomes, domain tooling, and portfolio proof."
        )

        requirements_line = (
            f"From your target job description, ensure your CV explicitly addresses: {target_job_description[:420]}."
            if target_job_description
            else "Add a target job description to get requirement-by-requirement matching advice."
        )

        actions_line = (
            f"Practical action plan: (1) align your skills section to {profession or 'your target field'}, "
            "(2) rewrite experience bullets with metrics and business impact, "
            "(3) add projects/certifications directly tied to the target role, "
            "(4) tailor your CV headline and summary to the job title, and "
            "(5) practice interview stories that prove each listed requirement."
        )

        skills_line = f"Skills context used in matching: {skills}." if skills else ""
        alignment_line = career.get("target_alignment", "")

        return " ".join(
            line
            for line in [
                target_line,
                match_line,
                top_fit_line,
                strengths_line,
                transferable_line,
                improvement_line,
                requirements_line,
                actions_line,
                skills_line,
                alignment_line,
            ]
            if line
        ).strip()


ai_pipeline = AIPipeline()
