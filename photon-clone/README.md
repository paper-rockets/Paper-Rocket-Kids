# Saved copy of the Photon Studio page

This folder is a copy of the public web page at **https://tenzen.studio/photon/**,
downloaded on 13 September 2026.

It is a copy of the **web page** only. It is not the Photon Studio program itself —
that is a separate app you install on your computer.

## How to open it

Open a terminal in this folder and run:

    node serve.cjs

It prints two links. Open either one in your browser:

- **On this computer:** http://localhost:3200/photon/
- **On your phone (same Wi-Fi):** the second link it prints

Press `Ctrl+C` in the terminal to stop it.

To use a different port number: `PORT=4000 node serve.cjs`

### Why it needs the little server

The page is built with a framework (Next.js) whose code expects to be loaded from the
top of a website. If you double-click `photon/index.html` and open it straight from the
file system, the page still looks right but the moving parts (the feature carousel, the
videos) stop working. Running `serve.cjs` avoids that.

## What works

- The whole page, exactly as it looks on the real site: text, fonts, logo, layout.
- The feature carousel — the Layers / Retouching / Design tools / Subject selection /
  PSD / Shortcuts buttons, and the previous / next / pause controls.
- All the demo videos and their still images.
- The download box, including the version number and the platform choices.
- Everything runs offline. No internet connection needed.

## What does not work, and why

- **The "Get the download link" button.** On the real site this sends your email to
  Tenzen's server, which emails you a download link. There is no server here, so the
  button will not do anything useful. Nothing is sent anywhere.
- **The version number is frozen.** It says 0.1.4, which is what the real site reported
  on the day this copy was made. It will not update.
- **Links to other pages** (Tenzen Studio home, Blog, Legal, Photon Privacy) still point
  at the real website, so they need internet and will take you there.
- **Analytics** are blocked. The real page reports visits to a service called PostHog.
  This copy tries and fails, which is harmless.

## What is in here

    photon/index.html   the page itself
    _next/              the page's code, styles and fonts
    assets/             logos, background images, demo videos
    api/                one saved answer from the site's server (the version number)
    icon.png            the site icon
    serve.cjs           the small local server described above
    index.html          sends you to /photon/ if you open the root

Every downloaded file was checked byte-for-byte against the live site — all 43 match.

## A note on ownership

This is someone else's website, saved for local reference. The page, its design, its
text and its videos belong to Tenzen Studio.
