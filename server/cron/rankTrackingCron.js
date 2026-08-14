import cron from "node-cron";
import KeywordTracking from "../models/keywordTracking.js";
import { keywordTracking } from "../services/keywordTrackingService.js";

export function startRankTrackingCron() {
  cron.schedule("0 6 * * *", async () => {
    console.log("Starting daily rank tracking...")
    try {
      const activeTrackings = await KeywordTracking.find({active: true})
      for( const tracking of activeTrackings){
        tracking.status = "checking"
        await tracking.save()

        const result = await keywordTracking(tracking)

        //Delay between check to avoid rate limits
        await new Promise((r) => setTimeout(r, 10000 + Math.random()*  5000) )
      }
    } catch (error) {
       console.error("[CRON] Rank tracking error:", error.message)
    }
  })
}

console.log("Rank Tracking cron job scheduled");