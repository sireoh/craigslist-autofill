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

  // Handle connection form submit
  ELEMENTS.presetsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Access the input named 'server_host'
    const selectedPreset = ELEMENTS.presetsForm.elements['presets_select'].value;

    // Set to the main_dal
    MainDAL.setItemByName("selectedPreset", selectedPreset);

    // Update Store
    Store.update("selectedPreset", selectedPreset)

    // [DEBUG] Log to console
    console.log('Selected value:', selectedPreset);
  });

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

    // [DEBUG] Log to console
    console.log('Added preset:', presetData);
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

    const selected = e.target.value;

    // Update selected preset in Store
    Store.update("selectedPreset", selected);

    // Fill the form with new preset
    const presetData = Store.getState().presets.find(p => p.id === selected);
    __fill_in_form_with_data(presetData);
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
