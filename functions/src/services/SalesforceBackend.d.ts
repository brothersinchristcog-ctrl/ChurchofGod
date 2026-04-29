/**
 * SalesforceBackend Service (Middleware)
 * Implements the OAuth 2.0 JWT Bearer Flow for server-to-server
 * communication as per the COG Solution Design Document §6.1.1.
 */
export interface SalesforceConfig {
    consumerKey: string;
    username: string;
    loginUrl: string;
    privateKey: string;
}
export declare class SalesforceBackend {
    private config;
    private accessToken;
    private instanceUrl;
    private tokenExpiry;
    constructor(config: SalesforceConfig);
    /**
     * Generates a signed JWT and exchanges it for a Salesforce Access Token.
     * Standard RS256 algorithm used for security.
     */
    private getAccessToken;
    /**
     * Generic SOQL Query execution via REST API
     */
    query(soql: string): Promise<any>;
    /**
     * Fetches the Daily Promise
     */
    getDailyPromise(): Promise<any>;
    /**
     * Fetches Upcoming Events
     */
    getUpcomingEvents(limit?: number): Promise<any>;
    /**
     * Verifies if a member exists in the database (Strict Security Gate)
     */
    checkContact(phone: string): Promise<{
        exists: boolean;
        name: string;
    } | {
        exists: boolean;
        name?: never;
    }>;
}
//# sourceMappingURL=SalesforceBackend.d.ts.map