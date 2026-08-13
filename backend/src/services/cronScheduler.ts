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

  // Internship listings refresh schedule (Every 12 hours)
  cron.schedule('0 */12 * * *', async () => {
    console.log('[CRON] Running scheduled 12-hour internship listings refresh cycle...');
    try {
      const { refreshInternships } = await import('./internshipService');
      await refreshInternships();
    } catch (err) {
      console.error('[CRON] Internship refresh cycle failed:', err);
    }
  });
  console.log('[CRON] 12-hour internship refresh job scheduled (0 */12 * * *).');

  // Trigger initial database population if empty
  setTimeout(async () => {
    try {
      const { Internship } = await import('../models/Internship');
      const count = await Internship.countDocuments();
      if (count === 0) {
        console.log('[CRON] Internship database is empty. Triggering initial Adzuna sync...');
        const { refreshInternships } = await import('./internshipService');
        await refreshInternships();
      }
    } catch (err) {
      console.error('[CRON] Initial internship sync failed:', err);
    }
  }, 3000);
}
