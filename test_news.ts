import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";
import Parser from "rss-parser";

const rssParser = new Parser();

async function testNews() {
  const ticker = "AAPL";
  const yahooUrl = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(ticker)}&region=US&lang=en-US`;
  
  console.log("Fetching RSS...");
  try {
    const yahooFeed = await rssParser.parseURL(yahooUrl);
    console.log("Yahoo Feed Title:", yahooFeed.title);
    if (!yahooFeed.items || yahooFeed.items.length === 0) {
      console.log("No items found in Yahoo feed");
    } else {
      console.log("Found", yahooFeed.items.length, "items in Yahoo feed");
    }
  } catch (e) {
    console.error("RSS Error:", e);
  }

  console.log("Testing Gemini API...");
  try {
    const aiInstance = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
    
    const prompt = "Hello, respond with JSON: { \"status\": \"ok\" }";
    const result = await aiInstance.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    console.log("Gemini API works. Output:", result.text);
  } catch (e) {
    console.error("Gemini API Error:", e);
  }
}

testNews();
