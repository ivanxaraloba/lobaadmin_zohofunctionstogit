import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';

import './globals.css';

import { cn } from '@/lib/utils';
import ReactQueryProvider from '@/providers/react-query';
import { ThemeProvider } from '@/providers/theme';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LOBA | Z2G',
  description: 'by ivan xara',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactQueryProvider>
      <ThemeProvider>
        <html lang="en" className="dark">
          <body className={cn(inter.className, 'pb-if-overflow')}>
            <Toaster richColors />
            <main>{children}</main>
          </body>
        </html>
      </ThemeProvider>
    </ReactQueryProvider>
  );
}
