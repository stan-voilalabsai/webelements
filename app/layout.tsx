// app/layout.tsx
import "./globals.css";   // 👈 add this

export const metadata = {
    title: "My App",
    description: "Deployed to GitHub Pages",
  };
  
  export default function RootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  }
  