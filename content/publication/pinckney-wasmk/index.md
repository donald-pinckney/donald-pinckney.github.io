---
title: 'Wasm/k: Delimited Continuations for WebAssembly'
authors:
- admin
- Arjun Guha
- Yuriy Brun
date: '2020-11-15'
publishDate: '2020-11-15'
publication_types:
- paper-conference
publication: '*DLS 2020*'

url_pdf: 'https://arxiv.org/abs/2010.01723'
url_code: 'https://github.com/donald-pinckney/WasmContinuations'
url_video: 'https://youtu.be/2xp1gfYrmi0?si=uagMCYpHIO6oIIFh'

links:
- name: Website
  url: https://wasmk.github.io
- name: DOI
  url: https://doi.org/10.1145/3426422.3426978
---

WebAssembly (Wasm) is a rapidly growing compilation target for the web, but lacks
support for user-level or multiplexed threads, as seen in Go. Currently such threads
must be simulated, leading to a significant performance penalty for Go code compiled
to Wasm. We resolve this by adding support for **delimited continuations** (a form of stack capture operations)
to WebAssembly, which allows for efficient expression of user-level threads, as well as
many other interesting computational effects.
This work was presented at DLS 2020.