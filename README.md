# 📃 User Manual: One Click Less - Smart Google Search Redirector

## Overview

**One Click Less** is a Chrome Extension designed to streamline your Google search experience. It uses AI to predict your search intent and automatically redirects you to the most relevant Google tab such as Images, News, Maps, or Videos, often applying intelligent time filters.

---

## 🔑 Getting Started

### Step 1: Installation

1. Download or clone the repository from GitHub:

   ```bash
   git clone https://github.com/Manojm21/One-click-less--Chrome-extention.git
   ```
2. Open Chrome and go to: `chrome://extensions/`
3. Enable **Developer mode** (top right corner).
4. Click **"Load unpacked"** and select the `one-click-less` folder.

### Step 2: Set HuggingFace API Token (Optional but Recommended)

1. Click on the extension icon in the Chrome toolbar.
2. Open **Options**.
3. Enter your **HuggingFace API Token** (get it from: [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)).
4. Click **Save**.

---

## 🔎 Using the Extension

### 🔑 Omnibox Search

1. In Chrome's address bar, type `ask` followed by your query.
2. Press `Enter`.
3. The extension will:

   * Predict your intent (e.g., Images, News, Maps)
   * Apply relevant time filters (if needed)
   * Redirect you to the most suitable Google tab

### ✅ Examples

| Query                     | Predicted Category | Resulting Tab   |
| ------------------------- | ------------------ | --------------- |
| `news about AI past week`   | News               | Google News with time filter     |
| `restaurants near me`     | Maps               | Google Maps     |
| `sunset beach wallpaper`  | Images             | Google Images   |
| `buy wireless headphones` | Shopping           | Google Shopping |
| `Harry Potter books`      | Books              | Google Books    |

---

## ⚙ Options & Configuration

### Options Page

* Set HuggingFace API Token
* Reset settings
* Access help and usage information

---

## 🎨 Design Considerations

* Uses HuggingFace Zero-Shot Classifier for natural language intent detection
* Fallback on local keyword heuristics if the API is not available
* Applies time filters like `past week` or `past 24 hours` when appropriate
* Smart redirection to specific Google search result tabs

---

## 🙋 Need Help?

For issues or feature requests, please create a GitHub issue in the main repository.

---

## 🏆 About

Built with ❤️ using:

* JavaScript
* Chrome Extensions API
* HuggingFace Inference API


