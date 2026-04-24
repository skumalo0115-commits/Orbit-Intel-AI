import os
import tempfile
from pathlib import Path
from urllib.request import Request, urlopen

from docx import Document as DocxDocument
from PIL import Image


class TextExtractor:
    @staticmethod
    def extract(file_path: str) -> str:
        if file_path.startswith("http://") or file_path.startswith("https://"):
            return TextExtractor._extract_remote(file_path)

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
    def _extract_remote(file_url: str) -> str:
        suffix = Path(file_url.split("?", 1)[0]).suffix.lower()
        headers = {}
        blob_token = os.getenv("BLOB_READ_WRITE_TOKEN", "").strip()
        if ".private.blob.vercel-storage.com/" in file_url and blob_token:
            headers["Authorization"] = f"Bearer {blob_token}"

        request = Request(file_url, headers=headers)
        with urlopen(request) as response:
            file_bytes = response.read()

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(file_bytes)
            temp_path = Path(temp_file.name)

        try:
            return TextExtractor.extract(str(temp_path))
        finally:
            temp_path.unlink(missing_ok=True)

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
