const Helpers = {
  updateLoadContainerElement(outputFiles) {
    const data = outputFiles.data;
    const container = ELEMENTS.fetchContainer;

    // Clear existing content
    container.innerHTML = '';

    // Create the <ul>
    const ul = document.createElement('ul');
    ul.style.listStyle = 'none';
    ul.style.padding = '0';
    ul.style.margin = '0';
    ul.style.marginTop = '4px';

    data.forEach(filename => {
      // Create the <li>
      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.alignItems = 'center';
      li.style.justifyContent = 'space-between';
      li.style.marginBottom = '6px';

      // Left: filename
      const fileLabel = document.createElement('small');
      fileLabel.textContent = filename;
      fileLabel.style.flex = '1';

      // Right: buttons container
      const buttonGroup = document.createElement('div');
      buttonGroup.style.display = 'flex';
      buttonGroup.style.gap = '6px';

      // Load button
      const loadButton = document.createElement('button');
      loadButton.textContent = 'Load';
      loadButton.type = 'button';
      loadButton.addEventListener('click', async () => {
        // Fetch initial state from MainDAL
        const db = { selectedPreset: await MainDAL.getItemByName("selectedPreset") ?? "" };
        const presetData = await PresetsDAL.getPresetById(db.selectedPreset);

        const serverResponse = await ServerDAL.loadOutputFile(presetData, filename);
        console.log('Server response:', serverResponse);

        ELEMENTS.loadedOutputText.textContent = `${filename.split(".")[0]}`;
      });

      // Assemble buttons and row
      buttonGroup.appendChild(loadButton);
      li.appendChild(fileLabel);
      li.appendChild(buttonGroup);
      ul.appendChild(li);
    });

    // Append the list to the container
    container.appendChild(ul);
  },

  updateOutputsContainerElement(outputs) {
    const data = outputs.data;
    const container = ELEMENTS.fetchContainer;

    // Clear existing content
    container.innerHTML = '';

    // Create the <ul>
    const ul = document.createElement('ul');
    ul.style.listStyle = 'none';
    ul.style.padding = '0';
    ul.style.margin = '0';
    ul.style.marginTop = '4px';

    data.forEach(filename => {
      // Create the <li>
      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.alignItems = 'center';
      li.style.justifyContent = 'space-between';
      li.style.marginBottom = '6px';

      // Left: filename
      const fileLabel = document.createElement('small');
      fileLabel.textContent = filename;
      fileLabel.style.flex = '1';

      // Right: buttons container
      const buttonGroup = document.createElement('div');
      buttonGroup.style.display = 'flex';
      buttonGroup.style.gap = '6px';

      // View button
      const viewButton = document.createElement('button');
      viewButton.textContent = 'View';
      viewButton.type = 'button';
      viewButton.addEventListener('click', () => {
        const state = Store.getState();
        const viewUrl = `${state.serverHost.endsWith("/") ? state.serverHost : state.serverHost + "/"}outputs/${filename}/view`;
        window.open(viewUrl, '_blank');
      });

      // Download button
      const downloadButton = document.createElement('button');
      downloadButton.textContent = 'Download';
      downloadButton.type = 'button';
      downloadButton.addEventListener('click', () => {
        const state = Store.getState();
        const downloadUrl = `${state.serverHost.endsWith("/") ? state.serverHost : state.serverHost + "/"}outputs/${filename}/download`;
        window.open(downloadUrl, '_blank');
      });

      // Delete button
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.type = 'button';
      deleteButton.addEventListener('click', async () => {
        const confirmed = confirm(`Are you sure you want to delete "${filename}"?`);
        if (!confirmed) return;

        const res = await ServerDAL.deleteOutput(filename);
        if (res.message === "success") {
          console.log(`Deleted ${filename}`);
          const outputs = await ServerDAL.getOutputs();
          if (outputs) {
            Helpers.updateOutputsContainerElement(outputs);
          }
        } else {
          alert(`Failed to delete ${filename}`);
        }
      });

      // Assemble buttons and row
      buttonGroup.appendChild(viewButton);
      buttonGroup.appendChild(downloadButton);
      buttonGroup.appendChild(deleteButton);
      li.appendChild(fileLabel);
      li.appendChild(buttonGroup);
      ul.appendChild(li);
    });

    // Append the list to the container
    container.appendChild(ul);
  },

  updateAiResultsContainerElement(aiResults) {
    const data = aiResults.data;
    const container = ELEMENTS.fetchContainer;

    // Clear existing content
    container.innerHTML = '';

    // Create the <ul>
    const ul = document.createElement('ul');
    ul.style.listStyle = 'none';
    ul.style.padding = '0';
    ul.style.margin = '0';
    ul.style.marginTop = '4px';

    data.forEach(filename => {
      // Create the <li>
      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.alignItems = 'center';
      li.style.justifyContent = 'space-between';
      li.style.marginBottom = '6px';

      // Left: filename
      const fileLabel = document.createElement('small');
      fileLabel.textContent = filename;
      fileLabel.style.flex = '1';

      // Right: buttons container
      const buttonGroup = document.createElement('div');
      buttonGroup.style.display = 'flex';
      buttonGroup.style.gap = '6px';

      // Fill form button
      const fillFormButton = document.createElement('button');
      fillFormButton.textContent = 'Fill';
      fillFormButton.type = 'button';
      fillFormButton.addEventListener('click', () => {
        const state = Store.getState();
        const fillFormUrl = `${state.serverHost.endsWith("/") ? state.serverHost : state.serverHost + "/"}ai_model/results/${filename}/fillForm`;
        window.open(fillFormUrl, '_blank');
      });

      // Load button
      const loadButton = document.createElement('button');
      loadButton.textContent = 'Load';
      loadButton.type = 'button';
      loadButton.addEventListener('click', async () => {
        try {
          const state = Store.getState();
          const baseUrl = state.serverHost.endsWith("/") 
            ? state.serverHost 
            : state.serverHost + "/";
          const loadUrl = `${baseUrl}ai_model/results/${filename}/load`;
          
          const response = await fetch(loadUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          
          // Do something with the returned data
          Helpers.DOM.PostingForm.fillForm(data);
          
        } catch (error) {
          console.error('Error loading file:', error);
          // Handle error (e.g., show error message to user)
        }
      });

      // View button
      const viewButton = document.createElement('button');
      viewButton.textContent = 'View';
      viewButton.type = 'button';
      viewButton.addEventListener('click', () => {
        const state = Store.getState();
        const viewUrl = `${state.serverHost.endsWith("/") ? state.serverHost : state.serverHost + "/"}ai_model/results/${filename}/view`;
        window.open(viewUrl, '_blank');
      });

      // Download button
      const downloadButton = document.createElement('button');
      downloadButton.textContent = 'Download';
      downloadButton.type = 'button';
      downloadButton.addEventListener('click', () => {
        const state = Store.getState();
        const downloadUrl = `${state.serverHost.endsWith("/") ? state.serverHost : state.serverHost + "/"}ai_model/results/${filename}/download`;
        window.open(downloadUrl, '_blank');
      });

      // Delete button
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.type = 'button';
      deleteButton.addEventListener('click', async () => {
        const confirmed = confirm(`Are you sure you want to delete "${filename}"?`);
        if (!confirmed) return;

        const res = await ServerDAL.deleteAiResult(filename);
        if (res.message === "success") {
          console.log(`Deleted ${filename}`);
          const aiResults = await ServerDAL.getAiResults();
          if (aiResults) {
            Helpers.updateAiResultsContainerElement(aiResults);
          }
        } else {
          alert(`Failed to delete ${filename}`);
        }
      });

      // Assemble buttons and row
      buttonGroup.appendChild(loadButton);
      buttonGroup.appendChild(viewButton);
      buttonGroup.appendChild(downloadButton);
      buttonGroup.appendChild(deleteButton);
      li.appendChild(fileLabel);
      li.appendChild(buttonGroup);
      ul.appendChild(li);
    });

    // Append the list to the container
    container.appendChild(ul);
  },

  updateListingsContainerElement(listings) {
    const data = listings.data;
    const container = ELEMENTS.fetchContainer;

    // Clear existing content
    container.innerHTML = '';

    // Create the <ul>
    const ul = document.createElement('ul');
    ul.style.listStyle = 'none';
    ul.style.padding = '0';
    ul.style.margin = '0';
    ul.style.marginTop = '4px';

    data.forEach(filename => {
      // Create the <li>
      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.alignItems = 'center';
      li.style.justifyContent = 'space-between';
      li.style.marginBottom = '6px';

      // Left: filename
      const fileLabel = document.createElement('small');
      fileLabel.textContent = filename;
      fileLabel.style.flex = '1';

      // Right: buttons container
      const buttonGroup = document.createElement('div');
      buttonGroup.style.display = 'flex';
      buttonGroup.style.gap = '6px';

      // Scrape data button
      const scrapeButton = document.createElement('button');
      scrapeButton.textContent = 'Scrape Data';
      scrapeButton.type = 'button';
      scrapeButton.addEventListener('click', async () => {
        const confirmed = confirm(`Are you sure you want to scrape "${filename}"?`);
        if (!confirmed) return;

        const serverResponse = await ServerDAL.scrapeData(filename.split(".")[0]);
        console.log(serverResponse);

        // Start the progress webhook with interval
        const intervalId = setInterval(() => {
            ServerDAL.startProgressWebhook(intervalId);
        }, 1000); // Poll every 1 second
      });

      // View button
      const viewButton = document.createElement('button');
      viewButton.textContent = 'View';
      viewButton.type = 'button';
      viewButton.addEventListener('click', () => {
        const state = Store.getState();
        const viewUrl = `${state.serverHost.endsWith("/") ? state.serverHost : state.serverHost + "/"}listings/${filename}/view`;
        window.open(viewUrl, '_blank');
      });

      // Download button
      const downloadButton = document.createElement('button');
      downloadButton.textContent = 'Download';
      downloadButton.type = 'button';
      downloadButton.addEventListener('click', () => {
        const state = Store.getState();
        const downloadUrl = `${state.serverHost.endsWith("/") ? state.serverHost : state.serverHost + "/"}listings/${filename}/download`;
        window.open(downloadUrl, '_blank');
      });

      // Delete button
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.type = 'button';
      deleteButton.addEventListener('click', async () => {
        const confirmed = confirm(`Are you sure you want to delete "${filename}"?`);
        if (!confirmed) return;

        const res = await ServerDAL.deleteListing(filename);
        if (res.message === "success") {
          console.log(`Deleted ${filename}`);
          const listings = await ServerDAL.getListings();
          if (listings) {
            Helpers.updateListingsContainerElement(listings);
          }
        } else {
          alert(`Failed to delete ${filename}`);
        }
      });

      // Assemble buttons and row
      buttonGroup.appendChild(scrapeButton);
      buttonGroup.appendChild(viewButton);
      buttonGroup.appendChild(downloadButton);
      buttonGroup.appendChild(deleteButton);
      li.appendChild(fileLabel);
      li.appendChild(buttonGroup);
      ul.appendChild(li);
    });

    // Append the list to the container
    container.appendChild(ul);
  },

  truncateAPIKey(original) {
    const truncated = `${original.substring(0, Math.ceil(original.length * CONSTANTS.apiKeyMaxLen))}⁎⁎⁎⁎⁎⁎⁎⁎`;
    return truncated;
  },

  "Webscrapers" : {
    async gatherListings() {
      try {
        const response = await ServerDAL.gatherListings();

        // Check for success in the response body (FastAPI style)
        if (response.status !== "success") {
          throw new Error(response.message || "Server returned an error");
        }

        // If successful, fetch and update listings
        const listings = await ServerDAL.getListings();
        Helpers.updateListingsContainerElement(listings);

        // Show success message
        const alertText = `${response.message}\nView ${response.output_file} by clicking "Fetch Listings".`;
        alert(alertText);
      } catch (error) {
        console.error('Error:', error);
        alert(`Failed to gather listings: ${error.message}`);
      }
    }
  },

  "GUI" : {
    updateProgressGUI(data, intervalId) {
      const form = ELEMENTS.progressForm.elements;
      const progressBar = form["progress_bar"];
      const percent = data.percent ?? 0;

      progressBar.value = percent;
      ELEMENTS.progressValue.textContent = `${percent}%`;
      ELEMENTS.progressText.textContent = data.message;

      // Stop polling if done
      if (data.phase == "general/done") {
          clearInterval(intervalId);
      }
    },

    updateProgressGUIManually(progressBarValue, progressText) {
      const form = ELEMENTS.progressForm.elements;
      const progressBar = form["progress_bar"];

      progressBar.value = progressBarValue;
      ELEMENTS.progressValue.textContent = `${progressBarValue}%`;
      ELEMENTS.progressText.textContent = progressText;
    },
  },

  "Time" : {
    async sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  },

  "DOM" : {
    "PostingForm" : {
      fillForm(data) {
        // Get the active tab
        browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
          // Send message to content script
          browser.tabs.sendMessage(tabs[0].id, {
            action: "[POST] /fill_form",
            data: data
          });
        });
      }
    }
  }
};
