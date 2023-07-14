from pdfminer.high_level import extract_text

text = extract_text("C:/_personal-projects/pentimentor/nieuwsartikel/artikel.pdf")
print(text)