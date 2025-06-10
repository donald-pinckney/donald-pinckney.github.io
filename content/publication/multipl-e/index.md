---
title: 'MultiPL-E: A Scalable and Polyglot Approach to Benchmarking Neural Code Generation'
authors:
- admin
- 13 additional authors
- author_notes:
- "Equal contribution"
- "Equal contribution"
date: '2023-04-17'
publishDate: '2023-04-17'
publication_types:
- article-journal
publication: '*IEEE Transactions on Software Engineering, 49*(7)'

url_pdf: 'https://arxiv.org/pdf/2208.08227'
url_code: 'https://github.com/nuprl/MultiPL-E'
url_dataset: 'https://huggingface.co/datasets/nuprl/MultiPL-E'
url_slides: 'https://www.icloud.com/keynote/091m5Rp2WLcqiicQnuHr-czNg#2023-12__MultiPL-E_FSE_Presentation'
url_video: 'https://2023.esec-fse.org/details/fse-2023-journal-first/11/MultiPL-E-A-Scalable-and-Polyglot-Approach-to-Benchmarking-Neural-Code-Generation'

links:
- name: DOI
  url: https://doi.org/10.1109/TSE.2023.3267446
---

Large language models (LLMs) are blowing up the internet now, both for casual natural language use as well as for programming tasks.
ChatGPT, Codex, and other tools appear to be able to code fairly well, but how well depends on which programming language!
We designed and built MultiPL-E, a systematic and extensible system for fairly evaluating LLMs across a large number of programming languages (18!).

The key insight is that LLM programming benchmark suites (HumanEval, etc.) are written as Python unit tests, and unit tests are (almost always) written in a subset of Python and do not use features such as functions, loops, etc. Therefore, we were able to write trivial "compilers" to translate Python unit tests to nearly any other language, and obtain equivalent benchmark suites.
This work was published in TSE 2023 and presented at ESEC/FSE 2023.