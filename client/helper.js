const Helpers = {
  updateConnectFormElement(isConnected) {
    ELEMENTS.connectForm.hidden = isConnected;
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

        const res = await ServerDAL.scrapeData(filename.split(".")[0]);
        alert(res.message);

        // Start the progress webhook with interval
        const intervalId = setInterval(() => {
            ServerDAL.startProgressWebhook(intervalId);
        }, 500); // Poll every 0.5 second
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
  }
};
