from pathlib import Path

import pdfplumber
import pytesseract
from docx import Document as DocxDocument
from PIL import Image


class TextExtractor:
    @staticmethod
    def extract(file_path: str) -> str:
        path = Path(file_path)
        suffix = path.suffix.lower()

        if suffix == ".pdf":
            return TextExtractor._extract_pdf(path)
        if suffix == ".docx":
            return TextExtractor._extract_docx(path)
        if suffix in {".txt", ".csv"}:
            return path.read_text(encoding="utf-8", errors="ignore")
        if suffix in {".png", ".jpg", ".jpeg"}:
            return TextExtractor._extract_image(path)
        raise ValueError("Unsupported file type")

    @staticmethod
    def _extract_pdf(path: Path) -> str:
        lines: list[str] = []
        with pdfplumber.open(str(path)) as pdf:
            for page in pdf.pages:
                lines.append(page.extract_text() or "")
        return "\n".join(lines).strip()

    @staticmethod
    def _extract_docx(path: Path) -> str:
        doc = DocxDocument(str(path))
        return "\n".join(p.text for p in doc.paragraphs).strip()

    @staticmethod
    def _extract_image(path: Path) -> str:
        image = Image.open(path)
        return pytesseract.image_to_string(image).strip()
