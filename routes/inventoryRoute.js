// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const invValidate = require("../utilities/inv-validation");
const utilities = require("../utilities");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Get specific inventory item detail
router.get('/detail/:invId', invController.buildInventoryDetail);

// Route to build the Inventory Management view
router.get('/', invController.buildManagementView);

// Route to build the Add Classification view
router.get('/add-classification', utilities.handleErrors(invController.buildAddClassification));

// Process the add classification form
router.post(
  '/add-classification',
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// Route to build the Add Inventory view
router.get(
  "/add-inventory",
  utilities.handleErrors(invController.buildAddInventory)
);

// POST process add-inventory
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);


// Footer test link to trigger an error
router.get("/cause-error", (req, res) => {
  throw new Error("");
});

module.exports = router;