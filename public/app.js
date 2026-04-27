const statusRow = document.querySelector(".status-row");
const statusText = document.querySelector("#status-text");

async function updateStatus() {
  try {
    const response = await fetch("/health", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Health check failed with ${response.status}`);
    }

    const data = await response.json();
    statusRow.classList.add("is-ok");
    statusText.textContent = `${data.service} ${data.version} is ${data.status}`;
  } catch (error) {
    statusRow.classList.remove("is-ok");
    statusText.textContent = "Service status unavailable";
  }
}

updateStatus();
