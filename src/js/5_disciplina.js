
// ---------- DISCIPLINA ----------
const CARD=()=>st.card==='Y'?{rec:I.Y,prov:I.oY,word:'amarillas',Word:'Amarillas'}:{rec:I.R,prov:I.oR,word:'rojas',Word:'Rojas'};
function pickTeam(t){st.team=t;render();}
function renderDisciplina(){
  const k=st.season,C=CARD(),rows=DATA.seasons[k],pj=seasonGames(k);
  $('dTitle').textContent='Tarjetas · '+lab(k);
  const ks=[];
  if(hasY(k))ks.push(kpi('Amarillas',fmt(seasonTot(k,I.Y)),fmt(seasonTot(k,I.Y)/pj,2)+' por partido'));
  if(hasR(k)){ks.push(kpi('Rojas',fmt(seasonTot(k,I.R)),fmt(seasonTot(k,I.R)/pj,2)+' por partido'));const tr=rows.slice().sort((a,b)=>b[I.R]-a[I.R])[0];ks.push(kpi('Más rojas recibidas',tr[I.R],esc(T[tr[0]])));}
  if(hasStats(k)){const tp=rows.slice().sort((a,b)=>b[I.oR]-a[I.oR]||a[I.R]-b[I.R])[0];ks.push(kpi('Más rojas provocadas',tp[I.oR],esc(T[tp[0]])));
    const tf=rows.slice().sort((a,b)=>b[I.F]-a[I.F])[0];ks.push(kpi('Más faltas cometidas',tf[I.F],esc(T[tf[0]])));}
  $('dKpis').innerHTML=ks.join('')||kpi('Sin datos','—','no hay tarjetas registradas para esta temporada');
  renderCards();renderTeamCards();renderDiscPlayers();renderDiscHistory();
}
function renderCards(){
  const C=CARD(),el=$('chartDiv');
  $('divTitle').textContent=C.Word+' por equipo · '+lab(st.season);
  if(!hasStats(st.season)){
    const rows=DATA.seasons[st.season].slice();
    if(rows[0][C.rec]==null){el.innerHTML=`<p class="note">No hay datos de ${C.word} para ${lab(st.season)}. ${C.rec===I.Y?'Las amarillas se registran desde 1971/72.':''}</p>`;}
    else{rows.sort((a,b)=>b[C.rec]-a[C.rec]);const max=Math.max(1,...rows.map(r=>r[C.rec]));const nameW=150,rowH=24,top=22;
      let s=`<svg viewBox="0 0 ${W} ${top+rows.length*rowH+6}" role="img" aria-label="${C.Word} recibidas por equipo"><text x="${nameW}" y="12">${C.word} recibidas →</text>`;
      rows.forEach((r,i)=>{const y=top+i*rowH,sel=r[0]===st.team,w=r[C.rec]/max*(W-nameW-40);
        if(sel)s+=`<rect x="0" y="${y}" width="${W}" height="${rowH}" fill="var(--hl)" rx="4"/>`;
        s+=`<text class="name ${sel?'sel':''}" x="0" y="${y+rowH/2+4}">${esc(T[r[0]])}</text><path fill="var(--rec)" d="${hbar(nameW,nameW+w,y+5,rowH-10)}"/><text class="lbl" x="${nameW+w+6}" y="${y+rowH/2+4}">${r[C.rec]}</text>`;
        s+=`<rect class="hit" x="0" y="${y}" width="${W}" height="${rowH}" data-t="${r[0]}" style="cursor:pointer" data-tip="${esc(`<b>${esc(T[r[0]])}</b><br>${C.Word} recibidas: <span class=num>${r[C.rec]}</span>`)}"/>`;});
      el.innerHTML=s+'</svg><p class="note">Antes de 2005/06 solo hay tarjetas recibidas (fuente: BDFútbol).</p>';}
  }else{
    const rows=DATA.seasons[st.season].slice();
    rows.sort((a,b)=>(b[C.prov]-b[C.rec])-(a[C.prov]-a[C.rec])||b[C.prov]-a[C.prov]);
    const max=Math.max(1,...rows.map(r=>Math.max(r[C.rec],r[C.prov])));
    const nameW=150,gap=4,rowH=24,barH=14,top=22,half=(W-nameW-gap*2)/2,cx=nameW+half+gap,sx=v=>v/max*(half-34);
    let s=`<svg viewBox="0 0 ${W} ${top+rows.length*rowH+6}" role="img" aria-label="${C.Word} recibidas y provocadas por equipo">`;
    s+=`<text x="${cx-6}" y="12" text-anchor="end">← recibidas</text><text x="${cx+6}" y="12">provocadas →</text><line class="axis" x1="${cx}" x2="${cx}" y1="${top-4}" y2="${top+rows.length*rowH}"/>`;
    rows.forEach((r,i)=>{const y=top+i*rowH,by=y+(rowH-barH)/2,sel=r[0]===st.team,rec=r[C.rec],prov=r[C.prov],bal=prov-rec;
      const tipH=`<b>${esc(T[r[0]])}</b><br>${C.Word} recibidas: <span class="num">${rec}</span><br>${C.Word} provocadas: <span class="num">${prov}</span><br>Balance: <span class="num">${bal>0?'+':''}${bal}</span>`;
      if(sel)s+=`<rect x="0" y="${y}" width="${W}" height="${rowH}" fill="var(--hl)" rx="4"/>`;
      s+=`<text class="name ${sel?'sel':''}" x="0" y="${y+rowH/2+4}">${esc(T[r[0]])}</text><path fill="var(--rec)" d="${hbar(cx-1,cx-1-sx(rec),by,barH)}"/><path fill="var(--prov)" d="${hbar(cx+1,cx+1+sx(prov),by,barH)}"/>`;
      s+=`<text class="lbl" x="${cx-1-sx(rec)-5}" y="${y+rowH/2+4}" text-anchor="end">${rec}</text><text class="lbl" x="${cx+1+sx(prov)+5}" y="${y+rowH/2+4}">${prov}</text>`;
      s+=`<rect class="hit" x="0" y="${y}" width="${W}" height="${rowH}" data-tip="${esc(tipH)}" data-t="${r[0]}" style="cursor:pointer"/>`;});
    el.innerHTML=s+'</svg><p class="note">Ordenados por balance: arriba, los que más tarjetas provocan en proporción a las que reciben.</p>';
  }
  el.querySelectorAll('[data-t]').forEach(n=>n.addEventListener('click',()=>pickTeam(+n.dataset.t)));
  // Ranking de la temporada elegida
  const k=st.season,rows=DATA.seasons[k];
  const slist=(f,id,emptyTxt)=>{const top=rows.filter(r=>r[f]!=null).slice().sort((a,b)=>b[f]-a[f]||a[I.pos]-b[I.pos]).slice(0,8);
    $(id).innerHTML=top.length?top.map((r,i)=>`<li class="${r[0]===st.team?'me':''}"><span class="i">${i+1}</span><span class="t">${esc(T[r[0]])}<small>${r[I.pos]}º en la tabla</small></span><span class="v">${r[f]}</span></li>`).join(''):`<li class="note">${emptyTxt}</li>`;};
  $('recProvTitle').textContent='Más '+C.word+' provocadas · '+lab(k);$('recRecTitle').textContent='Más '+C.word+' recibidas · '+lab(k);
  slist(C.prov,'recProv','Las tarjetas provocadas solo existen desde 2005/06.');slist(C.rec,'recRec',C.rec===I.Y?'Las amarillas se registran desde 1971/72.':'Sin datos esta temporada.');
  // Récords históricos (una temporada)
  const all=[];DONE.forEach(k2=>DATA.seasons[k2].forEach(r=>all.push([k2,r])));
  const recK=cardKeys(C.rec);$('hrRecNote').textContent='en una temporada, desde '+lab(recK[0]);
  const list=(f,id)=>{const top=all.filter(x=>x[1][f]!=null).sort((a,b)=>b[1][f]-a[1][f]).slice(0,8);
    $(id).innerHTML=top.map(([k2,r],i)=>`<li class="${r[0]===st.team?'me':''}"><span class="i">${i+1}</span><span class="t">${esc(T[r[0]])}<small>${lab(k2)}</small></span><span class="v">${r[f]}</span></li>`).join('');};
  $('hrProvTitle').textContent='Récord de '+C.word+' provocadas';$('hrRecTitle').textContent='Récord de '+C.word+' recibidas';
  list(C.prov,'hrProv');list(C.rec,'hrRec');
  renderDiscTable();
}
function renderDiscTable(){
  const k=st.season,rows=DATA.seasons[k].slice(),hs=hasStats(k);
  $('dTblTitle').textContent='Faltas y tarjetas por equipo · '+lab(k);
  const cols=[{k:'team',h:'Equipo',f:r=>T[r[0]],html:r=>tname(r[0]),cls:'l team'}];
  if(hs)cols.push({k:'F',h:'Faltas cometidas',f:r=>r[I.F]},{k:'FA',h:'Faltas recibidas',f:r=>r[I.FA]});
  if(hasY(k))cols.push({k:'Y',h:'<span class="card-ico y"></span> Recibidas',f:r=>r[I.Y]});
  if(hs)cols.push({k:'oY',h:'<span class="card-ico y"></span> Provocadas',f:r=>r[I.oY]});
  if(hasR(k))cols.push({k:'R',h:'<span class="card-ico r"></span> Recibidas',f:r=>r[I.R]});
  if(hs)cols.push({k:'oR',h:'<span class="card-ico r"></span> Provocadas',f:r=>r[I.oR]},{k:'fpc',h:'Faltas por tarjeta',f:r=>r[I.Y]+r[I.R]?+(r[I.F]/(r[I.Y]+r[I.R])).toFixed(1):null,fm:v=>fmt(v,1)});
  const tb=$('tblDisc');
  if(cols.length===1){tb.innerHTML='';$('dTblNote').textContent='No hay faltas ni tarjetas por equipo para '+lab(k)+'.';return;}
  const ds=st.sortDisc&&cols.find(c=>c.k===st.sortDisc.k)?st.sortDisc:{k:cols[1].k,d:-1};
  const c=cols.find(c=>c.k===ds.k);rows.sort(c.k==='team'?(a,b)=>T[a[0]].localeCompare(T[b[0]],'es')*ds.d:(a,b)=>((c.f(a)??-1)-(c.f(b)??-1))*ds.d);
  tb.innerHTML='<thead><tr>'+cols.map(c2=>`<th class="${c2.cls?'l':''}"><button type="button" data-k="${c2.k}" ${ds.k===c2.k?`data-sorted="${ds.d>0?'▲':'▼'}"`:''}>${c2.h}</button></th>`).join('')+'</tr></thead><tbody>'+
    rows.map(r=>`<tr class="${r[0]===st.team?'sel':''}" data-t="${r[0]}">`+cols.map(c2=>{const v=c2.f(r);if(c2.html)return `<td class="${c2.cls}">${c2.html(r)}</td>`;return v==null?'<td class="na">—</td>':`<td class="${c2.cls||''}">${esc(c2.fm?c2.fm(v):v)}</td>`;}).join('')+'</tr>').join('')+'</tbody>';
  tb.querySelectorAll('th button').forEach(b=>b.onclick=()=>{const kk=b.dataset.k;st.sortDisc=ds.k===kk?{k:kk,d:-ds.d}:{k:kk,d:kk==='team'?1:-1};renderDiscTable();});
  tb.querySelectorAll('tbody tr').forEach(tr=>tr.onclick=()=>pickTeam(+tr.dataset.t));
  $('dTblNote').textContent=hs?'Recibidas = las que vio el equipo. Provocadas = las que vieron sus rivales jugando contra él. Faltas recibidas = faltas que le hicieron los rivales.':'Antes de 2005/06 solo hay tarjetas recibidas por equipo; faltas y tarjetas provocadas existen desde 2005/06.';
}
function renderTeamCards(){
  const t=st.team,C=CARD();
  $('teamCardsTitle').textContent=`${C.Word} por temporada · ${T[t]}`;
  const ks=SKEYS.filter(k=>+k>=1971),hh=ks.map(k=>[k,rowOf(k,t)]),el=$('chartTeamCards');
  if(!hh.some(h=>h[1])){el.innerHTML='<p class="note">Este equipo no ha jugado en Primera desde 1971/72.</p>';return;}
  const L=34,R=8,Tp=10,B=26,H=230,n=ks.length,band=(W-L-R)/n,bw=Math.min(10,(band-6)/2);
  const max=niceMax(Math.max(1,...hh.filter(h=>h[1]).map(([k,r])=>Math.max(r[C.rec]||0,r[C.prov]||0))));
  const y=v=>H-B-v/max*(H-Tp-B);
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${C.Word} recibidas y provocadas por temporada">`;
  ticks(max).forEach(v=>{s+=`<line class="gridl" x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L-8}" y="${y(v)+4}" text-anchor="end">${v}</text>`;});
  hh.forEach(([k,r],i)=>{const bx=L+i*band+(band-2*bw-2)/2;
    if(+k%5===0)s+=`<text x="${L+i*band+band/2}" y="${H-6}" text-anchor="middle">${k}</text>`;
    if(!r||r[C.rec]==null)return;
    s+=`<path fill="var(--rec)" d="${vbar(bx,bw,y(0),y(r[C.rec]))}"/>`+(r[C.prov]!=null?`<path fill="var(--prov)" d="${vbar(bx+bw+1,bw,y(0),y(r[C.prov]))}"/>`:'');
    s+=`<rect class="hit" x="${L+i*band}" y="${Tp}" width="${band}" height="${H-Tp-B}" data-tip="${esc(`<b>${lab(k)}${k===CURRENT?' (en curso)':''}</b><br>${C.Word} recibidas: <span class=num>${r[C.rec]}</span>`+(r[C.prov]!=null?`<br>${C.Word} provocadas: <span class=num>${r[C.prov]}</span>`:''))}"/>`;});
  el.innerHTML=s+`<line class="axis" x1="${L}" x2="${W-R}" y1="${y(0)}" y2="${y(0)}"/></svg><p class="note">Desde 1971/72. Las provocadas solo existen desde 2005/06.</p>`;
}
function renderDiscPlayers(){
  const k=st.season,me=p=>inTeam(p[1],st.team);$('dPlTitle').textContent='Amonestados y expulsados · '+lab(k);let h='';
  if(FB[k]){const rows=FB[k],hasF=rows.some(p=>p[F.f]!=null),hasFd=rows.some(p=>p[F.fd]!=null);
    h+=plCard('<span class="card-ico y"></span> Más amonestados',topBy(rows,p=>p[F.y]),p=>p[F.y],p=>`${p[F.mp]} partidos`,null,me);
    h+=plCard('<span class="card-ico r"></span> Más expulsados',topBy(rows,p=>p[F.r]),p=>p[F.r],p=>`${p[F.yr]??0} por doble amarilla`,null,me);
    if(hasF)h+=plCard('Más faltas cometidas',topBy(rows,p=>p[F.f]),p=>p[F.f],p=>`${p[F.mp]} partidos · ${p[F.y]} amarillas`,null,me);
    if(hasFd)h+=plCard('Más faltas recibidas',topBy(rows,p=>p[F.fd]),p=>p[F.fd],p=>`${p[F.mp]} partidos`,null,me);
  }else if(PH[k]){const hh=PH[k],m2=p=>p[1]===T[st.team];
    h+=plCard('<span class="card-ico y"></span> Más amonestados',hh.Y||[],p=>p[2],null,null,m2)+plCard('<span class="card-ico r"></span> Más expulsados',hh.R||[],p=>p[2],null,null,m2);
  }else h='<div class="panel"><p class="note">Sin datos de jugadores esta temporada.</p></div>';
  $('dPlGrid').innerHTML=h;
  const C=[{h:'<span class="card-ico y"></span> Amarillas',f:c=>c[FC.y],sub:c=>`${c[FC.mp]} partidos`},{h:'<span class="card-ico r"></span> Rojas',f:c=>c[FC.r],sub:c=>`${c[FC.y]} amarillas`},{h:'Faltas cometidas',f:c=>c[FC.f],sub:c=>`${c[FC.fs]} temporadas con datos`}];
  $('dCarGrid').innerHTML=C.map(s=>plCard(s.h,FBCAR.slice().sort((a,b)=>s.f(b)-s.f(a)).slice(0,8),s.f,s.sub,null,c=>c[1]===T[st.team])).join('');
}
function renderDiscHistory(){
  const ky=cardKeys(I.Y).filter(k=>k!==CURRENT),kr=cardKeys(I.R).filter(k=>k!==CURRENT);
  $('dTrend').innerHTML=trendPanel('Amarillas por partido',ky,ky.map(k=>seasonTot(k,I.Y)/seasonGames(k)),v=>fmt(v,2))+trendPanel('Rojas por partido',kr,kr.map(k=>seasonTot(k,I.R)/seasonGames(k)),v=>fmt(v,2));
  const AC=[{k:'t',h:'Equipo',cls:'l team',f:a=>T[a.t]},{k:'S',h:'Temp.'},{k:'R',h:'<span class="card-ico r"></span> Rec.'},{k:'oR',h:'<span class="card-ico r"></span> Prov.'},{k:'Y',h:'<span class="card-ico y"></span> Rec.'},{k:'oY',h:'<span class="card-ico y"></span> Prov.'},{k:'F',h:'Faltas'},{k:'FA',h:'Faltas rec.'}];
  const list=aggAll(),sk=st.sortCards;
  list.sort(sk.k==='t'?(a,b)=>T[a.t].localeCompare(T[b.t],'es')*sk.d:(a,b)=>(a[sk.k]-b[sk.k])*sk.d||b.Pts3-a.Pts3);
  const tb=$('tblCards');
  tb.innerHTML='<thead><tr><th>#</th>'+AC.map(c=>`<th class="${c.cls?'l':''}"><button type="button" data-k="${c.k}" ${sk.k===c.k?`data-sorted="${sk.d>0?'▲':'▼'}"`:''}>${c.h}</button></th>`).join('')+'</tr></thead><tbody>'+
    list.map((a,i)=>`<tr class="${a.t===st.team?'sel':''}" data-t="${a.t}"><td>${i+1}</td>`+AC.map(c=>{const na=(['oR','oY','F','FA'].includes(c.k)&&!a.statS)||(c.k==='R'&&!a.cardS)||(c.k==='Y'&&!a.yS);return na?'<td class="na">—</td>':`<td class="${c.cls||''}">${esc(c.f?c.f(a):fmt(a[c.k]))}</td>`}).join('')+'</tr>').join('')+'</tbody>';
  tb.querySelectorAll('th button').forEach(b=>b.onclick=()=>{const k=b.dataset.k;if(sk.k===k)sk.d*=-1;else{sk.k=k;sk.d=k==='t'?1:-1;}renderDiscHistory();});
  tb.querySelectorAll('tbody tr').forEach(tr=>tr.onclick=()=>pickTeam(+tr.dataset.t));
}
