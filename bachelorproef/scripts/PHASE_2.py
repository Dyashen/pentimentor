import os
import pandas as pd
from deep_translator import GoogleTranslator

output_csv = 'results.csv'

def translate_dutch_to_english(dutch_text_file):
    with open(dutch_text_file, 'r', encoding='utf-8') as file:
        dutch_sentences = file.readlines()
    dutch_sentences = [sentence.strip() for sentence in dutch_sentences]

    english_sentences = []
    for sentence in dutch_sentences:
        translated = GoogleTranslator(source='nl', target='en').translate(sentence)
        english_sentences.append(translated)
    df = pd.DataFrame({'Dutch': dutch_sentences, 'English': english_sentences})
    df.to_csv(str(dutch_text_file).split('.')[0].replace('\n',' ') + '.csv', index=False,  sep='|')


folder_path = 'scripts/pdf/'
original_scientific_papers = [f for f in os.listdir(folder_path)]

for paper in original_scientific_papers:
    if paper.startswith('RE_') and paper.endswith('.txt'):
        print(f'STARTING {paper}')
        dutch_text_file = folder_path + paper
        translate_dutch_to_english(dutch_text_file)