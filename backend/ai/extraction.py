from pathlib import Path

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
        if suffix in {".txt", ".csv", ".rtf"}:
            return path.read_text(encoding="utf-8", errors="ignore")
        if suffix == ".doc":
            # Legacy .doc support: fallback to permissive text decode when dedicated parsers are unavailable.
            return path.read_bytes().decode("latin-1", errors="ignore")
        if suffix in {".png", ".jpg", ".jpeg"}:
            return TextExtractor._extract_image(path)
        raise ValueError("Unsupported file type")

    @staticmethod
    def _extract_pdf(path: Path) -> str:
        lines: list[str] = []
        import fitz

        with fitz.open(str(path)) as pdf:
            for page in pdf:
                lines.append(page.get_text("text") or "")
        return "\n".join(lines).strip()

    @staticmethod
    def _extract_docx(path: Path) -> str:
        doc = DocxDocument(str(path))
        return "\n".join(p.text for p in doc.paragraphs).strip()

    @staticmethod
    def _extract_image(path: Path) -> str:
        try:
            import easyocr

            reader = easyocr.Reader(["en"], gpu=False)
            result = reader.readtext(str(path), detail=0)
            return " ".join(result).strip()
        except Exception:
            try:
                import pytesseract

                image = Image.open(path)
                return pytesseract.image_to_string(image).strip()
            except Exception:
                return ""
