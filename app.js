const ASSET_V="20260825175521";

// shared helpers for the melanoma UNI-v2 explorer
const COHORT_REGISTRY = Object.freeze({
  group_1:Object.freeze({id:"group_1",label:"Group 1",assetRoot:"assets",context:"WM2664"}),
  group_2:Object.freeze({id:"group_2",label:"Group 2 Archive",assetRoot:"assets/group_2",context:"Group 2's cell line · archived original scan · name pending colleague confirmation"}),
  group_2_rescanned:Object.freeze({id:"group_2_rescanned",label:"Group 2 Rescanned",assetRoot:"assets/group_2_rescanned",context:"Group 2's cell line · rescanned WSIs · name pending colleague confirmation"}),
  combined:Object.freeze({id:"combined",label:"Combined (Archive)",assetRoot:"assets/combined",context:"cohort-blocked synthesis of Group 1 and the archived Group 2 scan"}),
  combined_rescanned:Object.freeze({id:"combined_rescanned",label:"Group 1 + Group 2 Rescanned",assetRoot:"assets/combined_rescanned",context:"cohort-blocked cross-cohort synthesis"})
});
const COHORT_QUERY_KEY="cohort";
function requestedCohortId(){
  try{const value=new URL(window.location.href).searchParams.get(COHORT_QUERY_KEY);return COHORT_REGISTRY[value]?value:"group_1"}
  catch(_){return "group_1"}
}
const ACTIVE_COHORT_ID=requestedCohortId();
function activeCohort(){return COHORT_REGISTRY[ACTIVE_COHORT_ID]}
function cohortAssetRoot(){return activeCohort().assetRoot}
function cohortAsset(u){
  const raw=String(u==null?"":u),clean=raw.replace(/^\.\//,"");
  if(!clean.startsWith("assets/")||/^(?:[a-z]+:|\/\/|\/|#)/i.test(raw))return raw;
  const root=cohortAssetRoot();
  if(root==="assets"||clean===root||clean.startsWith(root+"/"))return clean;
  return root+"/"+clean.slice("assets/".length);
}
function logicalAssetPath(u){
  const resolved=cohortAsset(u),root=cohortAssetRoot()+"/";
  return resolved.startsWith(root)?resolved.slice(root.length):resolved.startsWith("assets/")?resolved.slice(7):resolved;
}
function payloadCohortId(payload){
  if(!payload||typeof payload!=="object")return null;
  const meta=payload.meta&&typeof payload.meta==="object"?payload.meta:{};
  const provenance=payload.provenance&&typeof payload.provenance==="object"?payload.provenance:{};
  return payload.cohort||payload.cohort_id||payload.cohortId||meta.cohort||meta.cohort_id||meta.cohortId||provenance.cohort||provenance.cohort_id||provenance.cohortId||null;
}
function assertCohortProvenance(payload,context,required=false){
  const declared=payloadCohortId(payload);
  if(declared&&String(declared)!==ACTIVE_COHORT_ID)throw new Error(`${context}: cohort provenance ${declared} does not match selected ${ACTIVE_COHORT_ID}`);
  if(required&&!declared)throw new Error(`${context}: selected ${activeCohort().label} asset lacks cohort provenance`);
  return payload;
}
function assertTileAssetAlignment(M,KNN){
  if(!M||!KNN)throw new Error("tile meta/KNN alignment requires both assets");
  const n=Number(M.n),k=Number(KNN.k),expected=n*k;
  if(!Number.isInteger(n)||n<1||!Number.isInteger(k)||k<1||k>=n)throw new Error(`invalid tile meta/KNN dimensions (n=${M.n}, k=${KNN.k})`);
  if(!Array.isArray(KNN.idx)||!Array.isArray(KNN.sim)||KNN.idx.length!==expected||KNN.sim.length!==expected)throw new Error(`KNN arrays are not aligned to ${n} tiles at k=${k}`);
  if(KNN.n!=null&&Number(KNN.n)!==n)throw new Error(`KNN n=${KNN.n} does not match tile meta n=${n}`);
  const metaHash=M.atlas_provenance&&M.atlas_provenance.tile_order_sha256;
  const kp=KNN.provenance||{},knnHash=kp.tile_order_sha256;
  if(metaHash&&knnHash&&metaHash!==knnHash)throw new Error("KNN tile-order hash does not match tile metadata");
  const requireExplicit=ACTIVE_COHORT_ID!=="group_1";
  assertCohortProvenance(M,"meta.json",requireExplicit);
  assertCohortProvenance(KNN,"knn.json",requireExplicit);
  if(requireExplicit&&(!metaHash||!knnHash))throw new Error(`${activeCohort().label} tile meta/KNN assets lack required tile-order provenance`);
  return true;
}
const _tileContractAssets={meta:null,knn:null};
function _trackTileContract(logical,payload){
  if(logical==="meta.json")_tileContractAssets.meta=payload;
  if(logical==="knn.json")_tileContractAssets.knn=payload;
  if(_tileContractAssets.meta&&_tileContractAssets.knn)assertTileAssetAlignment(_tileContractAssets.meta,_tileContractAssets.knn);
}
const ARM_ORDER = ["Vehicle", "PLX4720"];
const ARM_COLORS = {Vehicle: "#4C72B0", PLX4720: "#C44E52"};
const TAB10 = ["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd",
               "#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"];
const ROLE_COLORS = {viable_tumour:"#4C72B0",spindled_or_dense:"#8a6fb1",
  necrosis_like:"#c49a36",edge_like:"#8b949e",unreviewed:"#7f8c8d",unknown:"#7f8c8d"};
function av(u){ const resolved=cohortAsset(u);return resolved + (resolved.indexOf('?')<0?'?':'&') + 'v=' + (typeof ASSET_V!=='undefined'?ASSET_V:'0'); }
async function loadCohortJSON(u,options={}){
  const resolved=cohortAsset(u),r=await fetch(av(resolved));
  if(!r.ok)throw new Error(`${activeCohort().label} asset unavailable: ${resolved} (HTTP ${r.status}); no fallback to Group 1`);
  const payload=await r.json();
  assertCohortProvenance(payload,resolved,options.requireProvenance===true);
  _trackTileContract(logicalAssetPath(resolved),payload);
  return payload;
}
async function loadJSON(u){return await loadCohortJSON(u)}
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
function cohortUnavailableMessage(subject="analysis"){
  return `${activeCohort().label} ${subject} assets are unavailable at ${cohortAssetRoot()}; no Group 1 result has been substituted.`;
}
function cohortHref(raw,cohortId=ACTIVE_COHORT_ID){
  if(!raw||raw.startsWith("#")||/^(?:mailto:|tel:|javascript:)/i.test(raw))return raw;
  try{const url=new URL(raw,window.location.href);if(url.origin!==window.location.origin)return raw;url.searchParams.set(COHORT_QUERY_KEY,cohortId);return url.href}catch(_){return raw}
}
function syncCohortChrome(){
  document.documentElement.dataset.cohort=ACTIVE_COHORT_ID;
  const header=document.querySelector("header");if(!header)return;
  let wrap=header.querySelector("[data-cohort-switcher]");
  if(!wrap){
    wrap=document.createElement("div");wrap.className="cohort-switcher";wrap.dataset.cohortSwitcher="";
    wrap.innerHTML='<label for="cohort_selector">Dataset</label><select id="cohort_selector" aria-label="Select dataset"><option value="group_1">Group 1</option><option value="group_2">Group 2 Archive</option><option value="group_2_rescanned">Group 2 Rescanned</option><option value="combined_rescanned">Group 1 + Group 2 Rescanned</option></select><span class="cohort-context" data-cohort-context></span>';
    const banner=header.querySelector(".banner");header.insertBefore(wrap,banner||null);
  }
  const selector=wrap.querySelector("select"),context=wrap.querySelector("[data-cohort-context]");
  if(selector){selector.value=ACTIVE_COHORT_ID;selector.onchange=()=>{const url=new URL(window.location.href);url.searchParams.set(COHORT_QUERY_KEY,selector.value);window.location.assign(url.toString())}}
  if(context)context.textContent=activeCohort().context;
  const banner=header.querySelector(".banner");
  if(banner)banner.textContent=ACTIVE_COHORT_ID==="group_1"?"Preliminary · n = 2 mice/arm · hypothesis-generating, not statistically powered":(ACTIVE_COHORT_ID==="combined"||ACTIVE_COHORT_ID==="combined_rescanned")?"Preliminary · 8 WSIs across 2 cohorts · cohort-blocked, hypothesis-generating":ACTIVE_COHORT_ID==="group_2_rescanned"?"Preliminary · Group 2 Rescanned · n = 2 mice/arm · hypothesis-generating":"Preliminary · Group 2 Archive · n = 2 mice/arm · hypothesis-generating";
  document.querySelectorAll('a[href]').forEach(a=>{const raw=a.getAttribute("href");if(!raw||raw.startsWith("#"))return;try{const url=new URL(raw,window.location.href);if(url.origin===window.location.origin&&url.pathname.endsWith(".html"))a.href=cohortHref(raw)}catch(_){}});
}
document.addEventListener("click",event=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const a=event.target&&event.target.closest?event.target.closest('a[href]'):null;if(!a||a.target||a.hasAttribute("download"))return;
  const raw=a.getAttribute("href");if(!raw||raw.startsWith("#"))return;
  try{const url=new URL(raw,window.location.href);if(url.origin!==window.location.origin||!url.pathname.endsWith(".html"))return;const target=cohortHref(raw);if(target!==url.href){event.preventDefault();window.location.assign(target)}}catch(_){}
});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",syncCohortChrome,{once:true});else syncCohortChrome();
