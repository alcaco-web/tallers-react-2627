# Fitxa 05 — `localStorage` i persistència

> **Objectiu general:** conservar les tasques i el filtre entre recàrregues de pàgina, aprofitant els providers de la Fitxa 04 i aprenent a llegir, validar i desar dades amb `localStorage`.

- **Temps estimat total:** 3 hores (2 h 30 min a classe; 15 min de lectura prèvia i 15 min de treball posterior).
- **Requisits previs:** haver completat la [Fitxa 04](Fitxa04.md) o tenir un `hola-mon` equivalent amb `TasquesProvider`, `FiltreTasquesProvider`, els hooks `useTasques` i `useFiltreTasques`, i la llista de tasques funcionant.
- **Projecte:** **no en crees un de nou**. Treballes dins de `hola-mon`.
- **Abans de classe (15 min):** llegeix els apartats 1.2–1.5 sobre `localStorage`, JSON, inicialitzador mandrós i `useEffect`.
- **Versions utilitzades:** React 19.3.1, Vite 8.3.4 i Tailwind CSS 4.3.3.

> **Projecte acumulatiu:** la Fitxa 05 no canvia l'arquitectura de components de la Fitxa 04. Afegeix una capa de persistència dins dels providers. En acabar, les tasques i el filtre sobreviuran a una recàrrega, però els comptadors i la llista filtrada continuaran calculant-se a partir de l'estat.

## Continguts

1. Teoria
   - On som i què construirem
   - Què és `localStorage`
   - `JSON.stringify()` i `JSON.parse()`
   - Inicialitzador mandrós de `useState`
   - `useEffect`: executar codi després del render
   - Claus, validació i errors
   - Estat font i estat derivat
   - Un hook personalitzat: `useLocalStorage`
   - Estructura final
2. Activitat 1 — Desar i recuperar les tasques
3. Activitat 2 — Desar el filtre
4. Activitat 3 — `useLocalStorage` i persistència robusta
5. Criteris de comprovació
6. Continua el projecte
7. Recursos

---

## 1. Teoria

> **Com llegir aquesta teoria:** els fragments de codi i les comandes són exemples de referència, no passos que cal executar o copiar automàticament. Fes canvis i proves quan un esglaó de les activitats t'ho demani; si hi remet, adapta-hi l'exemple al teu projecte.

### 1.1 On som i què construirem

A la [Fitxa 04](Fitxa04.md) has deixat l'aplicació així:

```text
main.jsx
└── TasquesProvider
    └── FiltreTasquesProvider
        └── App
            ├── Comptador
            ├── FormulariTasca
            ├── FiltreTasques
            └── LlistaTasques
                └── Tasca
```

- `TasquesProvider` guarda `tasques` i les accions.
- `FiltreTasquesProvider` guarda `filtre` i l'estat derivat.
- `App` només consumeix els comptadors.
- `Tasca` només rep la prop `tasca`.

El problema ara és que, si recarregues la pàgina, tot torna a l'estat inicial:

```jsx
const [tasques, setTasques] = useState([])
const [filtre, setFiltre] = useState('totes')
```

En aquesta fitxa farem que aquests dos estats es guardin al navegador i es recuperin en tornar a obrir l'aplicació:

```text
main.jsx
└── TasquesProvider          ← llegeix/desa hola-mon.tasques
    └── FiltreTasquesProvider ← llegeix/desa hola-mon.filtre
        └── App
```

No persistirem:

- `tasquesFiltrades`;
- `pendents` ni `fetes`;
- `missatgeBuit`;
- el comptador de la part superior.

Aquestes dades es poden tornar a calcular o són una demo local. Guardar-les duplicaria informació i podria provocar incoherències.

### 1.2 Què és `localStorage`

`localStorage` és una API del navegador que guarda parells clau-valor **en format de text**.

```js
localStorage.setItem('hola-mon.tasques', '[]')
const valor = localStorage.getItem('hola-mon.tasques')
localStorage.removeItem('hola-mon.tasques')
```

Característiques:

- Les dades es guarden per origen: `http://localhost:5173` té el seu propi `localStorage`.
- Sobrevviuen a recàrregues i a tancar el navegador.
- Les operacions són **síncrones**.
- Només guarden strings.
- Solen tenir un límit d'uns 5 MB per origen.
- **No** són un lloc adequat per a contrasenyes, tokens ni dades sensibles.

Pots veure les dades a les eines de desenvolupament del navegador:

```text
Application → Storage → Local Storage → http://localhost:5173
```

> **Important:** `localStorage` només existeix al navegador. A React en executació al client no hi ha problema, però no l'has de fer servir en un entorn de servidor sense comprovar que `window` existeix.

### 1.3 `JSON.stringify()` i `JSON.parse()`

Com que `localStorage` només guarda strings, un array o un objecte s'ha de serialitzar:

```js
const tasques = [{ id: '1', text: 'Repassar', feta: false }]

const text = JSON.stringify(tasques)
// '[{"id":"1","text":"Repassar","feta":false}]'

const recuperades = JSON.parse(text)
// [{ id: '1', text: 'Repassar', feta: false }]
```

`JSON.stringify()` converteix un valor de JavaScript en text JSON. `JSON.parse()` fa el camí invers.

Si el text guardat no és JSON vàlid, `JSON.parse()` llança un error. Per això, a l'Activitat 3 afegirem `try/catch` i validació.

### 1.4 Inicialitzador mandrós de `useState`

Per evitar llegir `localStorage` a cada render, passa una **funció** a `useState`:

```jsx
const [tasques, setTasques] = useState(llegeixTasques)
```

No facis això:

```jsx
const [tasques, setTasques] = useState(llegeixTasques())
```

La segona versió crida `llegeixTasques()` a **cada render**, encara que React només faci servir el valor la primera vegada. La primera versió és un **inicialitzador mandrós**: normalment React la crida per calcular l'estat inicial, no a cada render. Amb `StrictMode`, en desenvolupament pot cridar-la dues vegades per comprovar que és pura. Llegir `localStorage` no modifica res, així que és segur.

També pots fer servir una arrow:

```jsx
const [tasques, setTasques] = useState(() => {
  const guardades = localStorage.getItem('hola-mon.tasques')
  return guardades ? JSON.parse(guardades) : []
})
```

### 1.5 `useEffect`: executar codi després del render

Fins ara, quan canviava un estat, React tornava a executar el component i calculava el JSX. Això és el **render**. Però desar a `localStorage` no és calcular la interfície: és un **efecte secundari**. `useEffect` serveix per executar codi després que React hagi pintat el resultat.

#### 1.5.1 Per què no n'hi ha prou amb el render

No posis `localStorage.setItem()` directament al cos del component:

```jsx
function TasquesProvider({ children }) {
  const [tasques, setTasques] = useState([])

  // Malament: efecte secundari dins del render
  localStorage.setItem(CLAU_TASQUES, JSON.stringify(tasques))

  return ...
}
```

Aquest codi s'executaria a cada render, encara que no hagués canviat res. A més, el render hauria de ser una funció pura: rebre dades i retornar JSX, sense modificar el món exterior.

`useEffect` separa les dues coses:

- **Render:** calcula què s'ha de mostrar.
- **Efecte:** sincronitza l'estat amb alguna cosa externa: `localStorage`, el DOM, una API, un temporitzador...

#### 1.5.2 Anatomia

```jsx
useEffect(() => {
  // codi de l'efecte
  return () => {
    // neteja opcional
  }
}, [dependències])
```

- La funció de l'efecte s'executa **després** del render.
- L'array de dependències decideix **quan** es torna a executar.
- La funció pot retornar una **funció de neteja**; nosaltres no en necessitem per a `localStorage`.
- L'efecte no retorna cap valor de l'estat. Si retornes una cosa que no sigui una funció o `undefined`, React avisa.
- S'ha de cridar sempre al nivell superior del component, no dins d'un `if` ni d'un bucle.

#### 1.5.3 Quan s'executa

| Dependències | Quan s'executa | Exemple |
| --- | --- | --- |
| `[tasques]` | després del primer render i cada vegada que canvia la referència de `tasques` | desar les tasques |
| `[]` | després del muntatge inicial; pot repetir-se a `StrictMode` en desenvolupament | sincronitzar en muntar |
| sense array | després de cada render | casos molt concrets |
| `[a, b]` | després del primer render i si canvia `a`, `b` o tots dos | sincronitzar dues dades |

React compara les dependències amb `Object.is`. En arrays i objectes, la comparació és **per referència**: un array nou amb el mateix contingut es considera diferent. Per això, quan fem `setTasques((anteriors) => [...anteriors, nova])`, `tasques` és una referència nova i l'efecte s'executa.

```text
Render inicial: tasques = []
        ↓
useEffect → setItem('hola-mon.tasques', '[]')
        ↓
Afegeixes una tasca → setTasques(...)
        ↓
Render: tasques = [nova]
        ↓
useEffect → setItem('hola-mon.tasques', '[{...}]')
        ↓
Canvies el comptador → App re-renderitza
        ↓
TasquesProvider no canvia `tasques`
        ↓
useEffect NO s'executa
```

Aquesta última línia és la clau: **no qualsevol render executa l'efecte**. Només s'executa si el component que el conté es torna a renderitzar i una dependència ha canviat. En el nostre cas, l'efecte viu a `TasquesProvider`; canviar el comptador no el torna a renderitzar.

#### 1.5.4 Lectura, escriptura i estat derivat

| Operació | Eina | Moment |
| --- | --- | --- |
| Llegir l'estat inicial | `useState(() => ...)` | durant el primer render |
| Escriure quan canvia | `useEffect(..., [dada])` | després del render |
| Calcular un valor derivat | codi normal al render | durant el render |

No llegeixis `localStorage` dins de l'efecte per inicialitzar l'estat. Ho faries després del primer render, quan ja has pintat una llista buida. A més, l'efecte podria tornar a desar aquesta llista buida i trepitjar les dades guardades.

Tampoc no facis servir un efecte per calcular `tasquesFiltrades` o els comptadors. Aquests valors es poden calcular directament durant el render a partir de `tasques` i `filtre`; guardar-los en estat o en efectes crea una segona font de veritat.

#### 1.5.5 StrictMode i la doble execució

Amb `<StrictMode>`, React pot muntar, desmuntar i tornar a muntar els components en desenvolupament, i pot executar els efectes dues vegades. No és un error: serveix per detectar efectes que no són idempotents o que no netegen bé.

El nostre efecte fa `setItem` amb el mateix valor. Executar-lo dues vegades no canvia el resultat, així que és segur.

En canvi, un efecte que afegeix una tasca o incrementa un comptador sí que podria duplicar feina. La regla és: **un efecte ha de sincronitzar, no crear dades de domini**.

#### 1.5.6 Errors típics

- **Poses `[]` quan necessites `[tasques]`:** l'efecte només s'executa en muntar; les tasques noves no es desen i l'efecte pot treballar amb un valor antic.
- **No poses array:** l'efecte s'executa a cada render; pot ser molt costós o entrar en bucle.
- **Dependència que és un objecte o array creat al render:** canvia de referència a cada render i l'efecte s'executa sempre.
- **Efecte per calcular estat derivat:** provoca renders extra i pot duplicar dades.
- **Efecte per llegir la inicialització:** produeix un primer render buit i pot trepitjar `localStorage`.
- **`setState` incondicional dins de l'efecte:** pot crear un bucle infinit de renders.
- **Funció `async` directament com a callback:** retorna una Promise, no una funció de neteja; si cal, defineix una funció `async` a dins i crida-la.

#### 1.5.7 Regla pràctica

> **Llegeix amb `useState`, deriva al render i desa amb `useEffect`.** Si no has de sincronitzar res amb l'exterior, probablement no necessites cap efecte.

### 1.6 Claus, validació i errors

Fes servir claus amb un prefix clar del projecte:

```js
const CLAU_TASQUES = 'hola-mon.tasques'
const CLAU_FILTRE = 'hola-mon.filtre'
```

Així evites barrejar dades amb altres aplicacions del mateix origen.

Les dades de `localStorage` **no són de confiança**:

- poden ser d'una versió antiga de l'aplicació;
- poden haver estat editades manualment;
- poden estar corruptes;
- el navegador pot bloquejar l'accés o quedar-se sense espai.

Per això, a l'Activitat 3:

- embolcallarem la lectura i l'escriptura amb `try/catch`;
- validarem l'estructura de les tasques;
- validarem que el filtre sigui un dels valors permesos;
- si alguna cosa falla, tornarem a l'estat inicial.

Un validador de tasques pot ser:

```js
function esTascaValida(tasca) {
  return (
    tasca !== null &&
    typeof tasca === 'object' &&
    typeof tasca.id === 'string' &&
    typeof tasca.text === 'string' &&
    typeof tasca.feta === 'boolean'
  )
}

function esLlistaDeTasques(valor) {
  return Array.isArray(valor) && valor.every(esTascaValida)
}
```

> **Nota:** validar no és el mateix que confiar. Encara que les dades les hagi escrit la teva pròpia aplicació, poden venir d'una versió anterior o d'una manipulació manual.

### 1.7 Estat font i estat derivat

| Dada | Es persisteix? | Per què |
| --- | --- | --- |
| `tasques` | Sí | És l'estat font de la llista. |
| `filtre` | Sí | És l'estat font del filtre actiu. |
| `tasquesFiltrades` | No | Es calcula a partir de `tasques` i `filtre`. |
| `pendents` i `fetes` | No | Es calculen a partir de `tasques`. |
| `missatgeBuit` | No | Depèn de `tasques` i `filtre`. |
| Comptador | No | És una demo local independent. |

Persistir estat derivat sembla còmode, però crea dues fonts de veritat. Si les dades derivades no es recalculen bé, la interfície mostra informació incoherent. La regla és clara: **guarda l'estat font i recalcula la resta**.

### 1.8 Un hook personalitzat: `useLocalStorage`

A l'Activitat 3 extraurem la lògica comuna en un hook:

```js
import { useEffect, useState } from 'react'

function llegeixValor(clau, valorInicial, esValid) {
  try {
    const guardat = localStorage.getItem(clau)

    if (!guardat) return valorInicial

    const dades = JSON.parse(guardat)
    return esValid(dades) ? dades : valorInicial
  } catch {
    return valorInicial
  }
}

export function useLocalStorage(clau, valorInicial, esValid = () => true) {
  const [valor, setValor] = useState(() =>
    llegeixValor(clau, valorInicial, esValid),
  )

  useEffect(() => {
    try {
      localStorage.setItem(clau, JSON.stringify(valor))
    } catch {
      // Si l'emmagatzematge falla, l'aplicació continua funcionant en memòria.
    }
  }, [clau, valor])

  return [valor, setValor]
}
```

S'utilitza igual que `useState`:

```jsx
const [tasques, setTasques] = useLocalStorage(
  CLAU_TASQUES,
  TASQUES_INICIALS,
  esLlistaDeTasques,
)

const [filtre, setFiltre] = useLocalStorage(
  CLAU_FILTRE,
  'totes',
  esFiltreValid,
)
```

El hook retorna un array de dos elements: el valor i la funció per actualitzar-lo. Per això el podem desestructurar com `useState`.

En aquest projecte cada provider fa servir una clau fixa. Si canvies `clau` mentre el component continua muntat, el hook desa el valor actual sota la nova clau, però no torna a llegir-ne automàticament el valor guardat. Per migrar dades o canviar de clau, cal una estratègia explícita.

> **Nota:** el hook desa el valor inicial al primer render. És correcte i fa que la clau existeixi encara que l'usuari no hagi canviat res.

### 1.9 Estructura final

```text
src/
├── context/
│   ├── FiltreTasquesContext.js
│   ├── FiltreTasquesProvider.jsx
│   ├── TasquesContext.js
│   └── TasquesProvider.jsx
├── hooks/
│   └── useLocalStorage.js
├── components/
│   ├── Boto.jsx
│   ├── Comptador.jsx
│   ├── FiltreTasques.jsx
│   ├── FormulariTasca.jsx
│   ├── LlistaTasques.jsx
│   ├── Missatge.jsx
│   ├── Targeta.jsx
│   └── Tasca.jsx
├── App.jsx
├── index.css
└── main.jsx
```

Responsabilitats:

| Fitxer | Responsabilitat |
| --- | --- |
| `useLocalStorage` | Llegir, validar i desar un valor. |
| `TasquesProvider` | Gestionar les tasques i usar la clau `hola-mon.tasques`. |
| `FiltreTasquesProvider` | Gestionar el filtre i usar la clau `hola-mon.filtre`. |
| `App` i components | Renderitzar; no toquen `localStorage` directament. |

---

## 2. Activitat 1 — Desar i recuperar les tasques

**Objectiu:** fer que `TasquesProvider` llegeixi les tasques guardades i les desi quan canviïn.

**Temps estimat:** 45 minuts.

**Punt de partida:** el projecte `hola-mon` de la Fitxa 04, amb els dos providers i els contextos funcionant.

### Esglaó 1 — Definir la clau i la lectura inicial

1. A `src/context/TasquesProvider.jsx`, importa `useEffect` a més de `useState`.
2. Defineix la constant `CLAU_TASQUES` amb el valor `hola-mon.tasques`.
3. Crea la funció `llegeixTasques`:
   - llegeix la clau amb `localStorage.getItem`;
   - si no hi ha res, retorna `[]`;
   - si hi ha text, el parseja amb `JSON.parse`;
   - si el resultat no és un array, retorna `[]`.

```js
const CLAU_TASQUES = 'hola-mon.tasques'

function llegeixTasques() {
  const guardades = localStorage.getItem(CLAU_TASQUES)

  if (!guardades) return []

  const dades = JSON.parse(guardades)
  return Array.isArray(dades) ? dades : []
}
```

**Comprovació:** el fitxer compila i `llegeixTasques` retorna un array.

### Esglaó 2 — Fer servir l'inicialitzador mandrós

Canvia:

```jsx
const [tasques, setTasques] = useState([])
```

per:

```jsx
const [tasques, setTasques] = useState(llegeixTasques)
```

No posis `llegeixTasques()` amb parèntesis: això executaria la lectura a cada render.

**Comprovació:** en recarregar, l'estat inicial ha de sortir de `localStorage` si hi ha dades.

### Esglaó 3 — Desar quan canviï la llista

Afegeix aquest efecte dins de `TasquesProvider`:

```jsx
useEffect(() => {
  localStorage.setItem(CLAU_TASQUES, JSON.stringify(tasques))
}, [tasques])
```

L'efecte s'executa després de cada canvi de `tasques`: afegir, completar o eliminar. **No** s'executa en canviar el comptador o el filtre, perquè no canvia la referència de `tasques`.

**Comprovació:** obre **Application → Local Storage** i comprova que `hola-mon.tasques` conté un array JSON.

### Esglaó 4 — Provar la persistència

1. Afegeix una tasca.
2. Recarrega la pàgina.
3. La tasca ha de continuar.
4. Marca-la com a feta i recarrega: l'estat s'ha de conservar.
5. Elimina-la i recarrega: no ha de tornar.
6. Esborra la clau `hola-mon.tasques` i recarrega: la llista ha de tornar a estar buida.

**Comprovació:** les tasques sobreviuen a la recàrrega i la clau es pot inspeccionar.

### Esglaó 5 — Comprovar les dependències

- Afegeix temporalment aquest log dins de l'efecte:
  ```jsx
  console.log('Efecte: deso les tasques', tasques)
  ```
- Afegeix una tasca: el log ha d'aparèixer.
- Canvia el comptador: el log **no** ha d'aparèixer.
- Canvia el filtre: el log **no** ha d'aparèixer.
- Elimina el `console.log` en acabar.

**Comprovació:** entens que l'efecte depèn de `tasques`, no de qualsevol render. Canviar el comptador o el filtre no canvia la referència de `tasques`; per tant, l'efecte no s'executa.

---

## 3. Activitat 2 — Desar el filtre

**Objectiu:** conservar el filtre actiu (`totes`, `pendents` o `fetes`) entre recàrregues.

**Temps estimat:** 35 minuts.

### Esglaó 1 — Definir la clau i els valors permesos

A `src/context/FiltreTasquesProvider.jsx`:

1. Importa `useEffect` a més de `useState`.
2. Defineix `CLAU_FILTRE` amb `hola-mon.filtre`.
3. Defineix `FILTRES_VALIDS` amb `['totes', 'pendents', 'fetes']`.

```js
const CLAU_FILTRE = 'hola-mon.filtre'
const FILTRES_VALIDS = ['totes', 'pendents', 'fetes']
```

**Comprovació:** els tres valors coincideixen amb els botons de `FiltreTasques`.

### Esglaó 2 — Llegir el filtre amb validació

Crea `llegeixFiltre`:

```js
function llegeixFiltre() {
  const guardat = localStorage.getItem(CLAU_FILTRE)

  if (!guardat) return 'totes'

  const valor = JSON.parse(guardat)
  return FILTRES_VALIDS.includes(valor) ? valor : 'totes'
}
```

Si el valor guardat no és cap dels permesos, torna a `totes`. Això evita que un filtre inventat deixi la llista en un estat estrany.

**Comprovació:** `llegeixFiltre` retorna sempre un valor vàlid.

> En aquesta activitat encara no gestionem el cas que el text desat no sigui JSON vàlid: `JSON.parse` pot fallar. Ho farem robust a l'Activitat 3; si vols provar-ho ara, torna després el valor a un JSON correcte.

### Esglaó 3 — Usar l'inicialitzador mandrós i desar

Canvia:

```jsx
const [filtre, setFiltre] = useState('totes')
```

per:

```jsx
const [filtre, setFiltre] = useState(llegeixFiltre)
```

I afegeix:

```jsx
useEffect(() => {
  localStorage.setItem(CLAU_FILTRE, JSON.stringify(filtre))
}, [filtre])
```

**Comprovació:** la clau `hola-mon.filtre` conté el valor actiu.

### Esglaó 4 — Provar el filtre

1. Tria «Pendents».
2. Recarrega: el filtre ha de continuar actiu.
3. Tria «Fetes» i recarrega: també s'ha de conservar.
4. A **Application → Local Storage**, canvia el valor per `"inventat"` i recarrega: ha de tornar a «Totes».
5. Comprova que els comptadors no es guarden: canvien segons les tasques, no segons el filtre.

**Comprovació:** el filtre és persistent i l'estat derivat es recalcula.

### Esglaó 5 — Repte: separar les responsabilitats

- Comprova que `FiltreTasques` no toca `localStorage`.
- Comprova que `LlistaTasques` tampoc.
- La lectura i l'escriptura han de viure només al provider.

**Comprovació:** els components presentacionals continuen rebent o consumint dades, sense conèixer la persistència.

---

## 4. Activitat 3 — `useLocalStorage` i persistència robusta

**Objectiu:** extreure la lògica comuna en un hook, validar les dades i evitar errors amb JSON corrupte o `localStorage` no disponible.

**Temps estimat:** 35 minuts a classe i 15 minuts de treball posterior.

### Esglaó 1 — Crear el hook

1. Crea la carpeta `src/hooks/`.
2. Crea `src/hooks/useLocalStorage.js`.
3. Importa `useEffect` i `useState`.
4. Exporta `useLocalStorage(clau, valorInicial, esValid)`.
5. A dins:
   - inicialitza l'estat amb una funció que llegeixi i validi;
   - desa amb `useEffect`;
   - retorna `[valor, setValor]`.

```js
export function useLocalStorage(clau, valorInicial, esValid = () => true) {
  const [valor, setValor] = useState(() => {
    try {
      const guardat = localStorage.getItem(clau)

      if (!guardat) return valorInicial

      const dades = JSON.parse(guardat)
      return esValid(dades) ? dades : valorInicial
    } catch {
      return valorInicial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(clau, JSON.stringify(valor))
    } catch {
      // L'aplicació continua funcionant en memòria.
    }
  }, [clau, valor])

  return [valor, setValor]
}
```

**Comprovació:** el hook compila i no conté JSX.

### Esglaó 2 — Validar les tasques

A `TasquesProvider`:

1. Importa `useLocalStorage`.
2. Defineix `esTascaValida` i `esLlistaDeTasques`.
3. Substitueix `useState` i l'efecte pel hook.

```jsx
function esTascaValida(tasca) {
  return (
    tasca !== null &&
    typeof tasca === 'object' &&
    typeof tasca.id === 'string' &&
    typeof tasca.text === 'string' &&
    typeof tasca.feta === 'boolean'
  )
}

function esLlistaDeTasques(valor) {
  return Array.isArray(valor) && valor.every(esTascaValida)
}

const [tasques, setTasques] = useLocalStorage(
  CLAU_TASQUES,
  TASQUES_INICIALS,
  esLlistaDeTasques,
)
```

**Comprovació:** una llista amb una tasca sense `id`, amb `text` numèric o amb `feta` no booleana es rebutja.

### Esglaó 3 — Validar el filtre

A `FiltreTasquesProvider`:

```jsx
function esFiltreValid(valor) {
  return FILTRES_VALIDS.includes(valor)
}

const [filtre, setFiltre] = useLocalStorage(
  CLAU_FILTRE,
  'totes',
  esFiltreValid,
)
```

Elimina l'antic `useState` i l'antic `useEffect`.

**Comprovació:** el filtre es llegeix i es desa amb el mateix hook que les tasques.

### Esglaó 4 — Treball posterior: provar dades corruptes

Fes aquestes proves després de classe, quan el hook i els validadors ja funcionin:

1. A **Application → Local Storage**, posa a `hola-mon.tasques` el text `això no és JSON`.
2. Recarrega: l'aplicació no ha de trencar-se; ha de començar amb la llista buida.
3. Torna a provar amb `[{"id":1,"text":"Prova","feta":false}]`: `id` no és string, així que s'ha de rebutjar.
4. Prova una tasca vàlida i comprova que es recupera.
5. Fes el mateix amb el filtre i un valor inventat.

**Comprovació:** la interfície continua funcionant i les dades invàlides es descarten.

### Esglaó 5 — Reptes opcionals

- **Reiniciar dades:** afegeix una acció `reiniciaTasques` al `TasquesProvider` que posi `[]` i un botó a la targeta de tasques. El mateix efecte del hook tornarà a desar la llista buida.
- **Sincronització entre pestanyes:** escolta l'esdeveniment `storage` de `window` per actualitzar l'estat quan una altra pestanya canvia les dades.
- **Versionar la clau:** canvia `hola-mon.tasques` per `hola-mon.tasques.v1` per poder evolucionar el format sense barrejar dades antigues.

Aquests reptes són ampliacions. La solució base no els inclou.

---

## 5. Criteris de comprovació

Marca cada criteri quan el compleixis:

- [ ] Has continuat dins del projecte `hola-mon`; no n'has creat un de nou.
- [ ] `TasquesProvider` llegeix les tasques de `hola-mon.tasques`.
- [ ] La lectura es fa amb un inicialitzador mandrós: `useState(llegeixTasques)`.
- [ ] Sé distingir la lectura inicial (`useState`) de l'escriptura (`useEffect`).
- [ ] Les tasques es desen amb `JSON.stringify()` dins d'un `useEffect` amb dependència `[tasques]`.
- [ ] Entenc per què l'efecte no s'executa en canviar el comptador o el filtre.
- [ ] Les tasques sobreviuen a una recàrrega.
- [ ] `FiltreTasquesProvider` llegeix el filtre de `hola-mon.filtre`.
- [ ] El filtre només accepta `totes`, `pendents` i `fetes`.
- [ ] El filtre sobreviu a una recàrrega.
- [ ] `useLocalStorage` existeix a `src/hooks/`.
- [ ] Els dos providers utilitzen `useLocalStorage`.
- [ ] La lectura i l'escriptura capturen errors amb `try/catch`.
- [ ] Les tasques guardades es validen (id string, text string, feta boolean).
- [ ] `tasquesFiltrades`, `pendents`, `fetes` i `missatgeBuit` **no** es persisteixen.
- [ ] El comptador de la part superior continua sense persistència.
- [ ] `App`, `FiltreTasques` i `LlistaTasques` no toquen `localStorage` directament.
- [ ] La consola no mostra errors ni avisos de `key`.
- [ ] Tailwind continua funcionant.

**Comprovacions per al treball posterior:** el JSON corrupte no trenca l'aplicació i un filtre invàlid torna a `totes`.

---

## 6. Continua el projecte

Guarda el projecte `hola-mon`. A la [Fitxa 06](Fitxa06.md) treballarem React Router per separar pantalles, compartir un layout i obrir el detall d'una tasca sense perdre la persistència que acabes d'afegir.

No cal tornar a executar `npm create vite` ni canviar els providers: `localStorage` ja forma part de l'estat de l'aplicació.

---

## 7. Recursos

- `localStorage`: <https://developer.mozilla.org/ca/docs/Web/API/Window/localStorage>
- `JSON.stringify()`: <https://developer.mozilla.org/ca/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify>
- `JSON.parse()`: <https://developer.mozilla.org/ca/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse>
- `useState` i inicialitzador mandrós: <https://react.dev/reference/react/useState#avoiding-recreating-the-initial-state>
- `useEffect`: <https://react.dev/reference/react/useEffect>
- Hooks personalitzats: <https://react.dev/learn/reusing-logic-with-custom-hooks>
- Esdeveniment `storage`: <https://developer.mozilla.org/ca/docs/Web/API/Window/storage_event>
- Privacitat i `localStorage`: <https://developer.mozilla.org/ca/docs/Web/API/Web_Storage_API>
