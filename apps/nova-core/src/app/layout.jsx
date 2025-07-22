import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
const inter = Inter({ subsets: ["latin"] });
export const metadata = {
    title: "Nova Core - Admin Dashboard",
    description: "Nova Universe Admin Dashboard for configs, workflows, and user management",
    keywords: ["Nova", "Admin", "ITSM", "Configuration", "Workflows", "Users"],
    authors: [{ name: "Nova Universe Team" }],
    openGraph: {
        title: "Nova Core - Admin Dashboard",
        description: "Nova Universe Admin Dashboard for comprehensive system management",
        type: "website",
    },
};
export default function RootLayout({ children, }) {
    return (<SessionProvider>
      <html lang="en">
        <body className={inter.className}>
          <div className="min-h-screen bg-background">
            {children}
          </div>
        </body>
      </html>
    </SessionProvider>);
}
