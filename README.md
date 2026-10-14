# Code 2 Canvas

A responsive student course dashboard recreated from the supplied Figma mockup.

## Stack

- Next.js with the App Router
- React and Lucide React icons
- CSS and browser-side JavaScript interactions
- Poppins from Google Fonts with local fallback fonts

## Run locally

```sh
npm ci
npm run dev
```

Open the local address printed by Next.js. Run `npm run build` to create a production build.

## Vercel deployment

Deploy the GitHub repository through Vercel. Vercel detects Next.js automatically and builds the app on each push to the connected branch; no static export or GitHub Pages workflow is needed.

## Included interactions

- Search and filter the six course cards
- Open each course's syllabus, assignments, and study materials
- Track syllabus progress and assignment submissions in the browser
- Preview course materials
- Navigate calendar months and select a date
- Browse messages and send demo replies
- Search classmates and open conversations
- Add and remove schedule reminders
- Add, complete, and delete to-do items; tasks persist in the browser
- Save accessibility preferences in the browser
- Toggle the mobile navigation and dismiss the notification indicator

Course artwork, user photos, and the Google Classroom logo are stored locally under `public/assets`.
