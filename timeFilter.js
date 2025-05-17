/**
 * Extract time filter parameters from user query
 * @param {string} query - User query
 * @returns {Object} - Time filter parameters and flags
 */
export async function getTimeFilter(query) {
  const lowerQuery = query.toLowerCase();
  const result = {
    tbs: null,            // Google's time-based search parameter
    isLocationSearch: false  // Flag for location-based searches
  };
  
  // Location search detection
  if (containsLocationPatterns(lowerQuery)) {
    result.isLocationSearch = true;
  }

  // Standard Google time filters - these match exactly what Google uses in their UI
  // The parameter "qdr" stands for "query date range"
  if (containsTimePattern(lowerQuery, ["past hour", "last hour", "recent hour"])) {
    result.tbs = "qdr:h";
  }
  else if (containsTimePattern(lowerQuery, ["past 24 hours", "last 24 hours"])) {
    result.tbs = "qdr:d";
  }
  else if (containsTimePattern(lowerQuery, ["past week", "last week"])) {
    result.tbs = "qdr:w";
  }
  else if (containsTimePattern(lowerQuery, ["past month", "last month"])) {
    result.tbs = "qdr:m";
  }
  else if (containsTimePattern(lowerQuery, ["past year", "last year"])) {
    result.tbs = "qdr:y";
  }
  
  // Additional helpful conversions that aren't standard Google filters
  else if (containsTimePattern(lowerQuery, ["today", "today's"])) {
    result.tbs = "qdr:d"; // Map to past 24 hours
  }
  else if (containsTimePattern(lowerQuery, ["yesterday"])) {
    // For yesterday, we'd ideally need custom date range, but use past 24h as approximation
    result.tbs = "qdr:d";
  }
  else if (containsTimePattern(lowerQuery, ["this week"])) {
    result.tbs = "qdr:w";
  }
  else if (containsTimePattern(lowerQuery, ["this month"])) {
    result.tbs = "qdr:m";
  }
  else if (containsTimePattern(lowerQuery, ["this year"])) {
    result.tbs = "qdr:y";
  }
  
  // More fine-grained time filters
  else if (containsTimePattern(lowerQuery, ["past 2 days", "last 2 days"])) {
    result.tbs = "qdr:2d";
  }
  else if (containsTimePattern(lowerQuery, ["past 3 days", "last 3 days"])) {
    result.tbs = "qdr:3d";
  }
  else if (containsTimePattern(lowerQuery, ["past 2 weeks", "last 2 weeks"])) {
    result.tbs = "qdr:2w";
  }
  else if (containsTimePattern(lowerQuery, ["past 3 months", "last 3 months"])) {
    result.tbs = "qdr:3m";
  }
  
  // Date range matching (experimental)
  const dateRangeMatch = lowerQuery.match(/from\s+(\d{1,2}\/\d{1,2}\/\d{2,4})\s+to\s+(\d{1,2}\/\d{1,2}\/\d{2,4})/);
  if (dateRangeMatch) {
    try {
      const startDate = new Date(dateRangeMatch[1]);
      const endDate = new Date(dateRangeMatch[2]);
      
      // Format as Google's custom date range: cdr:1,cd_min:MM/DD/YYYY,cd_max:MM/DD/YYYY
      if (!isNaN(startDate) && !isNaN(endDate)) {
        const formatDate = (date) => {
          return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
        };
        
        result.tbs = `cdr:1,cd_min:${formatDate(startDate)},cd_max:${formatDate(endDate)}`;
      }
    } catch (e) {
      console.error("Error parsing date range:", e);
    }
  }
  
  return result;
}

/**
 * Check if query contains any of the specified time patterns
 * @param {string} query - User query
 * @param {Array<string>} patterns - Time patterns to check
 * @returns {boolean} - True if query contains any pattern
 */
function containsTimePattern(query, patterns) {
  return patterns.some(pattern => query.includes(pattern));
}

/**
 * Check if query likely contains location search patterns
 * @param {string} query - User query
 * @returns {boolean} - True if query appears to be a location search
 */
function containsLocationPatterns(query) {
  const locationPatterns = [
    "near me",
    "nearby",
    "directions to",
    "how to get to",
    "where is",
    "location of",
    "restaurants in",
    "hotels in",
    "map of",
    "distance to",
    "address of"
  ];
  
  return locationPatterns.some(pattern => query.includes(pattern));
}