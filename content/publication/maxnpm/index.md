---
title: Flexible and Optimal Dependency Management via Max-SMT
authors:
- admin
- Federico Cassano
- Arjun Guha
- Jonathan Bell
- Massimiliano Culpo
- Todd Gamblin
date: '2023-05-14'
publishDate: '2023-05-14'
publication_types:
- paper-conference
publication: '*ICSE 2023*'

url_pdf: 'https://arxiv.org/abs/2203.13737'
url_code: 'https://github.com/donald-pinckney/pacsolve'
# url_dataset: 'https://github.com/HugoBlox/hugo-blox-builder'
url_video: 'https://youtu.be/O3eMwxRwhgI?si=TQwh39l6sT-NpaKN&t=939'

links:
- name: Install
  url: https://www.npmjs.com/package/maxnpm
- name: DOI
  url: https://doi.org/10.1109/ICSE48619.2023.00124
---

Dependency management is unfortunately not as simple as just installing the dependencies you want: part of software engineering
now involves careful selection of dependency versions, to make sure that: you get newer versions, you avoid security vulnerabilities, you successfully unify dependencies on the same package into a single version, and so on. These goals are often at odds, and are not handled well by existing package managers' baked-in heuristics.

To solve this, we built <b>MaxNPM</b>, a fork of the NPM CLI which lets users customize dependency solving goals, so that 
software developers can guide the tooling appriopriately for their situation. We evaluated MaxNPM with a large sample of packages from the NPM ecosystem and show that it can reduce vulnerabilities in dependencies, choose newer dependencies than NPM can, and can choose fewer dependencies than NPM.