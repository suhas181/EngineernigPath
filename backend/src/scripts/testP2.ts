import https from 'https';

const pUrls = [
  'https://www.youtube.com/watch?v=h4Sl21AK9f8',
  'https://www.youtube.com/watch?v=5pHbA0P0gO0',
  'https://www.youtube.com/watch?v=k_pfwI6aEw0',
  'https://www.youtube.com/watch?v=480F4D3C5cQ',
  'https://www.youtube.com/watch?v=5O1485QG9_A',
  'https://www.youtube.com/watch?v=Dsi7x-A89Mw',
  'https://www.youtube.com/watch?v=CqHjO9vC3V4',
  'https://www.youtube.com/watch?v=h8m93xL5R4g',
  'https://www.youtube.com/watch?v=QoDqxm7ybLc', // Nana Prometheus
];

async function run() {
  for (const url of pUrls) {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    await new Promise<void>((res) => {
      https.get(oembedUrl, (r) => {
        let d = '';
        r.on('data', (c) => (d += c));
        r.on('end', () => {
          if (r.statusCode === 200) {
            try {
              const j = JSON.parse(d);
              console.log(`✅ [200] "${j.title}" (${j.author_name}) -> ${url}`);
            } catch {
              console.log(`✅ [200] -> ${url}`);
            }
          } else {
            console.log(`❌ [${r.statusCode}] -> ${url}`);
          }
          res();
        });
      }).on('error', () => res());
    });
  }
}

run();
