
/**
 * Get search category prediction combining local patterns and HuggingFace LLM
 * @param {string} query - User query
 * @returns {Promise<string>} - Predicted category
 */
export async function getCategoryFromLLM(query) {
  try {
    // First try local pattern-based detection for speed and fallback
    const localCategory = getLocalCategoryPrediction(query);
    if (localCategory !== "All") {
      return localCategory; // Return if we have a confident local match
    }
    
    // Get API key from storage - if not available, fallback to local matching
    const apiKeyResult = await chrome.storage.sync.get(['huggingfaceApiKey']);
    const API_TOKEN = apiKeyResult.huggingfaceApiKey;
    
    if (!API_TOKEN || API_TOKEN.trim() === "") {
      console.log("No API key configured, using local pattern matching only");
      return localCategory; // Use local pattern matching only
    }
    
    // Validate API token format before using it
    if (!validateApiToken(API_TOKEN)) {
      console.error("Invalid Hugging Face API token format");
      return localCategory; 
    }
    
    // If no clear local pattern, use HuggingFace Inference API
    const API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli";
    
    // Prepare the zero-shot classification payload with expanded categories
    const payload = {
      inputs: query,
      parameters: {
        candidate_labels: [
          "images", "news", "shopping", "videos", "forums", "web search", 
          "maps", "books", "location"
        ]
      }
    };
    
    // Create an abort controller with timeout fallback
    const controller = createAbortController(3000);
    
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    if (!response.ok) {
      console.error("HuggingFace API error:", await response.text());
      return "All"; // Fallback to default search
    }
    
    const result = await response.json();
    
    // Handle empty or invalid API response
    if (!result || !Array.isArray(result.labels) || result.labels.length === 0) {
      console.error("Invalid API response format:", result);
      return "All";
    }
    
    console.log("HF API result:", result);
    
    // Expanded category mapping
    const categoryMapping = {
      "images": "Images",
      "news": "News",
      "shopping": "Shopping",
      "videos": "Videos",
      "forums": "Forums",
      "web search": "Web",
      "maps": "Maps",
      "location": "Maps",
      "books": "Books"
    };
    
    // Get the most likely category
    const predictedLabel = result.labels[0];
    const confidence = result.scores[0];
    
    // Only use prediction if confidence is above threshold
    if (confidence > 0.65) {
      return categoryMapping[predictedLabel] || "All";
    } else {
      return "All"; // Default to general search if confidence is low
    }
    
  } catch (error) {
    console.error("Error in LLM category prediction:", error);
    return "All"; // Fallback to default search on error
  }
}

/**
 * Creates an AbortController with timeout
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {AbortController} - AbortController instance
 */
function createAbortController(timeoutMs) {
  const controller = new AbortController();
  
  // Create our own timeout if AbortSignal.timeout is not available
  if (typeof AbortSignal.timeout === 'function') {
    return { signal: AbortSignal.timeout(timeoutMs) };
  } else {
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    // Clean up the timeout if the controller is aborted
    controller.signal.addEventListener('abort', () => clearTimeout(timeoutId));
    return controller;
  }
}

/**
 * Validates the Hugging Face API token format
 * @param {string} token - API token to validate
 * @returns {boolean} - Whether the token is valid
 */
function validateApiToken(token) {
  // Basic validation - Hugging Face tokens typically start with "hf_"
  // and are followed by a string of characters
  return typeof token === 'string' && 
         token.trim().length > 0 && 
         /^hf_[a-zA-Z0-9]+$/.test(token);
}

/**
 * Local pattern-based category prediction with expanded categories
 * @param {string} query - User query
 * @returns {string} - Predicted category
 */
function getLocalCategoryPrediction(query) {
  const lowerQuery = query.toLowerCase();
  
  // Pattern matching for common cases
  if (lowerQuery.includes("photo") || lowerQuery.includes("image") || 
      lowerQuery.includes("painting") || lowerQuery.includes("picture") ||
      lowerQuery.includes("wallpaper")) {
    return "Images";
  }
  
  if (lowerQuery.includes("buy") || lowerQuery.includes("price") || 
      lowerQuery.includes("shop") || lowerQuery.includes("purchase") || 
      lowerQuery.includes("cost") || lowerQuery.includes("cheap") ||
      lowerQuery.includes("discount") || lowerQuery.includes("sale")) {
    return "Shopping";
  }
  
  if (lowerQuery.includes("news") || lowerQuery.includes("headline") || 
      lowerQuery.includes("update") || lowerQuery.includes("latest") ||
      lowerQuery.includes("breaking") || lowerQuery.includes("today's news")) {
    return "News";
  }
  
  if (lowerQuery.includes("video") || lowerQuery.includes("clip") || 
      lowerQuery.includes("trailer") || lowerQuery.includes("watch") ||
      lowerQuery.includes("youtube") || lowerQuery.includes("tiktok")) {
    return "Videos";
  }
  
  if (lowerQuery.includes("forum") || lowerQuery.includes("discussion") ||
      lowerQuery.includes("reddit") || lowerQuery.includes("thread") ||
      lowerQuery.includes("community") || lowerQuery.includes("opinion")) {
    return "Forums";
  }
  
  // New categories
  if (lowerQuery.includes("map") || lowerQuery.includes("direction") || 
      lowerQuery.includes("location") || lowerQuery.includes("place") ||
      lowerQuery.includes("navigate") || lowerQuery.includes("nearby") ||
      lowerQuery.includes("restaurant near") || lowerQuery.includes("hotel in")) {
    return "Maps";
  }
  
  if (lowerQuery.includes("book") || lowerQuery.includes("novel") || 
      lowerQuery.includes("author") || lowerQuery.includes("isbn") ||
      lowerQuery.includes("read") || lowerQuery.includes("publication") ||
      lowerQuery.includes("literature")) {
    return "Books";
  }
  
  return "All"; // Default case
}