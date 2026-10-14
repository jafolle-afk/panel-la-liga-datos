
// ---------- Goleadores y Zamora por temporada ----------
const P={n:0,t:1,g:2,m:3,G:4,np:5,A:6,xG:7,xA:8,Y:9,R:10};               // Understat (2014+)
const F={n:0,t:1,mp:2,min:3,g:4,a:5,pk:6,y:7,r:8,yr:9,f:10,fd:11};          // FBref (1988+)
const FC={n:0,t:1,s:2,first:3,last:4,mp:5,min:6,g:7,a:8,pk:9,y:10,r:11,f:12,fd:13,fs:14};
const FB=PD.fb||{}, FBCAR=PD.fbcar||[], GK=PD.gk||{}, ZM=PD.zm||{};
const inTeam=(p,ti)=>String(p).split(',').includes(T[ti]);
function topScorers(k){
  if(FB[k]&&FB[k].length){const a=FB[k].slice().sort((x,y)=>y[F.g]-x[F.g]);const g=a[0][F.g];return a.filter(p=>p[F.g]===g).map(p=>({n:p[0],t:p[1],g}));}
  if(PH[k]&&PH[k].G&&PH[k].G.length){const g=PH[k].G[0][2];return PH[k].G.filter(p=>p[2]===g).map(p=>({n:p[0],t:p[1],g}));}
  return [];}
function zamora(k){ // {rows:[[name,team,coef,mp,ga,cs,sv]], src, rule}
  const g=GK[k];
  if(g&&k>='1999'){const minG=k===CURRENT?3:28;const rows=g.filter(x=>x[4]!=null&&x[2]>=minG).map(x=>[x[0],x[1],+(x[4]/(x[3]/90)).toFixed(2),x[2],x[4],x[5],x[6]]).sort((a,b)=>a[2]-b[2]);return rows.length?{rows,src:'FBref',rule:`mínimo ${minG} partidos`}:null;}
  if(ZM[k])return {rows:ZM[k].map(z=>[z[0],z[1],z[2],z[3],z[4],null,null]),src:'BDFútbol',rule:'según BDFútbol'};
  return null;}
// Trofeo Zarra (máximo goleador español, diario Marca, desde 2005/06). Fuente: Wikipedia (Trofeo Zarra).
const ZARRA={'2005':[['David Villa','Valencia',25]],'2006':[['David Villa','Valencia',16]],'2007':[['Dani Güiza','Mallorca',27]],'2008':[['David Villa','Valencia',28]],'2009':[['David Villa','Valencia',21]],'2010':[['Álvaro Negredo','Sevilla',20]],'2011':[['Fernando Llorente','Athletic Club',17],['Roberto Soldado','Valencia',17]],'2012':[['Álvaro Negredo','Sevilla',25]],'2013':[['Diego Costa','Atlético de Madrid',27]],'2014':[['Aritz Aduriz','Athletic Club',18]],'2015':[['Aritz Aduriz','Athletic Club',20]],'2016':[['Iago Aspas','Celta de Vigo',19]],'2017':[['Iago Aspas','Celta de Vigo',22]],'2018':[['Iago Aspas','Celta de Vigo',20]],'2019':[['Gerard Moreno','Villarreal',18]],'2020':[['Gerard Moreno','Villarreal',23]],'2021':[['Iago Aspas','Celta de Vigo',17],['Raúl de Tomás','Espanyol',17]],'2022':[['Joselu','Espanyol',16]],'2023':[['Borja Mayoral','Getafe',15],['Álvaro Morata','Atlético de Madrid',15]],'2024':[['Ayoze Pérez','Villarreal',19]],'2025':[['Lamine Yamal','Barcelona',16],['Ferran Torres','Barcelona',16]]};
// Líder de una estadística de jugadores en la temporada (con empates)
function seasonLeader(k,key){
  if(FB[k]&&FB[k].length){const i={g:F.g,a:F.a,y:F.y,r:F.r}[key];const rows=FB[k].filter(p=>p[i]!=null&&p[i]>0);if(!rows.length)return null;const v=Math.max(...rows.map(p=>p[i]));return {v,ps:rows.filter(p=>p[i]===v).map(p=>({n:p[0],t:p[1]}))};}
  if(PH[k]){const arr=PH[k][{g:'G',y:'Y',r:'R'}[key]];if(!arr||!arr.length)return null;const v=arr[0][2];return {v,ps:arr.filter(p=>p[2]===v).map(p=>({n:p[0],t:p[1]}))};}
  return null;}
function relegated(k){const i=SKEYS.indexOf(k),nx=SKEYS[i+1];if(k===CURRENT||!nx)return null;return DATA.seasons[k].filter(r=>!rowOf(nx,r[0]));}
const zamoraWinner=k=>{const z=zamora(k);return z&&z.rows[0]?z.rows[0]:null;};
let GPM_ALL=null;
function gpmAll(){if(GPM_ALL==null){let g=0,p=0;DONE.forEach(k=>DATA.seasons[k].forEach(r=>{g+=r[I.GF];p+=r[I.P];}));GPM_ALL=g/(p/2);}return GPM_ALL;}
const joinY=a=>a.length<2?a.join(''):a.slice(0,-1).join(', ')+' y '+a[a.length-1];

// ---------- TEMPORADA ----------
function renderTemporada(){
  const k=st.season,S=seasonInfo(k),rows=S.rows,cur=k===CURRENT,n=rows.length,w=S.w;
  $('sTag').textContent=cur?'Temporada en curso':'La temporada';
  $('sTitle').textContent='Temporada '+lab(k)+(cur?' · hasta el '+UPD:'');
  const ch=rows[0],sec=rows[1],margin=ch[I.Pts]-sec[I.Pts];
  const sc=topScorers(k),zw=zamoraWinner(k);
  const marginTxt=margin>0?`${margin} ${margin===1?'punto':'puntos'} más que ${esc(T[sec[0]])}`:`empatado a puntos con ${esc(T[sec[0]])}${cur?'':' (decidido por el enfrentamiento directo)'}`;
  let h=`<div class="champ-cell"><span class="eyebrow">${cur?'Líder ahora':'Campeón'}</span><div class="champ-top">${crest(ch[0],'lg')}<button type="button" class="linkbig" data-goteam="${ch[0]}"><span class="big">${esc(T[ch[0]])}</span></button></div><span class="sub">${ch[I.Pts]} puntos · ${ch[I.W]}G ${ch[I.D]}E ${ch[I.L]}P · ${ch[I.GF]} goles a favor</span><span class="sub">${marginTxt}</span></div>`;
  const who=(ps)=>{const ns=ps.map(p=>p.n),ts=[...new Set(ps.map(p=>p.t))];return {n:ns.length>2?ns.slice(0,2).join(' / ')+` y ${ns.length-2} más`:ns.join(' / '),t:ts.length>2?ts.length+' equipos':ts.join(' / ')};};
  const UN={goles:['gol','goles'],'asist.':['asist.','asist.'],amarillas:['amarilla','amarillas'],rojas:['roja','rojas']};
  const cell=(lbl,o,unit,emptyTxt)=>{if(!o)return `<div><span class="eyebrow">${lbl}</span><span class="sub">${emptyTxt||'Sin datos para esta temporada'}</span></div>`;const w2=who(o.ps);return `<div><span class="eyebrow">${lbl}</span><span class="mid">${esc(w2.n)}</span><span class="sub">${esc(w2.t)} · <b>${o.v} ${(UN[unit]||[unit,unit])[o.v===1?0:1]}</b></span></div>`;};
  const sc2=sc.length?{v:sc[0].g,ps:sc.map(s=>({n:s.n,t:s.t}))}:null;
  h+=cell('Máximo goleador',sc2,'goles');
  const zr=ZARRA[k];h+=cell('Trofeo Zarra',zr?{v:zr[0][2],ps:zr.map(z=>({n:z[0],t:z[1]}))}:null,'goles',+k<2005?'Se entrega desde 2005/06':cur?'Se decide al final de la temporada':'Sin datos');
  h+=zw?`<div><span class="eyebrow">Trofeo Zamora</span><span class="mid">${esc(zw[0])}</span><span class="sub">${esc(zw[1])} · <b>${fmt(zw[2],2)}</b> encajados por partido</span></div>`:cell('Trofeo Zamora',null);
  h+=cell('Máximo asistente',seasonLeader(k,'a'),'asist.',+k<1999?'Hay asistencias desde 1999/00':null);
  h+=cell('Más amonestado',seasonLeader(k,'y'),'amarillas');
  h+=cell('Más expulsado',seasonLeader(k,'r'),'rojas');
  const rel=relegated(k),bot=cur?rows.slice(-3):rel;
  h+=`<div class="rel"><span class="eyebrow">${cur?'En descenso ahora':'Descendidos'}</span>${bot&&bot.length?bot.map(r=>`<span><b>${esc(T[r[0]])}</b> <span class="sub">${r[I.pos]}º · ${r[I.Pts]} pts</span></span>`).join(''):'<span class="sub">Ninguno esa temporada</span>'}</div>`;
  $('sHero').innerHTML=h;
  const notes=[];if(w===2)notes.push('En esta temporada la victoria valía 2 puntos.');if(k==='1986')notes.push('En 1986/87 hubo una segunda fase por grupos; aquí se suman todos los partidos.');if(cur)notes.push('Temporada en curso: resultados y clasificación hasta el '+UPD+'. Se actualiza cada martes.');
  $('sNote').hidden=!notes.length;$('sNote').textContent=notes.join(' ');
  renderStory(k);renderRace(k);renderSeasonTable();renderSplits(k);renderXT(k);
}

function renderStory(k){
  const S=seasonInfo(k),rows=S.rows,cur=k===CURRENT,out=[],nm=t=>`<b>${esc(T[t])}</b>`;
  const ch=rows[0],sec=rows[1];
  // 1. Cómo se decidió
  if(!cur){let t;
    if(S.clinch&&S.clinch.left>0)t=`${nm(ch[0])} fue campeón matemático en la jornada ${S.clinch.j}, a falta de ${S.clinch.left} ${S.clinch.left===1?'partido':'partidos'} (${S.clinch.date}).`;
    else t=`El título se decidió en la última jornada: ${nm(ch[0])} terminó con ${ch[I.Pts]} puntos y ${nm(sec[0])} con ${sec[I.Pts]}.`;
    out.push(['Cómo se decidió',t]);}
  // 2. Liderato
  const lead={};rows.forEach(r=>{lead[r[0]]=[...(r[I.posStr]||'')].filter(c=>c==='a').length;});
  const tot=(rows[0][I.posStr]||'').length;
  if(tot){const top=Object.entries(lead).sort((a,b)=>b[1]-a[1]);const [lt,ln]=top[0];
    let t=`${nm(+lt)} fue líder ${ln} de ${tot} jornadas.`;
    if(!cur&&+lt!==ch[0])t+=` El campeón, ${nm(ch[0])}, solo lo fue en ${lead[ch[0]]}.`;
    const nLead=top.filter(x=>x[1]>0).length;if(nLead>2)t+=` Hasta ${nLead} equipos ocuparon el primer puesto.`;
    out.push(['El liderato',t]);}
  // 3. Rachas
  let bw=null,bu=null;for(const t in S.st){const x=S.st[t];if(!bw||x.win.n>bw[1])bw=[+t,x.win.n];if(!bu||x.unb.n>bu[1])bu=[+t,x.unb.n];}
  if(bw)out.push(['Mejor racha',`${nm(bw[0])} encadenó ${bw[1]} victorias seguidas`+(bu&&bu[1]>bw[1]?`; ${bu[0]===bw[0]?'y estuvo':nm(bu[0])+' estuvo'} ${bu[1]} partidos sin perder.`:'.')]);
  // 4. Mayor goleada
  if(S.big){const m=S.big;out.push(['Mayor goleada',`${esc(T[m.h])} ${m.hg}–${m.ag} ${esc(T[m.a])}, el ${fdate(m)}.`]);}
  // 5. Revelación / decepción (frente a la temporada anterior)
  const pk=prevKey(k);
  if(pk){const ds=[];rows.forEach(r=>{const p=rowOf(pk,r[0]);if(p)ds.push([r[0],p[I.pos],r[I.pos]]);});
    ds.sort((a,b)=>(b[1]-b[2])-(a[1]-a[2]));const up=ds[0],dn=ds[ds.length-1];
    if(up&&up[1]-up[2]>=3)out.push(['La revelación',`${nm(up[0])} pasó del ${up[1]}º puesto en ${lab(pk)} al ${up[2]}º${cur?' (de momento)':''}.`]);
    const prom=rows.filter(r=>!rowOf(pk,r[0]));if(prom.length&&!cur){const b=prom[0];out.push(['Los recién llegados',`${joinY(prom.map(r=>nm(r[0])))} ${prom.length>1?'llegaban':'llegaba'} de Segunda; el mejor fue ${nm(b[0])}, ${b[I.pos]}º.`]);}
    if(dn&&dn[1]-dn[2]<=-4)out.push(['La decepción',`${nm(dn[0])} cayó del ${dn[1]}º puesto en ${lab(pk)} al ${dn[2]}º${cur?' (de momento)':''}.`]);}
  // 6. Casa / fuera
  const w=S.w,hp=r=>r[I.hW]*w+r[I.hD],ap=r=>r[I.aW]*w+r[I.aD];
  const bh=rows.slice().sort((a,b)=>hp(b)-hp(a)||(b[I.hGF]-b[I.hGA])-(a[I.hGF]-a[I.hGA]))[0],ba=rows.slice().sort((a,b)=>ap(b)-ap(a)||(b[I.aGF]-b[I.aGA])-(a[I.aGF]-a[I.aGA]))[0];
  out.push(['Fortín y viajero',`El mejor local fue ${nm(bh[0])} (${bh[I.hW]}G ${bh[I.hD]}E ${bh[I.hL]}P en casa) y el mejor visitante ${nm(ba[0])} (${ba[I.aW]}G ${ba[I.aD]}E ${ba[I.aL]}P fuera).`]);
  // 7. Goles
  const g=rows.reduce((a,r)=>a+r[I.GF],0),pj=rows.reduce((a,r)=>a+r[I.P],0)/2,gpm=g/pj,avg=gpmAll();
  const atk=rows.slice().sort((a,b)=>b[I.GF]-a[I.GF])[0],def=rows.slice().sort((a,b)=>a[I.GA]-b[I.GA])[0];
  out.push(['Goles',`${fmt(gpm,2)} por partido, ${Math.abs(gpm-avg)<0.08?'en la media':gpm>avg?'por encima de la media':'por debajo de la media'} histórica (${fmt(avg,2)}). Mejor ataque: ${nm(atk[0])} (${atk[I.GF]}); mejor defensa: ${nm(def[0])} (${def[I.GA]} encajados).`]);
  // 8. Abajo
  if(!cur&&rows.length>=10){const last=rows[rows.length-1];out.push(['El farolillo rojo',`${nm(last[0])} terminó último con ${last[I.Pts]} puntos: ${last[I.W]} victorias en ${last[I.P]} partidos.`]);}
  $('sStory').innerHTML=out.map(([a,b])=>`<li><span class="k">${a}</span><span class="t">${b}</span></li>`).join('');
}

function renderRace(k){
  const S=seasonInfo(k),rows=S.rows,n=rows.length;
  const pick=st.race==='top'?rows.slice(0,5):st.race==='eu'?rows.slice(2,Math.min(8,n-3)):rows.slice(-6);
  $('raceTitle').textContent=st.race==='top'?'La carrera por el título':st.race==='eu'?'La pelea por Europa':'La lucha por la permanencia';
  const teams=pick.map(r=>r[0]);const extra=rows.some(r=>r[0]===st.team)&&!teams.includes(st.team);if(extra)teams.push(st.team);
  const maxG=Math.max(...teams.map(t=>(S.cum[t]||[]).length));
  if(!maxG){$('raceChart').innerHTML='<p class="note">Sin partidos.</p>';return;}
  const N=W<600,VW=N?420:760,H=N?400:380,L=34,R=N?80:170,Tp=14,B=28;
  const maxP=niceMax(Math.max(...teams.map(t=>{const c=S.cum[t];return c[c.length-1]||0;}))*1.02);
  const x=i=>L+i*(VW-L-R)/maxG,y=v=>H-B-v/maxP*(H-Tp-B);
  let s=`<svg viewBox="0 0 ${VW} ${H}" role="img" aria-label="Puntos acumulados por jornada">`;
  ticks(maxP,5).forEach(v=>{s+=`<line class="gridl" x1="${L}" x2="${VW-R+10}" y1="${y(v)}" y2="${y(v)}"/><text x="${L-8}" y="${y(v)+4}" text-anchor="end">${v}</text>`;});
  [...new Set([1,Math.round(maxG/4),Math.round(maxG/2),Math.round(maxG*3/4),maxG])].forEach(j=>{s+=`<text x="${x(j)}" y="${H-8}" text-anchor="middle">J${j}</text>`;});
  const labels=[];
  const LCOL=lineColors(teams);
  teams.forEach((t,i)=>{const c=[0,...S.cum[t]],col=LCOL[i],sel=t===st.team;
    s+=`<polyline fill="none" stroke="${col}" stroke-width="${sel?3:2}" ${extra&&t===st.team?'stroke-dasharray="5 4"':''} stroke-linejoin="round" stroke-linecap="round" points="${c.map((v,j)=>x(j)+','+y(v)).join(' ')}"/>`;
    const lj=c.length-1;s+=`<circle cx="${x(lj)}" cy="${y(c[lj])}" r="3.5" fill="${col}"/>`;
    labels.push({t,y:y(c[lj]),y0:y(c[lj]),x:x(lj),col,txt:`${N?ab(t):T[t]} · ${c[lj]}`,sel});});
  spread(labels,14,Tp,H-B).forEach(l=>{s+=`<line x1="${l.x+5}" y1="${l.y0}" x2="${VW-R+(N?10:16)}" y2="${l.y}" stroke="${l.col}" stroke-width="1" opacity=".5"/><text class="name ${l.sel?'sel':''}" x="${VW-R+(N?13:20)}" y="${l.y+4}" style="fill:${l.col}">${esc(l.txt)}</text>`;});
  for(let j=1;j<=maxG;j++){const arr=teams.filter(t=>S.cum[t][j-1]!=null).map(t=>[t,S.cum[t][j-1]]).sort((a,b)=>b[1]-a[1]);
    s+=`<rect class="hit" x="${x(j)-(VW-L-R)/maxG/2}" y="${Tp}" width="${(VW-L-R)/maxG}" height="${H-Tp-B}" data-tip="${esc(`<b>Jornada ${j}</b><br>`+arr.map(([t,v])=>`${esc(T[t])}: <span class=num>${v}</span>`).join('<br>'))}"/>`;}
  $('raceChart').innerHTML=s+'</svg>'+(S.w===2?'<p class="note">Victoria a 2 puntos en esta temporada.</p>':'')+(extra?`<p class="note">Línea discontinua: ${esc(T[st.team])}, el equipo seleccionado.</p>`:'');
}

function spark(ps,n){if(!ps.length)return '';const w=84,h=20,x=i=>2+i*(w-4)/Math.max(ps.length-1,1),y=p=>2+(p-1)/(Math.max(n-1,1))*(h-4);
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" aria-hidden="true"><line x1="0" x2="${w}" y1="${y(1)}" y2="${y(1)}" stroke="var(--gold)" stroke-width="1" opacity=".5"/><polyline fill="none" stroke="var(--accent)" stroke-width="1.4" stroke-linejoin="round" points="${ps.map((p,i)=>x(i)+','+y(p)).join(' ')}"/><circle cx="${x(ps.length-1)}" cy="${y(ps[ps.length-1])}" r="2" fill="var(--accent)"/></svg>`;}
const RES_ES={W:'G',D:'E',L:'P'};
function seasonCols(k){const S=seasonInfo(k),w=S.w,n=S.rows.length;return [
  {k:'pos',h:'#',f:r=>r[I.pos],cls:'pos'},
  {k:'team',h:'Equipo',f:r=>T[r[0]],html:r=>tname(r[0]),cls:'l team',sort:(a,b)=>T[a[0]].localeCompare(T[b[0]],'es')},
  {k:'Pts',h:'Pts',f:r=>r[I.Pts],cls:'pts'},
  {k:'P',h:'PJ',f:r=>r[I.P]},{k:'W',h:'G',f:r=>r[I.W]},{k:'D',h:'E',f:r=>r[I.D]},{k:'L',h:'P',f:r=>r[I.L]},
  {k:'GF',h:'GF',f:r=>r[I.GF]},{k:'GA',h:'GC',f:r=>r[I.GA]},{k:'GD',h:'DG',f:r=>r[I.GF]-r[I.GA],fmt:v=>v>0?'+'+v:v},
  {k:'hP',h:'Pts casa',f:r=>r[I.hW]*w+r[I.hD]},{k:'aP',h:'Pts fuera',f:r=>r[I.aW]*w+r[I.aD]},
  {k:'evo',h:'Evolución',ns:1,html:r=>spark([...(r[I.posStr]||'')].map(c=>c.charCodeAt(0)-96),n),cls:'c'},
  {k:'form',h:'Últimos 5',ns:1,html:r=>`<span class="form">${(S.G[r[0]]||[]).slice(-5).map(g=>`<i class="${g.res}" title="${esc(T[g.opp])} ${g.gf}-${g.ga}">${RES_ES[g.res]}</i>`).join('')}</span>`,cls:'c'},
];}
function renderSeasonTable(){
  const k=st.season,rows=DATA.seasons[k].slice(),n=rows.length,cur=k===CURRENT,COLS=seasonCols(k);
  const c=COLS.find(c=>c.k===st.sort.k&&!c.ns)||COLS[0];
  rows.sort(c.sort?(a,b)=>c.sort(a,b)*st.sort.d:(a,b)=>((c.f(a)??0)-(c.f(b)??0))*st.sort.d||a[I.pos]-b[I.pos]);
  const tb=$('tblSeason');
  tb.innerHTML='<thead><tr>'+COLS.map(c2=>`<th class="${c2.cls&&c2.cls.includes('l')?'l':c2.cls==='c'?'c':''}">${c2.ns?c2.h:`<button type="button" data-k="${c2.k}" ${st.sort.k===c2.k?`data-sorted="${st.sort.d>0?'▲':'▼'}"`:''}>${c2.h}</button>`}</th>`).join('')+'</tr></thead><tbody>'+
   rows.map(r=>{const z=r[I.pos]===1&&!cur?'z-ch':r[I.pos]<=4?'z-eu':(!cur&&r[I.pos]>n-3)?'z-dn':'';return `<tr class="${z} ${r[0]===st.team?'sel':''}" data-t="${r[0]}">`+COLS.map(c2=>{if(c2.html)return `<td class="${c2.cls||'c'}">${c2.html(r)}</td>`;const v=c2.f(r);return v==null?'<td class="na">—</td>':`<td class="${c2.cls||''}">${esc(c2.fmt?c2.fmt(v):v)}</td>`}).join('')+'</tr>'}).join('')+'</tbody>';
  tb.querySelectorAll('th button').forEach(b=>b.onclick=()=>{const k2=b.dataset.k;if(st.sort.k===k2)st.sort.d*=-1;else st.sort={k:k2,d:(k2==='pos'||k2==='team'||k2==='GA'||k2==='L')?1:-1};renderSeasonTable();});
  tb.querySelectorAll('tbody tr').forEach(tr=>tr.onclick=()=>goTeam(+tr.dataset.t));
  $('tblNote').textContent=(winPts(k)===2?'Victoria a 2 puntos. ':'')+'Desempate: puntos y después enfrentamientos directos. Evolución = puesto tras cada jornada; la línea dorada marca el liderato.';
}
function renderSplits(k){
  const S=seasonInfo(k),rows=S.rows,w=S.w,hp=r=>r[I.hW]*w+r[I.hD],ap=r=>r[I.aW]*w+r[I.aD];
  const li=(r,v,sub,i)=>`<li class="${r[0]===st.team?'me':''}"><span class="i">${i+1}</span><span class="t">${teamBtn(r[0])}<small>${sub}</small></span><span class="v">${v}</span></li>`;
  const home=rows.slice().sort((a,b)=>hp(b)-hp(a)).slice(0,5).map((r,i)=>li(r,hp(r)+' pts',`${r[I.hW]}G ${r[I.hD]}E ${r[I.hL]}P · ${r[I.hGF]}–${r[I.hGA]}`,i)).join('');
  const away=rows.slice().sort((a,b)=>ap(b)-ap(a)).slice(0,5).map((r,i)=>li(r,ap(r)+' pts',`${r[I.aW]}G ${r[I.aD]}E ${r[I.aL]}P · ${r[I.aGF]}–${r[I.aGA]}`,i)).join('');
  const pj=rows.reduce((a,r)=>a+r[I.P],0)/2,g=rows.reduce((a,r)=>a+r[I.GF],0),hw=rows.reduce((a,r)=>a+r[I.hW],0),dr=rows.reduce((a,r)=>a+r[I.hD],0),aw=rows.reduce((a,r)=>a+r[I.aW],0);
  const most=S.ms.slice().sort((a,b)=>(b.hg+b.ag)-(a.hg+a.ag))[0];
  const m=(a,b)=>`<div class="mini"><span class="k">${a}</span><span class="v">${b}</span></div>`;
  $('sSplits').innerHTML=`<div class="panel"><div class="panel-head"><h3>Mejores locales</h3></div><ol class="rank blk">${home}</ol></div><div class="panel"><div class="panel-head"><h3>Mejores visitantes</h3></div><ol class="rank blk">${away}</ol></div>
   <div class="panel"><div class="panel-head"><h3>En números</h3></div><div class="split">${m('Partidos',fmt(pj))}${m('Goles',fmt(g)+' · '+fmt(g/pj,2)+' por partido')}${m('Gana el local',pct(hw,pj))}${m('Empates',pct(dr,pj))}${m('Gana el visitante',pct(aw,pj))}${most?m('Más goles en un partido',`${esc(ab(most.h))} ${most.hg}–${most.ag} ${esc(ab(most.a))}`):''}</div></div>`;
}
function renderXT(k){
  const S=seasonInfo(k),rows=S.rows,ts=rows.map(r=>r[0]),cell={};
  S.ms.forEach(m=>{const key=m.h+'-'+m.a;(cell[key]=cell[key]||[]).push(m);});
  let h='<table class="xt"><thead><tr><th class="rh">Local \\ Visitante</th>'+ts.map(t=>`<th title="${esc(T[t])}">${esc(ab(t))}</th>`).join('')+'</tr></thead><tbody>';
  ts.forEach(a=>{h+=`<tr class="${a===st.team?'sel':''}"><th class="rh">${teamBtn(a)}</th>`;ts.forEach(b=>{if(a===b){h+='<td class="self"></td>';return;}const ms=cell[a+'-'+b];
    if(!ms){h+='<td></td>';return;}const m=ms[0];const r=m.hg>m.ag?'W':m.hg<m.ag?'L':'D';
    h+=`<td class="${r}" data-tip="${esc(ms.map(x=>`<b>${esc(T[x.h])} ${x.hg}–${x.ag} ${esc(T[x.a])}</b><br><span class=num>${fdate(x)}</span>`).join('<br>'))}">${m.hg}-${m.ag}${ms.length>1?'*':''}</td>`;});h+='</tr>';});
  $('xtWrap').innerHTML=h+'</tbody></table>'+(k==='1986'?'<p class="note">* Se enfrentaron también en la segunda fase.</p>':'')+(k===CURRENT?'<p class="note">Las casillas vacías son partidos aún no jugados.</p>':'');
}
