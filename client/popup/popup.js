// popup.js

const ELEMENTS = {
  "connectForm" : document.getElementById('connect_to_server_form'),
  "serverStatus" : document.getElementById('is_server_connected'),
}

document.addEventListener('DOMContentLoaded', async () => {
  // Fetch initial state from MainDAL
  const db = {
    isConnected: await MainDAL.getItemByName("isConnected") ?? false,
    serverHost: await MainDAL.getItemByName("serverHost") ?? "",
  }

  // Update store with stored values
  Store.update("isConnected", db.isConnected);
  Store.update("serverHost", db.serverHost);

  // Update the frontend
  renderServerStatus();

  // Handle form submit
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
function renderServerStatus() {
  const state = Store.getState();
  console.log(state);
  ELEMENTS.serverStatus.textContent = state.isConnected
    ? `🟢 Connected to: ${state.serverHost}`
    : '🔴 Not connected to any servers';
}