// options.js
// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  const apiKeyInput = document.getElementById('api-key');
  const optionsForm = document.getElementById('options-form');
  const resetButton = document.getElementById('reset-settings');
  const statusElement = document.getElementById('status');
  
  // Function to show status messages
  function showStatus(message, isError = false) {
    statusElement.textContent = message;
    statusElement.style.display = 'block';
    
    if (isError) {
      statusElement.style.backgroundColor = '#ffebee';
      statusElement.style.color = '#c62828';
    } else {
      statusElement.style.backgroundColor = '#e8f0fe';
      statusElement.style.color = '#333';
    }
    
    setTimeout(function() {
      statusElement.style.display = 'none';
      statusElement.textContent = '';
    }, 2000);
  }
  
  // Function to validate Hugging Face API key
  function validateHuggingFaceApiKey(key) {
    // Basic validation - Hugging Face tokens typically start with "hf_"
    return typeof key === 'string' && 
           key.trim().length > 0 && 
           /^hf_[a-zA-Z0-9]+$/.test(key);
  }
  
  // Check if we're running in a Chrome extension context
  if (typeof chrome !== 'undefined') {
    try {
      // Load saved API key
      chrome.storage.sync.get(['huggingfaceApiKey'], function(result) {
        if (chrome.runtime.lastError) {
          console.error('Error loading settings:', chrome.runtime.lastError);
          showStatus('Error loading settings: ' + chrome.runtime.lastError.message, true);
          return;
        }
        
        if (result && result.huggingfaceApiKey) {
          apiKeyInput.value = result.huggingfaceApiKey;
        }
      });
      
      // Save settings
      optionsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const apiKey = apiKeyInput.value.trim();
        
        // Validate API key format if provided
        if (apiKey && !validateHuggingFaceApiKey(apiKey)) {
          showStatus('Invalid API key format. Hugging Face API keys typically start with "hf_"', true);
          return;
        }
        
        chrome.storage.sync.set({huggingfaceApiKey: apiKey}, function() {
          if (chrome.runtime.lastError) {
            console.error('Error saving settings:', chrome.runtime.lastError);
            showStatus('Error saving settings: ' + chrome.runtime.lastError.message, true);
            return;
          }
          
          showStatus('Settings saved!');
        });
      });
      
      // Reset settings
      resetButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to reset all settings?')) {
          chrome.storage.sync.clear(function() {
            if (chrome.runtime.lastError) {
              console.error('Error resetting settings:', chrome.runtime.lastError);
              showStatus('Error resetting settings: ' + chrome.runtime.lastError.message, true);
              return;
            }
            
            apiKeyInput.value = '';
            showStatus('Settings reset!');
          });
        }
      });
    } catch (error) {
      console.error('Error accessing Chrome API:', error);
      showStatus('Error accessing Chrome API. Are you running this page outside the extension?', true);
    }
  } else {
    console.error('Chrome API not available');
    showStatus('Chrome API not available. This page should be accessed through the extension.', true);
    apiKeyInput.disabled = true;
    document.querySelector('button[type="submit"]').disabled = true;
    resetButton.disabled = true;
  }
});