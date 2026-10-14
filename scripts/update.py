"""Actualiza la temporada en curso con los resultados de football-data.co.uk.

Uso normal (desde tu Mac, con internet):
    python3 scripts/update.py --descargar
Alternativa (si la descarga directa falla): ejecuta scripts/extraer_navegador.js en
https://www.football-data.co.uk/spainm.php, copia el texto a un archivo y:
    python3 scripts/update.py archivo.txt CHECKSUM

Recalcula la clasificación, la evolución por jornadas, tiros, faltas, córners y tarjetas
de la temporada en curso y la guarda en data/liga.json y data/partidos.json.
Sale con código 3 si no hay partidos nuevos.
"""
import json,sys,datetime,urllib.request
from pathlib import Path
RAIZ=Path(__file__).resolve().parent.parent
COLS=['Date','HomeTeam','AwayTeam','FTHG','FTAG','HTHG','HTAG','HS','AS','HST','AST','HF','AF','HC','AC','HY','AY','HR','AR']
def descargar():
  hoy=datetime.date.today();y=hoy.year%100
  codes=[f'{y:02d}{y+1:02d}',f'{y-1:02d}{y:02d}'] if hoy.month>=7 else [f'{y-1:02d}{y:02d}']
  for c in codes:
    try:
      req=urllib.request.Request(f'https://www.football-data.co.uk/mmz4281/{c}/SP1.csv',headers={'User-Agent':'Mozilla/5.0'})
      t=urllib.request.urlopen(req,timeout=30).read().decode('utf-8-sig',errors='replace')
    except Exception as e:
      print('No se pudo descargar',c,e);continue
    L=t.strip().splitlines();h=L[0].split(',');ix=[h.index(x) if x in h else -1 for x in COLS];rows=[]
    for l in L[1:]:
      x=l.split(',')
      if len(x)<=ix[3] or x[ix[3]]=='':continue
      d=x[ix[0]];p=d.split('/')
      if len(p[2])==4:d=f'{p[0]}/{p[1]}/{p[2][2:]}'
      rows.append(','.join([d]+[(x[i] if i>=0 else '') for i in ix[1:]]))
    if rows:return 'S:'+c+'\n'+'\n'.join(rows)
  sys.exit('No se encontró la temporada en curso en football-data.co.uk')
if len(sys.argv)>1 and sys.argv[1]=='--descargar':
  s=descargar()
else:
  if len(sys.argv)<3:sys.exit(__doc__)
  src,chk=sys.argv[1],int(sys.argv[2])
  s=open(src,encoding='utf-8').read().rstrip('\n');h=0
  for c in s:h=(h*31+ord(c))&0xffffffff
  if h!=chk: sys.exit(f'CHECKSUM MAL: {h} != {chk}. Vuelve a copiar el texto.')
dd=RAIZ/'data'
L=s.split('\n');assert L[0].startswith('S:');code=L[0][2:];year=str(2000+int(code[:2]))
D=json.load(open(dd/'liga.json',encoding='utf-8'));M=json.load(open(dd/'partidos.json',encoding='utf-8'));T=D['teams']
FD={'Vallecano':'Rayo Vallecano','Oviedo':'Real Oviedo','Alaves':'Alavés','Sociedad':'Real Sociedad','Celta':'Celta de Vigo','Ath Bilbao':'Athletic Club','Espanol':'Espanyol','Ath Madrid':'Atlético de Madrid','Betis':'Real Betis','Santander':'Racing de Santander','La Coruna':'Deportivo','Malaga':'Málaga','Cadiz':'Cádiz','Leganes':'Leganés','Almeria':'Almería','Sp Gijon':'Sporting de Gijón','Cordoba':'Córdoba','Castellon':'Castellón','Gimnastic':'Gimnàstic','Merida':'Mérida','Logrones':'Logroñés','Hercules':'Hércules','Murcia':'Real Murcia','Xerez':'Xerez','Recreativo':'Recreativo','Numancia':'Numancia','Tenerife':'Tenerife','Las Palmas':'Las Palmas','Granada':'Granada','Eibar':'Eibar','Huesca':'Huesca','Valladolid':'Valladolid','Zaragoza':'Zaragoza','Albacete':'Albacete','Lleida':'Lleida','Salamanca':'Salamanca','Extremadura':'Extremadura','Compostela':'Compostela','Burgos':'Burgos CF','Mirandes':'Mirandés','Andorra':'Andorra','Ceuta':'Ceuta','Cultural Leonesa':'Cultural Leonesa','Real Sociedad':'Real Sociedad'}
def tid(n):
  name=FD.get(n,n)
  if name not in T:
    if len(T)>=64: sys.exit('No caben más equipos en la codificación (máx. 64). Hay que ampliar el formato.')
    T.append(name);print('EQUIPO NUEVO EN PRIMERA:',name)
  return T.index(name)
ms=[]
for l in L[1:]:
  c=l.split(',');d,mo,y=c[0].split('/');dt=datetime.date(2000+int(y),int(mo),int(d))
  n=[int(x) if x!='' else None for x in c[3:]]
  ms.append(dict(dt=dt,h=tid(c[1]),a=tid(c[2]),hg=n[0],ag=n[1],hth=n[2],hta=n[3],st=n[4:]))
ms.sort(key=lambda m:m['dt'])
w=3;teams=sorted({m['h'] for m in ms}|{m['a'] for m in ms});per=max(len(teams)//2,1)
K=['P','W','D','L','GF','GA','Pts','hW','hD','hL','hGF','hGA','aW','aD','aL','aGF','aGA','S','SA','ST','STA','F','FA','C','CA','Y','R','oY','oR','cb','bl']
X={t:dict({k:0 for k in K},pos=[],ht=0) for t in teams}
for i,m in enumerate(ms):
  HS,AS,HST,AST,HF,AF,HC,AC,HY,AY,HR,AR=[v or 0 for v in m['st']]
  for t,gf,ga,htf,hta,pre,sh,sha,sot,sota,f,fa,co,coa,y,r,oy,orr in ((m['h'],m['hg'],m['ag'],m['hth'],m['hta'],'h',HS,AS,HST,AST,HF,AF,HC,AC,HY,HR,AY,AR),(m['a'],m['ag'],m['hg'],m['hta'],m['hth'],'a',AS,HS,AST,HST,AF,HF,AC,HC,AY,AR,HY,HR)):
    x=X[t];x['P']+=1;x['GF']+=gf;x['GA']+=ga;res='W' if gf>ga else 'L' if gf<ga else 'D';x[res]+=1;x[pre+res]+=1;x[pre+'GF']+=gf;x[pre+'GA']+=ga
    p=w if res=='W' else 1 if res=='D' else 0;x['Pts']+=p
    for k,v in (('S',sh),('SA',sha),('ST',sot),('STA',sota),('F',f),('FA',fa),('C',co),('CA',coa),('Y',y),('R',r),('oY',oy),('oR',orr)):x[k]+=v
    if htf is not None:
      x['ht']+=1
      if htf<hta:x['cb']+=p
      if htf>hta:x['bl']+=w-p
  if (i+1)%per==0:
    arr=sorted(teams,key=lambda t:(-X[t]['Pts'],-(X[t]['GF']-X[t]['GA']),-X[t]['GF']))
    for k,t in enumerate(arr):X[t]['pos'].append(k+1)
def h2h(grp):
  s=set(grp);st={t:[0,0] for t in s}
  for m in ms:
    if m['h'] in s and m['a'] in s:
      hg,ag=m['hg'],m['ag'];st[m['h']][1]+=hg-ag;st[m['a']][1]+=ag-hg
      if hg>ag:st[m['h']][0]+=w
      elif ag>hg:st[m['a']][0]+=w
      else:st[m['h']][0]+=1;st[m['a']][0]+=1
  return sorted(grp,key=lambda t:(-st[t][0],-st[t][1],-(X[t]['GF']-X[t]['GA']),-X[t]['GF']))
arr=sorted(teams,key=lambda t:-X[t]['Pts']);fin=[];i=0
while i<len(arr):
  j=i
  while j<len(arr) and X[arr[j]]['Pts']==X[arr[i]]['Pts']:j+=1
  fin+=h2h(arr[i:j]) if j-i>1 else [arr[i]];i=j
rows=[]
for k,t in enumerate(fin):
  x=X[t];rows.append([t,k+1]+[x[c] for c in K[:29]]+[x['cb'] if x['ht'] else None,x['bl'] if x['ht'] else None,''.join(chr(96+p) for p in x['pos'])])
A='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';base=datetime.date(int(year),7,1);enc=''
for m in ms:
  d=(m['dt']-base).days;enc+=A[d//64]+A[d%64]+A[m['h']]+A[m['a']]+A[m['hg']]+A[m['ag']]
if M.get(year)==enc:
  print(f'SIN CAMBIOS: {len(ms)} partidos, igual que la última vez.');sys.exit(3)
if True:
  D['seasons'][year]=rows;D['updated']=ms[-1]['dt'].strftime('%d/%m/%Y');D['current']=year;M[year]=enc
  D['seasons']=dict(sorted(D['seasons'].items()))
  json.dump(D,open(dd/'liga.json','w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'));json.dump(M,open(dd/'partidos.json','w'),separators=(',',':'))
print(f'OK temporada {year}: {len(ms)} partidos, hasta {ms[-1]["dt"]:%d/%m/%Y}. Líder: {T[fin[0]]} ({X[fin[0]]["Pts"]} pts)')
