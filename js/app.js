/* ========================================================================== 
   CÁPSULA: DEL PLANO AL ESPACIO
   Lógica de navegación, microlecciones, actividades, bitácora y multimedia.
   ========================================================================== */

'use strict';

/* --------------------------------------------------------------------------
   CONFIGURACIÓN DOCENTE
   Cambiá la clave para habilitar el nodo de superficies cuádricas.
   Para dejar el nodo abierto, asigná una cadena vacía: const CLAVE_CUADRICAS = '';
   -------------------------------------------------------------------------- */
const CLAVE_CUADRICAS = 'TRAZAS';

const STORAGE = {
  progreso: 'capsula_geometria_progreso_v1',
  bitacora: 'capsula_geometria_bitacora_v1',
  desbloqueo: 'capsula_geometria_desbloqueo_v1',
  actividad: 'capsula_geometria_actividad_v1'
};

const memoriaTemporal = new Map();

const estado = {
  pantallaPendiente: null,
  filtroCuadricas: 'todas',
  casoActual: 0,
  respuestasIntegracion: []
};


/* --------------------------------------------------------------------------
   MATHJAX
   Procesa las expresiones LaTeX que se insertan dinámicamente con innerHTML.
   -------------------------------------------------------------------------- */
function procesarMathJax(contenedor = document.body) {
  const ejecutar = () => {
    if (!window.MathJax || typeof window.MathJax.typesetPromise !== 'function') {
      return Promise.resolve();
    }

    if (typeof window.MathJax.typesetClear === 'function') {
      window.MathJax.typesetClear([contenedor]);
    }

    return window.MathJax.typesetPromise([contenedor]);
  };

  const promesaInicio = window.MathJax?.startup?.promise;
  const tarea = promesaInicio ? promesaInicio.then(ejecutar) : ejecutar();

  return tarea.catch((error) => {
    console.error('No se pudieron procesar las fórmulas con MathJax:', error);
  });
}

/* --------------------------------------------------------------------------
   DATOS DIDÁCTICOS · CÓNICAS
   Todo el contenido se deriva de los materiales de la cátedra.
   -------------------------------------------------------------------------- */
const conicas = [
  {
    id: 'circunferencia', codigo: 'C-01', numero: '01', nombre: 'Circunferencia', icono: '◯', visual: 'circunferencia',
    pregunta: '¿Qué permanece constante cuando un punto recorre la curva?',
    definicion: String.raw`Lugar geométrico de los puntos \(P=(x,y)\) del plano cuya distancia a un punto fijo \(C=(h,k)\) es constante e igual a \(r\).`,
    formulas: [String.raw`\[(x-h)^2+(y-k)^2=r^2\]`, String.raw`Centro: \(C=(h,k)\). Radio: \(r>0\).`],
    claves: ['dos términos cuadráticos con el mismo signo y el mismo coeficiente', 'no hay término cruzado en los casos trabajados', 'la forma ordinaria permite leer centro y radio'],
    elementos: ['centro', 'radio', 'diámetro', 'recta tangente y punto de tangencia'],
    ejemplo: {
      titulo: 'Ejemplo del TP: reconocer centro y radio',
      enunciado: String.raw`\[(x+1)^2+(y-4)^2-9=0\]`,
      pasos: [String.raw`Pasar la constante: \((x+1)^2+(y-4)^2=9\).`, String.raw`Comparar con \((x-h)^2+(y-k)^2=r^2\).`, String.raw`Leer \(h=-1\), \(k=4\) y \(r=3\).`],
      conclusion: String.raw`La curva es una circunferencia de centro \(C=(-1,4)\) y radio \(r=3\).`
    },
    quiz: {
      pregunta: String.raw`Una circunferencia tiene centro \(C=(4,-3)\) y radio \(r=6\). ¿Cuál es su ecuación?`,
      opciones: [String.raw`\((x+4)^2+(y-3)^2=36\)`, String.raw`\((x-4)^2+(y+3)^2=36\)`, String.raw`\((x-4)^2+(y+3)^2=6\)`], correcta: 1,
      bien: String.raw`Exacto: los signos dentro de los cuadrados son opuestos a las coordenadas del centro y el segundo miembro es \(r^2\).`,
      mal: String.raw`Revisá dos decisiones: dentro del cuadrado aparece \(x-h\) e \(y-k\), y el radio se eleva al cuadrado.`
    },
    asy: 'assets/3d/circunferencia.html'
  },
  {
    id: 'elipse', codigo: 'C-02', numero: '02', nombre: 'Elipse', icono: '⬭', visual: 'elipse',
    pregunta: '¿Por qué la suma de dos distancias puede producir una curva cerrada?',
    definicion: 'Lugar geométrico de los puntos del plano para los cuales la suma de las distancias a dos focos es constante.',
    formulas: [String.raw`\[\frac{(x-h)^2}{a^2}+\frac{(y-k)^2}{b^2}=1\]`, String.raw`\[c^2=a^2-b^2\qquad (a>b>0)\]`],
    claves: ['dos cuadrados con el mismo signo', 'los denominadores determinan los semiejes', 'el mayor denominador indica la dirección del eje mayor'],
    elementos: ['centro', 'semiejes', 'eje mayor y menor', 'vértices', 'focos', 'excentricidad'],
    ejemplo: {
      titulo: 'Ejemplo del TP: eje mayor vertical',
      enunciado: String.raw`\[\frac{\left(x+\frac12\right)^2}{9}+\frac{(y+2)^2}{25}=1\]`,
      pasos: [String.raw`Centro \(C=\left(-\frac12,-2\right)\).`, String.raw`El mayor denominador es \(25\) y está bajo el término de \(y\): el eje mayor es vertical.`, String.raw`Semiejes \(5\) y \(3\); \(c^2=25-9=16\), entonces \(c=4\).`],
      conclusion: String.raw`Los focos son \(F_1=\left(-\frac12,2\right)\) y \(F_2=\left(-\frac12,-6\right)\).`
    },
    quiz: {
      pregunta: String.raw`En \(\dfrac{(x-1)^2}{12}+\dfrac{(y+2)^2}{16}=1\), ¿qué afirmación es correcta?`,
      opciones: [String.raw`El eje mayor es horizontal y mide \(8\).`, String.raw`El eje mayor es vertical y su semieje mide \(4\).`, String.raw`El centro es \((-1,2)\).`], correcta: 1,
      bien: 'Bien: 16 es el mayor denominador y está en el término de y; por eso el eje mayor es vertical.',
      mal: 'Buscá primero el mayor denominador y observá bajo qué variable aparece, ese es el eje mayo. Después para buscar el centro hay que buscar que los numeradores que aparecen sean nulos.'
    },
    asy: 'assets/3d/elipse.html'
  },
  {
    id: 'parabola', codigo: 'C-03', numero: '03', nombre: 'Parábola', icono: '⌒', visual: 'parabola',
    pregunta: '¿Cómo se equilibra la distancia a un punto con la distancia a una recta?',
    definicion: 'Lugar geométrico de los puntos que equidistan de un foco y de una recta fija llamada directriz.',
    formulas: [String.raw`\[(y-k)^2=4p(x-h)\]`, String.raw`\[(x-h)^2=4p(y-k)\]`],
    claves: ['aparece una sola variable elevada al cuadrado', 'la variable lineal señala el eje de simetría', 'el signo de p determina el sentido de apertura'],
    elementos: ['vértice', 'foco', 'directriz', 'eje de simetría', 'parámetro p'],
    ejemplo: {
      titulo: 'Ejemplo del TP: apertura hacia la izquierda',
      enunciado: String.raw`\[2y^2+6=-3x\]`,
      pasos: [String.raw`Despejar: \(y^2=-\frac32x-3\).`, String.raw`Factorizar: \(y^2=-\frac32(x+2)\).`, String.raw`Comparar con \((y-k)^2=4p(x-h)\): \(h=-2\), \(k=0\) y \(4p=-\frac32\).`],
      conclusion: String.raw`Vértice \(V=(-2,0)\), \(p=-\frac38\); la parábola abre hacia la izquierda.`
    },
    quiz: {
      pregunta: String.raw`Una parábola tiene vértice en el origen, eje horizontal y pasa por \(P=(9,6)\). ¿Cuál es su ecuación?`,
      opciones: [String.raw`\(x^2=4y\)`, String.raw`\(y^2=4x\)`, String.raw`\(y^2=9x\)`], correcta: 1,
      bien: String.raw`Correcto: \(6^2=4p\cdot 9\) da \(p=1\); por lo tanto, \(y^2=4x\).`,
      mal: String.raw`Como el eje es horizontal, la variable cuadrática es \(y\). Sustituí el punto para encontrar \(p\).`
    },
    asy: 'assets/3d/parabola.html'
  },
  {
    id: 'hiperbola', codigo: 'C-04', numero: '04', nombre: 'Hipérbola', icono: ')( ', visual: 'hiperbola',
    pregunta: '¿Qué diferencia produce restar, en lugar de sumar, dos términos cuadráticos?',
    definicion: 'Lugar geométrico de los puntos para los cuales el valor absoluto de la diferencia de las distancias a dos focos es constante.',
    formulas: [String.raw`\[\frac{(x-h)^2}{a^2}-\frac{(y-k)^2}{b^2}=1\]`, String.raw`\[\frac{(y-k)^2}{a^2}-\frac{(x-h)^2}{b^2}=1\]`, String.raw`\[c^2=a^2+b^2\]`],
    claves: ['dos cuadrados con signos opuestos', 'el término positivo determina la dirección del eje real', 'las asíntotas pasan por el centro'],
    elementos: ['centro', 'vértices', 'focos', 'eje real', 'eje imaginario', 'asíntotas'],
    ejemplo: {
      titulo: 'Ejemplo del TP: eje real vertical',
      enunciado: String.raw`\[-2(x+2)^2+18(y+2)^2-18=0\]`,
      pasos: [String.raw`Pasar el término independiente y dividir por \(18\).`, String.raw`Obtener \((y+2)^2-\dfrac{(x+2)^2}{9}=1\).`, String.raw`El término positivo es el de \(y\): el eje real es vertical.`],
      conclusion: String.raw`Centro \(C=(-2,-2)\), vértices \(V_1=(-2,-1)\) y \(V_2=(-2,-3)\); las asíntotas tienen pendientes \(\pm\frac13\).`
    },
    quiz: {
      pregunta: String.raw`En \(\dfrac{x^2}{16}-\dfrac{(y-1)^2}{4}=1\), ¿cuáles son las asíntotas?`,
      opciones: [String.raw`\(y-1=\pm 2x\)`, String.raw`\(y-1=\pm\dfrac{x}{2}\)`, String.raw`\(y=\pm 4x+1\)`], correcta: 1,
      bien: String.raw`Exacto: para una hipérbola horizontal la pendiente es \(\pm\frac ba=\pm\frac24=\pm\frac12\).`,
      mal: String.raw`Usá el rectángulo auxiliar: \(a=4\) y \(b=2\), de modo que la pendiente es \(\pm\frac ba\).`
    },
    asy: 'assets/3d/hiperbola.html'
  }
];

/* --------------------------------------------------------------------------
   DATOS DIDÁCTICOS · SUPERFICIES CUÁDRICAS
   -------------------------------------------------------------------------- */
const cuadricas = [
  {
    id:'esfera', codigo:'Q-01', numero:'01', nombre:'Esfera', icono:'●', visual:'esfera', categoria:'cerradas',
    pregunta:'¿Qué significa estar a una distancia fija de un punto del espacio?',
    definicion:String.raw`Conjunto de puntos del espacio que están a una distancia \(r\) de un centro \(C=(h,k,w)\).`,
    formulas:[String.raw`\[(x-h)^2+(y-k)^2+(z-w)^2=r^2\]`],
    claves:['tres cuadrados con el mismo signo y el mismo coeficiente', 'todas las trazas planas no vacías son circunferencias', 'si el plano pasa por el centro aparece una circunferencia máxima'],
    elementos:['centro', 'radio', 'planos tangentes', 'puntos antipodales'],
    ejemplo:{titulo:'Ejemplo del TP', enunciado:String.raw`\[x^2+y^2+z^2=9\]`, pasos:[String.raw`Centro en el origen: \(C=(0,0,0)\).`, String.raw`Radio \(r=3\).`, String.raw`Las trazas \(x=0\), \(y=0\) y \(z=0\) son circunferencias de radio \(3\).`], conclusion:'Es una esfera cerrada y acotada.'},
    quiz:{pregunta:String.raw`¿Qué traza produce la esfera \(x^2+y^2+z^2=9\) con el plano \(z=2\)?`, opciones:[String.raw`\(x^2+y^2=5\)`, String.raw`\(x^2+y^2=7\)`, String.raw`\(x^2+y^2=9\)`], correcta:0, bien:String.raw`Bien: sustituir \(z=2\) deja \(x^2+y^2=9-4=5\).`, mal:'La traza se obtiene sustituyendo el valor fijo del plano y simplificando.'}
  },
  {
    id:'elipsoide', codigo:'Q-02', numero:'02', nombre:'Elipsoide', icono:'◉', visual:'elipsoide', categoria:'cerradas',
    pregunta:'¿Cómo cambian las trazas cuando los tres radios principales son distintos?',
    definicion:'Superficie cerrada con tres planos de simetría, cuyas trazas principales son elipses.',
    formulas:[String.raw`\[\frac{(x-h)^2}{a^2}+\frac{(y-k)^2}{b^2}+\frac{(z-w)^2}{c^2}=1\]`],
    claves:['tres términos cuadrados con el mismo signo', 'segundo miembro positivo', 'los denominadores determinan los semiejes'],
    elementos:['centro', 'tres semiejes', 'vértices sobre los ejes principales'],
    ejemplo:{titulo:'Ejemplo de reducción', enunciado:String.raw`\[\frac{(x-1)^2}{4}+\frac{(y+2)^2}{9}+\frac{(z-3)^2}{16}=1\]`, pasos:[String.raw`Centro \(C=(1,-2,3)\).`, String.raw`Semiejes \(2\), \(3\) y \(4\).`, 'Las trazas coordenadas son elipses.'], conclusion:String.raw`El semieje mayor es paralelo al eje \(z\).`},
    quiz:{pregunta:String.raw`Al cortar \(\dfrac{x^2}{25}+\dfrac{y^2}{16}+\dfrac{z^2}{4}=1\) con \(x=k\), ¿cuándo la traza es un punto?`, opciones:[String.raw`\(|k|<5\)`, String.raw`\(|k|=5\)`, String.raw`\(|k|>5\)`], correcta:1, bien:String.raw`Correcto: en los extremos del semieje \(x\), el corte se reduce a un punto.`, mal:String.raw`Pensá en el factor \(1-\dfrac{k^2}{25}\): debe valer cero para que la elipse colapse a un punto.`}
  },
  {
    id:'paraboloide-eliptico', codigo:'Q-03', numero:'03', nombre:'Paraboloide elíptico', icono:'∪', visual:'paraboloide-eliptico', categoria:'abiertas',
    pregunta:'¿Qué superficie se reconstruye si las trazas horizontales son elipses que crecen?',
    definicion:'Superficie abierta de una sola pieza; las secciones perpendiculares al eje son elipses y las secciones que contienen al eje son parábolas.',
    formulas:[String.raw`\[\frac{(x-h)^2}{a^2}+\frac{(y-k)^2}{b^2}=z-w\]`],
    claves:['dos cuadrados con el mismo signo y una variable lineal', 'el signo de la variable lineal determina el sentido de apertura', 'tiene un vértice'],
    elementos:['vértice', 'eje de simetría', 'familia de trazas elípticas'],
    ejemplo:{titulo:'Ejemplo de la teoría', enunciado:String.raw`\[\frac{(x-1)^2}{4}+\frac{(y+2)^2}{9}=z-3\]`, pasos:[String.raw`Vértice \(V=(1,-2,3)\).`, String.raw`Eje paralelo a \(z\).`, String.raw`Para \(z=k>3\) aparecen elipses.`], conclusion:String.raw`La superficie abre hacia \(z\) positivo.`},
    quiz:{pregunta:String.raw`En \(x^2+\dfrac{y^2}{4}=z\), ¿qué ocurre al fijar \(z=0\)?`, opciones:['Aparece una elipse', 'Aparece solo el origen', 'Aparece una hipérbola'], correcta:1, bien:String.raw`Exacto: \(x^2+\dfrac{y^2}{4}=0\) solo se cumple en \((0,0,0)\), el vértice.`, mal:'La suma de dos cuadrados es cero únicamente cuando ambos son cero.'}
  },
  {
    id:'paraboloide-hiperbolico', codigo:'Q-04', numero:'04', nombre:'Paraboloide hiperbólico', icono:'⋈', visual:'paraboloide-hiperbolico', categoria:'abiertas',
    pregunta:'¿Cómo puede una misma superficie producir parábolas con concavidades opuestas?',
    definicion:'Superficie abierta con punto de silla; presenta trazas parabólicas en dos direcciones y trazas hiperbólicas en planos paralelos a la base.',
    formulas:[String.raw`\[\frac{(x-h)^2}{a^2}-\frac{(y-k)^2}{b^2}=z-w\]`],
    claves:['dos cuadrados con signos opuestos y una variable lineal', 'en el plano z = w aparecen dos rectas', 'no tiene centro; tiene punto de silla'],
    elementos:['punto de silla', 'eje de referencia', 'trazas parabólicas e hiperbólicas'],
    ejemplo:{titulo:'Forma canónica', enunciado:String.raw`\[\frac{x^2}{4}-\frac{z^2}{9}=y\]`, pasos:[String.raw`La variable lineal es \(y\).`, String.raw`En planos \(y=k\) aparecen hipérbolas o rectas.`, String.raw`En planos \(x=\text{constante}\) o \(z=\text{constante}\) aparecen parábolas.`], conclusion:String.raw`El eje de referencia es paralelo a \(y\).`},
    quiz:{pregunta:String.raw`Para \(z=0\) en \(\dfrac{x^2}{4}-\dfrac{y^2}{9}=z\), la traza es:`, opciones:['una elipse', 'dos rectas que se cortan', 'un punto'], correcta:1, bien:String.raw`Bien: \(\dfrac{x^2}{4}-\dfrac{y^2}{9}=0\) factoriza como dos rectas.`, mal:'Cuando el segundo miembro es cero, una diferencia de cuadrados puede factorizarse.'}
  },
  {
    id:'hiperboloide-una-hoja', codigo:'Q-05', numero:'05', nombre:'Hiperboloide de una hoja', icono:'⌛', visual:'hiperboloide-una', categoria:'abiertas',
    pregunta:'¿Qué indica el único término cuadrático con signo negativo?',
    definicion:'Superficie abierta y conexa. El eje principal corresponde a la variable cuyo término tiene signo diferente.',
    formulas:[String.raw`\[\frac{x^2}{a^2}+\frac{y^2}{b^2}-\frac{z^2}{c^2}=1\]`],
    claves:['dos términos positivos y uno negativo', 'la variable con signo negativo marca el eje', 'las trazas perpendiculares al eje son elipses'],
    elementos:['centro', 'eje', 'cintura elíptica', 'trazas elípticas e hiperbólicas'],
    ejemplo:{titulo:'Ejercicio inicial del TP', enunciado:String.raw`\[x^2+y^2-z^2=1\]`, pasos:[String.raw`El signo diferente está en \(z\).`, String.raw`Para \(z=k\): \(x^2+y^2=1+k^2\), circunferencias.`, String.raw`Para \(x=0\) o \(y=0\): hipérbolas.`], conclusion:String.raw`Hiperboloide de una hoja con eje \(z\).`},
    quiz:{pregunta:String.raw`Si la ecuación cambia a \(x^2-y^2+z^2=1\), ¿qué cambia?`, opciones:['Se convierte en un elipsoide', String.raw`El eje pasa a ser el eje \(y\).`, 'La superficie se traslada una unidad'], correcta:1, bien:String.raw`Exacto: la variable con signo negativo cambia de \(z\) a \(y\), por eso cambia la orientación.`, mal:'La superficie conserva el tipo; cambia la variable con signo diferente y, con ella, el eje.'}
  },
  {
    id:'hiperboloide-dos-hojas', codigo:'Q-06', numero:'06', nombre:'Hiperboloide de dos hojas', icono:'◡ ◠', visual:'hiperboloide-dos', categoria:'abiertas',
    pregunta:'¿Por qué algunas trazas cercanas al centro son vacías?',
    definicion:'Superficie abierta formada por dos componentes separadas. El término positivo único determina el eje de las hojas.',
    formulas:[String.raw`\[-\frac{x^2}{a^2}-\frac{y^2}{b^2}+\frac{z^2}{c^2}=1\]`],
    claves:['un término positivo y dos negativos', 'la variable positiva marca el eje', 'hay una región central sin puntos'],
    elementos:['centro', 'dos vértices', 'eje de las hojas', 'trazas elípticas e hiperbólicas'],
    ejemplo:{titulo:'Ejemplo del TP', enunciado:String.raw`\[\frac{z^2}{4}-\frac{y^2}{9}-\frac{x^2}{9}=1\]`, pasos:[String.raw`El único término positivo es \(\dfrac{z^2}{4}\).`, String.raw`Los vértices están en \(z=\pm2\).`, String.raw`Para \(|z|<2\) no hay trazas reales.`], conclusion:String.raw`Hiperboloide de dos hojas con eje \(z\).`},
    quiz:{pregunta:String.raw`En \(\dfrac{z^2}{4}-\dfrac{x^2}{9}-\dfrac{y^2}{9}=1\), la traza \(z=3\) es:`, opciones:['una elipse', 'una hipérbola', 'vacía'], correcta:0, bien:String.raw`Correcto: al fijar \(z=3\) queda \(\dfrac{x^2}{9}+\dfrac{y^2}{9}=\dfrac54\), una circunferencia.`, mal:String.raw`Sustituí \(z=3\) y reordená; los términos de \(x\) e \(y\) quedan sumándose.`}
  },
  {
    id:'cono-eliptico', codigo:'Q-07', numero:'07', nombre:'Cono elíptico', icono:'◇', visual:'cono', categoria:'abiertas',
    pregunta:'¿Qué cambia cuando el segundo miembro de un hiperboloide se vuelve cero?',
    definicion:'Superficie doble con vértice; las trazas perpendiculares al eje son elipses y las trazas que contienen al eje son pares de rectas.',
    formulas:[String.raw`\[\frac{x^2}{a^2}+\frac{y^2}{b^2}-\frac{z^2}{c^2}=0\]`],
    claves:['tres cuadrados con signos mezclados', 'segundo miembro igual a cero', 'pasa por el vértice y tiene dos nappes'],
    elementos:['vértice', 'eje', 'generatrices', 'trazas elípticas y pares de rectas'],
    ejemplo:{titulo:'Ejemplo del TP', enunciado:String.raw`\[x^2=y^2+z^2\]`, pasos:[String.raw`Reordenar: \(y^2+z^2-x^2=0\).`, String.raw`El término con signo diferente es \(x^2\).`, String.raw`El eje del cono es paralelo a \(x\).`], conclusion:'Es un cono circular con vértice en el origen.'},
    quiz:{pregunta:String.raw`¿Qué se obtiene al cortar \(y^2+z^2-x^2=0\) con \(x=0\)?`, opciones:['una circunferencia', 'solo el origen', 'dos rectas'], correcta:1, bien:String.raw`Exacto: \(y^2+z^2=0\) solo tiene la solución \(y=z=0\).`, mal:'En el plano perpendicular al eje y pasando por el vértice, la sección colapsa al vértice.'}
  },
  {
    id:'cilindro-eliptico', codigo:'Q-08', numero:'08', nombre:'Cilindro elíptico', icono:'▯', visual:'cilindro-eliptico', categoria:'cilindricas',
    pregunta:'¿Qué significa que una variable no aparezca en la ecuación?',
    definicion:'Superficie formada al trasladar una elipse en una dirección fija. La variable ausente puede tomar cualquier valor.',
    formulas:[String.raw`\[\frac{x^2}{a^2}+\frac{y^2}{b^2}=1\]`],
    claves:['falta una variable', 'la superficie es paralela al eje de la variable ausente', 'la traza útil es la cónica generadora'],
    elementos:['eje de traslación', 'elipse generadora', 'rectas generatrices'],
    ejemplo:{titulo:'Ejemplo del TP', enunciado:String.raw`\[4x^2+y^2=4\]`, pasos:[String.raw`Dividir por \(4\): \(x^2+\dfrac{y^2}{4}=1\).`, String.raw`No aparece \(z\).`, String.raw`La elipse del plano \(xy\) se repite para todo \(z\).`], conclusion:String.raw`Cilindro elíptico paralelo al eje \(z\).`},
    quiz:{pregunta:String.raw`La ecuación \(x^2+z^2=25\) representa un cilindro paralelo a:`, opciones:[String.raw`eje \(x\)`, String.raw`eje \(y\)`, String.raw`eje \(z\)`], correcta:1, bien:String.raw`Bien: \(y\) no aparece y puede variar libremente; las generatrices son paralelas al eje \(y\).`, mal:'Buscá la variable ausente: esa es la dirección libre del cilindro.'}
  },
  {
    id:'cilindro-hiperbolico', codigo:'Q-09', numero:'09', nombre:'Cilindro hiperbólico', icono:')(', visual:'cilindro-hiperbolico', categoria:'cilindricas',
    pregunta:'¿Cómo se extiende una hipérbola sin cambiar su forma?',
    definicion:'Superficie formada por rectas paralelas que pasan por una hipérbola generadora.',
    formulas:[String.raw`\[\frac{x^2}{a^2}-\frac{y^2}{b^2}=1\]`],
    claves:['dos cuadrados con signos opuestos', 'falta una variable', 'las trazas perpendiculares al eje libre son hipérbolas iguales'],
    elementos:['hipérbola generadora', 'dirección libre', 'dos familias de ramas'],
    ejemplo:{titulo:'Forma típica', enunciado:String.raw`\[\frac{x^2}{4}-\frac{z^2}{9}=1\]`, pasos:[String.raw`No aparece \(y\).`, String.raw`La curva generadora está en el plano \(xz\).`, String.raw`Se traslada paralelamente al eje \(y\).`], conclusion:String.raw`Cilindro hiperbólico paralelo a \(y\).`},
    quiz:{pregunta:String.raw`En \(\dfrac{y^2}{9}-\dfrac{x^2}{25}=1\), considerada en \(\mathbb{R}^3\), la dirección libre es:`, opciones:[String.raw`\(x\)`, String.raw`\(y\)`, String.raw`\(z\)`], correcta:2, bien:String.raw`Correcto: \(z\) no aparece en la ecuación.`, mal:'La variable ausente puede tomar cualquier valor y define la dirección de las generatrices.'}
  },
  {
    id:'cilindro-parabolico', codigo:'Q-10', numero:'10', nombre:'Cilindro parabólico', icono:'⌒▯', visual:'cilindro-parabolico', categoria:'cilindricas',
    pregunta:'¿Qué ocurre si una parábola se repite a lo largo de un eje?',
    definicion:'Superficie cilíndrica cuya curva generadora es una parábola.',
    formulas:[String.raw`\[x^2=4py\]`],
    claves:['una variable cuadrática y otra lineal', 'la tercera variable está ausente', 'la superficie es abierta'],
    elementos:['parábola generadora', 'eje de traslación', 'vértice lineal'],
    ejemplo:{titulo:'Forma típica', enunciado:String.raw`\[z^2=4y-16\]`, pasos:[String.raw`Reescribir \(z^2=4(y-4)\).`, String.raw`No aparece \(x\).`, String.raw`La parábola del plano \(yz\) se repite para todo \(x\).`], conclusion:String.raw`Cilindro parabólico paralelo al eje \(x\).`},
    quiz:{pregunta:String.raw`La ecuación \(y^2+z=4\) representa un cilindro parabólico paralelo a:`, opciones:[String.raw`\(x\)`, String.raw`\(y\)`, String.raw`\(z\)`], correcta:0, bien:String.raw`Exacto: \(x\) no aparece.`, mal:'La variable ausente determina la dirección libre del cilindro.'}
  },
  {
    id:'degeneradas', codigo:'Q-11', numero:'11', nombre:'Cuádricas degeneradas', icono:'∥ ·', visual:'degeneradas', categoria:'degeneradas',
    pregunta:'¿Cuándo una ecuación cuadrática deja de describir una superficie completa?',
    definicion:'Casos en los que el conjunto solución se reduce a un punto, una recta, uno o dos planos, o resulta vacío.',
    formulas:[String.raw`\[x^2+y^2+z^2=0\quad\Longrightarrow\quad\text{punto}\]`, String.raw`\[x^2-z^2=0\quad\Longrightarrow\quad\text{dos planos}\]`, String.raw`\[(x-1)^2=0\quad\Longrightarrow\quad\text{un plano}\]`],
    claves:['la ecuación puede factorizar', 'una suma de cuadrados igual a cero obliga a anular cada término', 'un segundo miembro incompatible produce conjunto vacío'],
    elementos:['punto', 'recta', 'plano', 'par de planos', 'conjunto vacío'],
    ejemplo:{titulo:'Ejemplo de factorización', enunciado:String.raw`\[x^2-z^2=0\]`, pasos:['Reconocer diferencia de cuadrados.', String.raw`Factorizar \((x-z)(x+z)=0\).`, 'Cada factor igual a cero describe un plano.'], conclusion:String.raw`El conjunto es la unión de los planos \(x=z\) y \(x=-z\).`},
    quiz:{pregunta:String.raw`¿Qué representa \((x-2)^2+(z-1)^2=0\) en \(\mathbb{R}^3\)?`, opciones:['un punto', String.raw`una recta paralela al eje \(y\)`, 'un plano'], correcta:1, bien:String.raw`Bien: \(x=2\) y \(z=1\), mientras \(y\) queda libre; por eso es una recta paralela a \(y\).`, mal:String.raw`La suma de cuadrados obliga a \(x=2\) y \(z=1\), pero la variable \(y\) no está restringida.`}
  }
];

/* Tres casos centrales solicitados para la actividad integradora. */
const casosIntegracion = [
  {
    codigo:'I-01', titulo:'Reconocer antes de calcular',
    enunciado:String.raw`La ecuación \(16x^2+25y^2+160x=-200y-400\) se reduce completando cuadrados. Antes de terminar la cuenta, ¿qué tipo de cónica es razonable anticipar?`,
    opciones:['Parábola, porque hay términos lineales', 'Elipse, porque hay dos términos cuadráticos del mismo signo y distinto coeficiente', 'Hipérbola, porque la constante es negativa'], correcta:1,
    bien:'La anticipación es pertinente: los términos x² e y² tienen el mismo signo y coeficientes distintos. La reducción todavía debe confirmar que la elipse sea real.',
    mal:'Los términos lineales desplazan el centro; no cambian por sí solos la familia. Mirá primero cantidad de términos cuadráticos y signos.'
  },
  {
    codigo:'I-02', titulo:'Elegir un procedimiento',
    enunciado:String.raw`Se conoce una circunferencia de centro \(C=(1,-1)\) tangente a la recta \(-x+y-2=0\). ¿Qué cálculo determina el radio?`,
    opciones:['La pendiente de la recta', 'La distancia del centro a la recta', 'El punto medio entre el centro y el origen'], correcta:1,
    bien:'La tangencia implica que el radio perpendicular a la recta tiene la misma longitud que la distancia del centro a esa recta.',
    mal:'Para una recta tangente, la distancia desde el centro a la recta es exactamente el radio.'
  },
  {
    codigo:'I-03', titulo:'Leer una superficie mediante trazas',
    enunciado:String.raw`Para \(x^2+y^2-z^2=1\) se fija \(z=k\). ¿Qué familia de trazas aparece y qué permite concluir?`,
    opciones:[String.raw`\(x^2+y^2=1+k^2\): circunferencias; la superficie es un hiperboloide de una hoja con eje \(z\).`, String.raw`\(x^2+y^2=1-k^2\): circunferencias; la superficie es un elipsoide.`, String.raw`\(x^2-y^2=1+k^2\): hipérbolas; la superficie es un cono.`], correcta:0,
    bien:String.raw`La traza existe para todo \(k\) y su radio crece con \(|k|\). Esa continuidad confirma una sola hoja y el eje dado por el signo negativo.`,
    mal:String.raw`Sustituí \(z=k\) sin cambiar el signo: \(x^2+y^2=1+k^2\). Después interpretá cómo varía el radio.`
  }
];

const audios = [
  {titulo:'Pausa 1 · Órbita', archivo:'assets/audio/pausa-orbita.mp3'},
  {titulo:'Pausa 2 · Trazas', archivo:'assets/audio/pausa-trazas.mp3'},
  {titulo:'Pausa 3 · Coordenadas', archivo:'assets/audio/pausa-coordenadas.mp3'}
];

const preguntasPausa = [
  '¿Qué dato de una ecuación mirás primero y por qué?',
  '¿Qué diferencia conceptual hay entre reconocer una figura y justificarla?',
  '¿Qué traza elegirías para mostrar la orientación de una superficie?',
  '¿Qué error de signos aparece con más frecuencia al leer un centro trasladado?',
  '¿Cómo explicarías la variable ausente sin usar la palabra “cilindro”?',
  '¿Qué información ofrece un gráfico que todavía no aparece en la forma desarrollada?'
];

/* Los videos externos son opcionales. Cambiá o eliminá entradas sin tocar el HTML. */
const youtubeVideos = [
  {id:'6WiFDz6pntE', titulo:'Tipos de cónicas', descripcion:'Introducción visual breve para comparar circunferencia, elipse, parábola e hipérbola.'},
  {id:'PNAs2hCyHxY', titulo:'Ecuaciones y elementos de las cónicas', descripcion:'Recorrido más extenso por formas ordinarias, generales y elementos principales.'},
  {id:'cWWIg5bpJes', titulo:'Superficies cuádricas, trazas y esfera', descripcion:'Recurso para observar cómo los cortes planos ayudan a reconstruir una superficie.'},
  {id:'PWZpK2Hf6bs', titulo:'Elipsoide, hiperboloides y cono', descripcion:'Comparación de formas canónicas y orientación según los signos.'},
  {id:'mImLt2akJsA', titulo:'Ejercicios de superficies cuádricas', descripcion:'Problemas de identificación, ecuaciones y trazas para ampliar la práctica.'}
];

/* --------------------------------------------------------------------------
   UTILIDADES DE ALMACENAMIENTO
   -------------------------------------------------------------------------- */
function leerTexto(clave) {
  try { return localStorage.getItem(clave); }
  catch (error) { return memoriaTemporal.has(clave) ? memoriaTemporal.get(clave) : null; }
}
function guardarTexto(clave, valor) {
  try { localStorage.setItem(clave, valor); }
  catch (error) { memoriaTemporal.set(clave, valor); }
}
function borrarTexto(clave) {
  try { localStorage.removeItem(clave); }
  catch (error) { memoriaTemporal.delete(clave); }
}
function leerJSON(clave, valorInicial) {
  try {
    const dato = leerTexto(clave);
    return dato ? JSON.parse(dato) : valorInicial;
  } catch (error) {
    console.warn('No se pudo leer el almacenamiento local:', error);
    return valorInicial;
  }
}
function guardarJSON(clave, valor) {
  try { guardarTexto(clave, JSON.stringify(valor)); }
  catch (error) { console.warn('No se pudo guardar en el almacenamiento local:', error); }
}
function progresoActual() { return leerJSON(STORAGE.progreso, {visitados:[]}); }
function marcarVisitado(codigo) {
  const progreso = progresoActual();
  if (!progreso.visitados.includes(codigo)) progreso.visitados.push(codigo);
  guardarJSON(STORAGE.progreso, progreso);
  actualizarProgreso();
  renderMapas();
}

/* --------------------------------------------------------------------------
   NAVEGACIÓN ENTRE PANTALLAS
   Los botones con data-ir ocultan todas las pantallas y muestran la solicitada.
   -------------------------------------------------------------------------- */
function nodoCuadricasDesbloqueado() {
  return CLAVE_CUADRICAS === '' || leerTexto(STORAGE.desbloqueo) === 'si';
}
function mostrarPantalla(id, omitirControl = false) {
  if (id === 'cuadricas' && !omitirControl && !nodoCuadricasDesbloqueado()) {
    estado.pantallaPendiente = 'cuadricas';
    abrirDialogoCodigo();
    return;
  }
  document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
  const destino = document.getElementById(id);
  if (!destino) return;
  destino.classList.add('activa');
  history.replaceState(null, '', `#${id}`);
  window.scrollTo({top:0, behavior:'smooth'});
  document.getElementById('contenido-principal').focus({preventScroll:true});
  if (id === 'mapa') actualizarProgreso();
}

document.addEventListener('click', (evento) => {
  const boton = evento.target.closest('[data-ir]');
  if (boton) {
    evento.preventDefault();
    mostrarPantalla(boton.dataset.ir);
  }
});

/* --------------------------------------------------------------------------
   CONTROL POR CÓDIGO DEL NODO DE CUÁDRICAS
   -------------------------------------------------------------------------- */
const dialogCodigo = document.getElementById('dialog-codigo');
const formCodigo = document.getElementById('form-codigo');
const inputCodigo = document.getElementById('codigo-cuadricas');
const mensajeCodigo = document.getElementById('mensaje-codigo');
function abrirDialogoCodigo() {
  mensajeCodigo.textContent = '';
  inputCodigo.value = '';
  dialogCodigo.showModal();
  setTimeout(() => inputCodigo.focus(), 50);
}
formCodigo.addEventListener('submit', (evento) => {
  evento.preventDefault();
  const ingreso = inputCodigo.value.trim().toUpperCase();
  if (ingreso === CLAVE_CUADRICAS.toUpperCase()) {
    guardarTexto(STORAGE.desbloqueo, 'si');
    dialogCodigo.close();
    actualizarEstadoBloqueo();
    mostrarPantalla(estado.pantallaPendiente || 'cuadricas', true);
  } else {
    mensajeCodigo.textContent = 'El código no coincide. Revisalo y volvé a intentar.';
    inputCodigo.select();
  }
});
document.getElementById('cancelar-codigo').addEventListener('click', () => dialogCodigo.close());
function actualizarEstadoBloqueo() {
  const elemento = document.getElementById('estado-bloqueo');
  if (!elemento) return;
  if (nodoCuadricasDesbloqueado()) elemento.innerHTML = '<span aria-hidden="true">✓</span> Nodo habilitado en este dispositivo';
  else elemento.innerHTML = '<span aria-hidden="true">🔒</span> Nodo con código docente';
}

/* --------------------------------------------------------------------------
   MAPAS DE SUBTEMAS
   -------------------------------------------------------------------------- */
function crearTarjetaTema(tema, tipo) {
  const visitado = progresoActual().visitados.includes(tema.codigo);
  return `
    <article class="subtema-card ${visitado ? 'completado' : ''}" data-categoria="${tema.categoria || 'conica'}">
      ${visitado ? '<span class="marca-completado" aria-label="Tema recorrido">✓</span>' : ''}
      <span class="subtema-icono" aria-hidden="true">${tema.icono}</span>
      <p class="identificador">${tema.codigo}</p>
      <h3>${tema.nombre}</h3>
      <p>${tema.pregunta}</p>
      <button class="boton ${visitado ? 'secundario' : 'primario'}" type="button" data-abrir-tema="${tipo}" data-tema-id="${tema.id}">${visitado ? 'Volver a abrir' : 'Explorar'}</button>
    </article>`;
}
function renderMapas() {
  document.getElementById('mapa-conicas').innerHTML = conicas.map(t => crearTarjetaTema(t, 'conica')).join('');
  const visibles = cuadricas.filter(t => estado.filtroCuadricas === 'todas' || t.categoria === estado.filtroCuadricas);
  document.getElementById('mapa-cuadricas').innerHTML = visibles.map(t => crearTarjetaTema(t, 'cuadrica')).join('');
}

document.addEventListener('click', (evento) => {
  const boton = evento.target.closest('[data-abrir-tema]');
  if (!boton) return;
  const tipo = boton.dataset.abrirTema;
  const coleccion = tipo === 'conica' ? conicas : cuadricas;
  const tema = coleccion.find(t => t.id === boton.dataset.temaId);
  if (!tema) return;
  abrirMicroleccion(tema, tipo);
});

document.querySelectorAll('[data-filtro-cuadricas]').forEach(boton => {
  boton.addEventListener('click', () => {
    estado.filtroCuadricas = boton.dataset.filtroCuadricas;
    document.querySelectorAll('[data-filtro-cuadricas]').forEach(b => b.classList.toggle('activo', b === boton));
    renderMapas();
  });
});

/* --------------------------------------------------------------------------
   SVG DIDÁCTICOS GENERADOS EN EL NAVEGADOR
   -------------------------------------------------------------------------- */
function svgConica(tipo, nombre) {
  const base = `<svg viewBox="0 0 520 340" role="img" aria-label="Representación esquemática de ${nombre}" xmlns="http://www.w3.org/2000/svg"><rect width="520" height="340" rx="24" fill="#f8fbff"/><g stroke="#b8c9dd" stroke-width="1">${Array.from({length:11},(_,i)=>`<path d="M${35+i*45} 25V315"/>`).join('')}${Array.from({length:7},(_,i)=>`<path d="M25 ${35+i*45}H495"/>`).join('')}</g><g stroke="#264d7c" stroke-width="2"><path d="M25 170H495"/><path d="M260 25V315"/></g>`;
  const fin = `<text x="482" y="160" font-size="16" fill="#264d7c">x</text><text x="270" y="40" font-size="16" fill="#264d7c">y</text></svg>`;
  if (tipo === 'circunferencia') return base + `<circle cx="260" cy="170" r="95" fill="#ddecff" stroke="#1f4e8c" stroke-width="5"/><circle cx="260" cy="170" r="6" fill="#b33a3a"/><path d="M260 170L335 112" stroke="#b33a3a" stroke-width="3"/><text x="288" y="136" fill="#8d3030" font-size="17">r</text>` + fin;
  if (tipo === 'elipse') return base + `<ellipse cx="260" cy="170" rx="145" ry="88" fill="#e5f7f1" stroke="#147d64" stroke-width="5"/><circle cx="175" cy="170" r="6" fill="#b33a3a"/><circle cx="345" cy="170" r="6" fill="#b33a3a"/><text x="158" y="158" fill="#8d3030">F₁</text><text x="350" y="158" fill="#8d3030">F₂</text>` + fin;
  if (tipo === 'parabola') return base + `<path d="M135 45 Q260 170 135 295" fill="none" stroke="#6d4fc2" stroke-width="6"/><line x1="335" y1="35" x2="335" y2="305" stroke="#b33a3a" stroke-width="3" stroke-dasharray="8 7"/><circle cx="205" cy="170" r="7" fill="#b33a3a"/><circle cx="135" cy="170" r="6" fill="#1f4e8c"/><text x="190" y="155" fill="#8d3030">F</text><text x="342" y="55" fill="#8d3030">directriz</text>` + fin;
  return base + `<path d="M90 45 C190 90 195 250 90 295" fill="none" stroke="#c66a18" stroke-width="6"/><path d="M430 45 C330 90 325 250 430 295" fill="none" stroke="#c66a18" stroke-width="6"/><path d="M70 300L450 40M70 40L450 300" stroke="#6d7682" stroke-width="2.5" stroke-dasharray="8 7"/><circle cx="190" cy="170" r="6" fill="#b33a3a"/><circle cx="330" cy="170" r="6" fill="#b33a3a"/>` + fin;
}

function svgCuadrica(tipo, nombre) {
  const start = `<svg viewBox="0 0 540 360" role="img" aria-label="Representación esquemática de ${nombre}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d9ecff"/><stop offset="1" stop-color="#8eb9e9"/></linearGradient><linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#eee9ff"/><stop offset="1" stop-color="#ac98e8"/></linearGradient></defs><rect width="540" height="360" rx="24" fill="#f8fbff"/><g stroke="#7f98b5" stroke-width="2"><path d="M70 285L465 285"/><path d="M270 330L270 40"/><path d="M110 325L430 75"/></g>`;
  const end = `<text x="468" y="278" fill="#264d7c">x</text><text x="282" y="50" fill="#264d7c">z</text><text x="418" y="84" fill="#264d7c">y</text></svg>`;
  const ell = (cy,rx,ry,fill='none',dash='') => `<ellipse cx="270" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="#1f4e8c" stroke-width="3" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;
  if (tipo==='esfera') return start + `<circle cx="270" cy="180" r="112" fill="url(#g)" opacity=".72" stroke="#1f4e8c" stroke-width="4"/>${ell(180,112,34,'none','8 7')}<ellipse cx="270" cy="180" rx="35" ry="112" fill="none" stroke="#1f4e8c" stroke-width="3" opacity=".8"/>` + end;
  if (tipo==='elipsoide') return start + `<ellipse cx="270" cy="180" rx="145" ry="100" fill="url(#g)" opacity=".72" stroke="#1f4e8c" stroke-width="4"/>${ell(180,145,35,'none','8 7')}<ellipse cx="270" cy="180" rx="45" ry="100" fill="none" stroke="#1f4e8c" stroke-width="3"/>` + end;
  if (tipo==='paraboloide-eliptico') return start + `<path d="M145 85 Q270 320 395 85 Q270 200 145 85Z" fill="url(#g)" opacity=".75" stroke="#1f4e8c" stroke-width="4"/>${ell(115,100,28)}${ell(170,72,20,'none','7 6')}<circle cx="270" cy="285" r="5" fill="#b33a3a"/>` + end;
  if (tipo==='paraboloide-hiperbolico') return start + `<path d="M105 105 Q270 270 435 105 Q270 160 105 105Z" fill="url(#v)" opacity=".72" stroke="#6d4fc2" stroke-width="4"/><path d="M150 285 Q270 130 390 285" fill="none" stroke="#c66a18" stroke-width="4"/><path d="M140 130 Q270 215 400 130" fill="none" stroke="#1f4e8c" stroke-width="4"/>` + end;
  if (tipo==='hiperboloide-una') return start + `<path d="M135 65 C220 120 220 240 135 295 C250 260 290 260 405 295 C320 240 320 120 405 65 C290 100 250 100 135 65Z" fill="url(#v)" opacity=".7" stroke="#6d4fc2" stroke-width="4"/>${ell(180,65,20)}${ell(90,110,30,'none','8 6')}${ell(270,110,30,'none','8 6')}` + end;
  if (tipo==='hiperboloide-dos') return start + `<path d="M155 70 C210 95 235 120 250 155 C225 150 185 130 155 70Z" fill="url(#g)" stroke="#1f4e8c" stroke-width="4"/><path d="M385 290 C330 265 305 240 290 205 C315 210 355 230 385 290Z" fill="url(#g)" stroke="#1f4e8c" stroke-width="4"/>${ell(105,70,20,'none','7 5')}${ell(255,70,20,'none','7 5')}` + end;
  if (tipo==='cono') return start + `<path d="M125 65L270 180L415 65Z" fill="url(#g)" opacity=".55" stroke="#1f4e8c" stroke-width="4"/><path d="M125 295L270 180L415 295Z" fill="url(#g)" opacity=".55" stroke="#1f4e8c" stroke-width="4"/>${ell(80,125,33,'none','7 5')}${ell(280,125,33,'none','7 5')}` + end;
  if (tipo==='cilindro-eliptico') return start + `<path d="M150 85V280M390 85V280" stroke="#1f4e8c" stroke-width="4"/>${ell(85,120,35,'url(#g)')}${ell(280,120,35,'url(#g)')}<path d="M150 85C160 130 160 235 150 280M390 85C380 130 380 235 390 280" fill="url(#g)" opacity=".5"/>` + end;
  if (tipo==='cilindro-hiperbolico') return start + `<path d="M95 90 C190 125 190 245 95 280M225 90 C130 125 130 245 225 280M315 90 C410 125 410 245 315 280M445 90 C350 125 350 245 445 280" fill="none" stroke="#c66a18" stroke-width="4"/><path d="M95 90L315 90M225 90L445 90M95 280L315 280M225 280L445 280" stroke="#7f98b5" stroke-width="2"/>` + end;
  if (tipo==='cilindro-parabolico') return start + `<path d="M120 80 Q270 175 120 280M260 80 Q410 175 260 280" fill="none" stroke="#6d4fc2" stroke-width="5"/><path d="M120 80L260 80M120 280L260 280" stroke="#7f98b5" stroke-width="3"/>` + end;
  return start + `<circle cx="210" cy="180" r="8" fill="#b33a3a"/><path d="M100 270L410 90M100 90L410 270" stroke="#6d4fc2" stroke-width="5" opacity=".8"/><text x="180" y="210" fill="#8d3030">punto / recta / planos</text>` + end;
}

/* --------------------------------------------------------------------------
   APERTURA DE MICROLECCIONES Y MICROACTIVIDADES
   -------------------------------------------------------------------------- */
function abrirMicroleccion(tema, tipo) {
  const contenedor = document.getElementById(tipo === 'conica' ? 'detalle-conica' : 'detalle-cuadrica');
  const svg = tipo === 'conica' ? svgConica(tema.visual, tema.nombre) : svgCuadrica(tema.visual, tema.nombre);
  const iframeAsy = tipo === 'conica' && tema.asy ? `
    <div class="visual-asy">
      <details>
        <summary>Explorar la visualización WebGL proporcionada</summary>
        <iframe src="${tema.asy}" title="Visualización WebGL de ${tema.nombre}" loading="lazy"></iframe>
        <p class="nota-corta">La visualización usa un recurso WebGL externo de Asymptote. La microlección y el gráfico SVG funcionan aunque no cargue.</p>
      </details>
    </div>` : '';
  contenedor.innerHTML = `
    <article class="microleccion" tabindex="-1">
      <header class="microleccion-cabecera">
        <p class="identificador">${tema.codigo}</p>
        <h3>${tema.nombre}</h3>
        <p>${tema.pregunta}</p>
      </header>
      <div class="microleccion-cuerpo">
        <div class="microleccion-grid">
          <div>
            <section class="panel-concepto">
              <h4>Idea geométrica</h4>
              <p>${tema.definicion}</p>
            </section>
            <section class="panel-concepto">
              <h4>Forma canónica</h4>
              ${tema.formulas.map(f => `<div class="formula-destacada">${f}</div>`).join('')}
            </section>
            <section class="panel-concepto">
              <h4>Claves para reconocerla</h4>
              <ul class="lista-claves">${tema.claves.map(c => `<li>${c}</li>`).join('')}</ul>
            </section>
            <section class="panel-concepto">
              <h4>Elementos o rasgos</h4>
              <p>${tema.elementos.join(' · ')}</p>
            </section>
          </div>
          <div>
            <div class="visual-matematica">${svg}</div>
            ${iframeAsy}
          </div>
        </div>
        <details class="ejemplo-desplegable">
          <summary>${tema.ejemplo.titulo}</summary>
          <div class="ejemplo-contenido">
            <p class="formula-destacada">${tema.ejemplo.enunciado}</p>
            <ol class="pasos-ejemplo">${tema.ejemplo.pasos.map(p => `<li>${p}</li>`).join('')}</ol>
            <p><strong>Conclusión:</strong> ${tema.ejemplo.conclusion}</p>
          </div>
        </details>
        <section class="microquiz" data-microquiz="${tipo}" data-tema="${tema.id}">
          <p class="identificador">Microactividad ${tema.codigo}</p>
          <h4>${tema.quiz.pregunta}</h4>
          <div class="opciones">${tema.quiz.opciones.map((o,i)=>`<button type="button" data-respuesta="${i}">${o}</button>`).join('')}</div>
          <p class="feedback-micro" aria-live="polite"></p>
        </section>
        <div class="grupo-botones centrado">
          <button type="button" class="boton secundario" data-ir="${tipo === 'conica' ? 'conicas' : 'cuadricas'}">Volver al mapa del nodo</button>
          <button type="button" class="boton primario" data-ir="taller">Probar el taller</button>
        </div>
      </div>
    </article>`;
  marcarVisitado(tema.codigo);
  procesarMathJax(contenedor);
  contenedor.querySelector('.microleccion').focus();
  contenedor.scrollIntoView({behavior:'smooth', block:'start'});
}

document.addEventListener('click', (evento) => {
  const respuesta = evento.target.closest('[data-respuesta]');
  if (!respuesta) return;
  const quiz = respuesta.closest('[data-microquiz]');
  const tipo = quiz.dataset.microquiz;
  const tema = (tipo === 'conica' ? conicas : cuadricas).find(t => t.id === quiz.dataset.tema);
  if (!tema) return;
  const indice = Number(respuesta.dataset.respuesta);
  quiz.querySelectorAll('[data-respuesta]').forEach((b,i) => {
    b.disabled = true;
    if (i === tema.quiz.correcta) b.classList.add('correcta');
    if (i === indice && i !== tema.quiz.correcta) b.classList.add('incorrecta');
  });
  const feedback = quiz.querySelector('.feedback-micro');
  feedback.innerHTML = indice === tema.quiz.correcta ? tema.quiz.bien : tema.quiz.mal;
  procesarMathJax(quiz);
});

/* Actividad simple del puente */
document.querySelectorAll('[data-quiz-simple="puente"] button').forEach((boton, indice) => {
  boton.addEventListener('click', () => {
    const correcto = indice === 1;
    document.querySelectorAll('[data-quiz-simple="puente"] button').forEach((b,i) => {
      b.disabled = true;
      if (i === 1) b.classList.add('correcta');
      if (i === indice && i !== 1) b.classList.add('incorrecta');
    });
    const devolucionPuente = document.getElementById('devolucion-puente');
    devolucionPuente.innerHTML = correcto
      ? String.raw`Correcto: la forma canónica permite leer de inmediato el centro, los semiejes y la orientación.`
      : String.raw`La forma canónica todavía no da una tangente cualquiera. Primero conviene leer centro, semiejes y orientación.`;
    procesarMathJax(document.getElementById('actividad-puente'));
    marcarVisitado('P-01');
  });
});

/* --------------------------------------------------------------------------
   PROGRESO
   -------------------------------------------------------------------------- */
function actualizarProgreso() {
  const visitados = progresoActual().visitados;
  const codigosTemas = [...conicas, ...cuadricas].map(t => t.codigo);
  const total = codigosTemas.length;
  const cantidad = codigosTemas.filter(c => visitados.includes(c)).length;
  document.getElementById('texto-progreso').textContent = `${cantidad} de ${total} temas`;
  document.getElementById('barra-progreso').style.width = `${total ? cantidad / total * 100 : 0}%`;
  document.getElementById('progreso-conicas').textContent = `${conicas.filter(t=>visitados.includes(t.codigo)).length}/4`;
  document.getElementById('progreso-cuadricas').textContent = `${cuadricas.filter(t=>visitados.includes(t.codigo)).length}/11`;
}
document.getElementById('reiniciar-progreso').addEventListener('click', () => {
  if (!confirm('¿Querés borrar el progreso de temas recorridos? La bitácora no se eliminará.')) return;
  borrarTexto(STORAGE.progreso);
  borrarTexto(STORAGE.actividad);
  actualizarProgreso();
  renderMapas();
});

/* --------------------------------------------------------------------------
   ACTIVIDAD INTEGRADORA DE TRES CASOS
   -------------------------------------------------------------------------- */
const enunciadoCaso = document.getElementById('enunciado-caso');
const opcionesCaso = document.getElementById('opciones-caso');
const feedbackCaso = document.getElementById('feedback-caso');
const botonSiguiente = document.getElementById('siguiente-caso');
function renderCasoIntegracion() {
  const caso = casosIntegracion[estado.casoActual];
  document.getElementById('codigo-caso').textContent = caso.codigo;
  document.getElementById('contador-caso').textContent = `${estado.casoActual + 1} de ${casosIntegracion.length}`;
  document.getElementById('titulo-caso-integracion').textContent = caso.titulo;
  enunciadoCaso.innerHTML = `<p>${caso.enunciado}</p>`;
  opcionesCaso.innerHTML = caso.opciones.map((o,i)=>`<button type="button" data-opcion-caso="${i}">${o}</button>`).join('');
  feedbackCaso.textContent = 'Elegí una opción y justificá mentalmente antes de leer la devolución.';
  feedbackCaso.className = 'feedback-caso';
  botonSiguiente.disabled = true;
  botonSiguiente.textContent = estado.casoActual === casosIntegracion.length - 1 ? 'Ver cierre' : 'Siguiente caso';
  procesarMathJax(document.querySelector('.actividad-integracion'));
}
opcionesCaso.addEventListener('click', (evento) => {
  const boton = evento.target.closest('[data-opcion-caso]');
  if (!boton) return;
  const caso = casosIntegracion[estado.casoActual];
  const elegida = Number(boton.dataset.opcionCaso);
  opcionesCaso.querySelectorAll('button').forEach((b,i) => {
    b.disabled = true;
    if (i === caso.correcta) b.classList.add('correcta');
    if (i === elegida && i !== caso.correcta) b.classList.add('incorrecta');
  });
  const acierto = elegida === caso.correcta;
  feedbackCaso.innerHTML = acierto ? caso.bien : caso.mal;
  procesarMathJax(document.querySelector('.actividad-integracion'));
  feedbackCaso.className = `feedback-caso ${acierto ? 'exito' : 'revisar'}`;
  estado.respuestasIntegracion[estado.casoActual] = {elegida, acierto};
  guardarJSON(STORAGE.actividad, estado.respuestasIntegracion);
  botonSiguiente.disabled = false;
  marcarVisitado(caso.codigo);
});
botonSiguiente.addEventListener('click', () => {
  if (estado.casoActual < casosIntegracion.length - 1) {
    estado.casoActual += 1;
    renderCasoIntegracion();
  } else {
    const aciertos = estado.respuestasIntegracion.filter(r => r && r.acierto).length;
    enunciadoCaso.innerHTML = `<p><strong>Recorrido completo.</strong> Resolviste correctamente ${aciertos} de ${casosIntegracion.length} casos en el primer intento guardado.</p><p>La meta no es solo acertar: revisá en la bitácora qué señal usaste y qué procedimiento elegirías en el TP.</p>`;
    opcionesCaso.innerHTML = '';
    feedbackCaso.className = 'feedback-caso exito';
    feedbackCaso.textContent = 'Podés reiniciar, volver a un nodo o exportar tu bitácora.';
    procesarMathJax(document.querySelector('.actividad-integracion'));
    botonSiguiente.disabled = true;
  }
});
document.getElementById('reiniciar-actividad').addEventListener('click', () => {
  estado.casoActual = 0;
  estado.respuestasIntegracion = [];
  borrarTexto(STORAGE.actividad);
  renderCasoIntegracion();
});

/* --------------------------------------------------------------------------
   BITÁCORA LOCAL POR IDENTIFICADOR
   -------------------------------------------------------------------------- */
const selectBitacora = document.getElementById('bitacora-caso');
const textoBitacora = document.getElementById('bitacora-texto');
const estadoBitacora = document.getElementById('estado-bitacora');
const todosIdentificadores = [
  {codigo:'P-01', nombre:'Puente algebraico'},
  ...conicas.map(t=>({codigo:t.codigo,nombre:t.nombre})),
  ...cuadricas.map(t=>({codigo:t.codigo,nombre:t.nombre})),
  ...casosIntegracion.map(t=>({codigo:t.codigo,nombre:t.titulo}))
];
function cargarOpcionesBitacora() {
  selectBitacora.innerHTML = todosIdentificadores.map(i=>`<option value="${i.codigo}">${i.codigo} · ${i.nombre}</option>`).join('');
  cargarEntradaSeleccionada();
}
function bitacoraActual() { return leerJSON(STORAGE.bitacora, {}); }
function cargarEntradaSeleccionada() {
  const datos = bitacoraActual();
  textoBitacora.value = datos[selectBitacora.value]?.texto || '';
  estadoBitacora.textContent = '';
}
selectBitacora.addEventListener('change', cargarEntradaSeleccionada);
document.getElementById('guardar-bitacora').addEventListener('click', () => {
  const datos = bitacoraActual();
  datos[selectBitacora.value] = {texto:textoBitacora.value.trim(), fecha:new Date().toLocaleString('es-AR')};
  guardarJSON(STORAGE.bitacora, datos);
  estadoBitacora.textContent = 'Entrada guardada en este dispositivo.';
  renderListaBitacora();
});
function renderListaBitacora() {
  const datos = bitacoraActual();
  const entradas = Object.entries(datos).filter(([,v])=>v.texto);
  const lista = document.getElementById('lista-bitacora');
  if (!entradas.length) { lista.innerHTML = '<p class="nota-corta">Todavía no hay entradas guardadas.</p>'; return; }
  lista.innerHTML = entradas.map(([codigo,v])=>`<article class="entrada-bitacora"><header><strong>${codigo}</strong><button type="button" data-borrar-entrada="${codigo}" aria-label="Borrar entrada ${codigo}">Eliminar</button></header><p>${escaparHTML(v.texto).replace(/\n/g,'<br>')}</p><small>${v.fecha}</small></article>`).join('');
}
function escaparHTML(texto) {
  return texto.replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
document.getElementById('lista-bitacora').addEventListener('click', (evento) => {
  const boton = evento.target.closest('[data-borrar-entrada]');
  if (!boton) return;
  const datos = bitacoraActual();
  delete datos[boton.dataset.borrarEntrada];
  guardarJSON(STORAGE.bitacora, datos);
  if (selectBitacora.value === boton.dataset.borrarEntrada) textoBitacora.value = '';
  renderListaBitacora();
});
document.getElementById('exportar-bitacora').addEventListener('click', () => {
  const datos = bitacoraActual();
  const contenido = ['BITÁCORA · CÓNICAS Y SUPERFICIES CUÁDRICAS',''].concat(
    todosIdentificadores.filter(i=>datos[i.codigo]?.texto).map(i=>`${i.codigo} · ${i.nombre}\n${datos[i.codigo].texto}\nGuardado: ${datos[i.codigo].fecha}\n`)
  ).join('\n');
  const blob = new Blob([contenido], {type:'text/plain;charset=utf-8'});
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(blob);
  enlace.download = 'bitacora-conicas-cuadricas.txt';
  enlace.click();
  URL.revokeObjectURL(enlace.href);
});

/* --------------------------------------------------------------------------
   AUDIO, PREGUNTAS Y YOUTUBE
   -------------------------------------------------------------------------- */
const reproductor = document.getElementById('audio-pausa');
function renderAudios() {
  document.getElementById('lista-audios').innerHTML = audios.map((a,i)=>`<button type="button" data-audio="${i}">${a.titulo}</button>`).join('');
  seleccionarAudio(0);
}
function seleccionarAudio(indice) {
  reproductor.src = audios[indice].archivo;
  document.querySelectorAll('[data-audio]').forEach((b,i)=>b.classList.toggle('activo', i===indice));
}
document.getElementById('lista-audios').addEventListener('click', evento => {
  const boton = evento.target.closest('[data-audio]');
  if (!boton) return;
  seleccionarAudio(Number(boton.dataset.audio));
  reproductor.play().catch(()=>{});
});
let preguntaActual = 0;
document.getElementById('cambiar-pregunta').addEventListener('click', () => {
  preguntaActual = (preguntaActual + 1) % preguntasPausa.length;
  document.getElementById('texto-pregunta-pausa').textContent = preguntasPausa[preguntaActual];
});
let youtubeActual = 0;
function renderYoutube() {
  const video = youtubeVideos[youtubeActual];
  document.getElementById('youtube-titulo').textContent = video.titulo;
  document.getElementById('youtube-descripcion').textContent = video.descripcion;
  document.getElementById('youtube-iframe').src = `https://www.youtube-nocookie.com/embed/${video.id}`;
  const enlace = document.getElementById('youtube-enlace');
  enlace.href = `https://www.youtube.com/watch?v=${video.id}`;
}
document.getElementById('youtube-siguiente').addEventListener('click', () => { youtubeActual = (youtubeActual + 1) % youtubeVideos.length; renderYoutube(); });
document.getElementById('youtube-anterior').addEventListener('click', () => { youtubeActual = (youtubeActual - 1 + youtubeVideos.length) % youtubeVideos.length; renderYoutube(); });

/* --------------------------------------------------------------------------
   INICIALIZACIÓN
   -------------------------------------------------------------------------- */
function iniciar() {
  renderMapas();
  actualizarProgreso();
  actualizarEstadoBloqueo();
  cargarOpcionesBitacora();
  renderListaBitacora();
  renderCasoIntegracion();
  renderAudios();
  renderYoutube();
  const hash = location.hash.replace('#','');
  const permitidos = ['inicio','proposito','mapa','puente','conicas','cuadricas','taller','audiovisual','bibliografia'];
  if (hash && permitidos.includes(hash)) mostrarPantalla(hash);
  procesarMathJax(document.body);
}

iniciar();
