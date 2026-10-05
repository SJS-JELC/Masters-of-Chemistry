from pathlib import Path
import hashlib
import pymupdf
project = Path(__file__).resolve().parents[3]
sources = [
    ("Olympiad 2011 R1 questions.pdf", "ecf2559086693609335c92ad4ce02a809980df9b8bf0d8a6dfed96eb7fefede7", [6,7], "question"),
    ("Olympiad 2011 R1 mark scheme.pdf", "79f2e4b385bdecead9d4f1451a569473e9215673034e1356cbe0a6fc4f2eaa80", [4], "scheme"),
]
for name, expected, pages, slug in sources:
    source = project.parents[1] / "resources" / "Olympiads" / name
    assert hashlib.sha256(source.read_bytes()).hexdigest() == expected
    with pymupdf.open(source) as doc:
        for number in pages:
            doc[number-1].get_pixmap(matrix=pymupdf.Matrix(1.5,1.5)).save(Path(__file__).parent / f"{slug}-{number}.png")
print("Immutable question pp6–7 and scheme p4 rendered; source SHA256 validated.")
