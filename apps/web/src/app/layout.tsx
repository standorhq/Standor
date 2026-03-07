import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/Providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Standor — Code Together', template: '%s | Standor' },
  description:
    'Real-time collaborative coding interview platform with AI-powered evaluation, WebRTC video, and structured hiring analytics.',
  keywords: ['coding interview', 'technical interview', 'collaborative coding', 'AI code review'],
  authors: [{ name: 'Vaibhav Kumar' }],
  openGraph: {
    title: 'Standor — Code Together',
    description: 'Real-time collaborative coding interview platform.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0d9488',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
