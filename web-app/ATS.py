import openai, configparser, time, json, requests, spacy, os, numpy as np
import time, json, requests
from langdetect import detect
from googletrans import Translator
from bs4 import BeautifulSoup

huggingfacemodels = {
    'sc':"https://api-inference.huggingface.co/models/haining/scientific_abstract_simplification",
    'bart-sc': "https://api-inference.huggingface.co/models/sambydlo/bart-large-scientific-lay-summarisation",
    'kis': "https://api-inference.huggingface.co/models/philippelaban/keep_it_simple"
}

max_length = 2000
COMPLETIONS_MODEL = "text-davinci-003"
EMBEDDING_MODEL = "text-embedding-ada-002"

languages = {
    'nl':'nl_core_news_md',
    'en':'en_core_web_md'
}

class GPT():
    """ @sets openai.api_key """
    def __init__(self, key=None):
        global gpt_api_key
        if key is None:
            gpt_api_key = 'not-submitted'
            openai.api_key = key
        else:
            gpt_api_key = key
            openai.api_key = key

    """ @returns prompt, result from gpt """
    def look_up_word_gpt(self, word, context, lemma, pos):
        try:
            prompt = f"""
            Geef een eenvoudige definitie:
            woord: {word} /// lemma: {lemma} /// pos: {pos} /// context: {context}
            ///
            """
        
            result = openai.Completion.create(
                    model=COMPLETIONS_MODEL,
                    prompt=prompt,
                    temperature=0,
                    max_tokens=80,
                    top_p=0.9,
                    stream=False
                    )["choices"][0]["text"].strip(" \n")   
            
            return result, word, prompt
        except Exception as e:
            return 'error', str(e), str(e)


    def personalised_simplify(self, sentence, personalisation):
        if 'table' in personalisation:
            prompt = f"""
            Herschrijf de tekstinhoud maar in een tabel, gebruik twee kolommen naar keuze; schrijf dit in markdowncode.
            ///
            {sentence}
            """
        elif 'glossary' in personalisation:
            prompt = f"""
            Maak een woordenlijst (max 5 woorden) in tabelvorm van het gebruikte jargon uit deze tekst; schrijf dit in markdowncode. ///
            {sentence}
            """
        else:
            prompt = f"""
            Vereenvoudig de zinnen met de volgende kenmerken: {", ".join(personalisation)}
            ///
            {sentence}
            """

        try:
            result = openai.Completion.create(prompt=prompt,temperature=0,max_tokens=len(prompt),model=COMPLETIONS_MODEL,top_p=0.9,stream=False)["choices"][0]["text"].strip(" \n")

            if 'summation' in personalisation:
                result = result.split('.')
            elif 'table' in personalisation or 'glossary' in personalisation:
                result = result
            else:
                result = result
            
            return result, prompt
        except Exception as e:
            return str(e), prompt 
        
    def personalised_simplify_w_prompt(self, prompt):
        try:
            result = openai.Completion.create(
                    prompt=prompt,
                    temperature=0,
                    max_tokens=len(prompt)+200,
                    model=COMPLETIONS_MODEL,
                    top_p=0.9,
                    stream=False
            )["choices"][0]["text"].strip(" \n")
            return result, prompt
        except Exception as e:
            return str(e), prompt  
                
    def simplify(self, full_text_dict, personalisation=None):
        soup = BeautifulSoup(full_text_dict, 'html.parser')
        tags = soup.find_all(True)
        split_text = {}

        for tag in tags:
            if tag.name == 'h3':
                current_key = tag.text
            
            if tag.name == 'p':
                split_text[current_key] = tag.text

        for key in split_text.keys():
            split_text[key] = str(split_text[key]).strip('\n')\
            .strip('\\').replace('\\','')

        new_text = {}
        for title in split_text.keys():
            text = split_text[title]
            if len(text) > 1000:
                index = len(text) // 2
                text_to_prompt = [text[:index], text[index:] ]
            else:
                text_to_prompt = [text]

            full_chunk_result = ""
            for chunk in text_to_prompt:
                if 'summation' not in personalisation:
                    prompt = f"""
                    Vereenvoudig deze tekst volgens: {", ".join(personalisation)}
                    ///
                    {chunk}
                    """
                else:
                    prompt = f"""
                    Vereenvoudig deze tekst als een opsomming volgens het formaat met {", ".join(personalisation)}
                    :return: A list of simplified sentences divided by a '|' sign
                    ///
                    {chunk}
                    """

                full_chunk_result += str(openai.Completion.create(prompt=prompt,temperature=0,max_tokens=500,model=COMPLETIONS_MODEL,top_p=0.9,stream=False)["choices"][0]["text"].strip(" \n"))
            new_text[title] = [full_chunk_result]
        return new_text