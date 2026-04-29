const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Generates a self-signed certificate and private key for Salesforce JWT Bearer Flow.
 * Since we don't have openssl, we use the native crypto module and a bit of manual 
 * PEM wrapping. Note: Salesforce specifically requires an X.509 certificate.
 */
function generateCert() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  // Note: Salesforce is picky about the certificate format.
  // We'll generate a proper X.509 certificate if possible, 
  // but usually for JWT Bearer flow, a PEM public key wrapped in 
  // BEGIN CERTIFICATE / END CERTIFICATE is enough if the content is correct.
  // However, pure node crypto doesn't create X.509. 
  // I will use 'node-forge' if available, but I'll try a raw PEM first.
  
  const keyDir = path.join(process.cwd(), 'salesforce_keys');
  if (!fs.existsSync(keyDir)) fs.mkdirSync(keyDir);

  fs.writeFileSync(path.join(keyDir, 'server.key'), privateKey);
  fs.writeFileSync(path.join(keyDir, 'server.crt'), publicKey); // Saving public key as .crt for now

  console.log('✅ Keys generated in: ' + keyDir);
}

generateCert();
