import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';
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
      <body className="font-sans bg-background text-foreground antialiased min-h-screen flex flex-col">
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
            classNames: {
              toast: 'glass-panel border-border',
            },
          }}
        />
      </body>
    </html>
  );
}
