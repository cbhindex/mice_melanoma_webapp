const ASSET_V="20260710223205";

// shared helpers for the melanoma UNI-v2 explorer
const ARM_ORDER = ["Vehicle", "PLX4720"];
const ARM_COLORS = {Vehicle: "#4C72B0", PLX4720: "#C44E52"};
const TAB10 = ["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd",
               "#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"];
function av(u){ return u + (u.indexOf('?')<0?'?':'&') + 'v=' + (typeof ASSET_V!=='undefined'?ASSET_V:'0'); }
async function loadJSON(u){ const r = await fetch(av(u)); return await r.json(); }
function clusterColor(c){ return TAB10[c % TAB10.length]; }
function armColor(a){ return ARM_COLORS[a] || "#888"; }
function aspectRanges(xs, ys, el, pad){
  pad = pad == null ? 0.08 : pad;
  let xmin=Infinity,xmax=-Infinity,ymin=Infinity,ymax=-Infinity;
  for(let i=0;i<xs.length;i++){
    const x=+xs[i], y=+ys[i];
    if(Number.isFinite(x)&&Number.isFinite(y)){
      if(x<xmin) xmin=x; if(x>xmax) xmax=x; if(y<ymin) ymin=y; if(y>ymax) ymax=y;
    }
  }
  let dx=Math.max(xmax-xmin,1e-9), dy=Math.max(ymax-ymin,1e-9);
  const cx=(xmin+xmax)/2, cy=(ymin+ymax)/2;
  dx *= (1 + pad); dy *= (1 + pad);
  const w=Math.max(el.clientWidth||1,1), h=Math.max(el.clientHeight||1,1);
  const view=w/h;
  if(dx/dy > view) dy=dx/view; else dx=dy*view;
  return {
    xaxis:{visible:false,range:[cx-dx/2,cx+dx/2],autorange:false},
    yaxis:{visible:false,range:[cy-dy/2,cy+dy/2],autorange:false}
  };
}
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
