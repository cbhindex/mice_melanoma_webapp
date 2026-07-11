# Mouse melanoma — interactive explorer

Static site (no server). Open `index.html` locally, or deploy to **GitHub Pages**:

```bash
cd webapp
git add -A && git commit -m "site"
git branch -M main
git remote add origin git@github.com:<you>/<repo>.git
git push -u origin main          # then enable Pages on the main branch in repo settings
```

Pages: `index.html` (thin Q&A landing — each question links into the evidence),
`experiments.html` (the **evidence summary**: one logical narrative — Comparable groups? →
Whole-slide nuclei → Region-based nuclei → Real or artefact? → What it means → Appendix, each
panel written as motivation → question → method → observation → interpretation),
`scatter.html` (tile map, hover→tile), `similarity.html` (click→cosine-similar tiles),
`scatter_embed.html` / `similarity_embed.html` (headerless versions embedded in `experiments.html`),
`cells_scatter.html` (nucleus map with crop hover), and `cells.html` (cell-type/stain/density
detail). Assets in `assets/` are generated from the analysis (`src/07`, `src/08`, `src/09`,
`src/14`, `src/15`, `src/16`, `src/17`).

All treatment comparisons are n = 2 mice/arm and hypothesis-generating; results are reported as raw
differences, interpretable magnitudes, an exact rank/permutation p (best 1/6 ≈ 0.167) and a
leave-one-mouse-out check rather than implying a powered effect. Author: Dr Binghao Chai.
