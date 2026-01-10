import cron from 'node-cron';
import { syncEnergyGenerationRecords } from '../application/background/sync-energy-generation-records';

export const initializeScheduler = () => {
  // Run hourly on the hour
  const schedule = process.env.SYNC_CRON_SCHEDULE || '0 * * * *';

  // 1. Run sync immediately on startup (to catch any backfilled data)
  console.log(`[Scheduler] Triggering immediate startup sync...`);
  syncEnergyGenerationRecords()
    .then(() => console.log(`[Scheduler] Startup sync completed.`))
    .catch((err) => console.error(`[Scheduler] Startup sync failed:`, err));

  cron.schedule(schedule, async () => {
    console.log(`[${new Date().toISOString()}] Starting daily energy generation records sync...`);
    try {
      await syncEnergyGenerationRecords();
      console.log(`[${new Date().toISOString()}] Daily sync completed successfully`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Daily sync failed:`, error);
    }
  }, {
    timezone: "Asia/Colombo"
  });

  // Run monthly on the 1st at 1:00 AM
  cron.schedule("0 1 1 * *", async () => {
    console.log(`[${new Date().toISOString()}] Starting monthly invoice generation...`);
    try {
      const { generateMonthlyInvoices } = await import("../application/background/generate-invoices");
      await generateMonthlyInvoices();
      console.log(`[${new Date().toISOString()}] Monthly invoice generation completed successfully`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Monthly invoice generation failed:`, error);
    }
  }, {
    timezone: "Asia/Colombo"
  });

  console.log(`[Scheduler] Energy generation records sync scheduled for: ${schedule}`);
};