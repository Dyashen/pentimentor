deps:
	pip install -r requirements.txt
	python3 -m spacy download nl_core_news_md
	pip uninstall -y Pillow && pip install Pillow==9.5.0

build:
	python3 -m flask run --host=0.0.0.0 --port=5000