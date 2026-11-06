# Fitxa 09 — Redux Toolkit: estat global i asincronia

> **Objectiu general:** passar la gestió de les tasques de `hola-mon` a **Redux Toolkit (RTK)**, aprendre a crear un store, slices, selectors i thunks asíncrons, i mantenir el filtre a `localStorage` perquè no tot ha d'anar al store.

- **Temps estimat:** 3 sessions de 60 minuts.
- **Requisits previs:** haver completat la [Fitxa 08](Fitxa08.md) o tenir un `hola-mon` equivalent amb el CRUD de tasques contra `json-server`.
- **Projecte:** **no en crees un de nou**. Treballes dins de `hola-mon`.
- **Versions utilitzades:** React 19.3.1, Vite 8.3.4, Tailwind CSS 4.3.3, `react-router` 8.5.0, `json-server` 1.0.0-beta.15, `@reduxjs/toolkit` 2.13.0 i `react-redux` 9.3.0.
- **Node:** `>=22.22.0`.
- **Dependències noves:** `@reduxjs/toolkit` i `react-redux`.
- **API local:** continues necessitant `npm run api` en una terminal i `npm run dev` en una altra.

> **Nota important:** aquesta fitxa **no explica `useReducer` com a pas previ**. Redux també treballa amb reducers, però `createSlice` amaga la part més repetitiva: els `switch`, els tipus d'acció a mà i els objectes `{ type, payload }`.

> **No fem Redux clàssic:** no farem servir `createStore`, `connect`, `combineReducers` manual ni `redux-thunk` per separat. Farem servir **Redux Toolkit**, que és la manera recomanada actualment.

> **No tot va al store:** les tasques sí; el filtre de la interfície continua al `FiltreTasquesProvider` i a `localStorage`. Això és deliberat.

## Continguts

1. Teoria
   - On som i per què Redux
   - Redux Toolkit vs Redux clàssic
   - Store, slice, action, reducer, dispatch i selector
   - Instal·lació i estructura
   - `configureStore`
   - `createSlice` i Immer
   - `Provider`, `useSelector` i `useDispatch`
   - Thunks asíncrons amb `createAsyncThunk`
   - El hook `useTasques`
   - El filtre continua al context
   - Redux DevTools
   - Resum
2. Activitat 1 — Store i càrrega de tasques
3. Activitat 2 — Crear i eliminar amb thunks
4. Activitat 3 — Actualitzar, selectors i DevTools
5. Criteris de comprovació
6. Continua el projecte
7. Recursos

---

## 1. Teoria

> **Com llegir aquesta teoria:** els fragments de codi i les comandes són exemples de referència, no passos que cal executar o copiar automàticament. Fes canvis i proves quan un esglaó de les activitats t'ho demani; si hi remet, adapta-hi l'exemple al teu projecte.

### 1.1 On som i per què Redux

A la Fitxa 08, `TasquesProvider` ja acumulava molta responsabilitat:

- `tasques`;
- `carregant`;
- `error`;
- `errorAccio`;
- `enviant`;
- accions per carregar, crear, actualitzar i eliminar;
- validació i missatges d'error.

Això funciona, però el provider comença a ser gran. Quan diverses parts de l'aplicació necessiten llegir i modificar el mateix estat, podem optar per:

1. **Continuar amb Context i `useState`.** És la solució més senzilla i, per a aquest projecte, perfectament vàlida.
2. **Passar a `useReducer`.** Agrupa les transicions en un reducer, però el `switch` i els tipus d'acció fan molta cerimònia.
3. **Passar a Redux Toolkit.** Centralitza l'estat en un store, dona DevTools, thunks i una estructura comuna.

Aquesta fitxa tria la tercera opció perquè és la que es troba més sovint en equips professionals i perquè RTK elimina bona part de la verbositat del Redux clàssic.

#### Context vs Redux

| Context + hooks | Redux Toolkit |
| --- | --- |
| Molt menys codi inicial. | Més estructura i més conceptes. |
| Ideal per a estat local o poc compartit. | Ideal per a estat global compartit. |
| No té DevTools pròpies. | Redux DevTools integrat. |
| Les accions són funcions del provider. | Les accions passen pel `dispatch`. |
| Pot acabar amb un provider enorme. | El codi es divideix en slices. |
| No necessita dependències. | Necessita `@reduxjs/toolkit` i `react-redux`. |

No és que Redux sigui "millor" que Context. És una eina diferent. En aquest projecte l'aprofitarem perquè les tasques són l'estat principal de l'aplicació.

> **Regla pràctica:** si l'estat només el necessita un component o una branca petita, no el posis al store. El filtre no hi anirà.

### 1.2 Redux Toolkit vs Redux clàssic

El Redux clàssic obligava a escriure molt de codi:

- tipus d'acció en constants;
- action creators a mà;
- `switch` al reducer;
- `combineReducers`;
- `applyMiddleware`;
- `connect` per connectar components.

Redux Toolkit inclou:

- `configureStore`;
- `createSlice`;
- `createAsyncThunk`;
- Immer per escriure actualitzacions més llegibles;
- Redux DevTools;
- `redux-thunk` ja integrat.

Per això, quan sentis "Redux" en un projecte nou, pensa en **Redux Toolkit**. El Redux clàssic encara existeix, però no és el punt de partida recomanat.

### 1.3 Store, slice, action, reducer, dispatch i selector

Aquestes són les peces bàsiques:

| Peça | Què és |
| --- | --- |
| **Store** | L'objecte que guarda tot l'estat global. |
| **Slice** | Una porció de l'estat amb els seus reducers i accions. |
| **Action** | Un objecte que descriu què ha passat. |
| **Reducer** | Una funció que rep estat i acció i retorna l'estat nou. |
| **Dispatch** | La funció que envia una acció al store. |
| **Selector** | Una funció que llegeix una part de l'estat. |
| **Provider** | El component que fa arribar el store a React. |

Esquema:

```text
Component
   │ dispatch(accio)
   ▼
Store  →  Reducer  →  Estat nou
   │
   └─ useSelector(selector) → Component
```

Amb RTK, les accions i els reducers es creen junts dins d'un **slice**. Això redueix el codi repetitiu.

### 1.4 Instal·lació i estructura

Instal·la les dues dependències:

```bash
npm install @reduxjs/toolkit react-redux
```

Estructura recomanada dins de `src`:

```text
src/
├── features/
│   └── tasques/
│       ├── tasquesSlice.js
│       └── tasquesSelectors.js
├── hooks/
│   ├── useLocalStorage.js
│   └── useTasques.js
├── store/
│   └── store.js
├── context/
│   └── FiltreTasquesProvider.jsx
└── ...
```

Canvis respecte de la Fitxa 08:

- `TasquesProvider` i `TasquesContext` desapareixen.
- `useTasques` passa a ser un hook que llegeix del store.
- El filtre continua al context i a `localStorage`.
- `db.json` i `npm run api` no canvien.

### 1.5 `configureStore`

El store es crea amb `configureStore`:

```js
import { configureStore } from '@reduxjs/toolkit'
import tasquesReducer from '../features/tasques/tasquesSlice.js'

const store = configureStore({
  reducer: {
    tasques: tasquesReducer,
  },
})

export default store
```

La clau `tasques` és important: defineix la forma de l'estat global.

```js
{
  tasques: {
    items: [],
    carregant: false,
    error: null,
    enviant: false,
    errorAccio: null,
  },
}
```

A l'Activitat 1 encara no tindrem `enviant` ni `errorAccio`; s'afegiran a l'Activitat 2.

`configureStore` ja:

- afegeix `redux-thunk`;
- activa Redux DevTools en desenvolupament;
- comprova que les accions i l'estat siguin serialitzables.

No cal configurar middleware a mà.

### 1.6 `createSlice` i Immer

Un slice conté l'estat inicial, els reducers i les accions:

```js
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  carregant: false,
  error: null,
}

const tasquesSlice = createSlice({
  name: 'tasques',
  initialState,
  reducers: {
    tascaAfegida(state, action) {
      state.items.push(action.payload)
    },
  },
})

export const { tascaAfegida } = tasquesSlice.actions
export default tasquesSlice.reducer
```

Fixem-nos-hi:

- `name` dona prefix a les accions: `tasques/tascaAfegida`.
- `reducers` genera automàticament els action creators.
- `state.items.push(...)` sembla una mutació, però **Immer** la converteix en una actualització immutable.
- La mutació només és segura **dins d'un reducer de Redux Toolkit**. Fora del reducer, no mutem l'estat.

Un reducer no ha de fer `fetch`, ni llegir `localStorage`, ni cridar altres funcions amb efectes. Només ha de calcular l'estat nou.

### 1.7 `Provider`, `useSelector` i `useDispatch`

A `main.jsx`, embolcalla l'aplicació amb `Provider`:

```jsx
import { Provider } from 'react-redux'
import store from './store/store.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <FiltreTasquesProvider>
          <App />
        </FiltreTasquesProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
```

`Provider` ha d'estar per sobre de qualsevol component que faci servir `useSelector` o `useDispatch`.

Per llegir estat:

```js
const tasques = useSelector((state) => state.tasques.items)
```

Per enviar accions:

```js
const dispatch = useDispatch()
dispatch(tascaAfegida(novaTasca))
```

Els selectors es poden guardar en un fitxer:

```js
export const selectTasques = (state) => state.tasques.items
export const selectCarregant = (state) => state.tasques.carregant
```

Així els components no depenen de l'estructura exacta del store.

> **Atenció:** `useSelector` compara el resultat amb `===`. Si el selector crea un array o un objecte nou a cada crida, el component es pot renderitzar més del compte. Per a càlculs derivats complexos es pot fer servir `createSelector`, però en aquesta fitxa no cal.

### 1.8 Thunks asíncrons amb `createAsyncThunk`

Un **thunk** és una funció que pot fer operacions asíncrones i després enviar accions al store.

`createAsyncThunk` genera automàticament tres accions:

- `pending`: la petició ha començat;
- `fulfilled`: ha anat bé;
- `rejected`: ha fallat.

Exemple de càrrega:

```js
import { createAsyncThunk } from '@reduxjs/toolkit'
import { obteTasques } from '../../api/tasques.js'

export const carregarTasques = createAsyncThunk(
  'tasques/carregar',
  async (_, { signal, rejectWithValue }) => {
    try {
      return await obteTasques(signal)
    } catch (error) {
      return rejectWithValue(
        "No s'han pogut carregar les tasques.",
      )
    }
  },
)
```

El reducer del slice escolta aquestes tres accions amb `extraReducers`:

```js
extraReducers: (builder) => {
  builder
    .addCase(carregarTasques.pending, (state) => {
      state.carregant = true
      state.error = null
    })
    .addCase(carregarTasques.fulfilled, (state, action) => {
      state.carregant = false
      state.items = action.payload
    })
    .addCase(carregarTasques.rejected, (state, action) => {
      state.carregant = false
      state.error = action.payload ?? action.error.message
    })
}
```

`rejectWithValue` permet enviar un missatge propi a `action.payload`. Sense `rejectWithValue`, el missatge queda a `action.error.message`.

Per saber si una acció ha funcionat des del component, fem servir `.unwrap()`:

```js
try {
  await dispatch(creaTasca(text)).unwrap()
  return true
} catch {
  return false
}
```

Això ens permet mantenir el mateix comportament que a la Fitxa 08: el formulari només es buida si la creació ha funcionat.

### 1.9 El hook `useTasques`

Els components no han de canviar gaire. Podem crear un hook que embolcalla Redux:

```js
import { useDispatch, useSelector } from 'react-redux'
import { selectTasques } from '../features/tasques/tasquesSelectors.js'
import { carregarTasques } from '../features/tasques/tasquesSlice.js'

export function useTasques() {
  const dispatch = useDispatch()
  const tasques = useSelector(selectTasques)

  function recarregaTasques() {
    dispatch(carregarTasques())
  }

  return {
    tasques,
    recarregaTasques,
  }
}
```

Avantatges:

- els components continuen fent `useTasques()`;
- la implementació pot canviar sense tocar tots els components;
- podem amagar detalls de `dispatch`;
- el codi de les accions queda en un sol lloc.

Aquest hook és una capa fina. No és obligatori, però ajuda a fer la migració progressiva.

### 1.10 El filtre continua al context

El filtre no és una dada del servidor ni una tasca. És una preferència de la interfície:

- `totes`;
- `pendents`;
- `fetes`.

Per això continua a `FiltreTasquesProvider` i a `useLocalStorage`:

```jsx
const { tasques } = useTasques()
const [filtre, setFiltre] = useLocalStorage(
  'hola-mon.filtre',
  'totes',
  esFiltreValid,
)
```

Això ens permet explicar una idea important: **no cal posar tot l'estat a Redux**. Redux és per a l'estat compartit de l'aplicació; el context pot continuar sent útil per a estat local o preferències.

Els comptadors i la llista filtrada continuen sent **estat derivat**. No es guarden al store ni a `localStorage`.

### 1.11 Redux DevTools

Redux DevTools és una extensió del navegador que permet veure:

- cada acció que s'envia;
- l'estat abans i després;
- el payload;
- els errors;
- l'historial d'accions;
- viatjar enrere en el temps.

`configureStore` l'activa per defecte en desenvolupament. No cal fer res més.

És especialment útil per comprovar:

- que `carregarTasques/pending` s'envia;
- que `carregarTasques/fulfilled` porta les tasques;
- que `creaTasca/rejected` porta el missatge d'error;
- que `state.tasques.enviant` canvia com esperaves.

No hi posis dades personals ni secrets: el store és visible des del navegador.

### 1.12 Resum

1. Redux Toolkit és la manera actual de fer Redux.
2. El **store** guarda l'estat global.
3. Un **slice** agrupa estat, reducers i accions.
4. `createSlice` genera action creators i amaga el `switch`.
5. Immer permet escriure actualitzacions com si mutessis l'estat, però només dins del reducer.
6. `Provider` fa arribar el store a React.
7. `useSelector` llegeix estat; `useDispatch` envia accions.
8. `createAsyncThunk` gestiona `pending`, `fulfilled` i `rejected`.
9. `.unwrap()` permet saber si una acció ha funcionat.
10. El filtre continua al context perquè no tot ha d'anar a Redux.

---

## 2. Activitat 1 — Store i càrrega de tasques

**Objectiu:** instal·lar Redux Toolkit, crear el store i el slice, i carregar les tasques amb un thunk, eliminant `TasquesProvider`.

**Temps estimat:** 60 minuts.

### Esglaó 1 — Instal·lar i crear l'estructura

1. Instal·la `@reduxjs/toolkit` i `react-redux`.
2. Crea `src/store/store.js`.
3. Crea `src/features/tasques/tasquesSlice.js`.
4. Crea `src/features/tasques/tasquesSelectors.js` o, si ho prefereixes, comença amb selectors dins del hook.

### Esglaó 2 — Crear el slice de càrrega

Al slice:

- defineix `initialState` amb `items`, `carregant` i `error`;
- crea el thunk `carregarTasques`;
- afegeix els casos `pending`, `fulfilled` i `rejected`;
- exporta el reducer.

De moment, per no trencar l'aplicació, pots mantenir les accions de crear, eliminar i actualitzar com a **reducers locals**. A l'Activitat 2 i 3 les connectarem a l'API.

### Esglaó 3 — Configurar el store i el Provider

A `store.js`:

- fes servir `configureStore`;
- registra el reducer amb la clau `tasques`.

A `main.jsx`:

- importa `Provider`;
- embolcalla l'aplicació;
- elimina `TasquesProvider`;
- envia `carregarTasques()` una vegada en arrencar.

### Esglaó 4 — Crear el hook `useTasques`

Crea `src/hooks/useTasques.js`:

- llegeix `items`, `carregant` i `error` amb `useSelector`;
- exposa `recarregaTasques`;
- manté les accions temporals de crear, eliminar i actualitzar;
- retorna la mateixa forma que abans, perquè els components no hagin de canviar.

Actualitza els imports dels components i de `FiltreTasquesProvider` perquè apuntin al hook nou.

### Esglaó 5 — Provar

1. Amb `npm run api` i `npm run dev`, les tasques han d'aparèixer.
2. Atura l'API i recarrega: ha d'aparèixer l'error i el botó de reintent.
3. Torna a engegar l'API i prova el reintent.
4. Comprova que el filtre continua funcionant i que es conserva.
5. Obre Redux DevTools i mira l'acció `tasques/carregar/fulfilled`.

### Repte opcional

Afegeix un selector `selectTotalTasques` i mostra el nombre total de tasques a la pàgina d'inici. Ha de ser estat derivat de `items.length`, no un estat nou.

---

## 3. Activitat 2 — Crear i eliminar amb thunks

**Objectiu:** connectar `POST` i `DELETE` a Redux amb `createAsyncThunk`, i gestionar `enviant` i `errorAccio`.

**Temps estimat:** 45 minuts.

### Esglaó 1 — Crear els thunks

A `tasquesSlice.js`, afegeix:

- `creaTasca(text)`;
- `eliminaTasca(id)`.

Tots dos han de:

- cridar les funcions de `src/api/tasques.js`;
- fer servir `rejectWithValue` per retornar un missatge clar;
- retornar la tasca creada o l'`id` eliminat.

### Esglaó 2 — Afegir els casos al reducer

A `initialState`, afegeix:

- `enviant: false`;
- `errorAccio: null`.

A `extraReducers`:

- `creaTasca.pending`: `enviant = true`, neteja `errorAccio`;
- `creaTasca.fulfilled`: `enviant = false`, afegeix la tasca;
- `creaTasca.rejected`: `enviant = false`, desa l'error;
- el mateix per a `eliminaTasca`, però filtrant l'array quan acaba bé.

### Esglaó 3 — Adaptar el hook

A `useTasques`:

- `afegeixTasca` ha de fer `dispatch(creaTasca(text)).unwrap()`;
- `eliminaTasca` ha de fer el mateix amb `eliminaTasca`;
- encapsula l'error en un `try/catch` per retornar `true` o `false`;
- exposa `enviant` i `errorAccio` llegits del store.

Els components de la Fitxa 08 ja esperen aquests valors. No els has de canviar gaire.

> **Nota:** en aquesta activitat, marcar una tasca com a feta encara pot ser local. Ho connectarem a l'Activitat 3.

### Esglaó 4 — Provar

1. Crea una tasca i comprova que apareix a `db.json`.
2. Recarrega: la tasca ha de continuar.
3. Elimina una tasca i comprova que desapareix de `db.json`.
4. Atura l'API i intenta crear o eliminar: ha d'aparèixer `errorAccio`.
5. Obre DevTools i comprova `tasques/crear/pending` i `tasques/crear/fulfilled`.

### Repte opcional

Afegeix una confirmació abans d'eliminar i comprova que, si l'usuari cancel·la, no s'envia cap acció al store.

---

## 4. Activitat 3 — Actualitzar, selectors i DevTools

**Objectiu:** completar el CRUD amb un thunk d'actualització, eliminar els reducers locals i ordenar els selectors.

**Temps estimat:** 55 minuts.

### Esglaó 1 — Crear el thunk d'actualització

A `tasquesSlice.js`, afegeix `actualitzaTasca`:

```js
export const actualitzaTasca = createAsyncThunk(
  'tasques/actualitzar',
  async ({ id, canvis }, { rejectWithValue }) => {
    try {
      return await actualitzaTascaApi(id, canvis)
    } catch (error) {
      return rejectWithValue("No s'ha pogut actualitzar la tasca.")
    }
  },
)
```

Afegeix els casos `pending`, `fulfilled` i `rejected` a `extraReducers`. Quan acabi bé, substitueix la tasca per la resposta del servidor.

### Esglaó 2 — Eliminar el reducer local

A l'Activitat 1 i 2 encara teníem un reducer `tascaActualitzada` per canviar l'estat localment. Ara:

- elimina aquest reducer;
- fes que `toggleTasca` i `actualitzaText` facin servir el thunk;
- comprova que `enviant` i `errorAccio` funcionen també en aquestes accions.

### Esglaó 3 — Ordenar els selectors

Crea `tasquesSelectors.js` amb:

- `selectTasques`;
- `selectCarregant`;
- `selectError`;
- `selectErrorAccio`;
- `selectEnviant`.

Fes que `useTasques` els faci servir. Així l'estructura del store queda encapsulada.

### Esglaó 4 — Provar el CRUD complet

1. Crea una tasca.
2. Marca-la com a feta i recarrega: ha de continuar feta.
3. Torna-la a pendent.
4. Edita el text des de `/tasques/:id`.
5. Elimina-la.
6. Atura l'API i comprova els errors.
7. Revisa les accions a Redux DevTools.

### Repte opcional

Afegeix un selector `selectTasquesFetes` i un altre `selectTasquesPendents` amb `createSelector`, i fes servir els comptadors de la interfície. Compara el resultat amb els comptadors actuals de `FiltreTasquesProvider`.

---

## 5. Criteris de comprovació

- [ ] Has continuat dins del projecte `hola-mon`.
- [ ] Has instal·lat `@reduxjs/toolkit` i `react-redux`.
- [ ] Existeix un store amb `configureStore`.
- [ ] El store té un slice `tasques`.
- [ ] `carregarTasques` és un thunk amb `pending`, `fulfilled` i `rejected`.
- [ ] `Provider` embolcalla l'aplicació.
- [ ] Els components llegeixen estat amb `useSelector` o amb `useTasques`.
- [ ] Les accions s'envien amb `dispatch`.
- [ ] `creaTasca`, `eliminaTasca` i `actualitzaTasca` són thunks.
- [ ] Els errors es gestionen amb `rejectWithValue`.
- [ ] `enviant` i `errorAccio` funcionen a crear, eliminar i actualitzar.
- [ ] El filtre continua a `FiltreTasquesProvider` i `localStorage`.
- [ ] Les tasques ja no es guarden a `localStorage`.
- [ ] `TasquesProvider` i `TasquesContext` han desaparegut.
- [ ] Redux DevTools mostra les accions.
- [ ] Les rutes `/`, `/tasques`, `/tasques/:id`, `/descobreix` i el 404 funcionen.
- [ ] `npm run build` funciona.
- [ ] No hi ha secrets ni dades personals al store.

## 6. Continua el projecte

Guarda `hola-mon` amb les tasques gestionades per Redux Toolkit i el CRUD complet funcionant.

A la [Fitxa 10](Fitxa10.md) farem un pas diferent: **proves** amb Vitest i React Testing Library. Provarem el reducer, els thunks i els components sense dependre de l'API real.

No cal tornar a crear el projecte ni canviar les rutes. Redux és una capa nova sobre el mateix `hola-mon`.

## 7. Recursos

- Redux Toolkit, documentació oficial: <https://redux-toolkit.js.org/>
- `configureStore`: <https://redux-toolkit.js.org/api/configureStore>
- `createSlice`: <https://redux-toolkit.js.org/api/createSlice>
- `createAsyncThunk`: <https://redux-toolkit.js.org/api/createAsyncThunk>
- React Redux: <https://react-redux.js.org/>
- Redux DevTools: <https://github.com/reduxjs/redux-devtools>
- Immer: <https://immerjs.github.io/immer/>
- `useSelector`: <https://react-redux.js.org/api/hooks#useselector>
- `useDispatch`: <https://react-redux.js.org/api/hooks#usedispatch>
