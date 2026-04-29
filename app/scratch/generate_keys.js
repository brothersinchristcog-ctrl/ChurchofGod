const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate RSA Key Pair
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Create a self-signed certificate (Mocked, since pure crypto doesn't create X.509 easily)
// Actually, Salesforce accepts the PEM Public Key if wrapped in a cert format.
// We'll create the .crt and .key files.
const keyPath = path.join(__dirname, 'server.key');
const certPath = path.join(__dirname, 'server.crt');

fs.writeFileSync(keyPath, privateKey);
fs.writeFileSync(certPath, publicKey);

console.log('✅ Generated Private Key at: ' + keyPath);
console.log('✅ Generated Public Certificate at: ' + certPath);
console.log('\n--- PRIVATE KEY (FOR .ENV / SECRET MANAGER) ---');
console.log(privateKey);
console.log('\n--- PUBLIC CERTIFICATE (UPLOAD TO SALESFORCE) ---');
console.log(publicKey);
