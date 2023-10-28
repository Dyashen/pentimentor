FROM ubuntu

WORKDIR /app

RUN apt-get update

RUN apt-get install -y git python3-pip pandoc texlive-xetex texlive \ 
    && apt install -y cmake tesseract-ocr libtesseract-dev poppler-utils --fix-missing

RUN pip install --upgrade pip

RUN pip install layoutparser \
    && pip install "layoutparser[effdet]" layoutparser torchvision && pip install "git+https://github.com/facebookresearch/detectron2.git@v0.5#egg=detectron2" \
    && pip install "layoutparser[paddledetection]" \
    && pip install "layoutparser[ocr]" \
    && pip install pytesseract easyocr pdf2image flask spacy

RUN export LD_LIBRARY_PATH=/usr/lib/wsl/lib:$LD_LIBRARY_PATH

RUN python3 -m spacy download nl_core_news_md

RUN apt install -y cmake tesseract-ocr libtesseract-dev poppler-utils

RUN pip uninstall -y Pillow && pip install Pillow==9.5.0

COPY . .

CMD ["python3", "-m", "flask", "run", "--host=0.0.0.0", "--port=5000"]