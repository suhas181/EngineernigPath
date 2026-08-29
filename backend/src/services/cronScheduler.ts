import cron from 'node-cron';
import { checkAllResourcesHealth } from '../scripts/checkResourceHealth';

let isSchedulerInitialized = false;

export function initializeCronScheduler() {
  if (isSchedulerInitialized) {
    console.log('[CRON] Background task scheduler is already initialized. Skipping duplicate setup.');
    return;
  }

  isSchedulerInitialized = true;
  console.log('[CRON] Initializing background task scheduler...');

  // 1. Weekly resource link health check schedule (Every Sunday at 00:00 UTC)
  cron.schedule('0 0 * * 0', async () => {
    console.log('[CRON] Running scheduled weekly resource link health check...');
    try {
      await checkAllResourcesHealth();
    } catch (err) {
      console.error('[CRON] Weekly resource health check failed:', err);
    }
  });

  console.log('[CRON] Weekly resource link health check job scheduled (0 0 * * 0).');

  // 2. Automatic Internship listings refresh schedule (Every 12 hours)
  cron.schedule('0 */12 * * *', async () => {
    console.log('[CRON] Running scheduled 12-hour internship listings refresh cycle...');
    try {
      const { refreshInternships } = await import('./internshipService');
      await refreshInternships('SCHEDULED_CRON', 'SYSTEM_SCHEDULER');
    } catch (err) {
      console.error('[CRON] Internship refresh cycle failed:', err);
    }
  });

  console.log('[CRON] 12-hour internship refresh job scheduled (0 */12 * * *).');

  // 3. Application Startup Bootstrap: Safely verify database population & status
  setTimeout(async () => {
    try {
      const { Internship } = await import('../models/Internship');
      const { refreshInternships, reEvaluateInternshipStatuses } = await import('./internshipService');

      const count = await Internship.countDocuments();

      // If database is completely empty, trigger an automated initial sync
      if (count === 0) {
        console.log('[CRON] Internship database is empty. Triggering automated initial sync...');
        await refreshInternships('BOOTSTRAP', 'SYSTEM_BOOTSTRAP');
      } else {
        // Safely re-evaluate existing listings
        console.log('[CRON] Safely evaluating existing internship statuses...');
        const stats = await reEvaluateInternshipStatuses();
        console.log(`[CRON] Evaluation complete: ${stats.openCount} OPEN, ${stats.unknownCount} UNKNOWN, ${stats.closedCount} CLOSED (Total: ${stats.total}).`);
      }
    } catch (err) {
      console.error('[CRON] Initial internship evaluation/sync failed:', err);
    }
  }, 1000);
}
