import { Suspense } from 'react';
import type { Metadata } from 'next';
import Script from 'next/script';
import { Toaster } from '@/components/ui/sonner';
import NavigationLoader from '@/components/NavigationLoader';
import './globals.css';

export const metadata: Metadata = {
  title: 'AUMINDS | Next-Gen Coding Teaching & LMS Platform',
  description: 'Empowering future software engineers with interactive code environments, video & markdown lectures, quizzes, assignment reviews, and career opportunities.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" />
      </head>
      <body className="font-sans bg-[#0B0F17] text-white antialiased min-h-screen flex flex-col selection:bg-[#00AB55] selection:text-white">
        <Suspense fallback={null}>
          <NavigationLoader />
        </Suspense>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
            classNames: {
              toast: 'bg-[#161C24] border border-[#919EAB]/20 text-white',
            },
          }}
        />
      </body>
    </html>
  );
}
