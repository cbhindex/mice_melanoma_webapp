const ASSET_V="20260716151626";

// shared helpers for the melanoma UNI-v2 explorer
const ARM_ORDER = ["Vehicle", "PLX4720"];
const ARM_COLORS = {Vehicle: "#4C72B0", PLX4720: "#C44E52"};
const TAB10 = ["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd",
               "#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"];
const ROLE_COLORS = {viable_tumour:"#4C72B0",spindled_or_dense:"#8a6fb1",
  necrosis_like:"#c49a36",edge_like:"#8b949e",unreviewed:"#7f8c8d",unknown:"#7f8c8d"};
function av(u){ return u + (u.indexOf('?')<0?'?':'&') + 'v=' + (typeof ASSET_V!=='undefined'?ASSET_V:'0'); }
async function loadJSON(u){ const r = await fetch(av(u)); if(!r.ok) throw new Error(`${u}: HTTP ${r.status}`); return await r.json(); }
async function loadOptionalJSON(u){ try{return await loadJSON(u)}catch(e){console.warn("Optional asset unavailable",u,e);return null} }
function clusterColor(c){ const n=Number(c); return Number.isFinite(n)&&n>=0?TAB10[((n%TAB10.length)+TAB10.length)%TAB10.length]:"#a8adb3"; }
function armColor(a){ return ARM_COLORS[a] || "#888"; }
function roleKey(r){ return r==null||r===""?"unreviewed":String(r); }
function roleLabel(r){ const k=roleKey(r); return k==="unreviewed"?"unreviewed":k.replaceAll("_"," "); }
function roleColor(r){ const k=roleKey(r); if(ROLE_COLORS[k]) return ROLE_COLORS[k]; let h=0;for(const ch of k)h=(h*31+ch.charCodeAt(0))>>>0;return TAB10[h%TAB10.length]; }
function esc(x){ return String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function unavailable(el,msg){ if(typeof el==="string")el=document.getElementById(el);if(el)el.innerHTML=`<div class="unavailable"><b>Unavailable.</b> ${esc(msg)}</div>`; }
function clusterDef(M,c){return (M.cluster_definitions||[]).find(d=>+d.cluster_id===+c)||{};}
function runId(M){return M&&M.cluster_run?M.cluster_run.run_id:"legacy / unknown run";}
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
