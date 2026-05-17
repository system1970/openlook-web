import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OpenLook — Visual UX Unit Testing',
  description: 'Visual unit tests for coding agents. Write a spec, record the browser, let Gemini judge the UX.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
