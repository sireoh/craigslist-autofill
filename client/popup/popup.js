// popup.js

document.addEventListener('DOMContentLoaded', async () => {
  // Fetch initial state from MainDAL
  const db = {
    isConnected: await MainDAL.getItemByName("isConnected") ?? false,
    serverHost: await MainDAL.getItemByName("serverHost") ?? "",
    selectedPreset: await MainDAL.getItemByName("selectedPreset") ?? "",
    presets: await MainDAL.getItemByName("presets") ?? [],
    HFAPIKey: await MainDAL.getItemByName("HFAPIKey") ?? [],
  }

  // Update store with stored values
  Store.update("isConnected", db.isConnected);
  Store.update("serverHost", db.serverHost);
  Store.update("selectedPreset", db.selectedPreset);
  Store.update("presets", db.presets);
  Store.update("HFAPIKey", db.HFAPIKey);

  // Update the frontend
  __init();

  // Handle presets form submit
  ELEMENTS.connectForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Access the input named 'server_host'
    const s = ELEMENTS.connectForm.elements['server_host'].value;

    // Set to the main_dal
    MainDAL.setItemByName("isConnected", true);
    MainDAL.setItemByName("serverHost", s);

    // Update Store
    Store.update("isConnected", true)
    Store.update("serverHost", s)

    // [DEBUG] Log to console
    console.log('Added server_host:', s);
  });

  // Handle set hugging face form submit
  ELEMENTS.setHFAPIKeyForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Access the input named 'hf_api_key'
    const hf_api_key = ELEMENTS.setHFAPIKeyForm.elements['hf_api_key'].value;

    // Set to the main_dal
    MainDAL.setItemByName("HFAPIKey", hf_api_key);

    // Update Store
    Store.update("HFAPIKey", hf_api_key);

    // Update in server
    const serverResponse = await ServerDAL.setHFAPIKey(hf_api_key);
    console.log('Server response:', serverResponse);

    // [DEBUG] Log to console
    console.log('Added Hugging Face API Key:', hf_api_key);
  });

  // Handle edit form submit
  ELEMENTS.editExportsForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const db = {
      selectedPreset: await MainDAL.getItemByName("selectedPreset")
    }

    // Access the input named 'server_host'
    const presetData = {
      "id": db.selectedPreset,
      "settings": {
        "header": {
          "city": ELEMENTS.editExportsForm.elements['city'].value,
          "zip_code": ELEMENTS.editExportsForm.elements['zip_code'].value,
        },
        "details": {
          "bedrooms": ELEMENTS.editExportsForm.elements['bedrooms'].value,
          "bathrooms": ELEMENTS.editExportsForm.elements['bathrooms'].value,
        },
        "contact": {
          "phone_number": ELEMENTS.editExportsForm.elements['phone_num'].value,
          "contact_name": ELEMENTS.editExportsForm.elements['contact_name'].value,
        },
        "craigslist_query": {
          "query": ELEMENTS.editExportsForm.elements['craigslist_query'].value,
        }
      }
    }

    // Set to the presets_dal
    PresetsDAL.savePreset(presetData);

    // Send to server
    const serverResponse = await ServerDAL.updateConfig(presetData);
    console.log('Server response:', serverResponse);

    // [DEBUG] Log to console
    console.log('Added preset:', presetData);

    // Alert To User / Client
    alert(`[ADDED] ${JSON.stringify(presetData)}`);
  });

  // Handle auto filler form click
  ELEMENTS.loadDataButton.addEventListener('click', async (e) => {
    e.preventDefault();

    // Reveal the load container
    const outputs = await ServerDAL.getOutputs();

    if (outputs.message == "success") {
      Helpers.updateLoadContainerElement(outputs);
    } else {
      console.log("[Error]: ", outputs.message)
    }
  });

  // ==========================
  // Subscribe to store updates
  // ==========================
  Store.subscribe((newState) => {
    // Update connection status
    ELEMENTS.serverStatus.textContent = newState.isConnected
      ? `🟢 Connected to: ${Store.getState().serverHost}`
      : '🔴 Not connected to any servers';

    // Update api addition status
    Helpers.GUI.updateApiButtonStatus(newState);
  });
});

// === Function to update the UI ===
function __init() {
  const state = Store.getState();

  // Update server status
  ELEMENTS.serverStatus.textContent = state.isConnected
    ? `🟢 Connected to: ${state.serverHost}`
    : '🔴 Not connected to any servers';
  
  // Update api addition status
  Helpers.GUI.updateApiButtonStatus(state);

  // Set dropdown value
  const presetsSelect = ELEMENTS.presetsForm.elements["presets_select"];
  presetsSelect.value = state.selectedPreset;

  // Set up change handler
  presetsSelect.addEventListener('change', (e) => {
    e.preventDefault();

    // Change the selected value
    const selected = e.target.value;

    // Update selected preset in Store
    Store.update("selectedPreset", selected);

    // Set to the main_dal
    MainDAL.setItemByName("selectedPreset", selected);

    // Fill the form with new preset
    const presetData = Store.getState().presets.find(p => p.id === selected);
    __fill_in_form_with_data(presetData);
  });

  const gatherButton = ELEMENTS.progressForm.elements["gather_button"];
  gatherButton.addEventListener('click', async (e) => {
    e.preventDefault();

    const confirmed = confirm("Are you sure you want to webscrape Craigslist for listings?");
    if (confirmed) {
      await Helpers.Webscrapers.gatherListings();
    } else {
      return null;
    }
  });

  const fetchListingsButton = ELEMENTS.progressForm.elements["fetch_listings_button"];
  fetchListingsButton.addEventListener('click', async (e) => {
    e.preventDefault();

    const listings = await ServerDAL.getListings();

    if (listings.message == "success") {
      Helpers.updateListingsContainerElement(listings);
    } else {
      console.log("[Error]: ", listings.message)
    }
  });

  const fetchOutputsButton = ELEMENTS.progressForm.elements["fetch_outputs_button"];
  fetchOutputsButton.addEventListener('click', async (e) => {
    e.preventDefault();

    const outputs = await ServerDAL.getOutputs();

    if (outputs.message == "success") {
      Helpers.updateOutputsContainerElement(outputs);
    } else {
      console.log("[Error]: ", outputs.message)
    }
  });

  const promptAiButton = ELEMENTS.promptAiButton;
  promptAiButton.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const confirmed = confirm("Are you sure you want to generate form data with AI?");
    if (confirmed) {
      try {
        // UPDATE GUI to tell client its starting.
        Helpers.GUI.updateProgressGUIManually(0, "[STARTING] Preparing AI prompt...");

        const serverHost = await MainDAL.getItemByName("serverHost") ?? "";
        const outputsEndpoint = `${serverHost.endsWith("/") ? serverHost : serverHost + "/"}ai_model/prompt_ai`;

        const response = await fetch(outputsEndpoint);
        const data = await response.json();
        if (data.status == "error") { alert(`[Error]: ${data.mesage}`); }

        // Update GUI Manually
        Helpers.GUI.updateProgressGUIManually(20, "[PROCESSING] Building structured prompt...");

        // Start the progress webhook with interval
        const intervalId = setInterval(() => {
            ServerDAL.startProgressWebhook(intervalId);
        }, 3000); // Poll every 3 seconds
      } catch (error) {
        console.error("Error fetching outputs:", error);
        return null; // optional fallback
      }
    } else {
      return null;
    }
  });

  const fillFormButton = ELEMENTS.fillFormButton;
  fillFormButton.addEventListener('click', async (e) => {
    e.preventDefault();

    const aiResults = await ServerDAL.getAiResults();

    if (aiResults.message == "success") {
      Helpers.updateAiResultsContainerElement(aiResults);
    } else {
      console.log("[Error]: ", aiResults.message)
    }
  });

  // Fill form on first load
  const presetData = state.presets.find(p => p.id === state.selectedPreset);
  __fill_in_form_with_data(presetData);
}

function __fill_in_form_with_data(presetData) {
  const form = ELEMENTS.editExportsForm.elements;

  // If presetData is missing or malformed, clear the form
  if (!presetData || !presetData.settings) {
    console.warn("No preset or invalid data provided — clearing form.");

    form['city'].value = "";
    form['zip_code'].value = "";
    form['bedrooms'].value = "";
    form['bathrooms'].value = "";
    form['phone_num'].value = "";
    form['contact_name'].value = "";
    form['craigslist_query'].value = "";

    return;
  }

  const settings = presetData.settings;

  // Fill form with preset values
  form['city'].value = settings.header.city || "";
  form['zip_code'].value = settings.header.zip_code || "";
  form['bedrooms'].value = settings.details.bedrooms || "";
  form['bathrooms'].value = settings.details.bathrooms || "";
  form['phone_num'].value = settings.contact.phone_number || "";
  form['contact_name'].value = settings.contact.contact_name || "";
  form['craigslist_query'].value = settings.craigslist_query.query || "";
}
