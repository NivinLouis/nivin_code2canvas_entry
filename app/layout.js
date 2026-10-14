import "../styles.css";

export const metadata = {
  title: "My Courses | Classroom",
  description: "A student dashboard for courses, schedule, and classmates.",
  icons: {
    icon: "/assets/college-logo.png",
    shortcut: "/assets/college-logo.png",
    apple: "/assets/college-logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#12803b" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
