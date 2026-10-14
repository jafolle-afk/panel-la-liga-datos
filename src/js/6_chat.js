// ---------- Query engine (tools Claude can call) ----------
function seasonKey(v){ if(v==null||v==='')return null; const s=norm(v); if(s==='todas'||s==='all')return 'all';
  let m=s.match(/(\d{2,4})\s*[\/-]\s*(\d{2,4})/); if(m){let a=m[1];if(a.length===2)a=(+a>=28?'19':'20')+a;return a;}
  m=s.match(/^(\d{4})$/); if(m)return m[1]; return null; }
function teamIdx(v){ if(v==null||v==='')return null; const q=norm(v); const al={'atletico':'Atlético de Madrid','atleti':'Atlético de Madrid','athletic':'Athletic Club','bilbao':'Athletic Club','betis':'Real Betis','depor':'Deportivo','la coruna':'Deportivo','coruna':'Deportivo','rayo':'Rayo Vallecano','racing':'Racing de Santander','sporting':'Sporting de Gijón','la real':'Real Sociedad','madrid':'Real Madrid','barca':'Barcelona','celta':'Celta de Vigo','gimnastic':'Gimnàstic','murcia':'Real Murcia','oviedo':'Real Oviedo','zaragoza':'Zaragoza','valladolid':'Valladolid','logrones':'Logroñés','malaga':'Málaga'};
  let i=T.findIndex(t=>norm(t)===q); if(i>=0)return i; if(al[q])return T.indexOf(al[q]); i=T.findIndex(t=>norm(t).includes(q)); if(i>=0)return i; i=T.findIndex(t=>q.includes(norm(t))); return i>=0?i:-1; }
function clean(o){for(const k in o)if(o[k]==null)delete o[k];return o;}
function teamRowObj(k,r){const o={temporada:lab(k),equipo:T[r[0]],puesto:r[I.pos],equipos_en_liga:DATA.seasons[k].length,pj:r[I.P],ganados:r[I.W],empatados:r[I.D],perdidos:r[I.L],goles_favor:r[I.GF],goles_contra:r[I.GA],diferencia:r[I.GF]-r[I.GA],puntos:r[I.Pts],puntos_por_victoria:winPts(k),puntos_3:pts3(r),
  local:`${r[I.hW]}G-${r[I.hD]}E-${r[I.hL]}P ${r[I.hGF]}-${r[I.hGA]}`,visitante:`${r[I.aW]}G-${r[I.aD]}E-${r[I.aL]}P ${r[I.aGF]}-${r[I.aGA]}`,
  tiros:r[I.S],tiros_puerta:r[I.ST],tiros_contra:r[I.SA],tiros_puerta_contra:r[I.STA],faltas_cometidas:r[I.F],faltas_recibidas:r[I.FA],corners:r[I.C],corners_contra:r[I.CA],
  amarillas_recibidas:r[I.Y],rojas_recibidas:r[I.R],amarillas_provocadas:r[I.oY],rojas_provocadas:r[I.oR],puntos_remontados:r[I.cb],puntos_perdidos_ganando_al_descanso:r[I.bl]};
  const x=PD.tx[k]&&PD.tx[k][T[r[0]]]; if(x){o.xg=x[0];o.xg_contra=x[1];} if(k===CURRENT)o.nota='temporada en curso'; return clean(o);}
const TEAM_FIELDS=['puesto','puntos','puntos_3','goles_favor','goles_contra','diferencia','ganados','empatados','perdidos','tiros','tiros_puerta','tiros_contra','faltas_cometidas','faltas_recibidas','corners','corners_contra','amarillas_recibidas','rojas_recibidas','amarillas_provocadas','rojas_provocadas','puntos_remontados','puntos_perdidos_ganando_al_descanso','xg','xg_contra'];
function inRange(k,desde,hasta){const d=seasonKey(desde),h=seasonKey(hasta);return (!d||d==='all'||k>=d)&&(!h||h==='all'||k<=h);}
const TOOLS=[
 {name:'equipos_por_temporada',description:'Filas equipo-temporada de LaLiga, 1928/29 a 2026/27: puesto, puntos (de su época) y puntos_3 (a 3 por victoria), goles, local/visitante, rojas recibidas (desde 1928) y amarillas recibidas (desde 1971); desde 2005/06 también tiros, faltas, córners y tarjetas provocadas; desde 2014/15 xG. Filtra por temporada ("1985/86") o rango desde/hasta, y por equipo; ordena por un campo. Devuelve como mucho "limite" filas.',
  inputSchema:{type:'object',properties:{temporada:{type:'string'},desde:{type:'string'},hasta:{type:'string'},equipo:{type:'string'},puesto:{type:'number',description:'solo filas con este puesto final (1 = campeón)'},ordenar_por:{type:'string',enum:TEAM_FIELDS},orden:{type:'string',enum:['desc','asc']},limite:{type:'number'},incluir_en_curso:{type:'boolean'}}},
  execute(inp){const sk=seasonKey(inp.temporada);const ti=teamIdx(inp.equipo);if(ti===-1)throw new Error('Equipo no encontrado. Equipos: '+T.join(', '));
   let out=[];for(const k of SKEYS){if(sk&&sk!=='all'&&k!==sk)continue;if((!sk||sk==='all')&&k===CURRENT&&!inp.incluir_en_curso)continue;if(!inRange(k,inp.desde,inp.hasta))continue;for(const r of DATA.seasons[k]){if(ti!=null&&r[0]!==ti)continue;if(inp.puesto&&r[I.pos]!==+inp.puesto)continue;out.push(teamRowObj(k,r));}}
   const f=TEAM_FIELDS.includes(inp.ordenar_por)?inp.ordenar_por:null;if(f){const d=inp.orden==='asc'?1:-1;out=out.filter(o=>o[f]!=null).sort((a,b)=>(a[f]-b[f])*d);}
   const lim=Math.min(Math.max(+inp.limite||25,1),100);return {total_filas:out.length,filas:out.slice(0,lim)};}},
 {name:'totales_por_equipo',description:'Suma por equipo en temporadas completas (por defecto 1928/29 a 2025/26; rango con desde/hasta): temporadas, títulos, mejor puesto, puntos_3 (3 por victoria en todas las épocas), partidos, goles, puntos remontados; rojas recibidas desde 1928/29 y amarillas recibidas desde 1971/72; tarjetas provocadas, faltas y tiros solo desde 2005/06 (ver temporadas_con_estadisticas).',
  inputSchema:{type:'object',properties:{desde:{type:'string'},hasta:{type:'string'},equipo:{type:'string'},ordenar_por:{type:'string',enum:['temporadas','titulos','puntos_3','ganados','goles_favor','goles_contra','rojas_recibidas','rojas_provocadas','amarillas_recibidas','amarillas_provocadas','faltas_cometidas','faltas_recibidas','puntos_remontados']},orden:{type:'string',enum:['desc','asc']},limite:{type:'number'}}},
  execute(inp){const ti=teamIdx(inp.equipo);if(ti===-1)throw new Error('Equipo no encontrado');
   let out=aggAll(seasonKey(inp.desde),seasonKey(inp.hasta),ti).map(a=>({equipo:T[a.t],temporadas:a.S,primera_temporada:lab(a.first),ultima_temporada:lab(a.last),titulos:a.Tit,mejor_puesto:a.best,pj:a.P,ganados:a.W,empatados:a.D,perdidos:a.L,puntos_3:a.Pts3,goles_favor:a.GF,goles_contra:a.GA,puntos_remontados:a.cb,temporadas_con_estadisticas:a.statS,amarillas_recibidas:a.Y,rojas_recibidas:a.R,amarillas_provocadas:a.oY,rojas_provocadas:a.oR,faltas_cometidas:a.F,faltas_recibidas:a.FA,tiros:a.Sh}));
   const f=inp.ordenar_por&&out[0]&&out[0][inp.ordenar_por]!=null?inp.ordenar_por:'puntos_3';const d=inp.orden==='asc'?1:-1;out.sort((a,b)=>(a[f]-b[f])*d);
   return {filas:out.slice(0,Math.min(+inp.limite||25,70))};}},
 {name:'jugadores_historico',description:'Para cada temporada de 1928/29 a 2013/14 (BDFútbol): los 10 máximos goleadores, los 5 jugadores con más amarillas (desde finales de los 60) y los 5 con más expulsiones, con su club. Filtra por temporada, rango desde/hasta, jugador o equipo; tipo = goles | amarillas | rojas. Útil para pichichis históricos y para sumar goles de un jugador entre temporadas (solo cuenta las temporadas en las que estuvo en el top).',
  inputSchema:{type:'object',properties:{temporada:{type:'string'},desde:{type:'string'},hasta:{type:'string'},jugador:{type:'string'},equipo:{type:'string'},tipo:{type:'string',enum:['goles','amarillas','rojas']},solo_primero:{type:'boolean',description:'solo el primero de cada temporada (p. ej. el pichichi)'},limite:{type:'number'}}},
  execute(inp){const sk=seasonKey(inp.temporada);const ti=teamIdx(inp.equipo);if(ti===-1)throw new Error('Equipo no encontrado');const q=norm(inp.jugador);const key={goles:'G',amarillas:'Y',rojas:'R'}[inp.tipo]||'G';let out=[];
   for(const k of Object.keys(PH).sort()){if(sk&&sk!=='all'&&k!==sk)continue;if(!inRange(k,inp.desde,inp.hasta))continue;let arr=PH[k][key];if(inp.solo_primero)arr=arr.filter(p=>p[2]===(arr[0]&&arr[0][2]));
     arr.forEach((p,i)=>{if(ti!=null&&p[1]!==T[ti])return;if(q&&!norm(p[0]).includes(q))return;out.push({temporada:lab(k),puesto_en_lista:i+1,jugador:p[0],equipo:p[1],[inp.tipo||'goles']:p[2]});});}
   return {total_filas:out.length,filas:out.slice(0,Math.min(+inp.limite||40,150))};}},
 {name:'jugadores',description:'Jugadores de LaLiga de 1988/89 a 2026/27 (FBref), todos los que jugaron alguna temporada pero por temporada solo se guardan los destacados en goles, asistencias, amarillas, rojas, faltas cometidas o recibidas. Campos: partidos, minutos, goles, penaltis, asistencias (desde 1999/00), amarillas, rojas, rojas por doble amarilla, faltas cometidas (desde 1999/00) y faltas recibidas (desde 2014/15). temporada="acumulado" da totales de carrera 1988-2026 de los jugadores más destacados.',
  inputSchema:{type:'object',properties:{temporada:{type:'string',description:'"2004/05", "todas" o "acumulado"'},desde:{type:'string'},hasta:{type:'string'},equipo:{type:'string'},jugador:{type:'string'},ordenar_por:{type:'string',enum:['goles','asistencias','goles_mas_asistencias','amarillas','rojas','doble_amarilla','faltas_cometidas','faltas_recibidas','partidos','minutos','penaltis']},orden:{type:'string',enum:['desc','asc']},limite:{type:'number'}}},
  execute(inp){const q=norm(inp.jugador);const ti=teamIdx(inp.equipo);if(ti===-1)throw new Error('Equipo no encontrado');let out=[];
   if(norm(inp.temporada)==='acumulado'){out=FBCAR.map(c=>({jugador:c[0],ultimo_equipo:c[1],temporadas:c[2],primera:lab(String(c[3])),ultima:lab(String(c[4])),partidos:c[5],minutos:c[6],goles:c[7],asistencias:c[8],penaltis:c[9],amarillas:c[10],rojas:c[11],faltas_cometidas:c[12],faltas_recibidas:c[13],goles_mas_asistencias:c[7]+c[8]}));if(ti!=null)out=out.filter(o=>o.ultimo_equipo===T[ti]);}
   else{const sk=seasonKey(inp.temporada);for(const k of Object.keys(FB).sort()){if(sk&&sk!=='all'&&k!==sk)continue;if(!inRange(k,inp.desde,inp.hasta))continue;for(const p of FB[k]){if(ti!=null&&p[1]!==T[ti])continue;out.push(clean({temporada:lab(k),jugador:p[0],equipo:p[1],partidos:p[2],minutos:p[3],goles:p[4],asistencias:p[5],penaltis:p[6],amarillas:p[7],rojas:p[8],doble_amarilla:p[9],faltas_cometidas:p[10],faltas_recibidas:p[11],goles_mas_asistencias:p[5]!=null?p[4]+p[5]:null}));}}}
   if(q)out=out.filter(o=>norm(o.jugador).includes(q));
   const f=inp.ordenar_por||'goles';const d=inp.orden==='asc'?1:-1;out=out.filter(o=>o[f]!=null).sort((a,b)=>(a[f]-b[f])*d);
   return {total_filas:out.length,filas:out.slice(0,Math.min(+inp.limite||20,80))};}},
 {name:'jugadores_xg',description:'Goles esperados por jugador desde 2014/15 (Understat): goles, goles sin penalti, asistencias, xG, xA, minutos, y goles_menos_xg. Solo los destacados de cada temporada.',
  inputSchema:{type:'object',properties:{temporada:{type:'string'},equipo:{type:'string'},jugador:{type:'string'},ordenar_por:{type:'string',enum:['goles','asistencias','xg','xa','goles_menos_xg']},orden:{type:'string',enum:['desc','asc']},limite:{type:'number'}}},
  execute(inp){const q=norm(inp.jugador);const ti=teamIdx(inp.equipo);if(ti===-1)throw new Error('Equipo no encontrado');let out=[];const sk=seasonKey(inp.temporada);
   for(const k of Object.keys(PD.s)){if(sk&&sk!=='all'&&k!==sk)continue;for(const p of PD.s[k]){if(ti!=null&&!inTeam(p[1],ti))continue;out.push({temporada:lab(k),jugador:p[0],equipo:p[1],partidos:p[2],minutos:p[3],goles:p[4],goles_sin_penalti:p[5],asistencias:p[6],xg:p[7],xa:p[8],goles_menos_xg:+(p[4]-p[7]).toFixed(1)});}}
   if(q)out=out.filter(o=>norm(o.jugador).includes(q));const f=inp.ordenar_por||'xg';const d=inp.orden==='asc'?1:-1;out.sort((a,b)=>(a[f]-b[f])*d);
   return {total_filas:out.length,filas:out.slice(0,Math.min(+inp.limite||20,60))};}},
 {name:'porteros',description:'Porteros y Trofeo Zamora. De 1988/89 a 2026/27 (FBref) los porteros con 15 o más partidos: partidos, minutos, goles encajados, goles por partido, porterías a cero, % de paradas y penaltis parados (estos tres desde 1999/00; antes de 1999 casi no hay goles encajados). De 1928/29 a 2013/14 (BDFútbol) los 5 porteros menos goleados de cada temporada con su coeficiente. ordenar_por coeficiente = goles encajados por partido (menor es mejor); el Zamora exige un mínimo de 28 partidos.',
  inputSchema:{type:'object',properties:{temporada:{type:'string'},desde:{type:'string'},hasta:{type:'string'},equipo:{type:'string'},portero:{type:'string'},minimo_partidos:{type:'number'},ordenar_por:{type:'string',enum:['coeficiente','porterias_a_cero','paradas_pct','goles_encajados','partidos']},orden:{type:'string',enum:['desc','asc']},solo_ganador:{type:'boolean',description:'solo el portero menos goleado de cada temporada (Zamora)'},limite:{type:'number'}}},
  execute(inp){const sk=seasonKey(inp.temporada);const ti=teamIdx(inp.equipo);if(ti===-1)throw new Error('Equipo no encontrado');const q=norm(inp.portero);const minG=+inp.minimo_partidos||0;let out=[];
   for(const k of SKEYS){if(sk&&sk!=='all'&&k!==sk)continue;if(!inRange(k,inp.desde,inp.hasta))continue;let rows=[];
     const g=GK[k];if(g&&k>='1999'){rows=g.filter(x=>x[4]!=null).map(x=>clean({temporada:lab(k),fuente:'FBref',portero:x[0],equipo:x[1],partidos:x[2],minutos:x[3],goles_encajados:x[4],coeficiente:+(x[4]/(x[3]/90)).toFixed(2),porterias_a_cero:x[5],paradas_pct:x[6],penaltis_parados:x[7]}));}
     else if(ZM[k]){rows=ZM[k].map(z=>({temporada:lab(k),fuente:'BDFútbol (top 5)',portero:z[0],equipo:z[1],coeficiente:z[2],partidos:z[3],goles_encajados:z[4]}));}
     rows=rows.filter(r=>(ti==null||r.equipo===T[ti])&&(!q||norm(r.portero).includes(q))&&r.partidos>=minG);
     if(inp.solo_ganador){const elig=rows.filter(r=>r.fuente!=='FBref'||r.partidos>=(k===CURRENT?3:28));elig.sort((a,b)=>a.coeficiente-b.coeficiente);rows=elig.slice(0,1);}
     out.push(...rows);}
   const f=inp.ordenar_por||'coeficiente';const d=inp.orden?(inp.orden==='asc'?1:-1):(f==='coeficiente'||f==='goles_encajados'?1:-1);out=out.filter(o=>o[f]!=null).sort((a,b)=>(a[f]-b[f])*d);
   return {total_filas:out.length,filas:out.slice(0,Math.min(+inp.limite||30,100))};}},
 {name:'resumen_liga',description:'Una fila por temporada (1928/29-2026/27, sin 1936-39): equipos, partidos, campeón, subcampeón, puntos del campeón, últimos clasificados, goles por partido; rojas por partido (desde 1928) y amarillas por partido (desde 1971); máximo goleador y portero menos goleado (Zamora) de cada temporada. Filtra con desde/hasta.',
  inputSchema:{type:'object',properties:{desde:{type:'string'},hasta:{type:'string'}}},
  execute(inp){return SKEYS.filter(k=>inRange(k,inp.desde,inp.hasta)).map(k=>{const rows=DATA.seasons[k];const pj=rows.reduce((a,r)=>a+r[I.P],0)/2;const s=f=>rows.reduce((a,r)=>a+(r[f]||0),0);let top=null;if(FB[k]){const f=FB[k].slice().sort((a,b)=>b[F.g]-a[F.g])[0];top=[f[0],f[1],0,0,f[F.g]];}else if(PH[k]&&PH[k].G[0]){const g=PH[k].G[0];top=[g[0],g[1],0,0,g[2]];}const zz=zamora(k);const zw=zz&&zz.rows.filter(r=>k===CURRENT||r[3]>=28||zz.src!=='FBref')[0];const hs=hasR(k);
   return clean({temporada:lab(k),en_curso:k===CURRENT||null,equipos:rows.length,partidos:pj,campeon_o_lider:T[rows[0][0]],puntos_campeon:rows[0][I.Pts],puntos_por_victoria:winPts(k),subcampeon:T[rows[1][0]],ultimos_tres:k===CURRENT?null:rows.slice(-3).map(r=>T[r[0]]),goles_por_partido:+(s(I.GF)/pj).toFixed(2),amarillas_por_partido:hasY(k)?+(s(I.Y)/pj).toFixed(2):null,rojas_por_partido:hs?+(s(I.R)/pj).toFixed(2):null,maximo_goleador:top?`${top[0]} (${top[1]}) ${top[P.G]}`:null,zamora:zw?`${zw[0]} (${zw[1]}) ${zw[2]} goles/partido`:null});});}},
 {name:'enfrentamientos',description:'Historial de partidos de Liga entre dos equipos (1928/29-2026/27, todos los partidos): balance de victorias, empates y goles, desglose en casa de cada uno y lista de partidos (fecha, local, resultado). Filtra por rango de temporadas desde/hasta.',
  inputSchema:{type:'object',properties:{equipo_a:{type:'string'},equipo_b:{type:'string'},desde:{type:'string'},hasta:{type:'string'},limite_partidos:{type:'number',description:'cuántos partidos listar (los más recientes); por defecto 20'}},required:['equipo_a','equipo_b']},
  execute(inp){const a=teamIdx(inp.equipo_a),b=teamIdx(inp.equipo_b);if(a==null||a<0||b==null||b<0)throw new Error('Equipo no encontrado. Equipos: '+T.join(', '));
   const ms=teamMatches(a).filter(m=>(m.h===b||m.a===b)&&inRange(m.k,inp.desde,inp.hasta));const wa=ms.filter(m=>resOf(m,a)==='W').length,wb=ms.filter(m=>resOf(m,b)==='W').length;
   const ga=ms.reduce((s,m)=>s+(m.h===a?m.hg:m.ag),0),gb=ms.reduce((s,m)=>s+(m.h===b?m.hg:m.ag),0);const lim=Math.min(+inp.limite_partidos||20,200);
   return {equipo_a:T[a],equipo_b:T[b],partidos:ms.length,victorias_a:wa,empates:ms.length-wa-wb,victorias_b:wb,goles_a:ga,goles_b:gb,
    en_casa_de_a:(()=>{const x=ms.filter(m=>m.h===a);return {pj:x.length,ganados_a:x.filter(m=>m.hg>m.ag).length,empates:x.filter(m=>m.hg===m.ag).length,ganados_b:x.filter(m=>m.hg<m.ag).length};})(),
    en_casa_de_b:(()=>{const x=ms.filter(m=>m.h===b);return {pj:x.length,ganados_b:x.filter(m=>m.hg>m.ag).length,empates:x.filter(m=>m.hg===m.ag).length,ganados_a:x.filter(m=>m.hg<m.ag).length};})(),
    partidos_lista:ms.slice(-lim).reverse().map(m=>({temporada:lab(m.k),fecha:fdate(m),local:T[m.h],visitante:T[m.a],resultado:m.hg+'-'+m.ag}))};}},
 {name:'partidos',description:'Partidos de Liga de 1928/29 a 2026/27 (resultado y fecha). Filtra por temporada o rango, por equipo (y opcionalmente rival), por resultado (victoria/empate/derrota del equipo) y ordena por fecha, goles totales o diferencia. Útil para goleadas, rachas, resultados de una jornada o de un equipo en una temporada.',
  inputSchema:{type:'object',properties:{temporada:{type:'string'},desde:{type:'string'},hasta:{type:'string'},equipo:{type:'string'},rival:{type:'string'},resultado:{type:'string',enum:['victoria','empate','derrota']},como:{type:'string',enum:['local','visitante']},ordenar_por:{type:'string',enum:['fecha','goles_totales','diferencia']},orden:{type:'string',enum:['desc','asc']},limite:{type:'number'}}},
  execute(inp){const sk=seasonKey(inp.temporada),t=teamIdx(inp.equipo),o=teamIdx(inp.rival);if(t===-1||o===-1)throw new Error('Equipo no encontrado');
   let ms=(t!=null?teamMatches(t):allMatches()).filter(m=>(!sk||sk==='all'||m.k===sk)&&inRange(m.k,inp.desde,inp.hasta));
   if(o!=null)ms=ms.filter(m=>m.h===o||m.a===o);
   if(t!=null&&inp.como)ms=ms.filter(m=>inp.como==='local'?m.h===t:m.a===t);
   if(t!=null&&inp.resultado){const r={victoria:'W',empate:'D',derrota:'L'}[inp.resultado];ms=ms.filter(m=>resOf(m,t)===r);}
   const f=inp.ordenar_por||'fecha',d=inp.orden==='asc'?1:-1,key=m=>f==='goles_totales'?m.hg+m.ag:f==='diferencia'?Math.abs(m.hg-m.ag):m.ts;
   const total=ms.length;ms=ms.slice().sort((a,b)=>(key(a)-key(b))*d||(b.ts-a.ts));
   return {total_partidos:total,partidos:ms.slice(0,Math.min(+inp.limite||30,150)).map(m=>({temporada:lab(m.k),fecha:fdate(m),local:T[m.h],visitante:T[m.a],resultado:m.hg+'-'+m.ag}))};}},
 {name:'mayores_goleadas',description:'Las 25 mayores goleadas de la historia de LaLiga (1928/29-2024/25) por diferencia de goles.',
  execute(){return DATA.big.map(b=>({temporada:lab(b[0]),fecha:b[1],local:T[b[2]],visitante:T[b[3]],resultado:`${b[4]}-${b[5]}`}));}},
];
function rules(){return `Eres el motor de respuestas de "LaLiga en datos", un panel de estadísticas de la Primera División española. Responde SIEMPRE en español, de forma clara y breve.
Datos disponibles (consúltalos con las herramientas; no inventes cifras):
- Equipos: 95 temporadas, de 1928/29 a 2025/26 completas (no hubo liga de 1936 a 1939) y 2026/27 en curso (resultados hasta el ${UPD}; jugadores hasta el ${PUPD}). Clasificación, puntos, goles, local/visitante y resultados al descanso de todas las épocas.
- Hasta 1994/95 la victoria valía 2 puntos. Para comparar épocas usa puntos_3 (recalculado a 3 por victoria) y dilo.
- Tarjetas recibidas por equipo: rojas desde 1928/29 y amarillas desde 1971/72 (BDFútbol hasta 2004/05; football-data después, que cuenta algo menos de amarillas porque no suma la segunda amarilla). Tarjetas provocadas a los rivales (las que vieron los rivales en sus partidos), tiros, faltas y córners: solo desde 2005/06. xG desde 2014/15.
- Jugadores 1988/89-2026/27 (jugadores, FBref): goles, asistencias y faltas (desde 1999/00), amarillas, rojas, doble amarilla, faltas recibidas (desde 2014/15) y totales de carrera. Jugadores 1928/29-1987/88: los 10 máximos goleadores y los 5 más amonestados y expulsados de cada temporada (jugadores_historico). xG desde 2014/15 (jugadores_xg). Porteros y Trofeo Zamora en todas las épocas (porteros).
Reglas: consulta antes de dar cifras. Si piden algo que no está en los datos, dilo y ofrece lo más parecido que sí haya. Da los números al comparar. Usa tablas Markdown para listas de 4 o más elementos; si no, frases o viñetas cortas. No menciones las herramientas ni el JSON.
- Partidos: todos los partidos de Liga desde 1928/29 con fecha y resultado (enfrentamientos, partidos): sirven para cara a cara, rachas, goleadas y resultados concretos.
Contexto del panel: temporada seleccionada ${lab(st.season)}, equipo seleccionado ${T[st.team]}.`;}
function compactDump(){
  const lines=['temporada;equipo;puesto;pts;pts3;gf;gc;am_rec;rojas_rec;am_prov;rojas_prov;faltas_com;faltas_rec'];
  for(const k of SKEYS)for(const r of DATA.seasons[k])lines.push([lab(k),T[r[0]],r[I.pos],r[I.Pts],pts3(r),r[I.GF],r[I.GA],r[I.Y]??'',r[I.R]??'',r[I.oY]??'',r[I.oR]??'',r[I.F]??'',r[I.FA]??''].join(';'));
  lines.push('','temporada;jugador;equipo;pj;goles;asist;xg;amarillas;rojas');
  for(const [k,rows] of Object.entries(PD.s))for(const p of rows)lines.push([lab(k),p[0],p[1],p[2],p[4],p[6],p[7],p[9],p[10]].join(';'));
  return lines.join('\n');
}
function md(s){
  const e=x=>esc(x).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
  const blocks=String(s).trim().split(/\n{2,}/);let h='';
  for(const b of blocks){const L=b.split('\n');
    const ti=L.findIndex((l,i)=>/^\s*\|/.test(l)&&L[i+1]&&/^\s*\|?\s*:?-{2,}/.test(L[i+1]));
    if(ti>=0){if(ti>0)h+='<p>'+L.slice(0,ti).map(e).join('<br>')+'</p>';const cells=l=>l.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim());
      h+='<div class="tscroll"><table><thead><tr>'+cells(L[ti]).map((c,i)=>`<th class="${i===0?'l':''}">${e(c)}</th>`).join('')+'</tr></thead><tbody>'+L.slice(ti+2).filter(l=>/^\s*\|/.test(l)).map(l=>'<tr>'+cells(l).map((c,i)=>`<td class="${i===0?'l':''}">${e(c)}</td>`).join('')+'</tr>').join('')+'</tbody></table></div>';}
    else if(L.every(l=>/^\s*([-*•]|\d+\.)\s+/.test(l)))h+='<ul>'+L.map(l=>`<li>${e(l.replace(/^\s*([-*•]|\d+\.)\s+/,''))}</li>`).join('')+'</ul>';
    else if(/^#{1,4}\s/.test(L[0]))h+='<p><b>'+e(L[0].replace(/^#+\s*/,''))+'</b>'+(L.length>1?'<br>'+L.slice(1).map(e).join('<br>'):'')+'</p>';
    else h+='<p>'+L.map(e).join('<br>')+'</p>';}
  return h;
}

// ---------- Chat: storage (private per viewer in db; local fallback) ----------
const EXAMPLES=['¿Cómo va el historial del Clásico en Liga?','¿Qué campeón sacó más ventaja al segundo en toda la historia?','¿Quiénes han sido máximos goleadores más veces?','¿Qué porteros han ganado más veces el Zamora?','¿Cuál es la mayor goleada del Betis en el derbi sevillano?','¿Qué equipo ha ganado más ligas por décadas?','¿Quién ha dado más asistencias desde el año 2000?','¿En qué década se marcaban más goles por partido?','¿Qué equipo provocó más rojas a sus rivales desde 2005?'];
const Store={mode:'memory',mem:{},db:null,uid:null,
  async init(){
    try{const db=window.claude?await window.claude.use('db'):null;const user=window.claude?await window.claude.use('user'):null;const uid=user?await user.id():null;
      if(db&&uid){this.db=db;this.uid=uid;this.mode='db';return;}}catch(e){}
    try{localStorage.setItem('liga-chat-probe','1');localStorage.removeItem('liga-chat-probe');this.mode='local';}catch(e){this.mode='memory';}
  },
  col(){return this.db.collection('data/users/'+this.uid);},
  async list(){
    if(this.mode==='db'){const snap=await this.col().orderBy('updated','desc').limit(60).get();return snap.docs.filter(d=>d.id.startsWith('chat-')).map(d=>({id:d.id,...d.data()}));}
    const all=this.mode==='local'?JSON.parse(localStorage.getItem('liga-chats')||'{}'):this.mem;
    return Object.values(all).sort((a,b)=>b.updated-a.updated);
  },
  async save(c){
    const body={title:c.title,created:c.created,updated:c.updated,turns:c.turns.slice(-40)};
    if(this.mode==='db'){await this.col().doc(c.id).set(body);return;}
    if(this.mode==='local'){const all=JSON.parse(localStorage.getItem('liga-chats')||'{}');all[c.id]={id:c.id,...body};localStorage.setItem('liga-chats',JSON.stringify(all));return;}
    this.mem[c.id]={id:c.id,...body};
  },
  async del(id){
    if(this.mode==='db'){await this.col().doc(id).delete();return;}
    if(this.mode==='local'){const all=JSON.parse(localStorage.getItem('liga-chats')||'{}');delete all[id];localStorage.setItem('liga-chats',JSON.stringify(all));return;}
    delete this.mem[id];
  }
};

(async()=>{
  const thread=document.getElementById('thread'),form=document.getElementById('askForm'),inp=document.getElementById('askInput'),btn=document.getElementById('askBtn'),stop=document.getElementById('stopBtn'),convsEl=document.getElementById('convs'),newBtn=document.getElementById('newChat'),title=document.getElementById('chatTitle'),storeNote=document.getElementById('storeNote');
  let chats=[], current=null, ctl=null, busy=false, blocked=false, sample=null, canTools=false, armed=null;
  const dfmt=ts=>{const d=new Date(ts);return d.toLocaleDateString('es-ES',{day:'numeric',month:'short'})+' · '+d.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});};
  function welcome(){thread.innerHTML=`<div class="welcome"><p>Pregunta en lenguaje normal sobre cualquier temporada desde 1928/29: clasificaciones, títulos, partidos y cara a cara, goleadores, Zamoras, asistencias (desde 1999/00), xG (desde 2014/15) o tarjetas. Puedes repreguntar sobre la respuesta anterior.</p><div class="chips">${EXAMPLES.map(q=>`<button type="button" class="chip">${esc(q)}</button>`).join('')}</div></div>`;
    thread.querySelectorAll('.chip').forEach(b=>{b.disabled=!sample||blocked;b.onclick=()=>{inp.value=b.textContent;form.requestSubmit();};});}
  function renderList(){
    convsEl.innerHTML=chats.length?chats.map(c=>`<li class="conv ${current&&c.id===current.id?'on':''}" data-id="${esc(c.id)}"><button type="button" class="open"><span class="ct">${esc(c.title)}</span><span class="cd">${dfmt(c.updated)}</span></button><button type="button" class="del ${armed===c.id?'arm':''}" aria-label="Borrar conversación">${armed===c.id?'¿Borrar?':'Borrar'}</button></li>`).join(''):'<li class="note" style="padding:8px 4px">Aún no hay conversaciones guardadas.</li>';
    convsEl.querySelectorAll('.conv').forEach(li=>{const id=li.dataset.id;
      li.querySelector('.open').onclick=()=>{armed=null;openChat(chats.find(c=>c.id===id));};
      li.querySelector('.del').onclick=async()=>{if(armed!==id){armed=id;renderList();return;}armed=null;try{await Store.del(id);}catch(e){}chats=chats.filter(c=>c.id!==id);if(current&&current.id===id)openChat(null);else renderList();};});
  }
  function renderThread(){
    if(!current||!current.turns.length){welcome();return;}
    thread.innerHTML='';current.turns.forEach(t=>addMsg(t.role==='user'?'q':'a',t.content));thread.scrollTop=thread.scrollHeight;
  }
  function addMsg(kind,content){const el=document.createElement('div');el.className='msg '+kind;el.innerHTML=`<span class="who">${kind==='q'?'Tú':'LaLiga en datos'}</span><div class="body"></div>`;const body=el.querySelector('.body');if(kind==='q')body.textContent=content;else body.innerHTML=content==null?'<span class="status">Pensando…</span>':md(content);thread.append(el);return body;}
  function openChat(c){if(busy&&ctl)ctl.abort();current=c;title.textContent=c?c.title:'Nueva conversación';renderList();renderThread();inp.focus({preventScroll:true});}
  newBtn.onclick=()=>{armed=null;openChat(null);};
  inp.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form.requestSubmit();}});
  stop.onclick=()=>ctl&&ctl.abort();

  welcome();
  await Store.init();
  storeNote.textContent=Store.mode==='db'?'Tus conversaciones se guardan en tu cuenta y solo las ves tú.':Store.mode==='local'?'Tus conversaciones se guardan en este navegador.':'Las conversaciones no se guardarán al cerrar la página.';
  try{chats=await Store.list();}catch(e){chats=[];}
  renderList();
  try{sample=window.claude?await window.claude.use('sample'):null;}catch(e){sample=null;}
  if(!sample){btn.disabled=true;storeNote.textContent='El chat solo funciona al abrir el panel desde Claude. El resto del panel funciona igual.';welcome();return;}
  try{const lim=await sample.limits();canTools=!!lim.tools;}catch(e){}
  welcome();
  const COPY={not_granted:'No se ha dado permiso para usar Claude en este panel.',sampling_disabled:'Claude no está disponible para esta cuenta.',rate_limited:'Demasiadas preguntas seguidas. Espera un poco y vuelve a intentarlo.',session_expired:'Tu sesión ha caducado. Vuelve a iniciar sesión.',refused:'No he podido responder a esa pregunta. Prueba a formularla de otra manera.',empty_completion:'No ha salido respuesta. Prueba con una pregunta más concreta.',prompt_too_large:'La conversación es demasiado larga. Empieza una nueva.'};

  form.addEventListener('submit',async e=>{e.preventDefault();const q=inp.value.trim();if(!q||busy||blocked)return;
    busy=true;btn.disabled=true;stop.hidden=false;inp.value='';
    if(!current){const now=Date.now();current={id:'chat-'+now.toString(36)+Math.random().toString(36).slice(2,6),title:q.length>60?q.slice(0,57)+'…':q,created:now,updated:now,turns:[]};chats.unshift(current);title.textContent=current.title;thread.innerHTML='';}
    const chat=current;
    addMsg('q',q);const body=addMsg('a',null);thread.scrollTop=thread.scrollHeight;
    chat.turns.push({role:'user',content:q});
    const input=[{role:'user',content:rules()+(canTools?'':'\n\nDATOS (CSV separado por ;):\n'+compactDump())},...chat.turns.slice(-10)];
    ctl=new AbortController();
    const tools=canTools?TOOLS.map(t=>({...t,execute:(x,c)=>{const s=body.querySelector('.status');if(s)s.textContent='Consultando los datos…';return t.execute(x||{},c);}})):null;
    const live=()=>current===chat;
    try{
      const opts={signal:ctl.signal,onText:({text})=>{if(live()){body.innerHTML=md(text);}}};
      if(tools)opts.tools=tools;else opts.cache=false;
      const {text,truncated}=await sample(input,opts);
      if(live())body.innerHTML=md(text)+(truncated?'<p class="status">La respuesta se ha cortado. Pide algo más concreto.</p>':'');
      chat.turns.push({role:'assistant',content:text});chat.updated=Date.now();
      chats=[chat,...chats.filter(c=>c.id!==chat.id)];
      try{await Store.save(chat);}catch(err){storeNote.textContent='No se ha podido guardar esta conversación.';}
    }catch(err){
      chat.turns.pop();
      if(!chat.turns.length){chats=chats.filter(c=>c.id!==chat.id);if(live())current=null;}
      if(live()){
        if(err&&err.code==='cancelled')body.innerHTML=(err.text?md(err.text):'')+'<p class="status">Detenido.</p>';
        else body.innerHTML=(err&&err.text&&err.code!=='refused'?md(err.text):'')+`<p class="status">${esc(COPY[err&&err.code]||'Algo ha fallado al consultar. Vuelve a intentarlo.')}</p>`;}
      if(err&&(err.code==='not_granted'||err.code==='sampling_disabled'))blocked=true;
    }finally{busy=false;stop.hidden=true;btn.disabled=blocked;ctl=null;renderList();if(live())thread.scrollTop=thread.scrollHeight;}
  });
})();
