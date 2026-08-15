# Kadem Technologies — christech.co.ke

Static HTML/CSS/JS website with a Cloudflare Worker backend for
`/api/ai` (Kadem AI, via Groq) and `/api/contact`.

## Project structure

```
kadem-technologies/
├── public/              ← the static site (served as-is on Cloudflare)
│   ├── index.html, services.html, solutions.html, hosting.html,
│   │   projects.html, about.html, contact.html, privacy.html, terms.html
│   ├── css/  (global, components, responsive, animations)
│   ├── js/   (main, projects, contact, whatsapp, ai)
│   └── assets/ (logo, icons — add real founder photo + project
│                screenshots here when available)
├── worker/index.js      ← Cloudflare Worker: serves /public + API routes
├── wrangler.toml         ← Cloudflare deployment config
├── build/                ← build-time only, not deployed
│   ├── build.py           (assembles header/footer + content into /public)
│   └── content/*.html     (per-page content fragments — edit these,
│                            then re-run the build script)
└── package.json
```

## Editing content

Don't hand-edit the files in `public/*.html` directly — they're generated.
Edit the fragments in `build/content/*.html` (and `build/build.py` for the
shared header/footer/nav), then rebuild:

```bash
python3 build/build.py
```

## Local development

```bash
npm install
npx wrangler dev
```

This runs the Worker locally, serving `/public` and both API routes.
`GROQ_API_KEY` and `RESEND_API_KEY` won't be set locally unless you add
them to a `.dev.vars` file (gitignored):

```
GROQ_API_KEY=your-groq-key
RESEND_API_KEY=your-resend-key
```

## Required secrets (production)

Never put these in `wrangler.toml`, in git, or anywhere in `/public` or
`/worker`. Set them directly with Wrangler:

```bash
npx wrangler secret put GROQ_API_KEY
npx wrangler secret put RESEND_API_KEY   # or your preferred email API
```

`GROQ_API_KEY` powers the Kadem AI assistant (`/api/ai`).
`RESEND_API_KEY` is used by `/api/contact` to deliver enquiries to
`support@christech.co.ke` — swap the provider in `worker/index.js` →
`deliverEnquiry()` if you use something other than Resend.

## Optional: rate limiting

`/api/ai` and `/api/contact` both check for a `RATE_LIMIT_KV` binding
and skip rate limiting if it isn't configured. To enable it:

```bash
npx wrangler kv namespace create RATE_LIMIT_KV
```

Then uncomment and fill in the `[[kv_namespaces]]` block in
`wrangler.toml` with the returned namespace id.

## Deploying

```bash
npx wrangler deploy
```

Then attach the `christech.co.ke` custom domain to the Worker from
**Cloudflare dashboard → Workers & Pages → kadem-technologies → Domains**,
or configure the commented-out `[[routes]]` block in `wrangler.toml` if
the zone is already on Cloudflare.

## Still needed before this is fully production-ready

- **Founder photo** — replace the placeholder silhouette in
  `build/content/index.html` and `about.html` (`.k-founder__photo`)
  with an `<img>` pointing at a real photo in `/public/assets/images/`.
- **Logo** — `public/assets/logo/mark.svg` is an original "signal" mark
  built for this project. Swap it for an official logo file if one
  exists, keeping the same path so the header/footer/favicon update
  automatically.
- **Project screenshots** — project cards currently use clean abstract
  placeholder graphics (never fake screenshots). Add real screenshots
  to `/public/assets/projects/` and update the corresponding entries
  in `public/js/projects.js`.
- **Hosting plans** — once real plans/pricing are confirmed, replace
  the note in `build/content/hosting.html` with actual pricing cards.
- **Testimonials** — omitted entirely per the PRD until real,
  verified testimonials are supplied.
- **Email delivery provider** — `RESEND_API_KEY` assumes Resend;
  update `deliverEnquiry()` if a different provider is preferred, and
  verify the sending domain with that provider.
