from Writer import Creator
from ATS import GPT

import glob
from bs4 import BeautifulSoup, Tag
import layoutparser as lp
import cv2
from pdf2image import convert_from_path
from flask import Flask, render_template, request, jsonify, session, send_file, redirect
import os
import numpy as np
from werkzeug.utils import secure_filename

img_folder = "afbeeldingen/"
ZIP_FILE_LOCATION = "saved_files/simplified_docs.zip"

if not os.path.exists("saved_files"):
    os.makedirs("saved_files")

if not os.path.exists("afbeeldingen"):
    os.makedirs("afbeeldingen")

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = "uploads/"
app.secret_key = "any random string"


def reformat_html_page(volledige_pagina):
    html_string = volledige_pagina
    soup = BeautifulSoup(html_string, "html.parser")
    content_dict = {}
    current_title = None
    current_content = []

    for tag in soup:
        if isinstance(tag, Tag):
            if tag.name == "h1":
                if current_title is not None:
                    content_dict[current_title] = " ".join(current_content)
                current_title = tag.text
                current_content = []
            else:
                current_content.append(tag.text)

    if current_title is not None:
        content_dict[current_title] = " ".join(current_content)

    return content_dict


@app.route("/", methods=["GET"])
def home():
    files = os.listdir(app.config["UPLOAD_FOLDER"])
    return render_template("index.html", files=files)


def ml_work(afbeelding):
    model = lp.Detectron2LayoutModel(
        config_path="lp://PubLayNet/faster_rcnn_R_50_FPN_3x/config",  # In model catalog
        label_map={
            0: "Text",
            1: "Title",
            2: "List",
            3: "Table",
            4: "Figure",
        },  # In model`label_map`
        extra_config=["MODEL.ROI_HEADS.SCORE_THRESH_TEST", 0.8],  # Optional
    )

    image = cv2.imread(img_folder + afbeelding)
    image = image[..., ::-1]

    layout = model.detect(image)

    lp.draw_box(image, layout, box_width=3)

    valid = ["Text", "Title"]
    text_blocks = lp.Layout([b for b in layout if b.type in valid])
    h, w = image.shape[:2]

    left_interval = lp.Interval(0, w / 2 * 1.05, axis="x").put_on_canvas(image)
    left_blocks = text_blocks.filter_by(left_interval, center=True)
    left_blocks.sort(key=lambda b: b.coordinates[1], inplace=True)

    right_blocks = [b for b in text_blocks if b not in left_blocks]
    right_blocks.sort(key=lambda b: b.coordinates[1])
    text_blocks = lp.Layout(
        [b.set(id=idx) for idx, b in enumerate(left_blocks + right_blocks)]
    )

    lp.draw_box(image, text_blocks, box_width=3, show_element_id=True)
    ocr_agent = lp.TesseractAgent(languages="eng")

    full_text = []
    for block in text_blocks:
        segment_image = block.pad(left=5, right=5, top=5, bottom=5).crop_image(image)
        text = ocr_agent.detect(segment_image)
        block.set(text=text, inplace=True)

    for t in text_blocks:
        if t.type == "Title":
            full_text.append("title:" + str(t.text))
        else:
            full_text.append(t.text)

    return full_text


@app.route("/upload", methods=["GET", "POST"])
def upload():
    file = request.files["pdf"]
    filename = secure_filename(file.filename)
    file.save(f"uploads/{filename}")
    return redirect("/")


@app.route("/set-api-key", methods=["POST"])
def set_api_key():
    if request.method == "POST":
        session["gpt-api-key"] = request.form["gpt-api-key"]
    return redirect("/instellingen")


@app.route("/get-api-key", methods=["POST"])
def get_api_key():
    if request.method == "POST":
        return session["gpt-api-key"]
    else:
        return None


@app.route("/tryout-article", methods=["GET"])
def tryout():
    return render_template(
        "read.html",
        article=[
            "title:Introductie.",
            "Het Vlaams middelbaar onderwijs staat op barsten. Werkdruk en stress overspoelen leraren en scholieren. Bovendien is de derde graad van het middelbaar onderwijs een belangrijke mijlpaal voor de verdere loopbaan van scholieren, al hebben zij volgens Dapaah en Maenhout (2022) dan moeite om grip te krijgen op de vakliteratuur bij STEM-vakken. De STEM-agenda¹ van de Vlaamse overheid moet het STEM-onderwijs tegen 2030 aantrekkelijker te maken, door de ondersteuning voor zowel leerkrachten als scholieren te verbeteren. Toch neemt deze agenda de aanpak van steeds complexere wetenschappelijke taal, zoals beschreven in Barnett en Doubleday (2020), niet op. Wetenschappelijke artikelen vereenvoudigen, op maat van de noden van een scholier met dyslexie in het middelbaar onderwijs, is tijdsen energie-intensief voor leerkrachten en scholieren. Automatische en adaptieve tekstvereenvoudiging biedt hier een baanbrekende oplossing om de werkdruk in het middelbaar onderwijs te verminderen.",
            "Het doel van dit onderzoek is om te achterhalen met welke technologische en logopedische aspecten AI-ontwikkelaars rekening moeten houden bij de ontwikkeling van een adaptieve AI-toepassing voor geautomatiseerde tekstvereenvoudiging. De volgende onderzoeksvraag is opgesteld: ”Hoe kan een wetenschappelijk artikel automatisch vereenvoudigd worden, gericht op de verschillende behoeften van scholieren met dyslexie in de derde graad middelbaar onderwijs?”. Een antwoord op volgende deelvragen kan de onderzoeksvraag vereenvoudigen. Eerst geeft de literatuurstudie een antwoord op de eerste vier deelvragen. Daarna vormt het veldonderzoek een antwoord op de vijfde deelvraag. Ten slotte beantwoordt de vergelijkende studie de zesde en laatste deelvraag. De resultaten van dit onderzoek zetten AI-ontwikkelaars aan om een toepassing te maken om scholieren met dyslexie te kunnen ondersteunen in de derde graad middelbaar onderwijs.",
        ],
    )


@app.route("/get-dictionary", methods=["GET", "POST"])
def dictionary():
    return render_template("dictionary.html")


@app.route("/read-article", methods=["GET"])
def read():
    article = request.args["article"]
    list_files = os.listdir(app.config["UPLOAD_FOLDER"])

    img_files = glob.glob("afbeeldingen/*")
    for img in img_files:
        os.remove(img)

    if article in list_files:
        images = convert_from_path("uploads/" + str(article))
        for i in range(len(images)):
            images[i].save(img_folder + "page" + str(i) + ".png", "PNG")

        full_text = []
        for i in range(0, len(os.listdir(img_folder))):
            filename = f"page{i}.png"
            text = ml_work(filename)

            # Rare pijlen op het einde van iedere zin.
            for i in range(0, len(text)):
                text[i] = text[i][:-1]

            full_text = full_text + text

        return render_template("read.html", article=full_text, error="")
    else:
        return render_template("read.html", article="", error="Er ging iets fout!")


@app.route("/get-simplification", methods=["POST"])
def get_simplification():
    if "gpt-api-key" in session:
        gpt_api_key = session["gpt-api-key"]
    else:
        return jsonify(error="Geen gpt-sleutel opgegeven!")

    data = request.get_json()

    type_vereenvoudiging = data["type"]
    tekst_vereenvoudiging = data["text"]

    try:
        if type_vereenvoudiging in ("tabel", "doorlopende tekst", "opsomming"):
            vereenvoudigde_tekst = GPT(key=gpt_api_key).personalised_simplify(
                sentence=tekst_vereenvoudiging, personalisation=[type_vereenvoudiging]
            )
            return jsonify(
                simplified=vereenvoudigde_tekst[0], prompt=vereenvoudigde_tekst[1]
            )
        else:
            vereenvoudigde_tekst = GPT(key=gpt_api_key).generieke_vereenvoudiging(
                sentence=tekst_vereenvoudiging
            )
            return jsonify(
                simplified=vereenvoudigde_tekst[0], prompt=vereenvoudigde_tekst[1]
            )
    except:
        print("error")
        return jsonify(error="Geen geldige GPT-3 sleutel opgegeven!")


@app.route("/get-definition", methods=["POST"])
def get_definition():
    if "gpt-api-key" in session:
        gpt_api_key = session["gpt-api-key"]
    else:
        return jsonify(error="Geen GPT-3 sleutel opgegeven!")

    data = request.get_json()

    ruw_woord = data["word"]
    ruw_context = data["sentence"]

    try:
        vereenvoudigde_context = GPT(key=gpt_api_key).give_synonym(
            word=ruw_woord, context=ruw_context
        )
        return jsonify(
            simplified=vereenvoudigde_context[0],
            woord=vereenvoudigde_context[1],
            prompt=[2],
        )
    except:
        return jsonify(error="Geen geldige GPT-3 sleutel opgegeven!")


@app.route("/convert-to-word", methods=["POST"])
def convert_to_word():
    if "glossary" in request.json:
        woordenlijst = request.json["glossary"]
    else:
        woordenlijst = {}

    if "html" in request.json:
        html_page = request.json["html"]
        new_text = reformat_html_page(html_page)
    else:
        new_text = {"Error": "Error"}

    title = "Vereenvoudigd document"

    if "persoonlijke_instellingen" in session:
        gekozen_instellingen = session["persoonlijke_instellingen"]
    else:
        gekozen_instellingen = {
            "margin": 2,
            "main-font": "Arial",
            "title-font": "Arial",
            "word-spacing": 0.4,
            "type-spacing": "onehalfspacing",
        }

    Creator().create_pdf(
        title=str(title),
        margin=float(gekozen_instellingen["margin"]),
        list=woordenlijst,
        full_text=new_text,
        fonts=[
            str(gekozen_instellingen["main-font"]),
            str(gekozen_instellingen["title-font"]),
        ],
        word_spacing=float(gekozen_instellingen["word-spacing"]),
        type_spacing=str(gekozen_instellingen["type-spacing"]),
        character_spacing=float(0.5),
        summation=bool(False),
    )

    return send_file(path_or_file=ZIP_FILE_LOCATION)


@app.route("/instellingen", methods=["GET"])
def instellingen_tonen():
    if "gpt-api-key" in session:
        api_key = session["gpt-api-key"]
    else:
        api_key = None

    if "persoonlijke_instellingen" in session:
        persoonlijke_instellingen = session["persoonlijke_instellingen"]
    else:
        persoonlijke_instellingen = None

    return render_template(
        "instellingen.html",
        api_key=api_key,
        persoonlijke_instellingen=persoonlijke_instellingen,
    )


@app.route("/instellingen-aanpassen", methods=["GET", "POST"])
def instellingen_aanpassen():
    session["persoonlijke_instellingen"] = request.form
    return redirect("/instellingen")


if __name__ == "__main__":
    app.run()
