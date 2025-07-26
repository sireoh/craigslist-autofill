// DOM/content.js

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "[POST] /fill_form") {    
    // =================================================================
    // ====================== HEADER ===================================
    // =================================================================

    const aiResultData = message.data;

    // Set the title
    POSTING_FORM["posting_title"].value = aiResultData["settings"]["header"]["posting_title"];

    // Set the City
    POSTING_FORM["city"].value = aiResultData["settings"]["header"]["city"];

    // Set the ZIP Code
    POSTING_FORM["zip_code"].value = aiResultData["settings"]["header"]["zip_code"];

    // =================================================================
    // ====================== BODY =====================================
    // =================================================================

    // Set the body text
    POSTING_FORM["text"].textContent = aiResultData["settings"]["body"]["text"];

    // =================================================================
    // ===================== DETAILS ===================================
    // =================================================================

    // Set the rent
    const rentValue = aiResultData["settings"]["details"]["rent"].replace(/[^\d.-]/g, ''); // Remove all non-numeric chars
    POSTING_FORM["rent"].value = parseFloat(rentValue);
    // Set the bedrooms
    POSTING_FORM["bedrooms"].value = aiResultData["settings"]["details"]["bedrooms"];

    // Set the bathrooms
    POSTING_FORM["bathrooms"].value = aiResultData["settings"]["details"]["bathrooms"];
  }
});