
// ---------- JUGADORES ----------
const norm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim();
const plBtn=n=>`<button type="button" class="pl" data-player="${esc(n)}">${esc(n)}</button>`;
function plCard(title,rows,val,sub,fmtv,isMe,note){
  return `<div class="panel"><div class="panel-head"><h3>${title}</h3>${note?`<span class="note">${note}</span>`:''}</div>${rows.length?`<ol class="rank">${rows.map((p,i)=>{const v=val(p);return `<li class="${isMe(p)?'me':''}"><span class="i">${i+1}</span><span class="t">${plBtn(p[0])}<small>${esc(p[1])}${sub?' · '+sub(p):''}</small></span><span class="v">${fmtv?fmtv(v):v}</span></li>`}).join('')}</ol>`:'<p class="note">Sin datos esta temporada.</p>'}</div>`;
}
const topBy=(rows,f,n=8,asc=false)=>rows.filter(p=>f(p)!=null&&(asc||f(p)>0)).sort((a,b)=>asc?f(a)-f(b):f(b)-f(a)).slice(0,n);

// Índice de jugadores (todas las fuentes)
let PIDX=null;
function playerIndex(){
  if(PIDX)return PIDX;const ix=new Map();
  const get=(n)=>{const key=norm(n);let p=ix.get(key);if(!p){p={name:n,seasons:{},car:null};ix.set(key,p);}return p;};
  const rec=(p,k)=>p.seasons[k]||(p.seasons[k]={});
  for(const k of Object.keys(PH))if(k<'1988'){const h=PH[k];
    (h.G||[]).forEach(x=>{const r=rec(get(x[0]),k);r.t=x[1];r.g=x[2];});
    (h.Y||[]).forEach(x=>{const r=rec(get(x[0]),k);r.t=r.t||x[1];r.y=x[2];});
    (h.R||[]).forEach(x=>{const r=rec(get(x[0]),k);r.t=r.t||x[1];r.r=x[2];});}
  for(const k of Object.keys(FB))FB[k].forEach(x=>{const r=rec(get(x[0]),k);Object.assign(r,{t:x[1],mp:x[2],min:x[3],g:x[4],a:x[5],pk:x[6],y:x[7],r:x[8],f:x[10]});});
  for(const k of Object.keys(PD.s||{}))PD.s[k].forEach(x=>{const p=ix.get(norm(x[0]));if(p&&p.seasons[k])p.seasons[k].xg=x[7];});
  for(const k of SKEYS){const z=zamora(k);if(!z)continue;z.rows.forEach((x,i)=>{const r=rec(get(x[0]),k);r.t=r.t||x[1];r.gk={coef:x[2],mp:x[3],ga:x[4],cs:x[5]};if(i===0&&k!==CURRENT)r.zam=1;});}
  DONE.forEach(k=>topScorers(k).forEach(s=>{const r=rec(get(s.n),k);r.pichi=1;if(r.g==null)r.g=s.g;r.t=r.t||s.t;}));
  FBCAR.forEach(c=>{get(c[0]).car=c;});
  return PIDX=ix;
}
function fillPlayerNames(){const ix=playerIndex();$('plNames').innerHTML=[...ix.values()].map(p=>p.name).sort((a,b)=>a.localeCompare(b,'es')).map(n=>`<option value="${esc(n)}">`).join('');}
function openPlayer(name){st.player=name;if(st.tab!=='jugadores')setTab('jugadores');else renderPlayerCard();$('pcardSec').scrollIntoView({behavior:'smooth',block:'start'});}
function renderPlayerCard(){
  const sec=$('pcardSec'),el=$('pcard');
  if(!st.player){sec.hidden=true;return;}
  sec.hidden=false;const ix=playerIndex();let p=ix.get(norm(st.player));
  if(!p){const q=norm(st.player);const cands=[...ix.values()].filter(x=>norm(x.name).includes(q)).slice(0,12);
    el.innerHTML=cands.length?`<div class="panel"><p>No hay un jugador llamado «${esc(st.player)}». ¿Quizá…?</p><div class="chips">${cands.map(c=>`<button type="button" class="chip" data-player="${esc(c.name)}">${esc(c.name)}</button>`).join('')}</div></div>`:`<div class="empty">No encuentro a «${esc(st.player)}» entre los jugadores destacados guardados.</div>`;return;}
  const ks=Object.keys(p.seasons).sort(),S=ks.map(k=>[k,p.seasons[k]]);
  const pich=S.filter(([k,r])=>r.pichi).map(([k])=>short(k)),zam=S.filter(([k,r])=>r.zam).map(([k])=>short(k));
  const teams=[...new Set(S.map(([k,r])=>r.t).filter(Boolean).flatMap(t=>String(t).split(',')))];
  const c=p.car;const sum=f=>S.reduce((a,[k,r])=>a+(r[f]||0),0);
  let h=`<div class="pname">${esc(p.name)}</div><div>${pich.length?`<span class="badge gold">Máximo goleador ×${pich.length} · ${pich.join(', ')}</span>`:''}${zam.length?`<span class="badge gold">Zamora ×${zam.length} · ${zam.join(', ')}</span>`:''}<span class="note">${esc(teams.join(' · '))}</span></div>`;
  if(c)h+=`<div class="kpis">${kpi('Temporadas',c[FC.s],`${lab(String(c[FC.first]))} – ${lab(String(c[FC.last]))}`)}${kpi('Partidos',fmt(c[FC.mp]),fmt(c[FC.min])+' minutos')}${kpi('Goles',fmt(c[FC.g]),c[FC.pk]+' de penalti')}${kpi('Asistencias',c[FC.a]!=null?fmt(c[FC.a]):'—','desde 1999/00')}${kpi('Tarjetas',`${c[FC.y]} / ${c[FC.r]}`,'amarillas / rojas')}</div><p class="note">Totales de carrera en Primera desde 1988/89 (FBref).</p>`;
  else{const g=sum('g');h+=`<div class="kpis">${kpi('Temporadas registradas',S.length,`${lab(ks[0])} – ${lab(ks[ks.length-1])}`)}${g?kpi('Goles',fmt(g),'en las temporadas registradas'):''}${S.some(([k,r])=>r.gk)?kpi('Temporadas como portero',S.filter(([k,r])=>r.gk).length,'entre los menos goleados'):''}</div>`;}
  const hasA=S.some(([k,r])=>r.a!=null),hasXg=S.some(([k,r])=>r.xg!=null),hasGk=S.some(([k,r])=>r.gk),hasMp=S.some(([k,r])=>r.mp!=null);
  h+=`<div class="panel"><div class="tscroll"><table><thead><tr><th class="l">Temporada</th><th class="l">Equipo</th>${hasMp?'<th>PJ</th>':''}<th>Goles</th>${hasA?'<th>Asist.</th>':''}${hasXg?'<th>xG</th>':''}<th><span class="card-ico y"></span></th><th><span class="card-ico r"></span></th>${hasGk?'<th>Encajados/partido</th>':''}<th class="l"></th></tr></thead><tbody>`+
    S.map(([k,r])=>`<tr><td class="l">${lab(k)}</td><td class="l team">${esc(r.t||'')}</td>${hasMp?`<td>${r.mp??'—'}</td>`:''}<td>${r.g??'—'}</td>${hasA?`<td>${r.a??'—'}</td>`:''}${hasXg?`<td>${r.xg!=null?fmt(r.xg,1):'—'}</td>`:''}<td>${r.y??'—'}</td><td>${r.r??'—'}</td>${hasGk?`<td>${r.gk?fmt(r.gk.coef,2):'—'}</td>`:''}<td class="l">${r.pichi?'<span class="badge gold">Máx. goleador</span>':''}${r.zam?'<span class="badge gold">Zamora</span>':''}</td></tr>`).join('')+'</tbody></table></div>'+
    `<p class="note">Solo aparecen las temporadas en las que estuvo entre los jugadores destacados que guarda el panel (antes de 1988/89: los 10 máximos goleadores y los 5 más amonestados de cada año).</p></div>`;
  el.innerHTML=h;
}

function renderJugadores(){
  const k=st.season,me=p=>inTeam(p[1],st.team);
  if(!$('plNames').options.length)fillPlayerNames();
  renderPlayerCard();
  $('plTitle').textContent='Líderes de '+lab(k);
  $('plLede').textContent='Los mejores de la temporada elegida. Los jugadores del equipo seleccionado aparecen resaltados; pulsa un nombre para ver su ficha.'+(k===CURRENT?' Datos de jugadores de la temporada en curso hasta el '+PUPD+'.':'');
  const g=$('plGrid');let h='';const z=zamora(k);
  const zCard=z?plCard('Trofeo Zamora',z.rows.slice(0,8),p=>p[2],p=>`${p[4]} goles en ${p[3]} partidos${p[5]!=null?' · '+p[5]+' a cero':''}`,v=>fmt(v,2),me,'encajados por partido · '+z.rule):'';
  if(FB[k]){const rows=FB[k];const hasA=rows.some(p=>p[F.a]!=null);
    h+=plCard('Máximos goleadores',topBy(rows,p=>p[F.g]),p=>p[F.g],p=>`${p[F.pk]??0} de penalti · ${p[F.mp]} partidos`,null,me);
    if(hasA)h+=plCard('Más asistencias',topBy(rows,p=>p[F.a]),p=>p[F.a],p=>`${p[F.g]} goles`,null,me);
    if(hasA)h+=plCard('Goles + asistencias',topBy(rows,p=>p[F.a]!=null?p[F.g]+p[F.a]:null),p=>p[F.g]+p[F.a],p=>`${p[F.g]} goles · ${p[F.a]} asist.`,null,me);
    h+=zCard;
    if(PD.s[k]){const u=PD.s[k];h+=plCard('Más goles por encima de su xG',u.slice().sort((a,b)=>(b[P.G]-b[P.xG])-(a[P.G]-a[P.xG])).slice(0,8),p=>+(p[P.G]-p[P.xG]).toFixed(1),p=>`${p[P.G]} goles con xG ${fmt(p[P.xG],1)}`,v=>(v>0?'+':'')+fmt(v,1),me);
      h+=plCard('Más ocasiones generadas (xA)',u.slice().sort((a,b)=>b[P.xA]-a[P.xA]).slice(0,8),p=>p[P.xA],p=>`${p[P.A]} asistencias`,v=>fmt(v,1),me);}
    else h+=plCard('Más goles de penalti',topBy(rows,p=>p[F.pk]),p=>p[F.pk],p=>`${p[F.g]} goles en total`,null,me);
  } else if(PH[k]){const hh=PH[k];
    h+=plCard('Máximos goleadores',hh.G,p=>p[2],null,null,p=>p[1]===T[st.team])+zCard;
    h+=`<div class="panel"><p class="note">Para ${lab(k)} se guardan los 10 máximos goleadores y los 5 porteros menos goleados (BDFútbol). Asistencias desde 1999/00 y xG desde 2014/15.</p></div>`;
  } else h=`<div class="panel"><p class="note">No hay datos de jugadores para ${lab(k)}.</p></div>`;
  g.innerHTML=h;
  renderPalmares();
  const C=[
    {h:'Goles',f:c=>c[FC.g],sub:c=>`${c[FC.s]} temporadas · ${c[FC.mp]} partidos`},
    {h:'Asistencias',f:c=>c[FC.a],sub:c=>`${c[FC.s]} temporadas · desde 1999/00`},
    {h:'Goles + asistencias',f:c=>c[FC.g]+(c[FC.a]||0),sub:c=>`${c[FC.g]} goles · ${c[FC.a]} asist.`},
    {h:'Partidos jugados',f:c=>c[FC.mp],sub:c=>`${lab(String(c[FC.first]))}–${lab(String(c[FC.last]))}`},
    {h:'Goles por partido',f:c=>c[FC.mp]>=100?c[FC.g]/c[FC.mp]:null,sub:c=>`${c[FC.g]} goles en ${c[FC.mp]} partidos`,fm:v=>fmt(v,2),note:'mínimo 100 partidos'},
    {h:'Goles de penalti',f:c=>c[FC.pk],sub:c=>`${c[FC.g]} goles en total`},
  ];
  $('carGrid').innerHTML=C.map(s=>plCard(s.h,FBCAR.filter(c=>s.f(c)!=null).sort((a,b)=>s.f(b)-s.f(a)).slice(0,8),s.f,s.sub,s.fm,c=>c[1]===T[st.team],s.note)).join('');
}
function renderPalmares(){
  const pich=DONE.map(k=>[k,topScorers(k)]).filter(x=>x[1].length);
  $('pichiGrid').innerHTML=pich.slice().reverse().map(([k,a])=>`<div class="${a.some(s=>inTeam(s.t,st.team))?'me':''}" data-tip="${esc(a.map(s=>`<b>${esc(s.n)}</b> (${esc(s.t)}) · ${s.g} goles`).join('<br>'))}"><span class="y">${lab(k)}</span><span class="c">${esc(a.map(s=>s.n).join(' / '))}</span><span class="d">${esc(a[0].t)} · ${a[0].g}</span></div>`).join('');
  const cnt=new Map();pich.forEach(([k,a])=>a.forEach(s=>{const key=norm(s.n);const x=cnt.get(key)||{n:s.n,ks:[],t:new Set()};x.ks.push(k);x.t.add(s.t);cnt.set(key,x);}));
  $('pichiRank').innerHTML=[...cnt.values()].sort((a,b)=>b.ks.length-a.ks.length||a.ks[0]-b.ks[0]).slice(0,12).map((x,i)=>`<li><span class="i">${i+1}</span><span class="t">${plBtn(x.n)}<small>${esc([...x.t].join(', '))} · ${x.ks.map(short).join(' · ')}</small></span><span class="v">${x.ks.length}</span></li>`).join('');
  const zs=DONE.map(k=>[k,zamoraWinner(k)]).filter(x=>x[1]);
  $('zamGrid').innerHTML=zs.slice().reverse().map(([k,z])=>`<div class="${z[1]===T[st.team]?'me':''}" data-tip="${esc(`<b>${esc(z[0])}</b> (${esc(z[1])})<br>${fmt(z[2],2)} goles por partido · ${z[3]} partidos`)}"><span class="y">${lab(k)}</span><span class="c">${esc(z[0])}</span><span class="d">${esc(z[1])} · ${fmt(z[2],2)}</span></div>`).join('');
  const zc=new Map();zs.forEach(([k,z])=>{const key=norm(z[0]);const x=zc.get(key)||{n:z[0],ks:[],t:new Set()};x.ks.push(k);x.t.add(z[1]);zc.set(key,x);});
  $('zamRank').innerHTML=[...zc.values()].sort((a,b)=>b.ks.length-a.ks.length||a.ks[0]-b.ks[0]).slice(0,12).map((x,i)=>`<li><span class="i">${i+1}</span><span class="t">${plBtn(x.n)}<small>${esc([...x.t].join(', '))} · ${x.ks.map(short).join(' · ')}</small></span><span class="v">${x.ks.length}</span></li>`).join('');
}

// ---------- HISTORIA ----------
function trendPanel(name,ks,vals,fmtv,note){
  const mn=Math.min(...vals),mx=Math.max(...vals),pad=(mx-mn)*.15||.1,lo=mn-pad,hi=mx+pad;
  const w=320,h=96,L=4,R=44,Tp=8,B=18,x=i=>L+i*(w-L-R)/(vals.length-1),y=v=>Tp+(hi-v)/(hi-lo)*(h-Tp-B);
  let s=`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${name} por temporada">`;
  s+=`<path fill="var(--accent)" opacity=".10" d="M${x(0)},${h-B} ${vals.map((v,i)=>`L${x(i)},${y(v)}`).join(' ')} L${x(vals.length-1)},${h-B}Z"/>`;
  s+=`<polyline fill="none" stroke="var(--accent)" stroke-width="${vals.length>40?1.5:2}" points="${vals.map((v,i)=>x(i)+','+y(v)).join(' ')}"/>`;
  const li=vals.length-1;s+=`<circle cx="${x(li)}" cy="${y(vals[li])}" r="4" fill="var(--accent)" stroke="var(--surface)" stroke-width="2"/><text class="lbl" x="${x(li)+8}" y="${y(vals[li])+4}">${fmtv(vals[li])}</text>`;
  s+=`<text x="${L}" y="${h-4}">${lab(ks[0])}</text><text x="${x(li)}" y="${h-4}" text-anchor="end">${lab(ks[li])}</text>`;
  vals.forEach((v,i)=>{const bw=Math.max((w-L-R)/vals.length,4);s+=`<rect class="hit" x="${x(i)-bw/2}" y="0" width="${bw}" height="${h-B}" data-tip="${esc(`<b>${lab(ks[i])}</b><br>${name}: <span class=num>${fmtv(v)}</span>`)}"/>`;});
  const iMax=vals.indexOf(mx),iMin=vals.indexOf(mn);
  return `<div class="panel"><div class="panel-head"><h3>${name}</h3></div>${s}</svg><p class="note">Máximo ${fmtv(mx)} en ${lab(ks[iMax])} · mínimo ${fmtv(mn)} en ${lab(ks[iMin])}${note?'. '+note:''}</p></div>`;
}
const seasonTot=(k,f)=>DATA.seasons[k].reduce((a,r)=>a+(r[f]||0),0);
const seasonGames=k=>seasonTot(k,I.P)/2;
function renderHistoria(){
  const HL=-1; // en Historia no se resalta ningún equipo
  const champs=DONE.map(k=>[k,DATA.seasons[k][0]]);
  const cnt={};champs.forEach(([k,r])=>cnt[r[0]]=(cnt[r[0]]||0)+1);
  const ranked=Object.entries(cnt).sort((a,b)=>b[1]-a[1]);
  const nM=allMatches().length,nG=allMatches().reduce((a,m)=>a+m.hg+m.ag,0);
  $('hiKpis').innerHTML=kpi('Temporadas',SKEYS.length,'1928/29 – 2026/27')+kpi('Partidos',fmt(nM),'')+kpi('Goles',fmt(nG),fmt(nG/nM,2)+' por partido')+kpi('Campeones distintos',ranked.length,'')+kpi('Clubes en Primera',T.length,'al menos una temporada');
  { const rowH=24,nameW=150,top=6,max=ranked[0][1];
    let s=`<svg viewBox="0 0 ${W} ${top+ranked.length*rowH}" role="img" aria-label="Ligas ganadas por club">`;
    ranked.forEach(([t,c],i)=>{const y=top+i*rowH,sel=+t===HL,w=c/max*(W-nameW-40);
      if(sel)s+=`<rect x="0" y="${y}" width="${W}" height="${rowH}" fill="var(--hl)" rx="4"/>`;
      s+=`<text class="name ${sel?'sel':''}" x="0" y="${y+rowH/2+4}">${esc(T[t])}</text><path fill="var(--gold)" d="${hbar(nameW,nameW+w,y+5,rowH-10)}"/><text class="lbl" x="${nameW+w+6}" y="${y+rowH/2+4}">${c}</text>`;
      const yrs=champs.filter(([k,r])=>r[0]===+t).map(([k])=>short(k));
      s+=`<rect class="hit" x="0" y="${y}" width="${W}" height="${rowH}" data-goteam="${t}" style="cursor:pointer" data-tip="${esc(`<b>${esc(T[t])}</b>: ${c} ligas<br><span class=num>${yrs.slice(-12).join(' · ')}${yrs.length>12?' …':''}</span>`)}"/>`;});
    $('chartTitles').innerHTML=s+'</svg>';}
  $('palm').innerHTML=champs.slice().reverse().map(([k,r])=>`<div class="${r[0]===HL?'me':''}"><span class="y">${lab(k)}</span><span class="c">${crest(r[0])}${esc(T[r[0]])}</span><span class="d">${r[I.Pts]} pts</span></div>`).join('');
  renderHeat();renderRecords();
  const ks=DONE;
  $('trendGrid').innerHTML=
    trendPanel('Goles por partido',ks,ks.map(k=>seasonTot(k,I.GF)/seasonGames(k)),v=>fmt(v,2))+
    trendPanel('Gana el local',ks,ks.map(k=>seasonTot(k,I.hW)/seasonGames(k)*100),v=>fmt(v,0)+'%','El factor campo se ha ido diluyendo')+
    trendPanel('Empates',ks,ks.map(k=>seasonTot(k,I.hD)/seasonGames(k)*100),v=>fmt(v,0)+'%')+
    trendPanel('Puntos del campeón por partido',ks,ks.map(k=>{const r=DATA.seasons[k][0];return pts3(r)/r[I.P];}),v=>fmt(v,2),'A 3 puntos por victoria');
  const AC=[{k:'t',h:'Equipo',cls:'l team',f:a=>T[a.t],html:a=>tname(a.t)},{k:'S',h:'Temp.'},{k:'Tit',h:'Ligas'},{k:'P',h:'PJ'},{k:'W',h:'G'},{k:'D',h:'E'},{k:'L',h:'P'},{k:'GF',h:'GF'},{k:'GA',h:'GC'},{k:'Pts3',h:'Pts'}];
  const list=aggAll();const sk=st.sortAll;
  list.sort(sk.k==='t'?(a,b)=>T[a.t].localeCompare(T[b.t],'es')*sk.d:(a,b)=>(a[sk.k]-b[sk.k])*sk.d||b.Pts3-a.Pts3);
  const tb=$('tblAll');
  tb.innerHTML='<thead><tr><th>#</th>'+AC.map(c=>`<th class="${c.cls?'l':''}"><button type="button" data-k="${c.k}" ${sk.k===c.k?`data-sorted="${sk.d>0?'▲':'▼'}"`:''}>${c.h}</button></th>`).join('')+'</tr></thead><tbody>'+
    list.map((a,i)=>`<tr class="${a.t===HL?'sel':''}" data-t="${a.t}"><td>${i+1}</td>`+AC.map(c=>`<td class="${c.cls||''}">${c.html?c.html(a):esc(c.f?c.f(a):fmt(a[c.k]))}</td>`).join('')+'</tr>').join('')+'</tbody>';
  tb.querySelectorAll('th button').forEach(b=>b.onclick=()=>{const k=b.dataset.k;if(sk.k===k)sk.d*=-1;else{sk.k=k;sk.d=(k==='t'||k==='GA'||k==='L')?1:-1;}renderHistoria();});
  tb.querySelectorAll('tbody tr').forEach(tr=>tr.onclick=()=>goTeam(+tr.dataset.t));
  $('bigWins').innerHTML=allMatches().slice().sort((a,b)=>Math.abs(b.hg-b.ag)-Math.abs(a.hg-a.ag)||(b.hg+b.ag)-(a.hg+a.ag)||a.ts-b.ts).slice(0,50).map(m=>gameLi(m)).join('');
}
function heatColor(p,n){if(p===1)return 'var(--h1)';if(p<=4)return 'var(--h2)';if(p<=8)return 'var(--h3)';if(p>n-3)return 'var(--h6)';if(p>n-6)return 'var(--h5)';return 'var(--h4)';}
function renderHeat(){
  const HL=-1;
  const clubs=allAgg().filter(a=>a.S>=20).map(a=>a.t);
  const VW=1000,nameW=150,rowH=17,top=18,n=SKEYS.length,cw=(VW-nameW)/n;
  let s=`<svg viewBox="0 0 ${VW} ${top+clubs.length*rowH}" role="img" aria-label="Puesto final de cada club por temporada">`;
  SKEYS.forEach((k,i)=>{if(+k%10===0)s+=`<text x="${nameW+i*cw}" y="11">${k}</text>`;});
  clubs.forEach((t,j)=>{const y=top+j*rowH,sel=t===HL;
    if(sel)s+=`<rect x="0" y="${y}" width="${VW}" height="${rowH}" fill="var(--hl)"/>`;
    s+=`<text class="name ${sel?'sel':''}" x="0" y="${y+rowH/2+4}" data-goteam="${t}" style="cursor:pointer">${esc(T[t])}</text>`;
    SKEYS.forEach((k,i)=>{const r=rowOf(k,t);if(!r)return;const nT=DATA.seasons[k].length;
      s+=`<rect x="${nameW+i*cw+.5}" y="${y+1.5}" width="${Math.max(cw-1,1)}" height="${rowH-3}" rx="1.5" fill="${heatColor(r[I.pos],nT)}" ${k===CURRENT?'opacity=".55"':''} data-tip="${esc(`<b>${esc(T[t])} · ${lab(k)}</b><br>${r[I.pos]}º de ${nT}${k===CURRENT?' (en curso)':''} · ${r[I.Pts]} pts`)}"/>`;});});
  $('heat').innerHTML=s+'</svg>';
}
function renderRecords(){
  const TS=[];DONE.forEach(k=>DATA.seasons[k].forEach(r=>TS.push([k,r])));
  const ppg=r=>pts3(r)/r[I.P];
  const li=(i,a,b,v)=>`<li><span class="i">${i+1}</span><span class="t">${a}<small>${b}</small></span><span class="v">${v}</span></li>`;
  const card=(title,note,items,fmtv)=>{const [a0,b0,v0]=items[0];return `<div class="panel"><div class="panel-head"><h3>${title}</h3>${note?`<span class="note">${note}</span>`:''}</div><div class="rec-top"><span class="v">${fmtv?fmtv(v0):v0}</span><span class="w">${a0}<small>${b0}</small></span></div><ol class="rank">${items.slice(1,5).map(([a,b,v],i)=>li(i+1,a,b,fmtv?fmtv(v):v)).join('')}</ol></div>`;};
  const ts=(k,r,extra)=>[esc(T[r[0]]),lab(k)+(extra?' · '+extra:'')];
  const out=[];
  const p2=(k,r)=>winPts(k)===2?` · ${r[I.Pts]} reales`:'';
  out.push(card('Más puntos en una temporada','con victoria a 3 en todas las épocas',TS.slice().sort((a,b)=>pts3(b[1])-pts3(a[1])||a[1][I.P]-b[1][I.P]).slice(0,5).map(([k,r])=>[...ts(k,r,`${r[I.W]}G ${r[I.D]}E ${r[I.L]}P en ${r[I.P]}${p2(k,r)}`),pts3(r)]),v=>v+' pts'));
  out.push(card('Más goles en una temporada','',TS.slice().sort((a,b)=>b[1][I.GF]-a[1][I.GF]).slice(0,5).map(([k,r])=>[...ts(k,r,fmt(r[I.GF]/r[I.P],2)+' por partido'),r[I.GF]])));
  out.push(card('Defensa menos goleada','goles encajados por partido',TS.slice().sort((a,b)=>a[1][I.GA]/a[1][I.P]-b[1][I.GA]/b[1][I.P]).slice(0,5).map(([k,r])=>[...ts(k,r,`${r[I.GA]} en ${r[I.P]} partidos`),r[I.GA]/r[I.P]]),v=>fmt(v,2)));
  out.push(card('Menos puntos en una temporada','con victoria a 3 en todas las épocas',TS.slice().sort((a,b)=>pts3(a[1])-pts3(b[1])||b[1][I.P]-a[1][I.P]).slice(0,5).map(([k,r])=>[...ts(k,r,`${r[I.W]}G ${r[I.D]}E ${r[I.L]}P en ${r[I.P]}${p2(k,r)}`),pts3(r)]),v=>v+' pts'));
  out.push(card('Menos puntos con 38 partidos','temporadas de 20 equipos',TS.filter(([k,r])=>r[I.P]===38).sort((a,b)=>pts3(a[1])-pts3(b[1])).slice(0,5).map(([k,r])=>[...ts(k,r,`${r[I.W]}G ${r[I.D]}E ${r[I.L]}P`),pts3(r)]),v=>v+' pts'));
  const marg=DONE.map(k=>{const s=DATA.seasons[k];return [k,s[0],s[1],s[0][I.Pts]-s[1][I.Pts]];});
  out.push(card('Mayor ventaja del campeón','puntos de su época sobre el segundo',marg.slice().sort((a,b)=>b[3]-a[3]).slice(0,5).map(([k,a,b,m])=>[esc(T[a[0]]),`${lab(k)} · sobre ${esc(T[b[0]])}`,m])));
  const ties=marg.filter(x=>x[3]===0);
  out.push(card('Ligas decididas por desempate','campeón y subcampeón con los mismos puntos',[['temporadas con empate a puntos','entre el 1º y el 2º',ties.length],...ties.slice().reverse().slice(0,4).map(([k,a,b])=>[esc(T[a[0]]),`${lab(k)} · por delante de ${esc(T[b[0]])}`,a[I.Pts]+' pts'])],v=>v));
  const runs=[];let cur=null;DONE.forEach(k=>{const c=DATA.seasons[k][0][0];if(cur&&cur.t===c&&SKEYS.indexOf(k)===SKEYS.indexOf(cur.to)+1){cur.n++;cur.to=k;}else{cur={t:c,n:1,from:k,to:k};runs.push(cur);}});
  out.push(card('Más ligas seguidas','',runs.sort((a,b)=>b.n-a.n||a.from-b.from).slice(0,5).map(r=>[esc(T[r.t]),`${lab(r.from)} – ${lab(r.to)}`,r.n])));
  const sk=T.map((_,t)=>[t,streaksAll(t)]);
  out.push(card('Más victorias seguidas','partidos de Liga consecutivos',sk.slice().sort((a,b)=>b[1].win.n-a[1].win.n).slice(0,5).map(([t,x])=>[esc(T[t]),`${fdate(x.win.from)} – ${fdate(x.win.to)}`,x.win.n])));
  out.push(card('Más partidos sin perder','partidos de Liga consecutivos',sk.slice().sort((a,b)=>b[1].unb.n-a[1].unb.n).slice(0,5).map(([t,x])=>[esc(T[t]),`${fdate(x.unb.from)} – ${fdate(x.unb.to)}`,x.unb.n])));
  out.push(card('Partidos con más goles','',allMatches().slice().sort((a,b)=>(b.hg+b.ag)-(a.hg+a.ag)||Math.abs(b.hg-b.ag)-Math.abs(a.hg-a.ag)).slice(0,5).map(m=>[`${esc(T[m.h])} ${m.hg}–${m.ag} ${esc(T[m.a])}`,fdate(m),m.hg+m.ag]),v=>v+' goles'));
  const rr=T.map((_,t)=>[t,runsInTop(t)]).sort((a,b)=>b[1].cur-a[1].cur||b[1].best-a[1].best);
  out.push(card('Más temporadas seguidas en Primera','incluida la 2026/27',rr.slice(0,5).map(([t,x])=>[esc(T[t]),x.cur===SKEYS.length?'nunca ha descendido':`desde ${lab(SKEYS[SKEYS.length-x.cur])}`,x.cur])));
  $('recs').innerHTML=out.join('');
}
