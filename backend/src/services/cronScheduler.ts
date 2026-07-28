import cron from 'node-cron';
import { checkAllResourcesHealth } from '../scripts/checkResourceHealth';

export function initializeCronScheduler() {
  console.log('[CRON] Initializing background task scheduler...');

  // Weekly resource link health check schedule (Every Sunday at 00:00 UTC)
  cron.schedule('0 0 * * 0', async () => {
    console.log('[CRON] Running scheduled weekly resource link health check...');
    try {
      await checkAllResourcesHealth();
    } catch (err) {
      console.error('[CRON] Weekly resource health check failed:', err);
    }
  });

  console.log('[CRON] Weekly resource link health check job scheduled (0 0 * * 0).');
}
