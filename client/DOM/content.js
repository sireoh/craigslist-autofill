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

    console.log("[OLD] bedrooms:", POSTING_FORM["bedrooms"].value);
    console.log("[OLD] bathrooms:", POSTING_FORM["bathrooms"].value);

    POSTING_FORM["bedrooms"].value = aiResultData["settings"]["details"]["bedrooms"];
    POSTING_FORM["bathrooms"].value = BATHROOMS[aiResultData["settings"]["details"]["bathrooms"]];

    console.log("[NEW] bedrooms:", POSTING_FORM["bedrooms"].value);
    console.log("[NEW] bathrooms:", POSTING_FORM["bathrooms"].value);

    // =================================================================
    // ===================== DEFAULTS ==================================
    // =================================================================

    console.log("[OLD] rent_period:", POSTING_FORM.DEFAULTS["rent_period"].value);
    console.log("[OLD] laundry:", POSTING_FORM.DEFAULTS["laundry"].value);
    console.log("[OLD] parking:", POSTING_FORM.DEFAULTS["parking"].value);

    // Update the rent period on the backend
    POSTING_FORM.DEFAULTS["rent_period"].value = RENT_PERIOD.month;

    // Update the laundry on the backend
    POSTING_FORM.DEFAULTS["laundry"].value = LAUNDRY.in_building;

    // Update the parking on the backend
    POSTING_FORM.DEFAULTS["parking"].value = PARKING.carport;

    console.log("[NEW] rent_period:", POSTING_FORM.DEFAULTS["rent_period"].value);
    console.log("[NEW] laundry:", POSTING_FORM.DEFAULTS["laundry"].value);
    console.log("[NEW] parking:", POSTING_FORM.DEFAULTS["parking"].value);

    // Update the "No Smoking" checkbox
    POSTING_FORM.DEFAULTS["no_smoking"].checked = true;
  }
});