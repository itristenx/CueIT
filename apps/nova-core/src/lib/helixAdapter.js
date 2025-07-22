// Custom NextAuth.js adapter for Helix/Synth DB
// This is a scaffold. Implement each method to call Helix APIs or Synth DB queries.
export function HelixAdapter(helixClient) {
    return {
        async createUser(user) {
            // Call Helix API to create user in Synth DB
            return await helixClient.createUser(user);
        },
        async getUser(id) {
            // Call Helix API to get user by ID
            return await helixClient.getUser(id);
        },
        async getUserByEmail(email) {
            // Call Helix API to get user by email
            return await helixClient.getUserByEmail(email);
        },
        async updateUser(user) {
            // Call Helix API to update user
            return await helixClient.updateUser(user);
        },
        async deleteUser(id) {
            // Call Helix API to delete user
            return await helixClient.deleteUser(id);
        },
        async linkAccount(account) {
            // Link OAuth account to user in Synth DB
            return await helixClient.linkAccount(account);
        },
        async getSessionAndUser(sessionToken) {
            // Validate session token and return session/user
            return await helixClient.getSessionAndUser(sessionToken);
        },
        async createSession(session) {
            // Create session in Synth DB
            return await helixClient.createSession(session);
        },
        async updateSession(session) {
            // Update session in Synth DB
            return await helixClient.updateSession(session);
        },
        async deleteSession(sessionToken) {
            // Delete session in Synth DB
            return await helixClient.deleteSession(sessionToken);
        },
        // ...implement other required adapter methods
    };
}
