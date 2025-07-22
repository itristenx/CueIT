// Mock Helix client for demonstration
export const helixClient = {
  async createUser(user: any) { return { ...user, id: 'mock-id' }; },
  async getUser(id: any) { return { id, email: 'mock@example.com' }; },
  async getUserByEmail(email: any) { return { id: 'mock-id', email }; },
  async updateUser(user: any) { return user; },
  async deleteUser(id: any) { return true; },
  async linkAccount(account: any) { return account; },
  async getSessionAndUser(sessionToken: any) { return { session: { sessionToken }, user: { id: 'mock-id' } }; },
  async createSession(session: any) { return session; },
  async updateSession(session: any) { return session; },
  async deleteSession(sessionToken: any) { return true; },
};
