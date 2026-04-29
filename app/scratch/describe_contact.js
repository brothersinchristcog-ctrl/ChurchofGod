const axios = require('axios');
const forge = require('node-forge');
const Buffer = require('buffer').Buffer;

const clientId = '3MVG9Wr8x2TEhDdL_5qb5mNUub8Jqz_jDMq7iRrn5XvkZHBhdkxGxFk0cf3r3hvccLtdznbxghdx50uUOrh14';
const username = 'sakibandasunilbabu@bic.com.cog';
const loginUrl = 'https://kristhunandusahodarulusahavasam--cog.sandbox.my.salesforce.com';
const privateKeyPem = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCsg48JgGqGZGfd
vlZob6Gb1saVVwSw9+gyjfDaK/s0wrCS2p1J6yQiUcxMv1wmOPIG8nj0N+N3zcOR
HUMODubkBRl5WwPb2WnK9DC5YyETwPdc5AmT3rG/URzCSUZl7snMeH0x/2gTRUB8
TaAlCoquvEVgf2Q+HWC3ntxBxN6QH9KdK1F+SAz5jVyWLc/78L0mq3d8Ees3f7z4
sBO+amaZDE17OpcO2I8cWRTlwmYlYfr9C08a7Waxjjn1xtCa6zFRYVzL7FrVxozr
k1VV1Udj2CsuTgOck1IPYTue1/n8xtqBT/QNFO1Vmci3d6v7D9pDzwiCOoeLDzsU
B5ImhD3RAgMBAAECggEAJAxXks41NED93T2dM7SD6hsOov0se0hKSmoTlptTIjq+
h+lLrbsHcW5zSORBvrDujhoTwUB+dTXXdFbPgLwHbkVMhenJXCLJswGkvtBihIyx
g8UY5T/HF6m83zJNlhY4L9RLoOt0VXaGm5Li8GqMAShRPPFRwpMD90qoTsvzD91m
JLNofovP3GoBeeSnhBeLFe+ZSdGgNE9mnKWOHPh5jqd9O1XsRNpFp8M9WlkiTarG
WviAd63maQUPqXU7K5k21NNk/s69Vo7eH/lvpcOLxAdxS8D1yibvD4dcGTN+K8iW
Ust/grHhcDFHNX/wv/Na30aXX/BwzSBcEWnuofNoMwKBgQDpowBzwi/JBXJvF12O
FdKRw8U5Qxus9jN2f9jv4mrrXipiv3DL3RPBeE5fAAv3imUbfAA7NR9QMhbqWRYg
vd6+987e4fAqSWKFpsxj1xNV8ERsxY+SXhm9bb+82bBxAy3xoO5heIsrjCvaSVT8
PKFKILyi7Q3AJOGrc9+8ucAqmwKBgQC9BtAO4/jQrM0BXlvhwyQVK1kJVvnjVJZ7
KyMdkYe9H2bn1HhmUYKBk2NE/HG/sVpvLcQLBi9Um+ixn1i/7KtYCbCqrnXOxm49
tR2KEaE/WLEYl8p/usFg/auiVWlZMFsA8l4lW+rIp8beQUljEu88Ebv0YgEpguz/
uepZddAaAwKBgEQQ1e/jkfJZoOYWg44Cc4893rZ5A5YXQBT02CnC5+1cSLLuHRl3
der2dracl9/tNNmV/adCKbY+cYiinZy6VCuEnIM4hbR8HrTbTE6F+T8fOYAK6nH0
8kDKuYJ2VT4HdBoiDXDeIoV0V85HcPfvXfnvoaVBtLDWzdwabQNZhk+jAoGAZSeD
KaTHnuwKHORg6RSjd4yl7gCUYxn+GVWBSi555DQsvn0OHTsbSroT0nQBbyK6kWp9
UaTyqSVxxbPPK428N7WfzAbmVkwL7IvCjgNXNe4Bf3ajT+0h1QSK16k7YhYlbQFG
blmc79oQ6xkm65TTX2LiISpdEtjUeRkFlvAb9/8CgYEAl0kYCY18F36/eUeuGQwx
WsgAVnEB9vQtJHUDhjBPPyTxXgvnTdnO6oDAAH6j5iAbMlVTvjM4eRgVEG60xlTs
tB0Mj+4RZO3hhi+3CxIbTmyzDEvKIV4gpjFu8Ug2JMpIDheHnZ1eyq7Byp09m1N2
spfkUchVp71l4aWpCW50lro=
-----END PRIVATE KEY-----`;

async function describeContact() {
  try {
    const base64UrlEncode = (str) => Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const claimSet = { iss: clientId, sub: username, aud: loginUrl, exp: Math.floor(Date.now() / 1000) + 300 };
    const assertion = `${base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${base64UrlEncode(JSON.stringify(claimSet))}.${base64UrlEncode(forge.pki.privateKeyFromPem(privateKeyPem).sign(forge.md.sha256.create().update(`${base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${base64UrlEncode(JSON.stringify(claimSet))}`, 'utf8')), 'binary')}`;

    const authResp = await axios.post(`${loginUrl}/services/oauth2/token`, new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }));
    const token = authResp.data.access_token;
    const instanceUrl = authResp.data.instance_url;

    // Describe Contact to see all fields
    const descResp = await axios.get(`${instanceUrl}/services/data/v60.0/sobjects/Contact/describe`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const customFields = descResp.data.fields.filter(f => f.custom).map(f => f.name);
    console.log('\n--- 🛠️ CUSTOM FIELDS ON CONTACT ---');
    console.log(customFields.join(', '));

    // Also query a few contacts for standard phone fields
    const queryResp = await axios.get(`${instanceUrl}/services/data/v60.0/query/?q=${encodeURIComponent('SELECT Id, Name, Phone, MobilePhone FROM Contact LIMIT 3')}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('\n--- 📋 SAMPLE DATA ---');
    console.log(JSON.stringify(queryResp.data.records, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.response ? error.response.data : error.message);
  }
}

describeContact();
