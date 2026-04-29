
async function test() {
  const versions = ['TELBSI', 'BTEL', 'TDP', 'BSI', 'TEL'];
  for (const v of versions) {
    try {
      const url = `https://bolls.life/get-text/${v}/40/1/`;
      console.log(`Testing ${v}: ${url}`);
      const resp = await fetch(url);
      const data = await resp.json();
      console.log(`  Result for ${v}: ${data.length} verses found.`);
      if (data.length > 0) {
        console.log(`  First verse: ${data[0].text}`);
        break;
      }
    } catch (e) {
      console.log(`  Error for ${v}: ${e.message}`);
    }
  }
}
test();
