"""Construye el panel a partir de src/ y data/.

Genera en dist/:
  index.html              web completa y autónoma (sin chat), lista para GitHub Pages o Netlify
  artefacto_sin_chat.html contenido para publicar como artefacto de Claude (sin chat)
  artefacto_con_chat.html contenido para publicar como artefacto de Claude (con chat de consultas)

Uso: python3 scripts/build.py
"""
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
JS = ['1_nucleo.js', '2_temporada.js', '3_equipos_h2h.js', '4_jugadores_historia.js',
      '5_disciplina.js', '6_chat.js', '7_inicio.js']


def leer(p):
    return (RAIZ / p).read_text(encoding='utf-8')


def main():
    src = leer('src/plantilla.html') + ''.join(leer('src/js/' + f) for f in JS)
    datos = {'/*DATA*/null': leer('data/liga.json'),
             '/*PDATA*/null': leer('data/jugadores.json'),
             '/*MDATA*/null': leer('data/partidos.json')}
    for marca, contenido in datos.items():
        assert '</script' not in contenido.lower(), 'Los datos no pueden contener </script'
        assert marca in src, f'Falta el marcador {marca}'
        src = src.replace(marca, contenido, 1)

    con_chat = src.replace('<title>LaLiga en datos</title>', '<title>LaLiga en datos (con chat)</title>', 1)

    sin_chat = src.replace('type="button" id="tabChat">', 'type="button" id="tabChat" hidden>', 1)
    a = sin_chat.index('// ---------- Chat: storage')
    b = sin_chat.index('// ---------- Navegación, barra y render')
    sin_chat = sin_chat[:a] + 'window.__PUBLIC=true;\n' + sin_chat[b:]
    sin_chat_art = sin_chat.replace('<title>LaLiga en datos</title>', '<title>LaLiga en datos (sin chat)</title>', 1)

    web = ('<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n'
           '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
           '<meta name="description" content="Estadísticas de la Primera División desde 1928: temporadas, equipos, cara a cara, jugadores, historia y disciplina.">\n'
           '</head>\n<body>\n' + sin_chat + '\n</body>\n</html>\n')

    out = RAIZ / 'dist'
    out.mkdir(exist_ok=True)
    (out / 'index.html').write_text(web, encoding='utf-8')
    (out / 'artefacto_sin_chat.html').write_text(sin_chat_art, encoding='utf-8')
    (out / 'artefacto_con_chat.html').write_text(con_chat, encoding='utf-8')
    for f in ('index.html', 'artefacto_sin_chat.html', 'artefacto_con_chat.html'):
        print(f'dist/{f}: {(out / f).stat().st_size // 1024} KB')


if __name__ == '__main__':
    main()
