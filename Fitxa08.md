# Fitxa 08 — CRUD amb `json-server`

> **Objectiu general:** deixar de guardar les tasques a `localStorage` i fer un **CRUD complet** contra una API REST local: llegir, crear, actualitzar i eliminar tasques amb `fetch`, `json-server` i els mètodes HTTP.

- **Temps estimat:** 3 sessions de 60 minuts.
- **Requisits previs:** haver completat la [Fitxa 07](Fitxa07.md) o tenir un `hola-mon` equivalent amb les tasques, els providers, les rutes i la pàgina `/descobreix` funcionant.
- **Projecte:** **no en crees un de nou**. Treballes dins de `hola-mon`.
- **Versions utilitzades:** React 19.3.1, Vite 8.3.4, Tailwind CSS 4.3.3, `react-router` 8.5.0 i `json-server` 1.0.0-beta.15.
- **Node:** `>=22.22.0`. Els equips del taller fan servir Node 22.22.3.
- **Dependència nova:** `json-server`, només per desenvolupament.

> **Important:** `json-server` és una eina local per practicar. No és un backend de producció: no té autenticació, permisos ni seguretat real. Les dades viuen en un fitxer `db.json` del teu ordinador.

> **Dues terminals:** l'aplicació i l'API són dos processos diferents. Hauràs de tenir `npm run dev` en una terminal i `npm run api` en una altra.

> **Migració:** les tasques que tinguessis a `localStorage` no es passen automàticament a l'API. Aquesta fitxa comença amb les tasques de `db.json`. Si vols conservar les teves, copia-les manualment al fitxer.

## Continguts

1. Teoria
   - On som i què construirem
   - CRUD, REST i mètodes HTTP
   - Què és `json-server`
   - Preparar el projecte i `db.json`
   - El model de tasca i els identificadors
   - Llegir amb `GET`
   - Crear amb `POST`
   - Actualitzar amb `PATCH`
   - Eliminar amb `DELETE`
   - Errors, càrrega i accions
   - Per què el filtre continua a `localStorage`
   - Estructura final i resum
2. Activitat 1 — Llegir les tasques de l'API
3. Activitat 2 — Crear i eliminar tasques
4. Activitat 3 — Actualitzar i editar tasques
5. Criteris de comprovació
6. Continua el projecte
7. Recursos

---

## 1. Teoria

> **Com llegir aquesta teoria:** els fragments de codi i les comandes són exemples de referència, no passos que cal executar o copiar automàticament. Fes canvis i proves quan un esglaó de les activitats t'ho demani; si hi remet, adapta-hi l'exemple al teu projecte.

### 1.1 On som i què construirem

A la [Fitxa 07](Fitxa07.md) has après a **llegir** dades remotes amb `fetch`. La pàgina `/descobreix` fa tres consultes a tres APIs públiques, però no modifica res al servidor.

Ara farem el pas següent: les tasques de `hola-mon` deixaran de viure a `localStorage` i viuran en una **API REST local**. Podrem:

- llegir les tasques;
- crear-ne de noves;
- marcar-les com a fetes o pendents;
- editar-ne el text;
- eliminar-les.

Aquest conjunt d'operacions es coneix com a **CRUD**:

| Operació | Què fa | Mètode HTTP |
| --- | --- | --- |
| **C**reate | Crear una tasca | `POST` |
| **R**ead | Llegir les tasques | `GET` |
| **U**pdate | Actualitzar una tasca | `PATCH` |
| **D**elete | Eliminar una tasca | `DELETE` |

L'esquema serà aquest:

```text
Component
   │  crida una acció del context
   ▼
TasquesProvider
   │  crida una funció de src/api/tasques.js
   ▼
src/api/tasques.js
   │  fetch HTTP
   ▼
json-server  →  db.json
```

El **filtre** no canvia: és una preferència de la interfície i continuarà guardat a `localStorage`. Les **tasques** sí que passaran a l'API.

### 1.2 CRUD, REST i mètodes HTTP

Una **API REST** organitza les dades en **recursos** i fa servir els mètodes HTTP per indicar què volem fer amb ells.

El recurs d'aquesta fitxa és:

```text
http://localhost:3001/tasques
```

I el d'una tasca concreta:

```text
http://localhost:3001/tasques/abc123
```

Els mètodes que farem servir:

| Mètode | Adreça | Cos | Què fa |
| --- | --- | --- | --- |
| `GET` | `/tasques` | No | Retorna totes les tasques. |
| `POST` | `/tasques` | Sí | Crea una tasca nova. |
| `PATCH` | `/tasques/:id` | Sí | Actualitza alguns camps d'una tasca. |
| `DELETE` | `/tasques/:id` | No | Elimina una tasca. |

`PATCH` i `PUT` no són el mateix:

- **`PATCH`** actualitza només els camps que envies. Si envies `{ "feta": true }`, la resta de la tasca no canvia.
- **`PUT`** substitueix la tasca sencera. Si t'oblides un camp, el pots perdre.

En aquesta fitxa farem servir `PATCH` perquè volem canviar només `feta` o només `text`.

El servidor respon amb un **codi d'estat**:

| Codi | Significat |
| --- | --- |
| `200 OK` | La petició ha funcionat. |
| `201 Created` | S'ha creat un recurs. |
| `204 No Content` | Ha funcionat, però no hi ha cos de resposta. |
| `400 Bad Request` | La petició no té el format correcte. |
| `404 Not Found` | El recurs no existeix. |
| `500 Internal Server Error` | El servidor ha fallat. |

`fetch` **no** llança un error pels codis `404` o `500`. Per això sempre comprovem `resposta.ok` abans de llegir el cos.

### 1.3 Què és `json-server`

`json-server` és una eina que crea una API REST a partir d'un fitxer JSON. És perfecta per practicar el frontend sense construir un backend.

Si tens aquest `db.json`:

```json
{
  "tasques": [
    {
      "id": "1",
      "text": "Repassar props",
      "feta": false
    }
  ]
}
```

I executes:

```bash
npx json-server db.json --port 3001
```

Obtens aquestes rutes:

```text
GET    http://localhost:3001/tasques
GET    http://localhost:3001/tasques/1
POST   http://localhost:3001/tasques
PATCH  http://localhost:3001/tasques/1
DELETE http://localhost:3001/tasques/1
```

Quan fas un `POST`, un `PATCH` o un `DELETE`, `json-server` **modifica el fitxer `db.json`**. Si vols tornar a l'estat inicial, recupera el `db.json` original.

La versió que farem servir és `json-server@1.0.0-beta.15`:

- requereix Node `>=22.12`;
- genera identificadors **string** quan crees una tasca sense `id`;
- ja permet CORS per defecte;
- escolta a `localhost:3001` si li passes `--port 3001`.

No el facis servir en producció ni hi posis dades personals o secrets.

### 1.4 Preparar el projecte i `db.json`

Instal·la `json-server` com a dependència de desenvolupament:

```bash
npm install -D json-server@1.0.0-beta.15
```

Crea un fitxer `db.json` a l'arrel del projecte. Ha de tenir una propietat `tasques` amb un array:

```json
{
  "tasques": [
    {
      "id": "1",
      "text": "Repassar props i estat",
      "feta": true
    },
    {
      "id": "2",
      "text": "Practicar useContext",
      "feta": false
    },
    {
      "id": "3",
      "text": "Preparar el CRUD amb json-server",
      "feta": false
    }
  ]
}
```

Afegeix un script al `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "api": "json-server db.json --port 3001",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

Ara necessites **dues terminals**:

```bash
# Terminal 1
npm run api

# Terminal 2
npm run dev
```

Comprova que l'API funciona obrint:

```text
http://localhost:3001/tasques
```

Si el port `3001` està ocupat, canvia el port de l'script `api` i també la constant `URL_TASQUES` del mòdul d'API. Han de coincidir.

### 1.5 El model de tasca i els identificadors

El model no canvia:

```js
{
  id: 'abc123',
  text: 'Repassar props',
  feta: false,
}
```

L'`id` continua sent un **string**. Això és important perquè:

- la ruta `/tasques/:id` rep l'identificador com a string;
- `json-server` 1 genera ids string;
- comparar `tasca.id === id` continua funcionant.

Quan crees una tasca, **no generis l'`id` al client**. Envia només `text` i `feta`; el servidor crearà l'`id` i te'l retornarà a la resposta:

```js
{
  "text": "Nova tasca",
  "feta": false,
  "id": "yFae1Heh5fo"
}
```

A la resposta del `POST` hi ha la tasca completa. La farem servir per actualitzar l'estat amb l'`id` real.

### 1.6 Llegir amb `GET`

El mòdul `src/api/tasques.js` encapsula les peticions. Així els components no han de saber URLs ni capçaleres.

```js
const URL_TASQUES = 'http://localhost:3001/tasques'

export async function obteTasques(signal) {
  const resposta = await fetch(URL_TASQUES, { signal })

  if (!resposta.ok) {
    throw new Error(`No s'han pogut carregar les tasques (${resposta.status}).`)
  }

  const dades = await resposta.json()

  if (!Array.isArray(dades)) {
    throw new Error("La resposta de l'API no té el format esperat.")
  }

  return dades
}
```

Punts importants:

- comprovem `resposta.ok`;
- fem `await resposta.json()`;
- validem que la resposta sigui un array;
- el `signal` permet cancel·lar la petició amb `AbortController`.

Al `TasquesProvider`, les tasques ja no surten de `useLocalStorage`:

```jsx
const [tasques, setTasques] = useState([])
const [carregant, setCarregant] = useState(true)
const [error, setError] = useState('')

useEffect(() => {
  const controlador = new AbortController()

  async function carrega() {
    setCarregant(true)
    setError('')

    try {
      setTasques(await obteTasques(controlador.signal))
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
```

La pàgina `/tasques` ha de mostrar tres camins:

1. **carregant**: encara no tenim resposta;
2. **error**: no s'ha pogut connectar o l'API ha fallat;
3. **dades**: podem mostrar el formulari i la llista.

No mostris el formulari mentre no saps si l'API funciona: l'usuari podria intentar crear una tasca i rebre un error més confús.

### 1.7 Crear amb `POST`

Per crear una tasca enviem un `POST` amb un cos JSON:

```js
export async function creaTasca(text) {
  const resposta = await fetch(URL_TASQUES, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, feta: false }),
  })

  if (!resposta.ok) {
    throw new Error(`No s'ha pogut crear la tasca (${resposta.status}).`)
  }

  return resposta.json()
}
```

La capçalera `Content-Type: application/json` és imprescindible perquè el servidor sàpiga que el cos és JSON. El cos ha de ser un **string**; per això fem `JSON.stringify`.

Al provider:

```jsx
async function afegeixTasca(text) {
  setEnviant(true)
  setErrorAccio('')

  try {
    const novaTasca = await creaTasca(text)
    setTasques((anteriors) => [...anteriors, novaTasca])
    return true
  } catch (err) {
    setErrorAccio(err.message)
    return false
  } finally {
    setEnviant(false)
  }
}
```

Fixem-nos-hi:

- `afegeixTasca` és `async`;
- afegim la tasca **retornada pel servidor**, no una tasca inventada;
- `enviant` evita dobles clics;
- `errorAccio` és un error d'una acció, diferent de l'error de càrrega inicial;
- retornem `true` o `false` perquè el formulari sàpiga si ha de buidar-se.

### 1.8 Actualitzar amb `PATCH`

Per actualitzar una tasca enviem només els camps que canvien:

```js
export async function actualitzaTasca(id, canvis) {
  const resposta = await fetch(`${URL_TASQUES}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(canvis),
  })

  if (!resposta.ok) {
    throw new Error(`No s'ha pogut actualitzar la tasca (${resposta.status}).`)
  }

  return resposta.json()
}
```

Per canviar l'estat:

```js
await actualitzaTasca(id, { feta: !tasca.feta })
```

Per canviar el text:

```js
await actualitzaTasca(id, { text: 'Text nou' })
```

Després de rebre la resposta, substituïm la tasca a l'estat:

```jsx
setTasques((anteriors) =>
  anteriors.map((tasca) =>
    tasca.id === id ? tascaActualitzada : tasca,
  ),
)
```

No mutem l'array amb `push` ni canviem `tasca.feta` directament. Creem un array nou amb `map`.

### 1.9 Eliminar amb `DELETE`

Per eliminar una tasca no cal cos ni `Content-Type`:

```js
export async function eliminaTasca(id) {
  const resposta = await fetch(`${URL_TASQUES}/${id}`, {
    method: 'DELETE',
  })

  if (!resposta.ok) {
    throw new Error(`No s'ha pogut eliminar la tasca (${resposta.status}).`)
  }
}
```

Si tot va bé, traiem la tasca de l'estat:

```jsx
setTasques((anteriors) => anteriors.filter((tasca) => tasca.id !== id))
```

Si el servidor retorna `404`, la tasca ja no existia. També ho hem de tractar com un error o com un estat ja resolt, però no podem deixar la interfície com si l'operació hagués funcionat sense comprovar res.

### 1.10 Errors, càrrega i accions

A la Fitxa 07 teníem un sol estat de càrrega perquè només llegíem. Ara hi ha dues situacions diferents:

| Situació | Estat | Què mostra |
| --- | --- | --- |
| Càrrega inicial | `carregant` | Missatge «Carregant tasques...». |
| Error de càrrega | `error` | Missatge i botó de reintent. |
| Acció en curs | `enviant` | Botons desactivats. |
| Error d'acció | `errorAccio` | Missatge d'error de crear, editar o eliminar. |

No barregis `carregant` amb `enviant`: el primer és «encara no tinc les dades»; el segon és «estic desant un canvi».

Quan una acció falla:

- no esborris el text del formulari;
- no tanquis la pàgina;
- mostra un missatge;
- torna a permetre l'acció.

Si l'API no està en marxa, `fetch` rebutja amb un `TypeError`. Podem convertir-lo en un missatge més clar:

```js
if (err.name === 'TypeError') {
  return "No s'ha pogut connectar amb l'API. Comprova que `npm run api` estigui en marxa."
}
```

### 1.11 Per què el filtre continua a `localStorage`

No totes les dades s'han de guardar al servidor. Cal distingir:

- **dades de l'aplicació**: les tasques. Viuen a l'API perquè les volem compartir i persistir.
- **preferències de la interfície**: el filtre (`totes`, `pendents`, `fetes`). Viuen a `localStorage` perquè són una elecció local de l'usuari.

El filtre no és una tasca ni una dada del servidor. Si el guardéssim a `db.json`, estaríem barrejant estat de la interfície amb dades de l'aplicació.

A més, `tasquesFiltrades`, `pendents` i `fetes` són **estat derivat**: es calculen a partir de `tasques` i `filtre`. No els hem de guardar enlloc.

### 1.12 Estructura final i resum

L'estructura de fitxers que tindràs en acabar:

```text
src/
├── api/
│   ├── gossos.js
│   ├── publicacions.js
│   ├── personatges.js
│   └── tasques.js
├── components/
│   ├── FormulariTasca.jsx
│   ├── FormulariEdicioTasca.jsx
│   ├── Tasca.jsx
│   └── ...
├── context/
│   ├── TasquesProvider.jsx
│   └── ...
└── pages/
    ├── PaginaTasques.jsx
    ├── PaginaTasca.jsx
    └── ...
```

Fitxers nous o modificats:

```text
db.json
src/api/tasques.js
src/context/TasquesProvider.jsx
src/components/FormulariEdicioTasca.jsx
```

Resum del que has de recordar:

1. `json-server` crea una API REST a partir de `db.json`.
2. Cal tenir l'API i Vite en dues terminals.
3. Les tasques ja no es guarden a `localStorage`.
4. El filtre sí que continua a `localStorage`.
5. `GET` llegeix, `POST` crea, `PATCH` actualitza i `DELETE` elimina.
6. `fetch` no llança error per un `404`: cal comprovar `resposta.ok`.
7. `POST` i `PATCH` necessiten `Content-Type: application/json` i `JSON.stringify`.
8. Després d'una acció, actualitza l'estat amb la resposta del servidor.
9. `enviant` evita dobles clics; `errorAccio` mostra errors d'acció.
10. No mutis arrays: `map`, `filter` i spread.

---

## 2. Activitat 1 — Llegir les tasques de l'API

**Objectiu:** instal·lar `json-server`, crear `db.json` i carregar les tasques amb `GET`, sense `localStorage`.

**Temps estimat:** 45 minuts.

### Esglaó 1 — Preparar l'API

1. Instal·la `json-server` com a dependència de desenvolupament.
2. Crea `db.json` amb tres tasques inicials.
3. Afegeix l'script `api` al `package.json`.
4. Obre dues terminals i engega `npm run api` i `npm run dev`.
5. Comprova `http://localhost:3001/tasques` al navegador.

### Esglaó 2 — Crear el mòdul de l'API

Crea `src/api/tasques.js` amb:

- una constant `URL_TASQUES`;
- una funció `obteTasques(signal)`;
- comprovació de `resposta.ok`;
- `await resposta.json()`;
- validació que la resposta sigui un array de tasques.

No facis servir `localStorage` en aquest mòdul.

### Esglaó 3 — Migrar el provider

A `TasquesProvider`:

- elimina `useLocalStorage` per a les tasques;
- crea `tasques`, `carregant`, `error` i `recarregar` amb `useState`;
- carrega les tasques amb `useEffect` i `AbortController`;
- exposa `recarregaTasques` per tornar-ho a provar.

Mantén les accions de crear, completar i eliminar com fins ara, però tingues clar que **encara no persisteixen**: les connectarem a les activitats següents.

### Esglaó 4 — Mostrar càrrega i error a la pàgina

A `PaginaTasques`:

- mostra «Carregant tasques...» mentre `carregant` sigui `true`;
- mostra l'error i un botó **Torna a provar** si la petició falla;
- mostra el formulari, els comptadors i la llista només quan ja tens dades.

Comprova que el filtre continua funcionant i que es conserva en recarregar.

Si entres directament a `/tasques/:id`, mostra primer la càrrega o l'error. No diguis «Tasca no trobada» mentre les tasques encara s'estan carregant.

### Esglaó 5 — Provar

1. Amb l'API en marxa, les tres tasques apareixen.
2. Atura l'API i recarrega: apareix un error, no una pàgina trencada.
3. Torna a engegar l'API i prem **Torna a provar**.
4. Comprova `/descobreix` i les rutes de la Fitxa 06.

### Repte opcional

Mostra el nombre total de tasques que ha retornat l'API. Ha de ser estat derivat de `tasques.length`, no un estat nou.

---

## 3. Activitat 2 — Crear i eliminar tasques

**Objectiu:** connectar el formulari i el botó d'eliminar amb `POST` i `DELETE`.

**Temps estimat:** 45 minuts.

### Esglaó 1 — Afegir les funcions d'API

A `src/api/tasques.js`, afegeix:

- `creaTasca(text)` amb `POST`;
- `eliminaTasca(id)` amb `DELETE`.

Recorda:

- `POST` necessita `Content-Type` i `JSON.stringify`;
- `DELETE` no necessita cos;
- has de comprovar `resposta.ok`;
- has de retornar la tasca creada.

### Esglaó 2 — Fer asíncrones les accions del provider

A `TasquesProvider`:

- afegeix `enviant` i `errorAccio`;
- `afegeixTasca` ha de cridar `creaTasca`;
- `eliminaTasca` ha de cridar l'API;
- actualitza l'estat amb la resposta del servidor;
- retorna `true` o `false` per saber si l'acció ha funcionat;
- desactiva les accions mentre `enviant` sigui `true`.

### Esglaó 3 — Adaptar el formulari

A `FormulariTasca`:

- `envia` ha de ser `async`;
- espera el resultat de `afegeixTasca`;
- només buida el camp si la creació ha funcionat;
- desactiva el botó mentre s'envia.

### Esglaó 4 — Adaptar les eliminacions

A `Tasca` i `PaginaTasca`:

- desactiva el botó mentre `enviant`;
- a la pàgina de detall, només navega a `/tasques` si l'eliminació ha funcionat.

Mostra `errorAccio` a la pàgina de tasques i a la de detall perquè l'usuari sàpiga què ha fallat.

> **Nota:** en aquesta activitat, marcar una tasca com a feta encara és local. Ho connectarem a l'Activitat 3 amb `PATCH`.

### Esglaó 5 — Provar

1. Crea una tasca i comprova que apareix a `db.json`.
2. Recarrega la pàgina: la tasca ha de continuar.
3. Elimina una tasca i comprova que desapareix de `db.json`.
4. Atura l'API i intenta crear o eliminar: ha d'aparèixer un error.
5. Torna a engegar l'API i comprova que el reintent funciona.

### Repte opcional

Afegeix una confirmació abans d'eliminar una tasca. Si l'usuari cancel·la, no s'ha de fer cap petició.

---

## 4. Activitat 3 — Actualitzar i editar tasques

**Objectiu:** connectar el canvi d'estat i l'edició del text amb `PATCH`, i completar el CRUD.

**Temps estimat:** 60 minuts.

### Esglaó 1 — Afegir `actualitzaTasca`

A `src/api/tasques.js`, afegeix:

```js
export async function actualitzaTasca(id, canvis) {
  // PATCH a `${URL_TASQUES}/${id}`
  // Content-Type: application/json
  // body: JSON.stringify(canvis)
}
```

Ha de comprovar `resposta.ok`, llegir la tasca retornada i validar el seu format.

### Esglaó 2 — Connectar el toggle

A `TasquesProvider`:

- `toggleTasca` passa a ser `async`;
- busca la tasca actual;
- envia `{ feta: !tasca.feta }` amb `PATCH`;
- substitueix la tasca a l'estat amb la resposta del servidor;
- gestiona `enviant` i `errorAccio`.

### Esglaó 3 — Crear el formulari d'edició

Crea `src/components/FormulariEdicioTasca.jsx`.

Ha de tenir:

- un `input` controlat amb el text actual;
- validació de text buit;
- un botó per desar;
- estat d'enviament;
- missatge si no s'ha canviat res.

No facis servir `defaultValue` si després vols controlar el camp: fes servir `value` i `onChange`.

### Esglaó 4 — Integrar l'edició al detall

A `PaginaTasca`:

- mostra `FormulariEdicioTasca` amb la tasca actual;
- desactiva el botó de completar mentre `enviant` sigui `true`;
- comprova que el text i l'estat es conserven en recarregar.

### Esglaó 5 — Provar el CRUD complet

1. Crea una tasca.
2. Marca-la com a feta i recarrega: ha de continuar feta.
3. Torna-la a pendent.
4. Edita el text des de `/tasques/:id`.
5. Elimina-la.
6. Atura l'API i comprova els errors.
7. Comprova que el filtre i `/descobreix` continuen funcionant.

### Repte opcional

Desactiva el botó de desar quan el text no hagi canviat i mostra un missatge **Canvis desats** després d'una edició correcta. El missatge pot desaparèixer amb un temporitzador.

---

## 5. Criteris de comprovació

Marca cada criteri quan el compleixis:

- [ ] Has continuat dins del projecte `hola-mon`; no n'has creat un de nou.
- [ ] `db.json` existeix i conté un array `tasques`.
- [ ] `npm run api` engega `json-server` al port `3001`.
- [ ] Has treballat amb dues terminals.
- [ ] Les tasques es carreguen amb `GET` des de l'API.
- [ ] Les tasques ja no es guarden a `localStorage`.
- [ ] El filtre continua guardat a `localStorage`.
- [ ] Es comprova `resposta.ok` a totes les peticions.
- [ ] `POST` envia `Content-Type: application/json` i `JSON.stringify`.
- [ ] La tasca creada s'afegeix amb l'`id` retornat pel servidor.
- [ ] `DELETE` elimina la tasca de l'API i de l'estat.
- [ ] `PATCH` actualitza només els camps necessaris.
- [ ] El toggle de `feta` i l'edició del text persisteixen.
- [ ] Els botons es desactiven mentre `enviant` és `true`.
- [ ] Els errors de càrrega i d'acció es mostren a l'usuari.
- [ ] El formulari no es buida si la creació falla.
- [ ] Les llistes continuen tenint `key` estable.
- [ ] Les rutes `/`, `/tasques`, `/tasques/:id`, `/descobreix` i el 404 funcionen.
- [ ] `npm run build` funciona.
- [ ] No hi ha claus ni secrets al codi.

## 6. Continua el projecte

Guarda `hola-mon` amb el CRUD complet funcionant i `db.json` en un estat conegut.

A la [Fitxa 09](Fitxa09.md) farem un pas més en l'organització del codi: **Redux Toolkit** per gestionar l'estat global de les tasques amb slices, selectors i thunks asíncrons. El filtre continuarà al context i a `localStorage`.

No cal tornar a executar `npm create vite` ni canviar les rutes. L'API local és una capa nova sobre el projecte acumulatiu.

## 7. Recursos

- `json-server`, GitHub: <https://github.com/typicode/json-server>
- `json-server`, npm: <https://www.npmjs.com/package/json-server>
- Mètodes HTTP, MDN: <https://developer.mozilla.org/ca/docs/Web/HTTP/Methods>
- `fetch`, MDN: <https://developer.mozilla.org/ca/docs/Web/API/Fetch_API/Using_Fetch>
- `Response.ok`, MDN: <https://developer.mozilla.org/en-US/docs/Web/API/Response/ok>
- `PATCH`, MDN: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PATCH>
- `DELETE`, MDN: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/DELETE>
- `useEffect`, React: <https://react.dev/reference/react/useEffect>
