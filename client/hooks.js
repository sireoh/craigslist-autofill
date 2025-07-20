// hooks.js

const Hooks = {
    pollProgress(intervalId) {
        const state = Store.getState();
        const progressEndpoint = `${state.serverHost.endsWith("/") ? state.serverHost : state.serverHost + "/"}progress`;
        const form = ELEMENTS.progressForm.elements;

        fetch(progressEndpoint)
        .then((response) => response.json())
        .then((data) => {
        const progressBar = form["progress_bar"];
        const percent = data.percent ?? 0;

        progressBar.value = percent;
        ELEMENTS.progressValue.textContent = `${percent}%`;
        ELEMENTS.progressText.textContent = `phase: ${data.phase}`;

        // Stop polling if done
        if (data.phase == "done") {
            clearInterval(intervalId);
        }
        })
        .catch((error) => {
            console.error("Failed to fetch progress:", error);
        });
    },
}
