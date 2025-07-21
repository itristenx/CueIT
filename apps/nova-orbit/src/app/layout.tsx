import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ReactQueryProvider } from "@/components/ReactQueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nova Orbit - End User Portal",
  description: "Nova Universe End User Portal for requests, chat, and knowledge base support",
  keywords: ["Nova", "ITSM", "IT Support", "Help Desk", "Tickets", "Knowledge Base", "Cosmo"],
  authors: [{ name: "Nova Universe Team" }],
  openGraph: {
    title: "Nova Orbit - End User Portal",
    description: "Nova Universe End User Portal for seamless support experiences",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ReactQueryProvider>
            <div className="min-h-screen bg-background">
              {children}
            </div>
          </ReactQueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
