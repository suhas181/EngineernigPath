import { getCurriculumForRole } from '../services/curriculumService';
import https from 'https';
import { URL } from 'url';

interface VideoAuditResult {
  topicId: string;
  topicTitle: string;
  videoTitle: string;
  videoProvider: string;
  videoUrl: string;
  isChannelUrl: boolean;
  oembedStatus: number;
  oembedTitle?: string;
  oembedAuthor?: string;
  error?: string;
}

const checkYoutubeOEmbed = (videoUrl: string): Promise<{ status: number; title?: string; author?: string; error?: string }> => {
  return new Promise((resolve) => {
    if (!videoUrl) {
      return resolve({ status: 0, error: 'Empty URL' });
    }

    // Check if it is a channel URL (@username or /channel/ or /c/)
    if (videoUrl.includes('/@') || videoUrl.includes('/channel/') || videoUrl.includes('/c/')) {
      return resolve({ status: 400, error: 'Channel URL instead of Video/Playlist' });
    }

    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
      const req = https.get(
        oembedUrl,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          },
          timeout: 8000,
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            if (res.statusCode === 200) {
              try {
                const json = JSON.parse(data);
                resolve({
                  status: 200,
                  title: json.title,
                  author: json.author_name,
                });
              } catch (e) {
                resolve({ status: 200 });
              }
            } else {
              resolve({
                status: res.statusCode || 0,
                error: `oEmbed returned HTTP ${res.statusCode} (Video unavailable / private / deleted / invalid)`,
              });
            }
          });
        }
      );

      req.on('error', (err) => resolve({ status: 0, error: err.message }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ status: 0, error: 'Timeout' });
      });
    } catch (e: any) {
      resolve({ status: 0, error: e.message });
    }
  });
};

async function testAllVideos() {
  const curriculum = getCurriculumForRole('Software Engineer', 'Java');
  console.log('======================================================================');
  console.log('🎬 YOUTUBE OEMBED ACCURACY & PLAYABILITY AUDIT (SDE 2026)');
  console.log('======================================================================\n');

  const results: VideoAuditResult[] = [];

  for (const cat of curriculum.categories) {
    for (const mod of cat.modules) {
      for (const topic of mod.topics) {
        const video = topic.guidedFlow?.step1PrimaryPlaylist;
        const videoUrl = video?.url || '';
        const isChannel = videoUrl.includes('/@') || videoUrl.includes('/channel/') || videoUrl.includes('/c/');

        const check = await checkYoutubeOEmbed(videoUrl);

        results.push({
          topicId: topic.id,
          topicTitle: topic.title,
          videoTitle: video?.title || '',
          videoProvider: video?.provider || '',
          videoUrl,
          isChannelUrl: isChannel,
          oembedStatus: check.status,
          oembedTitle: check.title,
          oembedAuthor: check.author,
          error: check.error,
        });

        const statusIcon = check.status === 200 ? '✅' : '❌';
        console.log(`${statusIcon} [${topic.id}]`);
        console.log(`   Curriculum Title: ${video?.title}`);
        console.log(`   URL:              ${videoUrl}`);
        if (check.status === 200) {
          console.log(`   Live YT Title:    ${check.title} (by ${check.author})`);
        } else {
          console.log(`   Status:           ${check.status} - ERROR: ${check.error}`);
        }
        console.log('');
      }
    }
  }

  const failed = results.filter((r) => r.oembedStatus !== 200);

  console.log('======================================================================');
  console.log('📊 AUDIT SUMMARY');
  console.log('======================================================================');
  console.log(`Total Topics Tested:  ${results.length}`);
  console.log(`Working Videos (200): ${results.length - failed.length}`);
  console.log(`Broken / Bad Videos:  ${failed.length}`);

  if (failed.length > 0) {
    console.log('\n❌ VIDEOS REQUIRING FIXES:');
    failed.forEach((f) => {
      console.log(`- [${f.topicId}] (${f.videoTitle}) -> ${f.videoUrl} [${f.error}]`);
    });
  }
}

testAllVideos();
