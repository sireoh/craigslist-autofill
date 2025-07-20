// MAIN
document.getElementById('fileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);

    await browser.storage.local.set({ currentDataFile: parsed });

    alert("File imported successfully.");
    window.close(); // Optional: close tab after import
  } catch (err) {
    alert("Invalid or unreadable JSON.");
    console.error(err);
  }
});