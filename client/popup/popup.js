// popup.js

document.addEventListener('DOMContentLoaded', async () => {
  // Fetch initial state from MainDAL
  const db = {
    isConnected: await MainDAL.getItemByName("isConnected") ?? false,
    serverHost: await MainDAL.getItemByName("serverHost") ?? "",
    selectedPreset: await MainDAL.getItemByName("selectedPreset") ?? "",
    presets: await MainDAL.getItemByName("presets") ?? [],
  }

  // Update store with stored values
  Store.update("isConnected", db.isConnected);
  Store.update("serverHost", db.serverHost);
  Store.update("selectedPreset", db.selectedPreset);
  Store.update("presets", db.presets);

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
        "header" : {
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

    // Set to the main_dal
    PresetsDAL.savePreset(presetData);

    // Send to server
    const serverResponse = await ServerDAL.updateConfig(presetData);
    console.log('Server response:', serverResponse);

    // [DEBUG] Log to console
    console.log('Added preset:', presetData);
  });

  // Handle auto filler form click
  ELEMENTS.importDataButton.addEventListener('click', (e) => {
    e.preventDefault();

    // Open in new tab
    window.open(
        browser.runtime.getURL("popup/file_import.html"),
        "_blank",
        "width=350,height=150,noopener,noreferrer"
      );
  });

  // ==========================
  // Subscribe to store updates
  // ==========================
  Store.subscribe((newState) => {
    // Update connection status
    ELEMENTS.serverStatus.textContent = newState.isConnected
      ? `🟢 Connected to: ${Store.getState().serverHost}`
      : '🔴 Not connected to any servers';
  });
});

// === Function to update the UI ===
function __init() {
  const state = Store.getState();

  // Update server status
  ELEMENTS.serverStatus.textContent = state.isConnected
    ? `🟢 Connected to: ${state.serverHost}`
    : '🔴 Not connected to any servers';

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

  // Setup Progress Handler
  // Start polling when the "Scrape Data" button is clicked
  const scrapeButton = ELEMENTS.progressForm.elements["scrape_button"];
  scrapeButton.addEventListener('click', (e) => {
    e.preventDefault();

    // Reset UI immediately
    const form = ELEMENTS.progressForm.elements;
    form["progress_bar"].value = 0;
    ELEMENTS.progressValue.textContent = `0%`;
    ELEMENTS.progressText.textContent = `phase: starting`;

    const intervalId = setInterval(() => Hooks.pollProgress(intervalId), 1250);
    Hooks.pollProgress(intervalId);
  });

  // Start polling when the "Scrape Data" button is clicked
  const fetchOutputsButton = ELEMENTS.progressForm.elements["fetch_outputs_button"];
  fetchOutputsButton.addEventListener('click', async (e) => {
    e.preventDefault();

    const outputs = await ServerDAL.getOutputs();

    if (outputs.message == "success") {
      Helpers.updateDownloadContainerElement(outputs);
    } else {
      console.log("[Error]: ", outputs.message)
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
