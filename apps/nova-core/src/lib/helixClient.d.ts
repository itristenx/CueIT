export declare const helixClient: {
    createUser(user: any): Promise<any>;
    getUser(id: any): Promise<{
        id: any;
        email: string;
    }>;
    getUserByEmail(email: any): Promise<{
        id: string;
        email: any;
    }>;
    updateUser(user: any): Promise<any>;
    deleteUser(id: any): Promise<boolean>;
    linkAccount(account: any): Promise<any>;
    getSessionAndUser(sessionToken: any): Promise<{
        session: {
            sessionToken: any;
        };
        user: {
            id: string;
        };
    }>;
    createSession(session: any): Promise<any>;
    updateSession(session: any): Promise<any>;
    deleteSession(sessionToken: any): Promise<boolean>;
};
