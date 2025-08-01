// server_dal.js

const ServerDAL = {
  async getOutputs() {
    try {
      const serverHost = await MainDAL.getItemByName("serverHost") ?? "";
      const outputsEndpoint = `${serverHost.endsWith("/") ? serverHost : serverHost + "/"}outputs`;

      const response = await fetch(outputsEndpoint);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching outputs:", error);
      return null; // optional fallback
    }
  },

  async deleteOutput(filename) {
    try {
      const serverHost = await MainDAL.getItemByName("serverHost") ?? "";
      const deleteEndpoint = `${serverHost.endsWith("/") ? serverHost : serverHost + "/"}outputs/${filename}`;

      const response = await fetch(deleteEndpoint, {
        method: "DELETE"
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error deleting file "${filename}":`, error);
      return { message: "fail" };
    }
  },

  async getListings() {
    try {
      const serverHost = await MainDAL.getItemByName("serverHost") ?? "";
      const listingsEndpoint = `${serverHost.endsWith("/") ? serverHost : serverHost + "/"}listings`;

      const response = await fetch(listingsEndpoint);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching listings:", error);
      return null; // optional fallback
    }
  },

  async deleteListing(filename) {
    try {
      const serverHost = await MainDAL.getItemByName("serverHost") ?? "";
      const deleteEndpoint = `${serverHost.endsWith("/") ? serverHost : serverHost + "/"}listings/${filename}`;

      const response = await fetch(deleteEndpoint, {
        method: "DELETE"
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error deleting file "${filename}":`, error);
      return { message: "fail" };
    }
  },

  async getAiResults() {
    try {
      const serverHost = await MainDAL.getItemByName("serverHost") ?? "";
      const aiResultsEndpoint = `${serverHost.endsWith("/") ? serverHost : serverHost + "/"}ai_model/results`;

      const response = await fetch(aiResultsEndpoint);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching ai results:", error);
      return null; // optional fallback
    }
  },

  async deleteAiResult(filename) {
    try {
      const serverHost = await MainDAL.getItemByName("serverHost") ?? "";
      const deleteEndpoint = `${serverHost.endsWith("/") ? serverHost : serverHost + "/"}ai_model/results/${filename}`;

      const response = await fetch(deleteEndpoint, {
        method: "DELETE"
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error deleting file "${filename}":`, error);
      return { message: "fail" };
    }
  },

  async updateConfig(presetData) {
    try {
      const serverHost = await MainDAL.getItemByName("serverHost") ?? "";
      const configEndpoint = `${serverHost.endsWith("/") ? serverHost : serverHost + "/"}config`;

      const response = await fetch(configEndpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(presetData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating config:", error);
      return { status: "error", message: error.message };
    }
  },

  async loadOutputFile(presetData, outputFile) {
    try {
      const serverHost = await MainDAL.getItemByName("serverHost") ?? "";
      const endpoint = `${serverHost.endsWith("/") ? serverHost : serverHost + "/"}config/${encodeURIComponent(outputFile)}`;

      const response = await fetch(endpoint, {
          method: "PATCH",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify(presetData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating config:", error);
      return { status: "error", message: error.message };
    }
  },

  async gatherListings() {
    try {
      const serverHost = await MainDAL.getItemByName("serverHost") ?? "";
      const gatherListingsEndpoint = `${serverHost.endsWith("/") ? serverHost : serverHost + "/"}gather_listings/`;

      const response = await fetch(gatherListingsEndpoint, {
        method: "POST"
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error gathering listings:`, error);
      return { message: "fail" };
    }
  },

  async scrapeData(listingsdoc_id) {
    try {
      const serverHost = await MainDAL.getItemByName("serverHost") ?? "";
      const scrapeDataEndpoint = `${serverHost.endsWith("/") ? serverHost : serverHost + "/"}scrape_data/`;

      const response = await fetch(scrapeDataEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ listingsdoc_id })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error scraping data:`, error);
      return { message: "fail" };
    }
  },

  async startProgressWebhook(intervalId) {
    const state = Store.getState();
      const progressEndpoint = `${state.serverHost.endsWith("/") ? state.serverHost : state.serverHost + "/"}progress`

      fetch(progressEndpoint)
      .then((response) => response.json())
      .then((data) => {
        Helpers.GUI.updateProgressGUI(data, intervalId);
      })
      .catch((error) => {
          console.error("Failed to fetch progress:", error);
      });
  },

  async setHFAPIKey(hf_api_key) {
    try {
      const serverHost = await MainDAL.getItemByName("serverHost") ?? "";
      const endpoint = `${serverHost.endsWith("/") ? serverHost : serverHost + "/"}ai_model/config`;

      const response = await fetch(endpoint, {
          method: "PATCH",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ "hf_api_key": hf_api_key })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating config:", error);
      return { status: "error", message: error.message };
    }
  },
};

// Expose globally for popup/background access
if (typeof window !== "undefined") {
  window.ServerDAL = ServerDAL;
}
if (typeof self !== "undefined") {
  self.ServerDAL = ServerDAL;
}