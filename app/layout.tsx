import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import './globals.css';
import Header from '@/components/build-in/header';
import QueryProvider from '@/components/provider/query';
import { defaultMetadata } from '@/lib/metadata';

export const metadata = defaultMetadata;

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
          <QueryProvider>{children}</QueryProvider>
          <Toaster position="top-center" duration={3000} />
        </ThemeProvider>
      </body>
    </html>
  );
}
