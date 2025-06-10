---
title: 'npm-follower: A Complete Dataset Tracking the NPM Ecosystem'
authors:
- admin
- Federico Cassano
- Arjun Guha
- Jonathan Bell
date: '2023-11-30'
publishDate: '2023-11-30'
publication_types:
- paper-conference
publication: '*ESEC/FSE 2023*'

url_pdf: 'https://arxiv.org/abs/2308.12545'
url_code: 'https://github.com/donald-pinckney/npm-follower'
url_dataset: 'https://github.com/donald-pinckney/dependencies.science'
url_video: 'https://2023.esec-fse.org/details/fse-2023-demonstrations/5/npm-follower-A-Complete-Dataset-Tracking-the-NPM-Ecosystem'

links:
- name: DOI
  url: https://doi.org/10.1145/3611643.3613094
---

Package managers and their massive open-source ecosystems are the foundation for how any practical software is built. However, the behavior of how developers share and consume packages at-scale is not terribly well understood. How do developers specify their dependencies? How do developers tag new releases of their own packages? Do common practices lead to issues in dependency management, such as out-of-date dependencies or security issues?

To answer these types of questions, we built a system which in realtime archives a replica of the entire NPM ecosystem, including both package metadata and code data (20+ TB). The dataset is now public and can be used for a wide variety of NPM dependency graph queries or big code analysis. Our analysis of the data finds some surprising findings, with an asymmetry between how developers tag updates that they publish vs. how developers write dependency constraints.