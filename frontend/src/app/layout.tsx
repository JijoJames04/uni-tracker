import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Toaster } from 'sonner';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'UniTracker — German University Application Tracker',
    template: '%s | UniTracker',
  },
  description:
    'Track your German university applications, manage documents, generate SOP prompts, and monitor deadlines — all in one place.',
  keywords: [
    'German university application', 'university tracker', 'masters application Germany',
    'SOP generator', 'uni-assist', 'studienkolleg', 'DAAD', 'study abroad',
  ],
  authors: [{ name: 'UniTracker' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'UniTracker — German University Application Tracker',
    description: 'Track all your German university applications in one place.',
    siteName: 'UniTracker',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1a1f36',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakarta.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' },
            }}
            richColors
          />
        </Providers>
      </body>
    </html>
  );
}
