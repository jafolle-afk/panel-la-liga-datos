<script>
const DATA = /*DATA*/null;
const PD = /*PDATA*/null;
const MRAW = /*MDATA*/null;
const I={team:0,pos:1,P:2,W:3,D:4,L:5,GF:6,GA:7,Pts:8,hW:9,hD:10,hL:11,hGF:12,hGA:13,aW:14,aD:15,aL:16,aGF:17,aGA:18,S:19,SA:20,ST:21,STA:22,F:23,FA:24,C:25,CA:26,Y:27,R:28,oY:29,oR:30,cb:31,bl:32,posStr:33};
const T=DATA.teams;
const SKEYS=Object.keys(DATA.seasons).sort();
const CURRENT=DATA.current||'2026';
const UPD=DATA.updated||'20/09/2026', PUPD='20/09/2026'; // resultados / jugadores
const DONE=SKEYS.filter(k=>k!==CURRENT);
const lab=k=>k+'/'+String((+k+1)%100).padStart(2,'0');
const short=k=>String(k).slice(2)+'/'+String((+k+1)%100).padStart(2,'0');
const fmt=(n,d=0)=>n==null||Number.isNaN(n)?'—':n.toLocaleString('es-ES',{minimumFractionDigits:d,maximumFractionDigits:d});
const pct=(a,b)=>b?fmt(a/b*100,0)+'%':'—';
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const rowOf=(k,t)=>DATA.seasons[k]&&DATA.seasons[k].find(r=>r[0]===t);
const hasStats=k=>DATA.seasons[k][0][I.S]!=null;
const hasY=k=>DATA.seasons[k][0][I.Y]!=null, hasR=k=>DATA.seasons[k][0][I.R]!=null;
const cardKeys=f=>SKEYS.filter(k=>DATA.seasons[k][0][f]!=null);
const PH=PD.h||{};
const winPts=k=>DATA.win[k]||3;
const pts3=r=>3*r[I.W]+r[I.D];
const $=id=>document.getElementById(id);
const ABBR={'Real Madrid':'RMA','Barcelona':'BAR','Atlético de Madrid':'ATM','Athletic Club':'ATH','Real Sociedad':'RSO','Real Betis':'BET','Sevilla':'SEV','Valencia':'VAL','Villarreal':'VIL','Celta de Vigo':'CEL','Deportivo':'DEP','Espanyol':'ESP','Rayo Vallecano':'RAY','Racing de Santander':'RAC','Sporting de Gijón':'SPO','Real Oviedo':'OVI','Zaragoza':'ZAR','Málaga':'MÁL','Mallorca':'MLL','Osasuna':'OSA','Getafe':'GET','Girona':'GIR','Levante':'LEV','Alavés':'ALA','Elche':'ELC','Las Palmas':'LPA','Granada':'GRA','Cádiz':'CÁD','Leganés':'LEG','Valladolid':'VLL','Almería':'ALM','AD Almería':'ADA','Hércules':'HÉR','Real Murcia':'MUR','Tenerife':'TEN','Real Unión':'RUN','Arenas de Getxo':'ARE','CE Europa':'EUR','CD Condal':'CON','CD Málaga':'CDM','Real Burgos':'RBU','Burgos CF':'BUR','Real Jaén':'JAÉ','Atlético Tetuán':'TET','Cultural Leonesa':'CUL','Castellón':'CAS','Alcoyano':'ALC','Córdoba':'CÓR','Compostela':'COM','Eibar':'EIB','Extremadura':'EXT','Gimnàstic':'NÀS','Huesca':'HUE','Lleida':'LLE','Logroñés':'LOG','Mérida':'MÉR','Numancia':'NUM','Pontevedra':'PON','Recreativo':'REC','Sabadell':'SAB','Salamanca':'SAL','Xerez':'XER'};
const ab=t=>ABBR[T[t]]||T[t].slice(0,3).toUpperCase();
const LC=['var(--c1)','var(--c2)','var(--c3)','var(--c4)','var(--c5)','var(--c6)','var(--c7)','var(--c8)'];

// ---------- Partidos (27.784, codificados en 6 caracteres) ----------
const B64='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';const BI={};[...B64].forEach((c,i)=>BI[c]=i);
const MC={};
function matches(k){if(MC[k])return MC[k];const s=MRAW[k]||'',out=[],base=Date.UTC(+k,6,1);
  for(let i=0;i<s.length;i+=6){const d=BI[s[i]]*64+BI[s[i+1]];out.push({k,d,ts:base+d*864e5,h:BI[s[i+2]],a:BI[s[i+3]],hg:BI[s[i+4]],ag:BI[s[i+5]]});}
  return MC[k]=out;}
const fdate=m=>{const d=new Date(m.ts);return String(d.getUTCDate()).padStart(2,'0')+'/'+String(d.getUTCMonth()+1).padStart(2,'0')+'/'+d.getUTCFullYear();};
let ALLM=null;const allMatches=()=>ALLM||(ALLM=SKEYS.flatMap(k=>matches(k)));
const resOf=(m,t)=>{const gf=m.h===t?m.hg:m.ag,ga=m.h===t?m.ag:m.hg;return gf>ga?'W':gf<ga?'L':'D';};

// Información derivada de una temporada (cacheada)
const SI={};
function seasonInfo(k){
  if(SI[k])return SI[k];
  const rows=DATA.seasons[k],w=winPts(k),ms=matches(k),G={};
  rows.forEach(r=>G[r[0]]=[]);
  ms.forEach(m=>{[[m.h,m.hg,m.ag,1,m.a],[m.a,m.ag,m.hg,0,m.h]].forEach(([t,gf,ga,home,opp])=>{if(!G[t])G[t]=[];const res=gf>ga?'W':gf<ga?'L':'D';G[t].push({m,gf,ga,home,opp,res,pts:res==='W'?w:res==='D'?1:0});});});
  const cum={};for(const t in G){let s=0;cum[t]=G[t].map(g=>s+=g.pts);}
  const streak=(arr,ok)=>{let best=0,cur=0,end=-1;arr.forEach((g,i)=>{if(ok(g)){cur++;if(cur>best){best=cur;end=i;}}else cur=0;});return {n:best,end};};
  const st={};for(const t in G)st[t]={win:streak(G[t],g=>g.res==='W'),unb:streak(G[t],g=>g.res!=='L'),loss:streak(G[t],g=>g.res==='L'),winless:streak(G[t],g=>g.res!=='W')};
  // campeón matemático
  let clinch=null;
  if(k!==CURRENT){const c=rows[0][0],tot={},pl={},pt={};rows.forEach(r=>{tot[r[0]]=r[I.P];pl[r[0]]=0;pt[r[0]]=0;});
    for(let i=0;i<ms.length;i++){const m=ms[i];[[m.h,m.hg,m.ag],[m.a,m.ag,m.hg]].forEach(([t,gf,ga])=>{pl[t]++;pt[t]+=gf>ga?w:gf===ga?1:0;});
      if(ms[i+1]&&ms[i+1].d===m.d)continue;
      const mx=Math.max(...rows.filter(r=>r[0]!==c).map(r=>pt[r[0]]+(tot[r[0]]-pl[r[0]])*w));
      if(pt[c]>mx){clinch={j:pl[c],left:tot[c]-pl[c],date:fdate(m)};break;}}}
  let big=null;ms.forEach(m=>{const d=Math.abs(m.hg-m.ag);if(!big||d>Math.abs(big.hg-big.ag)||(d===Math.abs(big.hg-big.ag)&&m.hg+m.ag>big.hg+big.ag))big=m;});
  return SI[k]={rows,w,ms,G,cum,st,clinch,big};
}
const prevKey=k=>{const i=SKEYS.indexOf(k);return i>0?SKEYS[i-1]:null;};

let st={tab:'temporada',season:'2025',team:T.indexOf('Real Madrid'),teamB:T.indexOf('Barcelona'),card:'R',race:'top',sort:{k:'pos',d:1},sortAll:{k:'Pts3',d:-1},sortCards:{k:'R',d:-1},player:null,h2hDec:'last'};
try{const s=JSON.parse(localStorage.getItem('liga-state5')||'null');if(s){if(DATA.seasons[s.season])st.season=s.season;if(T[s.team])st.team=s.team;if(T[s.teamB])st.teamB=s.teamB;if(s.card)st.card=s.card;if(s.race)st.race=s.race;}}catch(e){}
const TABS=['temporada','equipos','h2h','jugadores','historia','disciplina','chat'];
{const h=location.hash.slice(1);if(TABS.includes(h))st.tab=h;}
const save=()=>{try{localStorage.setItem('liga-state5',JSON.stringify({season:st.season,team:st.team,teamB:st.teamB,card:st.card,race:st.race}))}catch(e){}};

// ---------- Tooltip ----------
const tip=$('tip');
function showTip(e,html){tip.innerHTML=html;tip.style.opacity=1;const pad=14;let x=e.clientX+pad,y=e.clientY+pad;const r=tip.getBoundingClientRect();if(x+r.width>innerWidth-8)x=e.clientX-r.width-pad;if(y+r.height>innerHeight-8)y=e.clientY-r.height-pad;tip.style.left=Math.max(8,x)+'px';tip.style.top=Math.max(8,y)+'px';}
document.addEventListener('pointermove',e=>{const t=e.target.closest&&e.target.closest('[data-tip]');if(t)showTip(e,t.getAttribute('data-tip'));else tip.style.opacity=0;});
document.addEventListener('pointerdown',e=>{const t=e.target.closest&&e.target.closest('[data-tip]');if(t)showTip(e,t.getAttribute('data-tip'));});
addEventListener('scroll',()=>tip.style.opacity=0,{passive:true});

// ---------- SVG helpers ----------
let W=innerWidth<600?420:640;
function niceMax(v){if(v<=0)return 1;const p=Math.pow(10,Math.floor(Math.log10(v)));const n=v/p;const m=n<=1?1:n<=2?2:n<=2.5?2.5:n<=5?5:10;return m*p;}
function ticks(max,n=4){const step=niceMax(max/n);const out=[];for(let v=0;v<=max+1e-9;v+=step)out.push(+v.toFixed(6));return out;}
function hbar(x0,x1,y,h,r=3){const w=Math.abs(x1-x0);if(w<0.5)return '';r=Math.min(r,w,h/2);
  if(x1>=x0)return `M${x0},${y}H${x1-r}Q${x1},${y} ${x1},${y+r}V${y+h-r}Q${x1},${y+h} ${x1-r},${y+h}H${x0}Z`;
  return `M${x0},${y}H${x1+r}Q${x1},${y} ${x1},${y+r}V${y+h-r}Q${x1},${y+h} ${x1+r},${y+h}H${x0}Z`;}
function vbar(x,w,yBase,yTop,r=3){const h=yBase-yTop;if(h<0.5)return '';r=Math.min(r,w/2,h);return `M${x},${yBase}V${yTop+r}Q${x},${yTop} ${x+r},${yTop}H${x+w-r}Q${x+w},${yTop} ${x+w},${yTop+r}V${yBase}Z`;}
// separa etiquetas verticalmente para que no se pisen
function spread(items,minGap,lo,hi){items.sort((a,b)=>a.y-b.y);for(let i=1;i<items.length;i++)if(items[i].y-items[i-1].y<minGap)items[i].y=items[i-1].y+minGap;
  const over=items.length?items[items.length-1].y-hi:0;if(over>0){items[items.length-1].y-=over;for(let i=items.length-2;i>=0;i--)if(items[i+1].y-items[i].y<minGap)items[i].y=items[i+1].y-minGap;}return items;}
const kpi=(k,v,s)=>`<div class="kpi"><span class="k">${k}</span><span class="v">${v}</span><span class="s">${s||''}</span></div>`;
// Colores de la camiseta de cada club (no son escudos oficiales). [patrón, color1, color2, color para gráficos]
// patrones: liso, raya (camiseta lisa con una franja horizontal), rayas (verticales), aros (horizontales), banda (diagonal), mitades, cuartos
const W_='#ffffff';
const CLUB={'Real Madrid':['raya',W_,'#5b2d8e','#5b2d8e'],'Barcelona':['rayas','#a50044','#004d98'],'Atlético de Madrid':['rayas','#cb3524',W_],'Athletic Club':['rayas','#ee2523',W_],'Real Sociedad':['rayas','#0067b1',W_],'Real Betis':['rayas','#00954c',W_],'Sevilla':['raya',W_,'#d4021d'],'Valencia':['raya',W_,'#1a1a1a','#f18a00'],'Villarreal':['liso','#ffe14d',null,'#e0b400'],'Celta de Vigo':['liso','#8ac3ee',null,'#4f9fd8'],'Deportivo':['rayas','#0063b2',W_],'Espanyol':['rayas','#0077c8',W_],'Rayo Vallecano':['banda',W_,'#e53027'],'Racing de Santander':['raya',W_,'#00843d'],'Sporting de Gijón':['rayas','#e30613',W_],'Real Oviedo':['liso','#0d3f8c'],'Zaragoza':['raya',W_,'#0056a3'],'Málaga':['rayas','#6cace4',W_,'#3f8fcf'],'Mallorca':['liso','#e20613'],'Osasuna':['liso','#d91a21'],'Getafe':['liso','#005999'],'Girona':['rayas','#cd2534',W_],'Levante':['rayas','#b4053f','#005da8'],'Alavés':['rayas','#0761af',W_],'Elche':['raya',W_,'#05642c'],'Las Palmas':['liso','#ffe400',null,'#d9b800'],'Granada':['aros','#c31632',W_],'Cádiz':['liso','#ffe500',null,'#d9b800'],'Leganés':['rayas','#0050a0',W_],'Valladolid':['rayas','#921b88',W_],'Almería':['rayas','#ee1119',W_],'Hércules':['rayas','#0b4ea2',W_],'Real Murcia':['liso','#c4122e'],'Tenerife':['raya',W_,'#0d4c9c'],'Eibar':['rayas','#a50044','#0b3d91'],'Huesca':['rayas','#a50044','#005ea6'],'Córdoba':['rayas','#00843d',W_],'Real Unión':['raya',W_,'#1a1a1a'],'Arenas de Getxo':['rayas','#c4122e','#1a1a1a'],'Recreativo':['rayas','#0b4ea2',W_],'Xerez':['rayas','#0b4ea2',W_],'Numancia':['liso','#c4122e'],'Salamanca':['raya',W_,'#1a1a1a'],'Castellón':['rayas','#1a1a1a',W_],'Burgos CF':['raya',W_,'#1a1a1a'],'Pontevedra':['liso','#7a1f2b'],'Gimnàstic':['liso','#c4122e'],'Alcoyano':['raya',W_,'#0b4ea2'],'CD Condal':['rayas','#a50044','#004d98'],'Atlético Tetuán':['rayas','#cb3524',W_],'Cultural Leonesa':['raya',W_,'#1a1a1a'],'Sabadell':['cuartos','#0b4ea2',W_],'AD Almería':['rayas','#ee1119',W_],'Albacete':['liso',W_,null,'#8a949c']};
const clubSpec=t=>{const c=CLUB[T[t]];if(c)return c;let h=0;for(const ch of T[t])h=(h*31+ch.charCodeAt(0))>>>0;return ['mitades',`hsl(${h%360} 50% 42%)`,`hsl(${(h>>8)%360} 30% 85%)`];};
function crestBg([p,a,b]){b=b||a;switch(p){
  case 'liso':return a;
  case 'raya':return `linear-gradient(180deg,${a} 0 40%,${b} 40% 60%,${a} 60%)`;
  case 'rayas':return `repeating-linear-gradient(90deg,${a} 0 20%,${b} 20% 40%)`;
  case 'aros':return `repeating-linear-gradient(180deg,${a} 0 20%,${b} 20% 40%)`;
  case 'banda':return `linear-gradient(135deg,${a} 0 38%,${b} 38% 62%,${a} 62%)`;
  case 'cuartos':return `conic-gradient(${a} 0 25%,${b} 0 50%,${a} 0 75%,${b} 0)`;
  default:return `linear-gradient(90deg,${a} 0 50%,${b} 50%)`;}}
const crest=(t,sz='')=>`<span class="crest ${sz}" style="background:${crestBg(clubSpec(t))}" aria-hidden="true"></span>`;
const tname=t=>`<span class="tname">${crest(t)}${esc(T[t])}</span>`;
const lum=h=>{if(!/^#/.test(h))return .4;const n=parseInt(h.slice(1),16);return (0.2126*((n>>16)&255)+0.7152*((n>>8)&255)+0.0722*(n&255))/255;};
const chartCol=t=>{const [p,a,b,c]=clubSpec(t);if(c)return c;const cand=[a,b].filter(x=>x&&lum(x)<.8);return cand[0]||null;};
function lineColors(teams){const used=new Set(),out=[];teams.forEach((t,i)=>{let c=chartCol(t);if(c&&lum(c)<.15)c='var(--ink)';if(!c||used.has(c)){c=LC.find(x=>!used.has(x))||LC[i%LC.length];}used.add(c);out.push(c);});return out;}
const teamBtn=t=>`<button type="button" class="pl" data-goteam="${t}">${crest(t)}${esc(T[t])}</button>`;

// Trayectoria (puesto final por temporada) para uno o varios equipos
function posChart(teams,colors,H=240,keys){
  const KS=keys||SKEYS,few=KS.length<=14;
  const L=36,R=few?22:12,Tp=few?20:12,B=26,n=KS.length,step=(W-L-R)/Math.max(n-1,1),maxP=few?Math.max(6,...KS.flatMap(k=>teams.map(t=>{const r=rowOf(k,t);return r?r[I.pos]+1:0;}))):Math.max(20,...KS.map(k=>DATA.seasons[k].length));
  const x=i=>L+(n===1?(W-L-R)/2:i*step),y=p=>Tp+(p-1)/(maxP-1)*(H-Tp-B);
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Puesto final por temporada">`;
  (few?[1,2,3,4,6,8,10,12,15,18,20,22].filter(p=>p<=maxP&&(maxP<=10||p%2===0||p===1||p===15)):[1,5,10,15,20]).forEach(p=>{s+=`<line class="gridl" x1="${L}" x2="${W-R}" y1="${y(p)}" y2="${y(p)}"/><text x="${L-8}" y="${y(p)+4}" text-anchor="end">${p}º</text>`;});
  KS.forEach((k,i)=>{if(few?(W>=600||i%2===0):+k%(W<600?20:10)===0)s+=`<text x="${x(i)}" y="${H-6}" text-anchor="middle">${few?short(k):k}</text>`;});
  teams.forEach((t,ti)=>{const col=colors[ti];let seg=[];const segs=[];
    KS.forEach((k,i)=>{const r=rowOf(k,t);if(r)seg.push([x(i),y(r[I.pos])]);else{if(seg.length)segs.push(seg);seg=[];}});if(seg.length)segs.push(seg);
    segs.forEach(sg=>{s+=sg.length>1?`<polyline fill="none" stroke="${col}" stroke-width="${few?2.5:1.6}" stroke-linejoin="round" points="${sg.map(p=>p.join(',')).join(' ')}"/>`:'';});
    KS.forEach((k,i)=>{const r=rowOf(k,t);if(!r)return;const champ=r[I.pos]===1&&k!==CURRENT;
      if(few){s+=`<circle cx="${x(i)}" cy="${y(r[I.pos])}" r="${champ?6:4.5}" fill="${champ?'var(--gold)':col}" stroke="${col}" stroke-width="2"/><text class="lbl" x="${x(i)}" y="${(()=>{const o=teams.filter(u=>u!==t).map(u=>rowOf(k,u)).find(Boolean);const above=!o||r[I.pos]<o[I.pos];return above?y(r[I.pos])-10:y(r[I.pos])+19;})()}" text-anchor="middle" style="fill:${col};font-weight:500">${r[I.pos]}º</text>`;}
      else if(champ)s+=`<circle cx="${x(i)}" cy="${y(1)}" r="4" fill="var(--gold)" stroke="${col}" stroke-width="1.2"/>`;
      else if(segs.some(sg=>sg.length===1&&sg[0][0]===x(i)))s+=`<circle cx="${x(i)}" cy="${y(r[I.pos])}" r="2" fill="${col}"/>`;});});
  KS.forEach((k,i)=>{const parts=teams.map(t=>{const r=rowOf(k,t);return `${esc(T[t])}: <span class=num>${r?r[I.pos]+'º':'no estaba en Primera'}</span>`;});
    s+=`<rect class="hit" x="${x(i)-step/2}" y="${Tp}" width="${Math.max(step,6)}" height="${H-Tp-B}" data-tip="${esc(`<b>${lab(k)}${k===CURRENT?' (en curso)':''}</b><br>${parts.join('<br>')}`)}"/>`;});
  return s+'</svg>';
}
// Cartel de partido
function gameLi(m,opts={}){const hw=m.hg>m.ag,aw=m.ag>m.hg;
  return `<li><span class="d">${opts.season?lab(m.k):fdate(m)}</span><span class="h ${hw?'win':''}">${esc(T[m.h])}</span><span class="s">${m.hg}–${m.ag}</span><span class="a ${aw?'win':''}">${esc(T[m.a])}</span></li>`;}
