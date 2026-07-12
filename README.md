# Del plano al espacio

Cápsula interactiva de apoyo para el **Trabajo Práctico N.º 7 de Álgebra y Geometría I**: ecuaciones de segundo grado en el plano, cónicas y superficies cuádricas.

La cápsula está preparada para abrirse directamente desde `index.html` y para publicarse en GitHub Pages sin instalar dependencias.

## Estructura

```text
capsula_conicas_cuadricas/
├── index.html
├── css/
│   └── estilos.css
├── js/
│   └── app.js
├── assets/
│   ├── img/
│   ├── audio/
│   ├── video/
│   ├── 3d/
│   └── documentos/
└── README.md
```

## Cómo abrir la cápsula

1. Descomprimí la carpeta completa.
2. Abrí `index.html` con un navegador moderno.
3. Para probarla como sitio web local, también podés abrir una terminal dentro de la carpeta y ejecutar:

```bash
python3 -m http.server 8000
```

Después visitá `http://localhost:8000`.

## Código de acceso al nodo de cuádricas

El código incluido es:

```text
TRAZAS
```

Para cambiarlo, abrí `js/app.js` y modificá:

```js
const CLAVE_CUADRICAS = 'TRAZAS';
```

Para dejar el nodo abierto, usá una cadena vacía:

```js
const CLAVE_CUADRICAS = '';
```

## Reemplazar imágenes

Las imágenes están en `assets/img/` y son archivos SVG. Podés reemplazarlas conservando los nombres:

- `hero-geometria.svg`
- `mapa-2d-3d.svg`
- `mapa-conceptual.svg`
- `trazas.svg`

También podés usar PNG o JPG, pero en ese caso tenés que cambiar la extensión en `index.html`.

## Reemplazar audios

Los audios locales están en `assets/audio/`:

- `pausa-orbita.mp3`
- `pausa-trazas.mp3`
- `pausa-coordenadas.mp3`

Para cambiar nombres, editá el arreglo `audios` en `js/app.js`.

## Reemplazar o agregar videos locales

Los microvideos están en `assets/video/`:

- `01_completar_cuadrados.mp4`
- `02_trazas_elipsoide.mp4`
- `03_signos_hiperboloide.mp4`

Si reemplazás un archivo por otro con el mismo nombre, no hace falta modificar el código. Para usar otro nombre, cambiá la ruta correspondiente en `index.html`.

## Cambiar los videos de YouTube

En `js/app.js` buscá el arreglo:

```js
const youtubeVideos = [ ... ];
```

Cada entrada usa el identificador del video, no la URL completa:

```js
{id:'6WiFDz6pntE', titulo:'Tipos de cónicas', descripcion:'...'}
```

La cápsula incluye un enlace alternativo por si el iframe no carga. Los videos de YouTube requieren conexión a internet.

## Visualizaciones WebGL proporcionadas

Los HTML originales se copiaron en `assets/3d/` y se muestran de manera opcional dentro de cada cónica:

- `circunferencia.html`
- `elipse.html`
- `parabola.html`
- `hiperbola.html`

Estas páginas usan la biblioteca WebGL de Asymptote alojada externamente. La teoría, las actividades y los SVG de la cápsula funcionan aunque esa biblioteca no cargue.

## Cambiar títulos y textos

- Los textos fijos de portada, propósito, mapa, taller y créditos están en `index.html`.
- Las microlecciones de cada cónica y cuádrica están organizadas como objetos dentro de `js/app.js`, en los arreglos `conicas` y `cuadricas`.
- Las tres situaciones del taller están en `casosIntegracion`.

## Cambiar colores

Abrí `css/estilos.css` y editá las variables del bloque `:root`:

```css
:root {
  --azul: #1f4e8c;
  --azul-oscuro: #17365f;
  --fondo: #f4f7fb;
  --superficie: #ffffff;
}
```

## Bitácora y progreso

La bitácora, el progreso, el desbloqueo del nodo y las respuestas del taller se guardan con `localStorage` únicamente en el navegador del estudiante. No se envían a ningún servidor.

Para borrar el progreso existe un botón en el mapa. La bitácora se puede borrar entrada por entrada o exportar como `.txt`.

## Publicar en GitHub Pages

1. Creá un repositorio nuevo en GitHub.
2. Subí **todo el contenido de esta carpeta**, manteniendo la estructura.
3. En el repositorio, abrí **Settings → Pages**.
4. En **Build and deployment**, elegí **Deploy from a branch**.
5. Seleccioná la rama `main` y la carpeta `/ (root)`.
6. Guardá y esperá a que GitHub publique la dirección del sitio.

No subas solamente `index.html`: las carpetas `css`, `js` y `assets` son necesarias.

## Lista de comprobación

- [ ] La portada abre y el botón “Comenzar” muestra el mapa.
- [ ] Los cuatro nodos del mapa abren sus secciones.
- [ ] El código del nodo de cuádricas funciona.
- [ ] Las tarjetas de cónicas y cuádricas muestran microlecciones.
- [ ] Cada microactividad devuelve una explicación.
- [ ] El taller avanza por tres casos y puede reiniciarse.
- [ ] La bitácora guarda, recupera y exporta entradas.
- [ ] Los tres audios locales se reproducen.
- [ ] Los tres videos locales se reproducen.
- [ ] El carrusel de YouTube cambia de video y muestra un enlace alternativo.
- [ ] Los PDF del TP, la resolución y la teoría abren desde el taller.
- [ ] En celular, las columnas pasan a una sola columna.

## Créditos y uso de IA

La propuesta y la curaduría docente corresponden a **Lucas Colipe**. La estructura, programación, adaptación de contenidos y generación de recursos locales fueron desarrolladas con asistencia de inteligencia artificial generativa, usando como base exclusiva los materiales académicos proporcionados para la actividad.
