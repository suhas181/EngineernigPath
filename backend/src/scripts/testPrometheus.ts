import https from 'https';

const prometheusUrls = [
  'https://www.youtube.com/watch?v=h4Sl21AK9f8',
  'https://www.youtube.com/watch?v=k1RI5locZE4',
  'https://www.youtube.com/watch?v=jW_jK8oP3wA',
  'https://www.youtube.com/watch?v=74b0-jW2eA8',
  'https://www.youtube.com/watch?v=Hbt56gFj998',
  'https://www.youtube.com/watch?v=9TyczWpbNTU',
  'https://www.youtube.com/watch?v=j_S61m6y_yM',
  'https://www.youtube.com/watch?v=9_p_nUjK8qM'
];

async function run() {
  for (const url of prometheusUrls) {
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
