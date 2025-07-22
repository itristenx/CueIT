export declare function HelixAdapter(helixClient: any): {
    createUser(user: any): Promise<any>;
    getUser(id: any): Promise<any>;
    getUserByEmail(email: any): Promise<any>;
    updateUser(user: any): Promise<any>;
    deleteUser(id: any): Promise<any>;
    linkAccount(account: any): Promise<any>;
    getSessionAndUser(sessionToken: any): Promise<any>;
    createSession(session: any): Promise<any>;
    updateSession(session: any): Promise<any>;
    deleteSession(sessionToken: any): Promise<any>;
};
