const axios = require('axios');
const xml2js = require('xml2js');

const username = 'sakibandasunilbabu@bic.com.cog';
const password = 'Svihaanraj@1432liFsjqFwR32teRBvDEbAdR0n';
const soapUrl = 'https://test.salesforce.com/services/Soap/u/58.0';

const loginXml = `<?xml version="1.0" encoding="utf-8" ?>
<env:Envelope xmlns:xsd="http://www.w3.org/2001/XMLSchema"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:env="http://schemas.xmlsoap.org/soap/envelope/">
    <env:Body>
        <n1:login xmlns:n1="urn:partner.soap.sforce.com">
            <n1:username>${username}</n1:username>
            <n1:password>${password}</n1:password>
        </n1:login>
    </env:Body>
</env:Envelope>`;

async function describeObjects() {
  try {
    const loginResp = await axios.post(soapUrl, loginXml, {
      headers: { 'Content-Type': 'text/xml', 'SOAPAction': 'login' }
    });
    const result = await xml2js.parseStringPromise(loginResp.data);
    const body = result['soapenv:Envelope']['soapenv:Body'][0];
    const loginResult = body.loginResponse[0].result[0];
    const sessionId = loginResult.sessionId[0];
    const serverUrl = loginResult.serverUrl[0];
    const instanceUrl = serverUrl.split('/services')[0];

    const objectsToDescribe = ['Sermon__c', 'Schedule_Event__c', 'Prayer_Request__c'];
    
    for (const obj of objectsToDescribe) {
      const descResp = await axios.get(`${instanceUrl}/services/data/v60.0/sobjects/${obj}/describe`, {
        headers: { Authorization: `Bearer ${sessionId}` }
      });
      console.log(`\n--- 🛠️ FIELDS ON ${obj} ---`);
      console.log(descResp.data.fields.map(f => f.name).join(', '));
    }

  } catch (error) {
    console.error('❌ Error:', error.response ? error.response.data : error.message);
  }
}

describeObjects();
