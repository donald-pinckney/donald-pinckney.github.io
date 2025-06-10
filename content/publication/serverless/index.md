---
title: 'Formal Foundations of Serverless Computing'
authors:
- Abhinav Jangda
- admin
- Yuriy Brun
- Arjun Guha
date: '2019-10-01'
publishDate: '2019-10-01'
publication_types:
- paper-conference
publication: '*OOPLSA 2019*, **Distinguished Paper Award**'

url_pdf: 'https://arxiv.org/abs/1902.05870'
url_video: 'https://youtu.be/-6jZfIvxtNI?si=Tfv5_h3R7fDC_OSP'

links:
- name: Website
  url: https://plasma-umass.org/foundations-of-serverless/home/
- name: DOI
  url: https://doi.org/10.1145/3360575
---

Serverless functions are super convenient, but the underlying cloud platforms (such as AWS Lambda) 
nondeterministically reuse or restart the containers inside of which code is run, leading to
bugs in real-world code. Documentation and online tutorials offer spotty guidance on what exactly this behavior is, and how a programmer can guarantee their code is safe. We help explain these dynamics by building a framework for analyzing the semantics of
serverless functions, which others built on when designing richer serverless abstractions, such as [Microsoft Azure's Durable Functions](https://learn.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-overview).
This work was presented at OOPSLA 2019, and received a distinguished paper award.