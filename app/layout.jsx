import "./globals.css";

export const metadata = {
  title: "Campus Mobility",
  description: "Real-time campus ride management platform"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
