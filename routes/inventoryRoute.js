const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const invValidate = require("../utilities/inv-validation");
const utilities = require("../utilities");

// JSON endpoint used by public/js/inventory.js
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

// Inventory management page (no extra path, accessible at /inv/management)
router.get("/management", utilities.handleErrors(invController.buildManagementView));

// Route to build inventory by classification view (human-facing)
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Get specific inventory item detail
router.get("/detail/:invId", utilities.handleErrors(invController.buildInventoryDetail));

// Route to build the Add Classification view
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));

// *******************************
// Route to build the "Edit Inventory" View
// *******************************
router.get("/edit/:invId", utilities.handleErrors(invController.buildEditInventory));

/* *******************************
 *  Process Update Inventory
 * ******************************* */
router.post(
  "/update",
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

// Process the add classification form
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// Route to build the Add Inventory view
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));

// POST process add-inventory
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

// Footer test link to trigger an error (debug)
router.get("/cause-error", (req, res) => {
  throw new Error("Test error");
});

module.exports = router;
