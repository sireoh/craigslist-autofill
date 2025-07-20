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
  }
};

// Expose globally for popup/background access
if (typeof window !== "undefined") {
  window.ServerDAL = ServerDAL;
}
if (typeof self !== "undefined") {
  self.ServerDAL = ServerDAL;
}