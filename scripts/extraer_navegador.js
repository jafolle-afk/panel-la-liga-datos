// Ejecutar en https://www.football-data.co.uk/spainm.php (navegador integrado).
// Descarga SP1.csv de la temporada en curso y deja en la página el texto para copiar.
const now=new Date();const y=now.getFullYear()%100,mo=now.getMonth()+1;
const codes=mo>=7?[String(y).padStart(2,'0')+String(y+1).padStart(2,'0'),String(y-1).padStart(2,'0')+String(y).padStart(2,'0')]:[String(y-1).padStart(2,'0')+String(y).padStart(2,'0')];
let S=null,rows=null;
for(const c of codes){const r=await fetch('/mmz4281/'+c+'/SP1.csv',{cache:'no-store'});if(!r.ok)continue;const t=await r.text();const L=t.trim().split(/\r?\n/);const h=L[0].split(',');
  const C=['Date','HomeTeam','AwayTeam','FTHG','FTAG','HTHG','HTAG','HS','AS','HST','AST','HF','AF','HC','AC','HY','AY','HR','AR'];const ix=C.map(x=>h.indexOf(x));
  const rr=L.slice(1).map(l=>l.split(',')).filter(x=>x[ix[3]]!==''&&x[ix[3]]!=null).map(x=>ix.map((i,j)=>j===0?x[i].replace(/\/20(\d\d)$/,'/$1'):(i<0?'':x[i])).join(','));
  if(rr.length){S=c;rows=rr;break;}}
const str='S:'+S+'\n'+rows.join('\n');let hh=0;for(const ch of str)hh=(hh*31+ch.charCodeAt(0))>>>0;
document.body.innerHTML='<pre id=x></pre>';document.getElementById('x').textContent=str;[S,rows.length,str.length,hh]
