# Automatic Text Simplification (ATS) Prototype

This Chrome extension was used in the paper "Design and Evaluation of an Automatic Text Simplification Prototype with Deaf and Hard-of-hearing Readers" presented at the ASSETS 2024 Conference. It provides a customizable interface for ATS systems.

## Installing The Extension
- Open Chrome Extension Settings (chrome://extensions), turn on developer mode, select "Load Unpacked", and select the project directory named *app*.

## Running the API
- Make sure the virtualenv is active (if it isn't, run 'source thanos/bin/activate' assuming your virtual env is named thanos)
  - If you don't have a virtualenv set up yet, see "API Set-up for First Time Use" below.
- From the main directory, run 'python api/manage.py runserver.' A message saying "Starting development server at `http://127.0.0.1:8000/`" should display.


## API Set-up for First Time Use
- Set up a virtual env
  - To create one, follow these steps:
    - Install the [virtualenv Python package](https://pypi.org/project/virtualenv/) using pip (i.e. 'pip install virtualenv')
	- Then, from the main directory, run 'python -m virtualenv thanos'
  - Activate the virtual env (i.e. run 'source thanos/bin/activate' assuming your virtual env is named thanos)
  - Then, install the required packages by running 'pip install -r api/requirements'

\* *Depending on your setup, you might need to type 'python3' instead of 'python' when typing the commands above, and 'pip3' instead of 'pip'*

# Example

**Once the extension is installed and the API is running, it should work with this paragraph:**

This paragraph, meticulously composed with a deliberate complexity, stands as a quintessential example of intricate writing, aimed at illustrating the sophisticated interplay of syntax, diction, and thematic depth that can be achieved through careful linguistic craftsmanship. Conceived and articulated by me, it exemplifies how a writer can deftly employ an array of advanced vocabulary, multifaceted sentence structures, and layered meanings to construct a narrative that not only challenges the reader's cognitive engagement but also enriches their interpretive experience. 

By weaving together a rich tapestry of descriptive language, nuanced insights, and seamless transitions, the paragraph aspires to transcend mere textual communication, embodying instead a form of intellectual artistry. In doing so, it serves a dual purpose: to provide a concrete demonstration of the potential for complexity in writing to enhance both the aesthetic and analytical dimensions of a text, and to underscore my own proficiency in the art of crafting elaborate and thought-provoking prose.

\* *This paragraph and its simplifications were generated using [ChatGPT](https://chatgpt.com) and manual verification*

# Usage

The extension sends all sentences to the API and expects a JSON object in return. The API is currently using a file called sample.json which demonstrates the format that the extension expects to receive from the API. 

To use your own system, you can start by modifying the models.py file under /api to use a live model instead of pulling from the sample file. Alternatively, you or your model can create a JSON file following the sample format and the existing code should continue to work.

# Citation

```
@inproceedings{10.1145/3663548.3675645,
author = {Alonzo, Oliver and Lee, Sooyeon and Al Amin, Akhter and Maddela, Mounica and Xu, Wei and Huenerfauth, Matt},
title = {Design and Evaluation of an Automatic Text Simplification Prototype with Deaf and Hard-of-hearing Readers},
year = {2024},
isbn = {9781450392587},
publisher = {Association for Computing Machinery},
address = {New York, NY, USA},
url = {https://doi.org/10.1145/3663548.3675645},
doi = {10.1145/3663548.3675645},
booktitle = {Proceedings of the 26th International ACM SIGACCESS Conference on Computers and Accessibility},
keywords = {automatic text simplification, deaf and hard-of-hearing adults, accessibility, design space, reading},
location = {St. John's, NL, Canada},
series = {ASSETS '24}
}
```

# Known Issues

- When using temporary in-place replacements, if the replacement text is shorter than the original, that may cause it toggle really quickly and sometimes get stuck.
- Lexical simplification only works with individual words. However, current simplifications models may also simplify phrases.

# Contributors

[abhaydixit](https://github.com/abhaydixit) and [danieldrumma](https://github.com/danieldrumma) did most of the development, supervised and reviewed by [oliveralonzo](https://github.com/oliveralonzo).