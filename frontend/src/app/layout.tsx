import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CricMotion AI — Zero-Friction Cricket Video Studio',
  description: 'AI-Powered Cricket Video & Reel Generator in Snapchat Neobrutalism Style',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-brand-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
