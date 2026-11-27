# GTM Autószerviz Website

A static marketing website for a car repair shop in Bordány, Hungary, built as paid client work.

## What it does

The site covers a repair shop's core services — engine head repair and replacement (including an agricultural-machinery variant), wheel alignment, and tyre fitting — split across separate pages for mechanics (B2B subcontracting) and car owners (B2C). It includes a contact form, a privacy policy page, and schema.org structured data for local-business search results. All page content is in Hungarian, written for Hungarian customers; this README is written for an international audience, not the site's own visitors.

## How it's built

Plain HTML, CSS, and vanilla JavaScript — no framework, no build step, no `package.json`. Fonts (Barlow, Barlow Condensed) are self-hosted as woff2 files rather than pulled from a CDN. The contact form posts to Formspree. Dark/light theme switching uses CSS custom properties, with a small inline script in each page's `<head>` to avoid a flash of the wrong theme on load.

Deployment is configured for Cloudflare Workers (static assets), via `wrangler.toml`. The site is not publicly launched: `robots.txt` disallows all crawling and every page carries a `noindex` meta tag. It is currently visible to a small group (the client) behind Cloudflare Access, not at a public URL.

## Running it locally

No dependencies to install. From the repository root, either:

```
npx wrangler dev
```

which matches the Cloudflare deployment config already in `wrangler.toml`, or serve the directory with any static file server, for example:

```
python -m http.server 8000
```

Then open the printed local address in a browser.

## Scope

This is a single-client, content-driven marketing site: no CMS, no database, no user accounts, no analytics wired in yet. Several sections are deliberately marked as placeholders (visible as highlighted boxes in the HTML) pending real data from the client — pricing, warranty wording, company registration details — and the contact form's Formspree endpoint is not yet connected to a live form. It is still in progress, not finished.
