# LaLiga en datos

Panel de estadísticas de la Primera División española desde 1928/29: 96 temporadas y más de 27.000 partidos.

## Primeros pasos con Claude Code

1. Abre la app **Terminal** del Mac.
2. Instala Claude Code (solo la primera vez):
   ```
   curl -fsSL https://claude.ai/install.sh | bash
   ```
3. Entra en la carpeta del proyecto y arranca Claude:
   ```
   cd ~/code/laliga-en-datos
   claude
   ```
   La primera vez te pedirá iniciar sesión con tu cuenta de Claude (Pro).
4. Pídele cosas en español. Por ejemplo:
   - «Lee el CLAUDE.md, inicializa git y haz el primer commit.»
   - «Actualiza los datos de la temporada y reconstruye el panel.»
   - «Abre el panel en el navegador.»

## Comandos útiles

| Qué | Comando |
|---|---|
| Construir el panel | `python3 scripts/build.py` |
| Actualizar la temporada en curso | `python3 scripts/update.py --descargar` y después construir |
| Ver el panel | `open dist/index.html` |
| Comprobar que no hay errores | `npm install` (una vez) y `npm run check` |

## Estructura

- `src/`: plantilla (HTML y CSS) y código JavaScript por pestañas.
- `data/`: datos de equipos, partidos y jugadores.
- `scripts/`: construcción, actualización y comprobación.
- `dist/`: el panel ya construido (no se edita a mano).

Más detalles técnicos en `CLAUDE.md`.
