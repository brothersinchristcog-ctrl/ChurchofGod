import * as jwt from 'jsonwebtoken';
import axios from 'axios';

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

export class SalesforceBackend {
  private config: SalesforceConfig;
  private accessToken: string | null = null;
  private instanceUrl: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config: SalesforceConfig) {
    this.config = config;
    // Normalize the login URL (strip trailing slash)
    this.config.loginUrl = config.loginUrl.replace(/\/$/, '');
  }

  /**
   * Generates a signed JWT and exchanges it for a Salesforce Access Token.
   * Standard RS256 algorithm used for security.
   */
  private async getAccessToken(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    
    // Check if current token is still valid (with 30s buffer)
    if (this.accessToken && now < this.tokenExpiry - 30) {
      return this.accessToken;
    }

    console.log(`🔐 Salesforce: Initiating JWT Bearer Flow for ${this.config.username}...`);

    const payload = {
      iss: this.config.consumerKey,
      sub: this.config.username,
      aud: this.config.loginUrl,
      exp: now + 300 // 5 minutes expiration
    };

    // Sign the JWT with the Private Key (RS256)
    const token = jwt.sign(payload, this.config.privateKey, { algorithm: 'RS256' });

    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
      params.append('assertion', token);

      const response = await axios.post(`${this.config.loginUrl}/services/oauth2/token`, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      this.accessToken = response.data.access_token;
      this.instanceUrl = response.data.instance_url;
      this.tokenExpiry = now + 300;

      console.log('✅ Salesforce: Token Exchange Successful');
      return this.accessToken!;
    } catch (error: any) {
      console.error('❌ Salesforce Auth Error:', error.response?.data || error.message);
      throw new Error(`Salesforce Authentication Failed: ${JSON.stringify(error.response?.data || error.message)}`);
    }
  }

  /**
   * Generic SOQL Query execution via REST API
   */
  public async query(soql: string): Promise<any> {
    const token = await this.getAccessToken();
    const response = await axios.get(
      `${this.instanceUrl}/services/data/v60.0/query/?q=${encodeURIComponent(soql)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  /**
   * Fetches the Daily Promise
   */
  public async getDailyPromise() {
    const today = new Date().toISOString().split('T')[0];
    const soql = `SELECT Id, Promises__c, Promise_text_telugu__c, Date__c, Number__c
                  FROM Daily_Promise__c
                  ORDER BY Date__c DESC LIMIT 1`;
    const result = await this.query(soql);
    return result.records[0] || null;
  }

  /**
   * Fetches Upcoming Events
   */
  public async getUpcomingEvents(limit: number = 5) {
    const today = new Date().toISOString().split('.')[0] + 'Z'; // Format: YYYY-MM-DDTHH:MM:SSZ
    const soql = `SELECT Id, Name, Date__c, Day__c, Time__c, Location__c, Description__c
                  FROM Schedule_Event__c
                  WHERE Date__c >= ${today}
                  ORDER BY Date__c ASC LIMIT ${limit}`;
    const result = await this.query(soql);
    return result.records;
  }

  /**
   * Verifies if a member exists in the database (Strict Security Gate)
   */
  public async checkContact(phone: string) {
    const tenDigit = phone.slice(-10);
    const soql = `SELECT Id, FirstName, LastName, Phone, MobilePhone
                  FROM Contact WHERE 
                  (Phone = '${phone}' OR Phone = '${tenDigit}') OR 
                  (MobilePhone = '${phone}' OR MobilePhone = '${tenDigit}') 
                  LIMIT 1`;
    const result = await this.query(soql);
    if (result.totalSize > 0) {
      const rec = result.records[0];
      return { exists: true, name: `${rec.FirstName || ''} ${rec.LastName || ''}`.trim() };
    }
    return { exists: false };
  }
}
