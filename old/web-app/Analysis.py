import pandas as pd
from pdfminer.high_level import extract_pages
from pdfminer.layout import LTTextContainer, LTChar
import spacy, os, readability
from langdetect import detect
import pandas as pd


folder_path = 'scripts\experimenten\pdf'
dict = {
    'nl':'nl_core_news_md',
    'en':'en_core_web_sm'
}

"""
"""
def get_spacy_nlp_model(sentence):
    return spacy.load(
        dict.get(detect(sentence))
    )


"""
"""
def get_spacy_pos_tag_lemma(word, sentence):
    nlp_model = get_spacy_nlp_model(sentence=sentence)
    doc = nlp_model(sentence)
    for token in doc:
        if word == token.text:
            tag = token.pos_
            lemma = token.lemma_
    
    return tag, lemma


"""
"""
def get_sentence_length(sentence):
    nlp = spacy.load(dict.get(detect(sentence)))
    doc = nlp(sentence)
    return len(doc)


"""
"""
def text_clean(text):    
    full_text = text.strip()
    full_text = text.replace('\n', ' ')
    return full_text

"""
"""
def get_sentences(text):
    nlp = spacy.load(dict.get(detect(text)))
    doc = nlp(text)
    sentences = []
    for sentence in doc.sents:
        sentences.append(str(sentence))
    return sentences

"""
Dataframe opbouwen voor een pdf. Hieronder wordt de zin, bron en zinlengte opgeslaan.
"""
def get_statistics(full_text):
    full_text = text_clean(full_text)
    
    try:
        lang = detect(full_text)
    except:
        lang = 'nl'
        
    sentences = get_sentences(full_text)
    df = pd.DataFrame(sentences, columns=['sentence'])
    df['sentence_length'] = df['sentence'].apply(get_sentence_length)

    """
    Filteren. Zinnen kleiner dan 3 woord-tokens zijn niet mogelijk. Deze worden verworpen.
    """
    df = df[df['sentence_length'] > 3]   


    """
    """
    for key in readability.getmeasures("test")['readability grades'].keys():
        df[key] = df['sentence'].apply(lambda x: readability.getmeasures(x)['readability grades'][key])

    """
    """
    word_usage_cols = readability.getmeasures("test")['word usage'].keys()
    for key in word_usage_cols:
        df[key] = df['sentence'].apply(lambda x: readability.getmeasures(x, lang=lang)['word usage'][key])

    """
    """
    sentence_beginnings_cols = readability.getmeasures("test")['sentence beginnings'].keys()
    for key in sentence_beginnings_cols:
        df[key] = df['sentence'].apply(lambda x: readability.getmeasures(x, lang=lang)['sentence beginnings'][key])

    """
    """
    avg = df[word_usage_cols].mean().to_dict()
    sum = df[sentence_beginnings_cols].sum().to_dict()
    return (avg, sum)
