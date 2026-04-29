const forge = require('node-forge');

// Credentials from .env
const SF_CONSUMER_KEY = '3MVG9Wr8x2TEhDdL_5qb5mNUub8Jqz_jDMq7iRrn5XvkZHBhdkxGxFk0cf3r3hvccLtdznbxghdx50uUOrh14';
const SF_USERNAME = 'sakibandasunilbabu@bic.com.cog';
const SF_LOGIN_URL = 'https://kristhunandusahodarulusahavasam--cog.sandbox.my.salesforce.com';

const SF_PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEArIOPCYBqhmRn3b5WaG+hm9bGlVcEsPfoMo3w2iv7NMKwktqd
SeskIlHMTL9cJjjyBvJ49Dfjd83DkR1DDg7m5AUZeVsD29lpyvQwuWMhE8D3XOQJ
k96xv1EcwklGZe7JzHh9Mf9oE0VAfE2gJQqKrrxFYH9kPh1gt57cQcTekB/SnStR
fkgM+Y1cli3P+/C9Jqt3fBHrN3+8+LATvmpmmQxNezqXDtiPHFkU5cJmJWH6/QtP
Gu1msY459cbQmusxUWFcy+xa1caM65NVVdVHY9grLk4DnJNSD2E7ntf5/MbagU/0
DRTtVZnIt3er+w/aQ88IgjqHiw87FAeSJoQ90QIDAQABAoIBACQMV5LONTRA/d09
nTO0g+obDqL9LHtISkpqE5abUyI6vofpS627B3Fuc0jkQb6w7o4aE8FAfnU113RW
z4C8B25FTIXpyVwiybMBpL7QYoSMsYPFGOU/xxepvN8yTZYWOC/US6DrdFV2hpuS
4vBqjAEoUTzxUcKTA/dKqE7L8w/dZiSzaH6Lz9xqAXnkp4QXixXvmUnRoDRPZpyl
jhz4eY6nfTtV7ETaRafDPVpZIk2qxlr4gHet5mkFD6l1OyuZNtTTZP7OvVaO3h/5
b6XDi8QHcUvA9com7w+HXBkzfivIllLLf4Kx4XAxRzV/8L/zWt9Gl1/wcM0gXBFp
7qHzaDMCgYEA6aMAc8IvyQVybxddjhXSkcPFOUMbrPYzdn/Y7+Jq614qYr9wy90T
wXhOXwAL94plG3wAOzUfUDIW6lkWIL3evvfO3uHwKklihabMY9cTVfBEbMWPkl4Z
vW2/vNmwcQMt8aDuYXiLK4wr2klU/DyhSiC8ou0NwCThq3PfvLnAKpsCgYEAvQbQ
DuP40KzNAV5b4cMkFStZCVb541SWeysjHZGHvR9m59R4ZlGCgZNjRPxxv7Faby3E
CwYvVJvosZ9Yv+yrWAmwqq51zsZuPbUdihGhP1ixGJfKf7rBYP2rolVpWTBbAPJe
JVvqyKfG3kFJYxLvPBG79GIBKYLs/7nqWXXQGgMCgYBEENXv45HyWaDmFoOOAnOP
Pd62eQOWF0AU9NgpwuftXEiy7h0Zd3Xq9na2nJff7TTZlf2nQim2PnGIop2culQr
hJyDOIW0fB6020xOhfk/HzmACupx9PJAyrmCdlU+B3QaIg1w3iKFdFfOR3D37135
76GlQbSw1s3cGm0DWYZPowKBgGUngymkx57sChzkYOkUo3eMpe4AlGMZ/hlVgUou
eeQ0LL59Dh07G0q6E9J0AW8iupFqfVGk8qklccWzzyuNvDe1n8wG5lZMC+yLwo4D
VzXuAX92o0/tIdUEitepO2IWJW0BRm5ZnO/aEOsZJuuU019i4iEqXRLY1HkZBZbw
G/f/AoGBAJdJGAmNfBd+v3lHrhkMMVrIAFZxAfb0LSR1A4YwTz8k8V4L503ZzuqA
wAB+o+YgGzJVU74zOHkYFRButMZU7LQdDI/uEWTt4YYvtwsSG05sswxLyiFeIKYx
bvFINiTKSA4Xh52dXsquwcqdPZtTdrKX5FHIVae9ZeGlqQludJa6
-----END RSA PRIVATE KEY-----`;

function base64UrlEncode(str) {
  const b64 = forge.util.encode64(str);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function testHandshake() {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = { 
    iss: SF_CONSUMER_KEY, 
    sub: SF_USERNAME, 
    aud: SF_LOGIN_URL, 
    exp: now + 300 
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const privKey = forge.pki.privateKeyFromPem(SF_PRIVATE_KEY);
  const md = forge.md.sha256.create();
  md.update(dataToSign, 'utf8');
  const sig = privKey.sign(md);
  
  const encodedSignature = base64UrlEncode(sig);
  const assertion = `${dataToSign}.${encodedSignature}`;

  const body = `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${assertion}`;
  console.log('Testing handshake with Salesforce...');
  
  try {
    const response = await fetch(`${SF_LOGIN_URL}/services/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('❌ HANDSHAKE FAILED:', data);
    } else {
      console.log('✅ HANDSHAKE SUCCESSFUL!');
      console.log('Instance URL:', data.instance_url);
    }
  } catch (err) {
    console.error('❌ NETWORK ERROR:', err.message);
  }
}

testHandshake();
