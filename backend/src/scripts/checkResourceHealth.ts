import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { LearningResource, ILearningResource } from '../models/LearningResource';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/engineerpath';

export async function checkSingleResourceHealth(resource: ILearningResource): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    // Try HEAD request first for efficiency, fallback to GET if HEAD rejected
    let res = await fetch(resource.url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    }).catch(() => null);

    if (!res || !res.ok) {
      // Fallback to GET
      res = await fetch(resource.url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
    }

    clearTimeout(timeoutId);
    // Any status 200-399 or 403 (cloud protection) considered alive vs true 404
    const isLive = res.status >= 200 && res.status < 400;
    return isLive;
  } catch (error: any) {
    clearTimeout(timeoutId);
    return false;
  }
}

export async function checkAllResourcesHealth(): Promise<{ total: number; verified: number; broken: number }> {
  console.log('[HEALTH-CHECKER] Starting resource link health check routine...');
  const resources = await LearningResource.find({});
  console.log(`[HEALTH-CHECKER] Found ${resources.length} total resources to verify.`);

  let verifiedCount = 0;
  let brokenCount = 0;
  const brokenLinks: Array<{ title: string; url: string }> = [];

  for (const resource of resources) {
    const isHealthy = await checkSingleResourceHealth(resource);
    resource.verified = isHealthy;
    resource.lastCheckedAt = new Date();
    await resource.save();

    if (isHealthy) {
      verifiedCount++;
    } else {
      brokenCount++;
      brokenLinks.push({ title: resource.title, url: resource.url });
    }
  }

  console.log('--------------------------------------------------');
  console.log(`[HEALTH-CHECKER] Completed verification of ${resources.length} resources:`);
  console.log(`  ✅ Verified Live Links: ${verifiedCount}`);
  console.log(`  ❌ Broken / Failed Links: ${brokenCount}`);

  if (brokenLinks.length > 0) {
    console.warn('[HEALTH-CHECKER] Summary of broken links requiring review:');
    brokenLinks.forEach(b => console.warn(`   - [${b.title}]: ${b.url}`));
  }
  console.log('--------------------------------------------------');

  return { total: resources.length, verified: verifiedCount, broken: brokenCount };
}

async function runStandalone() {
  try {
    await mongoose.connect(MONGODB_URI);
    await checkAllResourcesHealth();
    process.exit(0);
  } catch (err) {
    console.error('[HEALTH-CHECKER] Standalone execution error:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  runStandalone();
}
