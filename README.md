# Code 2 Canvas

A responsive student course dashboard recreated from the supplied Figma mockup.

## Stack

- HTML, CSS, and vanilla JavaScript
- No third-party runtime libraries or build step
- Poppins is loaded from Google Fonts; the page uses local fallback fonts if it is unavailable

## Run locally

Open `index.html` in a browser, or serve the folder with any static file server. The project has no package install step.

## GitHub Pages

The project is a static site. The included GitHub Actions workflow deploys it to Pages whenever `main` is pushed. Push the repository to GitHub, then open **Settings → Pages** and select **GitHub Actions** as the source. `index.html`, `styles.css`, `app.js`, and the local assets are all that the site needs.

If you are connecting this folder to a new GitHub repository, add its remote and push the `main` branch:

```sh
git add .
git commit -m "Build responsive course dashboard"
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

## Included interactions

- Search and filter the six course cards
- Open a course overview dialog
- Navigate calendar months and select a date
- Toggle the mobile navigation and dismiss the notification indicator

## Assets

Course artwork, user photos, and the Google Classroom logo are stored locally under `public/assets`. No temporary Figma asset URL is used by the page.
