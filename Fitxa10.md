# Fitxa 10 — Proves amb Vitest i React Testing Library

> **Objectiu general:** aprendre a escriure proves automàtiques per al projecte `hola-mon`: provar el reducer, els thunks de Redux Toolkit i la interfície amb React Testing Library, sense dependre de `json-server` durant les proves.

- **Temps estimat:** 3 sessions de 60 minuts.
- **Requisits previs:** haver completat la [Fitxa 09](Fitxa09.md) o tenir un `hola-mon` equivalent amb Redux Toolkit i el CRUD de tasques.
- **Projecte:** **no en crees un de nou**. Treballes dins de `hola-mon`.
- **Versions utilitzades:** React 19.3.1, Vite 8.3.4, Tailwind CSS 4.3.3, `react-router` 8.5.0, `json-server` 1.0.0-beta.15, `@reduxjs/toolkit` 2.13.0, `react-redux` 9.3.0, Vitest 5.0.5, React Testing Library 16.3.3, `@testing-library/jest-dom` 7.0.1, `@testing-library/user-event` 14.6.8, `@testing-library/dom` 10.4.2 i `jsdom` 30.1.3.
- **Node:** `>=22.22.2`. El taller fa servir Node 22.22.3. `jsdom` 30 necessita com a mínim 22.22.2.
- **Dependències noves de desenvolupament:** `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`, `@testing-library/user-event`.
- **API local:** **no cal** `npm run api` per executar les proves. Les proves simulen l’API. Continues necessitant `npm run api` per provar l’aplicació a mà.

> **Nota:** els tests no proven coses “màgiques” del navegador. Provaran funcions, reducers, thunks i components en un entorn simulat (`jsdom`). Això ens dona rapidesa i estabilitat.

> **Important:** no volem provar detalls interns com “quin `useState` s’ha cridat” o “quantes vegades s’ha renderitzat un component”. Volem provar **comportament observable**: què veu l’usuari i què passa quan interactua.

## Continguts

1. Teoria
   - Per què provar
   - Tipus de proves
   - Vitest i l’entorn de proves
   - Instal·lació i configuració
   - `describe`, `it`, `expect`
   - Estructura AAA
   - Testing Library: consultes per rol, etiqueta i text
   - Matchers de `jest-dom`
   - `userEvent` i accions d’usuari
   - Proves asíncrones: `findBy` i `waitFor`
   - Mocks amb `vi.mock`
   - Provar reducers
   - Provar thunks
   - Provar components amb Redux, Router i context
   - Neteja, aïllament i bones pràctiques
   - Comandes
   - Resum
2. Activitat 1 — Configurar Vitest i provar el reducer
3. Activitat 2 — Provar els thunks amb l’API simulada
4. Activitat 3 — Provar la interfície amb Testing Library
5. Criteris de comprovació
6. Continua el projecte
7. Recursos

---

## 1. Teoria

> **Com llegir aquesta teoria:** els fragments de codi i les comandes són exemples de referència, no passos que cal executar o copiar automàticament. Fes canvis i proves quan un esglaó de les activitats t'ho demani; si hi remet, adapta-hi l'exemple al teu projecte.

### 1.1 Per què provar

Una prova automàtica és codi que comprova que una part de l’aplicació fa el que esperem. Serveix per:

- detectar regressions quan canviem codi;
- documentar el comportament esperat;
- poder refactoritzar amb més seguretat;
- evitar haver de repetir sempre les mateixes proves a mà;
- pensar millor en els casos límit.

No cal provar-ho tot. Cal prioritzar:

1. la lògica que pot fallar més fàcilment;
2. el que és important per a l’usuari;
3. el que ja ha fallat alguna vegada;
4. el que és difícil de comprovar manualment.

### 1.2 Tipus de proves

| Tipus | Què prova | Exemple al projecte |
| --- | --- | --- |
| **Unitària** | Una funció o peça petita | El reducer de `tasques`. |
| **D’integració** | Diverses peces juntes | Un thunk que crida l’API i actualitza el store. |
| **De component** | Un component amb les seves dependències | `PaginaTasques` amb Redux i el filtre. |
| **De punta a punta (E2E)** | L’aplicació real en un navegador | Un navegador que crea una tasca de veritat. |

En aquesta fitxa farem proves unitàries, d’integració i de component. Les proves E2E les deixarem per a més endavant.

### 1.3 Vitest i l’entorn de proves

**Vitest** és el test runner que encaixa amb Vite. Aprofita la mateixa configuració i la mateixa transformació de mòduls.

Avantatges:

- molt ràpid;
- sintaxi semblant a Jest;
- suporta ESM;
- es configura dins de `vite.config.js`;
- té mocks, spies i mode watch.

**jsdom** simula un DOM al Node. No és un navegador real, però permet renderitzar components React i consultar l’HTML generat.

**React Testing Library** no prova els components des de dins. Els prova com un usuari:

- busca elements pel rol, l’etiqueta o el text;
- interactua amb clics, tecles i formularis;
- comprova què apareix a la pantalla.

### 1.4 Instal·lació i configuració

Instal·la les eines de desenvolupament:

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event
```

A `package.json`, afegeix les comandes:

```json
{
  "scripts": {
    "dev": "vite",
    "api": "json-server db.json --port 3001",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- `npm test` executa les proves una vegada i acaba.
- `npm run test:watch` queda escoltant canvis.

A `vite.config.js`, configura l’entorn de proves:

```js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
})
```

- `environment: 'jsdom'` dona un DOM simulat.
- `globals: true` permet fer servir `describe`, `it` i `expect` sense importar-los. Tot i així, als exemples els importem perquè quedi explícit.
- `setupFiles` executa un fitxer abans de cada fitxer de proves.

Crea `src/test/setup.js`:

```js
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.clearAllMocks()
})
```

Què fa:

- afegeix matchers com `toBeInTheDocument`;
- desmunta els components després de cada prova;
- neteja `localStorage` perquè un test no afecti el següent;
- neteja els mocks.

### 1.5 `describe`, `it` i `expect`

Un fitxer de proves té aquesta forma:

```js
import { describe, expect, it } from 'vitest'

describe('suma', () => {
  it('suma dos nombres positius', () => {
    expect(1 + 1).toBe(2)
  })

  it('suma un nombre negatiu', () => {
    expect(2 + -3).toBe(-1)
  })
})
```

- `describe` agrupa proves.
- `it` o `test` defineix una prova.
- `expect` fa una comprovació.
- Si una comprovació falla, Vitest mostra el resultat esperat i el resultat real.

Els noms han de descriure el comportament:

```js
it('mostra un missatge si el text és buit', () => { ... })
```

No:

```js
it('test 1', () => { ... })
```

### 1.6 Estructura AAA

Una prova clara sol tenir tres parts:

1. **Arrange:** prepara les dades.
2. **Act:** executa l’acció.
3. **Assert:** comprova el resultat.

```js
it('afegeix una tasca creada', () => {
  // Arrange
  const estatInicial = { items: [], enviant: false }
  const novaTasca = { id: '1', text: 'Comprar pa', feta: false }

  // Act
  const estat = reducer(estatInicial, {
    type: creaTasca.fulfilled.type,
    payload: novaTasca,
  })

  // Assert
  expect(estat.items).toEqual([novaTasca])
})
```

No cal escriure els comentaris, però sí que l’ordre sigui clar.

### 1.7 Testing Library: consultes per rol, etiqueta i text

A Testing Library, la consulta més important és `screen`.

```jsx
import { render, screen } from '@testing-library/react'

render(<p>Hola món</p>)
expect(screen.getByText('Hola món')).toBeInTheDocument()
```

Ordre recomanada de consultes:

1. **Rol:** `getByRole('button', { name: 'Afegeix la tasca' })`.
2. **Etiqueta:** `getByLabelText('Nova tasca')`.
3. **Text:** `getByText('Comprar pa')`.
4. **Placeholder:** `getByPlaceholderText(...)`.
5. **Test id:** `getByTestId(...)`, només si no hi ha una altra opció.

Evita:

```js
container.querySelector('.bg-cyan-400')
```

Les classes CSS poden canviar i no representen el comportament.

Variants:

| Consulta | Quan no troba | Quan en troba més d’un |
| --- | --- | --- |
| `getBy...` | Llança error | Llança error |
| `queryBy...` | Retorna `null` | Llança error |
| `findBy...` | Reintenta i falla al cap d’un temps | Llança error |

`queryBy` és útil per comprovar que **no** hi ha un element:

```js
expect(screen.queryByText('Practicar useContext')).not.toBeInTheDocument()
```

### 1.8 Matchers de `jest-dom`

Amb `@testing-library/jest-dom/vitest` tens matchers més llegibles:

```js
expect(screen.getByText('Comprar pa')).toBeInTheDocument()
expect(screen.getByRole('checkbox')).toBeChecked()
expect(screen.getByRole('button')).toBeDisabled()
expect(screen.getByText('Error')).toHaveClass('text-rose-800')
```

Els més habituals:

- `toBeInTheDocument()`
- `toBeVisible()`
- `toBeChecked()`
- `toBeDisabled()`
- `toHaveTextContent()`
- `toHaveValue()`
- `toHaveClass()`

### 1.9 `userEvent` i accions d’usuari

Per simular interaccions, fes servir `userEvent`:

```jsx
import userEvent from '@testing-library/user-event'

it('escriu al formulari', async () => {
  const user = userEvent.setup()
  render(<Formulari />)

  await user.type(screen.getByLabelText('Nova tasca'), 'Comprar pa')
  await user.click(screen.getByRole('button', { name: 'Afegeix la tasca' }))

  expect(screen.getByLabelText('Nova tasca')).toHaveValue('Comprar pa')
})
```

`userEvent` simula millor el comportament real que `fireEvent`: tecles, focus, selecció, etc. Sempre que puguis, fes servir `userEvent`.

### 1.10 Proves asíncrones: `findBy` i `waitFor`

Quan una acció és asíncrona, la pantalla no canvia immediatament. No facis `getBy` just després del clic si hi ha una petició pel mig.

```jsx
await user.click(screen.getByRole('button', { name: 'Afegeix la tasca' }))

expect(await screen.findByText('Comprar pa')).toBeInTheDocument()
```

`findBy` espera fins que l’element apareix.

Si necessites esperar una condició que no és només “apareix un element”, fes servir `waitFor`:

```jsx
await waitFor(() => {
  expect(screen.queryByText('Comprar pa')).not.toBeInTheDocument()
})
```

No facis servir `setTimeout` dins dels tests. Vitest i Testing Library ja tenen eines per esperar.

### 1.11 Mocks amb `vi.mock`

Per provar un thunk no volem cridar `json-server` de veritat. Simulem el mòdul d’API:

```js
import { vi } from 'vitest'

vi.mock('../../api/tasques.js', () => ({
  obteTasques: vi.fn(),
  creaTasca: vi.fn(),
  actualitzaTasca: vi.fn(),
  eliminaTasca: vi.fn(),
}))
```

Després, al test:

```js
import * as api from '../../api/tasques.js'

api.obteTasques.mockResolvedValue([{ id: '1', text: 'Prova', feta: false }])
```

- `mockResolvedValue` simula una promesa que va bé.
- `mockRejectedValue` simula una promesa que falla.
- `vi.fn()` crea una funció simulada.
- `toHaveBeenCalledWith(...)` comprova amb quins arguments s’ha cridat.

> **Important:** `vi.mock` es carrega abans que els imports del fitxer. Per això la fàbrica del mock no pot dependre de variables que es defineixin després.

### 1.12 Provar reducers

Els reducers són funcions pures: reben estat i acció, i retornen estat nou. Són ideals per provar-los.

```js
import reducer, { creaTasca } from './tasquesSlice.js'

it('afegeix una tasca creada', () => {
  const estat = reducer(undefined, {
    type: creaTasca.fulfilled.type,
    payload: { id: '1', text: 'Comprar pa', feta: false },
  })

  expect(estat.items).toHaveLength(1)
})
```

Podem provar directament les accions que genera `createAsyncThunk`:

```js
{
  type: carregarTasques.pending.type
}
```

També podem comprovar que l’estat inicial és correcte:

```js
expect(reducer(undefined, { type: '@@INIT' })).toEqual(ESTAT_INICIAL)
```

### 1.13 Provar thunks

Un thunk necessita un store. Podem crear’n un de proves:

```js
import { configureStore } from '@reduxjs/toolkit'
import reducer from './tasquesSlice.js'

function crearStore() {
  return configureStore({
    reducer: {
      tasques: reducer,
    },
  })
}
```

I executar-lo:

```js
const store = crearStore()
await store.dispatch(carregarTasques()).unwrap()

expect(store.getState().tasques.items).toHaveLength(2)
```

Si volem començar amb dades concretes:

```js
const store = configureStore({
  reducer: {
    tasques: reducer,
  },
  preloadedState: {
    tasques: {
      items: [{ id: '1', text: 'Prova', feta: false }],
      carregant: false,
      error: null,
      enviant: false,
      errorAccio: null,
    },
  },
})
```

`preloadedState` és especialment útil per provar components sense fer cap càrrega.

### 1.14 Provar components amb Redux, Router i context

`PaginaTasques` necessita:

- `Provider` de Redux;
- `MemoryRouter` perquè `Tasca` fa servir `Link`;
- `FiltreTasquesProvider` perquè la llista fa servir el filtre.

Podem crear una utilitat de test:

```jsx
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { configureStore } from '@reduxjs/toolkit'
import tasquesReducer from '../features/tasques/tasquesSlice.js'
import FiltreTasquesProvider from '../context/FiltreTasquesProvider.jsx'

export function crearStoreTest({ items = [] } = {}) {
  return configureStore({
    reducer: { tasques: tasquesReducer },
    preloadedState: {
      tasques: {
        items,
        carregant: false,
        error: null,
        enviant: false,
        errorAccio: null,
      },
    },
  })
}

export function renderAmbProviders(ui, { store = crearStoreTest() } = {}) {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <FiltreTasquesProvider>{ui}</FiltreTasquesProvider>
      </MemoryRouter>
    </Provider>,
  )
}
```

Així els tests no repeteixen la configuració.

`MemoryRouter` és un router de proves que no toca la URL del navegador.

### 1.15 Neteja, aïllament i bones pràctiques

- Cada test ha de ser independent.
- Neteja `localStorage` entre tests.
- Neteja els mocks entre tests.
- No facis dependre un test de l’ordre d’un altre.
- No provis classes de Tailwind.
- No provis detalls interns si pots provar comportament.
- No facis servir `setTimeout` dins dels tests.
- No cridis l’API real si pots simular-la.
- Escriu noms de test que descriguin el comportament.
- Si un test falla, llegeix el primer error i mira l’HTML amb `screen.debug()` si cal.

### 1.16 Comandes

```bash
# Executar totes les proves una vegada
npm test

# Mode watch
npm run test:watch

# Executar un sol fitxer
npx vitest run src/features/tasques/tasquesSlice.test.js

# Executar tests que continguin un text
npx vitest run -t "afegeix"

# Compilar l'aplicació
npm run build
```

### 1.17 Resum

1. Vitest executa les proves; jsdom simula el DOM.
2. React Testing Library prova des del punt de vista de l’usuari.
3. `describe`, `it` i `expect` són la base.
4. Segueix l’estructura Arrange-Act-Assert.
5. Consulta per rol, etiqueta o text, no per classes CSS.
6. `userEvent` simula l’usuari millor que `fireEvent`.
7. `findBy` i `waitFor` gestionen l’asincronia.
8. `vi.mock` permet simular l’API.
9. Els reducers es proven directament.
10. Els thunks es proven amb un store de proves.
11. Els components es proven amb els providers necessaris.
12. Un test ha de ser independent i fàcil de llegir.

---

## 2. Activitat 1 — Configurar Vitest i provar el reducer

**Objectiu:** configurar Vitest i escriure les primeres proves del reducer de `tasques`.

**Temps estimat:** 45 minuts.

### Esglaó 1 — Instal·lar les eines

Instal·la:

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event
```

Afegeix `test` i `test:watch` als scripts de `package.json`.

### Esglaó 2 — Configurar `vite.config.js`

Fes servir `defineConfig` de `vitest/config`, configura `environment: 'jsdom'` i indica el fitxer de setup.

### Esglaó 3 — Crear el setup

Crea `src/test/setup.js` amb:

- `@testing-library/jest-dom/vitest`;
- `cleanup`;
- neteja de `localStorage`;
- neteja de mocks.

### Esglaó 4 — Escriure les proves del reducer

Crea `src/features/tasques/tasquesSlice.test.js`.

Prova com a mínim:

1. l’estat inicial;
2. `carregarTasques.pending`;
3. `carregarTasques.fulfilled`;
4. `carregarTasques.rejected`;
5. `creaTasca.fulfilled`;
6. `actualitzaTasca.fulfilled`;
7. `eliminaTasca.fulfilled`;
8. `creaTasca.pending`;
9. `creaTasca.rejected`.

Per crear les accions, fes servir els tipus que genera RTK:

```js
{
  type: carregarTasques.fulfilled.type,
  payload: [TASCA],
}
```

### Esglaó 5 — Executar

```bash
npm test
```

Han de passar totes les proves. Si falla alguna, comprova:

- que l’estat inicial sigui exactament el que esperes;
- que facis servir `payload` quan toca;
- que els noms de les propietats coincideixin amb el slice.

### Repte opcional

Afegeix una prova que comprovi que el reducer **no muta** l’estat original:

```js
const abans = structuredClone(estatInicial)
reducer(estatInicial, { type: creaTasca.fulfilled.type, payload: TASCA })
expect(estatInicial).toEqual(abans)
```

---

## 3. Activitat 2 — Provar els thunks amb l’API simulada

**Objectiu:** provar la integració entre els thunks, el store i l’API, sense `json-server`.

**Temps estimat:** 50 minuts.

### Esglaó 1 — Simular el mòdul d’API

Crea `src/features/tasques/tasquesThunks.test.js`.

Fes `vi.mock('../../api/tasques.js', ...)` i defineix les quatre funcions:

- `obteTasques`;
- `creaTasca`;
- `actualitzaTasca`;
- `eliminaTasca`.

### Esglaó 2 — Crear un store de proves

Crea una funció `crearStore(items = [])` amb `configureStore` i `preloadedState`.

No facis servir el store real de `src/store/store.js` per als tests: aquest store és global i pot arrossegar estat entre proves.

### Esglaó 3 — Provar els casos feliços

Prova:

1. `carregarTasques` desa les tasques;
2. `creaTasca` afegeix la tasca retornada;
3. `actualitzaTasca` substitueix la tasca;
4. `eliminaTasca` treu la tasca.

Comprova també amb quins arguments s’ha cridat l’API:

```js
expect(api.creaTasca).toHaveBeenCalledWith('Comprar pa')
```

### Esglaó 4 — Provar els errors

Prova:

- una càrrega que falla amb `TypeError`;
- una creació que falla amb un `Error` normal.

Comprova que:

- `carregant` torna a `false`;
- `enviant` torna a `false`;
- `error` o `errorAccio` contenen el missatge esperat.

### Esglaó 5 — Executar

```bash
npm test
```

No cal tenir `npm run api` en marxa.

### Repte opcional

Afegeix una prova que comprovi que `enviant` és `true` mentre la promesa de `creaTasca` encara no s’ha resolt. Necessitaràs una promesa controlada manualment amb `Promise.withResolvers()` o una promesa pròpia.

---

## 4. Activitat 3 — Provar la interfície amb Testing Library

**Objectiu:** provar `PaginaTasques` com ho faria un usuari: veure tasques, filtrar, crear, eliminar, marcar com a feta i veure errors.

**Temps estimat:** 55 minuts.

### Esglaó 1 — Crear la utilitat de render

Crea `src/test/renderAmbProviders.jsx` amb:

- `crearStoreTest`;
- `renderAmbProviders`;
- `Provider`;
- `MemoryRouter`;
- `FiltreTasquesProvider`.

La funció ha de permetre passar un store amb dades inicials.

### Esglaó 2 — Provar la renderització

Crea `src/pages/PaginaTasques.test.jsx`.

Prova que:

- es veuen les tasques;
- els comptadors són correctes;
- el missatge de càrrega apareix quan `carregant` és `true`.

### Esglaó 3 — Provar interaccions

Prova que:

1. el filtre `Fetes` amaga les tasques pendents;
2. el formulari crea una tasca;
3. el botó d’eliminar treu la tasca;
4. la casella marca la tasca com a feta;
5. un error de creació es mostra a la pantalla.

Fes servir `userEvent` i `findBy`/`waitFor`.

### Esglaó 4 — Executar

```bash
npm test
```

Els tests no han de fer cap petició real. Si veus errors de `fetch`, revisa que hagis simulat `src/api/tasques.js`.

### Esglaó 5 — Comprovar que l’aplicació real continua funcionant

```bash
npm run api
npm run dev
```

Els tests no substitueixen la prova manual de l’aplicació.

### Repte opcional

Afegeix una prova per a `PaginaTasca` amb `MemoryRouter` i una ruta `/tasques/2`, comprovant que es veu el text de la tasca i que es pot editar.

---

## 5. Criteris de comprovació

- [ ] Has continuat dins del projecte `hola-mon`.
- [ ] Has instal·lat Vitest, jsdom i les llibreries de Testing Library.
- [ ] `vite.config.js` té l’entorn `jsdom` i el fitxer de setup.
- [ ] `src/test/setup.js` neteja entre tests.
- [ ] Existeixen proves del reducer.
- [ ] Existeixen proves dels thunks.
- [ ] Existeixen proves de `PaginaTasques`.
- [ ] Els tests no criden `json-server`.
- [ ] Els tests es poden executar amb `npm test` sense `npm run api`.
- [ ] Les consultes fan servir rols, etiquetes o text.
- [ ] S’utilitza `userEvent` per a les interaccions.
- [ ] S’utilitzen `findBy` o `waitFor` per a l’asincronia.
- [ ] Els mocks es netegen entre tests.
- [ ] `localStorage` es neteja entre tests.
- [ ] No es proven classes de Tailwind ni detalls interns innecessaris.
- [ ] `npm run build` continua funcionant.
- [ ] L’aplicació real continua funcionant amb `npm run api` i `npm run dev`.

## 6. Continua el projecte

Guarda `hola-mon` amb les proves funcionant.

A la **[Fitxa 11](Fitxa11.md)** farem el pas següent: **accessibilitat i desplegament**. Revisarem l’aplicació amb eines automàtiques, millorarem el teclat i el focus, prepararem el build de producció i mirarem com publicar-la.

No cal tornar a crear el projecte. Les proves són una capa nova sobre el mateix `hola-mon`.

## 7. Recursos

- Vitest: <https://vitest.dev/>
- React Testing Library: <https://testing-library.com/docs/react-testing-library/intro/>
- Testing Library, consultes: <https://testing-library.com/docs/queries/about/>
- `jest-dom`: <https://github.com/testing-library/jest-dom>
- `user-event`: <https://testing-library.com/docs/user-event/intro/>
- jsdom: <https://github.com/jsdom/jsdom>
- Redux Toolkit, proves: <https://redux.js.org/usage/writing-tests>
- Vitest, mocks: <https://vitest.dev/api/vi.html>
- `configureStore`: <https://redux-toolkit.js.org/api/configureStore>
