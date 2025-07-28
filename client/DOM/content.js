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
    let rentValue = aiResultData["settings"]["details"]["rent"];
    if (typeof rentValue === "string") { rentValue = rentValue.replace(/[^\d.-]/g, ''); rentValue = parseFloat(rentValue);};
    POSTING_FORM["rent"].value = rentValue;

    // Capture old values before updating
    DEBUG["[OLD] bedrooms"] = POSTING_FORM["bedrooms"].value;
    DEBUG["[OLD] bathrooms"] = POSTING_FORM["bathrooms"].value;

    POSTING_FORM["bedrooms"].value = aiResultData["settings"]["details"]["bedrooms"];
    POSTING_FORM["bathrooms"].value = BATHROOMS[aiResultData["settings"]["details"]["bathrooms"]];

    // Capture new values
    DEBUG["[NEW] bedrooms"] = POSTING_FORM["bedrooms"].value;
    DEBUG["[NEW] bathrooms"] = POSTING_FORM["bathrooms"].value;

    // =================================================================
    // ===================== DEFAULTS ==================================
    // =================================================================

    // Capture old defaults before updating
    DEBUG["[OLD] rent_period"] = POSTING_FORM.DEFAULTS["rent_period"].value;
    DEBUG["[OLD] housing_type"] = POSTING_FORM.DEFAULTS["housing_type"].value;
    DEBUG["[OLD] laundry"] = POSTING_FORM.DEFAULTS["laundry"].value;
    DEBUG["[OLD] parking"] = POSTING_FORM.DEFAULTS["parking"].value;

    // Update the rent period on the backend
    POSTING_FORM.DEFAULTS["rent_period"].value = RENT_PERIOD.month;

    // Update the housing_type on the backend
    POSTING_FORM.DEFAULTS["housing_type"].value = HOUSING_TYPE.house;

    // Update the laundry on the backend
    POSTING_FORM.DEFAULTS["laundry"].value = LAUNDRY.in_building;

    // Update the parking on the backend
    POSTING_FORM.DEFAULTS["parking"].value = PARKING.carport;

    // Capture new values
    DEBUG["[NEW] rent_period"] = POSTING_FORM.DEFAULTS["rent_period"].value;
    DEBUG["[NEW] housing_type"] = POSTING_FORM.DEFAULTS["housing_type"].value;
    DEBUG["[NEW] laundry"] = POSTING_FORM.DEFAULTS["laundry"].value;
    DEBUG["[NEW] parking"] = POSTING_FORM.DEFAULTS["parking"].value;

    // Update the "No Smoking" checkbox
    POSTING_FORM.DEFAULTS["no_smoking"].checked = true;

    // =================================================================
    // ===================== DEBUG =====================================
    // =================================================================

    const DEBUG_TEXT = `
    Values Have Been Set Automatically:
    (Craigslist Uses jQuery, so UI will not update.)
    ------------
    bedrooms: ${DEBUG["[OLD] bedrooms"]} -> ${DEBUG["[NEW] bedrooms"]}
    bathrooms: ${DEBUG["[OLD] bathrooms"]} -> ${DEBUG["[NEW] bathrooms"]}
    rent_period: ${DEBUG["[OLD] rent_period"]} -> ${DEBUG["[NEW] rent_period"]}
    housing_type: ${DEBUG["[OLD] housing_type"]} -> ${DEBUG["[NEW] housing_type"]}
    laundry: ${DEBUG["[OLD] laundry"]} -> ${DEBUG["[NEW] laundry"]}
    parking: ${DEBUG["[OLD] parking"]} -> ${DEBUG["[NEW] parking"]}
    `;

    // To use it (example with populated values):
    console.log(DEBUG_TEXT);
    alert(DEBUG_TEXT);

  }
});