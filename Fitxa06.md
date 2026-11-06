# Fitxa 06 — React Router i navegació

> **Objectiu general:** convertir `hola-mon` en una aplicació amb diverses pantalles, mantenint l'estat compartit i la persistència de la Fitxa 05. Aprendràs a definir rutes, navegar sense recarregar la pàgina, compartir un layout, llegir paràmetres de la URL i mostrar una pàgina 404.

- **Temps estimat total:** 3 hores (2 h 25 min a classe; 15 min de lectura prèvia i 20 min de treball posterior).
- **Requisits previs:** haver completat la [Fitxa 05](Fitxa05.md) o tenir un `hola-mon` equivalent amb `TasquesProvider`, `FiltreTasquesProvider`, `useLocalStorage` i la llista de tasques funcionant.
- **Projecte:** **no en crees un de nou**. Treballes dins de `hola-mon`.
- **Abans de classe (15 min):** llegeix els apartats 1.2–1.5 sobre SPA, rutes, `Link`/`NavLink` i `Outlet`.
- **Versions utilitzades:** React 19.3.1, Vite 8.3.4, Tailwind CSS 4.3.3 i `react-router` 8.5.0.

> **Per què React Router 8?** Els equips del taller fan servir Node 22.22.3, que compleix el requisit `>=22.22.0` de la branca 8. A la versió 8 el paquet s'importa de `react-router`; `react-router-dom` no té branca 8. La versió 8.5.0 també requereix React `>=19.2.7`, i el projecte fa servir React 19.3.1. Comprova la teva versió amb `node --version`.

> **Projecte acumulatiu:** la Fitxa 06 no canvia el model de dades ni la persistència. Afegeix una capa de navegació per sobre dels components que ja tens. En acabar, les tasques continuaran vivint als providers i sobreviuran tant als canvis de pàgina com a les recàrregues.

## Continguts

1. Teoria
   - On som i què construirem
   - Aplicació d'una sola pàgina i encaminament al client
   - `BrowserRouter`, `Routes` i `Route`
   - `Link` i `NavLink`
   - Layouts i rutes niuades amb `Outlet`
   - Rutes dinàmiques i `useParams`
   - Navegació programàtica amb `useNavigate`
   - Rutes desconegudes i pàgina 404
   - Providers, estat i router
   - Publicació i reescriptura d'adreces
   - Estructura final i resum d'API
2. Activitat 1 — Dues pàgines i primera navegació
3. Activitat 2 — Layout, `NavLink` i rutes niuades
4. Activitat 3 — Detall dinàmic d'una tasca
5. Criteris de comprovació
6. Continua el projecte
7. Recursos

---

## 1. Teoria

> **Com llegir aquesta teoria:** els fragments de codi i les comandes són exemples de referència, no passos que cal executar o copiar automàticament. Fes canvis i proves quan un esglaó de les activitats t'ho demani; si hi remet, adapta-hi l'exemple al teu projecte.

### 1.1 On som i què construirem

A la [Fitxa 05](Fitxa05.md) has deixat una aplicació d'una sola pantalla:

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

Tot funciona, però tot viu a la mateixa pàgina:

- el comptador i les tasques comparteixen espai;
- no hi ha una adreça pròpia per a les tasques;
- el botó «Enrere» del navegador no et porta enlloc;
- no pots enviar un enllaç directe a una tasca;
- si l'aplicació creix, `App` es converteix en un fitxer enorme.

Podries amagar seccions amb una condició:

```jsx
{mostraTasques ? <Tasques /> : <Comptador />}
```

Però això no crea adreces, no funciona amb l'historial del navegador i no escala. La solució és un **router**: una peça que llegeix la URL i decideix quina pantalla mostrar.

En acabar la fitxa, l'arquitectura serà semblant a aquesta:

```text
main.jsx
└── BrowserRouter
    └── TasquesProvider
        └── FiltreTasquesProvider
            └── App
                └── Routes
                    └── Layout
                        ├── PaginaInici
                        ├── PaginaTasques
                        ├── PaginaTasca
                        └── PaginaNoTrobada
```

I les rutes seran:

| Adreça | Pantalla |
| --- | --- |
| `/` | Inici, amb el comptador |
| `/tasques` | Formulari, filtre i llista de tasques |
| `/tasques/:id` | Detall d'una tasca concreta |
| `*` | Pàgina no trobada |

Els providers continuaran **per sobre** de les rutes. Això és fonamental: si els poses a dins d'una pàgina, es desmuntaran en navegar i perdran l'estat viu. El comptador, en canvi, passarà a ser estat local de `PaginaInici`; per això es reiniciarà quan surtis i tornis a entrar. Aquest comportament és deliberat i el comentarem.

### 1.2 Aplicació d'una sola pàgina i encaminament al client

Una aplicació web tradicional fa una petició al servidor per cada URL:

```text
GET /tasques  →  el servidor retorna el fitxer tasques.html
GET /sobre    →  el servidor retorna el fitxer sobre.html
```

Una **SPA** (*Single Page Application*) carrega un sol document HTML i, a partir d'aquí, canvia el contingut amb JavaScript:

```text
GET /            →  index.html + JavaScript
clic a Tasques   →  el router canvia la URL a /tasques
                 →  React renderitza PaginaTasques
                 →  no es torna a carregar el document
```

React Router fa servir l'**API d'historial** del navegador (`pushState`, `replaceState`) per canviar l'adreça sense recarregar. Després, compara la URL amb les rutes que has definit i renderitza l'element corresponent.

Això té avantatges:

- la navegació és immediata;
- l'estat dels providers es conserva;
- el botó «Enrere» i «Endavant» funcionen;
- cada pantalla pot tenir una URL compartible.

També té conseqüències:

- el servidor ha de saber servir `index.html` per a rutes com `/tasques` (ho veurem a 1.10);
- el primer carregament continua descarregant JavaScript;
- no n'hi ha prou amb canviar la URL: cal que alguna ruta coincideixi.

> **No confonguis el router amb el servidor.** El router decideix què mostra React a partir de la URL. No crea fitxers HTML ni substitueix un backend.

React Router 8 ofereix diverses maneres de configurar l'encaminament. A la fitxa fem servir l'**API declarativa** amb `<BrowserRouter>`, `<Routes>` i `<Route>`, perquè és la més directa per aprendre els conceptes. També existeix l'API de dades amb `createBrowserRouter` i `RouterProvider`, que afegeix càrrega de dades i accions; no la necessitem encara.

#### `BrowserRouter` o `HashRouter`?

| Eina | URL | Servidor |
| --- | --- | --- |
| `BrowserRouter` | `/tasques` | Necessita reescriure les rutes a `index.html`. |
| `HashRouter` | `/#/tasques` | No necessita configuració especial. |

Fem servir `BrowserRouter` perquè les adreces són netes i és el que veuràs en la majoria de projectes. A canvi, haurem de configurar el servidor en publicar l'aplicació.

### 1.3 `BrowserRouter`, `Routes` i `Route`

Primer instal·la el paquet:

```bash
npm install react-router@8.5.0
```

`react-router` és el paquet que necessitem. A la branca 8 inclou l'API per al navegador i no cal instal·lar cap paquet `react-router-dom` addicional. Importa'n `BrowserRouter`, `Routes`, `Link`, etc. sempre des de `react-router`.

A `src/main.jsx`, embolcalla l'aplicació amb `BrowserRouter` **una sola vegada**:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.jsx'
import TasquesProvider from './context/TasquesProvider.jsx'
import FiltreTasquesProvider from './context/FiltreTasquesProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <TasquesProvider>
        <FiltreTasquesProvider>
          <App />
        </FiltreTasquesProvider>
      </TasquesProvider>
    </BrowserRouter>
  </StrictMode>,
)
```

A `src/App.jsx`, defineix les rutes:

```jsx
import { Link, Route, Routes } from 'react-router'
import PaginaInici from './pages/PaginaInici.jsx'
import PaginaTasques from './pages/PaginaTasques.jsx'

function App() {
  return (
    <div>
      <nav>
        <Link to="/">Inici</Link>
        <Link to="/tasques">Tasques</Link>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<PaginaInici />} />
          <Route path="/tasques" element={<PaginaTasques />} />
        </Routes>
      </main>
    </div>
  )
}
```

Punts clau:

- `BrowserRouter` ha d'envoltar qualsevol component que faci servir `Routes`, `Link`, `useNavigate`, etc.
- `Routes` és el contenidor que tria **una** ruta.
- `Route` associa un `path` amb un `element`.
- Es fa servir `element={<Component />}`, no `component={Component}` com en versions antigues.
- `path="/"` coincideix amb l'arrel. A l'Activitat 2 veuràs la variant `index`.
- No posis un `BrowserRouter` nou dins de cada pàgina: n'hi ha d'haver un de sol a l'entrada.

Si una URL no coincideix amb cap `Route`, `Routes` no renderitza res. Per això, a l'Activitat 2 afegirem una ruta `*` per mostrar la pàgina 404.

### 1.4 `Link` i `NavLink`

No facis servir `<a href="/tasques">` per a la navegació interna:

```jsx
<a href="/tasques">Tasques</a>
```

Un enllaç HTML normal demana al navegador que carregui un document nou. En una SPA, això **recarrega tota l'aplicació**, perd l'estat en memòria i torna a executar el JavaScript des del principi.

`Link` intercepta el clic i canvia la URL amb l'API d'historial:

```jsx
import { Link } from 'react-router'

<Link to="/tasques">Tasques</Link>
```

`Link` genera un `<a>` real a l'HTML, amb `href`, però evita la recàrrega. Això és important per a l'accessibilitat: es pot fer clic amb el teclat, obrir en una pestanya nova o copiar l'enllaç.

Per als enllaços **externes** o per descarregar fitxers, continua fent servir `<a>`:

```jsx
<a href="https://react.dev" target="_blank" rel="noreferrer">
  Documentació de React
</a>
```

`NavLink` és com `Link`, però sap si la ruta és l'activa. És ideal per a menús:

```jsx
import { NavLink } from 'react-router'

<NavLink
  to="/tasques"
  className={({ isActive }) =>
    isActive ? 'text-cyan-700 font-bold' : 'text-slate-600'
  }
>
  Tasques
</NavLink>
```

- La funció de `className` rep un objecte amb `isActive`.
- `NavLink` també afegeix `aria-current="page"` quan la ruta és activa.
- Per a la ruta arrel `/`, afegeix `end`; si no, `NavLink` la considera activa per a qualsevol ruta que comenci per `/`:

```jsx
<NavLink to="/" end>Inici</NavLink>
```

> **Regla pràctica:** els canvis de pantalla es fan amb `Link` o `NavLink`; les accions que modifiquen dades es fan amb `<button>`. No converteixis un botó en un enllaç ni un enllaç en un botó sense motiu.

### 1.5 Layouts i rutes niuades amb `Outlet`

Si poses la capçalera, el menú i el peu a cada pàgina, acabaràs duplicant codi. React Router permet definir una ruta **sense `path`** que renderitza un component comú:

```jsx
<Routes>
  <Route element={<Layout />}>
    <Route index element={<PaginaInici />} />
    <Route path="tasques" element={<PaginaTasques />} />
    <Route path="*" element={<PaginaNoTrobada />} />
  </Route>
</Routes>
```

`Layout` no és una pàgina: és un **marc** que envolta les pàgines filles. Ha de renderitzar `<Outlet />` al lloc on ha d'aparèixer el contingut fill:

```jsx
import { NavLink, Outlet } from 'react-router'

function Layout() {
  return (
    <div>
      <header>
        <h1>Hola món!</h1>
        <nav>
          <NavLink to="/" end>Inici</NavLink>
          <NavLink to="/tasques">Tasques</NavLink>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer>React 19 · Vite 8 · Tailwind CSS 4</footer>
    </div>
  )
}
```

Si t'oblides d'`<Outlet />`, el layout es veurà, però la pàgina filla no apareixerà enlloc.

#### `index` i rutes relatives

- `<Route index element={<PaginaInici />} />` és la ruta filla que correspon exactament al path del pare. Com que el pare no té `path`, equival a `/`.
- `path="tasques"` és **relatiu** al pare. Sense barra inicial, React Router el resol com `/tasques`.
- `path="/tasques"` és **absolut**. També funciona, però és menys flexible si més endavant mous el layout sota un prefix.
- `path="*"` captura qualsevol ruta filla que no hagi coincidit abans. Com que és dins del `Layout`, la pàgina 404 conserva la capçalera i el menú.

Les rutes niuades no són només una manera d'estalviar codi: també permeten que les pàgines comparteixin context visual, navegació i estructura.

### 1.6 Rutes dinàmiques i `useParams`

No vols crear una ruta diferent per a cada tasca. En lloc d'això, defineix un **paràmetre de ruta**:

```jsx
<Route path="tasques/:id" element={<PaginaTasca />} />
```

Els dos punts indiquen que `id` és variable. Aquestes tres URL coincideixen:

```text
/tasques/abc
/tasques/123
/tasques/6f1c2a9e-...
```

Dins de `PaginaTasca`, llegeix el paràmetre amb `useParams()`:

```jsx
import { useParams } from 'react-router'

function PaginaTasca() {
  const { id } = useParams()
  // id és un string, encara que sembli un número
}
```

Els paràmetres de ruta **sempre són strings**. Si necessites un número, converteix-lo amb `Number(id)` i valida'l.

Per enllaçar cada tasca amb el seu detall:

```jsx
<Link to={`/tasques/${tasca.id}`}>Detall</Link>
```

A `PaginaTasca`, busca la tasca dins del context:

```jsx
const { tasques } = useTasques()
const tasca = tasques.find((candidata) => candidata.id === id)
```

Si no existeix, no has de mostrar una pàgina en blanc ni deixar que l'aplicació falli. Mostra un missatge de «Tasca no trobada» amb un enllaç per tornar a la llista.

> **Important:** no facis servir l'índex de l'array com a identificador de la URL. L'índex canvia quan s'eliminen tasques i l'enllaç deixaria de ser estable. Al projecte ja fem servir `crypto.randomUUID()`.

### 1.7 Navegació programàtica amb `useNavigate`

De vegades no navegues perquè l'usuari ha fet clic en un enllaç, sinó com a conseqüència d'una acció. Per exemple, després d'eliminar una tasca des del detall:

```jsx
import { useNavigate } from 'react-router'

function PaginaTasca() {
  const navigate = useNavigate()

  function elimina() {
    eliminaTasca(tasca.id)
    navigate('/tasques', { replace: true })
  }
}
```

- `navigate('/tasques')` afegeix una entrada nova a l'historial.
- `navigate('/tasques', { replace: true })` substitueix l'entrada actual. És útil quan la ruta actual ja no és vàlida, com ara el detall d'una tasca eliminada: si l'usuari prem «Enrere», no torna a una pàgina trencada.
- `navigate(-1)` torna a l'entrada anterior de l'historial. Pot ser còmode, però depèn de com ha arribat l'usuari a la pàgina. Si has obert el detall directament, no hi ha una pàgina anterior dins de l'aplicació.

També existeix el component `<Navigate to="/" replace />`, que fa una redirecció declarativa durant el render. No el fem servir a la solució base, però és útil per protegir rutes o redirigir després d'un login.

> **No barregis `useNavigate` amb `window.location`.** `window.location.href = '/tasques'` provoca una recàrrega completa i trenca el comportament de SPA.

### 1.8 Rutes desconegudes i pàgina 404

La ruta `*` actua com un comodí:

```jsx
<Route path="*" element={<PaginaNoTrobada />} />
```

Com que és dins del `Layout`, la pàgina 404 manté la navegació. És millor que una pantalla blanca o un error de consola.

Bones pràctiques per a la 404:

- explica que la ruta no existeix;
- ofereix un enllaç per tornar a l'inici o a les tasques;
- no mostris detalls tècnics innecessaris;
- comprova que les rutes vàlides no queden capturades per error.

React Router ordena les coincidències per especificitat; una ruta estàtica com `tasques` guanya una ruta dinàmica com `tasques/:id`, i `*` queda per a la resta. Tot i això, és clar mantenir la ruta `*` al final.

### 1.9 Providers, estat i router

A `main.jsx` tenim aquesta composició:

```jsx
<BrowserRouter>
  <TasquesProvider>
    <FiltreTasquesProvider>
      <App />
    </FiltreTasquesProvider>
  </TasquesProvider>
</BrowserRouter>
```

Per què els providers van per sobre de `Routes`?

- Les rutes canvien quin component es renderitza, però **no desmunten** els providers que les envolten.
- Per tant, `tasques` i `filtre` continuen sent el mateix estat en memòria.
- `FiltreTasquesProvider` necessita `TasquesProvider` per calcular els comptadors; per això va a dins.
- Si poses un provider dins de `PaginaTasques`, en sortir de la pàgina es desmuntarà. Encara que `localStorage` torni a carregar les dades, hauràs perdut l'estat viu i l'ordre de les operacions pot canviar.

El comptador és diferent. A la Fitxa 05 vivia a `App`, per sobre de tot. Ara el movem a `PaginaInici` perquè és estat **local d'una pàgina**:

```jsx
function PaginaInici() {
  const [comptador, setComptador] = useState(0)
  // ...
}
```

Quan surts d'Inici, el component es desmunta i el comptador es reinicia. No és un error: és el comportament esperat d'un estat local. Si volguéssim conservar-lo, l'hauríem de posar en un provider o a `localStorage`, però no ho necessitem per a aquesta demo.

> **Regla:** l'estat compartit per diverses rutes viu per sobre de les rutes; l'estat propi d'una pantalla viu dins de la pantalla.

### 1.10 Publicació i reescriptura d'adreces

En desenvolupament, Vite serveix l'aplicació i ja retorna `index.html` quan demanes `/tasques`. Per això, recarregar una ruta interna amb `npm run dev` funciona.

En producció, si penges la carpeta `dist/` en un servidor estàtic sense configuració, passarà això:

```text
GET /                  → index.html        (correcte)
GET /tasques           → 404 Not Found     (error)
```

El servidor busca un fitxer `tasques` que no existeix. La solució és una **reescriptura** (rewrite): qualsevol ruta desconeguda ha de retornar `index.html`, i el router de React s'encarregarà de mostrar la pàgina correcta.

Exemples habituals:

- **Netlify:** un fitxer `_redirects` amb `/* /index.html 200`.
- **Vercel:** una regla `rewrites` a `vercel.json`.
- **Apache:** `FallbackResource /index.html`.
- **GitHub Pages:** no fa reescriptures fàcils; si no pots configurar-les, `HashRouter` és una alternativa.

> **Consell:** abans de culpar React Router, comprova si el problema és del servidor. Si `/tasques` funciona dins de l'aplicació però falla en recarregar, gairebé segur que falta la reescriptura.

### 1.11 Estructura final i resum d'API

```text
src/
├── components/
│   ├── Boto.jsx
│   ├── Comptador.jsx
│   ├── FiltreTasques.jsx
│   ├── FormulariTasca.jsx
│   ├── Layout.jsx
│   ├── LlistaTasques.jsx
│   ├── Missatge.jsx
│   ├── Targeta.jsx
│   └── Tasca.jsx
├── context/
│   ├── FiltreTasquesContext.js
│   ├── FiltreTasquesProvider.jsx
│   ├── TasquesContext.js
│   └── TasquesProvider.jsx
├── hooks/
│   └── useLocalStorage.js
├── pages/
│   ├── PaginaInici.jsx
│   ├── PaginaNoTrobada.jsx
│   ├── PaginaTasca.jsx
│   └── PaginaTasques.jsx
├── App.jsx
├── index.css
└── main.jsx
```

Responsabilitats:

| Fitxer | Responsabilitat |
| --- | --- |
| `main.jsx` | Muntar React, `BrowserRouter` i els providers. |
| `App.jsx` | Declarar les rutes. |
| `Layout.jsx` | Capçalera, navegació, `Outlet` i peu. |
| `pages/` | Contingut de cada pantalla. |
| `Tasca.jsx` | Mostrar una tasca i enllaçar al seu detall. |
| `context/` | Estat compartit i persistència. |

Resum de l'API:

| API | Per a què serveix |
| --- | --- |
| `BrowserRouter` | Proporciona el context del router i fa servir URL netes. |
| `Routes` | Tria la ruta que coincideix amb la URL actual. |
| `Route` | Associa un path amb un element. |
| `Link` | Navega sense recarregar el document. |
| `NavLink` | Com `Link`, però indica si la ruta és activa. |
| `Outlet` | Marca on es renderitza la ruta filla dins d'un layout. |
| `useParams` | Llegeix els paràmetres dinàmics de la URL. |
| `useNavigate` | Navega des de codi, per exemple després d'eliminar. |
| `Navigate` | Redirecció declarativa durant el render. |

No cal memoritzar-ho tot. Consulta la documentació sempre que dubtis; el que sí que has d'entendre és **què representa cada element dins de l'arbre de rutes**.

---

## 2. Activitat 1 — Dues pàgines i primera navegació

**Objectiu:** separar el comptador i les tasques en dues pàgines, definir les rutes `/` i `/tasques` i navegar-hi amb `Link`.

**Temps estimat:** 60 minuts.

**Punt de partida:** el teu projecte `hola-mon` després de completar l’Activitat 3 de la [Fitxa 05](Fitxa05.md). No crees cap projecte nou.

### Esglaó 1 — Instal·lar React Router

1. Obre el terminal a l'arrel de `hola-mon`.
2. Comprova la versió de Node:

   ```bash
   node --version
   ```

3. Instal·la React Router:

   ```bash
   npm install react-router@8.5.0
   ```

4. Comprova que `package.json` inclou `react-router` a `dependencies`.

**Comprovació:** `npm run dev` arrenca sense errors i `package.json` mostra la dependència.

Si la instal·lació falla per la versió de Node, comprova que tens Node `>=22.22.0`: la branca 8 no funciona amb versions anteriors.

### Esglaó 2 — Envoltar l'aplicació amb `BrowserRouter`

A `src/main.jsx`:

1. Importa `BrowserRouter` de `react-router`.
2. Embolega `TasquesProvider` i `FiltreTasquesProvider` amb `BrowserRouter`.
3. Deixa `App` a dins dels providers.

L'ordre ha de ser:

```jsx
<StrictMode>
  <BrowserRouter>
    <TasquesProvider>
      <FiltreTasquesProvider>
        <App />
      </FiltreTasquesProvider>
    </TasquesProvider>
  </BrowserRouter>
</StrictMode>
```

**Comprovació:** no hi ha errors del tipus «useRoutes() may be used only in the context of a `<Router>`».

### Esglaó 3 — Crear `PaginaInici`

1. Crea la carpeta `src/pages/`.
2. Crea `src/pages/PaginaInici.jsx`.
3. Mou-hi el comptador: `useState`, `canvia`, `reinicia` i el càlcul de `missatge`/`tipus`.
4. Renderitza el `Comptador` dins d'una `Targeta`.
5. Afegeix una targeta o secció amb un enllaç a `/tasques`.

L'inici del component ha de quedar semblant a:

```jsx
import { useState } from 'react'
import { Link } from 'react-router'
import Comptador from '../components/Comptador.jsx'
import Targeta from '../components/Targeta.jsx'

function PaginaInici() {
  const [comptador, setComptador] = useState(0)

  function canvia(delta) {
    setComptador((anterior) => anterior + delta)
  }

  function reinicia() {
    setComptador(0)
  }

  // ...

  return (
    <div>
      <Targeta titol="Comptador">
        <Comptador
          valor={comptador}
          missatge={missatge}
          tipus={tipus}
          pas={1}
          onCanvia={canvia}
          onReinicia={reinicia}
        />
      </Targeta>

      <Link to="/tasques">Ves a les tasques</Link>
    </div>
  )
}
```

**Comprovació:** el comptador continua funcionant quan la pàgina encara no té rutes; només l'has mogut de lloc.

### Esglaó 4 — Crear `PaginaTasques`

1. Crea `src/pages/PaginaTasques.jsx`.
2. Mou-hi el formulari, el filtre, la llista i els comptadors.
3. Consumeix `useFiltreTasques()` per obtenir `pendents` i `fetes`.
4. No passis les tasques per props: els components ja les llegeixen del context.

L'estructura pot ser:

```jsx
function PaginaTasques() {
  const { pendents, fetes } = useFiltreTasques()

  return (
    <div>
      <h2>Tasques</h2>
      <Targeta titol="Llista de tasques">
        <FormulariTasca />
        <p aria-live="polite">
          Pendents: {pendents} · Fetes: {fetes}
        </p>
        <FiltreTasques />
        <LlistaTasques />
      </Targeta>
    </div>
  )
}
```

**Comprovació:** la pàgina de tasques mostra el mateix comportament que abans: afegir, completar, eliminar i filtrar.

### Esglaó 5 — Definir les rutes i la navegació

A `src/App.jsx`:

1. Elimina el comptador i la llista de tasques: ja no viuen aquí.
2. Importa `Link`, `Route` i `Routes`.
3. Importa les dues pàgines.
4. Crea una capçalera amb dos enllaços.
5. Defineix les rutes `/` i `/tasques`.

```jsx
import { Link, Route, Routes } from 'react-router'
import PaginaInici from './pages/PaginaInici.jsx'
import PaginaTasques from './pages/PaginaTasques.jsx'

function App() {
  return (
    <div>
      <header>
        <h1>Hola món!</h1>
        <nav aria-label="Navegació principal">
          <Link to="/">Inici</Link>
          <Link to="/tasques">Tasques</Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<PaginaInici />} />
          <Route path="/tasques" element={<PaginaTasques />} />
        </Routes>
      </main>
    </div>
  )
}
```

**Comprovació:** en clicar «Tasques», la URL canvia a `/tasques`, la pàgina no es recarrega i el comptador no apareix.

### Esglaó 6 — Provar la separació

1. Ves a Inici i apuja el comptador.
2. Ves a Tasques, afegeix una tasca i marca-la.
3. Torna a Inici: el comptador ha de ser zero.
4. Torna a Tasques: la tasca i el filtre han de continuar.
5. Recarrega directament `/tasques` amb `npm run dev`: ha de funcionar.
6. Comprova que els enllaços no provoquen una recàrrega completa. Una manera ràpida: mira si les tasques es mantenen en navegar i si el comptador es reinicia en tornar a Inici.

**Comprovació:** entens quina part de l'estat és compartida (tasques i filtre) i quina és local (comptador).

### Repte opcional

- Afegeix un enllaç «Torna a Inici» dins de `PaginaTasques`.
- Comprova que `Link` no recarrega la pàgina.
- Explica per què no has de fer servir `<a href="/">` per a aquest enllaç.

---

## 3. Activitat 2 — Layout, `NavLink` i rutes niuades

**Objectiu:** extreure la capçalera i el peu a un `Layout`, marcar la pàgina activa amb `NavLink` i afegir una pàgina 404 dins del layout.

**Temps estimat:** 40 minuts.

**Punt de partida:** la solució de l'Activitat 1, amb les rutes `/` i `/tasques` funcionant.

### Esglaó 1 — Crear `Layout.jsx`

1. Crea `src/components/Layout.jsx`.
2. Mou-hi la capçalera, la navegació i el peu que ara tens a `App`.
3. Importa `NavLink` i `Outlet`.
4. Deixa `<Outlet />` dins de `<main>`.
5. Canvia els `Link` per `NavLink`.
6. Afegeix `end` a l'enllaç d'Inici.

```jsx
import { NavLink, Outlet } from 'react-router'

function classeEnllac({ isActive }) {
  return isActive ? 'actiu' : ''
}

function Layout() {
  return (
    <div>
      <header>
        <h1>Hola món!</h1>
        <nav aria-label="Navegació principal">
          <NavLink to="/" end className={classeEnllac}>
            Inici
          </NavLink>
          <NavLink to="/tasques" className={classeEnllac}>
            Tasques
          </NavLink>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer>React 19 · Vite 8 · Tailwind CSS 4</footer>
    </div>
  )
}

export default Layout
```

Substitueix `'actiu'` per les classes Tailwind reals. No facis servir classes dinàmiques com `bg-${color}`: retorna una de les cadenes completes segons `isActive`.

**Comprovació:** el layout es veu, però encara no l'has connectat a les rutes.

### Esglaó 2 — Crear `PaginaNoTrobada`

1. Crea `src/pages/PaginaNoTrobada.jsx`.
2. Mostra un títol i un text breu.
3. Afegeix un `Link` per tornar a `/` o a `/tasques`.

No cal que la pàgina 404 sigui complicada; ha de ser clara i permetre sortir del bloqueig.

**Comprovació:** el component compila i l'enllaç apunta a una ruta existent.

### Esglaó 3 — Convertir `App` en un arbre de rutes

Substitueix les rutes planes per una ruta sense `path` que renderitza el `Layout`:

```jsx
import { Route, Routes } from 'react-router'
import Layout from './components/Layout.jsx'
import PaginaInici from './pages/PaginaInici.jsx'
import PaginaNoTrobada from './pages/PaginaNoTrobada.jsx'
import PaginaTasques from './pages/PaginaTasques.jsx'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<PaginaInici />} />
        <Route path="tasques" element={<PaginaTasques />} />
        <Route path="*" element={<PaginaNoTrobada />} />
      </Route>
    </Routes>
  )
}
```

- `index` fa que `PaginaInici` sigui la ruta filla per defecte.
- `tasques` és relatiu al layout, així que equival a `/tasques`.
- `*` captura les rutes desconegudes i les mostra dins del layout.

**Comprovació:** les pàgines Inici i Tasques continuen funcionant, i el layout no es duplica.

### Esglaó 4 — Comprovar `NavLink` i la ruta 404

1. Ves a Inici: «Inici» ha d'estar destacat i «Tasques» no.
2. Ves a Tasques: «Tasques» ha d'estar destacat i «Inici» no.
3. Entra a `/ruta-inexistent`: ha d'aparèixer la pàgina 404 amb la capçalera.
4. Torna a l'inici des del 404.
5. Comprova que `NavLink` afegeix `aria-current="page"` a l'enllaç actiu.

**Comprovació:** el menú reflecteix la ruta actual i la 404 no deixa l'usuari sense sortida.

### Esglaó 5 — Revisar l'accessibilitat i el codi

- El `<nav>` té `aria-label`.
- Els enllaços es poden fer servir amb el teclat.
- L'estat actiu no depèn només del color: pots afegir un subratllat o un canvi de fons.
- No hi ha un `BrowserRouter` duplicat.
- No hi ha cap `<a href>` per a una ruta interna.
- La consola no mostra avisos de `key` ni errors de router.

**Comprovació:** pots navegar amb Tab i Enter, i el focus és visible.

### Repte opcional

Afegeix una pàgina `/sobre` amb un text curt i un enllaç al menú. Comprova:

- que la ruta apareix dins del layout;
- que `NavLink` la marca com a activa;
- que la 404 continua funcionant per a rutes que no existeixen.

No cal afegir-la a la solució base.

---

## 4. Activitat 3 — Detall dinàmic d'una tasca

**Objectiu:** crear la ruta `/tasques/:id`, enllaçar cada tasca amb el seu detall, llegir l'`id` amb `useParams` i tornar a la llista després d'eliminar amb `useNavigate`.

**Temps estimat:** 30 minuts a classe i 20 minuts de treball posterior.

**Punt de partida:** la solució de l'Activitat 2, amb el `Layout`, el `NavLink` i la pàgina 404.

### Esglaó 1 — Afegir la ruta dinàmica

A `App.jsx`, afegeix una ruta filla dins del `Layout`:

```jsx
<Route path="tasques/:id" element={<PaginaTasca />} />
```

La ruta ha de quedar **després** de `tasques` per llegibilitat, encara que React Router sap triar la coincidència més específica.

**Comprovació:** en visitar `/tasques/prova`, no ha de sortir la 404 genèrica; encara que no existeixi la tasca, ha de ser `PaginaTasca` qui mostri el missatge adequat.

### Esglaó 2 — Crear `PaginaTasca`

1. Crea `src/pages/PaginaTasca.jsx`.
2. Importa `Link`, `useNavigate` i `useParams`.
3. Importa `useTasques` i `Targeta`.
4. Llegeix `id` amb `useParams()`.
5. Busca la tasca amb `tasques.find(...)`.
6. Si no existeix, mostra una targeta «Tasca no trobada» amb un enllaç a `/tasques`.
7. Si existeix, mostra el text, l'estat i l'identificador.
8. Afegeix botons per canviar l'estat i per eliminar.

L'os del component:

```jsx
import { Link, useNavigate, useParams } from 'react-router'
import Boto from '../components/Boto.jsx'
import Targeta from '../components/Targeta.jsx'
import { useTasques } from '../context/TasquesContext.js'

function PaginaTasca() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { tasques, toggleTasca, eliminaTasca } = useTasques()

  const tasca = tasques.find((candidata) => candidata.id === id)

  if (!tasca) {
    return (
      <Targeta titol="Tasca no trobada">
        <p>No existeix cap tasca amb aquest identificador.</p>
        <Link to="/tasques">Torna a les tasques</Link>
      </Targeta>
    )
  }

  function elimina() {
    eliminaTasca(tasca.id)
    navigate('/tasques', { replace: true })
  }

  return (
    <div>
      <h2>{tasca.text}</h2>
      <p>Estat: {tasca.feta ? 'Feta' : 'Pendent'}</p>
      <Boto variant="secundari" onClick={() => toggleTasca(tasca.id)}>
        {tasca.feta ? 'Marca com a pendent' : 'Marca com a feta'}
      </Boto>
      <Boto variant="perill" onClick={elimina}>
        Elimina
      </Boto>
      <Link to="/tasques">Torna a les tasques</Link>
    </div>
  )
}
```

**Comprovació:** una URL amb un `id` inexistent mostra el missatge, no una pantalla blanca.

### Esglaó 3 — Enllaçar cada tasca

A `src/components/Tasca.jsx`:

1. Importa `Link`.
2. Afegeix un enllaç «Detall» dins de l'element de la tasca.
3. Fes que l'adreça inclogui l'`id`:

```jsx
<Link to={`/tasques/${tasca.id}`}>Detall</Link>
```

Pots posar l'enllaç abans del botó «Elimina» o en una fila d'accions. Comprova que en mòbil no es trenca la fila: `flex-wrap` és una bona ajuda.

**Comprovació:** cada tasca té un enllaç que porta a la seva pròpia adreça i no a la d'una altra.

### Esglaó 4 — Provar el detall i la tornada

1. Afegeix una tasca.
2. Fes clic a «Detall».
3. Comprova que la URL és `/tasques/<id>` i que el text és correcte.
4. Marca-la com a feta des del detall.
5. Torna a la llista: l'estat ha d'haver canviat.
6. Torna al detall i elimina-la: has de tornar a `/tasques` i la tasca no hi ha de ser.
7. Prem «Enrere» després d'eliminar: no has de tornar al detall d'una tasca eliminada gràcies a `replace: true`.

**Comprovació:** el detall i la llista comparteixen el mateix estat del provider.

### Esglaó 5 — Treball posterior: recàrregues i IDs invàlids

Fes aquestes comprovacions després de completar el flux principal de detall i navegació:

1. Recarrega directament `/tasques/<id>`: la tasca ha de continuar existint si ja estava a `localStorage`.
2. Entra a `/tasques/inventat`: ha d'aparèixer «Tasca no trobada».
3. Comprova que l'`id` de la URL és el mateix que el `id` de la tasca, no un índex de l'array.
4. Obre la consola: no hi ha d'haver errors.
5. Comprova que les tasques i el filtre continuen persistint després de navegar.

**Comprovació:** la ruta dinàmica funciona amb dades reals i amb dades que no existeixen.

### Esglaó 6 — Treball posterior: revisar l'experiència

- El detall té un enllaç clar per tornar.
- El botó d'eliminar no es confon amb un enllaç de navegació.
- L'estat «Feta»/«Pendent» és visible.
- L'identificador llarg no trenca el disseny (`break-all` o `break-words`).
- La pàgina 404 i la tasca no trobada tenen missatges diferents: una ruta incorrecta no és el mateix que una tasca eliminada.

**Comprovació:** una persona que arriba directament a l'adreça entén què ha passat i com tornar.

### Repte opcional

- Afegeix un botó «Torna enrere» amb `navigate(-1)` i compara'l amb l'enllaç explícit a `/tasques`. Quin és més previsible si algú obre el detall directament?
- Obre el detall després de filtrar per «Pendents» i torna: el filtre s'ha de conservar perquè viu al provider.

---

## 5. Criteris de comprovació

Marca cada criteri quan el compleixis:

- [ ] Has continuat dins del projecte `hola-mon`; no n'has creat un de nou.
- [ ] `react-router@8.5.0` és a `package.json`.
- [ ] `main.jsx` embolcalla l'aplicació amb un sol `BrowserRouter`.
- [ ] `TasquesProvider` i `FiltreTasquesProvider` estan per sobre de `Routes`.
- [ ] La ruta `/` mostra `PaginaInici`.
- [ ] La ruta `/tasques` mostra `PaginaTasques`.
- [ ] La ruta `/tasques/:id` mostra `PaginaTasca`.
- [ ] Una ruta desconeguda mostra `PaginaNoTrobada` amb `path="*"`.
- [ ] La navegació interna fa servir `Link` o `NavLink`, no `<a href>`.
- [ ] `Layout` conté `<Outlet />` i les pàgines filles s'hi renderitzen.
- [ ] `NavLink` marca la pàgina activa i `/` té `end`.
- [ ] `useParams()` llegeix l'`id` i la tasca es busca pel seu `id`.
- [ ] (Treball posterior) Un `id` inexistent mostra «Tasca no trobada», no una pantalla blanca.
- [ ] `useNavigate()` torna a `/tasques` després d'eliminar.
- [ ] El detall i la llista comparteixen l'estat del `TasquesProvider`.
- [ ] Les tasques i el filtre sobreviuen a la navegació. (La recàrrega directa és treball posterior.)
- [ ] El comptador és estat local de `PaginaInici` i s'ha explicat per què es reinicia.
- [ ] (Treball posterior) Recarregar directament `/tasques` o `/tasques/:id` funciona en desenvolupament.
- [ ] Saps què cal configurar en un servidor estàtic per publicar `BrowserRouter`.
- [ ] No hi ha errors de router ni avisos de `key` a la consola.
- [ ] Tailwind continua funcionant i el focus és visible.
- [ ] No has posat la solució dins dels enunciats de les activitats.

La comprovació d'IDs invàlids, les recàrregues directes i la revisió visual/focus es completen com a treball posterior.

---

## 6. Continua el projecte

Guarda `hola-mon` amb les rutes funcionant. A la [Fitxa 07](Fitxa07.md) consumiràs **APIs públiques** des de React: càrrega de dades, estats de càrrega i error, respostes niuades i cancel·lació de peticions. També pots aprofitar per publicar el projecte i comprovar la reescriptura de rutes en un servei real.

No cal tornar a executar `npm create vite` ni canviar els providers. La navegació és una capa nova sobre el projecte acumulatiu.

---

## 7. Recursos

- React Router, documentació oficial: <https://reactrouter.com/>
- `BrowserRouter`: <https://reactrouter.com/api/declarative-routers/BrowserRouter>
- `Routes` i `Route`: <https://reactrouter.com/api/components/Routes>
- `Link`: <https://reactrouter.com/api/components/Link>
- `NavLink`: <https://reactrouter.com/api/components/NavLink>
- `Outlet`: <https://reactrouter.com/api/components/Outlet>
- `useParams`: <https://reactrouter.com/api/hooks/useParams>
- `useNavigate`: <https://reactrouter.com/api/hooks/useNavigate>
- `Navigate`: <https://reactrouter.com/api/components/Navigate>
- API d'historial del navegador: <https://developer.mozilla.org/ca/docs/Web/API/History_API>
- Publicació d'una SPA amb Vite: <https://vite.dev/guide/static-deploy.html>
- Reescritures a Netlify: <https://docs.netlify.com/routing/redirects/rewrites-proxies/>
