// presets_dal.js

const PresetsDAL = {
  // Generate a UUID v4
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  // Get all presets
  async getAllPresets() {
    try {
      const result = await browser.storage.local.get('presets');
      return result.presets || [];
    } catch (error) {
      console.error('Error getting presets:', error);
      return [];
    }
  },

  // Get a single preset by ID
  async getPresetById(id) {
    const presets = await this.getAllPresets();
    return presets.find(preset => preset.id === id);
  },

  // Save a new preset or update existing one
  async savePreset(presetData) {
    try {
      const presets = await this.getAllPresets();
      const preset = {
        id: presetData.id || this.generateUUID(),
        settings: {
          header: {
            city: presetData.settings?.header?.city || "",
            zip_code: presetData.settings?.header?.zip_code || ""
          },
          details: {
            bedrooms: presetData.settings?.details?.bedrooms || 0,
            bathrooms: presetData.settings?.details?.bathrooms || 0
          },
          contact: {
            phone_number: presetData.settings?.contact?.phone_number || "",
            contact_name: presetData.settings?.contact?.contact_name || ""
          },
          craigslist_query: {
            query: presetData.settings?.craigslist_query?.query || ""
          }
        }
      };

      const existingIndex = presets.findIndex(p => p.id === preset.id);
      
      if (existingIndex >= 0) {
        // Update existing
        presets[existingIndex] = preset;
      } else {
        // Add new
        presets.push(preset);
      }
      
      await browser.storage.local.set({ presets });
      return preset;
    } catch (error) {
      console.error('Error saving preset:', error);
      throw error;
    }
  },

  // Delete a preset by ID
  async deletePreset(id) {
    try {
      const presets = await this.getAllPresets();
      const updatedPresets = presets.filter(preset => preset.id !== id);
      await browser.storage.local.set({ presets: updatedPresets });
      return true;
    } catch (error) {
      console.error('Error deleting preset:', error);
      return false;
    }
  },

  // Clear all presets
  async clearAllPresets() {
    try {
      await browser.storage.local.remove('presets');
      return true;
    } catch (error) {
      console.error('Error clearing presets:', error);
      return false;
    }
  }
};

// Expose globally for popup/background access
if (typeof window !== "undefined") {
  window.PresetsDAL = PresetsDAL;
}
if (typeof self !== "undefined") {
  self.PresetsDAL = PresetsDAL;
}