import { runDailyUpdates } from "./scripts/dailyUpdate";

let isRunning = false;

export function startScheduler() {
  console.log("Scheduler initialized");

  const scheduleDaily = () => {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(3, 0, 0, 0); // 3 AM

    if (now > scheduledTime) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilRun = scheduledTime.getTime() - now.getTime();

    setTimeout(async () => {
      if (isRunning) {
        scheduleDaily(); // reschedule for next day
        return;
      }

      isRunning = true;
      console.log("Running daily update...");

      try {
        await runDailyUpdates();
        console.log("Daily update completed");
      } catch (error) {
        console.error("Daily update failed:", error);
      } finally {
        isRunning = false;
        scheduleDaily(); // reschedule for next day
      }
    }, timeUntilRun);
  };

  scheduleDaily();
}
