FROM python:3.8

WORKDIR /app

COPY requirements.txt requirements.txt

RUN apt-get update

RUN apt-get install -y git && apt install -y cmake tesseract-ocr libtesseract-dev poppler-utils

RUN pip install layoutparser \
    && pip install "layoutparser[effdet]" layoutparser torchvision && pip install "git+https://github.com/facebookresearch/detectron2.git@v0.5#egg=detectron2" \
    && pip install "layoutparser[paddledetection]" \
    && pip install "layoutparser[ocr]" \
    && pip install pytesseract easyocr pdf2image flask spacy

# export LD_LIBRARY_PATH=/usr/lib/wsl/lib:$LD_LIBRARY_PATH

RUN python3 -m spacy download nl_core_news_md

COPY . .

CMD ["python3", "-m", "flask", "run", "--host=0.0.0.0", "--port=5000"]

