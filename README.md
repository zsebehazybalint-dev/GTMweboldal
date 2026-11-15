# GTM Autószerviz – weboldal

Statikus, többoldalas HTML-weboldal a GTM Autószerviz Kft. (Bordány) számára.
Nincs keretrendszer, nincs build-lépés – minden fájl szerkeszthető egy egyszerű
szövegszerkesztőben is. A háttér: [03_weboldal_specifikacio.md](../03_weboldal_specifikacio.md).

## Fájlszerkezet

```
index.html, szerelo-partner.html, hengerfej-*.html, futomu-beallitas.html,
gumiszereles.html, rolunk.html, kapcsolat.html, koszonjuk.html,
adatvedelem.html, 404.html   -> az oldalak
css/style.css                -> egyetlen közös stíluslap
js/app.js                    -> téma, mobilmenü, UTM-megőrzés, űrlap
fonts/                       -> self-hosted Barlow / Barlow Condensed (woff2)
kepek/                       -> logó, favicon-ok, OG-kártya
robots.txt, sitemap.xml, site.webmanifest, wrangler.toml
```

## Szöveg módosítása

Minden oldal önálló `.html` fájl, a látható szöveg a `<main>` elemen belül van.
A fejléc, lábléc és CTA-sáv markupja **minden oldalon betűre azonos** – ha ezeken
változtatsz, keress-cserélj az összes fájlban egyszerre (pl. a nyitvatartás vagy
a telefonszám csak egy helyen, de 12 fájlban fordul elő).

Sárga hátterű, `.placeholder` osztályú szövegek jelzik, hol hiányzik még ügyféladat
vagy jóváhagyás – ezek mellett HTML-kommentben áll, mire várnak. **Élesítés előtt
ezeket végig kell nézni és kitölteni vagy törölni.**

## Deploy (Cloudflare Workers)

1. A `weboldal/` mappa tartalma kerüljön egy új, üres GitHub-repó **gyökerébe**.
2. Cloudflare Dashboard → Workers & Pages → Create → Import a repository.
3. Build parancs: `npx wrangler deploy` (nincs build kimeneti könyvtár, mert nincs build).
4. Minden `git push` a `main` ágra automatikus újradeployt indít (Workers Builds).
5. Egyedi domain: Worker → Settings → Domains & Routes → `gtmautoszerviz.hu`.

## Formspree bekötése

1. Regisztráció a [formspree.io](https://formspree.io) oldalon, új form létrehozása.
2. A kapott `https://formspree.io/f/XXXXXXXX` endpointot be kell írni **két helyre**:
   - `js/app.js` tetején a `FORMSPREE_ENDPOINT` konstansba,
   - minden `<form action="https://formspree.io/f/XXXXXXXX" ...>` attribútumba
     (`szerelo-partner.html` és `kapcsolat.html`).
3. Élesítés előtt küldj egy teszt-üzenetet, és ellenőrizd, hogy megérkezik-e.

## Domain csere

A kanonikus domain egyetlen string: `https://gtmautoszerviz.hu`. Ez előfordul a
`js/app.js` `CANONICAL_ORIGIN` konstansában, minden oldal `<link rel="canonical">`
és `og:url`/`og:image` címkéjében, a JSON-LD blokkokban, a `sitemap.xml`-ben és a
`robots.txt` éles blokkjában. Domainváltás esetén ezt a szöveget kell keresni-cserélni
az összes fájlban.

## Élesítés

Az oldal jelenleg **privát állapotban** van: minden oldal `<head>`-je tartalmaz egy
`<meta name="robots" content="noindex, nofollow">` sort, a `robots.txt` pedig mindent
tilt. Ez addig marad, amíg az ügyfél Cloudflare Access mögött meg nem nézi az oldalt.

Élesítéskor, **ebben a sorrendben**:

- [ ] **1. Cloudflare Access lekapcsolása** a Worker-en (ha be volt kapcsolva).
- [ ] **2. A `noindex` meta-tag törlése minden oldalról**, a `koszonjuk.html` és a
      `404.html` kivételével (ezek szándékosan maradnak `noindex`-en).
      Keresd az `<!-- ÉLESÍTÉSKOR TÖRLENDŐ -->` kommentet minden fájlban.
- [ ] **3. A `robots.txt` cseréje**: a fájl tetején lévő tiltó blokkot törölni kell,
      és a fájlban kikommentezve már ott álló éles blokkot (`Allow: /` + `Sitemap:`)
      kell élesíteni.
- [ ] **4. Csak ezután**: a `sitemap.xml` beküldése a Google Search Console-ba és a
      Bing Webmaster Toolsba.

Emellett, a 13. fejezet (lásd a specifikációban) szerinti blokkolók – cégjegyzékszám,
adószám, a futómű bruttó ára, a garancia szövege, a visszahívásért felelős személy –
nélkül az oldal **tartalmilag és jogilag sem** élesíthető, még ha technikailag már
nyilvános is.

## Cloudflare Web Analytics (opcionális, utólag)

A mérés jelenleg nincs bekötve (az oldal cookie-mentes, nincs szükség süti-bannerre).
Ha a Cloudflare Web Analytics beacon-szkriptjét be szeretnéd kötni, a Cloudflare
Dashboardon kell előbb legenerálni a saját site tag-et, majd azt minden oldal
`</body>` elé be kell illeszteni. Eddig helykitöltő sincs érte a kódban, mert a
beacon-kód a dashboardon generálódik, előre nem ismert.
