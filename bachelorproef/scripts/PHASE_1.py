import os
import re

def add_newline_after_dot(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as file:
        text = file.read()
    text = re.sub(r'\d', '', text)
    modified_text = text.replace('.', '.\n')
    with open(output_file, 'w', encoding='utf-8') as file:
        file.write(modified_text)
        
folder_path = 'scripts\pdf'
original_scientific_papers = [f for f in os.listdir(folder_path)]

for paper in original_scientific_papers:
    input_file =  folder_path + '/' + paper
    output_file = folder_path + '/' + 'RE_' + paper
    add_newline_after_dot(input_file, output_file)
