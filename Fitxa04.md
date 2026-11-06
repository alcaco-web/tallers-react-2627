# Fitxa 04 — `useContext` i estat compartit

> **Objectiu general:** continuar el projecte `hola-mon` de la Fitxa 03, eliminar el prop drilling de les tasques amb `useContext`, crear providers i hooks personalitzats, i separar el context de tasques del context de filtres.

- **Temps estimat total:** 3 hores (2 h 30 min a classe; 15 min de lectura prèvia i 15 min de treball posterior).
- **Requisits previs:** haver completat la [Fitxa 03](Fitxa03.md) o tenir un `hola-mon` equivalent amb les tasques, el formulari, els filtres i els comptadors funcionant.
- **Projecte:** **no en crees un de nou**. Treballes dins de `hola-mon`.
- **Abans de classe (15 min):** llegeix els apartats 1.1–1.3 sobre prop drilling, `createContext` i `useContext`.
- **Versions utilitzades:** React 19.3.1, Vite 8.3.4 i Tailwind CSS 4.3.3.

> **Projecte acumulatiu:** cada fitxa afegeix una capa al mateix projecte. En acabar aquesta, el comptador continuarà funcionant, el formulari i la llista de tasques consumiran el context, i els filtres tindran el seu propi provider.

## Continguts

1. Teoria
   - On som i què construirem
   - Prop drilling: el problema
   - `createContext`, `Provider` i `useContext`
   - Un hook personalitzat: `useTasques`
   - Què ha d'anar al context (i què no)
   - Dos contexts i composició de providers
   - Estructura final i contracte
2. Activitat 1 — Crear `TasquesContext` i el provider
3. Activitat 2 — Consumir el context i eliminar prop drilling
4. Activitat 3 — `FiltreTasquesContext` i composició de providers
5. Criteris de comprovació
6. Continua el projecte
7. Recursos

---

## 1. Teoria

> **Com llegir aquesta teoria:** els fragments de codi i les comandes són exemples de referència, no passos que cal executar o copiar automàticament. Fes canvis i proves quan un esglaó de les activitats t'ho demani; si hi remet, adapta-hi l'exemple al teu projecte.

### 1.1 On som i què construirem

A la [Fitxa 03](Fitxa03.md) has acabat una aplicació de tasques dins de `hola-mon`:

- `App` guarda `tasques` i `filtre`;
- `FormulariTasca` rep `onAfegir`;
- `LlistaTasques` rep `tasques`, `missatgeBuit`, `onToggle` i `onElimina`;
- `Tasca` rep `tasca`, `onToggle` i `onElimina`;
- `FiltreTasques` rep `filtre` i `onCanviaFiltre`;
- `Comptador` continua rebent props.

L'estructura de comunicació és aquesta:

```text
App
├── FormulariTasca        ← onAfegir
└── LlistaTasques         ← tasques, missatgeBuit, onToggle, onElimina
    └── Tasca             ← tasca, onToggle, onElimina
```

`LlistaTasques` no fa servir `onToggle` ni `onElimina` per ella mateixa: només els passa a `Tasca`. Això és **prop drilling**: fer viatjar props per components intermedis que no les necessiten.

En aquesta fitxa farem que les tasques i els filtres es comparteixin amb context. Al final, l'estructura serà:

```text
main.jsx
└── TasquesProvider
    └── FiltreTasquesProvider
        └── App
            ├── Targeta (Comptador)
            │   └── Comptador
            ├── Targeta (Tasques)
            │   ├── FormulariTasca
            │   ├── FiltreTasques
            │   └── LlistaTasques
            │       └── Tasca
```

Consumidors del context:

- `FormulariTasca` consumeix `afegeixTasca`.
- `Tasca` consumeix `toggleTasca` i `eliminaTasca`.
- `FiltreTasques` consumeix `filtre` i `canviaFiltre`.
- `LlistaTasques` consumeix `tasquesFiltrades` i `missatgeBuit`.
- `App` consumeix `pendents` i `fetes`.

El comptador **no** passarà al context: no té prop drilling i no el necessiten diversos components. Això és important: `useContext` no substitueix les props sempre; només resol un problema concret.

### 1.2 Prop drilling: el problema

Imagina que `Tasca` necessita `onToggle`. Amb props, la cadena és:

```jsx
// App.jsx
<LlistaTasques
  onToggle={toggleTasca}
  onElimina={eliminaTasca}
/>

// LlistaTasques.jsx
<Tasca
  tasca={tasca}
  onToggle={onToggle}
  onElimina={onElimina}
/>
```

`LlistaTasques` no canvia els callbacks: només els transporta. Si afegim més nivells, la cadena es fa més llarga i més fràgil.

Amb context, `App` posa les accions en un provider i `Tasca` les demana directament:

```jsx
// Tasca.jsx
const { toggleTasca, eliminaTasca } = useTasques()
```

Ara `Tasca` no depèn que `LlistaTasques` li passi callbacks.

> **Atenció:** no tots els props són prop drilling. `tasca` continua sent una prop de `Tasca` perquè és una dada concreta d'aquell element. El context és per a dades o accions compartides, no per amagar totes les props.

### 1.3 `createContext`, `Provider` i `useContext`

React ofereix tres peces bàsiques:

```jsx
import { createContext, useContext } from 'react'

const TasquesContext = createContext(null)

function Proveidor({ children }) {
  const value = { ... }

  return (
    <TasquesContext.Provider value={value}>
      {children}
    </TasquesContext.Provider>
  )
}

function Consumidor() {
  const value = useContext(TasquesContext)
  return <p>{value.algunDada}</p>
}
```

Punts importants:

- **`createContext(null)`** crea el context. El `null` és el valor per defecte si no hi ha cap provider a sobre.
- **`<TasquesContext.Provider value={...}>`** posa un valor a disposició dels descendents.
- **`useContext(TasquesContext)`** llegeix el valor del provider més proper.
- El provider ha d'embolcallar els components que volen consumir el context. Si `Tasca` crida `useContext` però no té cap provider a sobre, rebrà el valor per defecte.
- Quan el `value` del provider canvia, els components que el consumeixen es tornen a renderitzar.

El provider no ha de ser el mateix component que consumeix el context. Per això a `main.jsx` embolcallarem `<App />` amb els providers: `App` i els seus fills podran consumir-los.

### 1.4 Un hook personalitzat: `useTasques`

Podríem importar `TasquesContext` i cridar `useContext` a cada component. Però és millor encapsular-ho en un hook:

```jsx
import { createContext, useContext } from 'react'

export const TasquesContext = createContext(null)

export function useTasques() {
  const context = useContext(TasquesContext)

  if (!context) {
    throw new Error("useTasques s'ha de fer servir dins de <TasquesProvider>")
  }

  return context
}
```

`throw new Error(...)` atura el hook i llança un error amb un missatge clar. No és el mateix que `console.error()`: l'error es propaga i, si ningú no el captura, arriba a la consola. Ho expliquem amb més detall a l'annex final d'aquesta fitxa.

Així:

- els components importen només `useTasques`;
- si algú s'oblida del provider, l'error és clar;
- si més endavant canvia la forma interna del context, els components no han de canviar la importació.

El hook ha de començar per `use` i s'ha de cridar sempre al nivell superior del component, igual que `useState` o `useEffect`.

### 1.5 Què ha d'anar al context (i què no)

| Dada o acció | On ha d'anar | Per què |
| --- | --- | --- |
| `tasques` i les accions per afegir, completar o eliminar | `TasquesContext` | Les necessiten el formulari, la llista i les tasques. |
| `filtre`, `tasquesFiltrades`, `pendents`, `fetes` i `missatgeBuit` | `FiltreTasquesContext` | Els necessiten el filtre, la llista i `App`. |
| Text i error del formulari | `FormulariTasca` | Només afecten aquest formulari. |
| `tasca` | Prop de `Tasca` | És una dada concreta d'un element de la llista. |
| Comptador | Props de `App` a `Comptador` | No hi ha prop drilling; només hi ha un nivell. |

També és important **no exposar `setTasques` directament** si no cal. És millor oferir accions amb noms del domini:

```jsx
const value = {
  tasques,
  afegeixTasca,
  toggleTasca,
  eliminaTasca,
}
```

Així els components no han de saber com s'implementa l'estat. Només diuen què volen fer.

> **Regla pràctica:** crea un context quan una dada o una acció la necessiten diversos descendents i les props intermedies no hi aporten res. No crees un context per a cada `useState`.

### 1.6 Dos contexts i composició de providers

En aquesta fitxa farem dos contexts amb responsabilitats diferents.

**`TasquesContext`** guarda les tasques i les accions:

```jsx
const value = {
  tasques,
  afegeixTasca,
  toggleTasca,
  eliminaTasca,
}
```

**`FiltreTasquesContext`** guarda el filtre i l'estat derivat:

```jsx
const value = {
  filtre,
  canviaFiltre,
  tasquesFiltrades,
  pendents,
  fetes,
  missatgeBuit,
}
```

El provider de filtres necessita la llista completa de tasques, així que consumeix `useTasques()`:

```jsx
function FiltreTasquesProvider({ children }) {
  const { tasques } = useTasques()
  const [filtre, setFiltre] = useState('totes')

  // ...
}
```

Per això l'ordre dels providers a `main.jsx` és important:

```jsx
<TasquesProvider>
  <FiltreTasquesProvider>
    <App />
  </FiltreTasquesProvider>
</TasquesProvider>
```

`FiltreTasquesProvider` ha d'estar **a dins** de `TasquesProvider`, perquè necessita el context de tasques. Si els invertim, `useTasques()` no trobarà el provider i llançarà l'error que hem definit.

Separar els contexts té avantatges:

- cada provider té una responsabilitat clara;
- no barregem tasques, filtres i comptadors en un objecte enorme;
- els components només consumeixen el context que necessiten;
- més endavant podem afegir `localStorage` al provider de tasques sense tocar el de filtres.

> **Nota sobre rendiment:** quan canvia el `value` d'un provider, tots els seus consumidors es tornen a renderitzar. Separar contexts ajuda a delimitar responsabilitats, però no és una optimització màgica. Primer busquem claredat; si cal, després optimitzem amb `useMemo`.

### 1.7 Estructura final i contracte

En acabar la fitxa, l'estructura serà:

```text
src/
├── context/
│   ├── FiltreTasquesContext.js
│   ├── FiltreTasquesProvider.jsx
│   ├── TasquesContext.js
│   └── TasquesProvider.jsx
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

Contracte de props i context:

| Component | Props | Context | Responsabilitat |
| --- | --- | --- | --- |
| `App` | — | `useFiltreTasques` | Composa la pàgina i mostra els comptadors. |
| `FormulariTasca` | — | `useTasques` | Text i error locals; crida `afegeixTasca`. |
| `FiltreTasques` | — | `useFiltreTasques` | Botons de filtre. |
| `LlistaTasques` | — | `useFiltreTasques` | Renderitza la llista filtrada o l'estat buit. |
| `Tasca` | `tasca` | `useTasques` | Checkbox, text i botó d'eliminar. |
| `Comptador` | `valor`, `missatge`, `tipus`, `pas`, `onCanvia`, `onReinicia` | — | Comptador presentacional. |
| `Boto` | `variant`, `className`, `children`, `...props` | — | Botó reutilitzable. |
| `Targeta` | `titol`, `children` | — | Embolcall amb estil comú. |
| `Missatge` | `text`, `tipus` | — | Missatge amb colors segons el tipus. |

---

## 2. Activitat 1 — Crear `TasquesContext` i el provider

**Objectiu:** crear el context de tasques, moure-hi l'estat i les accions, i fer que `FormulariTasca` consumeixi el context.

**Temps estimat:** 60 minuts.

**Punt de partida:** el projecte `hola-mon` de la Fitxa 03, amb el formulari, la llista, els filtres i els comptadors funcionant.

### Esglaó 1 — Crear el context i el hook

1. Crea la carpeta `src/context/`.
2. Crea `src/context/TasquesContext.js`.
3. Importa `createContext` i `useContext` de React.
4. Exporta `TasquesContext` creat amb `createContext(null)`.
5. Exporta el hook `useTasques`:
   - crida `useContext(TasquesContext)`;
   - si el resultat és `null`, llança un error que recordi que cal un `TasquesProvider`;
   - retorna el context.

```js
import { createContext, useContext } from 'react'

export const TasquesContext = createContext(null)

export function useTasques() {
  const context = useContext(TasquesContext)

  if (!context) {
    throw new Error("useTasques s'ha de fer servir dins de <TasquesProvider>")
  }

  return context
}
```

**Comprovació:** el fitxer no dona errors i exporta el context i el hook.

### Esglaó 2 — Crear el provider i moure-hi les tasques

1. Crea `src/context/TasquesProvider.jsx`.
2. Importa `useState` i `TasquesContext`.
3. Defineix `TasquesProvider({ children })`.
4. Mou-hi l'estat `tasques` i les funcions `afegeixTasca`, `toggleTasca` i `eliminaTasca` que ara tens a `App`.
5. Crea un objecte `value` amb `tasques` i les tres accions.
6. Retorna `<TasquesContext.Provider value={value}>` amb `{children}` a dins.
7. Exporta el component amb `export default`.

```jsx
function TasquesProvider({ children }) {
  const [tasques, setTasques] = useState([])

  function afegeixTasca(text) {
    const novaTasca = {
      id: crypto.randomUUID(),
      text,
      feta: false,
    }

    setTasques((anteriors) => [...anteriors, novaTasca])
  }

  function toggleTasca(id) {
    setTasques((anteriors) =>
      anteriors.map((tasca) =>
        tasca.id === id ? { ...tasca, feta: !tasca.feta } : tasca,
      ),
    )
  }

  function eliminaTasca(id) {
    setTasques((anteriors) => anteriors.filter((tasca) => tasca.id !== id))
  }

  const value = {
    tasques,
    afegeixTasca,
    toggleTasca,
    eliminaTasca,
  }

  return (
    <TasquesContext.Provider value={value}>
      {children}
    </TasquesContext.Provider>
  )
}
```

**Comprovació:** el provider compila i les funcions són exactament les mateixes que abans, però ara viuen al context.

### Esglaó 3 — Embolcallar `App` i consumir el context

1. A `src/main.jsx`, importa `TasquesProvider`.
2. Embolcalla `<App />` amb `<TasquesProvider>` dins de `<StrictMode>`.
3. A `FormulariTasca`, elimina el prop `onAfegir`.
4. Importa `useTasques` i obtén `afegeixTasca` del context.
5. A `App`, importa `useTasques`, obtén `tasques`, `toggleTasca` i `eliminaTasca`, i elimina l'estat i les funcions de tasques.
6. Deixa el filtre, la llista filtrada i els comptadors a `App`; encara passarem `tasques` i els callbacks a `LlistaTasques`.
7. Passa `<FormulariTasca />` sense props.

```jsx
// main.jsx
<TasquesProvider>
  <App />
</TasquesProvider>
```

```jsx
// FormulariTasca.jsx
import { useTasques } from '../context/TasquesContext.js'

function FormulariTasca() {
  const { afegeixTasca } = useTasques()
  // ...
}
```

```jsx
// App.jsx
const { tasques, toggleTasca, eliminaTasca } = useTasques()
```

**Comprovació:** el formulari afegeix tasques, el comptador continua funcionant i `FormulariTasca` ja no rep cap prop. `LlistaTasques` encara rep els callbacks; els eliminarem a l'Activitat 2.

### Esglaó 4 — Repte: comprovar l'error del provider

- Comenta temporalment `<TasquesProvider>` a `main.jsx`.
- Recarrega la pàgina: ha d'aparèixer l'error de `useTasques`.
- Torna a posar el provider i comprova que l'aplicació funciona.
- **Opcional:** prova de renderitzar `FormulariTasca` fora del provider i explica per què falla.

**Comprovació:** entens que `useContext` només troba el valor si hi ha un provider a sobre.

---

## 3. Activitat 2 — Consumir el context i eliminar prop drilling

**Objectiu:** fer que `Tasca` consumeixi les accions del context i eliminar els callbacks que `App` i `LlistaTasques` només feien passar.

**Temps estimat:** 40 minuts.

### Esglaó 1 — `Tasca` consumeix les accions

1. A `Tasca.jsx`, importa `useTasques`.
2. Obtén `toggleTasca` i `eliminaTasca` del context.
3. Canvia la signatura a `function Tasca({ tasca })`.
4. Al checkbox, crida `toggleTasca(tasca.id)`.
5. Al botó d'eliminar, crida `eliminaTasca(tasca.id)`.
6. Comprova que `Tasca` només rep la prop `tasca`.

```jsx
function Tasca({ tasca }) {
  const { toggleTasca, eliminaTasca } = useTasques()
  // ...
}
```

**Comprovació:** el checkbox i el botó «Elimina» continuen funcionant sense rebre callbacks.

### Esglaó 2 — `LlistaTasques` deixa de transportar callbacks

1. Canvia la signatura de `LlistaTasques` a `function LlistaTasques({ tasques, missatgeBuit })`.
2. Quan renderitzis cada `Tasca`, passa només `key` i `tasca`.
3. Elimina `onToggle` i `onElimina` del `.map()`.

```jsx
{tasques.map((tasca) => (
  <Tasca key={tasca.id} tasca={tasca} />
))}
```

**Comprovació:** `LlistaTasques` ja no rep callbacks i la llista continua funcionant.

### Esglaó 3 — `App` deixa de passar callbacks

1. A `App`, canvia la desestructuració a `const { tasques } = useTasques()`.
2. Elimina `onToggle` i `onElimina` de `<LlistaTasques />`.
3. Comprova que `LlistaTasques` només rep `tasques` i `missatgeBuit`.

```jsx
<LlistaTasques
  tasques={tasquesFiltrades}
  missatgeBuit={missatgeBuit}
/>
```

**Comprovació:** afegir, completar i eliminar tasques funciona; `Tasca` només rep `tasca`; ja no hi ha callbacks viatjant per components intermedis.

### Esglaó 4 — Repte: inspeccionar les props

- Obre React DevTools i selecciona una `Tasca`.
- Comprova que a Props només hi ha `tasca`.
- Selecciona `LlistaTasques` i comprova que només rep `tasques` i `missatgeBuit`.
- **Opcional:** afegeix un comentari a `Tasca` explicant d'on surten `toggleTasca` i `eliminaTasca`.

---

## 4. Activitat 3 — `FiltreTasquesContext` i composició de providers

**Objectiu:** crear un segon context per al filtre i l'estat derivat, compondre els dos providers i deixar `App` i els components de tasques sense props de filtre.

**Temps estimat:** 35 minuts a classe i 15 minuts de treball posterior.

Segueix els esglaons següents per crear `FiltreTasquesProvider` i connectar els consumidors a classe; revisa i explica el provider sencer després.

### Esglaó 1 — Crear el context i el hook de filtres

1. Crea `src/context/FiltreTasquesContext.js`.
2. Crea `FiltreTasquesContext` amb `createContext(null)`.
3. Crea el hook `useFiltreTasques` amb la mateixa validació que `useTasques`.
4. Exporta el context i el hook.

**Comprovació:** el fitxer exporta `FiltreTasquesContext` i `useFiltreTasques`.

### Esglaó 2 — Crear el provider de filtres

1. Crea `src/context/FiltreTasquesProvider.jsx`.
2. Importa `useState`, `useTasques` i `FiltreTasquesContext`.
3. Obtén `tasques` de `useTasques()`.
4. Mou-hi l'estat `filtre`, els comptadors `pendents` i `fetes`, la llista `tasquesFiltrades` i el `missatgeBuit`.
5. Crea un `value` amb `filtre`, `canviaFiltre`, `tasquesFiltrades`, `pendents`, `fetes` i `missatgeBuit`.
6. Retorna el `FiltreTasquesContext.Provider` amb `{children}`.

```jsx
function FiltreTasquesProvider({ children }) {
  const { tasques } = useTasques()
  const [filtre, setFiltre] = useState('totes')

  const pendents = tasques.filter((tasca) => !tasca.feta).length
  const fetes = tasques.length - pendents

  const tasquesFiltrades = tasques.filter((tasca) => {
    if (filtre === 'pendents') return !tasca.feta
    if (filtre === 'fetes') return tasca.feta
    return true
  })

  let missatgeBuit = 'Encara no hi ha tasques. Afegeix-ne una.'

  if (tasques.length > 0 && filtre === 'pendents') {
    missatgeBuit = 'No hi ha tasques pendents. Bona feina!'
  } else if (tasques.length > 0 && filtre === 'fetes') {
    missatgeBuit = 'Encara no has marcat cap tasca com a feta.'
  }

  const value = {
    filtre,
    canviaFiltre: setFiltre,
    tasquesFiltrades,
    pendents,
    fetes,
    missatgeBuit,
  }

  return (
    <FiltreTasquesContext.Provider value={value}>
      {children}
    </FiltreTasquesContext.Provider>
  )
}
```

**Comprovació:** el provider compila i calcula els mateixos valors que abans calculava `App`.

### Esglaó 3 — Compondre els providers

A `main.jsx`, posa `FiltreTasquesProvider` **a dins** de `TasquesProvider`:

```jsx
<TasquesProvider>
  <FiltreTasquesProvider>
    <App />
  </FiltreTasquesProvider>
</TasquesProvider>
```

L'ordre no és arbitrari: el provider de filtres necessita `useTasques()`.

**Comprovació:** l'aplicació arrenca sense l'error de `useTasques`.

### Esglaó 4 — Consumir el context de filtres

1. A `FiltreTasques`, importa `useFiltreTasques`.
2. Obtén `filtre` i `canviaFiltre`; elimina els props.
3. A `LlistaTasques`, importa `useFiltreTasques`.
4. Obtén `tasquesFiltrades` i `missatgeBuit`; elimina els props.
5. A `App`, importa `useFiltreTasques` i obtén `pendents` i `fetes`.
6. Renderitza `<FiltreTasques />` i `<LlistaTasques />` sense props.
7. Elimina de `App` l'estat `filtre` i els càlculs derivats.

```jsx
// FiltreTasques.jsx
const { filtre, canviaFiltre } = useFiltreTasques()
```

```jsx
// LlistaTasques.jsx
const { tasquesFiltrades, missatgeBuit } = useFiltreTasques()
```

```jsx
// App.jsx
const { pendents, fetes } = useFiltreTasques()
```

**Comprovació:** els filtres funcionen, la llista i el missatge buit canvien, els comptadors mostren el total real i la targeta de tasques ja no rep props.

### Esglaó 5 — Repte: un component de providers

- Crea opcionalment `src/context/Proveidors.jsx`.
- Fes que compongui `TasquesProvider` i `FiltreTasquesProvider`.
- A `main.jsx`, embolcalla `<App />` amb `<Proveidors>`.
- **Repte extra:** afegeix una acció `netejaFetes` al `TasquesProvider` i un botó a la targeta de tasques. Ha de fer servir `.filter()` i actualitzar l'estat de manera immutable.

---

## 5. Criteris de comprovació

Marca cada criteri quan el compleixis:

- [ ] Has continuat dins del projecte `hola-mon`; no n'has creat un de nou.
- [ ] El comptador de la Fitxa 03 continua funcionant amb props.
- [ ] `TasquesContext` existeix a `src/context/`.
- [ ] `TasquesProvider` conté l'estat `tasques` i les accions `afegeixTasca`, `toggleTasca` i `eliminaTasca`.
- [ ] `main.jsx` embolcalla `<App />` amb `<TasquesProvider>`.
- [ ] `FormulariTasca` consumeix `useTasques()` i no rep `onAfegir`.
- [ ] `Tasca` consumeix `useTasques()` i només rep la prop `tasca`.
- [ ] `LlistaTasques` no transporta callbacks.
- [ ] `FiltreTasquesContext` i `FiltreTasquesProvider` existeixen.
- [ ] `FiltreTasquesProvider` consumeix `useTasques()` i està dins de `TasquesProvider`.
- [ ] `FiltreTasques` consumeix `filtre` i `canviaFiltre`.
- [ ] `LlistaTasques` consumeix `tasquesFiltrades` i `missatgeBuit`.
- [ ] `App` consumeix `pendents` i `fetes`.
- [ ] El text i l'error del formulari continuen sent estat local.
- [ ] La llista filtrada i els comptadors continuen sent estat derivat.
- [ ] No hi ha cap context per al comptador ni per a dades que només necessita un component.
- [ ] La consola no mostra errors ni avisos de `key`.
- [ ] Tailwind continua funcionant.

---

## 6. Continua el projecte

Guarda el projecte `hola-mon`. A la **[Fitxa 05](Fitxa05.md)** treballarem `localStorage` per conservar les tasques i el filtre entre recàrregues. El `TasquesProvider` i el `FiltreTasquesProvider` són els llocs naturals per llegir i desar aquests estats, perquè ja són qui els posseeixen.

Més endavant hi afegirem React Router per separar pantalles. No cal tornar a executar `npm create vite`.

---

## 7. Recursos

- Context: <https://react.dev/learn/passing-data-deeply-with-context>
- `createContext`: <https://react.dev/reference/react/createContext>
- `useContext`: <https://react.dev/reference/react/useContext>
- Providers i composició: <https://react.dev/reference/react/useContext#passing-data-deeply-into-the-tree>
- Hooks personalitzats: <https://react.dev/learn/reusing-logic-with-custom-hooks>
- Regles dels hooks: <https://react.dev/reference/rules/rules-of-hooks>
- Renderitzar llistes: <https://react.dev/learn/rendering-lists>
- Tailwind CSS: <https://tailwindcss.com/docs/utility-first>

---

## Annex — Què és `throw new Error(...)`?

Al hook `useTasques` has vist aquesta instrucció:

```js
throw new Error("useTasques s'ha de fer servir dins de <TasquesProvider>")
```

`Error` és un tipus d'objecte que representa un error. `new Error('...')` **crea** l'objecte amb un missatge. `throw` **llança** l'error: atura l'execució normal de la funció i el propaga cap al codi que l'ha cridada.

```js
function divideix(a, b) {
  if (b === 0) {
    throw new Error('No es pot dividir per zero')
  }

  return a / b
}

try {
  divideix(4, 0)
} catch (error) {
  console.error(error.message) // No es pot dividir per zero
}
```

Punts importants:

- `console.error()` només escriu un missatge a la consola. `throw` **atura** la funció i propaga l'error.
- Si hi ha un `try`/`catch`, el `catch` rep l'error i pots llegir `error.message`.
- Si ningú no el captura, l'error arriba a la consola i pot aturar l'operació.
- Dins d'una funció `async`, un `throw` equival a retornar una Promise rebutjada.
- Normalment llancem `Error` perquè té propietats útils, com `message` i `name`.

A `useTasques`, l'error és deliberat: és un **error de programació** que ens avisa que falta el provider. No és un error per mostrar a l'usuari final; per als errors d'usuari o de xarxa farem servir estats com `error` i missatges a la interfície.
