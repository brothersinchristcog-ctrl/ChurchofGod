/**
 * 📖 GET DAILY PROMISE
 * Fetches today's promise from Salesforce using high-security JWT.
 */
export declare const getDailyPromise: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    data: any;
}>, unknown>;
/**
 * 📅 GET UPCOMING EVENTS
 * Fetches upcoming events from Salesforce.
 */
export declare const getUpcomingEvents: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    data: any;
}>, unknown>;
/**
 * 🛡️ CHECK CONTACT EXISTS (Strict Security Gate)
 * Checks if a phone number is registered in Salesforce.
 */
export declare const checkContactExists: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    exists: boolean;
    name: string;
    success: boolean;
} | {
    exists: boolean;
    name?: never;
    success: boolean;
}>, unknown>;
//# sourceMappingURL=index.d.ts.map