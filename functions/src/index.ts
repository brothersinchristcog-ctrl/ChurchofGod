import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { SalesforceBackend } from './services/SalesforceBackend.js';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Salesforce Backend with environment variables
const sfBackend = new SalesforceBackend({
  consumerKey: process.env.SF_CONSUMER_KEY || '',
  username: process.env.SF_USERNAME || '',
  loginUrl: process.env.SF_LOGIN_URL || 'https://test.salesforce.com',
  privateKey: (process.env.SF_PRIVATE_KEY || '').replace(/\\n/g, '\n'), // Handle escaped newlines
});

/**
 * 📖 GET DAILY PROMISE
 * Fetches today's promise from Salesforce using high-security JWT.
 */
export const getDailyPromise = onCall(async (request) => {
  // Optional: check if user is authenticated (allowed for guest mode as per doc)
  try {
    const promise = await sfBackend.getDailyPromise();
    return { success: true, data: promise };
  } catch (error: any) {
    console.error('getDailyPromise Error:', error);
    throw new HttpsError('internal', error.message);
  }
});

/**
 * 📅 GET UPCOMING EVENTS
 * Fetches upcoming events from Salesforce.
 */
export const getUpcomingEvents = onCall(async (request) => {
  try {
    const limit = request.data?.limit || 5;
    const events = await sfBackend.getUpcomingEvents(limit);
    return { success: true, data: events };
  } catch (error: any) {
    console.error('getUpcomingEvents Error:', error);
    throw new HttpsError('internal', error.message);
  }
});

/**
 * 🛡️ CHECK CONTACT EXISTS (Strict Security Gate)
 * Checks if a phone number is registered in Salesforce.
 */
export const checkContactExists = onCall(async (request) => {
  try {
    const phone = request.data?.phone;
    if (!phone) throw new HttpsError('invalid-argument', 'Phone number is required');
    
    const result = await sfBackend.checkContact(phone);
    return { success: true, ...result };
  } catch (error: any) {
    console.error('checkContactExists Error:', error);
    throw new HttpsError('internal', error.message);
  }
});
