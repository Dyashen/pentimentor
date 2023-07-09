import subprocess, io, os, pypandoc
from datetime import date
import zipfile


markdown_file = "saved_files/file.md"
zip_filename = 'saved_files/simplified_docs.zip'
pdf_file = "saved_files/output.pdf"
docx_file = "saved_files/output.docx"
DATE_NOW = str(date.today())


class Creator():
    
    """"""
    def create_header(self, title, margin, fontsize, chosen_font, chosen_title_font, word_spacing, type_spacing):
        with open(markdown_file, 'w', encoding='utf-8') as f:
            f.write("---\n")
            f.write(f"title: {title}\n") 
            f.write(f"mainfont: {chosen_font}.ttf\n")
            f.write(f"titlefont: {chosen_title_font}.ttf\n")
            f.write(f'date: {DATE_NOW}\n')
            f.write(f'document: article\n')
            f.write(f'geometry: margin={margin}cm\n')
            f.write(f'fontsize: {fontsize}pt\n')
            f.write('header-includes:\n')
            f.write(f'- \spaceskip={word_spacing}cm\n')
            f.write(f'- \\usepackage{{setspace}}\n')
            f.write(f'- \{type_spacing}\n')
            f.write("---\n")

    """"""
    def generate_glossary(self, list):
        with open(markdown_file, 'a', encoding='utf-8') as f:
            f.write("---\n")
            f.write("# Woordenlijst\n")
            f.write("| Woord | Soort | Definitie |\n")
            f.write("| --- | --- | --- |\n")
            for word in list.keys(): 
                f.write(f"| {word} | {list[word]['type']} | {list[word]['definition']} |\n")

    def generate_simplification(self, full_text):
        with open(markdown_file,'a', encoding="utf-8", errors="surrogateescape") as f:
            title = 'Hoofdstuk'
            f.write('\n\n')
            f.write(f'## {title}')
            f.write('\n\n')
            f.write(full_text)
            f.write('\n\n')

    def generate_summary_w_summation(self, full_text):
        with open(markdown_file,'a', encoding="utf-8", errors="surrogateescape") as f:
            title = 'Hoofdstuk'
            f.write('\n\n')
            f.write(f'## {title}')
            for sentence in full_text:    
                f.write('\n\n')
                f.write(f'* {sentence}')
                f.write('\n\n')

    def create_pdf(self):
        pypandoc.convert_file(source_file=markdown_file, to='docx', outputfile=docx_file,   extra_args=["-M2GB", "+RTS", "-K64m", "-RTS"])
        pypandoc.convert_file(source_file=markdown_file, to='pdf',  outputfile=pdf_file,    extra_args=['--pdf-engine=xelatex'])
        with zipfile.ZipFile(zip_filename, 'w') as myzip:
            myzip.write(pdf_file)
            myzip.write(docx_file)