from pdfminer.high_level import extract_pages
from pdfminer.layout import LTTextContainer, LTChar
from pdfminer.pdfparser import PDFParser
from pdfminer.pdfdocument import PDFDocument
from io import BytesIO
import spacy, re, numpy as np
from langdetect import detect
import os, easyocr

SENTENCES_PER_PARAGRAPH = 5

dict = {
    'nl':'nl_core_news_md',
    'en':'en_core_web_md'
}

class Reader():
    """
    input: generator-object
    output: format used for site
    """
    def get_full_text_dict(self, all_pages):
        total = ""
        for page_layout in all_pages:
            for element in page_layout:
                if isinstance(element, LTTextContainer):
                    for text_line in element:
                        total += text_line.get_text()
        return total
    

    def get_full_text_from_image(self, all_pages):
        img_files = []
        num_pages = 0
        for i, page in enumerate(all_pages):
            file = f'page_{num_pages}.jpg'
            page.save(file, 'JPEG')
            img_files.append(file)
            num_pages += 1

        full_text = []
        reader = easyocr.Reader(['nl'])
        for f in img_files:
            result = reader.readtext(f, detail=0)
            full_text.append(" ".join(result))
            os.remove(f)

        return " ".join(full_text)

    def get_full_text_site(self, full_text):
        try:
            lang = detect(full_text)
        except:
            lang = 'en'

        if lang in dict:
            nlp = spacy.load(dict.get(lang))
        else:
            nlp = spacy.load(dict.get('en'))
        
        full_text = str(full_text).replace('\n', ' ')

        doc = nlp(full_text)
        sentences = []
        for sentence in doc.sents:
            sentences.append(sentence)

        pad_size = SENTENCES_PER_PARAGRAPH - (len(sentences) % SENTENCES_PER_PARAGRAPH)
        padded_a = np.pad(sentences, (0, pad_size), mode='empty')
        paragraphs = padded_a.reshape(-1, SENTENCES_PER_PARAGRAPH)

        text_w_pos = []
        for paragraph in paragraphs:
            paragraph_w_pos = []
            try:
                for sentence in paragraph:
                    dict_sentence = {}
                    for token in sentence:
                        dict_sentence[token.text] = str(token.pos_).lower()
                    paragraph_w_pos.append(dict_sentence)    
                text_w_pos.append(paragraph_w_pos)
            except:
                pass
        return text_w_pos