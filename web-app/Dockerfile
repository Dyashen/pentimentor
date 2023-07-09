FROM python:3.8-slim-buster

WORKDIR /app

COPY requirements.txt requirements.txt

RUN apt-get update && apt-get install -y pandoc texlive-xetex texlive poppler-utils

RUN pip3 install -r requirements.txt \
    && python3 -m spacy download nl_core_news_md \
    && python3 -m spacy download en_core_web_md

COPY . .

CMD [ "python3", "-m" , "flask", "run", "--host=0.0.0.0", "--port=5000"]