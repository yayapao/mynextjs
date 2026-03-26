import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import './globals.css';
import Header from '@/components/build-in/header';
import QueryProvider from '@/lib/providers/query';
import { defaultMetadata } from '@/lib/metadata';
import { readConfig } from '@/lib/config';
import GlobalProvider from '@/lib/providers/global';

export const metadata = defaultMetadata;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch initial theme from server-side config
  const config = await readConfig();
  const initialTheme = config.theme;

  return (
    <html
      lang="en"
      className={initialTheme}
      style={{ colorScheme: initialTheme }}
      suppressHydrationWarning
    >
      <body className={`antialiased min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme={initialTheme}
          enableSystem
          disableTransitionOnChange
        >
          <GlobalProvider value={{ user_info: { name: 'Young Star' } }}>
            <Header />
            <QueryProvider>{children}</QueryProvider>
          </GlobalProvider>
          <Toaster position="top-center" duration={3000} />
        </ThemeProvider>
      </body>
    </html>
  );
}
