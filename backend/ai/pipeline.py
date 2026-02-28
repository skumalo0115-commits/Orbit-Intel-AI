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
                "insights": {"word_count": 0, "confidence": 0.0},
            }

        summary = self._summarize(trimmed)
        classification = self._classify(trimmed)
        entities = self._entities(trimmed)
        embedding = self._embedding(summary or trimmed)
        insights = {
            "word_count": len(trimmed.split()),
            "entity_count": len(entities),
            "contains_financial_signals": any("$" in token for token in trimmed.split()),
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
            if "curriculum" in content or "resume" in content:
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


ai_pipeline = AIPipeline()
