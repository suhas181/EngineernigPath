import https from 'https';

const candidates = [
  // GitHub Actions
  'https://www.youtube.com/watch?v=R8_veQiYBjU', // tested earlier was 404
  'https://www.youtube.com/watch?v=mFFXuXjVgkU',
  'https://www.youtube.com/watch?v=eB0nUzAI7M8', // Fireship GitHub Actions (PASS 200)
  'https://www.youtube.com/watch?v=1b5pGv5S-38',
  'https://www.youtube.com/watch?v=2laI_K_jQJk',

  // Prometheus & Grafana
  'https://www.youtube.com/watch?v=hT_nvWreIhg', // Nana Prometheus
  'https://www.youtube.com/watch?v=9TyxamZBBfc',
  'https://www.youtube.com/watch?v=emmsD1Vp2b8',

  // Python Automation
  'https://www.youtube.com/watch?v=W-b9KGwVOCc',
  'https://www.youtube.com/watch?v=PXMJ6FS7llk',
  'https://www.youtube.com/watch?v=Z1Yd7upQsXY', // Mosh Python Automation
  'https://www.youtube.com/watch?v=rfscVS0vtbw', // freeCodeCamp Python 4h

  // K8s Helm & Ops
  'https://www.youtube.com/watch?v=-ykwb1d0EiU', // TechWorld with Nana Helm
  'https://www.youtube.com/watch?v=5_pnflB_Zjg',

  // Terraform
  'https://www.youtube.com/watch?v=7xngnjfIlK4', // DevOps Directive Terraform (PASS 200)
];

async function run() {
  for (const url of candidates) {
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
