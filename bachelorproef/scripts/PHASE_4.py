import os
from langdetect import detect
import spacy
import pandas as pd
import readability

simplified_folder = 'scripts/vereenvoudigde_artikelen'
original_folder = 'scripts/pdf'

scientific_papers = [original_folder + "/" + f for f in os.listdir(original_folder)] + [simplified_folder + "/" + f for f in os.listdir(simplified_folder)]

languages = {
    'nl':'nl_core_news_md',
    'en':'en_core_web_md'
}

df = pd.DataFrame()

for paper in scientific_papers:
    
    print(paper)

    with open(paper, 'r', encoding='utf-8') as file:
        text = file.read()
    nlp = spacy.load(languages.get('nl'))
    doc = nlp(text)

    total_sentences = 0
    for sent in doc.sents:
        total_sentences += 1

    
    for sent in doc.sents:
        try:
            metrics = readability.getmeasures(sent.text, lang='nl')
            name = paper.split('/')[2].split('.')[0]
            row = {
                'paper': " ".join(name.split('_')[2:]),
                'model': " ".join(name.split('_')[0:2]),
                'sentence': sent.text,
                'FRE': metrics['readability grades']['FleschReadingEase'],
                'FOG': metrics['readability grades']['GunningFogIndex'],
                }
            
            for key, value in metrics['sentence info'].items():
                row[key] = value

            for key, value in metrics['word usage'].items():
                row[key] = value

            for key, value in metrics['sentence beginnings'].items():
                row[key] = value

            df = df.append(row, ignore_index=True)
        except Exception as e:
            print(e)

df.to_csv('result.csv', index=False)