
// ---------- Agregados históricos ----------
function aggAll(from,to,teamI){
  const agg={};
  for(const k of DONE){if(from&&k<from)continue;if(to&&k>to)continue;const hs=hasStats(k);for(const r of DATA.seasons[k]){if(teamI!=null&&r[0]!==teamI)continue;
    const a=agg[r[0]]||(agg[r[0]]={t:r[0],S:0,Tit:0,P:0,W:0,D:0,L:0,Pts3:0,GF:0,GA:0,Y:0,R:0,oY:0,oR:0,F:0,FA:0,Sh:0,cb:0,statS:0,cardS:0,yS:0,best:99,last:0,first:k});
    a.S++;if(r[I.pos]===1)a.Tit++;a.best=Math.min(a.best,r[I.pos]);a.last=k;a.P+=r[I.P];a.W+=r[I.W];a.D+=r[I.D];a.L+=r[I.L];a.Pts3+=pts3(r);a.GF+=r[I.GF];a.GA+=r[I.GA];a.cb+=r[I.cb]||0;
    if(r[I.Y]!=null){a.Y+=r[I.Y];a.yS++;}if(r[I.R]!=null){a.R+=r[I.R];a.cardS++;}
    if(hs){a.statS++;a.oY+=r[I.oY];a.oR+=r[I.oR];a.F+=r[I.F];a.FA+=r[I.FA];a.Sh+=r[I.S];}}}
  return Object.values(agg);
}
let ALLAGG=null;const allAgg=()=>ALLAGG||(ALLAGG=aggAll().sort((a,b)=>b.Pts3-a.Pts3));
const TMC={};const teamMatches=t=>TMC[t]||(TMC[t]=allMatches().filter(m=>m.h===t||m.a===t));
function streaksAll(t){ // rachas sobre todos sus partidos, cortando cuando no hay temporadas consecutivas
  const ms=teamMatches(t);const best={win:{n:0},unb:{n:0}};const cur={win:0,unb:0,ws:null,us:null};let lastK=null;
  ms.forEach(m=>{if(lastK&&lastK!==m.k&&SKEYS.indexOf(m.k)!==SKEYS.indexOf(lastK)+1){cur.win=0;cur.unb=0;}lastK=m.k;const r=resOf(m,t);
    if(r==='W'){if(!cur.win)cur.ws=m;cur.win++;if(cur.win>best.win.n)best.win={n:cur.win,from:cur.ws,to:m};}else cur.win=0;
    if(r!=='L'){if(!cur.unb)cur.us=m;cur.unb++;if(cur.unb>best.unb.n)best.unb={n:cur.unb,from:cur.us,to:m};}else cur.unb=0;});
  return best;}
function runsInTop(t){let best=0,cur=0,bs=null,cs=null,be=null;SKEYS.forEach(k=>{if(rowOf(k,t)){if(!cur)cs=k;cur++;if(cur>best){best=cur;bs=cs;be=k;}}else cur=0;});return {best,bs,be,cur};}

// ---------- EQUIPOS ----------
function renderEquipos(){
  const t=st.team,name=T[t];
  $('tTitle').innerHTML=`<span class="tname">${crest(t,'md')}<span style="margin-left:10px">${esc(name)}</span></span>`;
  const done=DONE.map(k=>[k,rowOf(k,t)]).filter(([k,r])=>r);
  const a=aggAll(null,null,t)[0];
  const rk=allAgg().findIndex(x=>x.t===t)+1;
  const runs=runsInTop(t);
  const inCur=!!rowOf(CURRENT,t);
  $('tLede').textContent=done.length?`${done.length} temporadas en Primera desde ${lab(done[0][0])}. `+(inCur?(runs.cur===SKEYS.length?'Nunca ha bajado a Segunda.':`Juega en Primera en ${lab(CURRENT)}`+(runs.cur>=10?` y lleva ${runs.cur} temporadas seguidas en la categoría.`:'.')):`Su última temporada en Primera fue la ${lab(done[done.length-1][0])}.`):'Sin temporadas completas en Primera.';
  if(!a){$('tFacts').innerHTML='';$('tKpis').innerHTML=kpi('Temporadas en Primera','0','solo en curso');$('tPos').innerHTML=posChart([t],['var(--accent)']);$('tRecs').innerHTML='';}
  else{
    const titles=done.filter(([k,r])=>r[I.pos]===1).map(([k])=>k);
    const bestN=done.filter(([k,r])=>r[I.pos]===a.best);
    $('tKpis').innerHTML=[
      kpi('Temporadas',a.S,`de ${DONE.length} completas`),
      kpi('Ligas',titles.length,titles.length?(titles.length>5?'la última en '+lab(titles[titles.length-1]):titles.map(short).join(' · ')):'ninguna'),
      kpi('Mejor puesto',a.best+'º',bestN.length>3?bestN.length+' veces':bestN.map(([k])=>short(k)).join(' · ')),
      kpi('Clasificación histórica',rk+'º',fmt(a.Pts3)+' pts (a 3 por victoria)'),
      kpi('Partidos',fmt(a.P),pct(a.W,a.P)+' ganados'),
      kpi('Goles',fmt(a.GF),fmt(a.GA)+' en contra'),
    ].join('');
    $('tPos').innerHTML=posChart([t],['var(--accent)'])+'<div class="legend"><span><span class="sw" style="background:var(--gold);border-radius:50%"></span>Campeón</span><span>Pasa el ratón para ver cada temporada</span></div>';
    renderTeamRecords(t,done);renderTeamFacts(t,done);
  }
  renderTeamSeason();
  renderRivals(t);
}
function renderTeamRecords(t,done){
  const recCard=(title,top,sub,list,note)=>`<div class="panel"><div class="panel-head"><h3>${title}</h3>${note?`<span class="note">${note}</span>`:''}</div><div class="rec-top"><span class="v">${top}</span><span class="w">${sub}</span></div>${list?`<ol class="rank">${list}</ol>`:''}</div>`;
  const ptsLbl=(k,r)=>winPts(k)===2?` · ${r[I.Pts]} pts reales (victoria a 2)`:'';
  const sli=([k,r],i)=>`<li><span class="i">${i+1}</span><span class="t">${lab(k)}<small>${r[I.pos]}º · ${r[I.W]}G ${r[I.D]}E ${r[I.L]}P en ${r[I.P]}${ptsLbl(k,r)}</small></span><span class="v">${pts3(r)} pts</span></li>`;
  const byB=done.slice().sort((a,b)=>pts3(b[1])-pts3(a[1])||a[1][I.pos]-b[1][I.pos]);
  const b0=byB[0],w0=byB[byB.length-1],byW=byB.slice().reverse();
  let h=recCard('Mejor temporada',pts3(b0[1])+' pts',`${lab(b0[0])}<small>${b0[1][I.pos]}º · ${b0[1][I.W]}G ${b0[1][I.D]}E ${b0[1][I.L]}P en ${b0[1][I.P]} partidos${ptsLbl(b0[0],b0[1])}</small>`,byB.slice(1,5).map((x,i)=>sli(x,i+1)).join(''),'puntos con victoria a 3');
  h+=recCard('Peor temporada',pts3(w0[1])+' pts',`${lab(w0[0])}<small>${w0[1][I.pos]}º · ${w0[1][I.W]}G ${w0[1][I.D]}E ${w0[1][I.L]}P en ${w0[1][I.P]} partidos${ptsLbl(w0[0],w0[1])}</small>`,byW.slice(1,5).map((x,i)=>sli(x,i+1)).join(''),'puntos con victoria a 3');
  const ms=teamMatches(t),mg=m=>(m.h===t?m.hg-m.ag:m.ag-m.hg);
  const gl=(m,i)=>`<li><span class="i">${i+1}</span><span class="t">${m.h===t?'vs ':'en '}${esc(T[m.h===t?m.a:m.h])}<small>${fdate(m)}</small></span><span class="v">${m.h===t?m.hg+'–'+m.ag:m.ag+'–'+m.hg}</span></li>`;
  const wins=ms.slice().sort((a,b)=>mg(b)-mg(a)||(b.hg+b.ag)-(a.hg+a.ag)).slice(0,5),loss=ms.slice().sort((a,b)=>mg(a)-mg(b)||(b.hg+b.ag)-(a.hg+a.ag)).slice(0,5);
  h+=`<div class="panel"><div class="panel-head"><h3>Mayores victorias</h3></div><ol class="rank blk">${wins.map(gl).join('')}</ol></div>`;
  h+=`<div class="panel"><div class="panel-head"><h3>Peores derrotas</h3></div><ol class="rank blk">${loss.map(gl).join('')}</ol></div>`;
  const sk=streaksAll(t),runs=runsInTop(t);
  const m=(a,b,c)=>`<li><span class="i"></span><span class="t">${a}<small>${c}</small></span><span class="v">${b}</span></li>`;
  h+=`<div class="panel"><div class="panel-head"><h3>Rachas</h3></div><ol class="rank blk">${m('Victorias seguidas',sk.win.n,sk.win.n?`${fdate(sk.win.from)} – ${fdate(sk.win.to)}`:'')}${m('Partidos sin perder',sk.unb.n,sk.unb.n?`${fdate(sk.unb.from)} – ${fdate(sk.unb.to)}`:'')}${m('Temporadas seguidas en Primera',runs.best,runs.best?`${lab(runs.bs)} – ${lab(runs.be)}`:'')}</ol></div>`;
  const byG=done.slice().sort((a,b)=>b[1][I.GF]-a[1][I.GF]||a[1][I.P]-b[1][I.P]).slice(0,10);
  h+=`<div class="panel" style="grid-column:1/-1"><div class="panel-head"><h3>Temporadas más goleadoras</h3><span class="note">las 10 con más goles marcados</span></div><div class="tscroll"><table><thead><tr><th>#</th><th class="l">Temporada</th><th>Puesto</th><th>PJ</th><th>Goles</th><th>Por partido</th></tr></thead><tbody>${byG.map(([k,r],i)=>`<tr><td>${i+1}</td><td class="l">${lab(k)}</td><td>${r[I.pos]}º</td><td>${r[I.P]}</td><td class="pts">${r[I.GF]}</td><td>${fmt(r[I.GF]/r[I.P],2)}</td></tr>`).join('')}</tbody></table></div></div>`;
  $('tRecs').innerHTML=h;
}
function renderTeamFacts(t,done){
  const nm=T[t],out=[];
  if(!done.length){$('tFacts').innerHTML='';return;}
  const ms=teamMatches(t),f=ms[0];
  if(f)out.push(['Su estreno en Primera',`${lab(f.k)}: ${esc(T[f.h])} ${f.hg}–${f.ag} ${esc(T[f.a])}, el ${fdate(f)}.`]);
  const pos=n=>done.filter(([k,r])=>r[I.pos]===n).map(([k])=>k);
  const sub=pos(2),top4=done.filter(([k,r])=>r[I.pos]<=4).length;
  out.push(['En lo más alto',`${pos(1).length} ${pos(1).length===1?'liga':'ligas'}, ${sub.length} ${sub.length===1?'subcampeonato':'subcampeonatos'}${sub.length&&sub.length<=4?' ('+sub.map(short).join(', ')+')':''} y ${top4} ${top4===1?'temporada':'temporadas'} entre los cuatro primeros.`]);
  const dn=DONE.filter(k=>{const nx=SKEYS[SKEYS.indexOf(k)+1];return rowOf(k,t)&&nx&&!rowOf(nx,t);});
  const runs=runsInTop(t);
  out.push(['Descensos',dn.length?`${dn.length} ${dn.length===1?'descenso':'descensos'} a Segunda${dn.length<=6?' ('+dn.map(short).join(', ')+')':', el último en '+lab(dn[dn.length-1])}.`+(rowOf(CURRENT,t)&&runs.cur>1?` Ahora lleva ${runs.cur} temporadas seguidas en Primera.`:''):'Nunca ha bajado a Segunda.']);
  const pich=DONE.flatMap(k=>topScorers(k).filter(s=>inTeam(s.t,t)).map(s=>[k,s]));
  if(pich.length){const names=[...new Set(pich.map(([k,s])=>s.n))];out.push(['Máximos goleadores de la Liga',`${pich.length} ${pich.length===1?'vez':'veces'} un jugador del club fue el máximo goleador: ${esc(joinY(names.slice(0,4)))}${names.length>4?' y otros':''}.`]);}
  const zs=DONE.map(k=>[k,zamoraWinner(k)]).filter(([k,z])=>z&&z[1]===nm);
  if(zs.length){const names=[...new Set(zs.map(([k,z])=>z[0]))];out.push(['Trofeos Zamora',`${zs.length} ${zs.length===1?'Zamora':'Zamoras'} para sus porteros: ${esc(joinY(names.slice(0,4)))}${names.length>4?' y otros':''}.`]);}
  const zr=Object.entries(ZARRA).filter(([k,a])=>a.some(z=>z[1]===nm));
  if(zr.length){const names=[...new Set(zr.flatMap(([k,a])=>a.filter(z=>z[1]===nm).map(z=>z[0])))];out.push(['Trofeos Zarra',`${zr.length} desde 2005/06: ${esc(joinY(names))}.`]);}
  const most=ms.slice().sort((a,b)=>(b.hg+b.ag)-(a.hg+a.ag))[0];
  if(most)out.push(['El partido con más goles',`${esc(T[most.h])} ${most.hg}–${most.ag} ${esc(T[most.a])}, el ${fdate(most)}.`]);
  const rs=rivalStats(t).sort((a,b)=>b.P-a.P)[0];
  if(rs)out.push(['Su rival más habitual',`${esc(T[rs.t])}: ${rs.P} partidos de Liga (${rs.W}G ${rs.D}E ${rs.L}P).`]);
  $('tFacts').innerHTML=out.map(([a,b])=>`<li><span class="k">${a}</span><span class="t">${b}</span></li>`).join('');
}
function renderTeamSeason(){
  const t=st.team,k=st.season,r=rowOf(k,t),nT=DATA.seasons[k].length;
  $('tSeasonTag').textContent='Temporada '+lab(k);$('tSeasonTitle').textContent=`${T[t]} en ${lab(k)}`;
  const el=$('tRound'),d=$('tDetail'),gl=$('tGames'),pl=$('tPlayers');
  if(!r){const msg=`<p class="note">${esc(T[t])} no jugó en Primera en ${lab(k)}. Cambia la temporada en la barra de arriba.</p>`;el.innerHTML=msg;d.innerHTML='';gl.innerHTML='';pl.innerHTML='';$('tRoundNote').textContent='';$('tGamesNote').textContent='';return;}
  $('tSeasonTitle').textContent=`${T[t]} en ${lab(k)} · ${r[I.pos]}º`;
  // jornada a jornada
  const ps=[...r[I.posStr]].map(c=>c.charCodeAt(0)-96),rounds=(nT-1)*2;
  $('tRoundNote').textContent='posición tras cada jornada';
  const L=36,R=14,Tp=12,B=26,H=220,den=k===CURRENT?Math.max(ps.length-1,1):Math.max(rounds-1,1);
  const x=i=>L+i*(W-L-R)/den,y=p=>Tp+(p-1)/(nT-1)*(H-Tp-B);
  let s4=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Posición jornada a jornada">`;
  [...new Set([1,4,Math.round(nT/2),nT-2,nT])].forEach(p=>{s4+=`<line class="gridl" x1="${L}" x2="${W-R}" y1="${y(p)}" y2="${y(p)}"/><text x="${L-8}" y="${y(p)+4}" text-anchor="end">${p}º</text>`;});
  s4+=`<rect x="${L}" y="${y(nT-2.5)}" width="${W-L-R}" height="${y(nT)-y(nT-2.5)+4}" fill="var(--down)" opacity=".08"/>`;
  const lastJ=k===CURRENT?ps.length:rounds;
  [...new Set([1,Math.round(lastJ/4),Math.round(lastJ/2),Math.round(lastJ*3/4),lastJ])].forEach(j=>{s4+=`<text x="${x(j-1)}" y="${H-6}" text-anchor="middle">J${j}</text>`;});
  s4+=`<path fill="var(--accent)" opacity=".10" d="M${x(0)},${y(nT)} ${ps.map((p,i)=>`L${x(i)},${y(p)}`).join(' ')} L${x(ps.length-1)},${y(nT)}Z"/>`;
  s4+=`<polyline fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" points="${ps.map((p,i)=>x(i)+','+y(p)).join(' ')}"/>`;
  ps.forEach((p,i)=>{s4+=`<rect class="hit" x="${x(i)-8}" y="${Tp}" width="16" height="${H-Tp-B}" data-tip="${esc(`<b>Jornada ${i+1}</b><br>Posición: <span class=num>${p}º</span>`)}"/>`;});
  const lp=ps[ps.length-1];s4+=`<circle cx="${x(ps.length-1)}" cy="${y(lp)}" r="5" fill="var(--accent)" stroke="var(--surface)" stroke-width="2"/><text class="lbl" x="${x(ps.length-1)-8}" y="${y(lp)-10}" text-anchor="end">${lp}º</text>`;
  el.innerHTML=s4+'</svg>';
  // detalle
  const m=(k2,v)=>`<div class="mini"><span class="k">${k2}</span><span class="v">${v}</span></div>`;
  const parts=[m('Balance',`${r[I.W]}G ${r[I.D]}E ${r[I.L]}P · ${r[I.Pts]} pts`),m('Goles',`${r[I.GF]} a favor · ${r[I.GA]} en contra`),m('En casa',`${r[I.hW]}G ${r[I.hD]}E ${r[I.hL]}P · ${r[I.hGF]}–${r[I.hGA]}`),m('Fuera',`${r[I.aW]}G ${r[I.aD]}E ${r[I.aL]}P · ${r[I.aGF]}–${r[I.aGA]}`)];
  if(r[I.S]!=null)parts.push(m('Tiros (a puerta)',`${r[I.S]} (${r[I.ST]}) · rival ${r[I.SA]} (${r[I.STA]})`),m('Córners',`${r[I.C]} a favor · ${r[I.CA]} en contra`),m('Faltas',`${r[I.F]} cometidas · ${r[I.FA]} recibidas`));
  if(r[I.cb]!=null)parts.push(m('Puntos remontados',`${r[I.cb]} (perdiendo al descanso)`),m('Puntos dejados escapar',`${r[I.bl]} (ganando al descanso)`));
  const xg=PD.tx[k]&&PD.tx[k][T[t]];
  if(xg)parts.push(m('Goles esperados (xG)',`${fmt(xg[0],1)} a favor · ${fmt(xg[1],1)} en contra`),m('Goles reales − xG',(()=>{const d2=r[I.GF]-xg[0];return (d2>0?'+':'')+fmt(d2,1)+' a favor';})()));
  const S=seasonInfo(k),sk=S.st[t];if(sk)parts.push(m('Mejor racha',`${sk.win.n} victorias seguidas · ${sk.unb.n} sin perder`));
  d.innerHTML=parts.join('');
  // partidos
  const G=S.G[t]||[];$('tGamesNote').textContent=G.length+' partidos · C = en casa, F = fuera';
  gl.innerHTML=G.map((g,i)=>`<li><span class="d">J${i+1}</span><span class="res ${g.res}">${RES_ES[g.res]}</span><span class="a">${teamBtn(g.opp)}</span><span class="s">${g.gf}–${g.ga}</span><span class="d">${g.home?'C':'F'}</span></li>`).join('');
  // jugadores
  let ph='';
  if(FB[k]){const rows=FB[k].filter(p=>inTeam(p[1],t));const sc=rows.slice().sort((a,b)=>b[F.g]-a[F.g]||(b[F.a]||0)-(a[F.a]||0)).slice(0,8);
    ph=sc.length?`<ol class="rank blk">${sc.map((p,i)=>`<li><span class="i">${i+1}</span><span class="t"><button type="button" class="pl" data-player="${esc(p[0])}">${esc(p[0])}</button><small>${p[F.mp]} partidos${p[F.a]!=null?' · '+p[F.a]+' asist.':''}</small></span><span class="v">${p[F.g]} goles</span></li>`).join('')}</ol>`:'';}
  else if(PH[k]){const sc=(PH[k].G||[]).filter(p=>p[1]===T[t]);ph=sc.length?`<ol class="rank blk">${sc.map((p,i)=>`<li><span class="i">${i+1}</span><span class="t"><button type="button" class="pl" data-player="${esc(p[0])}">${esc(p[0])}</button><small>entre los 10 máximos goleadores</small></span><span class="v">${p[2]} goles</span></li>`).join('')}</ol>`:'';}
  const z=zamora(k);const kp=z&&z.rows.filter(x=>x[1]===T[t])[0];
  if(kp)ph+=`<p class="note" style="margin-top:8px">Portero: <b>${esc(kp[0])}</b>, ${fmt(kp[2],2)} goles encajados por partido${z.rows[0]===kp?' · <span class="badge gold">Zamora</span>':''}.</p>`;
  pl.innerHTML=ph||'<p class="note">No hay jugadores de este equipo entre los destacados guardados de esta temporada.</p>';
}
function rivalStats(t){const o={};teamMatches(t).forEach(m=>{const op=m.h===t?m.a:m.h,r=resOf(m,t),x=o[op]||(o[op]={t:op,P:0,W:0,D:0,L:0,GF:0,GA:0});x.P++;x[r]++;x.GF+=m.h===t?m.hg:m.ag;x.GA+=m.h===t?m.ag:m.hg;});return Object.values(o);}
function renderRivals(t){
  const rs=rivalStats(t).sort((a,b)=>b.P-a.P);
  $('tRivals').innerHTML='<thead><tr><th class="l">Rival</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>GF</th><th>GC</th><th>% vict.</th></tr></thead><tbody>'+rs.slice(0,16).map(x=>`<tr data-h2h="${x.t}" style="cursor:pointer"><td class="l team">${tname(x.t)}</td><td>${x.P}</td><td>${x.W}</td><td>${x.D}</td><td>${x.L}</td><td>${x.GF}</td><td>${x.GA}</td><td>${pct(x.W,x.P)}</td></tr>`).join('')+'</tbody>';
  $('tRivals').querySelectorAll('tr[data-h2h]').forEach(tr=>{tr.onclick=()=>goH2H(t,+tr.dataset.h2h);tr.onmouseenter=()=>tr.querySelectorAll('td').forEach(td=>td.style.background='var(--hl)');tr.onmouseleave=()=>tr.querySelectorAll('td').forEach(td=>td.style.background='');});
  const el=rs.filter(x=>x.P>=20);
  const li=(x,i,v)=>`<li><span class="i">${i+1}</span><span class="t"><button type="button" class="pl" data-goh2h="${x.t}">${esc(T[x.t])}</button><small>${x.W}G ${x.D}E ${x.L}P en ${x.P} partidos</small></span><span class="v">${v}</span></li>`;
  $('tFav').innerHTML=el.length?el.slice().sort((a,b)=>b.W/b.P-a.W/a.P).slice(0,5).map((x,i)=>li(x,i,pct(x.W,x.P))).join(''):'<li class="note">Pocos partidos para calcularlo.</li>';
  $('tBad').innerHTML=el.length?el.slice().sort((a,b)=>a.W/a.P-b.W/b.P||b.L/b.P-a.L/a.P).slice(0,5).map((x,i)=>li(x,i,pct(x.W,x.P))).join(''):'<li class="note">Pocos partidos para calcularlo.</li>';
}

// ---------- CARA A CARA ----------
const DERBIS=[['El Clásico','Real Madrid','Barcelona'],['Derbi madrileño','Real Madrid','Atlético de Madrid'],['Barça – Atleti','Barcelona','Atlético de Madrid'],['Derbi sevillano','Sevilla','Real Betis'],['Derbi vasco','Athletic Club','Real Sociedad'],['Athletic – Madrid','Athletic Club','Real Madrid'],['Derbi barcelonés','Barcelona','Espanyol'],['Derbi gallego','Celta de Vigo','Deportivo'],['Derbi asturiano','Sporting de Gijón','Real Oviedo'],['Valencia – Villarreal','Valencia','Villarreal']];
function renderH2H(){
  const A=st.team,Bt=st.teamB;
  $('derbis').innerHTML=DERBIS.map(([n,a,b])=>{const ia=T.indexOf(a),ib=T.indexOf(b);const on=(ia===A&&ib===Bt)||(ia===Bt&&ib===A);return `<button type="button" class="chip" aria-pressed="${on}" data-a="${ia}" data-b="${ib}">${n}</button>`;}).join('');
  $('derbis').querySelectorAll('.chip').forEach(c=>c.onclick=()=>{st.team=+c.dataset.a;st.teamB=+c.dataset.b;render();});
  const ms=teamMatches(A).filter(m=>m.h===Bt||m.a===Bt);
  const wa=ms.filter(m=>resOf(m,A)==='W').length,wb=ms.filter(m=>resOf(m,Bt)==='W').length,dr=ms.length-wa-wb;
  const ga=ms.reduce((s,m)=>s+(m.h===A?m.hg:m.ag),0),gb=ms.reduce((s,m)=>s+(m.h===Bt?m.hg:m.ag),0);
  const nA=esc(T[A]),nB=esc(T[Bt]);
  if(!ms.length){$('hSummary').innerHTML=`<div class="h2h-names"><span style="color:var(--c1)">${nA}</span><span style="color:var(--c2)">${nB}</span></div><p class="note">Nunca se han enfrentado en Primera División.</p>`;}
  else{
    const at=ms.filter(m=>m.h===A),bt=ms.filter(m=>m.h===Bt);
    const rec=(arr,t)=>`${arr.filter(m=>resOf(m,t)==='W').length}G ${arr.filter(m=>resOf(m,t)==='D').length}E ${arr.filter(m=>resOf(m,t)==='L').length}P`;
    const both=DONE.filter(k=>rowOf(k,A)&&rowOf(k,Bt)),aAbove=both.filter(k=>rowOf(k,A)[I.pos]<rowOf(k,Bt)[I.pos]).length;
    const seg=(n,col,label)=>n?`<div style="flex:${n};background:${col}" data-tip="${esc(label)}">${n}</div>`:'';
    const mm=(a,b)=>`<div class="mini"><span class="k">${a}</span><span class="v">${b}</span></div>`;
    $('hSummary').innerHTML=`<div class="h2h-names"><span style="color:var(--c1)">${crest(A,'md')}${nA}</span><span style="color:var(--c2)">${crest(Bt,'md')}${nB}</span></div>
      <div class="h2h-bar">${seg(wa,'var(--c1)',`Victorias de ${nA}: ${wa}`)}${seg(dr,'var(--draw)',`Empates: ${dr}`)}${seg(wb,'var(--c2)',`Victorias de ${nB}: ${wb}`)}</div>
      <div class="legend" style="justify-content:space-between"><span>${wa} victorias (${pct(wa,ms.length)})</span><span>${dr} empates</span><span>${wb} victorias (${pct(wb,ms.length)})</span></div>
      <div class="split">${mm('Partidos en Liga',ms.length)}${mm('Goles',`${ga} – ${gb}`)}${mm('En casa del '+nA,rec(at,A)+' para '+nA)}${mm('En casa del '+nB,rec(bt,Bt)+' para '+nB)}${mm('Primer partido',fdate(ms[0]))}${mm('Último partido',`${fdate(ms[ms.length-1])} · ${ms[ms.length-1].hg}–${ms[ms.length-1].ag}`)}${both.length?mm('Quedó por encima',`${nA}: ${aAbove} de ${both.length} temporadas`):''}</div>`;
  }
  // décadas
  const dec={};ms.forEach(m=>{const d=Math.floor(+m.k/10)*10;const x=dec[d]||(dec[d]=[0,0,0]);const r=resOf(m,A);x[r==='W'?0:r==='D'?1:2]++;});
  const ds=Object.keys(dec).sort();
  if(ds.length){const rowH=26,nameW=70,top=4,mx=Math.max(...ds.map(d=>dec[d][0]+dec[d][1]+dec[d][2]));let s=`<svg viewBox="0 0 ${W} ${top+ds.length*rowH}" role="img" aria-label="Resultados por décadas">`;
    ds.forEach((d,i)=>{const y=top+i*rowH,[a,b,c]=dec[d],sc=(W-nameW-10)/mx;let x0=nameW;s+=`<text class="name" x="0" y="${y+rowH/2+4}">${d}s</text>`;
      [[a,'var(--c1)'],[b,'var(--draw)'],[c,'var(--c2)']].forEach(([v,col])=>{if(v){s+=`<rect x="${x0}" y="${y+4}" width="${v*sc-1}" height="${rowH-8}" fill="${col}" rx="2"/>`;if(v*sc>18)s+=`<text x="${x0+v*sc/2}" y="${y+rowH/2+4}" text-anchor="middle" style="fill:#fff">${v}</text>`;x0+=v*sc;}});
      s+=`<rect class="hit" x="0" y="${y}" width="${W}" height="${rowH}" data-tip="${esc(`<b>Años ${d}</b><br>${nA}: ${a} · empates: ${b} · ${nB}: ${c}`)}"/>`;});
    $('hDecades').innerHTML=s+'</svg>';}else $('hDecades').innerHTML='<p class="note">Sin partidos.</p>';
  // comparación
  const ag=allAgg(),xa=ag.find(x=>x.t===A),xb=ag.find(x=>x.t===Bt);
  const rows=[['Temporadas en Primera',x=>x.S,1],['Ligas',x=>x.Tit,1],['Mejor puesto',x=>x.best,-1,v=>v+'º'],['Clasificación histórica',x=>ag.indexOf(x)+1,-1,v=>v+'º'],['Puntos (a 3)',x=>x.Pts3,1,fmt],['Victorias',x=>x.W,1,fmt],['% de victorias',x=>x.W/x.P*100,1,v=>fmt(v,1)+'%'],['Goles a favor',x=>x.GF,1,fmt],['Goles en contra por partido',x=>x.GA/x.P,-1,v=>fmt(v,2)]];
  $('hCmp').innerHTML=`<thead><tr><th>${nA}</th><th></th><th>${nB}</th></tr></thead><tbody>`+rows.map(([n,f,dir,fm])=>{const va=xa?f(xa):null,vb=xb?f(xb):null,F2=fm||(v=>v);const ba=va!=null&&vb!=null&&(va-vb)*dir>0,bb=va!=null&&vb!=null&&(vb-va)*dir>0;return `<tr><td class="${ba?'better':''}">${va==null?'—':F2(va)}</td><td>${n}</td><td class="${bb?'better':''}">${vb==null?'—':F2(vb)}</td></tr>`;}).join('')+'</tbody>';
  const decs=[...new Set(SKEYS.map(k=>Math.floor(+k/10)*10))];const lastDec=decs[decs.length-1];
  const dsel=st.h2hDec==='last'?lastDec:st.h2hDec;
  $('hDecs').innerHTML=`<button type="button" class="chip" data-dec="all" aria-pressed="${dsel==='all'}">Toda la historia</button>`+decs.map(d=>`<button type="button" class="chip" data-dec="${d}" aria-pressed="${dsel===d}">${d}s</button>`).join('');
  $('hDecs').querySelectorAll('.chip').forEach(c=>c.onclick=()=>{st.h2hDec=c.dataset.dec==='all'?'all':+c.dataset.dec;renderH2H();});
  const dKeys=dsel==='all'?null:SKEYS.filter(k=>Math.floor(+k/10)*10===dsel);
  $('hPos').innerHTML=posChart([A,Bt],['var(--c1)','var(--c2)'],dKeys?260:240,dKeys)+`<div class="legend"><span><span class="sw" style="background:var(--c1)"></span>${nA}</span><span><span class="sw" style="background:var(--c2)"></span>${nB}</span><span><span class="sw" style="background:var(--gold);border-radius:50%"></span>Campeón</span></div>`;
  $('hLast').innerHTML=ms.slice(-10).reverse().map(m=>gameLi(m)).join('')||'<li class="note">—</li>';
  const marg=(m,t)=>m.h===t?m.hg-m.ag:m.ag-m.hg;
  $('hBigA').textContent='Mayores victorias del '+T[A];$('hBigB').textContent='Mayores victorias del '+T[Bt];
  $('hBigAList').innerHTML=ms.filter(m=>marg(m,A)>0).sort((a,b)=>marg(b,A)-marg(a,A)||(b.hg+b.ag)-(a.hg+a.ag)).slice(0,6).map(m=>gameLi(m)).join('')||'<li class="note">Ninguna.</li>';
  $('hBigBList').innerHTML=ms.filter(m=>marg(m,Bt)>0).sort((a,b)=>marg(b,Bt)-marg(a,Bt)||(b.hg+b.ag)-(a.hg+a.ag)).slice(0,6).map(m=>gameLi(m)).join('')||'<li class="note">Ninguna.</li>';
}
