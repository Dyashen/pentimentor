import subprocess, io, os, pypandoc
from datetime import date
import zipfile


markdown_file = "saved_files/file.md"
zip_filename = 'saved_files/simplified_docs.zip'
pdf_file = "saved_files/output.pdf"
docx_file = "saved_files/output.docx"
DATE_NOW = str(date.today())


class Creator():
    
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

    
    def generate_glossary(self, list):
        with open(markdown_file, 'a', encoding='utf-8') as f:
            f.write("---\n")
            f.write("# Woordenlijst\n")
            f.write("| Woord | Soort | Definitie |\n")
            f.write("| --- | --- | --- |\n")
            for word in list.keys(): 
                f.write(f"| {word} | {list[word]['type']} | {list[word]['definition']} |\n")

    def generate_summary(self, full_text):
        with open(markdown_file,'a', encoding="utf-8", errors="surrogateescape") as f:
            for key in full_text.keys():
                title = str(key).replace('\n',' ')
                text = full_text[key]
                f.write('\n\n')
                f.write(f'## {title}')
                f.write('\n\n')
                f.write(" ".join(text))
                f.write('\n\n')

    def generate_summary_w_summation(self, full_text):
        with open(markdown_file,'a', encoding="utf-8", errors="surrogateescape") as f:
            for key in full_text.keys():
                title = str(key).replace('\n',' ')
                text = full_text[key][0].split('|')
                f.write('\n\n')
                f.write(f'## {title}')
                for sentence in text:    
                    f.write('\n\n')
                    f.write(f'* {sentence}')
                    f.write('\n\n')


    def create_pdf(self, title, margin, list, full_text, fonts, word_spacing, type_spacing, summation):
        if title is not None:
            self.create_header(title=title, margin=margin, fontsize=14, chosen_font=fonts[0], chosen_title_font=fonts[1], word_spacing=word_spacing, type_spacing=type_spacing)
        else:
            self.create_header(title='Vereenvoudigde tekst', margin=0.5, fontsize=14, chosen_font=fonts[0], chosen_title_font=fonts[1], word_spacing=word_spacing, type_spacing=type_spacing)
        
        if len(list) != 0:
            self.generate_glossary(list=list)

        if summation:
            self.generate_summary_w_summation(full_text=full_text)
        else:
            self.generate_summary(full_text=full_text)
        
        pypandoc.convert_file(source_file=markdown_file, to='docx', outputfile=docx_file,   extra_args=["-M2GB", "+RTS", "-K64m", "-RTS"])
        pypandoc.convert_file(source_file=markdown_file, to='pdf',  outputfile=pdf_file,    extra_args=['--pdf-engine=xelatex'])
        with zipfile.ZipFile(zip_filename, 'w') as myzip:
            myzip.write(pdf_file)
            myzip.write(docx_file)