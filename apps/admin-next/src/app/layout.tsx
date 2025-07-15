import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QueueIT Admin - IT Service Management Dashboard",
  description: "Comprehensive admin dashboard for managing tickets, users, and ITSM operations",
  keywords: ["ITSM", "Admin", "Dashboard", "IT Management", "Help Desk"],
  authors: [{ name: "QueueIT Team" }],
  openGraph: {
    title: "QueueIT Admin - IT Service Management Dashboard",
    description: "Comprehensive admin dashboard for managing tickets, users, and ITSM operations",
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
          <div className="min-h-screen bg-background">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
