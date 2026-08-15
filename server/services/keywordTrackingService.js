import { rankTracker } from "./rankTrackerService.js"

export async function keywordTracking(tracking){
  try {
    let result

    //1. Try upto two times for reliability
    for(let attempt = 1; attempt <=2; attempt++ ){
      result = await rankTracker(tracking.keyword, tracking.domain)
      if(result.success && result.data.totalResultsScanned) break;
      if(attempt < 2) await new Promise((r) => setTimeout(r, result.success ? 3000 : 5000))
    }

    // A "successful" scrape that extracted zero results almost always means Google
    // blocked/CAPTCHA'd the session, not that the keyword genuinely has no results -
    // treat it as a failed check rather than overwriting the tracking with a false "not ranked".
    const scrapedOk = result.success && result.data.totalResultsScanned > 0;

    if(scrapedOk){
      const prev = tracking.currentPosition;
      const today = new Date();
      today.setHours(0,0,0,0);

      tracking.currentPosition = result.data.position;
      tracking.currentPage = result.data.page;
      tracking.competitors = result.data.competitors;
      tracking.lastChecked = new Date();
      tracking.status = "completed";

      //update stats
      tracking.positionChange = prev && result.data.position ? prev - result.data.position : 0;
      if (result.data.position && (!tracking.bestPosition || result.data.position < tracking.bestPosition)) {
        tracking.bestPosition = result.data.position;
      }

      //update history
      const historyEntry = {
        date: today,
        position: result.data.position,
        page: result.data.page,
        title: result.data.title,
        snippet: result.data.snippet,
      };

      const idx = tracking.rankHistory.findIndex((entry) => entry.date.toDateString() === today.toDateString());
      if (idx >= 0) {
        tracking.rankHistory[idx] = historyEntry;
      } else {
        tracking.rankHistory.push(historyEntry);
      }

    }else{
      tracking.status = "failed";
    }
    await tracking.save();
    return result;

  } catch (error) {
    console.error("Rank Update error:", error.message);
    tracking.status = "failed";
    await tracking.save().catch(() => {})
    return{
      success:false, error: error.message
    }
  }
}