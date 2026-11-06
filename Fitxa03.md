# Fitxa 03 — Formularis controlats i llista de tasques

> **Objectiu general:** continuar el projecte `hola-mon` de la Fitxa 02, afegir un formulari controlat per crear tasques, gestionar una llista amb estat, validar les dades i filtrar-les.

- **Temps estimat:** 3 sessions de 60 minuts.
- **Requisits previs:** haver completat la [Fitxa 02](Fitxa02.md) o tenir un `hola-mon` equivalent amb `App`, `Comptador`, `Boto`, `Targeta` i `Missatge`.
- **Projecte:** **no en crees un de nou**. Treballes dins de `hola-mon`.
- **Versions utilitzades:** React 19.3.1, Vite 8.3.4 i Tailwind CSS 4.3.3.

> **Projecte acumulatiu:** cada fitxa afegeix una capa al mateix projecte. En acabar aquesta, el comptador continuarà funcionant i la pàgina també permetrà crear, completar, eliminar i filtrar tasques.

## Continguts

1. Teoria
   - On som i què construirem
   - Formularis controlats
   - `onSubmit` i `preventDefault`
   - Estat local i estat compartit
   - Callbacks: `onAfegir`, `onToggle` i `onElimina`
   - Arrays a l'estat
   - Validació
   - Filtres i estat derivat
   - Estructura final i contracte de props
2. Activitat 1 — Formulari controlat i primera tasca
3. Activitat 2 — Completar, eliminar i extreure components
4. Activitat 3 — Validació, filtre i estat derivat
5. Criteris de comprovació
6. Continua el projecte
7. Recursos

---

## 1. Teoria

> **Com llegir aquesta teoria:** els fragments de codi i les comandes són exemples de referència, no passos que cal executar o copiar automàticament. Fes canvis i proves quan un esglaó de les activitats t'ho demani; si hi remet, adapta-hi l'exemple al teu projecte.

### 1.1 On som i què construirem

A la [Fitxa 02](Fitxa02.md) has après a passar dades amb props, a executar callbacks del pare des del fill, a compondre amb `children` i a renderitzar llistes amb `.map()` i `key`.

El projecte `hola-mon` ja té:

- un comptador dins d'una `Targeta`;
- un component `Comptador` sense estat propi;
- components reutilitzables `Boto`, `Targeta` i `Missatge`;
- Tailwind CSS 4 i mode fosc.

Ara hi afegirem una segona targeta: **Tasques**. No substituirem el comptador; el mantindrem perquè el projecte continuï creixent.

L'objectiu és arribar a una estructura com aquesta:

```text
App
├── Targeta (Comptador)
│   └── Comptador
│       ├── Missatge
│       └── Boto (Incrementa, Decrementa, Reinicia)
└── Targeta (Tasques)
    ├── FormulariTasca
    ├── FiltreTasques
    └── LlistaTasques
        └── Tasca (una per cada tasca)
```

Responsabilitats:

- **`App`** guarda les tasques i el filtre, i decideix què passa quan se n'afegeix, se'n completa o se n'elimina una.
- **`FormulariTasca`** controla el text del camp i l'error de validació. Quan l'usuari envia el formulari, avisa `App` amb `onAfegir`.
- **`FiltreTasques`** només mostra els botons de filtre i notifica quin s'ha triat.
- **`LlistaTasques`** rep una llista de tasques i les renderitza.
- **`Tasca`** mostra una tasca i notifica si es completa o s'elimina.
- **`Boto`, `Targeta` i `Missatge`** es continuen reutilitzant.

> **Conveni de codi:** cada component viu en un fitxer propi dins de `src/components/` i s'exporta amb `export default`. `App` és l'excepció: viu a `src/App.jsx`.

### 1.2 Formularis controlats

A l'HTML, un `<input>` guarda el seu valor dins del DOM. A React, normalment volem que el valor visqui a l'estat del component. Això s'anomena **component controlat**.

```jsx
import { useState } from 'react'

function Exemple() {
  const [text, setText] = useState('')

  return (
    <input
      value={text}
      onChange={(e) => setText(e.target.value)}
    />
  )
}
```

Les dues peces clau són:

- `value={text}`: el que es veu al camp és el valor de l'estat.
- `onChange={(e) => setText(e.target.value)}`: cada tecla actualitza l'estat.

Si poses `value` i t'oblides d'`onChange`, el camp es queda bloquejat i React mostra un avís a la consola. Si poses `onChange` però no poses `value`, el camp funciona com un input HTML normal i React no en controla el valor.

Per als checkboxes es fa servir `checked` en lloc de `value`:

```jsx
<input
  type="checkbox"
  checked={tasca.feta}
  onChange={() => onToggle(tasca.id)}
/>
```

També és important associar l'etiqueta amb el camp:

```jsx
<label htmlFor="tasca">Nova tasca</label>
<input id="tasca" ... />
```

Així, en clicar l'etiqueta, el focus va al camp, i els lectors de pantalla poden relacionar-los.

### 1.3 `onSubmit` i `preventDefault`

Quan un formulari es valida o s'envia, el navegador intenta recarregar la pàgina. En una aplicació React això normalment no ho volem: volem gestionar les dades nosaltres.

Per això fem servir `onSubmit` i aturem el comportament per defecte:

```jsx
function envia(e) {
  e.preventDefault()
  onAfegir(text)
  setText('')
}

return (
  <form onSubmit={envia}>
    <input ... />
    <Boto type="submit">Afegeix</Boto>
  </form>
)
```

Punts importants:

- `onSubmit` s'executa quan es prem un botó `type="submit"` o quan es prem Enter dins del camp.
- `e.preventDefault()` evita que la pàgina es recarregui.
- Un botó dins d'un formulari sense `type` pot enviar-lo sense voler. El nostre `Boto` ja posa `type="button"` per defecte; si volem enviar, li passem `type="submit"`.
- Els botons que només fan una acció, com «Elimina», no han d'enviar el formulari.

### 1.4 Estat local i estat compartit

No tot l'estat ha de viure a `App`. Cal decidir qui necessita la informació:

| Estat | On viu | Per què |
| --- | --- | --- |
| Text del formulari | `FormulariTasca` | Només afecta el camp mentre s'escriu. |
| Error de validació | `FormulariTasca` | Només el formulari el mostra. |
| Llista de tasques | `App` | La necessiten el formulari, la llista i els comptadors. |
| Filtre actiu | `App` | La llista filtrada depèn de les tasques i del filtre. |

`FormulariTasca` no guarda una còpia de les tasques. Quan l'usuari envia una tasca, crida el callback que li passa `App`:

```jsx
<FormulariTasca onAfegir={afegeixTasca} />
```

I dins del formulari:

```jsx
onAfegir(text)
```

Això és **lifting state up** aplicat a un formulari: el fill recull la informació, però el pare decideix com es guarda.

#### Callbacks: `onAfegir`, `onToggle` i `onElimina`

Els noms que comencen per `on` no són funcions de React: són **callbacks** que el pare passa al fill. Per exemple, `onToggle` no existeix dins de React; és el nom que donem al prop que porta la funció `toggleTasca` d'`App`.

| Nom | On viu | Què és |
| --- | --- | --- |
| `toggleTasca` | `App` | La funció real que modifica l'estat. |
| `onToggle` | Props de `LlistaTasques` i `Tasca` | El nom del callback que transporta la funció. |
| `onToggle(tasca.id)` | `Tasca` | La crida que fa el fill quan canvia el checkbox. |

La cadena de crides és:

```text
App (toggleTasca) ──onToggle──► LlistaTasques ──onToggle──► Tasca
```

Quan l'usuari marca el checkbox, `Tasca` no canvia l'estat directament: només crida `onToggle(tasca.id)`. El fill no ha de saber si l'estat es guarda amb `useState`, amb un context o en una base de dades; només avisa el pare.

El prefix `on` és un conveni, com a `onClick` o `onSubmit`; no és una paraula reservada de React. Podries dir-li `canviaTasca`, però `onToggle` deixa clar que és un callback.

### 1.5 Arrays a l'estat

Una llista de tasques és un array d'objectes:

```js
const tasques = [
  { id: 'abc', text: 'Repassar props', feta: false },
  { id: 'def', text: 'Fer la Fitxa 03', feta: true },
]
```

No hem de modificar l'array directament. No fem servir `push`, `splice` ni assignacions com `tasca.feta = true`. En lloc d'això, creem un array nou:

**Afegir una tasca:**

```jsx
const novaTasca = {
  id: crypto.randomUUID(),
  text,
  feta: false,
}

setTasques((anteriors) => [...anteriors, novaTasca])
```

**Canviar una tasca concreta:**

```jsx
setTasques((anteriors) =>
  anteriors.map((tasca) =>
    tasca.id === id ? { ...tasca, feta: !tasca.feta } : tasca,
  ),
)
```

**Eliminar una tasca:**

```jsx
setTasques((anteriors) => anteriors.filter((tasca) => tasca.id !== id))
```

`crypto.randomUUID()` genera un identificador únic per a cada tasca. El necessitem perquè `key` sigui estable i per saber quina tasca volem modificar o eliminar.

> **No facis servir l'índex com a `key` si la llista canvia.** En eliminar o reordenar elements, l'índex deixa de correspondre a la mateixa tasca. Utilitza l'`id`.

### 1.6 Validació

Un formulari ha de comprovar les dades abans de guardar-les. En aquesta fitxa farem una validació senzilla:

- el text no pot estar buit;
- eliminem els espais sobrants amb `trim()`;
- limitem la longitud amb `maxLength`;
- mostrem un missatge si hi ha un error.

```jsx
const [error, setError] = useState('')

function envia(e) {
  e.preventDefault()

  const net = text.trim()

  if (!net) {
    setError("Escriu una tasca abans d'afegir-la.")
    return
  }

  onAfegir(net)
  setText('')
  setError('')
}
```

Quan l'usuari torna a escriure, l'error ha de desaparèixer:

```jsx
function canviaText(e) {
  setText(e.target.value)
  if (error) setError('')
}
```

També ho podem comunicar a l'accessibilitat:

```jsx
<input aria-invalid={error ? 'true' : 'false'} />
```

I mostrar l'error amb el component `Missatge`, que ja tenim de la Fitxa 02:

```jsx
{error && <Missatge text={error} tipus="error" />}
```

> **Per què `noValidate`?** Si volem mostrar el nostre missatge i no el del navegador, podem posar `noValidate` al formulari i validar nosaltres. Si no, el navegador pot bloquejar l'enviament abans que el nostre codi s'executi.

### 1.7 Filtres i estat derivat

El filtre és una dada d'interfície: pot valer `'totes'`, `'pendents'` o `'fetes'`.

No guardem una segona llista amb les tasques filtrades. La calculem a partir de la llista original i del filtre:

```jsx
const tasquesFiltrades = tasques.filter((tasca) => {
  if (filtre === 'pendents') return !tasca.feta
  if (filtre === 'fetes') return tasca.feta
  return true
})
```

Els comptadors també es calculen:

```jsx
const pendents = tasques.filter((tasca) => !tasca.feta).length
const fetes = tasques.length - pendents
```

Això és **estat derivat**: informació que es pot calcular a partir d'altres dades. Si la guardéssim en un `useState` separat, hauríem de recordar actualitzar-la cada cop que canviés una tasca. Calculant-la durant el render, sempre estarà sincronitzada.

El component de filtre pot generar els botons a partir d'una llista:

```jsx
const FILTRES = [
  { id: 'totes', etiqueta: 'Totes' },
  { id: 'pendents', etiqueta: 'Pendents' },
  { id: 'fetes', etiqueta: 'Fetes' },
]

function FiltreTasques({ filtre, onCanviaFiltre }) {
  return (
    <div role="group" aria-label="Filtrar tasques">
      {FILTRES.map(({ id, etiqueta }) => (
        <Boto
          key={id}
          variant={filtre === id ? 'primari' : 'secundari'}
          onClick={() => onCanviaFiltre(id)}
          aria-pressed={filtre === id}
        >
          {etiqueta}
        </Boto>
      ))}
    </div>
  )
}
```

`aria-pressed` indica quin filtre està actiu. La variant del `Boto` també ho mostra visualment.

Si la llista filtrada queda buida, el missatge ha de ser diferent segons si no hi ha cap tasca o si el filtre no en troba cap:

```jsx
let missatgeBuit = 'Encara no hi ha tasques. Afegeix-ne una.'

if (tasques.length > 0 && filtre === 'pendents') {
  missatgeBuit = 'No hi ha tasques pendents. Bona feina!'
} else if (tasques.length > 0 && filtre === 'fetes') {
  missatgeBuit = 'Encara no has marcat cap tasca com a feta.'
}
```

### 1.8 Estructura final i contracte de props

En acabar la fitxa, l'estructura serà:

```text
src/
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

Contracte de props:

| Component | Props | Responsabilitat |
| --- | --- | --- |
| `App` | — | Estat de tasques i filtre; handlers; càlculs derivats. |
| `FormulariTasca` | `onAfegir` | Text i error locals; envia el text net. |
| `FiltreTasques` | `filtre`, `onCanviaFiltre` | Botons de filtre i estat actiu. |
| `LlistaTasques` | `tasques`, `missatgeBuit`, `onToggle`, `onElimina` | Renderitza la llista o l'estat buit. |
| `Tasca` | `tasca`, `onToggle`, `onElimina` | Checkbox, text i botó d'eliminar. |
| `Boto` | `variant`, `className`, `children`, `...props` | Botó reutilitzable. |
| `Targeta` | `titol`, `children` | Embolcall amb estil comú. |
| `Missatge` | `text`, `tipus` | Missatge amb colors segons el tipus. |

> **Recorda:** `onToggle` i `onElimina` són callbacks que `App` passa a `LlistaTasques` i aquesta a `Tasca`. La funció real és `toggleTasca`/`eliminaTasca`; el fill només crida el callback amb l'`id` de la tasca.

El model d'una tasca serà:

```js
{
  id: 'identificador-únic',
  text: 'Repassar props',
  feta: false,
}
```

---

## 2. Activitat 1 — Formulari controlat i primera tasca

**Objectiu:** crear un formulari controlat que afegeixi tasques a un array i mostrar-les en una llista.

**Temps estimat:** 45 minuts.

**Punt de partida:** el projecte `hola-mon` de la Fitxa 02, amb el comptador i els components `Boto`, `Targeta` i `Missatge` funcionant.

### Esglaó 1 — Crear el formulari

1. Crea `src/components/FormulariTasca.jsx`. No hi ha d'haver-hi cap altre component en aquest fitxer.
2. Importa `useState` i `Boto`.
3. Defineix un estat `text` que comenci amb una cadena buida.
4. Crea un `<form>` amb:
   - un `<label htmlFor="tasca">` amb el text «Nova tasca»;
   - un `<input id="tasca" type="text" />` amb `value={text}`;
   - un `onChange` que actualitzi `text`;
   - un `placeholder` i `autoComplete="off"`.
5. Afegeix un `<Boto type="submit">Afegeix</Boto>`.

El component ha de rebre `onAfegir` com a prop. Encara no l'ha de cridar fins a l'esglaó següent.

**Comprovació:** en escriure al camp, el text apareix; si mires l'estat amb les eines de React, `text` canvia a cada tecla.

### Esglaó 2 — Enviar el formulari i afegir la tasca

1. Dins de `FormulariTasca`, crea una funció `envia(e)`.
2. Crida `e.preventDefault()` per evitar que la pàgina es recarregui.
3. Neteja el text amb `trim()`. Si queda buit, no facis res.
4. Crida `onAfegir(textNet)`.
5. Buid el camp amb `setText('')`.
6. A `App.jsx`, importa `FormulariTasca` i crea l'estat `tasques` amb `useState([])`.
7. Crea la funció `afegeixTasca(text)`:
   - genera un `id` amb `crypto.randomUUID()`;
   - crea un objecte `{ id, text, feta: false }`;
   - afegeix-lo amb `setTasques((anteriors) => [...anteriors, novaTasca])`.
8. Passa `onAfegir={afegeixTasca}` al formulari.
9. Dins de la targeta «Tasques», renderitza la llista amb `.map()` i `key={tasca.id}`.

Exemple del formulari:

```jsx
function FormulariTasca({ onAfegir }) {
  const [text, setText] = useState('')

  function envia(e) {
    e.preventDefault()

    const net = text.trim()
    if (!net) return

    onAfegir(net)
    setText('')
  }

  return (
    <form onSubmit={envia}>
      <label htmlFor="tasca">Nova tasca</label>
      <input
        id="tasca"
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Boto type="submit">Afegeix</Boto>
    </form>
  )
}
```

**Comprovació:** en enviar el formulari, la pàgina no es recarrega, el camp es buida i la tasca apareix a la llista. La consola no mostra cap avís de `key`.

### Esglaó 3 — Repte: llista i estat buit

- Mostra el nombre total de tasques.
- Si no hi ha cap tasca, mostra un missatge «Encara no hi ha tasques. Afegeix-ne una.» en lloc d'una llista buida.
- Comprova que cada tasca té un `id` diferent.
- **Opcional:** desactiva el botó «Afegeix» quan el camp estigui buit. Si ho fas, recorda que el botó també ha de tornar a activar-se quan l'usuari escrigui.

**Comprovació:** la llista creix correctament, el text buit no crea tasques i l'estat buit es veu bé abans d'afegir-ne cap.

---

## 3. Activitat 2 — Completar, eliminar i extreure components

**Objectiu:** afegir la possibilitat de marcar una tasca com a feta i eliminar-la, extraient la fila i la llista a components propis.

**Temps estimat:** 55 minuts.

**Recorda: què és `onToggle`?**

`onToggle` és el callback que ve de `App`. Quan el checkbox canvia, `Tasca` crida `onToggle(tasca.id)`; no modifica l'estat directament. La funció real és `toggleTasca`, definida a `App`. Ho tens explicat amb més detall a l'apartat **1.4**.

### Esglaó 1 — Crear `Tasca.jsx`

1. Crea `src/components/Tasca.jsx`. No hi ha d'haver-hi cap altre component en aquest fitxer.
2. Rep els props `tasca`, `onToggle` i `onElimina`.
3. Mostra un checkbox controlat:
   - `checked={tasca.feta}`;
   - `onChange={() => onToggle(tasca.id)}`.
4. Associa el checkbox amb el text amb `htmlFor` i `id`.
5. Si `tasca.feta` és cert, aplica al text una classe de ratllat i un color més apagat.
6. Afegeix un `Boto variant="perill"` per eliminar la tasca. Passa-li un `aria-label` que inclogui el text de la tasca.

**Comprovació:** el checkbox canvia l'estat visual de la tasca i el botó «Elimina» rep l'`id` correcte.

### Esglaó 2 — Crear `LlistaTasques.jsx`

1. Crea `src/components/LlistaTasques.jsx`.
2. Rep `tasques`, `onToggle` i `onElimina`.
3. Si `tasques.length === 0`, mostra l'estat buit.
4. Si hi ha tasques, renderitza una `<ul>` amb `.map()`.
5. Passa `key={tasca.id}` i els callbacks a cada `Tasca`.
6. A `App.jsx`, substitueix la llista inline per `<LlistaTasques ... />`.
7. Crea els handlers `toggleTasca(id)` i `eliminaTasca(id)` a `App`:
   - per canviar l'estat, `.map()` i `{ ...tasca, feta: !tasca.feta }`;
   - per eliminar, `.filter()`.
8. Passa els handlers a `LlistaTasques`.

**Comprovació:** en marcar una tasca, el text canvia; en eliminar-la, desapareix de la llista; la resta de tasques no es modifiquen.

### Esglaó 3 — Repte: comptador de pendents

- Calcula `pendents` amb `tasques.filter((tasca) => !tasca.feta).length`.
- Calcula `fetes` com `tasques.length - pendents`.
- Mostra els dos comptadors a la targeta de tasques.
- **Opcional:** afegeix un botó «Neteja les fetes» que elimini totes les tasques completades amb `.filter()`.

No guardis els comptadors en un `useState` separat: són estat derivat.

**Comprovació:** els comptadors s'actualitzen en afegir, completar i eliminar tasques. No hi ha cap avís de `key`.

---

## 4. Activitat 3 — Validació, filtre i estat derivat

**Objectiu:** validar el formulari amb un missatge d'error, afegir filtres i calcular la llista visible i els comptadors a partir de l'estat.

**Temps estimat:** 55 minuts.

### Esglaó 1 — Validar el formulari

1. Afegeix un estat `error` a `FormulariTasca`.
2. A `envia`, comprova que el text net no estigui buit.
3. Si està buit, assigna un missatge a `error` i surt de la funció.
4. Si és correcte, crida `onAfegir`, buida el camp i neteja l'error.
5. Quan l'usuari escrigui, neteja l'error anterior.
6. Mostra el missatge amb `<Missatge text={error} tipus="error" />`.
7. Afegeix `maxLength={80}` i un comptador de caràcters.
8. Afegeix `aria-invalid` i `aria-describedby` a l'input.
9. Posa `noValidate` al formulari perquè el missatge el mostri la teva validació, no el navegador.

**Comprovació:** un enviament amb el camp buit mostra el missatge; en començar a escriure, el missatge desapareix; una tasca amb 80 caràcters com a màxim es pot enviar.

### Esglaó 2 — Crear `FiltreTasques.jsx`

1. Crea `src/components/FiltreTasques.jsx`.
2. Defineix una constant `FILTRES` amb `totes`, `pendents` i `fetes`.
3. Rep els props `filtre` i `onCanviaFiltre`.
4. Genera els botons amb `.map()` i `key`.
5. Fes servir `Boto` amb `variant={filtre === id ? 'primari' : 'secundari'}`.
6. Afegeix `aria-pressed={filtre === id}`.
7. A `App.jsx`, crea l'estat `filtre` amb valor inicial `'totes'`.
8. Calcula `tasquesFiltrades` a partir de `tasques` i `filtre`.
9. Passa `tasquesFiltrades` a `LlistaTasques` i `filtre` a `FiltreTasques`.

**Comprovació:** els tres filtres mostren la llista correcta i el filtre actiu es veu diferent.

### Esglaó 3 — Repte: missatges i estat derivat

- Calcula el missatge de llista buida segons el filtre:
  - sense tasques: «Encara no hi ha tasques. Afegeix-ne una.»;
  - filtre de pendents sense resultats: «No hi ha tasques pendents. Bona feina!»;
  - filtre de fetes sense resultats: «Encara no has marcat cap tasca com a feta.».
- Passa aquest missatge a `LlistaTasques` com a `missatgeBuit`.
- Comprova que els comptadors de pendents i fetes no depenen del filtre: han de mostrar el total real.
- **Opcional:** afegeix un botó «Marca totes com a fetes» que actualitzi totes les tasques amb `.map()`.

**Comprovació:** en canviar de filtre, la llista i el missatge buit canvien; els comptadors continuen mostrant el total real; no es muta cap array.

---

## 5. Criteris de comprovació

Marca cada criteri quan el compleixis:

- [ ] Has continuat dins del projecte `hola-mon`; no n'has creat un de nou.
- [ ] El comptador de la Fitxa 02 continua funcionant.
- [ ] Cada component viu en un fitxer propi dins de `src/components/` (excepte `App`).
- [ ] L'input del formulari és controlat amb `value` i `onChange`.
- [ ] El formulari fa servir `onSubmit` i `preventDefault()`.
- [ ] La llista de tasques viu a `App`; el text i l'error viuen a `FormulariTasca`.
- [ ] Afegir, completar i eliminar tasques crea arrays nous; no es muta l'estat.
- [ ] Cada tasca té un `id` estable i la llista fa servir `key={tasca.id}`.
- [ ] El formulari valida el text buit i mostra un missatge.
- [ ] El filtre `totes`/`pendents`/`fetes` funciona.
- [ ] La llista filtrada i els comptadors es calculen a partir de l'estat, sense duplicar-lo.
- [ ] L'estat buit canvia segons el filtre.
- [ ] Els botons tenen estats `hover`, focus visible i `disabled` quan cal.
- [ ] Tailwind continua funcionant i no hi ha classes dinàmiques.
- [ ] La consola del navegador no mostra errors ni avisos de `key`.
- [ ] L'estructura de components és clara i cada fitxer té una responsabilitat.

---

## 6. Continua el projecte

Guarda el projecte `hola-mon`. A la **[Fitxa 04](Fitxa04.md)** treballarem `useContext` per compartir l'estat de les tasques i els filtres entre components sense passar tants props. Més endavant hi afegirem `localStorage` per conservar les dades i React Router per separar les pantalles.

No cal tornar a executar `npm create vite`.

---

## 7. Recursos

- Formularis a React: <https://react.dev/reference/react-dom/components/form>
- Components controlats: <https://react.dev/reference/react-dom/components/input>
- Gestió de l'estat: <https://react.dev/learn/managing-state>
- Actualitzar arrays a l'estat: <https://react.dev/learn/updating-arrays-in-state>
- Renderitzar llistes: <https://react.dev/learn/rendering-lists>
- Condicionals: <https://react.dev/learn/conditional-rendering>
- `crypto.randomUUID()`: <https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID>
- Accessibilitat dels formularis: <https://developer.mozilla.org/en-US/docs/Learn/Forms/HTML_forms_and_accessibility>
- Classes de Tailwind: <https://tailwindcss.com/docs/utility-first>
