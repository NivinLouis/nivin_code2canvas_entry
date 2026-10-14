# Code 2 Canvas — Student Learning Dashboard

This is my entry for the **Code 2 Canvas** front-end challenge. I recreated the supplied student-dashboard design as a responsive, interactive web app, then added working course, calendar, messaging, and task flows while keeping the original visual direction.

**Live demo:** [nivin-code2canvas.vercel.app](https://nivin-code2canvas.vercel.app/)

## What you can do

- Browse six courses, search by name, and filter by time, level, language, or type.
- Open a course overview with its syllabus, assignments, and study materials.
- Expand syllabus modules, track progress, submit assignments, and preview study materials.
- Move between calendar months and select a date range. The days between the selected dates share one continuous highlight.
- View classmates, open profile cards, and browse the demo messaging experience.
- Add and remove schedule reminders, and add, complete, or delete to-do items.
- Open the notification panel and try its sample notifications.
- Adjust accessibility preferences and use the navigation on desktop or mobile.

## Built with

- **Next.js (App Router)** for the application and production setup.
- **React** for the page and client-side behavior.
- **Lucide React** for the interface icons.
- **Custom CSS** for the dashboard layout, responsive breakpoints, dropdowns, transitions, and animations. There is no component or styling framework.
- **Poppins**, loaded from Google Fonts, for the main typeface.

## A few implementation notes

I treated the supplied mockup as the visual reference and built the layout with responsive CSS so the desktop dashboard can adapt to phone screens. Interactions are handled in the browser, with keyboard-friendly controls, labels for assistive technology, and reduced-motion styling. Course artwork, the college logo, and profile photos are served from the project's `public/assets` folder.

This is a front-end demonstration, so it does not use a server, database, or real sign-in. The profiles, conversations, and notifications are sample content. To-do items, course progress, assignment status, and accessibility preferences are saved in the browser with `localStorage`; schedule reminders are kept for the current page session.
