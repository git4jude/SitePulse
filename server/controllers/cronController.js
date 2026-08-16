import { runRankTrackingJob } from "../cron/rankTrackingCron.js";

// Triggered by Vercel Cron Jobs (or manually) instead of node-cron's in-process
// scheduler, since Vercel's serverless functions don't stay alive for a timer to fire in.
export const triggerRankTrackingCron = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const result = await runRankTrackingJob();
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Cron trigger error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
