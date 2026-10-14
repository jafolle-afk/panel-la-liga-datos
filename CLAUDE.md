# LaLiga en datos — guía para Claude Code

Panel web de estadísticas de la Primera División española desde 1928/29: temporadas, equipos, cara a cara, jugadores, historia y disciplina. El usuario (Juani) no es programador: explica los cambios en español, con frases claras, y enséñale el resultado.

## Cómo está hecho

- **Sin frameworks ni dependencias de ejecución.** HTML + CSS + JavaScript plano. `scripts/build.py` une la plantilla, el código y los datos en **un solo HTML autónomo** por versión.
- `src/plantilla.html`: `<title>`, todo el CSS (tokens en `:root`, tema claro y oscuro) y el marcado de las pestañas.
- `src/js/`: el código, en orden de carga:
  - `1_nucleo.js`: datos, utilidades, colores de clubes (`CLUB`), escudos de colores (`crest`), decodificación de partidos, gráfico de trayectorias (`posChart`).
  - `2_temporada.js`: pestaña Temporada (premios, claves, carrera por el título, tabla, cuadro de resultados) y el Trofeo Zarra (`ZARRA`, lista manual).
  - `3_equipos_h2h.js`: Equipos y Cara a cara.
  - `4_jugadores_historia.js`: Jugadores (buscador, palmarés) e Historia (mapa de épocas, récords).
  - `5_disciplina.js`: tarjetas y faltas.
  - `6_chat.js`: herramientas y chat de consultas (solo funciona publicado como artefacto de Claude).
  - `7_inicio.js`: barra de filtros, navegación por pestañas y arranque.
- `data/`:
  - `liga.json`: `teams` (lista de clubes) y `seasons` (clave = año de inicio, `'2025'` = 2025/26). Cada fila sigue el índice `I` de `1_nucleo.js`: `[equipo, puesto, PJ, G, E, P, GF, GC, Pts, …, tarjetas, posStr]`. `win` = temporadas con victoria a 2 puntos. `current` y `updated` = temporada en curso y fecha de los últimos datos.
  - `partidos.json`: los 27.000+ partidos, 6 caracteres por partido en base64 (día desde el 1 de julio, local, visitante, goles local, goles visitante).
  - `jugadores.json`: jugadores destacados por temporada (FBref desde 1988/89, BDFútbol antes), porteros y Zamora, xG de Understat.

## Comandos

- `python3 scripts/build.py`: genera `dist/index.html` (web sin chat), `dist/artefacto_sin_chat.html` y `dist/artefacto_con_chat.html`.
- `python3 scripts/update.py --descargar`: descarga los resultados de la temporada en curso de football-data.co.uk y recalcula todo. Después, `build.py`. Sale con código 3 si no hay partidos nuevos.
- `npm run check`: comprueba con Playwright que el panel carga sin errores. Requiere una vez `npm install && npx playwright install chromium`.
- `npm run serve`: sirve `dist/` en http://localhost:8000.

## Reglas al cambiar cosas

- **Nunca edites `dist/`**: se regenera. Cambia `src/` o `data/` y ejecuta `build.py`.
- Después de cualquier cambio: `python3 scripts/build.py && npm run check`. Revisa también en el móvil (unos 390 px de ancho) y en modo oscuro.
- **Colores:** siempre con los tokens CSS de `:root` y su versión oscura. Nada de colores sueltos que solo funcionen en un tema.
- **Estilo «app limpia»:** tarjetas redondeadas (`--r`), sombras suaves (`--shadow`), píldoras para pestañas y filtros, números en Barlow Condensed, texto en Figtree.
- **Escudos:** no se usan escudos oficiales (derechos de marca), solo los colores del club con `crest(t)`.
- **Textos:** en español de España, claros, sin jerga técnica.
- **Datos:** no inventes cifras. Si falta un dato, muestra «Sin datos» y explica desde cuándo existe.
- **Antes de 1995/96** la victoria valía 2 puntos. Para comparar épocas se usa `pts3` (3 por victoria) y se indica.

## Publicar

- **Web propia:** sube el contenido de `dist/` a GitHub Pages o Netlify (`index.html` es autónomo).
- **Artefactos de Claude** (los enlaces que ya usa Juani): se publican desde la app de Claude (Cowork) con `dist/artefacto_con_chat.html` y `dist/artefacto_sin_chat.html`. Claude Code no puede publicar artefactos.

## Fuentes

engsoccerdata (resultados 1928–2025), football-data.co.uk (resultados y estadísticas desde 2005/06), BDFútbol (tarjetas, goleadores y porteros históricos), FBref (jugadores desde 1988/89), Understat (xG desde 2014/15), Wikipedia (Trofeo Zarra).
