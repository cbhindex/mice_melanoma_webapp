# Mouse melanoma — UNI-v2 interactive explorer

Static site (no server). Open `index.html` locally, or deploy to **GitHub Pages**:

```bash
cd webapp
git add -A && git commit -m "site"
git branch -M main
git remote add origin git@github.com:<you>/<repo>.git
git push -u origin main          # then enable Pages on the main branch in repo settings
```

Pages: `index.html` (summary), `scatter.html` (UMAP/t-SNE, hover→tile), `similarity.html`
(click→cosine-similar tiles). Assets in `assets/` are generated from the analysis
(`src/07_build_atlas.py`, `src/08_build_webapp.py`). Author: Dr Binghao Chai.
