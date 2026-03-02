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

    def _extract_cv_signals(self, text: str) -> dict[str, Any]:
        lower = text.lower()

        years_found = [int(match) for match in re.findall(r"(\d{1,2})\+?\s*(?:years|yrs)", lower)]
        years_experience = max(years_found) if years_found else 0

        quantified_impacts = re.findall(r"\b\d+(?:\.\d+)?%\b|\$\s?\d+[\d,]*|\b\d+\s*(?:k|m|million|billion)\b", lower)
        achievement_lines = [line.strip() for line in text.splitlines() if re.search(r"\b(increased|improved|reduced|built|delivered|launched|automated|optimized)\b", line.lower())]

        section_flags = {
            "has_projects": bool(re.search(r"\bprojects?\b", lower)),
            "has_certifications": bool(re.search(r"\b(certifications?|certificate|coursera|udemy|aws certified|azure certified|google certified)\b", lower)),
            "has_education": bool(re.search(r"\b(bachelor|master|phd|degree|university|college)\b", lower)),
        }

        soft_signals = [
            label
            for label, words in {
                "communication": ["communication", "presentation", "stakeholder"],
                "leadership": ["led", "managed", "mentored", "supervised"],
                "problem_solving": ["solved", "optimized", "improved", "debugged"],
                "collaboration": ["team", "cross-functional", "collaborated"],
            }.items()
            if any(word in lower for word in words)
        ]

        return {
            "years_experience": years_experience,
            "quantified_impact_count": len(quantified_impacts),
            "achievement_evidence_count": len(achievement_lines),
            "soft_signals": soft_signals,
            **section_flags,
        }

    def _career_insights(self, text: str, profile_context: dict[str, str], research: dict[str, Any] | None = None) -> dict[str, Any]:
        content = text.lower()
        skills = (profile_context.get("skills") or "").lower()
        target_job_title = (profile_context.get("target_job_title") or "").lower().strip()
        target_job_description = (profile_context.get("target_job_description") or "").lower()

        research_expectations = [str(item).lower() for item in ((research or {}).get("key_expectations") or [])]

        stop_words = {
            "and", "or", "and/or", "the", "for", "with", "from", "your", "role", "job", "that", "this", "have", "will", "using", "into", "are", "to", "of", "in", "on", "at", "as", "etc",
            "junior", "senior", "mid", "entry", "level", "developer",
        }
        requirement_blob = " ".join(part for part in [target_job_title, target_job_description, skills, " ".join(research_expectations)] if part.strip())
        raw_terms = [kw.strip().lower() for kw in re.findall(r"[a-zA-Z][a-zA-Z+.#/-]{2,}", requirement_blob)]
        requirement_terms = [
            kw
            for kw in raw_terms
            if kw not in stop_words and "/" not in kw and not kw.endswith("/") and not kw.startswith("/")
        ]
        requirement_terms = list(dict.fromkeys(requirement_terms))[:90]

        cv_signals = self._extract_cv_signals(text)
        matched_requirements = [kw for kw in requirement_terms if kw in content]
        missing_requirements = [kw for kw in requirement_terms if kw not in content]
        requirement_fit_percent = int((len(matched_requirements) / max(1, len(requirement_terms))) * 100) if requirement_terms else 0

        scored_profiles: list[tuple[str, int, list[str], list[str], list[str]]] = []
        for profile, role_keywords in self.profile_map.items():
            matched_cv = [kw for kw in role_keywords if kw in content]
            matched_skills = [kw for kw in role_keywords if kw in skills]
            matched_to_target = [kw for kw in role_keywords if kw in requirement_terms]
            cv_target_overlap = [kw for kw in matched_cv if kw in requirement_terms]

            evidence_bonus = min(12, cv_signals["quantified_impact_count"] * 2) + min(10, cv_signals["achievement_evidence_count"])
            score = (len(matched_cv) * 16) + (len(cv_target_overlap) * 11) + (len(matched_skills) * 6) + (len(matched_to_target) * 5) + evidence_bonus

            if score > 0:
                reasons = list(dict.fromkeys((cv_target_overlap + matched_cv + matched_skills)))[:8]
                missing = [kw for kw in role_keywords if kw not in set(matched_cv + matched_skills)][:8]
                scored_profiles.append((profile, score, reasons, missing, matched_cv[:8]))

        scored_profiles.sort(key=lambda pair: pair[1], reverse=True)

        if not scored_profiles:
            return {
                "recommended_professions": ["General Professional Role"],
                "profession_scores": [{"name": "General Professional Role", "score": 55, "reason": "Insufficient role-specific evidence found in CV text."}],
                "missing_for_top": ["role-specific tools", "project outcomes", "quantified impact"],
                "transferable_strengths": cv_signals["soft_signals"],
                "target_alignment": "Unable to confidently map your CV to a specific target role due to limited evidence.",
                "target_fit_percent": max(45, requirement_fit_percent),
                "cv_strengths_for_target": ["General profile detected"],
                "cv_gaps_for_target": missing_requirements[:6] or ["target role keywords", "project depth", "impact metrics"],
                "alternative_role": "Business Analyst",
                "cv_signal_quality": cv_signals,
                "research_query": (research or {}).get("query", ""),
                "research_source": (research or {}).get("source", ""),
            }

        top = scored_profiles[:3]
        max_score = max(score for _, score, _, _, _ in top)

        profession_scores: list[dict[str, Any]] = []
        for name, score, reason_terms, _, matched_cv in top:
            normalized = int((score / max_score) * 100) if max_score else 55
            fit = int((normalized * 0.75) + (requirement_fit_percent * 0.25)) if requirement_terms else normalized
            fit = max(48, min(97, fit))
            signal = ", ".join((reason_terms or matched_cv)[:6]) or "general domain alignment"
            profession_scores.append({"name": name, "score": fit, "reason": f"CV evidence aligns with {name} through: {signal}."})

        best_role = profession_scores[0]["name"]
        best_score = profession_scores[0]["score"]

        title_terms = [t for t in re.findall(r"[a-zA-Z][a-zA-Z+.#/-]{2,}", target_job_title) if t not in stop_words]
        target_profile = ""
        if title_terms:
            ranked_targets = sorted(
                self.profile_map.keys(),
                key=lambda profile: sum(1 for term in title_terms if term in profile.lower() or term in " ".join(self.profile_map[profile])),
                reverse=True,
            )
            if ranked_targets:
                target_profile = ranked_targets[0]

        target_role_score = None
        if target_profile:
            for entry in profession_scores:
                if entry["name"] == target_profile:
                    target_role_score = entry["score"]
                    break

        if target_role_score is None:
            target_role_score = int((requirement_fit_percent * 0.8) + min(20, cv_signals["quantified_impact_count"] * 3 + cv_signals["achievement_evidence_count"]))

        target_role_score = max(35, min(96, target_role_score))

        target_alignment = (
            f"Target role fit is {target_role_score}% based on matched requirements ({len(matched_requirements)}) vs missing requirements ({len(missing_requirements)}), "
            f"plus evidence quality signals from the CV."
        )

        cv_strengths = list(dict.fromkeys(top[0][4] + matched_requirements))[:6]
        cv_gaps = list(dict.fromkeys(missing_requirements + top[0][3]))[:6]

        if target_role_score >= 78:
            alternative_role = "Not required — target role already matches strongly"
        else:
            alternative_candidates = [item["name"] for item in profession_scores if item["name"] != target_profile and item["score"] >= 60]
            alternative_role = alternative_candidates[0] if alternative_candidates else best_role

        return {
            "recommended_professions": [item[0] for item in top],
            "profession_scores": profession_scores,
            "missing_for_top": top[0][3],
            "transferable_strengths": cv_signals["soft_signals"][:5],
            "target_alignment": target_alignment,
            "target_fit_percent": target_role_score,
            "cv_strengths_for_target": cv_strengths or ["role-relevant terminology"],
            "cv_gaps_for_target": cv_gaps or ["quantified outcomes", "role-specific portfolio"],
            "matched_requirements": matched_requirements[:10],
            "missing_requirements": missing_requirements[:10],
            "alternative_role": alternative_role,
            "cv_signal_quality": cv_signals,
            "target_job_title": profile_context.get("target_job_title") or "",
            "research_query": (research or {}).get("query", ""),
            "research_source": (research or {}).get("source", ""),
        }

    def _compose_career_summary(self, career: dict[str, Any], profile_context: dict[str, str], research: dict[str, Any] | None = None) -> str:
        top_roles = career.get("recommended_professions", [])[:3]
        top_scores = career.get("profession_scores", [])
        cv_strengths = career.get("cv_strengths_for_target", [])[:5]
        matched_requirements = career.get("matched_requirements", [])[:6]
        missing_requirements = career.get("missing_requirements", [])[:6]
        alternative_role = career.get("alternative_role", "General Professional Role")

        target_job_title = (profile_context.get("target_job_title") or "").strip() or "your target role"
        top_score = top_scores[0]["score"] if top_scores else 55
        top_role = top_scores[0]["name"] if top_scores else "General Professional Role"

        target_fit = career.get("target_fit_percent", top_score)
        readiness = "Strong" if target_fit >= 82 else "Promising" if target_fit >= 68 else "Needs Improvement"

        cv_signal_quality = career.get("cv_signal_quality", {})
        years = cv_signal_quality.get("years_experience", 0)
        impacts = cv_signal_quality.get("quantified_impact_count", 0)
        project_flag = cv_signal_quality.get("has_projects", False)
        cert_flag = cv_signal_quality.get("has_certifications", False)

        recommendation_steps: list[str] = []
        if impacts < 2:
            recommendation_steps.append("Add 3–5 quantified achievement bullets (%, $, time saved, growth) under recent roles")
        if not project_flag:
            recommendation_steps.append("Add a projects section that mirrors the target role stack and business outcomes")
        if missing_requirements:
            recommendation_steps.append(f"Close the most important requirement gaps first: {', '.join(missing_requirements[:3])}")
        if not cert_flag and top_score < 75:
            recommendation_steps.append("Add one role-relevant certification to strengthen credibility")
        if years <= 1:
            recommendation_steps.append("Prepare portfolio walkthroughs and STAR interview stories to compensate for limited experience")

        if not recommendation_steps:
            recommendation_steps.append("Focus on interview depth: prepare technical trade-off explanations and impact stories for each key project")

        top_matches_text = ", ".join(f"{item['name']} ({item['score']}%)" for item in top_scores[:3]) if top_scores else ", ".join(top_roles)

        bullets = [
            f"- Target Role Analysed: {target_job_title}.",
            f"- Fit Decision: {readiness} fit ({target_fit}%). The closest evidence-backed role from your CV is {top_role}.",
            f"- Top Role Matches: {top_matches_text}.",
            f"- Strongest Evidence Found in CV: {', '.join(cv_strengths) if cv_strengths else 'role-relevant terms were limited in the uploaded CV text'}.",
            f"- Requirement Coverage: matched -> {', '.join(matched_requirements) if matched_requirements else 'few explicit matches'}; missing -> {', '.join(missing_requirements) if missing_requirements else 'no major requirement gaps detected'}.",
            f"- Alternative Role Recommendation: {alternative_role}.",
            f"- Immediate Improvement Plan: {'; '.join(recommendation_steps)}.",
        ]

        research_summary = ((research or {}).get("summary") or "").strip()
        if research_summary:
            bullets.append(f"- Market Context Signal: {research_summary[:260]}.")

        return "\n".join(bullets).strip()


ai_pipeline = AIPipeline()
