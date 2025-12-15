import './globals.css';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Arena-shop',
  description: 'Your one-stop shop for premium gaming gear, accessories, and collectibles',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon2.ico" />
      </head>
      <body className={`${poppins.variable} font-sans`}>
        <ThemeProvider>
          <AuthProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen bg-background text-foreground">
              <Header />
              <div className="flex-grow">
                {children}
              </div>
              <Footer />
            </div>
          </CartProvider>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}