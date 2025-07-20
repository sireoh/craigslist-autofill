// main_dal.js

const MainDAL = {
  // Get all presets
  async getItemByName(name) {
    try {
      const result = await browser.storage.local.get(name);
      return result[name];
    } catch (error) {
      console.error(`Error getting ${name}: `, error);
      return undefined;
    }
  },

  // Set item
  async setItemByName(name, value) {
    try {
      await browser.storage.local.set({ [name]: value });
      return {name: value}
    } catch (error) {
      console.error(`Error saving ${name}: `, error);
      throw error;
    }
  },

  // Remove item by name
  async removeItemByName(name) {
    try {
      await browser.storage.local.remove(name);
      return true;
    } catch (error) {
      console.error(`Error removing ${name}: `, error);
      return false;
    }
  }
};

// Expose globally for popup/background access
if (typeof window !== "undefined") {
  window.MainDAL = MainDAL;
}
if (typeof self !== "undefined") {
  self.MainDAL = MainDAL;
}