import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CricMotion AI — Zero-Friction Cricket Video Studio',
  description: 'AI-Powered Cricket Video & Reel Generator in Snapchat Neobrutalism Style',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', sizes: '64x64', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen bg-brand-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
