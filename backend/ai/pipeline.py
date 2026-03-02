from typing import Any
import json
import re
from urllib.parse import quote
from urllib.request import urlopen



class AIPipeline:
    labels = ["Invoice", "CV", "Contract", "Report", "Financial document", "Unknown"]

    def __init__(self) -> None:
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

    def analyze(self, text: str, profile_context: dict[str, str] | None = None) -> dict[str, Any]:
        trimmed = (text or "")[:9000]
        if not trimmed.strip():
            return {
                "summary": "The CV could not be read clearly. Add a structured profile, measurable achievements, and role-specific skills.",
                "classification": "Unknown",
                "entities": [],
                "embeddings": [],
                "insights": {
                    "word_count": 0,
                    "entity_count": 0,
                    "contains_financial_signals": False,
                    "analysis_provider": "builtin-ai",
                    "recommended_professions": ["General Professional Role"],
                    "profession_scores": [{"name": "General Professional Role", "score": 60, "reason": "Limited readable signals found."}],
                },
            }

        context = profile_context or {}

        try:
            entities = self._entities(trimmed)
            research = self._research_target_role(context)
            classification = self._classify(trimmed)
            career = self._career_insights(trimmed, context, research)
            summary = self._compose_career_summary(career, context, research)

            insights = {
                "word_count": len(trimmed.split()),
                "entity_count": len(entities),
                "contains_financial_signals": any("$" in token for token in trimmed.split()),
                "web_research": research,
                "analysis_provider": "builtin-ai",
                **career,
            }

            return {
                "summary": summary,
                "classification": classification,
                "entities": entities,
                "embeddings": [],
                "insights": insights,
            }
        except Exception as exc:  # noqa: BLE001
            fallback_career = {
                "recommended_professions": ["General Professional Role"],
                "profession_scores": [{"name": "General Professional Role", "score": 58, "reason": "Fallback analysis was used due to an internal scoring issue."}],
                "missing_for_top": ["quantified achievements", "role-specific keywords", "tools and frameworks"],
                "transferable_strengths": [],
                "target_alignment": "Fallback alignment generated due to a temporary analysis issue.",
                "target_fit_percent": 58,
                "cv_strengths_for_target": ["General professional profile detected"],
                "cv_gaps_for_target": ["target-role keyword coverage", "impact metrics", "evidence depth"],
                "research_query": "",
                "research_source": "",
            }
            return {
                "summary": (
                    "- Analysis ran in safe fallback mode due to a temporary internal issue.\n"
                    "- Please retry once; if the issue persists, review uploaded CV text quality and profile inputs.\n"
                    "- Improve role-specific keyword coverage, quantified achievements, and tools alignment for better match confidence."
                ),
                "classification": "CV",
                "entities": [],
                "embeddings": [],
                "insights": {
                    "word_count": len(trimmed.split()),
                    "entity_count": 0,
                    "contains_financial_signals": any("$" in token for token in trimmed.split()),
                    "analysis_provider": "builtin-ai",
                    "analysis_fallback_reason": f"internal-error: {exc}",
                    **fallback_career,
                },
            }

    def _classify(self, text: str) -> str:
        content = text.lower()
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

    def _entities(self, text: str) -> list[dict[str, Any]]:
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

    def _research_target_role(self, profile_context: dict[str, str]) -> dict[str, Any]:
        job_title = (profile_context.get("target_job_title") or "").strip()
        target_job_description = (profile_context.get("target_job_description") or "").strip()

        query = job_title or target_job_description[:80]
        if not query:
            return {"query": "", "summary": "", "source": "", "key_expectations": []}

        snippets: list[str] = []
        sources: list[str] = []
        expectations: list[str] = []

        try:
            wiki_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{quote(query)}"
            with urlopen(wiki_url, timeout=5) as response:  # noqa: S310
                payload = json.loads(response.read().decode("utf-8"))
            extract = (payload.get("extract") or "").strip()
            if extract:
                clean_extract = re.sub(r"\s+", " ", extract)
                snippets.append(clean_extract)
                page_source = payload.get("content_urls", {}).get("desktop", {}).get("page")
                if page_source:
                    sources.append(page_source)
                expectations.extend(
                    sentence.strip()
                    for sentence in re.split(r"(?<=[.!?])\s+", clean_extract)
                    if sentence.strip()
                )
        except Exception:
            pass

        try:
            ddg_url = f"https://api.duckduckgo.com/?q={quote(query + ' job requirements skills')}&format=json&no_html=1&skip_disambig=1"
            with urlopen(ddg_url, timeout=5) as response:  # noqa: S310
                ddg_payload = json.loads(response.read().decode("utf-8"))
            abstract = (ddg_payload.get("AbstractText") or "").strip()
            if abstract:
                snippets.append(re.sub(r"\s+", " ", abstract))
            abstract_url = (ddg_payload.get("AbstractURL") or "").strip()
            if abstract_url:
                sources.append(abstract_url)

            related_topics = ddg_payload.get("RelatedTopics") or []
            for topic in related_topics[:4]:
                text = (topic.get("Text") if isinstance(topic, dict) else "") or ""
                text = text.strip()
                if text:
                    expectations.append(text)
        except Exception:
            pass

        if target_job_description:
            expectations.extend(
                chunk.strip()
                for chunk in re.split(r"[.;\n]", target_job_description)
                if chunk.strip()
            )

        deduped_expectations: list[str] = []
        seen = set()
        for item in expectations:
            cleaned = re.sub(r"\s+", " ", item).strip()
            key = cleaned.lower()
            if cleaned and key not in seen:
                deduped_expectations.append(cleaned)
                seen.add(key)
            if len(deduped_expectations) >= 5:
                break

        summary = " ".join(snippets).strip()
        source = " | ".join(dict.fromkeys([src for src in sources if src]))

        return {
            "query": query,
            "summary": summary[:900],
            "source": source,
            "key_expectations": deduped_expectations,
        }

    def _career_insights(self, text: str, profile_context: dict[str, str], research: dict[str, Any] | None = None) -> dict[str, Any]:
        content = text.lower()
        skills = (profile_context.get("skills") or "").lower()
        target_job_title = (profile_context.get("target_job_title") or "").lower()
        target_job_description = (profile_context.get("target_job_description") or "").lower()
        research_summary = ((research or {}).get("summary") or "").lower()

        target_blob = " ".join(
            part
            for part in [target_job_title, target_job_description, skills, research_summary]
            if part.strip()
        )

        target_terms = [kw for kw in re.findall(r"[a-zA-Z][a-zA-Z+.#/-]{2,}", target_blob) if kw not in {"and", "the", "for", "with", "from", "your", "role", "job"}]
        target_unique = list(dict.fromkeys(target_terms))[:80]
        target_hits = [kw for kw in target_unique if kw in content]
        target_fit_percent = int((len(target_hits) / max(1, len(target_unique))) * 100) if target_unique else 0

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

            score = len(matched_cv) * 13 + len(matched_target) * 17 + len(matched_skills) * 12
            if score > 0:
                reason_terms = (matched_cv + matched_target + matched_skills)[:8]
                missing = [kw for kw in role_keywords if kw not in set(matched_cv + matched_skills)][:8]
                scored_profiles.append((profile, score, reason_terms, missing, matched_cv[:10], matched_target[:10]))

        scored_profiles.sort(key=lambda pair: pair[1], reverse=True)

        if not scored_profiles:
            return {
                "recommended_professions": ["General Professional Role"],
                "profession_scores": [{"name": "General Professional Role", "score": 58, "reason": "Profile signals are broad; add role-specific achievements and keywords."}],
                "missing_for_top": ["measurable achievements", "role-specific tools", "certification", "impact metrics"],
                "transferable_strengths": [],
                "target_alignment": "No strong alignment could be measured against a specific target role.",
                "target_fit_percent": target_fit_percent,
                "cv_strengths_for_target": ["General communication potential"],
                "cv_gaps_for_target": ["Target role keywords", "job-specific tools", "quantified impact"],
                "research_query": (research or {}).get("query", ""),
                "research_source": (research or {}).get("source", ""),
            }

        top = scored_profiles[:3]
        max_score = max(score for _, score, _, _, _, _ in top)

        profession_scores: list[dict[str, Any]] = []
        for name, score, reason_terms, _, _, _ in top:
            pct = int(55 + ((score / max_score) * 42)) if max_score > 0 else 58
            if target_fit_percent:
                pct = int((pct * 0.78) + (target_fit_percent * 0.22))
            pct = max(50, min(98, pct))
            signal = ", ".join(reason_terms[:6]) if reason_terms else "broad role alignment"
            reason = f"Signals aligned with CV and target context: {signal}."
            profession_scores.append({"name": name, "score": pct, "reason": reason})

        top_profile, _, _, top_missing, top_cv_hits, top_target_hits = top[0]

        transfer_hits = [
            label
            for label, words in transferable_keywords.items()
            if any(word in content for word in words)
        ]

        overlap = len(set(top_cv_hits).intersection(set(top_target_hits)))
        alignment_ratio = overlap / max(1, len(set(top_target_hits)))
        alignment_percent = int(((alignment_ratio * 70) + (target_fit_percent * 0.3)))
        target_alignment = (
            f"Target-role fit for {top_profile} is approximately {alignment_percent}%. "
            "This score combines CV evidence overlap with the requirements from your job title/description input."
        )

        cv_gaps_for_target = top_missing[:6] if top_missing else ["quantified achievements", "role-specific portfolio"]
        cv_strengths_for_target = top_cv_hits[:6] if top_cv_hits else ["general professional experience"]

        return {
            "recommended_professions": [item[0] for item in top],
            "profession_scores": profession_scores,
            "missing_for_top": top_missing,
            "transferable_strengths": transfer_hits[:5],
            "target_alignment": target_alignment,
            "target_fit_percent": alignment_percent,
            "cv_strengths_for_target": cv_strengths_for_target,
            "cv_gaps_for_target": cv_gaps_for_target,
            "target_job_title": profile_context.get("target_job_title") or "",
            "research_query": (research or {}).get("query", ""),
            "research_source": (research or {}).get("source", ""),
        }

    def _compose_career_summary(self, career: dict[str, Any], profile_context: dict[str, str], research: dict[str, Any] | None = None) -> str:
        top_roles = career.get("recommended_professions", [])[:2]
        top_scores = career.get("profession_scores", [])
        strengths = career.get("transferable_strengths", [])
        cv_strengths = career.get("cv_strengths_for_target", [])[:5]
        cv_gaps = career.get("cv_gaps_for_target", [])[:5]

        target_job_title = (profile_context.get("target_job_title") or "").strip()
        target_job_description = (profile_context.get("target_job_description") or "").strip()
        skills = (profile_context.get("skills") or "").strip()

        top_score = top_scores[0]["score"] if top_scores else 58
        readiness = "High" if top_score >= 85 else "Moderate" if top_score >= 70 else "Early-stage"

        research_summary = ((research or {}).get("summary") or "").strip()
        research_source = ((research or {}).get("source") or "").strip()
        research_expectations = (research or {}).get("key_expectations") or []

        bullets = [
            f"- Target Role: {target_job_title if target_job_title else 'Not provided explicitly; inferred from CV and job description context.'}",
            f"- Interview Readiness: {readiness} ({top_score}% match based on CV evidence vs target requirements).",
            f"- Best Role Matches: {', '.join(top_roles) if top_roles else 'No strong role detected yet.'}",
            f"- CV Strengths for this target: {', '.join(cv_strengths) if cv_strengths else 'General transferable strengths only; add stronger role-specific proof.'}",
            f"- Main Gaps to fix: {', '.join(cv_gaps) if cv_gaps else 'Quantified achievements, domain tools, and portfolio depth.'}",
            f"- Transferable Signals Detected: {', '.join(strengths) if strengths else 'Communication/ownership evidence should be strengthened in CV bullets.'}",
            f"- Job Description Coverage: {target_job_description[:320] if target_job_description else 'No job description provided; include one for precise requirement matching.'}",
            "- Action Plan: (1) Rewrite bullets with measurable impact, (2) align skills section to job requirements, (3) add relevant projects/certifications, (4) tailor CV headline to target title, (5) prepare interview stories proving each requirement.",
            f"- Skills Used in Analysis: {skills if skills else 'No explicit skills entered.'}",
            f"- Alignment Verdict: {career.get('target_alignment', 'Alignment could not be measured reliably.')}",
        ]

        if research_summary:
            bullets.append(f"- Role Research Signals: {research_summary}")
        if research_expectations:
            bullets.append(f"- Public Research Expectations: {'; '.join(research_expectations[:4])}.")
        if research_source:
            bullets.append(f"- Research Sources: {research_source}")

        return "\n".join(bullets).strip()


ai_pipeline = AIPipeline()
