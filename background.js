import { getCategoryFromLLM } from './categoryPrediction.js';
import { getTimeFilter } from './timeFilter.js';

chrome.omnibox.onInputEntered.addListener(async (qtext) => {
  console.log("Query entered:", qtext);
  
  try {
    // Get category prediction and time filter in parallel
    const [category, timeParams] = await Promise.all([
      getCategoryFromLLM(qtext),
      getTimeFilter(qtext)
    ]);
    
    console.log("Category:", category);
    console.log("Time filter:", timeParams);
    
    const baseUrl = "https://www.google.com/search?q=" + encodeURIComponent(qtext);
    
    // Build the final URL with appropriate parameters
    const finalUrl = buildSearchUrl(baseUrl, category, timeParams, qtext);
    console.log("Opening URL:", finalUrl);
    
    chrome.tabs.create({ url: finalUrl });
  } catch (error) {
    console.error("Error processing search:", error);
    const fallbackUrl = "https://www.google.com/search?q=" + encodeURIComponent(qtext);
    chrome.tabs.create({ url: fallbackUrl });
  }
});

/**
 * Builds the final Google search URL with all required parameters
 * @param {string} baseUrl - Base search URL with query
 * @param {string} category - Search category
 * @param {Object} timeParams - Time filter parameters
 * @param {string} queryText - Original search query text
 * @returns {string} - Final search URL
 */
function buildSearchUrl(baseUrl, category, timeParams, queryText) {
  const params = new URLSearchParams();
  
  // Category parameter mapping
  const tbmMap = {
    "Images": "isch",
    "News": "nws",
    "Shopping": "shop", 
    "Videos": "vid",
    "Short videos": "vid",
    "Forums": "dsc",
    "Books": "bks",
    "Maps": "lcl",  // Local results (closest to maps in omnibox)
    "Web": "",
    "All": ""
  };
  
  // Add category parameter if applicable
  const tbm = tbmMap[category] || "";
  if (tbm) {
    params.append("tbm", tbm);
  }
  
  // Add time filter parameters if applicable
  if (timeParams.tbs) {
    params.append("tbs", timeParams.tbs);
  }
  
  // Special handling for Maps
  if (category === "Maps") {
    // Add maps-specific parameters
    params.append("rlst", "1");
    params.append("rldimm", "1");
    
    // If this is a location search, redirect to Google Maps directly
    if (timeParams.isLocationSearch) {
      return `https://www.google.com/maps/search/${encodeURIComponent(queryText)}`;
    }
  }
  
  // Combine base URL with parameters
  const paramString = params.toString();
  return paramString ? `${baseUrl}&${paramString}` : baseUrl;
}