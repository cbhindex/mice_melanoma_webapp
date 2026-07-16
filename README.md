# Mouse melanoma — interactive explorer

Generated static site for a biological-question-led review of neoplastic nuclear morphology.
Cluster labels such as `C0` are **run-local technical IDs**, not stable biological identities.
Question order, navigation, metric language and chart rules are owned by `config/webapp_story.json`;
the web builders fail rather than silently substituting a second scientific story when that contract is missing.

## Open locally

The pages use `fetch()` for JSON, so do not rely on `file://`. Serve this directory over HTTP:

```bash
cd webapp
python -m http.server 8000
# open http://localhost:8000/
```

Plotly is currently pinned to a CDN URL, so first load needs network access. Vendor Plotly locally if a
fully offline deliverable is required.

## Pages

- `index.html` — the central biological question, plain-language answer and question-led evidence journey.
- `phenotypes.html` — what each provisional tissue environment looks like and what biological or
  pathological interpretation is and is not currently supported.
- `experiments.html` — treatment evidence in biological order: whole-tumour baseline, tissue contexts,
  composition, between-context morphology, matched-context treatment, standardisation and conclusion.
- `cluster_selection.html` — a collapsed technical appendix for the finalized image-phenotype resolution,
  stability, slide-confounding checks and K-lineage sensitivity.
- `scatter.html` — tile UMAP/t-SNE display with mouse/arm/fine-cluster/semantic-role filters and linked WSI maps.
  Clustering itself was fitted in PCA50 feature space; UMAP/t-SNE are visualization only and IDs are run-local.
- `cells_scatter.html` — cell-crop subsample with run-local tile membership and boundary flags.
- `similarity.html` / `cells.html` — tile-neighbour and cell-summary supporting views.

Missing optional analysis JSON is shown as an explicit **Unavailable** panel rather than causing a blank
page or reviving a hard-coded conclusion.

## Regenerate after a finalized clustering

Run analysis/data stages first. Every asset must resolve to the same frozen `cluster_run_id`, K and
canonical tile hash; a mismatch is a hard stop, not a reason to retain an older JSON. Then run the static
builders so every page reuses the version minted by S8:

```bash
python src/18_build_nucleus_tile_assignments.py
python src/19_cluster_stratified_nucleus_analysis.py
python src/22_cluster_morphology_characterization.py
python src/24_cellular_tissue_restricted_analysis.py
python src/16_neoplastic_morphology_experiments.py --refresh_cluster_membership
python src/07_build_atlas.py --metadata-only
python src/14_build_cell_webapp_assets.py --metadata-only
python src/08_build_webapp.py                 # mints the shared cache-busting version
python src/15_build_cell_webapp.py
python src/23_build_biological_story_webapp.py
python src/17_build_experiments_webapp.py
python src/20_build_cluster_selection_webapp.py --run_id <run_id>
```

`--metadata-only` (aliases: `--meta_only`, `--metadata_only`) refreshes memberships/provenance without
reading WSI pixels. It
refuses reuse unless tile/cell order, sprite count and atlas dimensions match the previous metadata.
The analysis stages must have generated `science_summary.json`, `cluster_stratified_stats.json`,
`cluster_biology.json`, `cellular_tissue_restricted_analysis.json`, `biological_story.json`, and
the cluster-selection run assets before the corresponding page can show results.

## Deploy

This directory is its own Git repository. The current K5 build is local and has not been committed,
pushed or deployed by this workflow. Deploy only after checking both repository statuses and after
explicit approval to push:

```bash
cd webapp
git add -A && git commit -m "site"
git branch -M main
git remote add origin git@github.com:<you>/<repo>.git
git push -u origin main          # then enable Pages on the main branch in repo settings
```

Author: Dr Binghao Chai.
