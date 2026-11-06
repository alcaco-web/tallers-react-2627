# Fitxa 11 — Accessibilitat i desplegament

> **Objectiu general:** fer que `hola-mon` sigui més fàcil d’usar amb teclat, lectors de pantalla i mòbil, i preparar el projecte per publicar-lo en producció amb una API externa.

- **Temps estimat:** 3 sessions de 60 minuts.
- **Requisits previs:** haver completat la [Fitxa 10](Fitxa10.md) o tenir un `hola-mon` equivalent amb Redux Toolkit, proves i CRUD de tasques.
- **Projecte:** **no en crees un de nou**. Treballes dins de `hola-mon`.
- **Versions utilitzades:** les de la Fitxa 10. **No afegeix dependències noves**.
- **Node:** `>=22.22.2`. El taller fa servir Node 22.22.3.
- **Tests:** `npm test` ha de continuar funcionant sense `npm run api`.
- **Desplegament previst:** Netlify o un host estàtic equivalent. L’API de tasques s’ha de desplegar a part.

> **Important:** `json-server` és una eina de desenvolupament local. No el podem executar màgicament dins de Netlify. El frontend publicat necessita una URL d’API accessible per HTTPS.

> **No cal instal·lar res nou:** per a l’accessibilitat farem servir HTML semàntic, ARIA, CSS, Testing Library i les eines del navegador.

## Continguts

1. Teoria
   - Què és l’accessibilitat
   - WCAG i els quatre principis
   - HTML semàntic i landmarks
   - Teclat i focus
   - Skip link
   - Formularis, etiquetes i errors
   - ARIA amb criteri
   - Estat, anuncis i lectors de pantalla
   - Color, contrast, zoom i moviment
   - Com auditar l’accessibilitat
   - Proves automàtiques d’accessibilitat
   - Desplegament: build, host estàtic i API
   - Variables d’entorn
   - Rutes SPA i fallback
   - Netlify
   - Alternativa Vercel
   - GitHub Pages
   - Checklist posterior al desplegament
   - Resum
2. Activitat 1 — Estructura accessible i focus
3. Activitat 2 — Tests de teclat, etiquetes i anuncis
4. Activitat 3 — Variables d’entorn i desplegament
5. Criteris de comprovació
6. Continua el projecte
7. Recursos

---

## 1. Teoria

> **Com llegir aquesta teoria:** els fragments de codi i les comandes són exemples de referència, no passos que cal executar o copiar automàticament. Fes canvis i proves quan un esglaó de les activitats t'ho demani; si hi remet, adapta-hi l'exemple al teu projecte.

### 1.1 Què és l’accessibilitat

L’accessibilitat web és el conjunt de decisions que fan que una aplicació es pugui fer servir per persones amb capacitats, dispositius i contextos diferents:

- persones que no veuen la pantalla i fan servir un lector de pantalla;
- persones que no poden fer servir el ratolí;
- persones amb baixa visió que amplien la pantalla;
- persones amb sensibilitat al moviment;
- persones que fan servir el mòbil amb una mà;
- persones amb connexió lenta o un dispositiu antic.

No és només “fer-ho bonic”. És fer-ho **usable**.

### 1.2 WCAG i els quatre principis

Les **WCAG** (Web Content Accessibility Guidelines) organitzen les recomanacions en quatre principis, coneguts com **POUR**:

| Principi | Què vol dir | Exemple al projecte |
| --- | --- | --- |
| **Perceptible** | La informació s’ha de poder percebre. | Text alternatiu, contrast, no només color. |
| **Operable** | S’ha de poder fer servir amb teclat i altres dispositius. | Botons reals, focus visible, skip link. |
| **Comprensible** | El comportament ha de ser previsible. | Etiquetes clares, errors comprensibles. |
| **Robust** | Ha de funcionar amb tecnologies d’assistència. | HTML semàntic, ARIA correcta. |

Els nivells habituals són **A**, **AA** i **AAA**. En un projecte web normal, l’objectiu raonable és **AA**.

No cal memoritzar totes les WCAG. Cal entendre els principis i saber detectar els errors més comuns.

### 1.3 HTML semàntic i landmarks

El primer pas no és afegir `aria-*` per tot arreu. El primer pas és fer servir l’element correcte:

- `<button>` per a accions;
- `<a>` per a navegació;
- `<label>` per als camps;
- `<ul>`/`<li>` per a llistes;
- `<h1>`–`<h6>` per a jerarquia de títols;
- `<header>`, `<nav>`, `<main>` i `<footer>` per a les zones principals.

Exemple:

```jsx
<header>
  <h1>Hola món!</h1>
  <nav aria-label="Navegació principal">...</nav>
</header>
<main id="contingut-principal" tabIndex={-1}>
  ...
</main>
<footer>...</footer>
```

Aquests elements creen **landmarks** que els lectors de pantalla poden utilitzar per saltar d’una zona a una altra.

Un `div` amb `onClick` no és un botó:

```jsx
// Evita-ho
<div onClick={elimina}>Elimina</div>
```

```jsx
// Millor
<button type="button" onClick={elimina}>Elimina</button>
```

### 1.4 Teclat i focus

Una persona que no fa servir ratolí ha de poder:

- navegar amb **Tab** i **Shift+Tab**;
- activar botons amb **Enter** o **Espai**;
- obrir enllaços amb **Enter**;
- veure sempre on és el focus;
- no quedar atrapada en cap lloc;
- entendre l’ordre de lectura.

El **focus visible** és obligatori. No facis:

```css
*:focus {
  outline: none;
}
```

Si necessites personalitzar-lo, fes servir `:focus-visible` i mantén un indicador clar:

```jsx
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
```

Quan canvia el contingut d’una pàgina, pot caldre **moure el focus** a un lloc lògic. En aquest projecte ho farem amb el skip link i el `main`.

### 1.5 Skip link

El **skip link** és un enllaç que només es veu quan rep el focus. Permet saltar la navegació i anar directament al contingut principal.

```jsx
<a
  href="#contingut-principal"
  onClick={saltaAlContingut}
  className="skip-link sr-only"
>
  Salta al contingut principal
</a>
```

I el destí:

```jsx
<main id="contingut-principal" tabIndex={-1} ref={mainRef}>
  ...
</main>
```

`tabIndex={-1}` permet que el `main` rebi focus per codi, però no entra a l’ordre normal de tabulació.

### 1.6 Formularis, etiquetes i errors

Cada camp ha de tenir una etiqueta associada:

```jsx
<label htmlFor="tasca">Nova tasca</label>
<input id="tasca" ... />
```

Quan hi ha un error:

- el camp ha de tenir `aria-invalid="true"`;
- el missatge ha d’estar associat amb `aria-describedby`;
- el missatge s’ha d’anunciar.

```jsx
<input
  id="tasca"
  aria-invalid={error ? 'true' : 'false'}
  aria-describedby={error ? 'error-tasca' : 'ajuda-tasca'}
/>
```

No n’hi ha prou amb posar el text en vermell. El color no és l’única manera de comunicar un error.

### 1.7 ARIA amb criteri

La primera regla d’ARIA és: **si HTML ja ho fa, no facis servir ARIA**.

- Un `<button>` ja és un botó.
- Un `<nav>` ja és una navegació.
- Un `<main>` ja és el contingut principal.

ARIA útil en aquest projecte:

| Atribut | Per a què serveix |
| --- | --- |
| `aria-label` | Dona un nom accessible a un element sense text visible suficient. |
| `aria-current="page"` | Indica l’enllaç de la pàgina actual. |
| `aria-pressed` | Indica l’estat d’un botó de tipus alternança. |
| `aria-live` | Anuncia canvis de contingut. |
| `role="alert"` | Anuncia un error important de manera immediata. |
| `aria-describedby` | Associa un text descriptiu o d’error. |
| `aria-invalid` | Indica que un camp té un valor no vàlid. |

`NavLink` de React Router ja posa `aria-current="page"` quan l’enllaç és actiu. No cal fer-ho a mà.

### 1.8 Estat, anuncis i lectors de pantalla

Els canvis que no provoquen una navegació no sempre s’anuncien. Per això fem servir regions live:

```jsx
<p aria-live="polite">Pendents: 2 · Fetes: 1</p>
```

- `polite`: s’anuncia quan el lector acaba el que estava dient.
- `assertive`: interromp. S’ha de fer servir amb cura.
- `role="alert"`: equivalent pràctic a una regió assertiva per a errors.

Al projecte:

- els comptadors tenen `aria-live="polite"`;
- els errors tenen `role="alert"`;
- els missatges informatius tenen `role="status"`.

No posis `role="alert"` a tot. Si tot crida, res no destaca.

### 1.9 Color, contrast, zoom i moviment

#### Contrast

El text normal hauria de tenir un contrast mínim de **4,5:1**; el text gran, **3:1**. Les eines com Lighthouse o axe ho comproven.

No facis servir només el color per indicar estat. Al projecte, una tasca feta té:
- text ratllat;
- color més apagat;
- una casella marcada.

#### Zoom

Prova l’aplicació al **200%** de zoom i a **320 px** d’amplada. No ha d’aparèixer scroll horitzontal innecessari ni contingut tallat.

#### Moviment

Si hi ha animacions, respecta la preferència de l’usuari:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 1.10 Com auditar l’accessibilitat

Combina eines automàtiques i proves manuals.

#### Eines automàtiques

- **Lighthouse** a Chrome DevTools, pestanya **Lighthouse** → **Accessibility**.
- **axe DevTools**, extensió de navegador.
- **WAVE**, extensió o web.

Aquestes eines detecten problemes com:

- imatges sense `alt`;
- contrast insufficient;
- camps sense etiqueta;
- rols ARIA incorrectes;
- enllaços buits.

No ho detecten tot. Per exemple, no saben si l’ordre de lectura té sentit per a una persona.

#### Proves manuals

1. Navega només amb **Tab** i **Shift+Tab**.
2. Activa tot amb **Enter** o **Espai**.
3. Comprova que el focus sempre es veu.
4. Amplia al **200%**.
5. Prova amb el mòbil o una amplada de **320 px**.
6. Passa Lighthouse i axe.
7. Si pots, prova amb **VoiceOver** (macOS: `Cmd + F5`) o **NVDA** (Windows).

### 1.11 Proves automàtiques d’accessibilitat

A la Fitxa 10 vam aprendre Testing Library. Ara podem provar aspectes d’accessibilitat:

- el skip link existeix i porta al `main`;
- el `main` pot rebre focus;
- el títol del document canvia;
- l’enllaç actiu té `aria-current`;
- els botons de filtre tenen `aria-pressed`;
- les tasques tenen noms accessibles;
- els errors tenen `role="alert"`;
- els camps tenen `aria-invalid` i `aria-describedby`;
- els comptadors tenen `aria-live`.

Això no substitueix Lighthouse ni una prova amb lector de pantalla, però evita regressions.

### 1.12 Desplegament: build, host estàtic i API

Fins ara hem treballat amb:

```bash
npm run api
npm run dev
```

En producció no executem Vite en mode desenvolupament. Fem un **build**:

```bash
npm run build
```

Vite genera la carpeta `dist/` amb HTML, CSS i JavaScript optimitzats. Aquesta carpeta es publica en un **host estàtic**:

- Netlify;
- Vercel;
- Cloudflare Pages;
- GitHub Pages;
- Firebase Hosting;
- un servidor propi.

Però `hola-mon` no és només estàtic: necessita l’API de tasques.

### 1.13 Variables d’entorn

No podem posar una URL d’API escrita a mà per a cada entorn. Fem servir variables:

```bash
VITE_API_URL=https://api.exemple.com
```

A `src/api/tasques.js`:

```js
const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

const URL_TASQUES = `${API_URL}/tasques`
```

A Vite, les variables que comencen per `VITE_` són **públiques**: acaben al bundle del navegador. No hi posis secrets, tokens privats ni contrasenyes.

Crea `.env.example` per documentar-les, però no versionis `.env`:

```bash
VITE_API_URL=http://localhost:3001
```

### 1.14 Rutes SPA i fallback

`BrowserRouter` fa servir URLs netes:

```text
/tasques
/tasques/2
/descobreix
```

Quan l’usuari entra directament a `/tasques/2`, el servidor no té cap fitxer amb aquesta ruta. Ha de retornar `index.html` i deixar que React Router decideixi.

Això s’anomena **fallback SPA** o **rewrite**.

Sense fallback:

- la pàgina principal funciona;
- en recarregar `/tasques/2` apareix un 404 del servidor.

Amb Netlify, ho resolem amb `netlify.toml` o `public/_redirects`.

### 1.15 Netlify

`netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22.22.3"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

`public/_redirects`:

```text
/* /index.html 200
```

Vite copia `_redirects` dins de `dist/`.

Passos habituals:

1. Puja el projecte a GitHub.
2. Crea un lloc a Netlify des del repositori.
3. Build command: `npm run build`.
4. Publish directory: `dist`.
5. Afegeix `VITE_API_URL` a les variables d’entorn.
6. Desplega.
7. Prova les rutes directes i refresca-les.

### 1.16 Alternativa Vercel

A Vercel, el rewrite es pot configurar amb `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

La resta és semblant: build `npm run build`, output `dist`, variable `VITE_API_URL`.

### 1.17 GitHub Pages

GitHub Pages és una mica més complicat per a una SPA amb `BrowserRouter`:

- el projecte pot penjar d’un subdirectori, i cal configurar `base` a `vite.config.js`;
- no hi ha reescriptura de servidor;
- cal un `404.html` que carregui l’aplicació o fer servir `HashRouter`.

Per a aquest taller, Netlify o Vercel són més directes. Si tries GitHub Pages, documenta el `base` i el `404.html`.

### 1.18 Checklist posterior al desplegament

- [ ] La pàgina principal carrega.
- [ ] `/tasques` carrega directament.
- [ ] `/tasques/2` carrega directament i en recarregar.
- [ ] `/descobreix` carrega directament.
- [ ] Una ruta inexistent mostra el 404 de l’aplicació, no el del host.
- [ ] L’API respon per HTTPS.
- [ ] L’API permet l’origen del lloc desplegat (CORS).
- [ ] `VITE_API_URL` apunta a l’API correcta.
- [ ] No hi ha errors a la consola.
- [ ] Lighthouse Accessibility dona un resultat raonable.
- [ ] Es pot navegar amb teclat.
- [ ] El skip link funciona.
- [ ] El títol del document canvia per ruta.
- [ ] El formulari i els errors són accessibles.
- [ ] `npm test` i `npm run build` passen abans de desplegar.

### 1.19 Resum

1. L’accessibilitat és part de la qualitat, no un extra.
2. Fes servir HTML semàntic abans d’ARIA.
3. El teclat i el focus són imprescindibles.
4. El skip link ajuda a saltar la navegació.
5. Les etiquetes, errors i estats s’han d’anunciar.
6. `aria-current`, `aria-pressed`, `aria-live` i `role="alert"` són eines concretes.
7. Respecta el contrast, el zoom i `prefers-reduced-motion`.
8. Combina Lighthouse/axe amb proves manuals.
9. El build genera `dist/`; l’API va a part.
10. `VITE_*` és públic.
11. Una SPA necessita fallback a `index.html`.
12. Prova sempre les rutes directes i recarregades després de desplegar.

---

## 2. Activitat 1 — Estructura accessible i focus

**Objectiu:** millorar l’estructura semàntica, el focus, els anuncis i el títol de la pàgina.

**Temps estimat:** 60 minuts.

### Esglaó 1 — Skip link i `main`

A `Layout.jsx`:

- afegeix un enllaç “Salta al contingut principal”;
- dona `id="contingut-principal"` al `main`;
- posa `tabIndex={-1}` al `main`;
- quan es cliqui el skip link, mou el focus al `main`.

El skip link ha de ser visible quan rep focus.

### Esglaó 2 — Títol del document

Crea un hook `useDocumentTitle` que actualitzi `document.title` segons la ruta.

A `Layout.jsx`, relaciona:

- `/` → `Inici`;
- `/tasques` → `Tasques`;
- `/tasques/:id` → `Detall de la tasca`;
- `/descobreix` → `Descobreix`;
- qualsevol altra → `Pàgina no trobada`.

El títol final ha de ser, per exemple, `Tasques · Hola món`.

### Esglaó 3 — Missatges i errors

A `Missatge.jsx`:

- els errors han de tenir `role="alert"`;
- la resta de missatges, `role="status"`;
- afegeix `aria-atomic="true"`.

Comprova que els errors de càrrega, d’acció i de validació continuen veient-se igual.

### Esglaó 4 — Noms accessibles

- L’enllaç “Detall” de cada tasca ha de tenir un nom com `Veure detall de la tasca Practicar useContext`.
- Els botons d’eliminar de la llista i del detall han de tenir un nom com `Elimina la tasca Practicar useContext`.
- Comprova que les caselles i els botons de filtre ja tenen noms accessibles.

### Esglaó 5 — Moviment reduït i contrast

A `index.css`:

- afegeix estils per al skip link;
- afegeix `@media (prefers-reduced-motion: reduce)`;
- desactiva transicions i animacions quan l’usuari ho demana.

Revisa també els textos petits i els estats:

- l’enllaç actiu de la navegació;
- el peu de pàgina;
- el text de les tasques fetes;
- els placeholders dels formularis.

Si Lighthouse marca contrast, apuja el to del text o del fons. Per exemple, pots passar d’un `slate-400` a un `slate-500` o `slate-600`, o d’un `cyan-600` a un `cyan-700`.

### Esglaó 6 — Auditoria manual

1. Navega amb **Tab** per tota l’aplicació.
2. Comprova que el skip link apareix i funciona.
3. Comprova que el focus sempre és visible.
4. Amplia al **200%**.
5. Passa Lighthouse a `/tasques`.
6. Passa axe DevTools.
7. Apunta els problemes i corregeix els que siguin raonables.

En acabar, `npm test` ha de continuar mostrant les **22 proves** de la Fitxa 10.

### Repte opcional

Afegeix un enllaç de salt també a la pàgina de detall o revisa l’ordre de tabulació de la targeta d’una tasca.

---

## 3. Activitat 2 — Tests de teclat, etiquetes i anuncis

**Objectiu:** convertir part de l’auditoria en proves automàtiques per evitar regressions.

**Temps estimat:** 50 minuts.

### Esglaó 1 — Crear el fitxer de proves

Crea `src/test/accessibilitat.test.jsx`.

Fes servir:

- `MemoryRouter`, `Routes` i `Route` per provar `Layout`;
- `renderAmbProviders` per provar `PaginaTasques`;
- `screen`, `userEvent`, `waitFor`;
- matchers de `jest-dom` com `toHaveFocus`, `toHaveAttribute` i `toHaveTextContent`.

### Esglaó 2 — Provar el skip link i el títol

Prova que:

- el skip link té `href="#contingut-principal"`;
- amb `Tab` el skip link rep el focus i amb `Enter` el `main` rep el focus;
- `document.title` canvia segons la ruta.

### Esglaó 3 — Provar navegació i filtres

Prova que:

- l’enllaç actiu té `aria-current="page"`;
- els botons de filtre tenen `aria-pressed` i canvien en clicar-los;
- com a mínim un filtre es pot activar amb la barra d’espai quan té el focus.

### Esglaó 4 — Provar noms i errors

Prova que:

- la casella d’una tasca té com a nom el text de la tasca;
- el botó d’eliminar té un nom descriptiu;
- l’enllaç de detall té un nom descriptiu i el `href` correcte;
- un error d’acció té `role="alert"`;
- un error de validació té `role="alert"`, `aria-invalid` i `aria-describedby`.

### Esglaó 5 — Provar els comptadors live

Prova que el text dels comptadors té `aria-live="polite"`.

### Esglaó 6 — Executar

```bash
npm test
```

A més de les proves automàtiques, passa Lighthouse i axe. Les proves no ho detecten tot.

En acabar, `npm test` ha de mostrar **31 proves**: les 22 de la Fitxa 10 i les 9 noves d’accessibilitat.

### Repte opcional

Afegeix una prova per comprovar que el formulari d’edició també té etiqueta, error associat i `aria-invalid`.

---

## 4. Activitat 3 — Variables d’entorn i desplegament

**Objectiu:** preparar el projecte per publicar-lo amb una API externa i comprovar que les rutes SPA funcionen.

**Temps estimat:** 50 minuts per a build i preview locals. La publicació real i el desplegament de l’API són extensions que poden requerir més temps.

### Esglaó 1 — Variable d’API

A `src/api/tasques.js`:

- llegeix `import.meta.env.VITE_API_URL`;
- si no existeix, fes servir `http://localhost:3001`;
- elimina la barra final si cal;
- construeix `${API_URL}/tasques`.

Crea `.env.example` amb la variable documentada.

### Esglaó 2 — Configurar Netlify

Crea `netlify.toml` amb:

- `command = "npm run build"`;
- `publish = "dist"`;
- `NODE_VERSION = "22.22.3"`;
- rewrite de `/*` a `/index.html` amb estat 200.

Crea també `public/_redirects` amb `/* /index.html 200`.

### Esglaó 3 — Comprovar el build

```bash
npm run build
npm run preview
```

Comprova:

- `/`;
- `/tasques`;
- `/tasques/2`;
- `/descobreix`;
- una ruta inexistent.

Comprova que `dist/_redirects` existeix.

Les **31 proves** han de continuar passant.

### Esglaó 4 — Tancar la comprovació local

Per a l’activitat obligatòria, comprova les rutes amb `npm run preview` i deixa anotada la configuració de Netlify. Si publiques el frontend sense una API disponible, les rutes i la interfície poden funcionar, però les operacions de tasques mostraran l’error de connexió esperat.

### Esglaó 5 — Extensió opcional: publicar frontend i API reals

Si tens temps i accés a un servei d’allotjament:

1. Puja el projecte a GitHub i publica el frontend a Netlify.
2. `json-server` no s’executa a Netlify: desplega’l en un servei de Node o fes servir un backend/servei de dades.
3. Configura `VITE_API_URL` amb l’adreça HTTPS de l’API i torna a desplegar el frontend.
4. Prova les rutes directes i les operacions CRUD.

Tria una opció per a l’API:

- desplegar `json-server` en un servei de Node (Render, Railway, Fly.io…);
- fer servir un backend propi;
- fer servir un servei de dades temporal.

Comprova:

- HTTPS;
- CORS;
- que `VITE_API_URL` apunta a l’API correcta;
- que les operacions `GET`, `POST`, `PATCH` i `DELETE` funcionen.

### Esglaó 6 — Auditoria posterior (si has publicat el lloc)

Passa Lighthouse sobre el lloc desplegat i repeteix les proves de teclat.

### Repte opcional

Afegeix una configuració equivalent per a Vercel amb `vercel.json` i documenta-la al README.

---

## 5. Criteris de comprovació

- [ ] Has continuat dins del projecte `hola-mon`.
- [ ] El skip link existeix i porta al `main`.
- [ ] El `main` pot rebre focus.
- [ ] El títol del document canvia per ruta.
- [ ] Els errors tenen `role="alert"` i la resta de missatges `role="status"`.
- [ ] Els enllaços i botons tenen noms accessibles.
- [ ] Els filtres tenen `aria-pressed`.
- [ ] L’enllaç actiu té `aria-current`.
- [ ] Els comptadors tenen `aria-live`.
- [ ] Els camps tenen etiqueta i errors associats.
- [ ] Has afegit `prefers-reduced-motion`.
- [ ] Has revisat els contrastos de text petit i estats.
- [ ] Has passat Lighthouse o axe.
- [ ] Has provat l’aplicació amb teclat.
- [ ] `npm test` passa.
- [ ] `npm run build` passa.
- [ ] `VITE_API_URL` està documentada a `.env.example`.
- [ ] `.env` no es versiona.
- [ ] `netlify.toml` i `public/_redirects` existeixen.
- [ ] `dist/_redirects` existeix després del build.
- [ ] Les rutes directes funcionen amb `npm run preview`.
- [ ] Si has publicat el lloc, has provat les rutes directes.
- [ ] Si has desplegat una API, respon per HTTPS i permet CORS.
- [ ] No hi ha secrets al bundle.

## 6. Continua el projecte

Guarda `hola-mon` amb l’accessibilitat millorada i el desplegament preparat.

La propera fita prevista és el **projecte final i lliurament**: revisió completa, presentació i posada en producció.

## 7. Recursos

- WCAG 2.2: <https://www.w3.org/TR/WCAG22/>
- WAI, accessibilitat: <https://www.w3.org/WAI/>
- MDN, ARIA: <https://developer.mozilla.org/ca/docs/Web/Accessibility/ARIA>
- MDN, `prefers-reduced-motion`: <https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion>
- Lighthouse: <https://developer.chrome.com/docs/lighthouse/overview/>
- axe DevTools: <https://www.deque.com/axe/devtools/>
- Testing Library, accessibilitat: <https://testing-library.com/docs/queries/about/#priority>
- Vite, variables d’entorn: <https://vite.dev/guide/env-and-mode>
- Vite, build: <https://vite.dev/guide/build>
- Netlify, redirects: <https://docs.netlify.com/routing/redirects/>
- Netlify, `netlify.toml`: <https://docs.netlify.com/configure-builds/file-based-configuration/>
- Vercel, rewrites: <https://vercel.com/docs/rewrites>
- React Router, `BrowserRouter`: <https://reactrouter.com/api/declarative-routers/BrowserRouter>
