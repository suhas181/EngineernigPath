import { getCurriculumForRole } from '../services/curriculumService';
import https from 'https';
import http from 'http';
import { URL } from 'url';

interface UrlCheckResult {
  url: string;
  status: number;
  ok: boolean;
  error?: string;
  redirectUrl?: string;
}

const checkUrl = (urlStr: string): Promise<UrlCheckResult> => {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(urlStr);
      const client = parsed.protocol === 'https:' ? https : http;

      const req = client.request(
        urlStr,
        {
          method: 'HEAD',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
          timeout: 8000,
        },
        (res) => {
          // If HEAD returns 405 Method Not Allowed or 403 (some servers block HEAD), try GET
          if (res.statusCode === 405 || res.statusCode === 403) {
            const getReq = client.request(
              urlStr,
              {
                method: 'GET',
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  'Range': 'bytes=0-100', // only read first 100 bytes
                },
                timeout: 8000,
              },
              (getRes) => {
                const status = getRes.statusCode || 0;
                resolve({
                  url: urlStr,
                  status,
                  ok: (status >= 200 && status < 400) || status === 403 || status === 429, // 403/429 on YouTube/bot protection means server is alive
                  redirectUrl: getRes.headers.location,
                });
              }
            );
            getReq.on('error', (err) => resolve({ url: urlStr, status: 0, ok: false, error: err.message }));
            getReq.on('timeout', () => { getReq.destroy(); resolve({ url: urlStr, status: 0, ok: false, error: 'Timeout' }); });
            getReq.end();
            return;
          }

          const status = res.statusCode || 0;
          resolve({
            url: urlStr,
            status,
            ok: (status >= 200 && status < 400) || status === 403 || status === 429,
            redirectUrl: res.headers.location,
          });
        }
      );

      req.on('error', (err) => resolve({ url: urlStr, status: 0, ok: false, error: err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ url: urlStr, status: 0, ok: false, error: 'Timeout' }); });
      req.end();
    } catch (e: any) {
      resolve({ url: urlStr, status: 0, ok: false, error: e.message });
    }
  });
};

async function runAudit() {
  const curriculum = getCurriculumForRole('Software Engineer', 'Java');
  console.log('======================================================================');
  console.log('🔍 STEP 6 — SOFTWARE ENGINEER RESOURCE & LINK AUDIT');
  console.log('======================================================================\n');

  let topicIndex = 0;
  const auditEntries: Array<{
    topicId: string;
    topicTitle: string;
    videoTitle: string;
    videoUrl: string;
    videoStatus: UrlCheckResult;
    docTitle: string;
    docUrl: string;
    docStatus: UrlCheckResult;
    sheetName: string;
    sheetUrl: string;
    sheetStatus: UrlCheckResult;
  }> = [];

  for (const cat of curriculum.categories) {
    for (const mod of cat.modules) {
      for (const topic of mod.topics) {
        topicIndex++;
        const video = topic.guidedFlow?.step1PrimaryPlaylist;
        const doc = topic.guidedFlow?.step2Documentation;
        const sheet = topic.guidedFlow?.step3PracticeSheet;

        const videoUrl = video?.url || '';
        const sheetName = sheet?.title || (sheet as any)?.name || '';
        const docUrl = doc?.url || '';
        const sheetUrl = sheet?.url || '';

        const [videoStatus, docStatus, sheetStatus] = await Promise.all([
          checkUrl(videoUrl),
          checkUrl(docUrl),
          checkUrl(sheetUrl),
        ]);

        auditEntries.push({
          topicId: topic.id,
          topicTitle: topic.title,
          videoTitle: video?.title || '',
          videoUrl,
          videoStatus,
          docTitle: doc?.title || '',
          docUrl,
          docStatus,
          sheetName,
          sheetUrl,
          sheetStatus,
        });

        console.log(`${topicIndex}. [${topic.id}] ${topic.title}`);
        console.log(`   🎥 Video: ${video?.title} (${video?.provider}) -> [${videoStatus.status}] ${videoUrl}`);
        console.log(`   📄 Doc:   ${doc?.title} (${doc?.provider}) -> [${docStatus.status}] ${docUrl}`);
        console.log(`   📝 Sheet: ${sheetName} -> [${sheetStatus.status}] ${sheetUrl}`);
      }
    }
  }

  const brokenVideos = auditEntries.filter((e) => !e.videoStatus.ok);
  const brokenDocs = auditEntries.filter((e) => !e.docStatus.ok);
  const brokenSheets = auditEntries.filter((e) => !e.sheetStatus.ok);

  console.log('\n======================================================================');
  console.log('📊 AUDIT SUMMARY');
  console.log('======================================================================');
  console.log(`Total Topics Audited:          ${auditEntries.length} / 35`);
  console.log(`Step 1 Video Resources:        ${auditEntries.length} (Broken: ${brokenVideos.length})`);
  console.log(`Step 2 Documentation:          ${auditEntries.length} (Broken: ${brokenDocs.length})`);
  console.log(`Step 3 Practice Sheets:        ${auditEntries.length} (Broken: ${brokenSheets.length})`);

  if (brokenVideos.length > 0) {
    console.log('\n❌ Broken / Unreachable Video URLs:');
    brokenVideos.forEach((e) => console.log(`  - [${e.topicId}] ${e.videoUrl} (Status: ${e.videoStatus.status}, Err: ${e.videoStatus.error})`));
  }
  if (brokenDocs.length > 0) {
    console.log('\n❌ Broken / Unreachable Doc URLs:');
    brokenDocs.forEach((e) => console.log(`  - [${e.topicId}] ${e.docUrl} (Status: ${e.docStatus.status}, Err: ${e.docStatus.error})`));
  }
  if (brokenSheets.length > 0) {
    console.log('\n❌ Broken / Unreachable Sheet URLs:');
    brokenSheets.forEach((e) => console.log(`  - [${e.topicId}] ${e.sheetUrl} (Status: ${e.sheetStatus.status}, Err: ${e.sheetStatus.error})`));
  }
}

runAudit();
