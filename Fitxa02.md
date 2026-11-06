# Fitxa 02 — Props, composició i components reutilitzables

> **Objectiu general:** continuar el projecte `hola-mon` de la Fitxa 01, extreure el comptador a un component, comunicar-lo amb props i callbacks, i crear components reutilitzables (`Boto`, `Targeta` i `Missatge`) amb Tailwind.

- **Temps estimat:** 3 sessions de 60 minuts.
- **Requisits previs:** haver completat la [Fitxa 01](Fitxa01.md) o tenir un projecte `hola-mon` equivalent.
- **Projecte:** **no en crees un de nou**. Treballes dins de `hola-mon`.
- **Versions utilitzades:** React 19.3.1, Vite 8.3.4 i Tailwind CSS 4.3.3.

> **Projecte acumulatiu:** cada fitxa afegeix una capa al mateix projecte. En acabar aquesta, el comptador estarà dividit en components i el podràs ampliar a les fitxes següents.

## Continguts

1. Teoria
   - On som i què construirem
   - Un component per fitxer
   - Props: dades del pare al fill
   - Callbacks: funcions com a props
   - `children` i composició
   - Variants amb Tailwind
   - Llistes i `key`
   - Estructura final
2. Activitat 1 — Extreure el `Comptador`
3. Activitat 2 — Un `Boto` reutilitzable
4. Activitat 3 — `Targeta`, `Missatge` i composició
5. Criteris de comprovació
6. Continua el projecte
7. Recursos

---

## 1. Teoria

> **Com llegir aquesta teoria:** els fragments de codi i les comandes són exemples de referència, no passos que cal executar o copiar automàticament. Fes canvis i proves quan un esglaó de les activitats t'ho demani; si hi remet, adapta-hi l'exemple al teu projecte.

### 1.1 On som i què construirem

A la [Fitxa 01](Fitxa01.md) has creat el projecte `hola-mon`, hi has mostrat «Hola món!» i has construït un comptador amb `useState`. També hi has afegit Tailwind CSS v4.

Ara **no crearem cap projecte nou**. Partim d'aquest punt:

- `npm run dev` funciona dins de `hola-mon`.
- La pàgina mostra el comptador amb els botons d'incrementar, decrementar i reiniciar.
- El missatge canvia segons el valor del comptador.
- Tailwind s'aplica correctament.

Si a la Fitxa 01 només vas fer el comptador incremental, també pots continuar. A l'Activitat 1 hi afegiràs les accions de decrement i reinici i el missatge segons el valor abans de separar la interfície. Si ja les tens, conserva-les. Si vas fer el repte extra i tens un `Comptador.jsx` amb el seu propi `useState`, no passa res: en aquesta fitxa aprendràs a **moure l'estat cap amunt** perquè el component sigui reutilitzable.

L'objectiu és passar d'un `App` que ho fa tot a una estructura com aquesta:

```text
App
└── Targeta
    └── Comptador
        ├── Missatge
        ├── Boto (Incrementa)
        ├── Boto (Decrementa)
        └── Boto (Reinicia)
```

Cada component tindrà una responsabilitat clara:

- **`App`** guarda l'estat i decideix què passa quan l'usuari fa clic.
- **`Comptador`** mostra el valor i els botons, i notifica les accions.
- **`Boto`** és un botó reutilitzable amb variants.
- **`Targeta`** embolcalla contingut amb un estil comú.
- **`Missatge`** mostra un text amb un color segons el tipus.

> **Conveni de codi:** a partir d'aquesta fitxa, **cada component viu en un fitxer propi** dins de `src/components/` i s'exporta amb `export default`. `App` és l'excepció: és el component arrel i viu a `src/App.jsx`.

### 1.2 Props: dades del pare al fill

Els **props** són les dades que un component pare passa a un component fill. Pensa-hi com els arguments d'una funció, però aplicats a components.

Fitxer `src/components/Salutacio.jsx`:

```jsx
function Salutacio({ nom, edat }) {
  return (
    <p>
      Hola, {nom}! Tens {edat} anys.
    </p>
  )
}

export default Salutacio
```

Fitxer `src/App.jsx`:

```jsx
import Salutacio from './components/Salutacio.jsx'

function App() {
  return <Salutacio nom="DAW" edat={20} />
}

export default App
```

Punts importants:

- Els textos es poden passar entre cometes: `nom="DAW"`.
- Els números, booleans, objectes, arrays i funcions es passen entre claus: `edat={2}`, `actiu={true}`, `onClick={handleClick}`.
- Un boolean es pot abreujar: `<Boto disabled />` equival a `<Boto disabled={true} />`.
- Els props arriben al fill com un **objecte**. Pots desestructurar-los a la signatura de la funció:

  ```jsx
  function Salutacio({ nom, edat }) { ... }
  ```

  O rebre l'objecte sencer:

  ```jsx
  function Salutacio(props) {
    return <p>Hola, {props.nom}!</p>
  }
  ```

- Pots definir valors per defecte:

  ```jsx
  function Salutacio({ nom = 'món' }) {
    return <p>Hola, {nom}!</p>
  }
  ```

- **Els props són de només lectura.** El fill no els ha de modificar. Si necessita canviar alguna cosa, ha de notificar-ho al pare amb un callback.

  ```jsx
  function Salutacio({ nom }) {
    nom = 'un altre nom' // Incorrecte: no modifiquis els props
  }
  ```

Els props són una **fotografia** de les dades en aquell render. Quan el pare canvia l'estat, React torna a renderitzar els fills amb els props actualitzats.

### 1.3 Callbacks: funcions com a props

Perquè un fill pugui comunicar-se amb el pare, el pare li passa una **funció** com a prop. El fill la crida quan passa alguna cosa, i el pare decideix com actualitzar l'estat.

Fitxer `src/components/Comptador.jsx`:

```jsx
function Comptador({ valor, onIncrementa }) {
  return (
    <div>
      <p>Valor: {valor}</p>
      <button onClick={onIncrementa}>Incrementa</button>
    </div>
  )
}

export default Comptador
```

Fitxer `src/App.jsx`:

```jsx
import { useState } from 'react'
import Comptador from './components/Comptador.jsx'

function App() {
  const [comptador, setComptador] = useState(0)

  function incrementa() {
    setComptador((anterior) => anterior + 1)
  }

  return <Comptador valor={comptador} onIncrementa={incrementa} />
}

export default App
```

Flux de dades:

1. `App` guarda l'estat `comptador`.
2. `App` passa el valor actual i la funció `incrementa` al fill.
3. L'usuari fa clic al botó del fill.
4. El fill crida `onIncrementa`, que és la funció del pare.
5. El pare actualitza l'estat.
6. React torna a renderitzar el fill amb el nou `valor`.

Això s'anomena **pujar l'estat** (*lifting state up*): l'estat viu al component pare comú i els fills només el mostren o notifiquen canvis.

> **Compte:** no cridis la funció durant el render. `onClick={onIncrementa}` passa la funció; `onClick={onIncrementa()}` l'executa immediatament i pot provocar un bucle.

Si el fill necessita enviar un valor al pare, pot cridar el callback amb un argument:

```jsx
<button onClick={() => onCanvia(1)}>Incrementa</button>
<button onClick={() => onCanvia(-1)}>Decrementa</button>
```

```jsx
function canvia(delta) {
  setComptador((anterior) => anterior + delta)
}
```

El fill decideix **quant** canvia; el pare decideix **com** es guarda.

Conveni de noms:

- El prop del fill sol començar per `on`: `onCanvia`, `onIncrementa`, `onReinicia`.
- La funció del pare sol ser un verb: `canvia`, `incrementa`, `reinicia`.

### 1.4 `children` i composició

Hi ha un prop especial anomenat **`children`**. Normalment no es passa amb `nom={valor}`: és el JSX que escrius **entre les etiquetes d'obertura i tancament** d'un component.

Fitxer `src/components/Targeta.jsx`:

```jsx
function Targeta({ titol, children }) {
  return (
    <section className="rounded-2xl bg-slate-800 p-6 shadow-xl">
      <h2 className="text-xl font-bold text-cyan-300">{titol}</h2>
      <div className="mt-4">
        {/* Aquí es mostra el contingut que App ha posat entre <Targeta> i </Targeta>. */}
        {children}
      </div>
    </section>
  )
}

export default Targeta
```

Des de `src/App.jsx`:

```jsx
import Targeta from './components/Targeta.jsx'

function App() {
  return (
    <Targeta titol="Comptador">
      {/* Tot això és el prop children de Targeta. */}
      <p>Aquí va el contingut.</p>
      <button>Un botó</button>
    </Targeta>
  )
}

export default App
```

El bloc que hi ha entre `<Targeta ...>` i `</Targeta>` és el que rep el component fill (`Targeta`) com a `children`. `Targeta` no el rep com un prop anomenat `contingut` ni el construeix: simplement el col·loca allà on escriu `{children}`.

El mateix contingut, vist des dels dos costats:

```text
App.jsx
<Targeta titol="Comptador">
  <p>Aquí va el contingut.</p>   ← això és children
  <button>Un botó</button>
</Targeta>

Targeta.jsx
<div>{children}</div>            ← aquí es mostra
```

La `Targeta` no sap què conté: només ho embolcalla amb un estil comú. Això és **composició**: construir components grans a partir de components petits.

- `children` pot ser text, un element o diversos elements.
- Si un component de composició no mostra `{children}`, el contingut que li passes no apareixerà.
- Els props serveixen per configurar el component; `children` serveix per omplir-lo.

### 1.5 Variants amb Tailwind

Si escrius les mateixes classes a cada botó, el codi es repeteix i és fàcil que els botons quedin inconsistents. Podem crear un `Boto` reutilitzable amb una prop `variant`.

Fitxer `src/components/Boto.jsx`:

```jsx
const ESTILS = {
  primari: 'bg-cyan-500 text-slate-950 hover:bg-cyan-400',
  secundari: 'bg-slate-700 text-slate-100 hover:bg-slate-600',
  perill: 'bg-rose-500 text-white hover:bg-rose-400',
}

function Boto({ variant = 'primari', className = '', children, ...props }) {
  const estilVariant = ESTILS[variant] ?? ESTILS.primari

  return (
    <button
      type="button"
      className={`rounded-lg px-4 py-2 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-50 ${estilVariant} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Boto
```

Cosetes clau:

- **`variant`** tria un conjunt de classes. Si no es passa, s'utilitza `primari`.
- **`className`** permet afegir classes des de fora sense perdre les classes base.
- **`...props`** recull la resta de props (`onClick`, `disabled`, `aria-label`, etc.) i les passa a l'element `<button>`.
- **`type="button"`** evita que el botó enviï un formulari sense voler. Quan fem formularis, això serà important.
- Les classes de Tailwind han d'estar **senceres** al codi. No facis `bg-${variant}-500`; el compilador no ho pot detectar.

Des de `src/components/Comptador.jsx`:

```jsx
import Boto from './Boto.jsx'

function Comptador({ valor, onIncrementa, onDecrementa, onReinicia }) {
  return (
    <>
      <Boto onClick={onIncrementa}>Incrementa</Boto>
      <Boto variant="secundari" onClick={onDecrementa}>
        Decrementa
      </Boto>
      <Boto variant="perill" onClick={onReinicia} disabled={valor === 0}>
        Reinicia
      </Boto>
    </>
  )
}

export default Comptador
```

### 1.6 Llistes i `key`

Quan renders una llista d'elements amb `.map()`, React necessita una **`key`** única per a cada element. La `key` ajuda React a saber quin element és quin quan la llista canvia.

Dins de `src/components/Comptador.jsx`, podem definir les accions així:

```jsx
const accions = [
  { id: 'incrementa', text: 'Incrementa', variant: 'primari' },
  { id: 'decrementa', text: 'Decrementa', variant: 'secundari' },
  { id: 'reinicia', text: 'Reinicia', variant: 'perill' },
]

function executaAccio(id) {
  if (id === 'incrementa') onCanvia(1)
  if (id === 'decrementa') onCanvia(-1)
  if (id === 'reinicia') onReinicia()
}

return (
  <div>
    {accions.map(({ id, text, variant }) => (
      <Boto key={id} variant={variant} onClick={() => executaAccio(id)}>
        {text}
      </Boto>
    ))}
  </div>
)
```

- La `key` ha de ser **estable i única** dins de la llista. Un `id` és una bona opció.
- No facis servir l'índex si la llista pot canviar d'ordre; pot fer que React reutilitzi l'element equivocat.
- La `key` no arriba al component com un prop; és una indicació per a React.

### 1.7 Estructura final i contracte de props

En acabar la fitxa, l'estructura serà aquesta:

```text
hola-mon/
├── src/
│   ├── components/
│   │   ├── Boto.jsx
│   │   ├── Comptador.jsx
│   │   ├── Missatge.jsx
│   │   └── Targeta.jsx
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

**Un component per fitxer.** Cada fitxer de `src/components/` exporta un únic component per defecte. `App` és l'únic component que viu a `src/App.jsx`.

Contracte de props:

| Fitxer | Component | Props principals | Responsabilitat |
| --- | --- | --- | --- |
| `src/App.jsx` | `App` | — | Guarda l'estat i defineix els callbacks |
| `src/components/Comptador.jsx` | `Comptador` | `valor`, `missatge`, `tipus`, `pas`, `onCanvia`, `onReinicia` | Mostra el comptador i notifica les accions |
| `src/components/Boto.jsx` | `Boto` | `variant`, `className`, `children`, `onClick`, `disabled` | Botó reutilitzable |
| `src/components/Targeta.jsx` | `Targeta` | `titol`, `children` | Embolcall visual |
| `src/components/Missatge.jsx` | `Missatge` | `text`, `tipus` | Missatge amb color segons el tipus |

Flux de dades:

```text
App (useState)
  │  valor, missatge, tipus, pas, onCanvia, onReinicia
  ▼
Comptador
  ├── Missatge (text, tipus)
  └── Boto (variant, children, onClick, disabled)
```

`App` continua sent el propietari de l'estat. Els fills només mostren dades i notifiquen accions.

> **Nota:** si un prop ha de travessar molts components intermedis, potser caldrà una altra solució. Més endavant veurem `useContext` per evitar aquest *props drilling*.

---

## 2. Activitat 1 — Extreure el `Comptador`

**Objectiu:** moure la interfície del comptador a `src/components/Comptador.jsx` i comunicar-la amb `App` mitjançant props i callbacks.

**Temps estimat:** 45 minuts.

**Punt de partida:** el projecte `hola-mon` de la Fitxa 01, amb el comptador funcionant dins d'`App`. Si només hi tens el botó «Incrementa», abans de separar el component afegeix-hi «Decrementa», «Reinicia» i el missatge segons el valor, tal com s'indica a l'apartat 1.1. No cal refer la resta de la Fitxa 01.

### Esglaó 1 — Crear el component

1. Crea el fitxer `src/components/Comptador.jsx`. No hi ha d'haver-hi cap altre component en aquest fitxer, i no defineixis `Comptador` dins d'`App.jsx`.
2. Defineix una funció `Comptador` i exporta-la amb `export default`.
3. Mou des d'`App.jsx` al nou component:
   - el text amb el valor del comptador,
   - el missatge,
   - els botons d'incrementar, decrementar i reiniciar.
4. Defineix aquests props:
   - `valor`: el número actual.
   - `missatge`: el text que explica l'estat.
   - `onIncrementa`, `onDecrementa` i `onReinicia`: les funcions que modifiquen l'estat.
5. Dins de `App.jsx`, importa `Comptador` i renderitza'l passant-li els valors i les funcions.
6. Mantén `useState` i els handlers a `App`. El fill **no** ha de tenir estat propi.

**Comprovació:** el comptador es comporta igual que abans, `Comptador.jsx` no importa `useState` i `App.jsx` li passa tots els props.

### Esglaó 2 — Revisar el flux de dades

Comprova aquests punts:

- El valor que es mostra al fill és el mateix que hi ha a l'estat d'`App`.
- Cada botó crida la funció corresponent.
- El missatge es continua calculant a `App`, perquè depèn de l'estat.
- La consola del navegador no mostra errors ni avisos.

Si el fill mostra `undefined` o un botó no fa res, revisa els noms dels props i que els hagi passat tots.

### Esglaó 3 — Un sol callback amb `pas`

Refactoritza el comptador perquè els botons d'increment i decrement comparteixin un callback. Aquest pas és obligatori: permet practicar com un fill pot enviar una dada al pare.

- `Comptador` rebrà `onCanvia` i `onReinicia`.
- Afegeix un prop `pas` amb valor per defecte `1`.
- El botó d'incrementar cridarà `onCanvia(pas)`.
- El botó de decrementar cridarà `onCanvia(-pas)`.
- `App` tindrà una funció `canvia(delta)` que actualitzi l'estat sumant el delta.
- Prova el comptador amb `pas={1}` i després amb `pas={5}`.

**Comprovació:** amb `pas={5}`, cada clic suma o resta `5`; el reset continua posant el valor a `0`; el missatge continua canviant correctament.

**Repte extra (opcional):** afegeix un prop `etiqueta` a `Comptador` per personalitzar el títol de la targeta o del comptador.

---

## 3. Activitat 2 — Un `Boto` reutilitzable

**Objectiu:** crear un component `Boto` amb `children`, variants i propagació de props, i substituir els botons repetits del comptador.

**Temps estimat:** 45 minuts.

### Esglaó 1 — Crear `Boto.jsx`

1. Crea `src/components/Boto.jsx`. No hi ha d'haver-hi cap altre component en aquest fitxer.
2. Defineix un component `Boto` que rebi com a mínim:
   - `children`: el text o contingut del botó.
   - `onClick`: la funció que s'executa en fer clic.
   - `disabled`: si el botó està desactivat.
3. Afegeix les classes base de Tailwind: espaiat, cantonades, tipografia, transició, `hover`, focus visible i estils per a `disabled`.
4. Importa `Boto` dins de `Comptador.jsx`.
5. Substitueix el botó «Incrementa» de `Comptador` per `<Boto>`. Mantén la resta de botons com a `<button>` de moment per comprovar que el canvi funciona.

**Comprovació:** el botó «Incrementa» continua funcionant i ara utilitza `Boto`.

### Esglaó 2 — Afegir variants

1. Afegeix un prop `variant` amb valor per defecte `primari`.
2. Defineix un objecte de classes amb tres variants:
   - `primari`: acció principal.
   - `secundari`: acció alternativa.
   - `perill`: acció destructiva o de reinici.
3. Substitueix els tres botons del comptador per `Boto`:
   - «Incrementa»: `primari`.
   - «Decrementa»: `secundari`.
   - «Reinicia»: `perill`, amb `disabled` quan el valor sigui `0`.
4. Comprova que els colors, el `hover` i l'estat desactivat es veuen correctament.

**Comprovació:** els tres botons comparteixen estructura i només canvia la variant; no hi ha classes repetides a `Comptador`.

### Esglaó 3 — `className` i props extra

Completa `Boto` perquè sigui flexible i pugui substituir els botons natius sense perdre funcionalitats:

- Accepta un prop `className` i **combina'l** amb les classes base.
- Propaga la resta de props a l'element `<button>` amb `...props`, de manera que funcionin `onClick`, `disabled`, `aria-label`, etc.
- Defineix `type="button"` per defecte.
- Utilitza `className="w-full sm:w-auto"` en els botons perquè ocupin tota l'amplada en mòbil i només l'espai necessari en pantalles grans.
- **Opcional:** afegeix un prop `mida` amb les variants `sm` i `md`, també amb un mapa de classes.

**Comprovació:** els botons són més amples en mòbil, les classes personalitzades no esborren les classes base i `disabled` continua funcionant.

---

## 4. Activitat 3 — `Targeta`, `Missatge` i composició

**Objectiu:** compondre la interfície amb components que embolcallen contingut (`Targeta`) i que reben dades presentacionals (`Missatge`).

**Temps estimat:** 60 minuts.

### Esglaó 1 — Crear `Targeta` amb `children`

1. Crea `src/components/Targeta.jsx`. No hi ha d'haver-hi cap altre component en aquest fitxer.
2. Defineix un component `Targeta` amb els props `titol` i `children`.
3. Afegeix les classes de targeta: fons, espaiat, cantonades arrodonides i ombra.
4. Importa `Targeta` dins de `App.jsx` i embolcalla-hi el `Comptador`:

   ```jsx
   <Targeta titol="Comptador">
     {/* Aquest Comptador és el children de Targeta. */}
     <Comptador ... />
   </Targeta>
   ```

5. Si `Comptador` ja tenia classes de targeta o de contenidor, treu-les o mous-les a `Targeta` per no duplicar caixes.

**Comprovació:** el comptador apareix dins d'una targeta i el títol es mostra correctament.

### Esglaó 2 — Crear `Missatge` amb variants

1. Crea `src/components/Missatge.jsx`. No hi ha d'haver-hi cap altre component en aquest fitxer.
2. Defineix un component `Missatge` amb els props `text` i `tipus` (per defecte, `info`).
3. Crea un mapa de classes per als tipus:
   - `info`: missatge neutre.
   - `exit`: missatge positiu (èxit).
   - `error`: missatge negatiu.
4. Importa `Missatge` dins de `Comptador.jsx`.
5. Dins de `App.jsx`, calcula el text i el tipus del missatge segons el valor del comptador.
6. Passa `missatge` i `tipus` a `Comptador`, i des de `Comptador` passa'ls a `Missatge`.
7. Substitueix el paràgraf del missatge per `<Missatge text={missatge} tipus={tipus} />`.

**Comprovació:** el missatge canvia de text i de color quan el comptador és negatiu, zero o positiu.

### Esglaó 3 — Generar les accions amb `.map()` i `key`

Aquest esglaó és obligatori: `.map()` i `key` són continguts que has de saber aplicar per renderitzar llistes a React. Refactoritza els botons del comptador perquè es generin a partir d'una llista:

1. Dins de `src/components/Comptador.jsx`, defineix un array `accions` amb objectes de dades senzills (no hi guardis funcions):
   - `id` únic,
   - `text`,
   - `variant`.
2. Comença amb dues accions (incrementar i decrementar) i renderitza-les amb `.map()`.
3. Afegeix `key={id}` al component retornat pel `.map()` i comprova que desapareix l'avís de React.
4. Afegeix l'acció de reinici i passa-li `disabled={valor === 0}` quan renderitzis el botó.
5. Crea una funció `executaAccio(id)` amb `if`/`else if` per cridar el callback adequat per a cada acció.
6. Passa `onClick={() => executaAccio(id)}` a cada `Boto` i comprova que els tres botons funcionen.

**Repte opcional:** afegeix una acció «Duplica» amb un `id` i un `text` nous. Afegeix el cas corresponent a `executaAccio` i fes que la funció cridi un callback `onDuplica` de `App`.

**Comprovació:** els botons funcionen igual que abans, la llista és més fàcil d'ampliar i no hi ha avisos de React.

---

## 5. Criteris de comprovació

Marca cada criteri quan el compleixis:

- [ ] Has continuat dins del projecte `hola-mon`; no n'has creat un de nou.
- [ ] `App` conserva l'estat i els callbacks.
- [ ] Cada component viu en un fitxer propi dins de `src/components/` (excepte `App`, que viu a `src/App.jsx`).
- [ ] `Comptador` no importa `useState` i només mostra dades i notifica accions.
- [ ] `Comptador` rep els props `valor`, `missatge`, `tipus`, `pas` i els callbacks (`pas` s'introdueix a l'Activitat 1).
- [ ] `Boto` utilitza `children`, `variant`, combina `className`, propaga props amb `...props` i té `type="button"` per defecte.
- [ ] `Targeta` utilitza `children` i rep un `titol`.
- [ ] `Missatge` rep `text` i `tipus` i canvia d'estil segons el tipus.
- [ ] Els botons tenen estats `hover`, focus visible i `disabled`.
- [ ] Les accions es generen amb `.map()` i cada element té una `key` estable.
- [ ] Tailwind continua funcionant i no hi ha classes dinàmiques.
- [ ] La consola del navegador no mostra errors ni avisos.
- [ ] L'estructura de components és clara i cada fitxer té una responsabilitat.

L'acció «Duplica» i el prop opcional `etiqueta` són reptes d'ampliació; la resta dels criteris són requisits de la fitxa.

---

## 6. Continua el projecte

Guarda el projecte `hola-mon`. A la **[Fitxa 03](Fitxa03.md)** hi afegirem formularis controlats i una llista de tasques: aprendràs a gestionar inputs, enviar formularis, validar dades, afegir i eliminar elements i calcular una llista filtrada.

No cal tornar a executar `npm create vite`.

---

## 7. Documentació oficial

Enllaços de consulta complementària sobre els conceptes de la fitxa:

- [Props i passar JSX com a `children`](https://react.dev/learn/passing-props-to-a-component)
- [Respondre a esdeveniments i passar funcions com a props](https://react.dev/learn/responding-to-events)
- [Compartir estat entre components](https://react.dev/learn/sharing-state-between-components)
- [Renderitzar llistes i utilitzar `key`](https://react.dev/learn/rendering-lists)
- [Crear components reutilitzables](https://react.dev/learn/your-first-component)
- [Classes d'utilitat de Tailwind CSS](https://tailwindcss.com/docs/styling-with-utility-classes)
