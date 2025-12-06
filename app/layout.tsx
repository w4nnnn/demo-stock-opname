import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistem Stock Opname",
  description: "Aplikasi Stock Opname Digital",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        <div className="min-h-screen flex flex-col">
          <main className="flex-1">
            {children}
          </main>
          <footer className="py-2 text-center text-sm text-muted-foreground border-t mt-auto">
            <p>Demo aplikasi Stock Opname oleh <span className="font-bold">Harry IT</span></p>
          </footer>
        </div>
      </body>
    </html>
  );
}
