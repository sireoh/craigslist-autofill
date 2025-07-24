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
  }
};

// Expose globally for popup/background access
if (typeof window !== "undefined") {
  window.ServerDAL = ServerDAL;
}
if (typeof self !== "undefined") {
  self.ServerDAL = ServerDAL;
}