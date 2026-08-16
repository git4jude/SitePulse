import cron from "node-cron";
import KeywordTracking from "../models/keywordTracking.js";
import CronRun from "../models/CronRun.js";
import { keywordTracking } from "../services/keywordTrackingService.js";

const JOB_NAME = "rank-tracking";

// The actual job body - shared by both the in-process node-cron scheduler
// (Render/Railway, where the process stays alive) and the HTTP endpoint
// that Vercel Cron Jobs hits on a schedule (where it doesn't).
export async function runRankTrackingJob() {
  console.log("Starting daily rank tracking...")
  const run = await CronRun.create({ job: JOB_NAME, status: "running", startedAt: new Date() }).catch(() => null)
  let checked = 0
  let failed = 0

  try {
    const activeTrackings = await KeywordTracking.find({active: true})
    if (run) { run.totalKeywords = activeTrackings.length; await run.save().catch(() => {}) }

    for (let i = 0; i < activeTrackings.length; i++) {
      const tracking = activeTrackings[i]

      // Isolate each tracking's failure so one bad save/scrape doesn't abort
      // the rest of the day's batch.
      try {
        tracking.status = "checking"
        await tracking.save()

        await keywordTracking(tracking)
        if (tracking.status === "completed") checked++
        else failed++
      } catch (error) {
        failed++
        console.error(`[CRON] Failed to check "${tracking.keyword}" (${tracking._id}):`, error.message)
      }

      //Delay between checks to avoid rate limits
      if (i < activeTrackings.length - 1) {
        await new Promise((r) => setTimeout(r, 10000 + Math.random() * 5000))
      }
    }

    if (run) {
      run.status = "completed"
      run.finishedAt = new Date()
      run.checked = checked
      run.failed = failed
      await run.save().catch(() => {})
    }
  } catch (error) {
     console.error("[CRON] Rank tracking error:", error.message)
     if (run) {
       run.status = "failed"
       run.finishedAt = new Date()
       run.checked = checked
       run.failed = failed
       run.error = error.message
       await run.save().catch(() => {})
     }
  }

  return { checked, failed }
}

export function startRankTrackingCron() {
  cron.schedule("0 6 * * *", runRankTrackingJob)
  console.log("Rank Tracking cron job scheduled");
}