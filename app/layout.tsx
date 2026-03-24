import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import './globals.css';
import Header from '@/components/build-in/header';
import QueryProvider from '@/components/provider/query';

export const metadata: Metadata = {
  title: 'mynextjs',
  description:
    'A modern Next.js starter template built with the latest features and best practices for scalable web applications.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="light"
      style={{ colorScheme: 'light' }}
      suppressHydrationWarning
    >
      <body className={`antialiased min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main>
            <QueryProvider>{children}</QueryProvider>
          </main>
          <Toaster position="top-center" duration={3000} />
        </ThemeProvider>
      </body>
    </html>
  );
}
