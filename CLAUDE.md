# CLAUDE.md – konvenciók ehhez a repóhoz

Ez a `weboldal/` mappa egy önálló GitHub-repó gyökere: a GTM Autószerviz Kft.
statikus, többoldalas weboldala. Nincs keretrendszer, nincs build-lépés.
A teljes terv a projekt `03_weboldal_specifikacio.md` fájljában van (a repón kívül).

## Kanonikus URL-ek: `.html` végződéssel

Minden belső link, `<link rel="canonical">`, `og:url` és a `sitemap.xml` is a
`.html` kiterjesztéssel hivatkozik az oldalakra (pl. `kapcsolat.html`, nem `kapcsolat`).
Ezért van a `wrangler.toml`-ban `html_handling = "none"` – ez tiltja, hogy a Cloudflare
automatikusan átirányítsa a kiterjesztés nélküli és a kiterjesztéses URL-eket egymásba.
**Soha ne vegyél fel kiterjesztés nélküli belső linket**, és ne változtass a
`html_handling` értékén anélkül, hogy az összes linket át ne nézted volna.

## Token-alapú színrendszer

Minden szín a `css/style.css` tetején definiált CSS-változókon (`--bg`, `--surface`,
`--text`, `--accent` stb.) keresztül érhető el, háromállapotú témalogikával
(`:root`, `prefers-color-scheme`, `[data-theme]`). **Ne írj be literál színkódot**
egy komponens stílusába – ha hiányzik egy token, vedd fel a `:root`, a
`prefers-color-scheme: dark` és a `[data-theme="dark"]` blokkba egyszerre, mind a
három helyre, különben a téma váltásnál vagy a rendszerbeállítás követésénél törik
a konzisztencia.

A FOUC-mentesség kulcsa a minden oldal `<head>`-jének legelején álló inline szkript
(`localStorage.getItem('gtm-theme')` → `data-theme` attribútum). Ez fusson **minden
CSS és egyéb szkript előtt** – ha új oldalt hozol létre, másold ide is változtatás
nélkül.

## Fejléc, lábléc, CTA-sáv: betűre azonos minden oldalon

A header, a footer és a mobil hívás-sáv markupja szándékosan egyezik szóról szóra
minden `.html` fájlban, kivéve az aktív nav-elem jelölését (`aria-current="page"`
az adott linken). Ez azért fontos, mert így egy globális keresés-cserével (pl. a
telefonszám vagy a nyitvatartás módosításakor) minden oldal egyszerre javítható.
**Ne térj el ettől a mintától**, és ne szervezd ki ezeket külön fájlba (nincs
server-side include, statikus a kiszolgálás).

## Kitalált adat tilalma

Ez a weboldal valós ügyféladatokból épül. **Tilos kitalálni** árat, garanciát,
kapacitást, referenciát, géptípust vagy bármilyen más tényt, ami nincs forrásolva
a projekt `ugyfel_adatlap.md` vagy `jegyzet_2026_10_25.txt` fájljában. Ha egy
szekcióhoz szerkezetileg kell szöveg, de nincs rá adat, használd a `.placeholder`
jelölést (lásd lent) – ne tölts ki kitalált tartalommal.

## A `.placeholder` jelölés

```html
<!-- ÜGYFÉL ADATÁRA VÁR (spec X.Y): mire várunk és miért blokkoló/opcionális. -->
<p class="placeholder">[ÜGYFÉL ADATÁRA VÁR: mi hiányzik]</p>
```

A `.placeholder` osztály (lásd `css/style.css`) szándékosan feltűnő (sárga
hátterű), hogy élesítés előtt ne maradjon véletlenül az oldalon. Minden
`.placeholder` elem mellett álljon egy HTML-kommentben a forrás (spec-pont vagy
ügyféladatlap-hivatkozás) és a kontextus. Élesítés előtt az összes
`.placeholder` előfordulást végig kell nézni: vagy kitöltik valós adattal, vagy
törlik a szekciót.

## Egyéb

- A kanonikus domain (`https://gtmautoszerviz.hu`) egyetlen string, ami előfordul a
  `js/app.js` `CANONICAL_ORIGIN` konstansában és minden oldal meta-címkéiben –
  domainváltáskor ezt kell keresni-cserélni mindenhol (lásd README „Domain csere").
- A `js/app.js` tetején lévő `FORMSPREE_ENDPOINT` konstans és minden `<form
  action="...">` attribútum ugyanazt a Formspree-URL-t tartalmazza – kettőt kell
  cserélni élesítéskor (lásd README „Formspree bekötése").
- Nincs külső hálózati kérés (nincs CDN-font, nincs beágyazott térkép, nincs
  analitika-szkript) – ez szándékos, a cookie-mentes státusz és a gyors betöltés
  miatt. Ne adj hozzá új külső erőforrást anélkül, hogy ezt a döntést felülvizsgálnád.
