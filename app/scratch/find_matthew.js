
async function findMatthew() {
  const v = 'TELBSI';
  // Try book IDs around 40
  for (let id = 39; id <= 45; id++) {
    try {
      const url = `https://bolls.life/get-text/${v}/${id}/1/`;
      const resp = await fetch(url);
      const data = await resp.json();
      console.log(`Book ${id}: ${data.length} verses found.`);
      if (data.length > 0) {
        console.log(`  First verse text: ${data[0].text.substring(0, 50)}...`);
      }
    } catch (e) {}
  }
}
findMatthew();
