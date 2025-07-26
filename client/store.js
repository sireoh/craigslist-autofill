// store.js

const state = {
  isConnected: false,
  HFAPIKey: "",
  serverHost: "",
  selectedPreset: "",
  presetData: {},
  intervalId: ""
};


const listeners = [];

const Store = {
  getState() {
    return state;
  },

  subscribe(listener) {
    listeners.push(listener);
  },

  update(key, value) {
    if (state[key] !== value) {
      state[key] = value;
      listeners.forEach((fn) => fn(state));
    }
  },
};