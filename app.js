const ASSET_V="20260602151138";

// shared helpers for the melanoma UNI-v2 explorer
const ARM_ORDER = ["Vehicle", "PLX4720"];
const ARM_COLORS = {Vehicle: "#4C72B0", PLX4720: "#C44E52"};
const TAB10 = ["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd",
               "#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"];
function av(u){ return u + (u.indexOf('?')<0?'?':'&') + 'v=' + (typeof ASSET_V!=='undefined'?ASSET_V:'0'); }
async function loadJSON(u){ const r = await fetch(av(u)); return await r.json(); }
function clusterColor(c){ return TAB10[c % TAB10.length]; }
function armColor(a){ return ARM_COLORS[a] || "#888"; }
// paint element `el` with tile global-index `gi` from the sprite atlas, sized DxD
function atlasStyle(el, gi, M, D, prefix){
  prefix = prefix || "atlas";
  const per = M.per_atlas, cols = M.cols;
  const a = Math.floor(gi / per), w = gi % per;
  const row = Math.floor(w / cols), col = w % cols;
  el.style.width = D + "px"; el.style.height = D + "px";
  el.style.backgroundImage = `url(${av('assets/'+prefix+'_'+a+'.jpg')})`;
  el.style.backgroundSize = `${cols*D}px ${cols*D}px`;
  el.style.backgroundPosition = `-${col*D}px -${row*D}px`;
  el.style.imageRendering = "auto";
}
function embXY(M, emb){
  return emb === "tsne" ? [M.tsne_x, M.tsne_y] : [M.umap_x, M.umap_y];
}
function kOf(M){ return Math.max(...M.cluster) + 1; }
