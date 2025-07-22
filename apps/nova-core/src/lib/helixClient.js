// Mock Helix client for demonstration
export const helixClient = {
    async createUser(user) { return Object.assign(Object.assign({}, user), { id: 'mock-id' }); },
    async getUser(id) { return { id, email: 'mock@example.com' }; },
    async getUserByEmail(email) { return { id: 'mock-id', email }; },
    async updateUser(user) { return user; },
    async deleteUser(id) { return true; },
    async linkAccount(account) { return account; },
    async getSessionAndUser(sessionToken) { return { session: { sessionToken }, user: { id: 'mock-id' } }; },
    async createSession(session) { return session; },
    async updateSession(session) { return session; },
    async deleteSession(sessionToken) { return true; },
};
