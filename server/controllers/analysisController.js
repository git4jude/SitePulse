import Analysis from "../models/Analysis.js";
import { analyzeSeoData } from "../services/geminiService.js";
import { scrapeUrl } from "../services/scraperService.js";

//Analyze a new url
export const analyzeUrl = async (req, res) => {
  try {
    const {url} = req.body;
    if(!url){
      return res.status(400).json({success: false, message: "URL is required"})
    }
    //Validate URl Format
    let validUrl;
    try {
      validUrl = new URL(url.startsWith('http') ? url : `https://${url}`)
    } catch (error) {
      return res.status(400).json({success:false, message: "Invalid URL format"})
    }

    //create analysis record with pending status
    const analysis = await Analysis.create({
      userId: req.userId,
      url: validUrl.href,
      status: "processing"
    });


    //Run scraping nd analysis in background
    (async () => {
      try {
        //step 1: scrape the url with browserbase
        const scrapeResult = await scrapeUrl(validUrl.href)

        if(!scrapeResult.success){
          analysis.status= "failed";
          await analysis.save();
          return;
        }

       // step 2: Analysis with gemini AI
       const aiResult = await analyzeSeoData({ ...scrapeResult, url: validUrl.href });
       if(!aiResult.success){
        analysis.status = "failed";
        await analysis.save()
        return;
       }


       //step 3 : save results
       analysis.overallScore = aiResult.data.overallScore || 0;
       analysis.categories = aiResult.data.categories || {};
       analysis.metaData = scrapeResult.metaData || {};
       analysis.headings = scrapeResult.headings || {};
       analysis.links = scrapeResult.links || {};
       analysis.images = scrapeResult.images || {};
       analysis.keywords = aiResult.data.keywords || [];
       analysis.issues = aiResult.data.issues || [];
       analysis.loadTime = scrapeResult.loadTime || 0;
       analysis.pageSize = scrapeResult.pageSize || 0;
       analysis.wordCount = scrapeResult.wordCount || 0;
       analysis.status = "completed";
       await analysis.save();

      } catch (bgError) {
        console.error("Background analysis error:", bgError.message)
        try {
          analysis.status = "failed"
          await analysis.save()
        } catch (saveError) {
          console.error("Failed to save failed status:", saveError.message)
        }
      }
    })();

    //send immediate response with analysis ID
    return res.status(202).json({ success: true, analysisId: analysis._id, status: analysis.status });
  } catch (error) {
    console.error("Analyze URL error:", error.message )
    if(!res.headersSent){
      res.status(500).json({ success: false, message: "Server error" });
  }
}}


//Get Analysis by ID
export const getAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.userId });

    if (!analysis) {
      return res.status(404).json({ success: false, message: "Analysis not found" });
    }

    res.json({ success: true, analysis });
  } catch (error) {
    console.error("Get analysis error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


//Get all analyses for user
export const getAnalyses = async (req, res) => {
  try {
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 10);
    const skip = (page -1) * limit;

    const analyses = await Analysis.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("-issues -keywords")
      .skip(skip)
      .limit(limit);

      const total = await Analysis.countDocuments({userId: req.userId})

    res.json({ success: true, analyses , pagination: {page, limit, total, pages: Math.ceil(total / limit)}});
  } catch (error) {
    console.error("Get analyses error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


//Delete analysis
export const deleteAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);

    if (!analysis || analysis.userId.toString() !== req.userId) {
      return res.status(404).json({ success: false, message: "Analysis not found" });
    }

    await Analysis.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Analysis deleted" });
  } catch (error) {
    console.error("Delete analysis error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};