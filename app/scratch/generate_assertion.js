const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

// 1. Load your credentials from the .env file in the app folder
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`${name}=(.*)`));
  return match ? match[1].trim() : null;
};

const consumerKey = getEnvVar('EXPO_PUBLIC_SALESFORCE_CONSUMER_KEY');
const username = getEnvVar('EXPO_PUBLIC_SALESFORCE_USERNAME');
const loginUrl = getEnvVar('EXPO_PUBLIC_SALESFORCE_LOGIN_URL') || 'https://test.salesforce.com';

// 2. Load the Private Key (using the PKCS#8 version)
const keyPath = path.join(__dirname, '..', '..', 'KEYS_FOR_SALESFORCE', 'church_of_god_sf_pkcs8.key');
const privateKeyPem = fs.readFileSync(keyPath, 'utf8');

/**
 * Generates a signed JWT manually using node-forge for testing.
 */
function createAssertion() {
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const claimSet = {
    iss: consumerKey,
    sub: username,
    aud: loginUrl,
    exp: now + 300 // 5 minutes
  };

  const base64UrlEncode = (str) => {
    return Buffer.from(str)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(claimSet));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const md = forge.md.sha256.create();
  md.update(signatureInput, 'utf8');
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const signature = privateKey.sign(md);
  const encodedSignature = Buffer.from(signature, 'binary')
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${signatureInput}.${encodedSignature}`;
}

const assertion = createAssertion();

console.log('\n--- 🚀 THUNDER CLIENT TEST SETUP ---');
console.log('\n1. METHOD: POST');
console.log(`2. URL: ${loginUrl}/services/oauth2/token`);
console.log('\n3. BODY (Form-urlencoded):');
console.log('--------------------------------------------------');
console.log(`grant_type  : urn:ietf:params:oauth:grant-type:jwt-bearer`);
console.log(`assertion   : ${assertion}`);
console.log('--------------------------------------------------');
console.log('\n✅ Copy the assertion above and paste it into Thunder Client.');
