import layoutparser as lp
import cv2
import spacy
from pdf2image import convert_from_path
from flask import Flask, render_template, request, jsonify, session, send_file, redirect
import os
import numpy as np
from werkzeug.utils import secure_filename

img_folder = 'afbeeldingen/'

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads/'

@app.route('/', methods=['GET'])
def home():
    files = os.listdir(app.config['UPLOAD_FOLDER'])
    return render_template('index.html', files=files)
 
def ml_work(afbeelding):

    model = lp.Detectron2LayoutModel(
                config_path ='lp://PubLayNet/faster_rcnn_R_50_FPN_3x/config', # In model catalog
                label_map   ={0: "Text", 1: "Title", 2: "List", 3:"Table", 4:"Figure"}, # In model`label_map`
                extra_config=["MODEL.ROI_HEADS.SCORE_THRESH_TEST", 0.8] # Optional
            )

    image = cv2.imread(img_folder + afbeelding)
    image = image[..., ::-1]

    layout = model.detect(image)

    lp.draw_box(image, layout, box_width=3)

    valid = ['Text', 'Title']
    text_blocks = lp.Layout([b for b in layout if b.type in valid])

    h, w = image.shape[:2]

    left_interval = lp.Interval(0, w/2*1.05, axis='x').put_on_canvas(image)

    left_blocks = text_blocks.filter_by(left_interval, center=True)
    left_blocks.sort(key=lambda b:b.coordinates[1], inplace=True)

    right_blocks = [b for b in text_blocks if b not in left_blocks]
    right_blocks.sort(key=lambda b:b.coordinates[1])

    text_blocks = lp.Layout([b.set(id=idx) for idx, b in enumerate(left_blocks+right_blocks)])

    lp.draw_box(image, text_blocks, box_width=3, show_element_id=True)

    ocr_agent = lp.TesseractAgent(languages='eng')

    full_text = []

    for block in text_blocks:
        segment_image = (block.pad(left=5, right=5, top=5, bottom=5).crop_image(image))
        text          = ocr_agent.detect(segment_image)
        block.set(text=text, inplace=True)

    for t in text_blocks:
        if(t.type == 'Title'):
            full_text.append('title:' + str(t.text))
        else:
            full_text.append(t.text)    

    return full_text


# returns a dictionary of the text with each word being the pos-tag
def add_pos_tags(text):
    nlp = spacy.load('nl_core_news_sm')
    doc = nlp(text)
    pos_dict = {token.text: token.pos_ for token in doc}
    return pos_dict

@app.route('/upload', methods=['GET', 'POST'])
def upload():
    
    file = request.files['pdf']
    filename = secure_filename(file.filename)
    file.save(f'uploads/{filename}')
    return redirect('/')


@app.route('/read-article', methods=['GET'])
def read():

    article = request.args['article']
    list_files = os.listdir(app.config['UPLOAD_FOLDER'])

    if article in list_files:
        images = convert_from_path('uploads/' + str(article))
        for i in range(len(images)):
            images[i].save(img_folder + 'page'+str(i) + '.png', 'PNG')


        full_text = []

        for i in range(0, len(os.listdir(img_folder))):
            filename = f'page{i}.png'
            text = ml_work(filename)
            full_text = full_text + text

        return render_template('read.html', article=full_text, error="")
    else:
        return render_template('read.html', article="", error="Er ging iets fout!")

if __name__ == "__main__":
    app.run()