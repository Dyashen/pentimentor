from flask import Flask, render_template, request, jsonify, session, send_file, flash
from langdetect import detect_langs
from Reader import Reader
from pdf2image import convert_from_bytes
from io import BytesIO
from pdfminer.high_level import extract_pages
from datetime import timedelta
from ATS import GPT
from Writer import Creator
import Analysis as an

app = Flask(__name__)
app.secret_key = "super secret key"
GPT_API_KEY_SESSION_NAME = 'gpt3'
HF_API_KEY_SESSION_NAME = 'hf_api_key'
PER_SET_SESSION_NAME = 'personalized_settings'
ZIP_FILE_LOCATION = 'saved_files/simplified_docs.zip'

def setup_scholars_teachers(request):
    settings = request.form
    if 'fullText' in request.form:
            text = request.form['fullText']
            langs = detect_langs(text)
            reader = Reader()
            dict_text = reader.get_full_text_site(text)                
    elif 'pdf' in request.files:
            if 'advanced' not in settings:
                pdf = request.files['pdf']
                pdf_data = BytesIO(pdf.read())
                all_pages = extract_pages(pdf_data,page_numbers=None,maxpages=999)
                langs = detect_langs(str(all_pages))
                reader = Reader()
                full_text = reader.get_full_text_dict(all_pages)
                if('personalized_settings' in session and 'numberOfSentencesForParagraphs' in session['personalized_settings']):
                    numberOfParagraphs = session['personalized_settings']['numberOfSentencesForParagraphs']
                    dict_text = reader.get_full_text_site(full_text, numberOfParagraphs)
                else:
                    dict_text = reader.get_full_text_site(full_text)
            else:
                pdf = request.files['pdf']
                pdf_data = pdf.read()
                pages = convert_from_bytes(pdf_data)
                reader = Reader()
                img_text = reader.get_full_text_from_image(pages)
                langs = detect_langs(img_text)
                dict_text = reader.get_full_text_site(img_text)                            
    return dict_text, langs, 'voorbeeldtitel', 'voorbeeldonderwerp'

@app.before_request
def pre_boot_up():
    session.permanent=True

@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')

@app.route('/for-scholars', methods=['GET','POST'])
def teaching_tool():
    try:
        print('ok')
        dict_text, langs, title, subject = setup_scholars_teachers(request)
        print('ok')
        return render_template('for-scholars.html', pdf=dict_text, lang=langs, title=title, subject=subject)
    except Exception as e:
        return render_template('error.html',error=str(e))

@app.route('/for-teachers', methods=['GET','POST'])
def analysing_choosing_for_teachers():
    try:
        dict_text, langs, title, subject = setup_scholars_teachers(request)
        return render_template('for-teachers.html', pdf=dict_text, lang=langs, title=title, subject=subject)
    except Exception as e:
        return render_template('error.html',error=str(e))

@app.route('/generate-simplification', methods=['POST'])
def generate_simplification():
    try:
        settings = dict(request.form)
        type_spacing = settings['typeSpacing']
        fonts = (settings['titleFont'], settings['regularFont'])
        margin = settings['margin']
        word_spacing = settings['word_spacing']

        api_key = session[GPT_API_KEY_SESSION_NAME]
        gpt = GPT(api_key)
            
        full_text = eval(settings['text'])

        doc_creator = Creator()
        doc_creator.create_header(title='Vereenvoudigde tekst', margin=margin, fontsize=14, chosen_font=fonts[0], chosen_title_font=fonts[1], word_spacing=word_spacing, type_spacing=type_spacing)
        if 'glossaryList' in settings and not settings['glossaryList'] == '':
            doc_creator.generate_glossary(list=settings['glossaryList'])

        for key, value in full_text.items():
            new_sentence = []
            for word in key.split(" "):
                if word != '':
                    new_sentence.append(word)

            sent            = " ".join(new_sentence)
            aantalDelingen  = (len(sent)  // 1000) + 1
            perHoeveel      = (len(sent)) // aantalDelingen
            sent = [sent[i:i+perHoeveel] for i in range(0, len(sent), perHoeveel)]

            for s in sent:
                new_sent, prompt = gpt.personalised_simplify(s, str(value).split(','))

                if 'summation' in str(value).split(','):
                    doc_creator.generate_summary_w_summation(new_sent)
                elif 'table' in str(value).split(',') or 'glossary' in str(value).split(','):
                    doc_creator.generate_simplification(new_sent)
                else:
                    doc_creator.generate_simplification(new_sent)
            
        doc_creator.create_pdf()
        return send_file(path_or_file=ZIP_FILE_LOCATION, as_attachment=True)
        
    except Exception as e:
        return jsonify(error_msg = str(e))

@app.route('/simplify-scholar', methods=['POST'])
def personalized_simplify():
    prompt = request.json['prompt']
    try:
        api_key = session[GPT_API_KEY_SESSION_NAME]
    except:
        api_key = None
    gpt = GPT(api_key)
    
    result, prompt = gpt.personalised_simplify_w_prompt(prompt=prompt)
    return jsonify(prompt=prompt, result=result)

@app.route('/look-up-word',methods=['POST'])
def look_up_word():
    word = request.json['word']
    sentence = request.json['sentence']
    pos, lemma = an.get_spacy_pos_tag_lemma(word, sentence)

    try:
        api_key = session[GPT_API_KEY_SESSION_NAME]
    except:
        api_key = None

    gpt = GPT(api_key)
    result, word, prompt = gpt.look_up_word_gpt(word=word, context=sentence, lemma=lemma, pos=pos)
    return jsonify(result=result, source='GPT-3', word=word, pos=pos, lemma=lemma)
        
    
@app.route('/change-settings', methods=['GET', 'POST'])
def return_personal_settings_page():
    return render_template('settings.html')

@app.route('/change-settings-user', methods=['POST'])
def change_personal_settings():
    try:
        session[PER_SET_SESSION_NAME] = dict(request.form)
        msg = 'Succesvol aangepast!'
    except Exception as e:
        msg = str(e)
    flash(msg)
    return render_template('settings.html')

# KEYS
@app.route('/set-gpt-api-key', methods=['GET'])
def set_gpt_api_key():
    try:
        api_key = request.args.get('key')
        session[GPT_API_KEY_SESSION_NAME] = api_key
        return jsonify(result=api_key)
    except Exception as e:
        return jsonify(result=str(e))
    
@app.route('/get-session-keys', methods=['POST'])
def get_session_keys():
    try:
        return jsonify(dict(session))
    except Exception as e:
        return jsonify(result=str(e))
        
app.permanent_session_lifetime = timedelta(minutes=30)
if __name__ == "__main__":
    app.run()