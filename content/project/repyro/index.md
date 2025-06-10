---
title: Repyro
external_link: uploads/dissertation.pdf
date: 2024-04-01
---

Combines generative AI with SAT-solving to find fixes to runtime errors caused by incompatible dependencies.

Dependency management is extremely tricky to get right, as programmers need to make sure their dependency version constraints are neither too broad nor too narrow. Compounding this, if there is just one package in your whole dependency tree that has a defective constraint, then you may end up with a solution which causes bugs at runtime.

To address this problem, we've built automated dependency repair tooling, starting with the Python/Pip ecosystem. Building on our previous work (MaxNPM), we integrate constraint solving with large language models' suggestions for patching constraints, to iteratively narrow the search space and find a repaired dependency solution.

<!--more-->