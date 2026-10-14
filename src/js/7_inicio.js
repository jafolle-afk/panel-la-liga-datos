
// ---------- Navegación, barra y render ----------
const BARF={temporada:['season','team','race'],equipos:['team','season'],h2h:['team','vs','teamB'],jugadores:['season','team','search'],historia:[],disciplina:['season','team','card'],chat:[]};
const RENDER={temporada:renderTemporada,equipos:renderEquipos,h2h:renderH2H,jugadores:renderJugadores,historia:renderHistoria,disciplina:renderDisciplina,chat:()=>{}};
const selS=$('selSeason'),selT=$('selTeam'),selB=$('selTeamB');
selS.innerHTML=SKEYS.slice().reverse().map(k=>`<option value="${k}">${lab(k)}${k===CURRENT?' (en curso)':''}</option>`).join('');
function fillTeams(){
  const order=T.map((n,i)=>i).sort((a,b)=>T[a].localeCompare(T[b],'es'));
  const opts=ids=>ids.map(i=>`<option value="${i}">${esc(T[i])}</option>`).join('');
  if(st.tab==='h2h'||st.tab==='historia'){const big=allAgg().slice(0,20).map(a=>a.t).sort((a,b)=>T[a].localeCompare(T[b],'es'));const g=`<optgroup label="Más temporadas en Primera">${opts(big)}</optgroup><optgroup label="Resto">${opts(order.filter(i=>!big.includes(i)))}</optgroup>`;selT.innerHTML=g;selB.innerHTML=g;}
  else{const inSeason=new Set(DATA.seasons[st.season].map(r=>r[0]));
    selT.innerHTML=`<optgroup label="En ${lab(st.season)}">${opts(order.filter(i=>inSeason.has(i)))}</optgroup><optgroup label="Otras temporadas">${opts(order.filter(i=>!inSeason.has(i)))}</optgroup>`;}
  selT.value=st.team;selB.value=st.teamB;
}
selS.addEventListener('change',()=>{st.season=selS.value;render();});
selT.addEventListener('change',()=>{st.team=+selT.value;if(st.team===st.teamB)st.teamB=+T.indexOf(st.team===T.indexOf('Barcelona')?'Real Madrid':'Barcelona');render();});
selB.addEventListener('change',()=>{st.teamB=+selB.value;render();});
$('btnY').onclick=()=>{st.card='Y';render();};$('btnR').onclick=()=>{st.card='R';render();};
document.querySelectorAll('[data-race]').forEach(b=>b.onclick=()=>{st.race=b.dataset.race;render();});
const srch=$('plSearch');
srch.addEventListener('change',()=>{const v=srch.value.trim();if(v){st.player=v;renderPlayerCard();$('pcardSec').scrollIntoView({behavior:'smooth',block:'start'});}});
srch.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();srch.dispatchEvent(new Event('change'));}});
function goTeam(t){st.team=t;if(st.tab!=='equipos')setTab('equipos');else render();scrollTo({top:0,behavior:'smooth'});}
function goH2H(a,b){st.team=a;st.teamB=b;setTab('h2h');scrollTo({top:0,behavior:'smooth'});}
document.addEventListener('click',e=>{
  const g=e.target.closest('[data-goteam]');if(g){e.preventDefault();goTeam(+g.dataset.goteam);return;}
  const h=e.target.closest('[data-goh2h]');if(h){e.preventDefault();goH2H(st.team,+h.dataset.goh2h);return;}
  const p=e.target.closest('[data-player]');if(p){e.preventDefault();srch.value=p.dataset.player;openPlayer(p.dataset.player);}
});
const tabBtns=[...document.querySelectorAll('.tab')];
tabBtns.forEach(b=>{b.setAttribute('aria-controls','v-'+b.dataset.tab);b.onclick=()=>setTab(b.dataset.tab);});
document.querySelector('.tabs').addEventListener('keydown',e=>{if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;const vis=tabBtns.filter(b=>!b.hidden);const i=vis.indexOf(document.activeElement);if(i<0)return;const n=vis[(i+(e.key==='ArrowRight'?1:-1)+vis.length)%vis.length];n.focus();n.click();});
function setTab(t){
  if(!TABS.includes(t)||(t==='chat'&&$('tabChat').hidden))t='temporada';
  const changed=st.tab!==t;
  st.tab=t;tabBtns.forEach(b=>{const on=b.dataset.tab===t;b.setAttribute('aria-selected',on);b.tabIndex=on?0:-1;});
  TABS.forEach(x=>{$('v-'+x).hidden=x!==t;});
  try{history.replaceState(null,'','#'+t);}catch(e){}
  render();
  if(changed)scrollTo({top:0});
  if(t==='chat')$('askInput').focus({preventScroll:true});
}
function render(){
  const fs=BARF[st.tab]||[];
  $('bar').hidden=!fs.length;
  document.querySelectorAll('#bar .field').forEach(f=>f.hidden=!fs.includes(f.dataset.f));
  $('lblTeam').textContent=st.tab==='h2h'?'Equipo':st.tab==='equipos'||st.tab==='disciplina'?'Equipo':'Resaltar equipo';
  selS.value=st.season;fillTeams();
  $('btnY').setAttribute('aria-pressed',st.card==='Y');$('btnR').setAttribute('aria-pressed',st.card==='R');
  document.querySelectorAll('[data-race]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.race===st.race));
  try{RENDER[st.tab]();}catch(err){console.error(err);}
  $('tabTitle').textContent=tabTitle();
  save();
}
function tabTitle(){const s=lab(st.season);return {temporada:'Temporada '+s,equipos:'Equipos · '+T[st.team],h2h:'Cara a cara · '+T[st.team]+' – '+T[st.teamB],jugadores:'Jugadores · '+s,historia:'Historia · '+lab(SKEYS[0])+' – '+lab(SKEYS[SKEYS.length-1]),disciplina:'Disciplina · '+s,chat:'Chat · Pregunta a los datos'}[st.tab]||'';}
// La barra de filtros se pega justo debajo de la cabecera, que cambia de alto según la pantalla
const hdr=document.querySelector('header.top');
const setHdr=()=>document.documentElement.style.setProperty('--hdr',hdr.offsetHeight+'px');
if(window.ResizeObserver)new ResizeObserver(setHdr).observe(hdr);else setHdr();
addEventListener('resize',()=>{const nw=innerWidth<600?420:640;if(nw!==W){W=nw;render();}});
$('updFoot').textContent=UPD;$('nSeasons').textContent=SKEYS.length;$('nMatches').textContent=fmt(allMatches().length);
setTab(st.tab);
</script>
