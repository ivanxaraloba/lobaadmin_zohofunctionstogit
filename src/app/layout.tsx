import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Inter } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/providers/react-query";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/providers/theme";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LOBA | Z2G",
  description: "by ivan xara",
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
          <body className={cn(inter.className, "pb-if-overflow")}>
            <Toaster richColors />
            <main>{children}</main>
          </body>
        </html>
      </ThemeProvider>
    </ReactQueryProvider>
  );
}
