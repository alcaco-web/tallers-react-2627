# Fitxa 01 — Primers passos amb React

> **Objectiu general:** crear un projecte React amb JavaScript des de zero, mostrar un «Hola món!», construir un comptador interactiu i afegir-hi Tailwind CSS v4.

- **Temps estimat total:** 2 hores i 45 minuts, incloent instal·lació, teoria i les dues activitats.
- **Requisits previs:** JavaScript bàsic (variables, funcions, condicionals i objectes) i nocions de terminal.
- **Versions utilitzades:** React 19.3.1, Vite 8.3.4 i Tailwind CSS 4.3.3.

> **Projecte acumulatiu:** aquesta fitxa crea el projecte `hola-mon`, que reutilitzarem a les fitxes següents. No l'esborris en acabar.

## Continguts

1. Teoria
   - Què és React
   - Crear un projecte amb Vite i JavaScript
   - Estructura del projecte
   - JSX
   - Components
   - Estat i esdeveniments
   - Tailwind CSS v4
2. Activitat 1 — Hola món i comptador
3. Activitat 2 — Tailwind CSS v4
4. Criteris de comprovació
5. Continua el projecte
6. Recursos

---

## 1. Teoria

> **Com llegir aquesta teoria:** els fragments de codi i les comandes són exemples de referència, no passos que cal executar o copiar automàticament. Fes canvis i proves quan un esglaó de les activitats t'ho demani; si hi remet, adapta-hi l'exemple al teu projecte.

### 1.1 Què és React?

React és una **biblioteca de JavaScript per construir interfícies d'usuari**. Va néixer a Meta (Facebook) i actualment és una de les eines més utilitzades per crear aplicacions web.

Tres idees clau:

1. **Components:** la interfície es divideix en peces independents i reutilitzables. Un botó, una targeta o tota una pàgina poden ser components.
2. **Declaratiu:** nosaltres descrivim *com ha de ser* la interfície a partir de les dades. Quan les dades canvien, React actualitza el DOM per nosaltres. No hem de buscar elements ni modificar-los manualment.
3. **Flux de dades unidireccional:** les dades baixen dels components pares als fills. Això fa que l'aplicació sigui més fàcil d'entendre i depurar.

React **no és un framework complet**: no inclou enrutament ni gestió global de l'estat. Això ho afegirem més endavant amb altres llibreries.

### 1.2 Vite i el projecte React

**Vite** crea l'estructura inicial del projecte i proporciona el servidor de desenvolupament amb recàrrega automàtica. També genera la versió de producció. A la Fitxa 01 farem servir la plantilla React amb **JavaScript**, no TypeScript.

La versió de Vite 8 utilitzada al taller necessita Node.js `^20.19.0` o `>=22.12.0`. `create-vite` és el generador; la versió del generador i la versió de Vite instal·lada al projecte són independents.

La creació i l'arrencada del projecte es practiquen a l'**Activitat 1, Esglaó 1**. Allà trobaràs les ordres, les preguntes que poden aparèixer i què fer si Vite tria un port alternatiu.

### 1.3 Estructura del projecte

```text
hola-mon/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── node_modules/        ← generat per npm install (no editar)
```

Els fitxers que més farem servir:

| Fitxer | Funció |
| --- | --- |
| `index.html` | Pàgina HTML inicial. Conté `<div id="root">`, on React munta l'aplicació. |
| `src/main.jsx` | Punt d'entrada de JavaScript. Crea l'arrel de React i renderitza `<App />`. |
| `src/App.jsx` | Component principal de l'aplicació. |
| `src/index.css` | Estils globals. |
| `src/App.css` | Estils propis del component `App`. |
| `vite.config.js` | Configuració de Vite i dels seus plugins. |
| `package.json` | Nom del projecte, scripts i dependències. |

Contingut inicial de `src/main.jsx`:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`createRoot` connecta React amb el `<div id="root">` de l'HTML. `StrictMode` és una eina de desenvolupament: pot executar dues vegades el cos dels components per detectar efectes secundaris. És normal i no afecta els clics dels botons.

### 1.4 JSX

**JSX** és una extensió de JavaScript que permet escriure una estructura semblant a HTML dins del codi. React la converteix en crides de JavaScript.

```jsx
function App() {
  const nom = 'DAW'
  const any = 2026

  return (
    <>
      <h1>Hola {nom}!</h1>
      <p>Estem a l'any {any}.</p>
    </>
  )
}

export default App
```

Regles bàsiques:

- Un component ha de retornar **un sol element arrel**. Si necessites diversos elements germans, embolcalla'ls amb un **fragment** `<>...</>`.
- Les expressions de JavaScript van entre claus: `{nom}`, `{2 + 2}`, `{comptador}`.
- Els atributs segueixen la nomenclatura de React: `className` en lloc de `class`, `htmlFor` en lloc de `for`, `onClick` en lloc de `onclick`.
- Les etiquetes sense contingut es tanquen: `<img />`, `<input />`, `<br />`.
- Els comentaris dins de JSX són `{/* comentari */}`.

### 1.5 Components

Un **component** és una funció de JavaScript que retorna JSX. El seu nom ha de començar amb **majúscula**; si no, React el tracta com una etiqueta HTML.

Fitxer `src/components/Salutacio.jsx`:

```jsx
function Salutacio() {
  return <h1>Hola món!</h1>
}

export default Salutacio
```

I des de `src/App.jsx`:

```jsx
import Salutacio from './components/Salutacio.jsx'

function App() {
  return (
    <main>
      <Salutacio />
    </main>
  )
}

export default App
```

Cada component ha de viure en el seu propi fitxer dins de `src/components/` i s'exporta amb `export default`. Després s'importa allà on es vol utilitzar. A la Fitxa 02 aplicarem aquest conveni a tots els components. Els **props** (dades que passen del pare al fill) els veurem en una fitxa posterior.

### 1.6 Estat i esdeveniments

L'**estat** són les dades que canvien durant l'execució i que fan que la interfície es torni a dibuixar. A React es gestiona amb el hook `useState`.

```jsx
import { useState } from 'react'

function App() {
  const [comptador, setComptador] = useState(0)

  function incrementa() {
    setComptador((anterior) => anterior + 1)
  }

  return (
    <main>
      <h1>Hola món!</h1>
      <p>Has fet clic {comptador} vegades.</p>
      <button onClick={incrementa}>Incrementa</button>
    </main>
  )
}

export default App
```

Què passa aquí:

1. `useState(0)` crea una variable d'estat amb valor inicial `0`.
2. `comptador` és el valor actual i `setComptador` és la funció que el modifica.
3. Quan cridem `setComptador`, React programa un **nou render** del component.
4. El paràgraf es torna a dibuixar amb el nou valor. No cal tocar el DOM manualment.

Errors que cal evitar:

- **No mutis l'estat directament:** `comptador++` no actualitza la interfície. Fes servir el setter.
- **No cridis el setter durant el render:** `onClick={setComptador(comptador + 1)}` s'executa en cada render i pot provocar un bucle. Has de passar una funció: `onClick={() => setComptador(comptador + 1)}`.
- Quan el nou valor depèn de l'anterior, és més segur fer servir la **forma funcional**: `setComptador((anterior) => anterior + 1)`.

Un esdeveniment com `onClick` rep una **funció**. Pots passar-hi el nom d'una funció (`onClick={incrementa}`) o una funció anònima (`onClick={() => ...}`).

### 1.7 Tailwind CSS v4

**Tailwind CSS** és un framework de CSS **utility-first**: en lloc d'escriure regles CSS personalitzades, combines classes petites que fan una sola cosa (`flex`, `p-4`, `text-xl`, `bg-slate-900`).

La versió 4 funciona amb **CSS com a configuració** i no necessita `tailwind.config.js` per a un projecte bàsic. Els fitxers del projecte es detecten automàticament.

La configuració pràctica —instal·lar el plugin, connectar-lo a Vite i importar Tailwind des del CSS— es fa a l'**Activitat 2, Esglaó 1**. Aquest exemple només mostra com s'apliquen classes a JSX:

```jsx
<main className="min-h-screen bg-slate-900 p-8 text-slate-100">
  <h1 className="text-4xl font-bold text-cyan-400">Hola món!</h1>
  <p className="mt-4 text-lg">Has fet clic {comptador} vegades.</p>
  <button
    className="mt-6 rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-400"
    onClick={incrementa}
  >
    Incrementa
  </button>
</main>
```

Conceptes útils:

- **Responsive:** Tailwind és *mobile-first*. `text-2xl sm:text-4xl` vol dir mida petita per defecte i més gran a partir del punt de trencament `sm`. També existeixen `md:`, `lg:`, `xl:`.
- **Estats:** `hover:bg-cyan-400`, `focus-visible:ring-2`, `disabled:opacity-50`.
- **Mode fosc:** `dark:bg-slate-950` s'activa segons la preferència del sistema. Per controlar-lo manualment cal una configuració addicional.
- **Classes completes:** el compilador busca noms sencers al codi. No construeixis classes dinàmiques com `bg-${color}-500`; no les detectarà.

---

## 2. Activitat 1 — Hola món i comptador

**Objectiu:** crear el projecte `hola-mon`, netejar el codi de exemple i construir un comptador interactiu amb `useState`.

**Temps estimat:** 75 minuts.

### Esglaó 1 — Crear el projecte i netejar-lo

1. Comprova que tens una versió de Node compatible (`node -v`).
2. Crea el projecte amb `npm create vite@latest hola-mon -- --template react`.
   - La comanda ja selecciona React amb JavaScript. Si pregunta quin linter vols, pots acceptar **Oxlint**; no el treballarem en aquesta fitxa.
   - Si pregunta **Install with npm and start now?**, tria **No** per fer manualment el pas següent. Si tries **Yes**, ja haurà instal·lat les dependències i engegat el servidor: no repeteixis les ordres del punt següent.
3. Entra a la carpeta, instal·la les dependències i engega el servidor:
   ```bash
   cd hola-mon
   npm install
   npm run dev
   ```
   Obre l'adreça indicada per la terminal (normalment `http://localhost:5173`). Si el port 5173 està ocupat, Vite n'escull un altre, per exemple el 5174; és normal. Atura el servidor amb `Ctrl+C` quan hagis acabat.
4. Obre l'aplicació al navegador i identifica els fitxers `main.jsx`, `App.jsx` i `index.css`.
5. Neteja el boilerplate:
   - Canvia el `<title>` de `index.html` per **«Hola món — React»**.
   - A `src/App.jsx`, elimina els imports de logos i d'`App.css`, i deixa un component mínim que mostri un `<h1>Hola món!</h1>` dins d'un `<main>`. Fem servir `<main>` perquè indica semànticament quina és la part principal i única del contingut de la pàgina; un fragment `<>...</>` només agrupa elements i no aporta aquest significat.
   - A `src/index.css`, esborra tot el contingut per defecte. El deixarem buit; a l'Activitat 2 hi afegirem Tailwind.
   - Elimina `src/App.css` i les imatges que ja no utilitzis.

**Comprovació:** la pàgina mostra només «Hola món!», sense logos ni estils del template, i la consola del navegador no té errors.

### Esglaó 2 — Comptador amb `useState`

Afegeix al component `App` un comptador. Requisits:

- Una variable d'estat `comptador` que comenci a `0`.
- Un paràgraf que mostri **«Has fet clic X vegades.»**
- Un botó **«Incrementa»** que sumi `1` al comptador.
- El número ha de canviar sense recarregar la pàgina.

**Recordatori:** revisa l'apartat 1.6.

**Comprovació:** en obrir la pàgina es veu `0`; cada clic a «Incrementa» augmenta el número i actualitza el text.

### Esglaó 3 — Decrementar i reiniciar

Completa el comptador amb dos botons més. Aquest esglaó és obligatori per practicar com l'estat pot canviar en més d'una direcció i tornar a un valor inicial:

- Un botó **«Decrementa»** que resti `1`.
- Un botó **«Reinicia»** que torni el valor a `0`.

Fes servir una funció per a cada acció i actualitza l'estat amb el setter. Comprova que pots augmentar i disminuir el valor, i que «Reinicia» el torna a `0` tant si és positiu com si és negatiu.

### Esglaó 4 — Repte opcional: missatge segons el valor

Quan els tres botons funcionin, mostra un text diferent **dins de la pàgina i del mateix component `App`**, segons l'estat. No facis servir `alert()` ni una finestra emergent: el missatge forma part del JSX i s'actualitza quan canvia el comptador.

  - Si val `0`: «Encara no has començat.»
  - Si és positiu: «Vas per bon camí!»
  - Si és negatiu: «Compte, vas enrere!»

Per exemple, calcula el text abans del `return` i mostra'l en un paràgraf: `<p>{missatge}</p>`.

**Opcional:** desactiva «Reinicia» quan el comptador ja valgui `0`.

L'extracció del comptador a `src/components/Comptador.jsx` és un **repte extra opcional**: el component tindrà el seu propi `useState`. A la Fitxa 02 aprendrem a comunicar components amb props i callbacks.

**Comprovació:** el comptador comença a `0`; «Incrementa» suma `1`, «Decrementa» resta `1` i «Reinicia» torna a `0`. Cap acció no recarrega la pàgina. El missatge condicional i l'extracció a component són opcionals.

---

## 3. Activitat 2 — Tailwind CSS v4

**Objectiu:** instal·lar i configurar Tailwind CSS 4 al projecte de l'Activitat 1 i estilitzar la interfície amb utilitats.

**Temps estimat:** 45 minuts.

### Esglaó 1 — Instal·lar i configurar Tailwind

1. Atura el servidor amb `Ctrl+C`.
2. Instal·la les dependències:

   ```bash
   npm install tailwindcss @tailwindcss/vite
   ```

3. Obre `vite.config.js` i importa el plugin de Tailwind. El fitxer ha de quedar així (conserva aquesta estructura i afegeix-hi la línia marcada):

   ```js
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   import tailwindcss from '@tailwindcss/vite'

   export default defineConfig({
     plugins: [react(), tailwindcss()],
   })
   ```

   La línia `tailwindcss()` activa el plugin; no esborres `react()`.
4. Substitueix el contingut de `src/index.css` per `@import "tailwindcss";`.
5. Comprova que `src/main.jsx` importa `./index.css`.
6. Torna a engegar el servidor.
7. Prova temporalment una classe visible, per exemple `<h1 className="text-red-500">`. Si el títol es veu vermell, Tailwind funciona; després elimina la classe de prova.

**Comprovació:** la classe de prova té efecte i la consola no mostra errors de compilació.

### Esglaó 2 — Estilitzar la pàgina

Aplica Tailwind a la interfície de l'Activitat 1. Requisits mínims:

- Un contenidor que ocupi com a mínim tota l'alçada de la pantalla i centri el contingut.
- Un fons i un color de text amb bon contrast.
- Una targeta o panell amb espaiat intern, cantonades arrodonides i ombra.
- Botons amb estat `hover` i focus visible.
- Espaiat coherent entre títol, text, missatge i botons.

**Recordatori:** revisa l'apartat 1.7.

**Comprovació:** la pàgina ja no sembla un document sense estils; tots els elements tenen espaiat i els botons responen en passar-hi el ratolí.

### Esglaó 3 — Repte opcional: responsive i mode fosc

La configuració i l'estil bàsic de l'esglaó 2 són suficients per completar la fitxa. Si tens temps, amplia el disseny:

- Fes el disseny **mobile-first**: en mòbil, els botons s'apilen un sota l'altre; a partir de `sm:`, es col·loquen en línia.
- Augmenta la mida del títol en pantalles grans, per exemple `text-3xl sm:text-5xl`.
- Afegeix transicions i estats `hover:` i `focus-visible:` als botons.
- Afegeix suport de **mode fosc** amb classes `dark:`. Per defecte, Tailwind segueix la preferència del sistema operatiu.
- **Opcional avançat:** afegeix un botó per alternar manualment entre mode clar i fosc amb estat de React i la variant `dark` per classe.

**Comprovació opcional:** redueix i amplia la finestra del navegador; la disposició s'adapta. Canvia el tema del sistema operatiu i comprova que els colors `dark:` responen.

---

## 4. Criteris de comprovació

Marca cada criteri quan el compleixis:

- [ ] El projecte s'engega amb `npm run dev` sense errors.
- [ ] La pàgina mostra «Hola món!» dins d'un element semàntic (`main`, `h1`).
- [ ] El comptador comença a `0`; «Incrementa» suma `1` i «Decrementa» resta `1`.
- [ ] «Reinicia» torna el comptador a `0`, tant des d'un valor positiu com negatiu.
- [ ] L'estat es gestiona amb `useState` i no es muta directament.
- [ ] Els esdeveniments fan servir funcions (`onClick={...}`), no crides durant el render.
- [ ] Tailwind està instal·lat i configurat amb el plugin `@tailwindcss/vite`.
- [ ] `src/index.css` conté `@import "tailwindcss";`.
- [ ] La interfície té un estil bàsic coherent i els botons tenen `hover` i focus visible.
- [ ] No queden estils ni imports del boilerplate de Vite.
- [ ] La consola del navegador no mostra errors.

El missatge segons el valor, desactivar «Reinicia» quan val `0` i extreure el comptador a `Comptador.jsx` són reptes opcionals, no requisits per completar la fitxa.

El disseny responsive i el mode fosc també són ampliacions opcionals; l'objectiu obligatori de Tailwind és que funcioni i donar un estil bàsic a la pàgina.

---

## 5. Continua el projecte

Guarda la carpeta `hola-mon` i el seu `package.json`. A la **[Fitxa 02](Fitxa02.md)** continuarem dins del mateix projecte per aprendre a passar dades entre components amb **props**, crear components reutilitzables i compondre la interfície. No caldrà tornar a executar `npm create vite`.

---

## 6. Documentació oficial

Enllaços de consulta complementària sobre els conceptes de la fitxa:

- [Components de React](https://react.dev/learn/your-first-component)
- [Escriure marcatge amb JSX](https://react.dev/learn/writing-markup-with-jsx)
- [Estat d'un component amb `useState`](https://react.dev/learn/state-a-components-memory)
- [Respondre a esdeveniments](https://react.dev/learn/responding-to-events)
- [Guia de Vite](https://vite.dev/guide/)
- [Instal·lar Tailwind CSS v4 amb Vite](https://tailwindcss.com/docs/installation/using-vite)
- [Utilitats de Tailwind CSS](https://tailwindcss.com/docs/styling-with-utility-classes)
- [Actualitzar a Tailwind CSS v4](https://tailwindcss.com/docs/upgrade-guide)
