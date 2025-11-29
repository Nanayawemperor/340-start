'use strict';

// Ensure DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const classificationList = document.querySelector("#classificationList");
  const inventoryDisplay = document.getElementById("inventoryDisplay");

  if (!classificationList || !inventoryDisplay) {
    // Elements not present; nothing to do
    return;
  }

  classificationList.addEventListener("change", function () {
    const classification_id = classificationList.value;
    console.log(`classification_id is: ${classification_id}`);

    // match the route defined in inventoryRoute.js
    const classIdURL = `/inv/getInventory/${classification_id}`;

    fetch(classIdURL)
      .then(function (response) {
        if (response.ok) {
          return response.json();
        }
        throw Error("Network response was not OK");
      })
      .then(function (data) {
        console.log(data);
        buildInventoryList(data);
      })
      .catch(function (error) {
        console.error("There was a problem fetching inventory:", error.message);
        inventoryDisplay.innerHTML = `<tr><td colspan="3" class="notice">There was a problem loading inventory.</td></tr>`;
      });
  });

  // If you want the page to auto-load items for a default selection
  // you could trigger change() here if classificationList.value is set:
  // if (classificationList.value) classificationList.dispatchEvent(new Event('change'));
});

// Build inventory items into HTML table components and inject into DOM
function buildInventoryList(data) {
  const inventoryDisplay = document.getElementById("inventoryDisplay");

  // header
  let dataTable = "<thead>";
  dataTable += "<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>";
  dataTable += "</thead>";

  // body
  dataTable += "<tbody>";

  if (!data || data.length === 0) {
    dataTable += "<tr><td colspan='3' class='notice'>No vehicles were found for this classification.</td></tr>";
  } else {
    data.forEach(function (element) {
      console.log(element.inv_id + ", " + element.inv_model);
      dataTable += `<tr>
        <td>${escapeHtml(element.inv_make)} ${escapeHtml(element.inv_model)}</td>
        <td><a href="/inv/edit/${element.inv_id}" title="Click to update">Modify</a></td>
        <td><a href="/inv/delete/${element.inv_id}" title="Click to delete">Delete</a></td>
      </tr>`;
    });
  }

  dataTable += "</tbody>";

  inventoryDisplay.innerHTML = dataTable;
}

// tiny HTML escape to avoid accidental injection from DB content
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
