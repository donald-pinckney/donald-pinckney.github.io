---
title: Improving Dependency Management via Formal Semantics
authors:
- admin
date: '2024-11-01'
publishDate: '2024-11-01'
publication_types:
- dissertation
publication: '*Northeastern University*, 2024. **PhD Dissertation**'

url_pdf: 'uploads/dissertation.pdf'

links:
- name: DOI
  url: https://doi.org/10.17760/D20698938
---

Dependency management is a key part of the software development lifecycle. Choices made when managing dependencies impact both the efficiency of software development and final software quality. Today's package managers automate much of the dependency management work, but key challenges remain generally unsolved, such as aiding developers with dependency repair, optimizing over dependency solutions, and improving transparency of popular package managers' semantics. I claim that software dependency specifications can be generalized and formalized across diverse solving algorithms and package ecosystems, and that doing so enables us to attack such challenges. 

To support this claim, we show three contributions: 

1. an empirical analysis of dependency use in the NPM ecosystem, which motivates questions regarding the design of NPM,
2. an executable formal semantics of dependency solving (PacSolve) and an optimizing NPM solver (MaxNPM), and 
3. a system for efficient automated repair of Python dependencies, modeled using PacSolve.