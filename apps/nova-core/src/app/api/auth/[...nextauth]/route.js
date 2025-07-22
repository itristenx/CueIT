// @ts-nocheck
import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { HelixAdapter } from "@/lib/helixAdapter";
import { helixClient } from "@/lib/helixClient";
const authOptions = {
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID || "",
            clientSecret: process.env.GITHUB_SECRET || "",
        }),
        // Add more providers here
    ],
    adapter: HelixAdapter(helixClient),
    callbacks: {
        async session({ session, token }) {
            if (token && token.accessToken) {
                session.accessToken = token.accessToken;
            }
            return session;
        },
        async jwt({ token, account }) {
            if (account && account.access_token) {
                token.accessToken = account.access_token;
            }
            return token;
        },
    },
};
const handler = NextAuth(authOptions);
export const GET = handler;
export const POST = handler;
