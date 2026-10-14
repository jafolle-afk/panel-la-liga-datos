// Comprueba que el panel carga y que todas las pestañas se pintan sin errores de JavaScript.
// Requiere Playwright:  npm install   y   npx playwright install chromium
// Uso: node scripts/check.js [dist/index.html]
const {chromium}=require('playwright');const path=require('path');
(async()=>{const file=process.argv[2]||'dist/index.html';const b=await chromium.launch();const p=await b.newPage();const e=[];
p.on('pageerror',x=>e.push(x.message));
await p.goto('file://'+path.resolve(file));await p.waitForTimeout(500);
for(const t of ['temporada','equipos','h2h','jugadores','historia','disciplina']){await p.click(`.tab[data-tab="${t}"]`);await p.waitForTimeout(150);}
for(const s of ['1950','1986','2004','2026']){await p.click('.tab[data-tab="temporada"]');await p.selectOption('#selSeason',s);await p.waitForTimeout(80);}
console.log(e.length?'ERRORES:\n'+e.join('\n'):'OK: '+file+' carga sin errores');await b.close();process.exit(e.length?1:0);})();
