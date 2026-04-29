const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

const keyPath = 'c:/Users/sunil/COG_MOBILE/KEYS_FOR_SALESFORCE/church_of_god_sf.key';
const outPath = 'c:/Users/sunil/COG_MOBILE/KEYS_FOR_SALESFORCE/church_of_god_sf_pkcs8.key';

const privateKeyPem = fs.readFileSync(keyPath, 'utf8');

try {
  // Load the "Traditional" RSA key
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  
  // Convert to PKCS#8
  const rsaPrivateKey = forge.pki.privateKeyToAsn1(privateKey);
  const privateKeyInfo = forge.pki.wrapRsaPrivateKey(rsaPrivateKey);
  const pkcs8Pem = forge.pki.privateKeyInfoToPem(privateKeyInfo);

  fs.writeFileSync(outPath, pkcs8Pem);
  console.log('✅ Successfully converted and saved PKCS#8 key.');
} catch (error) {
  console.error('Error during conversion:', error);
}
