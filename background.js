import { getCategoryFromLLM } from './categoryPrediction.js';
import { getTimeFilter } from './timeFilter.js';

chrome.omnibox.onInputEntered.addListener(async (text) => {
  console.log("Query entered:", text);
  
  try {
    // Get category prediction and time filter in parallel
    const [category, timeParams] = await Promise.all([
      getCategoryFromLLM(text),
      getTimeFilter(text)
    ]);
    
    console.log("Category:", category);
    console.log("Time filter:", timeParams);
    
    const baseUrl = "https://www.google.com/search?q=" + encodeURIComponent(text);
    
    // Build the final URL with appropriate parameters
    const finalUrl = buildSearchUrl(baseUrl, category, timeParams, text);
    console.log("Opening URL:", finalUrl);
    
    chrome.tabs.create({ url: finalUrl });
  } catch (error) {
    console.error("Error processing search:", error);
    // Fallback to regular search
    const fallbackUrl = "https://www.google.com/search?q=" + encodeURIComponent(text);
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
    "Forums": "",  // Google no longer supports direct forum search with tbm parameter
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
  
  // Handle Forums category specially - append discussion-related terms
  if (category === "Forums") {
    // Always modify the query to enhance forum results
    let modifiedQuery = queryText;
    
    // Check if we need to add forum-specific search operators
    if (!queryText.toLowerCase().includes("site:reddit.com") && 
        !queryText.toLowerCase().includes("site:quora.com") && 
        !queryText.toLowerCase().includes("site:stackoverflow.com")) {
      
      // Add site-specific searches to prioritize discussion sites
      modifiedQuery = queryText + " (site:reddit.com OR site:quora.com OR site:stackexchange.com OR inurl:forum OR inurl:community OR inurl:discuss)";
    }
    
    // Create a new base URL with the modified query
    baseUrl = "https://www.google.com/search?q=" + encodeURIComponent(modifiedQuery);
    
    // Add discussion-oriented search parameters
    params.append("ncr", "1"); // No country redirect
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