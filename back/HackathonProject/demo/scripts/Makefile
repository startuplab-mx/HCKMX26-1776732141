.PHONY: install venv check clean

VENV ?= .venv
PYTHON ?= python3

install: venv
	$(VENV)/bin/pip install --upgrade pip
	$(VENV)/bin/pip install -r requirements.txt

venv:
	@test -d $(VENV) || $(PYTHON) -m venv $(VENV)

check:
	$(VENV)/bin/python faro_fingerprint.py --help

clean:
	rm -rf $(VENV)
