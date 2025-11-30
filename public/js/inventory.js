'use strict';

// Ensure DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const classificationList = document.querySelector("#classificationList");
  const inventoryDisplay = document.getElementById("inventoryDisplay");

  if (!classificationList || !inventoryDisplay) return;

  // Fetch inventory when selection changes
  classificationList.addEventListener("change", function () {
    const classification_id = classificationList.value;

    if (!classification_id) {
      inventoryDisplay.innerHTML = "<tr><td colspan='3'>Please select a classification.</td></tr>";
      return;
    }

    const classIdURL = `/inv/getInventory/${classification_id}`;

    fetch(classIdURL)
      .then(response => {
        if (response.ok) return response.json();
        throw Error("Network response was not OK");
      })
      .then(data => {
        buildInventoryList(data);
      })
      .catch(error => {
        console.error("Problem fetching inventory:", error.message);
        inventoryDisplay.innerHTML = `<tr><td colspan="3" class="notice">There was a problem loading inventory.</td></tr>`;
      });
  });

  // Auto-load items for default selection
  if (classificationList.value) {
    classificationList.dispatchEvent(new Event('change'));
  }
});

// Build inventory items into HTML table
function buildInventoryList(data) {
  const inventoryDisplay = document.getElementById("inventoryDisplay");
  let dataTable = "<thead>";
  dataTable += "<tr><th>Vehicle Name</th><th>&nbsp;</th><th>&nbsp;</th></tr>";
  dataTable += "</thead><tbody>";

  if (!data || data.length === 0) {
    dataTable += "<tr><td colspan='3' class='notice'>No vehicles were found for this classification.</td></tr>";
  } else {
    data.forEach(item => {
      dataTable += `<tr>
        <td>${escapeHtml(item.inv_make)} ${escapeHtml(item.inv_model)}</td>
        <td><a href="/inv/edit/${item.inv_id}" title="Click to update">Modify</a></td>
        <td><a href="/inv/delete/${item.inv_id}" title="Click to delete">Delete</a></td>
      </tr>`;
    });
  }

  dataTable += "</tbody>";
  inventoryDisplay.innerHTML = dataTable;
}

// Simple HTML escape to prevent injection
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
