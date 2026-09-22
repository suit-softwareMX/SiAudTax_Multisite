import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './globals.css';
import globalContent from './content/global.json';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: globalContent.metadata.title.en,
  description: globalContent.metadata.description.en,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
