# Fitxa 07 — Dades remotes i APIs públiques

> **Objectiu general:** aprendre a obtenir dades d'APIs públiques des de React. Treballaràs amb funcions asíncrones, `fetch`, estats de càrrega i error, respostes JSON amb formes diferents i cancel·lació de peticions.

- **Temps estimat total:** 3 hores (2 h 5 min a classe; 15 min de lectura prèvia i 40 min de treball posterior).
- **Requisits previs:** haver completat la [Fitxa 06](Fitxa06.md) o tenir un `hola-mon` equivalent amb React Router, `Layout`, `Outlet` i les rutes `/` i `/tasques` funcionant.
- **Projecte:** **no en crees un de nou**. Treballes dins de `hola-mon`.
- **Abans de classe (15 min):** llegeix els apartats 1.2–1.4 sobre HTTP, `async`/`await` i `fetch`.
- **Versions utilitzades:** React 19.3.1, Vite 8.3.4, Tailwind CSS 4.3.3 i `react-router` 8.5.0.
- **Node:** `>=22.22.0`. Els equips del taller fan servir Node 22.22.3.
- **Dependències noves:** cap. Farem servir `fetch`, que ja forma part del navegador. No instal·larem `axios` ni cap llibreria de dades.

> **APIs sense clau:** les dues APIs obligatòries i l'API opcional d'aquesta fitxa són públiques i no necessiten cap clau. Si una API no respon en un moment concret, no vol dir que el teu codi estigui malament: comprova la consola i la pestanya Network.

> **Projecte acumulatiu:** la Fitxa 07 no canvia el model de dades, els providers ni `localStorage`. Afegeix una pàgina de consulta anomenada **Descobreix**. Les tasques continuaran funcionant exactament com fins ara.

## Continguts

1. Teoria
   - On som i què construirem
   - Què és una API i una petició HTTP
   - Asincronia, Promises i `async`/`await` (estats, ordre d'execució i errors típics)
   - `fetch` pas a pas
   - `useEffect` i càrrega de dades
   - Disseny d'estats: dades, càrrega i error
   - JSON amb formes diferents i adaptadors
   - Condicions de cursa i `AbortController`
   - APIs públiques, CORS i límits
   - Estructura final i resum
2. Activitat 1 — Un gos aleatori
3. Activitat 2 — Una llista de publicacions
4. Activitat 3 — Cancel·lar peticions i explorar respostes niuades
5. Criteris de comprovació
6. Continua el projecte
7. Recursos

---

## 1. Teoria

> **Com llegir aquesta teoria:** els fragments de codi i les comandes són exemples de referència, no passos que cal executar o copiar automàticament. Fes canvis i proves quan un esglaó de les activitats t'ho demani; si hi remet, adapta-hi l'exemple al teu projecte.

### 1.1 On som i què construirem

A la [Fitxa 06](Fitxa06.md) has convertit `hola-mon` en una aplicació amb diverses pantalles:

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

Les tasques viuen al `TasquesProvider` i es guarden a `localStorage`. El filtre també es conserva. Aquesta part no la tocarem.

Ara afegirem una pàgina nova:

```text
Layout
├── PaginaInici
├── PaginaTasques
├── PaginaTasca
├── PaginaDescobreix
│   ├── GosAleatori
│   ├── LlistaPublicacions
│   └── LlistaPersonatges
└── PaginaNoTrobada
```

La ruta serà `/descobreix` i apareixerà al menú de navegació.

Cada component d'API gestionarà les seves pròpies dades, el seu estat de càrrega i els seus errors. No necessitem context per a aquestes dades: ningú més no les comparteix. Col·locar l'estat a prop del component que el necessita és una bona decisió.

### 1.2 Què és una API i una petició HTTP

Una **API** (*Application Programming Interface*) és un contracte que permet que dos programes es comuniquin. En aquesta fitxa, el navegador fa una petició HTTP a un servidor i el servidor respon amb dades, normalment en format JSON.

Un **endpoint** és una adreça concreta de l'API. Per exemple:

```text
https://dog.ceo/api/breeds/image/random
```

Una petició té:

- un **mètode** (`GET`, `POST`, `PATCH`, `DELETE`...);
- una **URL**;
- unes **capçaleres** (*headers*);
- de vegades, un **cos** (*body*).

En aquesta fitxa només farem servir `GET`, perquè només volem llegir dades. A la [Fitxa 08](Fitxa08.md) farem servir també `POST`, `PATCH` i `DELETE` per crear un CRUD.

La resposta té:

- un **codi d'estat** (`200`, `404`, `500`...);
- unes capçaleres;
- un cos, que pot ser JSON, text, HTML o una imatge.

Pots veure tot això a les eines de desenvolupament del navegador, a la pestanya **Network**:

1. Obre les eines de desenvolupament.
2. Ves a **Network**.
3. Recarrega la pàgina o fes una acció.
4. Fes clic a la petició.
5. Revisa **Headers**, **Preview** i **Response**.

### 1.3 Asincronia, Promises i `async`/`await`

#### Per què existeix l'asincronia?

JavaScript executa el codi principal en un sol fil. Això vol dir que, si una operació triga, no pot continuar executant altres instruccions de JavaScript fins que l'operació acabi. Si esperéssim una petició de xarxa de manera bloquejant, la interfície es quedaria congelada: no podries escriure, ni fer clic, ni veure cap canvi.

Per això existeixen les operacions **asíncrones**. El navegador pot fer la petició mentre JavaScript continua amb altres feines. Quan la resposta arriba, JavaScript executa la part que havia quedat pendent.

Una analogia: demanes un cafè al bar. No et quedes mirant el cambrer sense fer res; tornes a la taula, xerres o mires el mòbil. Quan el cafè està llest, te'l porten. `await` és com dir «necessito el cafè per continuar aquesta tasca concreta», però la resta del bar continua funcionant.

#### Què és una Promise?

Una **Promise** és un objecte que representa un valor que encara no tenim. No és el valor: és la **promesa** que el valor arribarà o que hi haurà un error.

Una Promise pot estar en tres estats:

| Estat | Significat |
| --- | --- |
| **pending** | Encara no ha acabat. |
| **fulfilled** | Ha acabat correctament i té un valor. |
| **rejected** | Ha fallat i té un error. |

Quan una Promise passa a `fulfilled` o `rejected`, diem que s'ha **resolt** (*settled*). A partir d'aquí ja no canvia més.

```js
const promesa = fetch('https://exemple.com/dades')

console.log(promesa)
// Promise { <pending> }
```

Fixem-nos-hi: `promesa` **no és** la resposta de l'API. És l'objecte que ens avisarà quan la resposta estigui llesta.

Amb `.then()` podem registrar què ha de passar quan arribi el valor:

```js
fetch('https://exemple.com/dades')
  .then((resposta) => resposta.json())
  .then((dades) => console.log(dades))
  .catch((error) => console.error('Error:', error))
```

Aquesta forma funciona, però encadenar molts `.then()` pot fer el codi difícil de llegir. Aquí entren `async` i `await`.

#### De `.then()` a `async`/`await`

Aquestes dues versions fan el mateix:

**Amb `.then()`:**

```js
function carregaDades() {
  return fetch('https://exemple.com/dades')
    .then((resposta) => {
      if (!resposta.ok) {
        throw new Error(`Error HTTP ${resposta.status}`)
      }

      return resposta.json()
    })
    .then((dades) => {
      console.log(dades)
      return dades
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}
```

**Amb `async`/`await`:**

```js
async function carregaDades() {
  try {
    const resposta = await fetch('https://exemple.com/dades')

    if (!resposta.ok) {
      throw new Error(`Error HTTP ${resposta.status}`)
    }

    const dades = await resposta.json()
    console.log(dades)
    return dades
  } catch (error) {
    console.error('Error:', error)
  }
}
```

`async`/`await` no és una cosa diferent de les Promises: és una manera més còmoda d'escriure el mateix. `await` espera que una Promise es resolgui i et dona el seu valor. Si la Promise es rebutja, l'error es pot capturar amb `try`/`catch`.

#### `async`: una funció que sempre retorna una Promise

Quan marques una funció amb `async`, passa una cosa important: **sempre retorna una Promise**, encara que tu retornis un valor normal.

```js
async function suma(a, b) {
  return a + b
}

const resultat = suma(2, 3)

console.log(resultat)
// Promise resolta amb el valor 5
```

El valor `5` queda dins de la Promise. Per obtenir-lo, cal fer `await` des d'una altra funció `async` o fer servir `.then()`:

```js
async function exemple() {
  const valor = await suma(2, 3)
  console.log(valor) // 5
}
```

Dins d'una funció `async`:

- un `return` resol la Promise amb aquell valor;
- un `throw` rebutja la Promise amb aquell error.

```js
async function falla() {
  throw new Error('Alguna cosa ha fallat')
}

falla().catch((error) => {
  console.error(error.message)
})
```

`async` **no** fa que la funció s'executi en paral·lel. Només habilita l'ús de `await` i fa que el valor de retorn quedi embolcallat en una Promise.

#### `await`: esperar sense bloquejar tota l'aplicació

`await` espera el resultat d'una Promise, però **només pausa la funció `async` on es troba**. La resta de l'aplicació continua funcionant.

```js
console.log('1. Abans de cridar carrega')

async function carrega() {
  console.log('2. Dins de carrega, abans del fetch')

  const resposta = await fetch('https://exemple.com/dades')

  console.log('3. Després de la resposta')
}

carrega()

console.log('4. Després de cridar carrega')
```

L'ordre de sortida és:

```text
1. Abans de cridar carrega
2. Dins de carrega, abans del fetch
4. Després de cridar carrega
3. Després de la resposta
```

Per què? Quan `carrega()` arriba a l'`await`, la petició encara no ha acabat. La funció queda pausada i el control torna al codi que l'ha cridada. Per això s'executa el `4`. Quan arriba la resposta, la funció continua pel `3`.

Això és el que volem a React: la interfície no es congela mentre esperem l'API.

`await` només es pot fer servir:

- dins d'una funció `async`;
- o en un mòdul que admeti *top-level await*, cosa que no necessitem en aquesta fitxa.

Per tant, **no pots posar `await` directament al cos d'un component**:

```jsx
// Malament: await no és dins d'una funció async
function Component() {
  const dades = await fetch('https://exemple.com/dades')
  return <p>{dades}</p>
}
```

L'asincronia va dins d'un `useEffect`, d'un handler d'esdeveniment o d'una funció `async` auxiliar.

#### Errors: `try`/`catch` i Promises rebutjades

Quan una Promise es rebutja, l'error no desapareix: has de decidir què fer. Amb `async`/`await` ho fas amb `try`/`catch`:

```js
async function carregaDades() {
  try {
    const resposta = await fetch('https://exemple.com/dades')

    if (!resposta.ok) {
      throw new Error(`Error HTTP ${resposta.status}`)
    }

    const dades = await resposta.json()
    return dades
  } catch (error) {
    console.error('No s’han pogut carregar les dades:', error)
    throw error
  } finally {
    console.log('La petició ha acabat, bé o malament')
  }
}
```

Punts importants:

- El `catch` captura els errors de les Promises que has **esperat** amb `await` i els errors que llences amb `throw`.
- Si no fas `await`, el `catch` no pot capturar l'error d'aquella Promise.
- `finally` s'executa tant si tot va bé com si hi ha un error. És útil per desactivar un estat de càrrega.
- Si dins del `catch` tornes a fer `throw error`, l'error continua cap al codi que ha cridat la funció.

```js
async function inicia() {
  try {
    await carregaDades()
  } catch (error) {
    // Aquí arriba l'error si carregaDades() el torna a llançar
    console.error(error.message)
  }
}
```

#### Errors típics amb `async`/`await`

| Codi | Què passa | Correcció |
| --- | --- | --- |
| `const resposta = fetch(url)` | `resposta` és una Promise, no una `Response`. | `const resposta = await fetch(url)` |
| `const dades = resposta.json()` | `dades` és una Promise, no el JSON. | `const dades = await resposta.json()` |
| `console.log(dades)` abans de l'`await` | Encara no tens el valor. | Posa el `console.log` després de l'`await`. |
| `await` dins d'una funció normal | Error de sintaxi. | Marca la funció com a `async`. |
| `useEffect(async () => { ... })` | React no rep una funció de neteja vàlida. | Defineix una funció `async` a dins de l'efecte. |
| `async function Component() { ... }` | Un component ha de retornar JSX, no una Promise. | Deixa el component normal i carrega dades amb `useEffect` o un handler. |
| `dades.forEach(async (dada) => { ... })` | El `forEach` no espera les Promises. | Fes servir `for...of` i espera cada petició dins del bucle. |
| `try { fetch(url) } catch (error) { ... }` | Sense `await`, el `catch` no captura l'error de la Promise. | `try { await fetch(url) } catch ...` |

#### Resum visual

```text
fetch(url)
  │
  ├─ retorna una Promise<Response>  → pending
  │
  └─ await
       │
       ├─ fulfilled → resposta.ok? → await resposta.json() → dades
       │
       └─ rejected  → catch → missatge d'error
```

I les tres idees que has de retenir:

1. `async` converteix el valor de retorn en una Promise.
2. `await` espera una Promise dins d'una funció `async`, sense bloquejar la resta de l'aplicació.
3. `try`/`catch` només captura el que has esperat; no endevina Promises oblidades.

### 1.4 `fetch` pas a pas

`fetch` fa una petició HTTP i retorna una Promise que es resol amb un objecte `Response`.

```js
async function obteDades() {
  const resposta = await fetch('https://exemple.com/dades')

  if (!resposta.ok) {
    throw new Error(`Error HTTP ${resposta.status}`)
  }

  const dades = await resposta.json()
  return dades
}
```

Fixem-nos en tres detalls:

1. **`fetch` no llança un error pels codis 404 o 500.** La Promise es resol igualment. Per això hem de comprovar `resposta.ok`.
2. **`resposta.json()` també és asíncrona.** Cal fer `await`.
3. **Només podem llegir el cos una vegada.** Si necessites text, fes servir `resposta.text()`; si necessites JSON, `resposta.json()`.

#### Per què hi ha dos `await`?

Perquè hi ha dues operacions asíncrones diferents:

| Expressió | Què retorna | Què representa |
| --- | --- | --- |
| `fetch(url)` | `Promise<Response>` | La petició encara està en curs. |
| `await fetch(url)` | `Response` | Ja tenim les capçaleres i el codi d'estat. |
| `resposta.json()` | `Promise` | Encara s'està llegint i interpretant el cos. |
| `await resposta.json()` | Objecte o array | Ja tenim les dades JSON. |

El primer `await` espera la resposta HTTP. El segon espera el cos de la resposta i la seva conversió a objecte JavaScript. Per això no n'hi ha prou amb un sol `await`.

Un error de xarxa (per exemple, sense connexió) sí que fa que `fetch` rebutgi la Promise. Un error HTTP, en canvi, arriba com una resposta normal amb `ok: false`.

Si veus `TypeError: Failed to fetch`, normalment és un problema de xarxa o de CORS. Podem convertir aquest error en un missatge més clar per a l'usuari.

### 1.5 `useEffect` i càrrega de dades

`useEffect` serveix per sincronitzar el component amb un sistema extern: una API, el títol del document, una subscripció, etc. **No** és el lloc per gestionar clics; els clics van als seus handlers.

Per carregar dades quan el component apareix:

> **`carregant` i `setCarregant`:** és el mateix patró que `comptador` i `setComptador` de la [Fitxa 01](Fitxa01.md). `carregant` és el valor actual; `setCarregant` és la funció que el canvia. Quan crides `setCarregant(true)` o `setCarregant(false)`, React programa un nou render i el JSX s'actualitza. No has de fer `carregant = false`: això no actualitzaria la interfície.

```jsx
import { useEffect, useState } from 'react'

function Exemple() {
  const [dades, setDades] = useState(null)
  const [carregant, setCarregant] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controlador = new AbortController()

    async function carrega() {
      setCarregant(true)
      setError('')

      try {
        const resultat = await fetch('https://exemple.com/dades', {
          signal: controlador.signal,
        })

        if (!resultat.ok) {
          throw new Error(`Error HTTP ${resultat.status}`)
        }

        setDades(await resultat.json())
      } catch (err) {
        if (err.name === 'AbortError') return
        setError(err.message)
      } finally {
        if (!controlador.signal.aborted) {
          setCarregant(false)
        }
      }
    }

    carrega()

    return () => controlador.abort()
  }, [])

  // ...
}
```

#### Per què no podem fer `useEffect(async () => ...)`?

Perquè una funció `async` retorna una Promise, i `useEffect` espera que la funció de neteja sigui una funció o `undefined`. Si fem l'efecte `async`, retornem una Promise i React no pot fer servir això com a cleanup. La solució és definir una funció `async` a dins i cridar-la.

#### Dependències

El segon argument de `useEffect` és la llista de dependències:

```jsx
useEffect(() => {
  // ...
}, [])
```

- `[]`: només quan el component es munta.
- `[recarregar]`: quan canvia el comptador de recàrrega.
- Sense segon argument: després de cada render. Normalment no ho volem per a una petició.

**No posis `dades` a les dependències si dins de l'efecte actualitzes `dades`.** Provocaries un bucle: render → efecte → setDades → render → efecte...

#### StrictMode i la doble execució

En desenvolupament, `StrictMode` munta, desmunta i torna a muntar els components per ajudar-te a detectar efectes mal netejats. Per això pots veure dues peticions a la pestanya Network. No és un error: és una comprovació.

Amb `AbortController` i una neteja correcta, la primera petició es cancel·la i no actualitza l'estat del component desmuntat.

#### Un esdeveniment també pot ser asíncron

No totes les peticions s'han de fer en muntar el component. De vegades l'usuari prem un botó i volem carregar dades noves:

```jsx
async function handleRecarregar() {
  setCarregant(true)
  setError('')

  try {
    const dades = await obteDades()
    setDades(dades)
  } catch (err) {
    setError(err.message)
  } finally {
    setCarregant(false)
  }
}

<Boto onClick={handleRecarregar}>Recarregar</Boto>
```

Punts importants:

- El handler pot ser `async`.
- React **no espera** la Promise del handler: la interfície continua responent.
- El handler ha de gestionar els seus propis estats de càrrega i error.
- No escriguis `onClick={handleRecarregar()}`: això crida la funció durant el render. Has de passar la funció: `onClick={handleRecarregar}`.

En aquesta fitxa, per tornar a carregar el gos o les publicacions, farem servir un comptador dins de l'efecte. És una alternativa senzilla i ens evita duplicar la lògica de càrrega. Més endavant podràs extreure aquesta lògica en un hook.

### 1.6 Disseny d'estats: dades, càrrega i error

Per a cada API necessitem, com a mínim:

```jsx
const [dades, setDades] = useState(null)
const [carregant, setCarregant] = useState(true)
const [error, setError] = useState('')
```

No fem servir un sol booleà per a tot. Aquests tres estats permeten distingir:

- **carregant**: encara no tenim resposta;
- **error**: la petició ha fallat;
- **dades**: tenim una resposta correcta, que pot ser una llista buida.

Una representació habitual:

```jsx
{carregant && <Missatge text="Carregant..." />}

{!carregant && error && <Missatge text={error} tipus="error" />}

{!carregant && !error && dades.length === 0 && (
  <Missatge text="No hi ha dades per mostrar." />
)}

{!carregant && !error && dades.length > 0 && (
  <ul>{/* ... */}</ul>
)}
```

Quan una petició falla, no hem de mostrar dades antigues com si fossin bones. Podem conservar-les o netejar-les, però la interfície ha de ser coherent.

### 1.7 JSON amb formes diferents i adaptadors

No totes les APIs retornen el mateix. Aquesta fitxa en fa servir tres:

**Dog CEO** retorna un objecte amb una propietat `message`:

```json
{
  "message": "https://images.dog.ceo/breeds/...",
  "status": "success"
}
```

**JSONPlaceholder** retorna un array directe:

```json
[
  {
    "userId": 1,
    "id": 1,
    "title": "sunt aut facere...",
    "body": "quia et suscipit..."
  }
]
```

**Rick and Morty** retorna un objecte amb metadades i una llista:

```json
{
  "info": {
    "count": 826
  },
  "results": [
    {
      "id": 1,
      "name": "Rick Sanchez",
      "status": "Alive",
      "species": "Human",
      "image": "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
      "origin": {
        "name": "Earth"
      }
    }
  ]
}
```

La resposta real pot tenir més camps dins de `info`, però en aquesta activitat només farem servir `results`.

Per això és important **inspeccionar la resposta** abans d'escriure el JSX. Un bon hàbit:

```js
console.log(JSON.stringify(dades, null, 2))
```

Un **adaptador** és una funció que converteix la resposta de l'API al model que necessita el component. Així el component no depèn dels noms estranys de l'API:

```js
function adaptaPublicacio({ id, title, body }) {
  return {
    id,
    titol: title,
    cos: body,
  }
}
```

És més fàcil canviar d'API si la transformació viu en un sol lloc.

Quan renderitzis llistes:

```jsx
{publicacions.map((publicacio) => (
  <li key={publicacio.id}>{publicacio.titol}</li>
))}
```

La `key` ha de ser estable i única. L'índex de l'array no és una bona opció si la llista pot canviar d'ordre o de contingut.

### 1.8 Condicions de cursa i `AbortController`

Quan l'usuari prem diverses vegades el botó de recarregar, o quan canvia de pantalla mentre una petició encara està en curs, poden haver-hi dues peticions obertes alhora. Si la resposta antiga arriba després de la nova, pot sobreescriure les dades bones. Això és una **condició de cursa**.

`AbortController` ens permet cancel·lar la petició anterior quan l'efecte es torna a executar o quan el component es desmunta:

```jsx
useEffect(() => {
  const controlador = new AbortController()

  async function carrega() {
    // fetch amb { signal: controlador.signal }
  }

  carrega()

  return () => controlador.abort()
}, [recarregar])
```

Quan una petició s'avorta, `fetch` rebutja amb un error el nom del qual és `AbortError`. No l'hem de mostrar a l'usuari: no és un error real, és una cancel·lació deliberada.

```js
if (err.name === 'AbortError') return
```

No necessites cap mecanisme complex per veure una condició de cursa: n'hi ha prou que l'usuari recarregui diverses vegades seguides o que surti de la pàgina abans que arribi la resposta.

### 1.9 APIs públiques, CORS i límits

Les APIs públiques són genials per aprendre, però tenen límits:

- **CORS**: el servidor ha de permetre peticions des del navegador. Si no, veuràs un error de CORS a la consola.
- **Límits de peticions**: alguns serveis limiten quantes peticions pots fer per minut.
- **Disponibilitat**: una API pot estar caiguda o trigar. El teu codi ha de mostrar un error i permetre reintentar.
- **Canvis**: una API pot canviar el format de resposta. Per això és útil validar i adaptar.

No posis claus secretes al frontend. Qualsevol variable `VITE_*` acaba al bundle i és visible. En aquesta fitxa no necessitem cap clau.

### 1.10 Estructura final i resum

L'estructura de fitxers que tindràs en acabar:

```text
src/
├── api/
│   ├── gossos.js
│   ├── publicacions.js
│   └── personatges.js
├── components/
│   ├── api/
│   │   ├── GosAleatori.jsx
│   │   ├── LlistaPublicacions.jsx
│   │   └── LlistaPersonatges.jsx
│   ├── Layout.jsx
│   └── ...
├── pages/
│   ├── PaginaDescobreix.jsx
│   └── ...
└── App.jsx
```

Les rutes quedaran així:

| Adreça | Pantalla |
| --- | --- |
| `/` | Inici |
| `/tasques` | Tasques |
| `/tasques/:id` | Detall d'una tasca |
| `/descobreix` | Tres APIs públiques |
| `*` | Pàgina no trobada |

Resum del que has de recordar:

1. Una funció `async` sempre retorna una Promise.
2. `await` només va dins d'una funció `async` i pausa només aquella funció.
3. `fetch` és asíncrona: retorna una Promise amb la resposta HTTP.
4. Cal comprovar `resposta.ok`.
5. Cal fer `await` a `resposta.json()` perquè també retorna una Promise.
6. `useEffect` no pot ser `async` directament.
7. Cal netejar l'efecte amb `AbortController`.
8. Cal distingir càrrega, error i dades.
9. Cal adaptar les respostes i usar `key` a les llistes.
10. No posis `dades` a les dependències de l'efecte que les actualitza.

---

## 2. Activitat 1 — Un gos aleatori

**Objectiu:** fer la primera petició `fetch`, mostrar una imatge i gestionar càrrega, error i reintent.

**Temps estimat:** 40 minuts.

### Esglaó 1 — Crear el mòdul de l'API

Crea `src/api/gossos.js`.

Ha de contenir una funció `obteGosAleatori` que:

- faci `fetch` a `https://dog.ceo/api/breeds/image/random`;
- comprovi `resposta.ok`;
- llegeixi el JSON;
- validi que `status` sigui `"success"` i que `message` sigui un string;
- retorni la URL de la imatge.

Pots començar amb aquest esquelet:

```js
const URL_GOS = 'https://dog.ceo/api/breeds/image/random'

export async function obteGosAleatori(signal) {
  // 1. fetch amb { signal }
  // 2. comprova resposta.ok
  // 3. await resposta.json()
  // 4. valida el format
  // 5. retorna dades.message
}
```

### Esglaó 2 — Crear el component

Crea `src/components/api/GosAleatori.jsx`.

Ha de tenir:

- `gos` (URL de la imatge);
- `carregant`;
- `error`;
- un comptador `recarregar` per tornar a fer la petició.

L'efecte ha de dependre de `recarregar`. En aquesta primera activitat ens centrarem en la petició i els seus estats; la cancel·lació amb `AbortController` la treballarem a l'Activitat 3.

Pots fer servir aquesta estructura:

```jsx
const [gos, setGos] = useState('')
const [carregant, setCarregant] = useState(true)
const [error, setError] = useState('')
const [recarregar, setRecarregar] = useState(0)

useEffect(() => {
  const controlador = new AbortController()

  async function carrega() {
    // ...
  }

  carrega()

  return () => controlador.abort()
}, [recarregar])
```

Al JSX:

- mostra un missatge mentre carrega;
- mostra un missatge d'error si falla;
- mostra la imatge amb un `alt` descriptiu;
- posa un botó «Un altre gos» que incrementi `recarregar`;
- desactiva el botó mentre carrega.

### Esglaó 3 — Crear la pàgina i la ruta

Crea `src/pages/PaginaDescobreix.jsx` amb una `Targeta` que contingui `GosAleatori`.

Després:

1. Importa la pàgina a `App.jsx`.
2. Afegeix la ruta `descobreix`.
3. Afegeix un `NavLink` a `Layout.jsx` amb el text **Descobreix**.

Comprova que la ruta `/descobreix` funciona i que el `NavLink` es marca com a actiu.

### Esglaó 4 — Provar els tres estats

1. **Èxit:** la imatge apareix.
2. **Càrrega:** el missatge «Carregant...» apareix mentre esperes.
3. **Error:** a les eines de desenvolupament, posa la xarxa en **Offline** i fes clic a «Un altre gos». Ha d'aparèixer un missatge d'error, no una pàgina trencada.
4. Torna a activar la xarxa i comprova que el reintent funciona.

### Esglaó 5 — Revisar les peticions en desenvolupament

Obre la pestanya **Network** i recarrega la pàgina. Amb `StrictMode` pots veure dues peticions durant el desenvolupament. En aquesta activitat encara no les cancel·lem; no interpretis aquesta duplicació com un error del teu codi. A l'Activitat 3 aprendràs a netejar l'efecte amb `AbortController`.

### Repte opcional

Mostra el nom de la raça extreta de la URL de la imatge. La URL de Dog CEO té una forma semblant a:

```text
https://images.dog.ceo/breeds/husky/n02097658_1234.jpg
```

No cal cap petició extra: pots transformar el string.

---

## 3. Activitat 2 — Una llista de publicacions

**Objectiu:** carregar una llista, adaptar els camps i renderitzar-la amb `map`.

**Temps estimat:** 45 minuts.

### Esglaó 1 — Crear el mòdul de l'API

Crea `src/api/publicacions.js`.

La URL és:

```text
https://jsonplaceholder.typicode.com/posts?_limit=6
```

La funció `obtePublicacions` ha de:

- comprovar `resposta.ok`;
- comprovar que el JSON és un array;
- transformar cada element amb un adaptador:
  - `title` → `titol`;
  - `body` → `cos`;
  - conservar `id`.

### Esglaó 2 — Crear el component

Crea `src/components/api/LlistaPublicacions.jsx`.

Ha de tenir els mateixos estats que l'activitat anterior:

- `publicacions`;
- `carregant`;
- `error`;
- `recarregar`.

Al JSX:

- si carrega, mostra un missatge;
- si hi ha error, mostra'l;
- si la llista és buida, mostra un estat buit;
- si hi ha dades, renderitza una llista amb `map` i `key`;
- afegeix un botó «Tornar a carregar».

Pots fer servir una estructura de targetes:

```jsx
<ul className="grid gap-3 sm:grid-cols-2">
  {publicacions.map((publicacio) => (
    <li key={publicacio.id}>
      <h3>{publicacio.titol}</h3>
      <p>{publicacio.cos}</p>
    </li>
  ))}
</ul>
```

### Esglaó 3 — Integrar-ho a la pàgina

Afegeix una segona `Targeta` a `PaginaDescobreix` amb el títol **Publicacions remotes**.

Comprova que les dues targetes són independents: si una API falla, l'altra ha de continuar funcionant.

### Esglaó 4 — Provar

1. Les sis publicacions apareixen.
2. Cada targeta té un `key` estable.
3. El botó de recàrrega torna a fer la petició.
4. Si poses la xarxa en offline, apareix l'error.
5. Si tornes a connectar, el reintent funciona.

Si JSONPlaceholder no està disponible durant la sessió, continua amb l'estructura de resposta de l'apartat 1.7 i deixa anotat que la comprovació en viu queda pendent. No canviïs el model ni donis per fet que és un error del teu codi.

### Repte opcional

Afegeix un comptador de publicacions i un filtre local per text. El filtre no ha de fer cap petició nova: treballa sobre les dades que ja tens.

---

## 4. Activitat 3 — Cancel·lar peticions i explorar respostes niuades

**Objectiu a classe:** aplicar `AbortController` a la petició de `GosAleatori` i entendre per què cal netejar l'efecte.

**Temps estimat a classe:** 15 minuts. La implementació completa amb Rick and Morty és treball posterior opcional (uns 40 minuts).

### Esglaó 1 — Afegir cancel·lació a `GosAleatori` (obligatori a classe)

1. A `obteGosAleatori(signal)`, passa el senyal a `fetch(URL_GOS, { signal })`.
2. A l'efecte de `GosAleatori`, crea un `AbortController` i passa `controlador.signal` a `obteGosAleatori`.
3. Retorna la neteja `() => controlador.abort()`.
4. Ignora `AbortError` i evita que el `finally` actualitzi l'estat si la petició s'ha cancel·lat.
5. Canvia de ruta mentre carrega i comprova que la petició es cancel·la sense mostrar un error a l'usuari.

**Comprovació:** l'efecte es neteja en desmuntar el component i `AbortError` no apareix com un error de càrrega.

### Treball posterior opcional — Personatges de Rick and Morty

Si vols practicar també respostes niuades, completa els esglaons següents. Serveixen d'ampliació i no són necessaris per començar Fitxa 08.

### Esglaó 2 — Crear el mòdul de l'API

Crea `src/api/personatges.js`.

La URL és:

```text
https://rickandmortyapi.com/api/character
```

La funció `obtePersonatges(signal)` ha de:

- fer `fetch` a la URL;
- comprovar `resposta.ok`;
- comprovar que `dades.results` és un array;
- retornar un array de personatges adaptats amb `id`, `nom`, `estat`, `especie`, `imatge` i `origen`.

La resposta també porta metadades a `info`, però en aquesta activitat només necessitem `results`.

Recorda que `origin` és un objecte niuat:

```js
origin?.name ?? 'Desconegut'
```

### Esglaó 3 — Crear el component i els estats

Crea `src/components/api/LlistaPersonatges.jsx`.

Estats necessaris:

```jsx
const [personatges, setPersonatges] = useState([])
const [carregant, setCarregant] = useState(true)
const [error, setError] = useState('')
const [recarregar, setRecarregar] = useState(0)
```

L'efecte ha de dependre de `recarregar`:

```jsx
useEffect(() => {
  const controlador = new AbortController()

  async function carrega() {
    // ...
  }

  carrega()

  return () => controlador.abort()
}, [recarregar])
```

### Esglaó 4 — Renderitzar els personatges

Per a cada personatge, mostra:

- la imatge;
- el nom;
- l'estat;
- l'espècie;
- l'origen.

Mantén una `key` estable amb `personatge.id`.

### Esglaó 5 — Afegir el botó de recàrrega

Afegeix un botó **Tornar a carregar** que incrementi `recarregar`. Quan hi hagi un error, el mateix botó pot dir **Reintentar**.

No el desactivis mentre carrega: així podràs provar que dos clics seguits cancel·len la petició anterior.

### Esglaó 6 — Provar la cursa de peticions

1. Fes clic diverses vegades molt ràpid a **Tornar a carregar**.
2. Obre **Network** i comprova que les peticions anteriors es cancel·len.
3. Assegura't que la llista final no barreja dades de peticions antigues.
4. Força un error (offline o URL incorrecta) i comprova que apareix el missatge i el botó de reintent.
5. Surt de `/descobreix` mentre carrega i revisa que no aparegui cap avís a la consola.

### Esglaó 7 — Integrar-ho a la pàgina

Afegeix la tercera `Targeta` a `PaginaDescobreix`:

```jsx
<Targeta titol="Personatges de Rick and Morty">
  <LlistaPersonatges />
</Targeta>
```

En acabar, la pàgina `/descobreix` ha de tenir les tres targetes independents.

### Repte opcional

Afegeix un selector per filtrar els personatges per estat (`Alive`, `Dead`, `Unknown`). El filtre ha de ser local: no ha de fer cap petició nova.

---

## 5. Criteris de comprovació

Marca cada criteri quan el compleixis:

- [ ] Has continuat dins del projecte `hola-mon`; no n'has creat un de nou.
- [ ] La ruta `/descobreix` existeix i apareix al menú.
- [ ] Les dues APIs de les activitats 1 i 2 es carreguen correctament.
- [ ] Cada component té estat de càrrega, error i dades.
- [ ] Es comprova `resposta.ok` abans de llegir el JSON.
- [ ] Es fa `await` a `resposta.json()`.
- [ ] Els components mostren un error útil si l'API falla.
- [ ] Les llistes es renderitzen amb `map` i tenen `key` estable.
- [ ] La petició de `GosAleatori` es cancel·la en desmuntar el component.
- [ ] No hi ha bucles infinits ni errors d'actualització després de desmuntar.
- [ ] No hi ha claus ni secrets al codi.
- [ ] `npm run build` funciona.
- [ ] Les rutes `/`, `/tasques`, `/descobreix` i el 404 funcionen en preview.
- [ ] Les tasques i el filtre continuen funcionant com abans.

**Comprovacions del treball posterior opcional:** l'API de Rick and Morty, els camps niuats i el reintent/cancel·lació de les peticions de personatges.

## 6. Continua el projecte

Guarda `hola-mon` amb la pàgina **Descobreix** i les dues targetes obligatòries funcionant. La targeta de personatges és una ampliació opcional.

A la [Fitxa 08](Fitxa08.md) deixarem les APIs de només lectura i muntarem un **CRUD** amb `json-server`: llegirem, crearem, actualitzarem i eliminarem tasques contra una API REST local.

No cal tornar a executar `npm create vite` ni canviar els providers. Les APIs són una capa nova sobre el projecte acumulatiu.

## 7. Recursos

- `fetch`, MDN: <https://developer.mozilla.org/ca/docs/Web/API/Fetch_API/Using_Fetch>
- `async`/`await`, MDN: <https://developer.mozilla.org/ca/docs/Learn/JavaScript/Asynchronous/Promises>
- `Promise`, MDN: <https://developer.mozilla.org/ca/docs/Web/JavaScript/Reference/Global_Objects/Promise>
- `AbortController`, MDN: <https://developer.mozilla.org/ca/docs/Web/API/AbortController>
- `useEffect`, React: <https://react.dev/reference/react/useEffect>
- «You Might Not Need an Effect», React: <https://react.dev/learn/you-might-not-need-an-effect>
- Dog CEO API: <https://dog.ceo/dog-api/>
- JSONPlaceholder: <https://jsonplaceholder.typicode.com/>
- Rick and Morty API: <https://rickandmortyapi.com/documentation>
- CORS, MDN: <https://developer.mozilla.org/ca/docs/Web/HTTP/CORS>
