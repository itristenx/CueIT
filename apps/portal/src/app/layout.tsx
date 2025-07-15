import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ReactQueryProvider } from "@/components/ReactQueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QueueIT Portal - Modern ITSM Platform",
  description: "Enterprise-grade IT Service Management platform for tickets, knowledge base, and support requests",
  keywords: ["ITSM", "IT Support", "Help Desk", "Tickets", "Knowledge Base"],
  authors: [{ name: "QueueIT Team" }],
  openGraph: {
    title: "QueueIT Portal - Modern ITSM Platform",
    description: "Enterprise-grade IT Service Management platform",
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
